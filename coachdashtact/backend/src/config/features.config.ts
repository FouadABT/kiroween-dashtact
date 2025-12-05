/**
 * Features Configuration (Backend)
 * 
 * Centralized configuration for optional features in the backend.
 * Features can be enabled/disabled via environment variables.
 * Must match frontend feature names for consistency.
 */

/**
 * Feature Flags - Controls which features are available
 */
export interface FeatureFlags {
  landing: boolean;
  blog: boolean;
  ecommerce: boolean;
  calendar: boolean;
  crm: boolean;
  notifications: boolean;
  customerAccount: boolean;
}

/**
 * Feature Flags - Controls which features are available
 * 
 * Read from ENABLE_* environment variables
 * Must match frontend feature names for consistency
 */
export const featureFlags: FeatureFlags = {
  landing: process.env.ENABLE_LANDING === 'true',
  blog: process.env.ENABLE_BLOG === 'true',
  ecommerce: process.env.ENABLE_ECOMMERCE === 'true',
  calendar: process.env.ENABLE_CALENDAR === 'true',
  crm: process.env.ENABLE_CRM === 'true',
  notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  customerAccount: process.env.ENABLE_CUSTOMER_ACCOUNT === 'true',
};

/**
 * Check if a feature is enabled
 * 
 * @param feature - The feature to check
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * ```typescript
 * import { isFeatureEnabled } from '@/config/features.config';
 * 
 * if (isFeatureEnabled('blog')) {
 *   // Blog is enabled
 * }
 * ```
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}
