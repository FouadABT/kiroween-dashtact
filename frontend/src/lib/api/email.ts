/**
 * Email API Client
 * 
 * API client methods for email system operations.
 * Uses the centralized ApiClient for consistent authentication and error handling.
 */

import { ApiClient } from '@/lib/api';
import type {
  EmailConfiguration,
  EmailConfigurationDto,
  ToggleEmailDto,
  TestEmailDto,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  EmailTemplate,
  EmailLog,
  EmailLogFilterDto,
  EmailStats,
  RateLimitConfig,
  RateLimitUsage,
  EmailConfigurationResponse,
  EmailTemplateResponse,
  EmailTemplatesResponse,
  EmailLogsResponse,
  TestEmailResponse,
} from '@/types/email';

/**
 * Email Configuration API
 */
export const emailConfigApi = {
  /**
   * Save email configuration (SMTP settings)
   */
  async saveConfiguration(data: EmailConfigurationDto): Promise<EmailConfiguration> {
    const result = await ApiClient.post<EmailConfiguration>('/email/configuration', data);
    return result;
  },

  /**
   * Get current email configuration
   */
  async getConfiguration(): Promise<EmailConfiguration | null> {
    try {
      const result = await ApiClient.get<EmailConfiguration>('/email/configuration');
      return result;
    } catch (error: any) {
      if (error.statusCode === 404) return null;
      throw error;
    }
  },

  /**
   * Toggle email system on/off
   */
  async toggleSystem(data: ToggleEmailDto): Promise<EmailConfiguration> {
    const result = await ApiClient.patch<EmailConfiguration>('/email/configuration/toggle', data);
    return result;
  },

  /**
   * Send test email
   */
  async sendTestEmail(data: TestEmailDto): Promise<TestEmailResponse> {
    return ApiClient.post<TestEmailResponse>('/email/configuration/test', data);
  },
};

/**
 * Email Templates API
 */
export const emailTemplateApi = {
  /**
   * List all email templates
   */
  async listTemplates(): Promise<EmailTemplate[]> {
    return ApiClient.get<EmailTemplate[]>('/email/templates');
  },

  /**
   * Get email template by ID
   */
  async getTemplate(id: string): Promise<EmailTemplate> {
    const result = await ApiClient.get<EmailTemplate>(`/email/templates/${id}`);
    return result;
  },

  /**
   * Create new email template
   */
  async createTemplate(data: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const result = await ApiClient.post<EmailTemplate>('/email/templates', data);
    return result;
  },

  /**
   * Update email template
   */
  async updateTemplate(id: string, data: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const result = await ApiClient.put<EmailTemplate>(`/email/templates/${id}`, data);
    return result;
  },

  /**
   * Delete email template
   */
  async deleteTemplate(id: string): Promise<void> {
    await ApiClient.delete<void>(`/email/templates/${id}`);
  },
};

/**
 * Email Logs API
 */
export const emailLogsApi = {
  /**
   * Get email logs with filters
   */
  async getLogs(filters: EmailLogFilterDto = {}): Promise<EmailLogsResponse> {
    return ApiClient.get<EmailLogsResponse>('/email/logs', filters as Record<string, unknown>);
  },

  /**
   * Get email log details by ID
   */
  async getLogDetails(id: string): Promise<EmailLog> {
    return ApiClient.get<EmailLog>(`/email/logs/${id}`);
  },

  /**
   * Get email statistics
   */
  async getStats(): Promise<EmailStats> {
    return ApiClient.get<EmailStats>('/email/logs/stats/summary');
  },
};

/**
 * Rate Limits API
 */
export const emailRateLimitApi = {
  /**
   * Get rate limit configuration
   */
  async getConfig(): Promise<RateLimitConfig> {
    return ApiClient.get<RateLimitConfig>('/email/rate-limits/config');
  },

  /**
   * Update rate limit configuration
   */
  async updateConfig(config: RateLimitConfig): Promise<RateLimitConfig> {
    return ApiClient.post<RateLimitConfig>('/email/rate-limits/config', config);
  },

  /**
   * Get current rate limit usage
   */
  async getUsage(): Promise<RateLimitUsage> {
    return ApiClient.get<RateLimitUsage>('/email/rate-limits/usage');
  },
};
