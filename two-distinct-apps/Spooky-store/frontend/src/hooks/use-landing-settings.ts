import { useEffect } from 'react';
import type { LandingSettings } from '@/types/landing-cms';

/**
 * Hook to apply landing page settings to the DOM
 * Handles CSS injection, JavaScript execution, analytics, and metadata
 */
export function useLandingSettings(settings: LandingSettings | null) {
  useEffect(() => {
    if (!settings) return;

    // Apply custom CSS
    applyCustomCSS(settings.advanced?.customCSS);

    // Apply custom JavaScript
    applyCustomJavaScript(settings.advanced?.customJS);

    // Inject analytics scripts
    injectAnalyticsScripts(settings.advanced?.analyticsId, settings.advanced?.gtmId);

    // Load third-party scripts
    loadThirdPartyScripts(settings.advanced?.thirdPartyScripts);

    // Apply SEO metadata
    applySEOMetadata(settings.seo);

    // Apply general metadata
    applyGeneralMetadata(settings.general);

    // Apply layout settings
    applyLayoutSettings(settings.layout);

    // Apply performance settings
    applyPerformanceSettings(settings.performance);

    // Cleanup function
    return () => {
      // Cleanup is handled by removing injected elements
    };
  }, [settings]);
}

/**
 * Apply custom CSS to the page
 */
function applyCustomCSS(customCSS?: string) {
  if (!customCSS) return;

  // Remove existing custom CSS if present
  const existingStyle = document.getElementById('landing-custom-css');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject new style element
  const style = document.createElement('style');
  style.id = 'landing-custom-css';
  style.textContent = customCSS;
  document.head.appendChild(style);
}

/**
 * Execute custom JavaScript on the page
 */
function applyCustomJavaScript(customJS?: string) {
  if (!customJS) return;

  try {
    // Create a function from the custom JS and execute it
    // Using Function constructor to avoid direct eval
    const func = new Function(customJS);
    func();
  } catch (error) {
    console.error('Error executing custom JavaScript:', error);
  }
}

/**
 * Inject Google Analytics and Google Tag Manager scripts
 */
function injectAnalyticsScripts(gaId?: string, gtmId?: string) {
  // Inject Google Analytics
  if (gaId) {
    injectGoogleAnalytics(gaId);
  }

  // Inject Google Tag Manager
  if (gtmId) {
    injectGoogleTagManager(gtmId);
  }
}

/**
 * Inject Google Analytics script
 */
function injectGoogleAnalytics(gaId: string) {
  // Remove existing GA script if present
  const existingScript = document.getElementById('landing-ga-script');
  if (existingScript) {
    existingScript.remove();
  }

  // Create script element
  const script = document.createElement('script');
  script.id = 'landing-ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId);
}

/**
 * Inject Google Tag Manager script
 */
function injectGoogleTagManager(gtmId: string) {
  // Remove existing GTM script if present
  const existingScript = document.getElementById('landing-gtm-script');
  if (existingScript) {
    existingScript.remove();
  }

  // Create script element
  const script = document.createElement('script');
  script.id = 'landing-gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);

  // Initialize GTM noscript fallback
  const noscript = document.createElement('noscript');
  noscript.id = 'landing-gtm-noscript';
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.insertBefore(noscript, document.body.firstChild);
}

/**
 * Load third-party scripts
 */
function loadThirdPartyScripts(scripts?: string[]) {
  if (!scripts || scripts.length === 0) return;

  scripts.forEach((scriptUrl, index) => {
    // Remove existing script if present
    const existingScript = document.getElementById(`landing-third-party-${index}`);
    if (existingScript) {
      existingScript.remove();
    }

    // Create and inject script
    const script = document.createElement('script');
    script.id = `landing-third-party-${index}`;
    script.src = scriptUrl;
    script.async = true;
    document.head.appendChild(script);
  });
}

/**
 * Apply SEO metadata to the page
 */
function applySEOMetadata(seo?: any) {
  if (!seo) return;

  // Apply Open Graph tags
  if (seo.ogTitle) {
    setMetaTag('property', 'og:title', seo.ogTitle);
  }
  if (seo.ogDescription) {
    setMetaTag('property', 'og:description', seo.ogDescription);
  }
  if (seo.ogImage) {
    setMetaTag('property', 'og:image', seo.ogImage);
  }

  // Apply Twitter Card tags
  if (seo.twitterCard) {
    setMetaTag('name', 'twitter:card', seo.twitterCard);
  }
}

/**
 * Apply general metadata to the page
 */
function applyGeneralMetadata(general?: any) {
  if (!general) return;

  // Apply page title
  if (general.title) {
    document.title = general.title;
    setMetaTag('property', 'og:title', general.title);
    setMetaTag('name', 'twitter:title', general.title);
  }

  // Apply meta description
  if (general.description) {
    setMetaTag('name', 'description', general.description);
    setMetaTag('property', 'og:description', general.description);
    setMetaTag('name', 'twitter:description', general.description);
  }

  // Apply favicon
  if (general.favicon) {
    setFavicon(general.favicon);
  }

  // Apply language
  if (general.language) {
    document.documentElement.lang = general.language;
  }
}

/**
 * Apply layout settings to the page
 */
function applyLayoutSettings(layout?: any) {
  if (!layout) return;

  // Apply max width CSS variable
  if (layout.maxWidth) {
    const maxWidthValue = getMaxWidthValue(layout.maxWidth);
    document.documentElement.style.setProperty('--landing-max-width', maxWidthValue);
  }

  // Apply spacing CSS variable
  if (layout.spacing) {
    const spacingValue = getSpacingValue(layout.spacing);
    document.documentElement.style.setProperty('--landing-spacing', spacingValue);
  }
}

/**
 * Apply performance settings to the page
 */
function applyPerformanceSettings(performance?: any) {
  if (!performance) return;

  // Apply lazy loading attribute to images
  if (performance.lazyLoading) {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img) => {
      img.setAttribute('loading', 'lazy');
    });
  }
}

/**
 * Helper: Set or update meta tag
 */
function setMetaTag(attribute: string, name: string, content: string) {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Helper: Set favicon
 */
function setFavicon(url: string) {
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

/**
 * Helper: Get max width value in pixels
 */
function getMaxWidthValue(maxWidth: string): string {
  const widthMap: Record<string, string> = {
    full: '100%',
    container: '1280px',
    narrow: '1024px',
  };
  return widthMap[maxWidth] || '1280px';
}

/**
 * Helper: Get spacing value in rem
 */
function getSpacingValue(spacing: string): string {
  const spacingMap: Record<string, string> = {
    compact: '2rem',
    normal: '4rem',
    relaxed: '6rem',
  };
  return spacingMap[spacing] || '4rem';
}

// Extend window interface for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
