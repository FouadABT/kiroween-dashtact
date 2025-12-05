/**
 * Cron Job Types
 * 
 * Type definitions for the Cron Jobs Management System
 */

/**
 * Cron log status enum
 */
export type CronLogStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

/**
 * Cron job interface
 */
export interface CronJob {
  id: string;
  name: string;
  description?: string;
  schedule: string;
  handler: string;
  isEnabled: boolean;
  isLocked: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  averageDuration?: number;
  notifyOnFailure: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cron log interface
 */
export interface CronLog {
  id: string;
  jobId: string;
  status: CronLogStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: string;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Job statistics interface
 */
export interface JobStatistics {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  lastSuccess?: string;
  lastFailure?: string;
  uptime: number; // Percentage
}

/**
 * Log filters interface
 */
export interface LogFilters {
  status?: 'SUCCESS' | 'FAILED';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Update schedule DTO
 */
export interface UpdateScheduleDto {
  schedule: string;
}

/**
 * Cron expression validation result
 */
export interface CronValidationResult {
  valid: boolean;
  error?: string;
  nextExecutions?: string[];
}
