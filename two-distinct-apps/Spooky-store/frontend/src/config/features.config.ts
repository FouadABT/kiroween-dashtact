/**
 * Features Configuration
 * 
 * Centralized configuration for optional features in the dashboard starter kit.
 * Features can be enabled/disabled via environment variables.
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
 * Page Visibility - Controls which pages are visible to users
 */
export interface PageVisibility {
  showHomePage: boolean;
  showShopPage: boolean;
  showBlogPage: boolean;
  showAccountPage: boolean;
}

export interface LandingPageConfig {
  enabled: boolean;
  useDynamicHeaderFooter: boolean;
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
 * Feature Flags - Controls which features are available
 * 
 * Read from NEXT_PUBLIC_ENABLE_* environment variables
 */
export const featureFlags: FeatureFlags = {
  landing: process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true',
  blog: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
  ecommerce: process.env.NEXT_PUBLIC_ENABLE_ECOMMERCE === 'true',
  calendar: process.env.NEXT_PUBLIC_ENABLE_CALENDAR === 'true',
  crm: process.env.NEXT_PUBLIC_ENABLE_CRM === 'true',
  notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  customerAccount: process.env.NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT === 'true',
};

/**
 * Page Visibility - Controls which pages are visible to users
 * 
 * Read from NEXT_PUBLIC_SHOW_* environment variables
 */
export const pageVisibility: PageVisibility = {
  showHomePage: process.env.NEXT_PUBLIC_SHOW_HOME_PAGE === 'true',
  showShopPage: process.env.NEXT_PUBLIC_SHOW_SHOP_PAGE === 'true',
  showBlogPage: process.env.NEXT_PUBLIC_SHOW_BLOG_PAGE === 'true',
  showAccountPage: process.env.NEXT_PUBLIC_SHOW_ACCOUNT_PAGE === 'true',
};

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
   * 
   * useDynamicHeaderFooter: When true, uses header/footer from CMS settings
   *                         When false, uses hardcoded PublicNavigation and Footer components
   */
  landingPage: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true',
    useDynamicHeaderFooter: process.env.NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER === 'true',
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
 * Check if a feature is enabled
 * 
 * @param feature - The feature to check
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * ```typescript
 * if (isFeatureEnabled('blog')) {
 *   // Blog is enabled
 * }
 * ```
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Check if a page is visible
 * 
 * @param page - The page to check
 * @returns boolean indicating if the page is visible
 * 
 * @example
 * ```typescript
 * if (isPageVisible('showBlogPage')) {
 *   // Blog page is visible
 * }
 * ```
 */
export function isPageVisible(page: keyof PageVisibility): boolean {
  return pageVisibility[page];
}

/**
 * Helper function to check if a feature is enabled (legacy)
 * 
 * @param feature - The feature to check ('landingPage' | 'blog')
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * ```typescript
 * if (isFeatureEnabledLegacy('blog')) {
 *   // Blog is enabled
 * }
 * ```
 */
export function isFeatureEnabledLegacy(feature: keyof FeaturesConfig): boolean {
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
