/**
 * Metadata Cache Utility
 * 
 * Provides centralized caching for metadata operations with
 * cache invalidation, TTL support, and memory management.
 */

import { PageMetadata } from '@/types/metadata';
import { BreadcrumbItem } from './breadcrumb-helpers';

/**
 * Cache entry with timestamp for TTL support
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Cache configuration
 */
interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
};

/**
 * Generic cache class with TTL and size limits
 */
class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get value from cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  /**
   * Set value in cache
   * Automatically manages cache size
   */
  set(key: string, value: T): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    ttl: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }
}

/**
 * Metadata cache instances
 */
export const metadataCache = new Cache<PageMetadata>({
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
});

export const breadcrumbCache = new Cache<BreadcrumbItem[]>({
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
});

export const pathMetadataCache = new Cache<PageMetadata>({
  maxSize: 150,
  ttl: 10 * 60 * 1000, // 10 minutes (longer TTL for path lookups)
});

export const templateCache = new Cache<PageMetadata>({
  maxSize: 100,
  ttl: 3 * 60 * 1000, // 3 minutes
});

export const segmentFormatCache = new Cache<string>({
  maxSize: 200,
  ttl: 15 * 60 * 1000, // 15 minutes (very stable data)
});

/**
 * Cache invalidation utilities
 */
export const cacheInvalidation = {
  /**
   * Invalidate all metadata caches
   */
  invalidateAll(): void {
    metadataCache.clear();
    breadcrumbCache.clear();
    pathMetadataCache.clear();
    templateCache.clear();
    segmentFormatCache.clear();
  },

  /**
   * Invalidate caches for a specific path
   */
  invalidatePath(pathname: string): void {
    // Remove exact matches
    pathMetadataCache.delete(pathname);

    // Remove breadcrumb entries containing this path
    for (const key of breadcrumbCache.keys()) {
      if (key.startsWith(pathname)) {
        breadcrumbCache.delete(key);
      }
    }

    // Remove metadata entries for this path
    for (const key of metadataCache.keys()) {
      if (key.startsWith(pathname)) {
        metadataCache.delete(key);
      }
    }
  },

  /**
   * Invalidate caches for paths matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    // Check all cache keys against pattern
    for (const key of pathMetadataCache.keys()) {
      if (pattern.test(key)) {
        pathMetadataCache.delete(key);
      }
    }

    for (const key of breadcrumbCache.keys()) {
      const pathname = key.split('|')[0]; // Extract pathname from cache key
      if (pattern.test(pathname)) {
        breadcrumbCache.delete(key);
      }
    }

    for (const key of metadataCache.keys()) {
      const pathname = key.split('|')[0]; // Extract pathname from cache key
      if (pattern.test(pathname)) {
        metadataCache.delete(key);
      }
    }
  },

  /**
   * Clean up expired entries from all caches
   */
  cleanup(): {
    metadata: number;
    breadcrumb: number;
    pathMetadata: number;
    template: number;
    segmentFormat: number;
    total: number;
  } {
    const results = {
      metadata: metadataCache.cleanup(),
      breadcrumb: breadcrumbCache.cleanup(),
      pathMetadata: pathMetadataCache.cleanup(),
      template: templateCache.cleanup(),
      segmentFormat: segmentFormatCache.cleanup(),
      total: 0,
    };

    results.total = Object.values(results).reduce((sum, val) => sum + val, 0) - results.total;

    return results;
  },

  /**
   * Get statistics for all caches
   */
  getStats(): {
    metadata: ReturnType<Cache<PageMetadata>['getStats']>;
    breadcrumb: ReturnType<Cache<BreadcrumbItem[]>['getStats']>;
    pathMetadata: ReturnType<Cache<PageMetadata>['getStats']>;
    template: ReturnType<Cache<PageMetadata>['getStats']>;
    segmentFormat: ReturnType<Cache<string>['getStats']>;
  } {
    return {
      metadata: metadataCache.getStats(),
      breadcrumb: breadcrumbCache.getStats(),
      pathMetadata: pathMetadataCache.getStats(),
      template: templateCache.getStats(),
      segmentFormat: segmentFormatCache.getStats(),
    };
  },
};

/**
 * Automatic cleanup interval (runs every 5 minutes)
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    const results = cacheInvalidation.cleanup();
    
    if (process.env.NODE_ENV === 'development' && results.total > 0) {
      console.log('[Metadata Cache] Cleaned up expired entries:', results);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Export cache utilities for external use
 */
export { Cache };
export type { CacheEntry, CacheConfig };
