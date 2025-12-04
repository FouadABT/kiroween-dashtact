/**
 * Cache Utility
 * Provides localStorage-based caching with TTL (Time To Live)
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  /**
   * Set a cache entry with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 1 hour)
   */
  static set<T>(key: string, data: T, ttl: number = 3600000): void {
    if (typeof window === 'undefined') return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error(`Failed to set cache for key "${key}":`, error);
    }
  }

  /**
   * Get a cache entry if it exists and hasn't expired
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();

      // Check if cache has expired
      if (now - entry.timestamp > entry.ttl) {
        // Cache expired, remove it
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Failed to get cache for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove a cache entry
   * @param key Cache key
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove cache for key "${key}":`, error);
    }
  }

  /**
   * Check if a cache entry exists and is valid
   * @param key Cache key
   * @returns True if cache exists and hasn't expired
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache entries (or entries matching a pattern)
   * @param pattern Optional regex pattern to match keys
   */
  static clear(pattern?: RegExp): void {
    if (typeof window === 'undefined') return;

    try {
      if (pattern) {
        // Clear only matching keys
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (pattern.test(key)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        // Clear all
        localStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get the remaining TTL for a cache entry
   * @param key Cache key
   * @returns Remaining TTL in milliseconds, or null if not found
   */
  static getRemainingTTL(key: string): number | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const entry: CacheEntry<unknown> = JSON.parse(item);
      const now = Date.now();
      const elapsed = now - entry.timestamp;
      const remaining = entry.ttl - elapsed;

      return remaining > 0 ? remaining : null;
    } catch (error) {
      console.error(`Failed to get remaining TTL for key "${key}":`, error);
      return null;
    }
  }
}

// Cache keys
export const CACHE_KEYS = {
  THEME_SETTINGS: 'theme-settings',
  USER_SETTINGS: (userId: string) => `user-settings-${userId}`,
  GLOBAL_SETTINGS: 'global-settings',
} as const;

// Default TTL values (in milliseconds)
export const CACHE_TTL = {
  ONE_MINUTE: 60000,
  FIVE_MINUTES: 300000,
  FIFTEEN_MINUTES: 900000,
  ONE_HOUR: 3600000,
  ONE_DAY: 86400000,
} as const;
