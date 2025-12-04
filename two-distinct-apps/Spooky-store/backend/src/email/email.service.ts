import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailEncryptionService } from './services/email-encryption.service';
import { SmtpService } from './services/smtp.service';
import { EmailQueueService } from './services/email-queue.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailConfigurationDto } from './dto/email-configuration.dto';

export interface SendEmailOptions {
  recipient: string | string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  priority?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private prisma: PrismaService,
    private encryptionService: EmailEncryptionService,
    private smtpService: SmtpService,
    private queueService: EmailQueueService,
    private templateService: EmailTemplateService,
  ) {}

  async saveConfiguration(dto: EmailConfigurationDto, userId: string) {
    // Encrypt password (empty string is valid for providers like Brevo)
    const encryptedPassword = this.encryptionService.encrypt(dto.smtpPassword || '');

    // Check if configuration exists
    const existing = await this.prisma.emailConfiguration.findFirst();

    if (existing) {
      // Update existing - only update password if provided
      const updateData: any = {
        smtpHost: dto.smtpHost,
        smtpPort: dto.smtpPort,
        smtpSecure: dto.smtpSecure,
        smtpUsername: dto.smtpUsername,
        senderEmail: dto.senderEmail,
        senderName: dto.senderName,
        updatedBy: userId,
      };

      // Only update password if provided (not undefined)
      if (dto.smtpPassword !== undefined) {
        updateData.smtpPassword = encryptedPassword;
      }

      return this.prisma.emailConfiguration.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      // Create new
      return this.prisma.emailConfiguration.create({
        data: {
          smtpHost: dto.smtpHost,
          smtpPort: dto.smtpPort,
          smtpSecure: dto.smtpSecure,
          smtpUsername: dto.smtpUsername,
          smtpPassword: encryptedPassword,
          senderEmail: dto.senderEmail,
          senderName: dto.senderName,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    }
  }

  async getConfiguration() {
    const config = await this.prisma.emailConfiguration.findFirst();

    if (!config) {
      return null;
    }

    // Mask password
    return {
      ...config,
      smtpPassword: this.encryptionService.maskPassword(config.smtpPassword),
    };
  }

  async getConfigurationDecrypted() {
    const config = await this.prisma.emailConfiguration.findFirst();

    if (!config) {
      return null;
    }

    // Decrypt password
    const decryptedPassword = this.encryptionService.decrypt(config.smtpPassword);

    return {
      ...config,
      smtpPassword: decryptedPassword,
    };
  }

  async toggleEmailSystem(isEnabled: boolean, userId: string) {
    const config = await this.prisma.emailConfiguration.findFirst();

    if (!config) {
      throw new BadRequestException('Email configuration not found. Please configure SMTP settings first.');
    }

    return this.prisma.emailConfiguration.update({
      where: { id: config.id },
      data: {
        isEnabled,
        updatedBy: userId,
      },
    });
  }

  async isEmailSystemEnabled(): Promise<boolean> {
    const config = await this.prisma.emailConfiguration.findFirst();
    return config?.isEnabled || false;
  }

  async sendEmail(options: SendEmailOptions): Promise<string> {
    // Check if email system is enabled
    const isEnabled = await this.isEmailSystemEnabled();
    if (!isEnabled) {
      this.logger.warn('Email system is disabled');
      throw new BadRequestException('Email system is currently disabled');
    }

    // Check configuration
    const config = await this.getConfigurationDecrypted();
    if (!config) {
      throw new BadRequestException('Email configuration not found');
    }

    // Check user notification preferences if userId provided
    if (options.userId) {
      const shouldSkip = await this.shouldSkipEmail(options.userId);
      if (shouldSkip) {
        this.logger.log(`Skipping email for user ${options.userId} due to preferences`);
        await this.logEmail({
          recipient: Array.isArray(options.recipient) ? options.recipient[0] : options.recipient,
          subject: options.subject,
          status: 'SKIPPED',
          userId: options.userId,
          metadata: options.metadata,
        });
        return 'skipped';
      }
    }

    // Check rate limits
    await this.checkRateLimits();

    // Handle multiple recipients
    const recipients = Array.isArray(options.recipient) ? options.recipient : [options.recipient];

    const queueIds: string[] = [];

    for (const recipient of recipients) {
      // Validate email format
      if (!this.isValidEmail(recipient)) {
        throw new BadRequestException(`Invalid email address: ${recipient}`);
      }

      // Queue email
      const queueId = await this.queueService.addToQueue({
        recipient,
        subject: options.subject,
        htmlBody: options.htmlBody,
        textBody: options.textBody,
        templateId: options.templateId,
        templateData: options.templateData,
        priority: options.priority,
        metadata: options.metadata,
      });

      queueIds.push(queueId);
    }

    return queueIds[0]; // Return first queue ID for tracking
  }

  async sendTemplateEmail(
    templateSlug: string,
    recipient: string,
    data: Record<string, any>,
    userId?: string,
  ): Promise<string> {
    const template = await this.templateService.findBySlug(templateSlug);
    const rendered = await this.templateService.renderTemplate(template.id, data);

    return this.sendEmail({
      recipient,
      subject: rendered.subject,
      htmlBody: rendered.htmlBody,
      textBody: rendered.textBody,
      templateId: template.id,
      templateData: data,
      userId,
    });
  }

  async logEmail(data: {
    recipient: string;
    subject: string;
    status: 'SENT' | 'FAILED' | 'BOUNCED' | 'SKIPPED';
    templateId?: string;
    userId?: string;
    error?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.emailLog.create({
      data: {
        recipient: data.recipient,
        subject: data.subject,
        status: data.status,
        templateId: data.templateId,
        userId: data.userId,
        error: data.error,
        metadata: data.metadata,
        sentAt: data.status === 'SENT' ? new Date() : null,
      },
    });
  }

  private async shouldSkipEmail(userId: string): Promise<boolean> {
    // Check if user has disabled email notifications
    const preferences = await this.prisma.notificationPreference.findMany({
      where: {
        userId,
        enabled: false,
      },
    });

    // If user has disabled all notification categories, skip email
    return preferences.length > 0;
  }

  private async checkRateLimits(): Promise<void> {
    const now = new Date();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check hourly limit
    const hourlyLimit = await this.prisma.emailRateLimit.findUnique({
      where: {
        windowType_windowStart: {
          windowType: 'hourly',
          windowStart: hourStart,
        },
      },
    });

    if (hourlyLimit && hourlyLimit.emailCount >= hourlyLimit.maxEmails) {
      throw new BadRequestException('Hourly email rate limit exceeded');
    }

    // Check daily limit
    const dailyLimit = await this.prisma.emailRateLimit.findUnique({
      where: {
        windowType_windowStart: {
          windowType: 'daily',
          windowStart: dayStart,
        },
      },
    });

    if (dailyLimit && dailyLimit.emailCount >= dailyLimit.maxEmails) {
      throw new BadRequestException('Daily email rate limit exceeded');
    }

    // Increment counters
    await this.incrementRateLimit('hourly', hourStart);
    await this.incrementRateLimit('daily', dayStart);
  }

  private async incrementRateLimit(windowType: string, windowStart: Date): Promise<void> {
    await this.prisma.emailRateLimit.upsert({
      where: {
        windowType_windowStart: {
          windowType,
          windowStart,
        },
      },
      create: {
        windowType,
        windowStart,
        emailCount: 1,
        maxEmails: windowType === 'hourly' ? 100 : 1000, // Default limits
      },
      update: {
        emailCount: {
          increment: 1,
        },
      },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
