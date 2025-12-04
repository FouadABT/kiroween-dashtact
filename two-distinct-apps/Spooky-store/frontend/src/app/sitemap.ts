import { MetadataRoute } from 'next';
import { generateSitemapEntries } from '@/lib/sitemap-helpers';

/**
 * Dynamic Sitemap Generation
 * 
 * Generates a sitemap.xml file for SEO optimization.
 * Includes all indexable routes and dynamic blog posts.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const entries = await generateSitemapEntries(baseUrl);
  
  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
