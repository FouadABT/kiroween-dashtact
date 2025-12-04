/**
 * Metadata Helper Functions
 * 
 * Utilities for generating Next.js metadata, resolving templates,
 * and creating structured data for SEO optimization.
 */

import { Metadata } from 'next';
import { metadataConfig, defaultMetadata } from './metadata-config';
import { PageMetadata } from '@/types/metadata';
import { pathMetadataCache, templateCache } from './metadata-cache';

/**
 * Clear metadata cache (useful for testing or when metadata config changes)
 */
export function clearMetadataCache(): void {
  pathMetadataCache.clear();
  templateCache.clear();
}

/**
 * Generate Next.js Metadata object for a route
 * 
 * This function creates a complete Metadata object compatible with Next.js 14's
 * Metadata API, including title, description, Open Graph, Twitter Cards, and robots.
 * 
 * @param pathname - The route pathname (e.g., '/dashboard/users')
 * @param dynamicValues - Optional dynamic values for template resolution (e.g., { userName: 'John' })
 * @returns Next.js Metadata object
 * 
 * @example
 * // Static page
 * export const metadata = generatePageMetadata('/dashboard/users');
 * 
 * @example
 * // Dynamic page with values
 * export async function generateMetadata({ params }) {
 *   const user = await fetchUser(params.id);
 *   return generatePageMetadata('/dashboard/users/:id', {
 *     userName: user.name,
 *     userId: params.id
 *   });
 * }
 */
export function generatePageMetadata(
  pathname: string,
  dynamicValues?: Record<string, string>
): Metadata {
  const config = getMetadataForPath(pathname);
  const resolved = resolveMetadataTemplate(config, dynamicValues);

  // Generate canonical URL
  const canonicalUrl = generateCanonicalUrl(pathname);
  const includeCanonical = shouldHaveCanonical(pathname);

  return {
    title: resolved.title,
    description: resolved.description,
    keywords: resolved.keywords,
    
    // Open Graph metadata for social media sharing
    openGraph: {
      title: resolved.openGraph?.title || resolved.title,
      description: resolved.openGraph?.description || resolved.description,
      type: resolved.openGraph?.type || 'website',
      url: resolved.openGraph?.url || canonicalUrl,
      siteName: resolved.openGraph?.siteName || defaultMetadata.openGraph?.siteName,
      images: resolved.openGraph?.images || defaultMetadata.openGraph?.images || [],
      locale: resolved.openGraph?.locale || defaultMetadata.openGraph?.locale,
    },
    
    // Twitter Card metadata
    twitter: {
      card: resolved.twitter?.card || 'summary_large_image',
      site: resolved.twitter?.site || defaultMetadata.twitter?.site,
      creator: resolved.twitter?.creator || defaultMetadata.twitter?.creator,
      title: resolved.twitter?.title || resolved.title,
      description: resolved.twitter?.description || resolved.description,
      images: resolved.twitter?.images || defaultMetadata.twitter?.images,
    },
    
    // Robots directives for search engines
    robots: {
      index: resolved.robots?.index ?? defaultMetadata.robots?.index ?? true,
      follow: resolved.robots?.follow ?? defaultMetadata.robots?.follow ?? true,
      noarchive: resolved.robots?.noarchive,
      nosnippet: resolved.robots?.nosnippet,
      noimageindex: resolved.robots?.noimageindex,
      'max-snippet': resolved.robots?.maxSnippet,
      'max-image-preview': resolved.robots?.maxImagePreview || defaultMetadata.robots?.maxImagePreview,
      'max-video-preview': resolved.robots?.maxVideoPreview,
    },
    
    // Canonical URL to prevent duplicate content issues
    ...(includeCanonical && {
      alternates: {
        canonical: resolved.canonical || canonicalUrl,
      },
    }),
  };
}

/**
 * Get metadata configuration for a specific path (memoized)
 * 
 * Supports both exact matches and pattern matching for dynamic routes.
 * Falls back to default metadata if no match is found.
 * 
 * @param pathname - The route pathname
 * @returns Merged metadata (default + route-specific)
 * 
 * @example
 * const metadata = getMetadataForPath('/dashboard/users');
 * const dynamicMetadata = getMetadataForPath('/dashboard/users/123');
 */
