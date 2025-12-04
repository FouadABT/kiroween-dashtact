/**
 * Email System Types
 * 
 * TypeScript interfaces for email configuration, templates, queue, and logs.
 * These types match the backend Prisma schema models.
 */

export interface EmailConfiguration {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string; // Masked in responses
  senderEmail: string;
  senderName: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody: string | null;
  variables: string[]; // Array of variable names
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface EmailQueue {
  id: string;
  recipient: string;
  subject: string;
  htmlBody: string | null;
  textBody: string | null;
  templateId: string | null;
  templateData: Record<string, any> | null;
  status: EmailQueueStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: string | null;
  nextAttemptAt: string | null;
  error: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  templateId: string | null;
  template?: EmailTemplate;
  status: EmailStatus;
  sentAt: string | null;
  error: string | null;
  metadata: Record<string, any> | null;
  userId: string | null;
  createdAt: string;
}

export interface EmailRateLimit {
  id: string;
  windowType: 'hourly' | 'daily';
  windowStart: string;
  emailCount: number;
  maxEmails: number;
  createdAt: string;
  updatedAt: string;
}

export enum EmailQueueStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum EmailStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  SKIPPED = 'SKIPPED',
}

// DTOs for API requests

export interface EmailConfigurationDto {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword?: string; // Optional - some providers like Brevo use empty password
  senderEmail: string;
  senderName: string;
}

export interface ToggleEmailDto {
  isEnabled: boolean;
}

export interface TestEmailDto {
  recipient: string;
  message?: string;
}

export interface CreateEmailTemplateDto {
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: string[]; // Array of variable names
  category: string;
  isActive?: boolean;
}

export interface UpdateEmailTemplateDto {
  name?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  variables?: string[]; // Array of variable names
  category?: string;
  isActive?: boolean;
}

export interface EmailLogFilterDto {
  status?: EmailStatus;
  recipient?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  queuedCount: number;
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
  failureRate: number;
}

export interface RateLimitConfig {
  hourlyLimit: number;
  dailyLimit: number;
}

export interface RateLimitUsage {
  hourlyUsage: number;
  dailyUsage: number;
  hourlyResetAt?: string;
  dailyResetAt?: string;
}

// API Response types

export interface EmailConfigurationResponse {
  data: EmailConfiguration;
  message?: string;
}

export interface EmailTemplateResponse {
  data: EmailTemplate;
  message?: string;
}

export interface EmailTemplatesResponse {
  templates: EmailTemplate[];
  total: number;
}

export interface EmailLogsResponse {
  logs: EmailLog[];
  total: number;
  page: number;
  limit: number;
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
}
