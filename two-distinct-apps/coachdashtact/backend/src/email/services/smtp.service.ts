import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);
  private transporter: Transporter | null = null;
  private currentConfig: SmtpConfig | null = null;

  async createTransporter(config: SmtpConfig): Promise<void> {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass,
        },
      });

      this.currentConfig = config;
      this.logger.log('SMTP transporter created successfully');
    } catch (error) {
      this.logger.error('Failed to create SMTP transporter', error.stack);
      throw new Error(`SMTP configuration failed: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not configured');
    }

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection test successful');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection test failed', error.stack);
      throw new Error(`SMTP connection failed: ${error.message}`);
    }
  }

  async sendEmail(message: EmailMessage): Promise<any> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not configured');
    }

    try {
      this.logger.log('📤 Sending email via SMTP...');
      this.logger.log(`   From: ${message.from}`);
      this.logger.log(`   To: ${message.to}`);
      this.logger.log(`   Subject: ${message.subject}`);
      
      const info = await this.transporter.sendMail(message);
      
      this.logger.log('✅ Email sent successfully!');
      this.logger.log(`   Message ID: ${info.messageId}`);
      this.logger.log(`   Response: ${info.response}`);
      this.logger.log(`   Accepted: ${JSON.stringify(info.accepted)}`);
      this.logger.log(`   Rejected: ${JSON.stringify(info.rejected)}`);
      this.logger.log(`   Full Info: ${JSON.stringify(info, null, 2)}`);
      
      return info;
    } catch (error) {
      this.logger.error('❌ Failed to send email');
      this.logger.error(`   Error: ${error.message}`);
      this.logger.error(`   Stack: ${error.stack}`);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  getCurrentConfig(): SmtpConfig | null {
    return this.currentConfig;
  }
}