export function getMetadataForPath(pathname: string): PageMetadata {
  // Check cache first
  const cached = pathMetadataCache.get(pathname);
  if (cached) {
    return cached;
  }

  let result: PageMetadata;

  // Exact match
  if (metadataConfig[pathname]) {
    result = { ...defaultMetadata, ...metadataConfig[pathname] };
  } else {
    // Pattern match for dynamic routes (e.g., /dashboard/users/:id)
    const pattern = Object.keys(metadataConfig).find((key) => {
      // Convert route pattern to regex (e.g., /users/:id -> /users/[^/]+)
      const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
      return regex.test(pathname);
    });

    if (pattern) {
      result = { ...defaultMetadata, ...metadataConfig[pattern] };
    } else {
      // Log warning for missing metadata configuration
      if (process.env.NODE_ENV === 'development') {
        console.warn(`No metadata configuration found for path: ${pathname}. Using defaults.`);
      }

      // Return default metadata if no match found
      result = defaultMetadata;
    }
  }

  // Cache the result
  pathMetadataCache.set(pathname, result);

  return result;
}

/**
 * Generate cache key for template resolution
 */
function getTemplateCacheKey(metadata: PageMetadata, values?: Record<string, string>): string {
  // Use title as a simple identifier + values
  return `${metadata.title}|${values ? JSON.stringify(values) : ''}`;
}

/**
 * Resolve template strings in metadata with dynamic values (memoized)
 * 
 * Replaces placeholders in the format {key} with actual values.
 * Preserves placeholders if no value is provided.
 * 
 * @param metadata - Metadata object with potential template strings
 * @param values - Dynamic values to replace in templates
 * @returns Resolved metadata with replaced values
 * 
 * @example
 * const metadata = {
 *   title: 'User: {userName}',
 *   description: 'Profile for {userName}'
 * };
 * const resolved = resolveMetadataTemplate(metadata, { userName: 'John Doe' });
 * // Result: { title: 'User: John Doe', description: 'Profile for John Doe' }
 */
export function resolveMetadataTemplate(
  metadata: PageMetadata,
  values?: Record<string, string>
): PageMetadata {
  if (!values) return metadata;

  // Check cache first
  const cacheKey = getTemplateCacheKey(metadata, values);
  const cached = templateCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const resolved = { ...metadata };

  // Resolve title
  if (resolved.title) {
    resolved.title = resolveTemplate(resolved.title, values);
  }

  // Resolve description
  if (resolved.description) {
    resolved.description = resolveTemplate(resolved.description, values);
  }

  // Resolve breadcrumb label
  if (resolved.breadcrumb?.label) {
    resolved.breadcrumb = {
      ...resolved.breadcrumb,
      label: resolveTemplate(resolved.breadcrumb.label, values),
    };
  }

  // Resolve Open Graph metadata
  if (resolved.openGraph) {
    if (resolved.openGraph.title) {
      resolved.openGraph = {
        ...resolved.openGraph,
        title: resolveTemplate(resolved.openGraph.title, values),
      };
    }

    if (resolved.openGraph.description) {
      resolved.openGraph = {
        ...resolved.openGraph,
        description: resolveTemplate(resolved.openGraph.description, values),
      };
    }

    // Resolve Open Graph images
    if (resolved.openGraph.images && Array.isArray(resolved.openGraph.images)) {
      const resolvedImages = resolved.openGraph.images.map((image) => {
        if (typeof image === 'string') {
          return resolveTemplate(image, values);
        } else if (typeof image === 'object' && image !== null && 'url' in image) {
          return {
            ...image,
            url: resolveTemplate(image.url, values),
            alt: image.alt ? resolveTemplate(image.alt, values) : image.alt,
          };
        }
        return image;
      });
      
      resolved.openGraph = {
        ...resolved.openGraph,
        images: resolvedImages as typeof resolved.openGraph.images,
      };
    }
  }

  // Resolve Twitter metadata
  if (resolved.twitter) {
    if (resolved.twitter.title) {
      resolved.twitter = {
        ...resolved.twitter,
        title: resolveTemplate(resolved.twitter.title, values),
      };
    }

    if (resolved.twitter.description) {
      resolved.twitter = {
        ...resolved.twitter,
        description: resolveTemplate(resolved.twitter.description, values),
      };
    }

    // Resolve Twitter images
    if (resolved.twitter.images && Array.isArray(resolved.twitter.images)) {
      resolved.twitter = {
        ...resolved.twitter,
        images: resolved.twitter.images.map((image) => {
          return typeof image === 'string' ? resolveTemplate(image, values) : image;
        }),
      };
    }
  }

  // Cache the result
  templateCache.set(cacheKey, resolved);

  return resolved;
}

