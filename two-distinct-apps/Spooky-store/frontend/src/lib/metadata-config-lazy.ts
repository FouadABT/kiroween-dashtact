/**
 * Lazy-loaded Metadata Configuration
 * 
 * This module provides dynamic imports for metadata configuration
 * to reduce initial bundle size. Metadata is loaded on-demand
 * based on route patterns.
 */

import { PageMetadata } from '@/types/metadata';
import { defaultMetadata } from './metadata-config';

/**
 * Route pattern groups for lazy loading
 */
type RouteGroup = 
  | 'auth'
  | 'dashboard'
  | 'users'
  | 'settings'
  | 'widgets'
  | 'errors';

/**
 * Cache for loaded metadata groups
 */
const loadedGroups = new Map<RouteGroup, Record<string, PageMetadata>>();

/**
 * Determine which route group a pathname belongs to
 */
function getRouteGroup(pathname: string): RouteGroup | null {
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password')) {
    return 'auth';
  }
  
  if (pathname.startsWith('/dashboard/users')) {
    return 'users';
  }
  
  if (pathname.startsWith('/dashboard/settings')) {
    return 'settings';
  }
  
  if (pathname.startsWith('/dashboard/widgets')) {
    return 'widgets';
  }
  
  if (pathname.startsWith('/dashboard')) {
    return 'dashboard';
  }
  
  if (pathname === '/403' || pathname === '/404' || pathname === '/500') {
    return 'errors';
  }
  
  return null;
}

/**
 * Lazy load metadata for a specific route group
 */
async function loadMetadataGroup(group: RouteGroup): Promise<Record<string, PageMetadata>> {
  // Check if already loaded
  const cached = loadedGroups.get(group);
  if (cached) {
    return cached;
  }

  // Dynamic import based on group
  let metadata: Record<string, PageMetadata>;

  switch (group) {
    case 'auth':
      metadata = (await import('./metadata-groups/auth')).authMetadata;
      break;
    case 'dashboard':
      metadata = (await import('./metadata-groups/dashboard')).dashboardMetadata;
      break;
    case 'users':
      metadata = (await import('./metadata-groups/users')).usersMetadata;
      break;
    case 'settings':
      metadata = (await import('./metadata-groups/settings')).settingsMetadata;
      break;
    case 'widgets':
      metadata = (await import('./metadata-groups/widgets')).widgetsMetadata;
      break;
    case 'errors':
      metadata = (await import('./metadata-groups/errors')).errorsMetadata;
      break;
    default:
      metadata = {};
  }

  // Cache the loaded metadata
  loadedGroups.set(group, metadata);
  
  return metadata;
}

/**
 * Get metadata for a path with lazy loading
 * 
 * @param pathname - The route pathname
 * @returns Promise resolving to merged metadata
 */
export async function getMetadataForPathLazy(pathname: string): Promise<PageMetadata> {
  const group = getRouteGroup(pathname);
  
  if (!group) {
    return defaultMetadata;
  }

  try {
    const groupMetadata = await loadMetadataGroup(group);
    
    // Exact match
    if (groupMetadata[pathname]) {
      return { ...defaultMetadata, ...groupMetadata[pathname] };
    }

    // Pattern match for dynamic routes
    const pattern = Object.keys(groupMetadata).find((key) => {
      const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
      return regex.test(pathname);
    });

    if (pattern) {
      return { ...defaultMetadata, ...groupMetadata[pattern] };
    }

    return defaultMetadata;
  } catch (error) {
    console.error(`Failed to load metadata for group: ${group}`, error);
    return defaultMetadata;
  }
}

/**
 * Preload metadata for specific route groups
 * Useful for prefetching metadata for likely navigation targets
 * 
 * @param groups - Array of route groups to preload
 */
export async function preloadMetadataGroups(groups: RouteGroup[]): Promise<void> {
  await Promise.all(groups.map(group => loadMetadataGroup(group)));
}

/**
 * Clear loaded metadata groups (useful for testing)
 */
export function clearLoadedGroups(): void {
  loadedGroups.clear();
}

/**
 * Get statistics about loaded groups
 */
export function getLoadedGroupsStats(): {
  loadedGroups: RouteGroup[];
  totalGroups: number;
  cacheSize: number;
} {
  return {
    loadedGroups: Array.from(loadedGroups.keys()),
    totalGroups: 6, // Total number of route groups
    cacheSize: loadedGroups.size,
  };
}
