import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_ENABLED_KEY } from '../decorators/feature-enabled.decorator';
import { isFeatureEnabled } from '../../config/features.config';
import { FeatureFlags } from '../../config/features.config';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required feature from decorator
    const requiredFeature = this.reflector.getAllAndOverride<keyof FeatureFlags>(
      FEATURE_ENABLED_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no feature required, allow access
    if (!requiredFeature) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admin bypasses feature flags
    if (user?.role?.name === 'Super Admin') {
      return true;
    }

    // Check if user has super admin permission (*:*)
    if (user?.permissions?.includes('*:*')) {
      return true;
    }

    // Check if feature is enabled
    if (!isFeatureEnabled(requiredFeature)) {
      throw new ForbiddenException(
        `Feature '${requiredFeature}' is not enabled`,
      );
    }

    return true;
  }
}
