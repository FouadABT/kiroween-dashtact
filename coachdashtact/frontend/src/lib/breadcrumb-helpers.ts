import { metadataConfig } from './metadata-config';
import { breadcrumbCache, segmentFormatCache } from './metadata-cache';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Generate cache key for breadcrumb memoization
 */
function getBreadcrumbCacheKey(pathname: string, dynamicValues?: Record<string, string>): string {
  return dynamicValues 
    ? `${pathname}|${JSON.stringify(dynamicValues)}`
    : pathname;
}

/**
 * Clear breadcrumb cache (useful for testing or when metadata config changes)
 */
export function clearBreadcrumbCache(): void {
  breadcrumbCache.clear();
}

/**
 * Generate breadcrumb items from pathname (memoized)
 */
export function generateBreadcrumbs(
  pathname: string,
  dynamicValues?: Record<string, string>
): BreadcrumbItem[] {
  if (process.env.NODE_ENV === 'development') {
    console.log('[generateBreadcrumbs] Called with:', { pathname, dynamicValues });
  }
  
  // Check cache first
  const cacheKey = getBreadcrumbCacheKey(pathname, dynamicValues);
  const cached = breadcrumbCache.get(cacheKey);
  
  if (cached) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[generateBreadcrumbs] Returning cached:', cached);
    }
    return cached;
  }

  try {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      
      // Get metadata for this path
      const metadata = getMetadataForSegment(currentPath);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[generateBreadcrumbs] Segment ${i}:`, {
          segment: segments[i],
          currentPath,
          metadata: metadata?.breadcrumb,
          hasMetadata: !!metadata
        });
      }
      
      // Skip hidden breadcrumb items
      if (metadata?.breadcrumb?.hidden) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[generateBreadcrumbs] Skipping hidden segment: ${currentPath}`);
        }
        continue;
      }
      
      let label = metadata?.breadcrumb?.label || formatSegment(segments[i]);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[generateBreadcrumbs] Label before template:`, label);
      }
      
      // Resolve dynamic labels
      if (dynamicValues && label.includes('{')) {
        const originalLabel = label;
        label = resolveTemplate(label, dynamicValues);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[generateBreadcrumbs] Template resolved:`, {
            original: originalLabel,
            resolved: label,
            dynamicValues
          });
        }
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[generateBreadcrumbs] Final breadcrumbs:', breadcrumbs);
    }
    
    // Cache the result
    breadcrumbCache.set(cacheKey, breadcrumbs);
    
    return breadcrumbs;
  } catch (error) {
    console.error('[generateBreadcrumbs] Error:', error);
    return [];
  }
}

/**
 * Get metadata for a path segment
 */
function getMetadataForSegment(path: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getMetadataForSegment] Looking for path: ${path}`);
  }
  
  // Try exact match
  if (metadataConfig[path]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getMetadataForSegment] Found exact match for: ${path}`);
    }
    return metadataConfig[path];
  }
  
  // Try pattern match for dynamic routes
  const pattern = Object.keys(metadataConfig).find(key => {
    const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
    const matches = regex.test(path);
    if (matches && process.env.NODE_ENV === 'development') {
      console.log(`[getMetadataForSegment] Pattern match: ${key} matches ${path}`);
    }
    return matches;
  });
  
  if (pattern) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getMetadataForSegment] Using pattern: ${pattern} for path: ${path}`);
    }
    return metadataConfig[pattern];
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getMetadataForSegment] No metadata found for: ${path}`);
  }
  return null;
}

/**
 * Format segment for display (memoized)
 * Converts kebab-case to Title Case
 */
export function formatSegment(segment: string): string {
  // Check cache first
  const cached = segmentFormatCache.get(segment);
  if (cached) {
    return cached;
  }

  const formatted = segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Cache the result
  segmentFormatCache.set(segment, formatted);

  return formatted;
}

/**
 * Resolve template string with dynamic values
 */
function resolveTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (!values[key]) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Template value not found: ${key}`);
      }
      return match; // Keep placeholder if value not found
    }
    return values[key];
  });
}

/**
 * Generate breadcrumbs with custom labels
 */
export function generateBreadcrumbsWithLabels(
  pathname: string,
  customLabels: Record<string, string>
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    
    const label = customLabels[currentPath] || formatSegment(segments[i]);
    
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }
  
  return breadcrumbs;
}

/**
 * Get breadcrumb label for a specific path
 */
export function getBreadcrumbLabel(
  pathname: string,
  dynamicValues?: Record<string, string>
): string {
  const metadata = getMetadataForSegment(pathname);
  
  if (!metadata?.breadcrumb?.label) {
    return formatSegment(pathname.split('/').pop() || '');
  }
  
  let label = metadata.breadcrumb.label;
  
  if (dynamicValues && label.includes('{')) {
    label = resolveTemplate(label, dynamicValues);
  }
  
  return label;
}
