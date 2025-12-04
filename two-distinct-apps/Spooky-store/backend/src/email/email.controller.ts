import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { Public } from '../auth/decorators/public.decorator';
import { EmailService } from './email.service';
import { EmailTemplateService } from './services/email-template.service';
import { SmtpService } from './services/smtp.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  EmailConfigurationDto,
  ToggleEmailDto,
  TestEmailDto,
} from './dto/email-configuration.dto';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
} from './dto/email-template.dto';
import { EmailLogFilterDto } from './dto/email-log-filter.dto';

@Controller('email')
export class EmailController {
  constructor(
    private emailService: EmailService,
    private templateService: EmailTemplateService,
    private smtpService: SmtpService,
    private prisma: PrismaService,
  ) {}

  // Configuration endpoints
  @Post('configuration')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async saveConfiguration(@Body() dto: EmailConfigurationDto, @Request() req) {
    return this.emailService.saveConfiguration(dto, req.user.id);
  }

  @Get('configuration')
  async getConfiguration() {
    return this.emailService.getConfiguration();
  }

  @Get('configuration/status')
  async getConfigurationStatus() {
    const config = await this.emailService.getConfiguration();
    return {
      isConfigured: config !== null,
      isEnabled: config?.isEnabled || false,
    };
  }

  @Patch('configuration/toggle')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async toggleEmailSystem(@Body() dto: ToggleEmailDto, @Request() req) {
    return this.emailService.toggleEmailSystem(dto.isEnabled, req.user.id);
  }

  @Post('configuration/test')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async testEmail(@Body() dto: TestEmailDto) {
    console.log('🔍 [TEST EMAIL] Starting test email process...');
    console.log('📧 [TEST EMAIL] Recipient:', dto.recipient);
    
    // Get configuration
    const config = await this.emailService.getConfigurationDecrypted();
    if (!config) {
      console.error('❌ [TEST EMAIL] No email configuration found');
      return { success: false, message: 'Email configuration not found' };
    }

    console.log('⚙️  [TEST EMAIL] Configuration loaded:');
    console.log('   - SMTP Host:', config.smtpHost);
    console.log('   - SMTP Port:', config.smtpPort);
    console.log('   - SMTP Secure:', config.smtpSecure);
    console.log('   - SMTP Username:', config.smtpUsername);
    console.log('   - Sender Email:', config.senderEmail);
    console.log('   - Sender Name:', config.senderName);

    try {
      // Create transporter
      console.log('🔧 [TEST EMAIL] Creating SMTP transporter...');
      await this.smtpService.createTransporter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUsername,
          pass: config.smtpPassword,
        },
      });
      console.log('✅ [TEST EMAIL] Transporter created successfully');

      // Test connection
      console.log('🔌 [TEST EMAIL] Testing SMTP connection...');
      await this.smtpService.testConnection();
      console.log('✅ [TEST EMAIL] SMTP connection successful');

      // Send test email
      console.log('📤 [TEST EMAIL] Sending email...');
      console.log('   - From:', `${config.senderName} <${config.senderEmail}>`);
      console.log('   - To:', dto.recipient);
      console.log('   - Subject: Test Email from Dashboard');
      
      const emailResult = await this.smtpService.sendEmail({
        from: `${config.senderName} <${config.senderEmail}>`,
        to: dto.recipient,
        subject: 'Test Email from Dashboard',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email from your dashboard email system.</p>
          ${dto.message ? `<p><strong>Message:</strong> ${dto.message}</p>` : ''}
          <p>If you received this email, your SMTP configuration is working correctly!</p>
        `,
        text: `Test Email\n\nThis is a test email from your dashboard email system.\n${dto.message ? `\nMessage: ${dto.message}` : ''}\n\nIf you received this email, your SMTP configuration is working correctly!`,
      });

      console.log('✅ [TEST EMAIL] Email sent successfully!');
      console.log('📊 [TEST EMAIL] SMTP Response:', JSON.stringify(emailResult, null, 2));

      return { 
        success: true, 
        message: 'Test email sent successfully',
        details: emailResult 
      };
    } catch (error) {
      console.error('❌ [TEST EMAIL] Error occurred:', error);
      console.error('❌ [TEST EMAIL] Error message:', error.message);
      console.error('❌ [TEST EMAIL] Error stack:', error.stack);
      return { success: false, message: error.message, error: error.toString() };
    }
  }

  // Template endpoints
  @Post('templates')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async createTemplate(@Body() dto: CreateEmailTemplateDto, @Request() req) {
    return this.templateService.create(dto, req.user.id);
  }

  @Get('templates')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async listTemplates() {
    return this.templateService.findAll();
  }

  @Get('templates/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getTemplate(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Put('templates/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
    @Request() req,
  ) {
    return this.templateService.update(id, dto, req.user.id);
  }

  @Delete('templates/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async deleteTemplate(@Param('id') id: string) {
    return this.templateService.delete(id);
  }

  // Log endpoints
  @Get('logs')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getLogs(@Query() filter: EmailLogFilterDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.recipient) {
      where.recipient = {
        contains: filter.recipient,
        mode: 'insensitive',
      };
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt.lte = new Date(filter.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.emailLog.findMany({
        where,
        include: {
          template: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.emailLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('logs/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getLogDetail(@Param('id') id: string) {
    return this.prisma.emailLog.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  @Get('logs/stats/summary')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getEmailStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [
      totalSent,
      totalFailed,
      sentToday,
      sentThisWeek,
      sentThisMonth,
      queuedCount,
    ] = await Promise.all([
      this.prisma.emailLog.count({ where: { status: 'SENT' } }),
      this.prisma.emailLog.count({ where: { status: 'FAILED' } }),
      this.prisma.emailLog.count({
        where: { status: 'SENT', createdAt: { gte: today } },
      }),
      this.prisma.emailLog.count({
        where: { status: 'SENT', createdAt: { gte: weekAgo } },
      }),
      this.prisma.emailLog.count({
        where: { status: 'SENT', createdAt: { gte: monthAgo } },
      }),
      this.prisma.emailQueue.count({ where: { status: 'PENDING' } }),
    ]);

    const total = totalSent + totalFailed;
    const failureRate = total > 0 ? (totalFailed / total) * 100 : 0;

    return {
      totalSent,
      totalFailed,
      sentToday,
      sentThisWeek,
      sentThisMonth,
      queuedCount,
      failureRate: Math.round(failureRate * 100) / 100,
    };
  }

  // Rate limit endpoints
  @Get('rate-limits/config')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getRateLimitConfig() {
    // Return default rate limits
    // In production, these would be stored in database per user/organization
    return {
      hourlyLimit: 100,
      dailyLimit: 1000,
    };
  }

  @Post('rate-limits/config')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async updateRateLimitConfig(@Body() config: { hourlyLimit: number; dailyLimit: number }) {
    // In production, save to database
    // For now, just return the config
    return {
      hourlyLimit: config.hourlyLimit,
      dailyLimit: config.dailyLimit,
    };
  }

  @Get('rate-limits/usage')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getRateLimitUsage() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [hourlyUsage, dailyUsage] = await Promise.all([
      this.prisma.emailLog.count({
        where: {
          createdAt: { gte: oneHourAgo },
        },
      }),
      this.prisma.emailLog.count({
        where: {
          createdAt: { gte: today },
        },
      }),
    ]);

    // Calculate reset times
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      hourlyUsage,
      dailyUsage,
      hourlyResetAt: nextHour.toISOString(),
      dailyResetAt: tomorrow.toISOString(),
    };
  }
}
