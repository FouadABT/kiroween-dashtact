'use client';

import { useBrandingContext } from '@/contexts/BrandingContext';
import type { BrandSettings } from '@/types/branding';

/**
 * Custom hook for accessing branding settings
 * 
 * Provides convenient access to brand settings and helper functions
 * for common branding operations.
 */
export function useBranding() {
  const context = useBrandingContext();

  /**
   * Get the current logo URL based on theme
   * @param isDark Whether to get dark mode logo
   * @returns Logo URL or null if not set
   */
  const getLogoUrl = (isDark = false): string | null => {
    if (!context.brandSettings) return null;
    
    if (isDark && context.brandSettings.logoDarkUrl) {
      return context.brandSettings.logoDarkUrl;
    }
    
    return context.brandSettings.logoUrl || null;
  };

  /**
   * Get the favicon URL
   * @returns Favicon URL or null if not set
   */
  const getFaviconUrl = (): string | null => {
    return context.brandSettings?.faviconUrl || null;
  };

  /**
   * Get the brand name
   * @param fallback Fallback name if not set
   * @returns Brand name
   */
  const getBrandName = (fallback = 'Dashboard'): string => {
    return context.brandSettings?.brandName || fallback;
  };

  /**
   * Get the tagline
   * @returns Tagline or null if not set
   */
  const getTagline = (): string | null => {
    return context.brandSettings?.tagline || null;
  };

  /**
   * Get the description
   * @returns Description or null if not set
   */
  const getDescription = (): string | null => {
    return context.brandSettings?.description || null;
  };

  /**
   * Get the support email
   * @returns Support email or null if not set
   */
  const getSupportEmail = (): string | null => {
    return context.brandSettings?.supportEmail || null;
  };

  /**
   * Get the website URL
   * @returns Website URL or null if not set
   */
  const getWebsiteUrl = (): string | null => {
    return context.brandSettings?.websiteUrl || null;
  };

  /**
   * Get social media links
   * @returns Social links object or empty object if not set
   */
  const getSocialLinks = (): BrandSettings['socialLinks'] => {
    return context.brandSettings?.socialLinks || {};
  };

  /**
   * Check if branding is fully configured
   * @returns True if all essential branding is set
   */
  const isBrandingConfigured = (): boolean => {
    if (!context.brandSettings) return false;
    
    return !!(
      context.brandSettings.brandName &&
      context.brandSettings.logoUrl
    );
  };

  /**
   * Check if custom branding is set (not default)
   * @returns True if custom branding exists
   */
  const hasCustomBranding = (): boolean => {
    if (!context.brandSettings) return false;
    
    return !!(
      context.brandSettings.logoUrl ||
      context.brandSettings.logoDarkUrl ||
      context.brandSettings.faviconUrl ||
      context.brandSettings.tagline
    );
  };

  return {
    // Context values
    brandSettings: context.brandSettings,
    loading: context.loading,
    error: context.error,
    
    // Context methods
    refreshBranding: context.refreshBranding,
    updateBranding: context.updateBranding,
    uploadLogo: context.uploadLogo,
    uploadFavicon: context.uploadFavicon,
    resetBranding: context.resetBranding,
    
    // Helper functions
    getLogoUrl,
    getFaviconUrl,
    getBrandName,
    getTagline,
    getDescription,
    getSupportEmail,
    getWebsiteUrl,
    getSocialLinks,
    isBrandingConfigured,
    hasCustomBranding,
  };
}