/**
 * Replace template placeholders with actual values
 * 
 * Internal helper function for template string resolution.
 * Uses {key} syntax for placeholders.
 * 
 * @param template - String with {placeholder} syntax
 * @param values - Object with placeholder values
 * @returns Resolved string
 * 
 * @example
 * resolveTemplate('Hello {name}!', { name: 'World' }); // 'Hello World!'
 * resolveTemplate('User {id}', {}); // 'User {id}' (preserves placeholder)
 */
function resolveTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (!values[key]) {
      // Log warning in development if template value is missing
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Template value not found for key: ${key}`);
      }
      return match; // Keep placeholder if value not found
    }
    return values[key];
  });
}

/**
 * Extract dynamic values from a pathname based on a route pattern
 * 
 * Useful for extracting route parameters to use in metadata templates.
 * 
 * @param pathname - The actual pathname (e.g., '/dashboard/users/123')
 * @param pattern - The route pattern (e.g., '/dashboard/users/:id')
 * @returns Object with extracted parameter values
 * 
 * @example
 * const values = extractDynamicValues('/dashboard/users/123', '/dashboard/users/:id');
 * // Result: { id: '123' }
 */
export function extractDynamicValues(
  pathname: string,
  pattern: string
): Record<string, string> {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathnameParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathnameParts.length) {
    return {};
  }

  const values: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathnamePart = pathnameParts[i];

    // Check if this part is a dynamic parameter (starts with :)
    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1); // Remove the : prefix
      values[paramName] = pathnamePart;
    }
  }

  return values;
}

/**
 * Find the matching route pattern for a given pathname
 * 
 * Useful for determining which metadata configuration applies to a pathname.
 * 
 * @param pathname - The route pathname
 * @returns The matching pattern or null if no match found
 * 
 * @example
 * const pattern = findMatchingPattern('/dashboard/users/123');
 * // Result: '/dashboard/users/:id'
 */
export function findMatchingPattern(pathname: string): string | null {
  // Check for exact match first
  if (metadataConfig[pathname]) {
    return pathname;
  }

  // Find pattern match
  const pattern = Object.keys(metadataConfig).find((key) => {
    const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
    return regex.test(pathname);
  });

  return pattern || null;
}

/**
 * Generate canonical URL for a given pathname
 * 
 * Creates a fully qualified canonical URL to prevent duplicate content issues.
 * Handles both static and dynamic routes.
 * 
 * @param pathname - The route pathname
 * @param baseUrl - Optional base URL (defaults to NEXT_PUBLIC_APP_URL)
 * @returns Canonical URL string
 * 
 * @example
 * const canonical = generateCanonicalUrl('/dashboard/users');
 * // Result: 'https://example.com/dashboard/users'
 * 
 * @example
 * const canonical = generateCanonicalUrl('/dashboard/users/123', 'https://example.com');
 * // Result: 'https://example.com/dashboard/users/123'
 */
export function generateCanonicalUrl(pathname: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Remove trailing slash from base URL if present
  const cleanBase = base.replace(/\/$/, '');
  
  // Ensure pathname starts with /
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  
  // Remove query parameters and hash fragments for canonical URL
  const cleanPathname = cleanPath.split('?')[0].split('#')[0];
  
  return `${cleanBase}${cleanPathname}`;
}

/**
 * Check if a route should have a canonical URL
 * 
 * Some routes (like auth pages, error pages) should not have canonical URLs
 * or should have noindex robots directive.
 * 
 * @param pathname - The route pathname
 * @returns Boolean indicating if canonical URL should be included
 * 
 * @example
 * shouldHaveCanonical('/dashboard'); // true
 * shouldHaveCanonical('/login'); // false
 * shouldHaveCanonical('/404'); // false
 */
export function shouldHaveCanonical(pathname: string): boolean {
  const config = getMetadataForPath(pathname);
  
  // Don't add canonical if robots is set to noindex
  if (config.robots?.index === false) {
    return false;
  }
  
  // Don't add canonical for error pages
  const errorPages = ['/403', '/404', '/500'];
  if (errorPages.includes(pathname)) {
    return false;
  }
  
  // Don't add canonical for auth pages
  const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
  if (authPages.includes(pathname)) {
    return false;
  }
  
  return true;
}

/**
 * Generate metadata from custom page data
 * 
 * Creates dynamic values object from a custom page for use with metadata templates.
 * Handles featured images, meta fields, and determines indexing based on page status.
 * 
 * @param page - Custom page object from API
 * @returns Dynamic values for metadata template resolution
 * 
 * @example
 * const page = await fetchPageBySlug('about');
 * const dynamicValues = generatePageDynamicValues(page);
 * const metadata = generatePageMetadata('/:slug', dynamicValues);
 */
export function generatePageDynamicValues(page: {
  title: string;
  slug: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  featuredImage?: string | null;
  status: string;
  visibility: string;
}): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Use meta title if available, otherwise use page title
  const metaTitle = page.metaTitle || page.title;
  
  // Use meta description if available, otherwise use excerpt
  const metaDescription = page.metaDescription || page.excerpt || `Read more about ${page.title}`;
  
  // Handle featured image - use absolute URL if relative
  let featuredImage = page.featuredImage || '/og-image.svg';
  if (featuredImage && !featuredImage.startsWith('http')) {
    featuredImage = `${baseUrl}${featuredImage.startsWith('/') ? '' : '/'}${featuredImage}`;
  }
  
  // Parse keywords
  const keywords = page.metaKeywords || '';
  
  return {
    pageTitle: page.title,
    pageDescription: page.excerpt || metaDescription,
    pageMetaTitle: metaTitle,
    pageMetaDescription: metaDescription,
    pageKeywords: keywords,
    pageImage: featuredImage,
    pageSlug: page.slug,
  };
}

/**
 * Generate metadata for a custom page
 * 
 * Complete metadata generation for custom pages including SEO tags,
 * Open Graph, Twitter Cards, and robots directives based on page status.
 * 
 * @param page - Custom page object from API
 * @param pathname - The route pathname (e.g., '/about' or '/company/about')
 * @returns Next.js Metadata object
 * 
 * @example
 * const page = await fetchPageBySlug('about');
 * export async function generateMetadata() {
 *   return generateCustomPageMetadata(page, '/about');
 * }
 */
export function generateCustomPageMetadata(
  page: {
    title: string;
    slug: string;
    excerpt?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    featuredImage?: string | null;
    status: string;
    visibility: string;
    parentPage?: { slug: string } | null;
  },
  pathname: string
): Metadata {
  // Generate dynamic values from page data
  const dynamicValues = generatePageDynamicValues(page);
  
  // Determine the route pattern based on whether page has parent
  const pattern = page.parentPage ? '/:parentSlug/:slug' : '/:slug';
  
  // Generate base metadata using the pattern
  const metadata = generatePageMetadata(pattern, dynamicValues);
  
  // Override robots based on page status and visibility
  const shouldIndex = page.status === 'PUBLISHED' && page.visibility === 'PUBLIC';
  
  return {
    ...metadata,
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      noarchive: !shouldIndex,
      nosnippet: !shouldIndex,
      'max-image-preview': shouldIndex ? 'large' : undefined,
      'max-snippet': shouldIndex ? 160 : undefined,
    },
  };
}

/**
 * Generate breadcrumb items from custom page hierarchy
 * 
 * Creates breadcrumb array including parent pages for use with
 * breadcrumb components and structured data generation.
 * 
 * @param page - Custom page object with optional parent
 * @param slugPath - Array of slug segments from URL
 * @returns Array of breadcrumb items
 * 
 * @example
 * const page = await fetchPageBySlug(['company', 'about']);
 * const breadcrumbs = generatePageBreadcrumbs(page, ['company', 'about']);
 * // Result: [
 * //   { label: 'Home', href: '/' },
 * //   { label: 'Company', href: '/company' },
 * //   { label: 'About', href: '/company/about' }
 * // ]
 */
export function generatePageBreadcrumbs(
  page: {
    title: string;
    slug: string;
    parentPage?: { title: string; slug: string } | null;
  },
  slugPath?: string[]
): Array<{ label: string; href: string }> {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
  ];
  
  // Add parent page if exists
  if (page.parentPage) {
    breadcrumbs.push({
      label: page.parentPage.title,
      href: `/${page.parentPage.slug}`,
    });
  }
  
  // Build the href from slugPath or construct from page data
  const href = slugPath && slugPath.length > 0
    ? `/${slugPath.join('/')}`
    : page.parentPage
    ? `/${page.parentPage.slug}/${page.slug}`
    : `/${page.slug}`;
  
  // Add current page
  breadcrumbs.push({
    label: page.title,
    href,
  });
  
  return breadcrumbs;
}
