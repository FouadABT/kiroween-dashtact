/**
 * Client-Side Metadata Helpers (Lightweight)
 * 
 * Minimal metadata utilities for client components.
 * Reduces bundle size by excluding server-only functionality.
 */

import { PageMetadata } from '@/types/metadata';

/**
 * Lightweight template resolver for client-side use
 * 
 * @param template - String with {placeholder} syntax
 * @param values - Object with placeholder values
 * @returns Resolved string
 */
export function resolveTemplate(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] || match);
}

/**
 * Resolve only title and description (most common use case)
 * Reduces bundle size by not processing all metadata fields
 * 
 * @param metadata - Metadata object
 * @param values - Dynamic values
 * @returns Metadata with resolved title and description
 */
export function resolveMetadataLight(
  metadata: Pick<PageMetadata, 'title' | 'description'>,
  values?: Record<string, string>
): Pick<PageMetadata, 'title' | 'description'> {
  if (!values) return metadata;

  return {
    title: metadata.title ? resolveTemplate(metadata.title, values) : metadata.title,
    description: metadata.description ? resolveTemplate(metadata.description, values) : metadata.description,
  };
}

/**
 * Extract pathname from URL (client-side utility)
 * 
 * @param url - Full URL or pathname
 * @returns Clean pathname
 */
export function extractPathname(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.pathname;
  } catch {
    // If URL parsing fails, assume it's already a pathname
    return url.split('?')[0].split('#')[0];
  }
}

/**
 * Format segment for display (lightweight version)
 * 
 * @param segment - URL segment
 * @returns Formatted label
 */
export function formatSegmentLight(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if metadata has dynamic values
 * 
 * @param metadata - Metadata object
 * @returns Boolean indicating if metadata contains templates
 */
export function hasTemplateValues(metadata: PageMetadata): boolean {
  const checkString = (str?: string) => str?.includes('{') ?? false;

  return (
    checkString(metadata.title) ||
    checkString(metadata.description) ||
    checkString(metadata.breadcrumb?.label) ||
    checkString(metadata.openGraph?.title) ||
    checkString(metadata.openGraph?.description)
  );
}

/**
 * Merge metadata objects (shallow merge)
 * 
 * @param base - Base metadata
 * @param override - Override metadata
 * @returns Merged metadata
 */
export function mergeMetadata(
  base: Partial<PageMetadata>,
  override: Partial<PageMetadata>
): Partial<PageMetadata> {
  return { ...base, ...override };
}

/**
 * Validate metadata object (basic validation)
 * 
 * @param metadata - Metadata to validate
 * @returns Boolean indicating if metadata is valid
 */
export function isValidMetadata(metadata: unknown): metadata is PageMetadata {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  const meta = metadata as Partial<PageMetadata>;
  
  // Must have at least title or description
  return !!(meta.title || meta.description);
}

/**
 * Get metadata field safely
 * 
 * @param metadata - Metadata object
 * @param field - Field name
 * @param fallback - Fallback value
 * @returns Field value or fallback
 */
export function getMetadataField<K extends keyof PageMetadata>(
  metadata: PageMetadata | null | undefined,
  field: K,
  fallback: PageMetadata[K]
): PageMetadata[K] {
  return metadata?.[field] ?? fallback;
}

/**
 * Create minimal metadata object
 * 
 * @param title - Page title
 * @param description - Page description
 * @returns Minimal metadata object
 */
export function createMinimalMetadata(
  title: string,
  description?: string
): Pick<PageMetadata, 'title' | 'description'> {
  return {
    title,
    description: description || '',
  };
}
