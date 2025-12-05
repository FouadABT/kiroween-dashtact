import { SetMetadata } from '@nestjs/common';
import { FeatureFlags } from '../../config/features.config';

export const FEATURE_ENABLED_KEY = 'featureEnabled';

/**
 * Decorator to specify required feature for a route
 * @param feature - The feature flag to check (e.g., 'blog', 'ecommerce', 'calendar')
 * @example
 * @FeatureEnabled('blog')
 * @FeatureEnabled('ecommerce')
 */
export const FeatureEnabled = (feature: keyof FeatureFlags) =>
  SetMetadata(FEATURE_ENABLED_KEY, feature);
