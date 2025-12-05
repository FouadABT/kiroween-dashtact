/**
 * Landing Page Helper Functions
 * 
 * Utility functions for landing page rendering.
 */

import { CtaButton, NavLink } from '@/types/landing-page';
import { PagesApi } from '@/lib/api';

// Cache for page ID to slug mapping
const pageSlugCache = new Map<string, string>();

/**
 * Resolve CTA link to URL
 * 
 * Handles both external URLs and internal page links.
 * For page links, resolves the page ID to the page slug URL.
 */
export function resolveCtaLink(cta: CtaButton | NavLink): string {
  if (cta.linkType === 'url') {
    // External URL - return as is
    // CtaButton has 'link', NavLink has 'url'
    const url = 'link' in cta ? cta.link : cta.url;
    return url || '#';
  } else if (cta.linkType === 'page') {
    // Internal page link - resolve page ID to slug
    const pageIdOrSlug = 'link' in cta ? cta.link : cta.url;
    
    // If it already looks like a path, return it
    if (pageIdOrSlug && pageIdOrSlug.startsWith('/')) {
      return pageIdOrSlug;
    }
    
    // Check cache first
    if (pageIdOrSlug && pageSlugCache.has(pageIdOrSlug)) {
      return `/${pageSlugCache.get(pageIdOrSlug)}`;
    }
    
    // If it looks like a page ID (cuid format), we need to fetch the page
    // For now, we'll assume the link is already a slug
    // The page selector component will store slugs instead of IDs
    return pageIdOrSlug ? `/${pageIdOrSlug}` : '#';
  }
  
  // Fallback
  return '#';
}

/**
 * Resolve CTA link to URL (async version)
 * 
 * Handles both external URLs and internal page links.
 * For page links, fetches the page by ID and resolves to slug URL.
 */
export async function resolveCtaLinkAsync(cta: CtaButton | NavLink): Promise<string> {
  if (cta.linkType === 'url') {
    // External URL - return as is
    const url = 'link' in cta ? cta.link : cta.url;
    return url || '#';
  } else if (cta.linkType === 'page') {
    // Internal page link - resolve page ID to slug
    const pageIdOrSlug = 'link' in cta ? cta.link : cta.url;
    
    if (!pageIdOrSlug) {
      return '#';
    }
    
    // If it already looks like a path, return it
    if (pageIdOrSlug.startsWith('/')) {
      return pageIdOrSlug;
    }
    
    // Check cache first
    if (pageSlugCache.has(pageIdOrSlug)) {
      return `/${pageSlugCache.get(pageIdOrSlug)}`;
    }
    
    // If it looks like a cuid (page ID), fetch the page
    if (pageIdOrSlug.length > 20 && !pageIdOrSlug.includes('/')) {
      try {
        const page = await PagesApi.getById(pageIdOrSlug);
        pageSlugCache.set(pageIdOrSlug, page.slug);
        return `/${page.slug}`;
      } catch (error) {
        console.error('Failed to resolve page link:', error);
        return '#';
      }
    }
    
    // Otherwise, assume it's already a slug
    return `/${pageIdOrSlug}`;
  }
  
  // Fallback
  return '#';
}

/**
 * Apply proper link styling classes
 * 
 * Returns CSS classes for link styling based on context.
 */
export function getLinkClasses(variant: 'primary' | 'secondary' | 'text' = 'text'): string {
  const baseClasses = 'transition-colors';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`;
    case 'secondary':
      return `${baseClasses} bg-secondary text-secondary-foreground hover:bg-secondary/90`;
    case 'text':
      return `${baseClasses} text-muted-foreground hover:text-foreground`;
    default:
      return baseClasses;
  }
}

/**
 * Validate external URL
 * 
 * Checks if a URL is a valid external URL.
 */
export function isExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get link target attribute
 * 
 * Returns '_blank' for external URLs, undefined for internal links.
 */
export function getLinkTarget(url: string): '_blank' | undefined {
  return isExternalUrl(url) ? '_blank' : undefined;
}

/**
 * Get link rel attribute
 * 
 * Returns 'noopener noreferrer' for external URLs, undefined for internal links.
 */
export function getLinkRel(url: string): string | undefined {
  return isExternalUrl(url) ? 'noopener noreferrer' : undefined;
}
