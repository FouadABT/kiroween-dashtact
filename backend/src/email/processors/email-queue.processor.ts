import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailQueueService } from '../services/email-queue.service';
import { SmtpService } from '../services/smtp.service';
import { EmailService } from '../email.service';
import { EmailTemplateService } from '../services/email-template.service';

@Injectable()
export class EmailQueueProcessor {
  private readonly logger = new Logger(EmailQueueProcessor.name);
  private isProcessing = false;

  constructor(
    private queueService: EmailQueueService,
    private smtpService: SmtpService,
    private emailService: EmailService,
    private templateService: EmailTemplateService,
  ) {}

  @Cron('*/30 * * * * *') // Every 30 seconds
  async processQueue() {
    if (this.isProcessing) {
      this.logger.debug('Queue processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      // Check if email system is enabled
      const isEnabled = await this.emailService.isEmailSystemEnabled();
      if (!isEnabled) {
        this.logger.debug('Email system is disabled, skipping queue processing');
        return;
      }

      // Get configuration and setup SMTP
      const config = await this.emailService.getConfigurationDecrypted();
      if (!config) {
        this.logger.warn('Email configuration not found');
        return;
      }

      // Ensure SMTP is configured
      if (!this.smtpService.isConfigured()) {
        await this.smtpService.createTransporter({
          host: config.smtpHost,
          port: config.smtpPort,
          secure: config.smtpSecure,
          auth: {
            user: config.smtpUsername,
            pass: config.smtpPassword,
          },
        });
      }

      // Get pending emails
      const pendingEmails = await this.queueService.getPendingEmails(10);

      if (pendingEmails.length === 0) {
        this.logger.debug('No pending emails in queue');
        return;
      }

      this.logger.log(`Processing ${pendingEmails.length} emails from queue`);

      // Process each email
      for (const queueItem of pendingEmails) {
        await this.processEmail(queueItem, config);
      }
    } catch (error) {
      this.logger.error('Error processing email queue', error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEmail(queueItem: any, config: any) {
    try {
      // Mark as processing
      await this.queueService.markAsProcessing(queueItem.id);

      let htmlBody = queueItem.htmlBody;
      let textBody = queueItem.textBody;
      let subject = queueItem.subject;

      // If template is specified, render it
      if (queueItem.templateId && queueItem.templateData) {
        const rendered = await this.templateService.renderTemplate(
          queueItem.templateId,
          queueItem.templateData,
        );
        htmlBody = rendered.htmlBody;
        textBody = rendered.textBody;
        subject = rendered.subject;
      }

      // Send email via SMTP
      await this.smtpService.sendEmail({
        from: `${config.senderName} <${config.senderEmail}>`,
        to: queueItem.recipient,
        subject,
        html: htmlBody,
        text: textBody,
      });

      // Mark as sent
      await this.queueService.markAsSent(queueItem.id);

      // Log success
      await this.emailService.logEmail({
        recipient: queueItem.recipient,
        subject,
        status: 'SENT',
        templateId: queueItem.templateId,
        metadata: queueItem.metadata,
      });

      this.logger.log(`Email sent successfully to ${queueItem.recipient}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${queueItem.recipient}`, error.stack);

      // Determine if we should retry
      const shouldRetry = this.shouldRetryError(error);

      // Mark as failed (will retry if appropriate)
      await this.queueService.markAsFailed(queueItem.id, error.message, shouldRetry);

      // Log failure if max attempts reached
      if (queueItem.attempts >= queueItem.maxAttempts - 1) {
        await this.emailService.logEmail({
          recipient: queueItem.recipient,
          subject: queueItem.subject,
          status: 'FAILED',
          templateId: queueItem.templateId,
          error: error.message,
          metadata: queueItem.metadata,
        });
      }
    }
  }

  private shouldRetryError(error: any): boolean {
    // Don't retry for permanent failures
    const permanentErrors = [
      'Invalid email address',
      'Recipient address rejected',
      'User unknown',
      'Mailbox not found',
    ];

    const errorMessage = error.message || '';
    return !permanentErrors.some((msg) => errorMessage.includes(msg));
  }
}
