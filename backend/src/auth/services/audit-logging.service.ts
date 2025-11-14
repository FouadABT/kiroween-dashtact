import { Injectable, Logger } from '@nestjs/common';
import { authConfig } from '../../config/auth.config';

/**
 * Audit Event Types
 * Defines all security-related events that should be logged
 */
export enum AuditEventType {
  // Authentication events
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  
  // Authorization events
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_CHECK_FAILED = 'ROLE_CHECK_FAILED',
  
  // Security events
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  BLACKLISTED_TOKEN = 'BLACKLISTED_TOKEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Account events
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  EMAIL_CHANGED = 'EMAIL_CHANGED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
}

/**
 * Audit Log Entry
 * Structure for audit log entries
 */
export interface AuditLogEntry {
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Audit Logging Service
 * 
 * Logs security-related events for monitoring and compliance.
 * In production, these logs should be sent to a centralized logging service
 * (e.g., CloudWatch, Datadog, Splunk, ELK stack).
 * 
 * Current implementation uses NestJS Logger, which can be configured to
 * output to different transports.
 */
@Injectable()
export class AuditLoggingService {
  private readonly logger = new Logger('AuditLog');

  /**
   * Log a registration attempt
   */
  logRegistration(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: success
        ? AuditEventType.REGISTRATION_SUCCESS
        : AuditEventType.REGISTRATION_FAILED,
      email,
      ipAddress,
      userAgent,
      action: 'register',
      success,
      errorMessage,
    };

    this.logEntry(entry);
  }

  /**
   * Log a login attempt
   */
  logLogin(
    email: string,
    success: boolean,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: success
        ? AuditEventType.LOGIN_SUCCESS
        : AuditEventType.LOGIN_FAILED,
      userId,
      email,
      ipAddress,
      userAgent,
      action: 'login',
      success,
      errorMessage,
    };

    this.logEntry(entry);
  }

  /**
   * Log a logout event
   */
  logLogout(
    userId: string,
    email?: string,
    ipAddress?: string,
    userAgent?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: AuditEventType.LOGOUT,
      userId,
      email,
      ipAddress,
      userAgent,
      action: 'logout',
      success: true,
    };

    this.logEntry(entry);
  }

  /**
   * Log a token refresh attempt
   */
  logTokenRefresh(
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: success
        ? AuditEventType.TOKEN_REFRESH
        : AuditEventType.TOKEN_REFRESH_FAILED,
      userId,
      ipAddress,
      userAgent,
      action: 'token_refresh',
      success,
      errorMessage,
    };

    this.logEntry(entry);
  }

  /**
   * Log a permission denial
   */
  logPermissionDenied(
    userId: string,
    requiredPermission: string,
    resource: string,
    ipAddress?: string,
    userAgent?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: AuditEventType.PERMISSION_DENIED,
      userId,
      ipAddress,
      userAgent,
      action: 'access_denied',
      resource,
      success: false,
      metadata: {
        requiredPermission,
      },
    };

    this.logEntry(entry);
  }

  /**
   * Log a role check failure
   */
  logRoleCheckFailed(
    userId: string,
    requiredRole: string,
    userRole: string,
    resource: string,
    ipAddress?: string,
    userAgent?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: AuditEventType.ROLE_CHECK_FAILED,
      userId,
      ipAddress,
      userAgent,
      action: 'role_check_failed',
      resource,
      success: false,
      metadata: {
        requiredRole,
        userRole,
      },
    };

    this.logEntry(entry);
  }

  /**
   * Log an invalid token attempt
   */
  logInvalidToken(
    reason: 'invalid' | 'expired' | 'blacklisted',
    ipAddress?: string,
    userAgent?: string,
    userId?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const eventTypeMap = {
      invalid: AuditEventType.INVALID_TOKEN,
      expired: AuditEventType.EXPIRED_TOKEN,
      blacklisted: AuditEventType.BLACKLISTED_TOKEN,
    };

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: eventTypeMap[reason],
      userId,
      ipAddress,
      userAgent,
      action: 'token_validation_failed',
      success: false,
      errorMessage: `Token ${reason}`,
    };

    this.logEntry(entry);
  }

  /**
   * Log a rate limit exceeded event
   */
  logRateLimitExceeded(
    ipAddress: string,
    endpoint: string,
    userAgent?: string,
    userId?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
      userId,
      ipAddress,
      userAgent,
      action: 'rate_limit_exceeded',
      resource: endpoint,
      success: false,
    };

    this.logEntry(entry);
  }

  /**
   * Log a password change event
   */
  logPasswordChanged(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): void {
    if (!authConfig.security.enableAuditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      eventType: AuditEventType.PASSWORD_CHANGED,
      userId,
      email,
      ipAddress,
      userAgent,
      action: 'password_changed',
      success: true,
    };

    this.logEntry(entry);
  }

  /**
   * Internal method to log an entry
   * In production, this should send logs to a centralized logging service
   */
  private logEntry(entry: AuditLogEntry): void {
    const logMessage = this.formatLogEntry(entry);

    if (entry.success) {
      this.logger.log(logMessage);
    } else {
      this.logger.warn(logMessage);
    }

    // In production, you would also send this to:
    // - CloudWatch Logs
    // - Datadog
    // - Splunk
    // - ELK Stack
    // - Database table for audit trail
    // Example:
    // await this.sendToExternalLoggingService(entry);
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: AuditLogEntry): string {
    const parts: string[] = [
      `[${entry.eventType}]`,
      `timestamp=${entry.timestamp.toISOString()}`,
    ];

    if (entry.userId) parts.push(`userId=${entry.userId}`);
    if (entry.email) parts.push(`email=${entry.email}`);
    if (entry.ipAddress) parts.push(`ip=${entry.ipAddress}`);
    if (entry.action) parts.push(`action=${entry.action}`);
    if (entry.resource) parts.push(`resource=${entry.resource}`);
    parts.push(`success=${entry.success}`);
    if (entry.errorMessage) parts.push(`error="${entry.errorMessage}"`);
    if (entry.metadata) {
      parts.push(`metadata=${JSON.stringify(entry.metadata)}`);
    }

    return parts.join(' ');
  }

  /**
   * Get audit log statistics
   * Useful for monitoring dashboard
   */
  getAuditStats(): {
    enabled: boolean;
    message: string;
  } {
    return {
      enabled: authConfig.security.enableAuditLogging,
      message: authConfig.security.enableAuditLogging
        ? 'Audit logging is enabled'
        : 'Audit logging is disabled',
    };
  }
}
