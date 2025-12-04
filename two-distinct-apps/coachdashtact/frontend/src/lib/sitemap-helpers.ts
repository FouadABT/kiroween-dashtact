/**
 * Sitemap Helper Functions
 * 
 * Utilities for generating XML sitemaps for SEO optimization.
 */

import { metadataConfig } from './metadata-config';
import { featuresConfig } from '@/config/features.config';
import { CustomPage, PageStatus, PageVisibility } from '@/types/pages';

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Fetch published blog posts for sitemap
 * 
 * Fetches all published blog posts from the API to include in sitemap.
 * 
 * @returns Array of blog posts with slug and updatedAt
 */
async function fetchPublishedBlogPosts(): Promise<Array<{ slug: string; updatedAt: string }>> {
  // Only fetch if blog feature is enabled
  if (!featuresConfig.blog.enabled) {
    return [];
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/blog?limit=1000`, {
      next: { revalidate: 3600 }, // Revalidate every hour
      cache: 'no-store', // Don't cache during build
    });

    if (!response.ok) {
      // Silently return empty array during build
      return [];
    }

    const data = await response.json();
    return data.posts?.map((post: { slug: string; updatedAt: string }) => ({
      slug: post.slug,
      updatedAt: post.updatedAt,
    })) || [];
  } catch (error) {
    // Silently return empty array during build
    return [];
  }
}

/**
 * Fetch published products for sitemap
 * 
 * Fetches all published products from the storefront API to include in sitemap.
 * 
 * @returns Array of products with slug and updatedAt
 */
async function fetchPublishedProducts(): Promise<Array<{ slug: string; updatedAt: string }>> {
  // Only fetch if ecommerce feature is enabled
  if (!featuresConfig.ecommerce.enabled) {
    return [];
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/storefront/products?limit=1000`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      cache: 'no-store', // Don't cache during build
    });

    if (!response.ok) {
      // Silently return empty array during build
      return [];
    }

    const data = await response.json();
    return data.products?.map((product: { slug: string; updatedAt: string }) => ({
      slug: product.slug,
      updatedAt: product.updatedAt,
    })) || [];
  } catch (error) {
    // Silently return empty array during build
    return [];
  }
}

/**
 * Fetch product categories for sitemap
 * 
 * Fetches all product categories from the storefront API to include in sitemap.
 * 
 * @returns Array of categories with slug
 */
async function fetchProductCategories(): Promise<Array<{ slug: string }>> {
  // Only fetch if ecommerce feature is enabled
  if (!featuresConfig.ecommerce.enabled) {
    return [];
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/storefront/categories`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      console.error('Failed to fetch categories for sitemap');
      return [];
    }

    const data = await response.json();
    return data.map((category: { slug: string }) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

/**
 * Fetch published custom pages for sitemap
 * 
 * Fetches all published, public custom pages from the API to include in sitemap.
 * Excludes draft pages, private pages, and pages with robots noindex.
 * 
 * @returns Array of custom pages with slug, updatedAt, and hierarchy info
 */
async function fetchPublishedCustomPages(): Promise<Array<{ slug: string; updatedAt: string; parentPage?: { slug: string } | null }>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/pages?limit=1000`, {
      next: { revalidate: 3600 }, // Revalidate every hour
      cache: 'no-store', // Don't cache during build
    });

    if (!response.ok) {
      // Silently return empty array during build
      return [];
    }

    const data = await response.json();
    
    // Filter to only include published, public pages
    // Exclude pages with robots noindex (metaKeywords containing 'noindex')
    return (data.data || [])
      .filter((page: CustomPage) => {
        // Must be published
        if (page.status !== PageStatus.PUBLISHED) return false;
        
        // Must be public
        if (page.visibility !== PageVisibility.PUBLIC) return false;
        
        // Exclude pages with noindex in meta keywords
        if (page.metaKeywords?.includes('noindex')) return false;
        
        return true;
      })
      .map((page: CustomPage) => ({
        slug: page.slug,
        updatedAt: page.updatedAt,
        parentPage: page.parentPage ? { slug: page.parentPage.slug } : null,
      }));
  } catch (error) {
    // Silently return empty array during build
    return [];
  }
}

