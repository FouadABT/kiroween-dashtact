import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLoggingService } from '../services/audit-logging.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private auditLoggingService: AuditLoggingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If public, allow access without role check
    if (isPublic) {
      return true;
    }

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request (set by JWT strategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's role from database
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!userWithRole || !userWithRole.role) {
      throw new ForbiddenException('User role not found');
    }

    // Check if user's role is in the required roles
    const hasRole = requiredRoles.includes(userWithRole.role.name);

    if (!hasRole) {
      // Log role check failure
      const resource = request.url || 'unknown';
      this.auditLoggingService.logRoleCheckFailed(
        user.id,
        requiredRoles.join(' or '),
        userWithRole.role.name,
        resource,
        request.ip,
        request.headers['user-agent'],
      );

      throw new ForbiddenException(
        `Insufficient role. Required: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
