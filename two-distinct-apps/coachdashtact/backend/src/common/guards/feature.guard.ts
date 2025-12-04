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

    // Check if feature is enabled
    if (!isFeatureEnabled(requiredFeature)) {
      throw new ForbiddenException(
        `Feature '${requiredFeature}' is not enabled`,
      );
    }

    return true;
  }
}
