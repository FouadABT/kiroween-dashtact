import { Injectable, Logger } from '@nestjs/common';

/**
 * In-memory cache service for notification system
 * Caches unread counts and other frequently accessed data
 */
@Injectable()
export class NotificationCacheService {
  private readonly logger = new Logger(NotificationCacheService.name);
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached value by key
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired for key: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit for key: ${key}`);
    return entry.value as T;
  }

  /**
   * Set cached value with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.DEFAULT_TTL);
    
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });

    this.logger.debug(`Cache set for key: ${key}, TTL: ${ttl || this.DEFAULT_TTL}ms`);
  }

  /**
   * Invalidate (delete) cached value
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache invalidated for key: ${key}`);
    }
  }

  /**
   * Invalidate all keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.logger.debug(`Cache invalidated ${count} keys matching pattern: ${pattern}`);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.debug(`Cache cleared, removed ${size} entries`);
  }

  /**
   * Get unread count for a user (convenience method)
   */
  getUnreadCount(userId: string): number | null {
    return this.get<number>(`unread:${userId}`);
  }

  /**
   * Set unread count for a user (convenience method)
   */
  setUnreadCount(userId: string, count: number, ttl?: number): void {
    this.set(`unread:${userId}`, count, ttl);
  }

  /**
   * Invalidate unread count for a user (convenience method)
   */
  invalidateUnreadCount(userId: string): void {
    this.invalidate(`unread:${userId}`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let expired = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      expired,
      active: this.cache.size - expired,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`Cache cleanup removed ${removed} expired entries`);
    }
  }
}

interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
}

interface CacheStats {
  size: number;
  expired: number;
  active: number;
}
