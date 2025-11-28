/**
 * Default Branding Constants
 * 
 * Fallback values for branding when custom branding is not configured.
 */

export const DEFAULT_BRANDING = {
  brandName: 'Dashboard',
  tagline: 'Your Business Management Platform',
  description: 'A comprehensive dashboard for managing your business operations',
  logoUrl: '/images/branding/default-logo.svg',
  logoDarkUrl: '/images/branding/default-logo-dark.svg',
  faviconUrl: '/favicon.ico',
  websiteUrl: '',
  supportEmail: '',
  socialLinks: {},
} as const;

/**
 * Get default logo URL based on theme
 */
export function getDefaultLogoUrl(isDark = false): string {
  return isDark ? DEFAULT_BRANDING.logoDarkUrl : DEFAULT_BRANDING.logoUrl;
}

/**
 * Get default favicon URL
 */
export function getDefaultFaviconUrl(): string {
  return DEFAULT_BRANDING.faviconUrl;
}

/**
 * Get default brand name
 */
export function getDefaultBrandName(): string {
  return DEFAULT_BRANDING.brandName;
}

/**
 * Get default tagline
 */
export function getDefaultTagline(): string {
  return DEFAULT_BRANDING.tagline;
}
