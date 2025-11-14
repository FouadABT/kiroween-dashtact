/**
 * Features Configuration
 * 
 * Centralized configuration for optional features in the dashboard starter kit.
 * Features can be enabled/disabled via environment variables.
 */

export interface LandingPageConfig {
  enabled: boolean;
}

export interface BlogConfig {
  enabled: boolean;
  postsPerPage: number;
  enableCategories: boolean;
  enableTags: boolean;
  requireAuthor: boolean;
}

export interface EcommerceConfig {
  enabled: boolean;
}

export interface FeaturesConfig {
  landingPage: LandingPageConfig;
  blog: BlogConfig;
  ecommerce: EcommerceConfig;
}

/**
 * Features configuration object
 * 
 * Controls which optional features are enabled in the application.
 * 
 * @example
 * ```typescript
 * import { featuresConfig } from '@/config/features.config';
 * 
 * if (featuresConfig.landingPage.enabled) {
 *   // Show landing page
 * }
 * 
 * if (featuresConfig.blog.enabled) {
 *   // Show blog features
 * }
 * ```
 */
export const featuresConfig: FeaturesConfig = {
  /**
   * Landing Page Configuration
   * 
   * When enabled: Root route (/) shows landing page
   * When disabled: Root route redirects to /dashboard (authenticated) or /login (unauthenticated)
   */
  landingPage: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true',
  },

  /**
   * Blog System Configuration
   * 
   * When enabled: Blog routes (/blog, /blog/[slug]) are accessible
   * When disabled: Blog routes return 404
   */
  blog: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
    postsPerPage: Number(process.env.NEXT_PUBLIC_BLOG_POSTS_PER_PAGE) || 10,
    enableCategories: process.env.NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES !== 'false',
    enableTags: process.env.NEXT_PUBLIC_BLOG_ENABLE_TAGS !== 'false',
    requireAuthor: process.env.NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR === 'true',
  },

  /**
   * E-Commerce System Configuration
   * 
   * When enabled: E-commerce routes (/dashboard/ecommerce/*) are accessible
   * When disabled: E-commerce routes return 404 and navigation items are hidden
   */
  ecommerce: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ECOMMERCE === 'true',
  },
};

/**
 * Helper function to check if a feature is enabled
 * 
 * @param feature - The feature to check ('landingPage' | 'blog')
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * ```typescript
 * if (isFeatureEnabled('blog')) {
 *   // Blog is enabled
 * }
 * ```
 */
export function isFeatureEnabled(feature: keyof FeaturesConfig): boolean {
  return featuresConfig[feature].enabled;
}

/**
 * Get the redirect URL for the root route when landing page is disabled
 * 
 * @param isAuthenticated - Whether the user is authenticated
 * @returns The URL to redirect to
 */
export function getRootRedirectUrl(isAuthenticated: boolean): string {
  return isAuthenticated ? '/dashboard' : '/login';
}
