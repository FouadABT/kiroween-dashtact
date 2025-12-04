/**
 * Search API Client
 * 
 * API client methods for global search operations.
 * Uses the centralized ApiClient for consistent authentication and error handling.
 */

import { ApiClient, ApiError, RateLimitError } from '@/lib/api';
import type {
  SearchQuery,
  QuickSearchQuery,
  SearchResult,
  PaginatedSearchResult,
} from '@/types/search';

/**
 * Search-specific error class
 */
export class SearchError extends ApiError {
  constructor(
    message: string,
    statusCode: number,
    public query?: string,
    response?: unknown
  ) {
    super(message, statusCode, response);
    this.name = 'SearchError';
  }
}

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Simple in-memory cache with TTL support
 */
class SearchCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get cached data if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton cache instance
const searchCache = new SearchCache();

// Periodically clean up expired entries (every 2 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    searchCache.clearExpired();
  }, 2 * 60 * 1000);
}

/**
 * Search API
 */
export const searchApi = {
  /**
   * Perform full search with pagination and filters
   * @param query Search query parameters
   * @param useCache Whether to use cached results (default: true)
   * @returns Paginated search results
   * @throws {SearchError} If search query is invalid
   * @throws {RateLimitError} If rate limit is exceeded
   * @throws {ApiError} For other API errors
   */
  async search(query: SearchQuery, useCache: boolean = true): Promise<PaginatedSearchResult> {
    try {
      // Validate query
      if (!query.q || query.q.trim().length === 0) {
        throw new SearchError('Search query cannot be empty', 400, query.q);
      }

      if (query.q.length > 200) {
        throw new SearchError('Search query too long (max 200 characters)', 400, query.q);
      }

      // Build query parameters
      const params: Record<string, string> = {
        q: query.q.trim(),
      };

      if (query.type && query.type !== 'all') {
        params.type = query.type;
      }

      if (query.page && query.page > 0) {
        params.page = query.page.toString();
      }

      if (query.limit && query.limit > 0 && query.limit <= 100) {
        params.limit = query.limit.toString();
      }

      if (query.sortBy) {
        params.sortBy = query.sortBy;
      }

      // Generate cache key
      const cacheKey = `search:${JSON.stringify(params)}`;

      // Check cache if enabled
      if (useCache) {
        const cached = searchCache.get<PaginatedSearchResult>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Make API request with authentication
      const result = await ApiClient.get<PaginatedSearchResult>('/search', params);

      // Validate response structure
      if (!result || !Array.isArray(result.results)) {
        throw new SearchError('Invalid search response format', 500, query.q);
      }

      // Cache the result
      if (useCache) {
        searchCache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      // Re-throw known error types
      if (error instanceof SearchError || error instanceof RateLimitError || error instanceof ApiError) {
        throw error;
      }

      // Wrap unknown errors
      throw new SearchError(
        error instanceof Error ? error.message : 'Search failed',
        500,
        query.q
      );
    }
  },

  /**
   * Quick search for Cmd+K dialog (top 8 results)
   * @param query Quick search query with just the search string
   * @param useCache Whether to use cached results (default: true)
   * @returns Array of top search results (max 8)
   * @throws {SearchError} If search query is invalid
   * @throws {RateLimitError} If rate limit is exceeded
   * @throws {ApiError} For other API errors
   */
  async quickSearch(query: QuickSearchQuery | string, useCache: boolean = true): Promise<SearchResult[]> {
    try {
      // Handle both object and string input
      const searchQuery = typeof query === 'string' ? query : query.q;

      // Validate query
      if (!searchQuery || searchQuery.trim().length === 0) {
        return []; // Return empty array for empty queries in quick search
      }

      if (searchQuery.length > 200) {
        throw new SearchError('Search query too long (max 200 characters)', 400, searchQuery);
      }

      // Generate cache key
      const cacheKey = `quickSearch:${searchQuery.trim()}`;

      // Check cache if enabled
      if (useCache) {
        const cached = searchCache.get<SearchResult[]>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Make API request with authentication
      const results = await ApiClient.get<SearchResult[]>('/search/quick', {
        q: searchQuery.trim(),
      });

      // Validate response structure
      if (!Array.isArray(results)) {
        throw new SearchError('Invalid quick search response format', 500, searchQuery);
      }

      // Cache the result
      if (useCache) {
        searchCache.set(cacheKey, results);
      }

      return results;
    } catch (error) {
      // Re-throw known error types
      if (error instanceof SearchError || error instanceof RateLimitError || error instanceof ApiError) {
        throw error;
      }

      // Wrap unknown errors
      const searchQuery = typeof query === 'string' ? query : query.q;
      throw new SearchError(
        error instanceof Error ? error.message : 'Quick search failed',
        500,
        searchQuery
      );
    }
  },

  /**
   * Clear search cache
   * Useful when user logs out or when data changes
   */
  clearCache(): void {
    searchCache.clear();
  },

  /**
   * Get cache statistics
   * Useful for debugging and monitoring
   */
  getCacheStats(): { size: number; keys: string[] } {
    return searchCache.getStats();
  },
};
