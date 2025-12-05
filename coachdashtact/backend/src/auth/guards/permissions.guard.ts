import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionsService } from '../../permissions/permissions.service';
import { AuditLoggingService } from '../services/audit-logging.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
    @Optional() private auditLoggingService?: AuditLoggingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If public, allow access without permission check
    if (isPublic) {
      return true;
    }

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request (set by JWT strategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has any of the required permissions (OR logic)
    // This allows endpoints to accept multiple permission options
    const hasAnyPermission = await this.permissionsService.userHasAnyPermission(
      user.id,
      requiredPermissions,
    );

    if (!hasAnyPermission) {
      // Log permission denial (if audit service is available)
      if (this.auditLoggingService) {
        const resource = request.url || 'unknown';
        this.auditLoggingService.logPermissionDenied(
          user.id,
          requiredPermissions.join(', '),
          resource,
          request.ip,
          request.headers['user-agent'],
        );
      }

      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
