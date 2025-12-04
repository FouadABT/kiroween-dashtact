import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLogService } from '../activity-log.service';
import { Reflector } from '@nestjs/core';

/**
 * Smart Activity Logging Interceptor
 * 
 * Automatically logs all non-GET HTTP requests (POST, PUT, PATCH, DELETE)
 * Extracts action, entity, and metadata from the request context
 */
@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly activityLogService: ActivityLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Skip GET requests and activity-logs endpoints (avoid recursion)
    if (method === 'GET' || request.url.includes('/activity-logs')) {
      return next.handle();
    }

    // Skip low-value endpoints that create noise
    if (this.shouldSkipLogging(request)) {
      return next.handle();
    }

    // Check if logging is disabled for this route
    const skipLogging = this.reflector.get<boolean>(
      'skipActivityLog',
      context.getHandler(),
    );

    if (skipLogging) {
      return next.handle();
    }

    const user = request.user;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          // Log successful actions asynchronously (don't block response)
          setImmediate(() => {
            this.logActivity(request, response, user, method, startTime);
          });
        },
        error: (error) => {
          // Log failed actions
          setImmediate(() => {
            this.logFailedActivity(request, error, user, method);
          });
        },
      }),
    );
  }

  /**
   * Log successful activity
   */
  private async logActivity(
    request: any,
    response: any,
    user: any,
    method: string,
    startTime: number,
  ): Promise<void> {
    try {
      const action = this.determineAction(request, method);
      const entityInfo = this.extractEntityInfo(request, response);
      const metadata = this.buildMetadata(request, response, startTime);

      await this.activityLogService.logActivity(
        {
          action,
          userId: user?.id,
          actorName: user?.name || user?.email || 'Anonymous',
          entityType: entityInfo.entityType || undefined,
          entityId: entityInfo.entityId || undefined,
          metadata,
          ipAddress: this.getClientIp(request) || undefined,
          userAgent: request.headers['user-agent'],
        },
        request,
      );
    } catch (error) {
      // Silently fail - don't break the application if logging fails
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Log failed activity
   */
  private async logFailedActivity(
    request: any,
    error: any,
    user: any,
    method: string,
  ): Promise<void> {
    try {
      const action = `${this.determineAction(request, method)}_FAILED`;
      const entityInfo = this.extractEntityInfo(request, null);

      await this.activityLogService.logActivity(
        {
          action,
          userId: user?.id,
          actorName: user?.name || user?.email || 'Anonymous',
          entityType: entityInfo.entityType || undefined,
          entityId: entityInfo.entityId || undefined,
          metadata: {
            error: error.message,
            statusCode: error.status || 500,
            path: request.url,
          },
          ipAddress: this.getClientIp(request) || undefined,
          userAgent: request.headers['user-agent'],
        },
        request,
      );
    } catch (logError) {
      console.error('Failed to log failed activity:', logError);
    }
  }

  /**
   * Determine action name from request context
   */
  private determineAction(request: any, method: string): string {
    const path = request.route?.path || request.url;
    const pathParts = path.split('/').filter((p: string) => p && !p.startsWith(':'));

    // Extract resource name (e.g., 'users', 'products', 'orders')
    const resource = pathParts[pathParts.length - 1] || 'UNKNOWN';
    const resourceName = resource.toUpperCase().replace(/-/g, '_');

    // Map HTTP method to action
    const actionMap: Record<string, string> = {
      POST: 'CREATED',
      PUT: 'UPDATED',
      PATCH: 'UPDATED',
      DELETE: 'DELETED',
    };

    const actionSuffix = actionMap[method] || 'MODIFIED';

    // Special cases for common patterns
    if (path.includes('/login')) return 'USER_LOGIN';
    if (path.includes('/logout')) return 'USER_LOGOUT';
    if (path.includes('/register')) return 'USER_REGISTER';
    if (path.includes('/password')) return 'PASSWORD_CHANGED';
    if (path.includes('/publish')) return `${resourceName}_PUBLISHED`;
    if (path.includes('/status')) return `${resourceName}_STATUS_CHANGED`;
    if (path.includes('/role')) return 'USER_ROLE_CHANGED';

    // Default pattern: RESOURCE_ACTION (e.g., USER_CREATED, PRODUCT_UPDATED)
    return `${resourceName}_${actionSuffix}`;
  }

  /**
   * Extract entity information from request/response
   */
  private extractEntityInfo(
    request: any,
    response: any,
  ): { entityType: string | null; entityId: string | null } {
    const path = request.route?.path || request.url;
    const pathParts = path.split('/').filter((p: string) => p);

    // Try to get entity type from path
    let entityType: string | null = null;
    if (pathParts.length > 0) {
      const resource = pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1];
      entityType = this.singularize(resource);
      entityType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    }

    // Try to get entity ID from params or response
    let entityId: string | null = null;
    
    // From URL params
    if (request.params?.id) {
      entityId = request.params.id;
    }
    
    // From response body
    if (!entityId && response?.id) {
      entityId = response.id;
    }

    // From request body
    if (!entityId && request.body?.id) {
      entityId = request.body.id;
    }

    return { entityType, entityId };
  }

  /**
   * Build metadata object with relevant information
   */
  private buildMetadata(
    request: any,
    response: any,
    startTime: number,
  ): Record<string, any> {
    const metadata: Record<string, any> = {
      method: request.method,
      path: request.url,
      duration: Date.now() - startTime,
    };

    // Add request body (sanitized)
    if (request.body && Object.keys(request.body).length > 0) {
      metadata.requestData = this.sanitizeData(request.body);
    }

    // Add response data (limited)
    if (response) {
      if (response.id) metadata.entityId = response.id;
      if (response.name) metadata.name = response.name;
      if (response.title) metadata.title = response.title;
      if (response.email) metadata.email = response.email;
      if (response.status) metadata.status = response.status;
    }

    return metadata;
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeData(data: any): any {
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: any): string | null {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      null
    );
  }

  /**
   * Convert plural to singular (simple implementation)
   */
  private singularize(word: string): string {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('ses')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }

  /**
   * Determine if request should skip logging
   * Filters out low-value, high-frequency operations
   */
  private shouldSkipLogging(request: any): boolean {
    const url = request.url.toLowerCase();
    const path = request.route?.path?.toLowerCase() || url;

    // Skip token refresh - happens every ~13 minutes, minimal security value
    if (url.includes('/auth/refresh') || path.includes('/auth/refresh')) {
      return true;
    }

    // Skip health checks and monitoring endpoints
    if (url.includes('/health') || url.includes('/metrics') || url.includes('/ping')) {
      return true;
    }

    // Skip notification read/mark operations (too frequent)
    if (url.includes('/notifications') && (url.includes('/read') || url.includes('/mark'))) {
      return true;
    }

    // Skip session validation checks
    if (url.includes('/auth/validate') || url.includes('/auth/check')) {
      return true;
    }

    // Skip websocket heartbeat/ping
    if (url.includes('/ws/ping') || url.includes('/socket/ping')) {
      return true;
    }

    // Skip file preview/thumbnail generation (too frequent)
    if (url.includes('/preview') || url.includes('/thumbnail')) {
      return true;
    }

    // Skip auto-save operations (log only final save)
    if (url.includes('/autosave') || request.headers['x-autosave'] === 'true') {
      return true;
    }

    return false;
  }
}
