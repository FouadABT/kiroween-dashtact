'use client';

import { useEffect } from 'react';
import { BrandingApi } from '@/lib/api/branding';

/**
 * Client-side component that updates the favicon dynamically
 * This ensures the favicon is always up-to-date with the branding settings
 */
export function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const branding = await BrandingApi.getBrandSettings();
        
        if (branding.faviconUrl) {
          // Find or create favicon link element
          let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          
          // Update favicon URL
          link.href = branding.faviconUrl;
          
          // Also update shortcut icon
          let shortcutLink = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
          if (!shortcutLink) {
            shortcutLink = document.createElement('link');
            shortcutLink.rel = 'shortcut icon';
            document.head.appendChild(shortcutLink);
          }
          shortcutLink.href = branding.faviconUrl;
          
          // Update apple touch icon
          let appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
          if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
          }
          appleLink.href = branding.faviconUrl;
        }
      } catch (error) {
        console.error('Failed to update favicon:', error);
      }
    };

    // Update favicon on mount
    updateFavicon();

    // Optionally refresh every 30 seconds to catch updates
    const interval = setInterval(updateFavicon, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
