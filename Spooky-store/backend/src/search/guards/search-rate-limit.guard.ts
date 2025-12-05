import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * Rate limiting guard for search endpoints
 * Limits users to 100 search requests per hour
 */
@Injectable()
export class SearchRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(SearchRateLimitGuard.name);
  private readonly requests = new Map<string, number[]>();
  private readonly limit = 100;
  private readonly windowMs = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly cleanupIntervalMs = 5 * 60 * 1000; // Clean up every 5 minutes

  constructor() {
    // Start periodic cleanup of old request records
    this.startCleanupInterval();
  }

  /**
   * Check if request is within rate limit
   * @param context - Execution context
   * @returns True if request is allowed
   * @throws HttpException if rate limit exceeded
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user (shouldn't happen with JwtAuthGuard), allow request
    if (!user || !user.id) {
      this.logger.warn('Rate limit check skipped: No user in request');
      return true;
    }

    const userId = user.id;
    const now = Date.now();

    // Get user's request history
    const userRequests = this.requests.get(userId) || [];

    // Remove old requests outside the time window
    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    // Check if limit exceeded
    if (recentRequests.length >= this.limit) {
      const oldestRequest = Math.min(...recentRequests);
      const resetTime = new Date(oldestRequest + this.windowMs);
      
      this.logger.warn(
        `Rate limit exceeded for user ${userId}. ${recentRequests.length} requests in last hour.`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Search rate limit exceeded. Please try again later.',
          error: 'Too Many Requests',
          retryAfter: resetTime.toISOString(),
          limit: this.limit,
          windowMs: this.windowMs,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add current request timestamp
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);

    // Log rate limit status for monitoring
    if (recentRequests.length > this.limit * 0.8) {
      this.logger.warn(
        `User ${userId} approaching rate limit: ${recentRequests.length}/${this.limit} requests`,
      );
    }

    return true;
  }

  /**
   * Start periodic cleanup of old request records
   * Prevents memory leaks from inactive users
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupOldRecords();
    }, this.cleanupIntervalMs);
  }

  /**
   * Clean up old request records outside the time window
   */
  private cleanupOldRecords(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs,
      );

      if (recentRequests.length === 0) {
        // Remove user entirely if no recent requests
        this.requests.delete(userId);
        cleanedCount++;
      } else if (recentRequests.length < timestamps.length) {
        // Update with only recent requests
        this.requests.set(userId, recentRequests);
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(
        `Cleaned up ${cleanedCount} inactive user records from rate limiter`,
      );
    }
  }

  /**
   * Get current request count for a user (for testing/monitoring)
   * @param userId - User ID
   * @returns Current request count in time window
   */
  getCurrentCount(userId: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    return userRequests.filter((timestamp) => now - timestamp < this.windowMs)
      .length;
  }

  /**
   * Reset rate limit for a user (for testing/admin purposes)
   * @param userId - User ID
   */
  reset(userId: string): void {
    this.requests.delete(userId);
    this.logger.log(`Rate limit reset for user ${userId}`);
  }

  /**
   * Get rate limit configuration
   * @returns Rate limit settings
   */
  getConfig(): { limit: number; windowMs: number } {
    return {
      limit: this.limit,
      windowMs: this.windowMs,
    };
  }
}