/**
 * Generate sitemap entries from metadata configuration
 * 
 * Creates sitemap entries for all routes that should be indexed by search engines.
 * Excludes routes with noindex robots directive.
 * Includes dynamic blog post routes if blog feature is enabled.
 * 
 * @param baseUrl - Base URL of the application
 * @returns Array of sitemap entries
 * 
 * @example
 * const entries = await generateSitemapEntries('https://example.com');
 */
export async function generateSitemapEntries(baseUrl: string): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  const cleanBase = baseUrl.replace(/\/$/, '');

  // Add static routes from metadata config
  for (const [path, config] of Object.entries(metadataConfig)) {
    // Skip dynamic routes (contain :param)
    if (path.includes(':')) {
      continue;
    }

    // Skip routes with noindex
    if (config.robots?.index === false) {
      continue;
    }

    // Determine change frequency based on route
    let changeFrequency: SitemapEntry['changeFrequency'] = 'weekly';
    let priority = 0.5;

    if (path === '/') {
      changeFrequency = 'daily';
      priority = 1.0;
    } else if (path === '/blog') {
      changeFrequency = 'daily';
      priority = 0.8;
    } else if (path === '/dashboard') {
      changeFrequency = 'daily';
      priority = 0.9;
    } else if (path.startsWith('/dashboard/analytics')) {
      changeFrequency = 'daily';
      priority = 0.8;
    } else if (path.startsWith('/dashboard/users')) {
      changeFrequency = 'weekly';
      priority = 0.7;
    } else if (path.startsWith('/dashboard/')) {
      changeFrequency = 'weekly';
      priority = 0.6;
    }

    entries.push({
      url: `${cleanBase}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    });
  }

  // Add blog post routes if blog feature is enabled
  if (featuresConfig.blog.enabled) {
    const blogPosts = await fetchPublishedBlogPosts();
    
    for (const post of blogPosts) {
      entries.push({
        url: `${cleanBase}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Add custom page routes
  const customPages = await fetchPublishedCustomPages();
  
  for (const page of customPages) {
    // Build URL based on hierarchy
    let pageUrl: string;
    if (page.parentPage) {
      // Nested page: /{parent-slug}/{child-slug}
      pageUrl = `${cleanBase}/${page.parentPage.slug}/${page.slug}`;
    } else {
      // Top-level page: /{slug}
      pageUrl = `${cleanBase}/${page.slug}`;
    }
    
    entries.push({
      url: pageUrl,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Add product routes if ecommerce feature is enabled
  if (featuresConfig.ecommerce.enabled) {
    const products = await fetchPublishedProducts();
    
    for (const product of products) {
      entries.push({
        url: `${cleanBase}/shop/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // Add category routes
    const categories = await fetchProductCategories();
    
    for (const category of categories) {
      entries.push({
        url: `${cleanBase}/shop/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  }

  return entries;
}

/**
 * Generate XML sitemap string
 * 
 * Creates a valid XML sitemap from sitemap entries.
 * 
 * @param entries - Array of sitemap entries
 * @returns XML sitemap string
 * 
 * @example
 * const entries = generateSitemapEntries('https://example.com');
 * const xml = generateSitemapXml(entries);
 */
export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const lastMod = entry.lastModified
        ? `\n    <lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : '';
      const changeFreq = entry.changeFrequency
        ? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
        : '';
      const priority = entry.priority !== undefined
        ? `\n    <priority>${entry.priority.toFixed(1)}</priority>`
        : '';

      return `  <url>
    <loc>${entry.url}</loc>${lastMod}${changeFreq}${priority}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Get routes that should be included in sitemap
 * 
 * Returns an array of route paths that should be indexed.
 * 
 * @returns Array of route paths
 * 
 * @example
 * const routes = getIndexableRoutes();
 * // Result: ['/', '/dashboard', '/dashboard/analytics', ...]
 */
export function getIndexableRoutes(): string[] {
  return Object.entries(metadataConfig)
    .filter(([path, config]) => {
      // Exclude dynamic routes
      if (path.includes(':')) return false;
      
      // Exclude noindex routes
      if (config.robots?.index === false) return false;
      
      return true;
    })
    .map(([path]) => path);
}
