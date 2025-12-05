'use client';

import { useCallback } from 'react';
import { isFeatureEnabled, featureFlags } from '@/config/features.config';

/**
 * Hook to check if a feature is enabled
 * 
 * @example
 * ```tsx
 * const { isEnabled } = useFeatureFlag('ecommerce');
 * 
 * if (!isEnabled) {
 *   return <NotFound />;
 * }
 * ```
 */
export function useFeatureFlag(feature: keyof typeof featureFlags) {
  const isEnabled = useCallback(() => {
    return isFeatureEnabled(feature);
  }, [feature]);

  return {
    isEnabled: isEnabled(),
    feature,
  };
}

/**
 * Hook to get all feature flags
 * 
 * @example
 * ```tsx
 * const features = useAllFeatureFlags();
 * 
 * if (features.ecommerce) {
 *   // Show ecommerce features
 * }
 * ```
 */
export function useAllFeatureFlags() {
  return featureFlags;
}
