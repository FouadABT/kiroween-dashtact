'use client';

import { ReactNode } from 'react';
import { isFeatureEnabled, featureFlags } from '@/config/features.config';

interface FeatureGateProps {
  feature: keyof typeof featureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on feature flags
 * 
 * @example
 * ```tsx
 * <FeatureGate feature="ecommerce">
 *   <ShopPage />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
