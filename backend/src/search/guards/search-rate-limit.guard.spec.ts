import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { SearchRateLimitGuard } from './search-rate-limit.guard';

describe('SearchRateLimitGuard', () => {
  let guard: SearchRateLimitGuard;

  beforeEach(() => {
    guard = new SearchRateLimitGuard();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const createMockContext = (userId: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
        }),
      }),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow request within rate limit', () => {
      const context = createMockContext('user-1');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(guard.getCurrentCount('user-1')).toBe(1);
    });

    it('should allow multiple requests up to limit', () => {
      const context = createMockContext('user-1');

      // Make 100 requests (the limit)
      for (let i = 0; i < 100; i++) {
        const result = guard.canActivate(context);
        expect(result).toBe(true);
      }

      expect(guard.getCurrentCount('user-1')).toBe(100);
    });

    it('should throw error when rate limit exceeded', () => {
      const context = createMockContext('user-1');

      // Make 100 requests (the limit)
      for (let i = 0; i < 100; i++) {
        guard.canActivate(context);
      }

      // 101st request should fail
      expect(() => guard.canActivate(context)).toThrow(HttpException);
      
      try {
        guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        
        const response = (error as HttpException).getResponse() as any;
        expect(response.message).toContain('rate limit exceeded');
        expect(response.limit).toBe(100);
      }
    });

    it('should track requests per user separately', () => {
      const context1 = createMockContext('user-1');
      const context2 = createMockContext('user-2');

      // User 1 makes 50 requests
      for (let i = 0; i < 50; i++) {
        guard.canActivate(context1);
      }

      // User 2 makes 50 requests
      for (let i = 0; i < 50; i++) {
        guard.canActivate(context2);
      }

      expect(guard.getCurrentCount('user-1')).toBe(50);
      expect(guard.getCurrentCount('user-2')).toBe(50);

      // Both users should still be able to make more requests
      expect(guard.canActivate(context1)).toBe(true);
      expect(guard.canActivate(context2)).toBe(true);
    });

    it('should reset count after time window expires', () => {
      const context = createMockContext('user-1');
      const config = guard.getConfig();

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        guard.canActivate(context);
      }

      expect(guard.getCurrentCount('user-1')).toBe(100);

      // Advance time past the window
      jest.advanceTimersByTime(config.windowMs + 1000);

      // Should be able to make requests again
      expect(guard.canActivate(context)).toBe(true);
      expect(guard.getCurrentCount('user-1')).toBe(1);
    });

    it('should allow request when no user in context', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: null,
          }),
        }),
      } as any;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow request when user has no id', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: {},
          }),
        }),
      } as any;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should include retry-after time in error response', () => {
      const context = createMockContext('user-1');

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        guard.canActivate(context);
      }

      try {
        guard.canActivate(context);
        fail('Should have thrown error');
      } catch (error) {
        const response = (error as HttpException).getResponse() as any;
        expect(response.retryAfter).toBeDefined();
        expect(response.windowMs).toBe(60 * 60 * 1000);
      }
    });

    it('should log warning when approaching rate limit', () => {
      const context = createMockContext('user-1');
      const logSpy = jest.spyOn(guard['logger'], 'warn');

      // Make 85 requests (85% of limit)
      for (let i = 0; i < 85; i++) {
        guard.canActivate(context);
      }

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('approaching rate limit'),
      );
    });
  });

  describe('getCurrentCount', () => {
    it('should return 0 for user with no requests', () => {
      expect(guard.getCurrentCount('user-1')).toBe(0);
    });

    it('should return correct count for user with requests', () => {
      const context = createMockContext('user-1');

      for (let i = 0; i < 10; i++) {
        guard.canActivate(context);
      }

      expect(guard.getCurrentCount('user-1')).toBe(10);
    });

    it('should exclude requests outside time window', () => {
      const context = createMockContext('user-1');
      const config = guard.getConfig();

      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        guard.canActivate(context);
      }

      // Advance time past window
      jest.advanceTimersByTime(config.windowMs + 1000);

      expect(guard.getCurrentCount('user-1')).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset rate limit for user', () => {
      const context = createMockContext('user-1');

      // Make some requests
      for (let i = 0; i < 50; i++) {
        guard.canActivate(context);
      }

      expect(guard.getCurrentCount('user-1')).toBe(50);

      guard.reset('user-1');

      expect(guard.getCurrentCount('user-1')).toBe(0);
    });

    it('should not affect other users', () => {
      const context1 = createMockContext('user-1');
      const context2 = createMockContext('user-2');

      // Both users make requests
      for (let i = 0; i < 50; i++) {
        guard.canActivate(context1);
        guard.canActivate(context2);
      }

      guard.reset('user-1');

      expect(guard.getCurrentCount('user-1')).toBe(0);
      expect(guard.getCurrentCount('user-2')).toBe(50);
    });
  });

  describe('getConfig', () => {
    it('should return rate limit configuration', () => {
      const config = guard.getConfig();

      expect(config.limit).toBe(100);
      expect(config.windowMs).toBe(60 * 60 * 1000);
    });
  });

  describe('cleanup', () => {
    it('should clean up old request records', () => {
      const context1 = createMockContext('user-1');
      const context2 = createMockContext('user-2');
      const config = guard.getConfig();

      // User 1 makes requests
      for (let i = 0; i < 10; i++) {
        guard.canActivate(context1);
      }

      // Advance time past window
      jest.advanceTimersByTime(config.windowMs + 1000);

      // User 2 makes requests (triggers cleanup)
      guard.canActivate(context2);

      // Manually trigger cleanup
      guard['cleanupOldRecords']();

      // User 1's records should be cleaned up
      expect(guard.getCurrentCount('user-1')).toBe(0);
      expect(guard.getCurrentCount('user-2')).toBe(1);
    });

    it('should log cleanup activity', () => {
      const context = createMockContext('user-1');
      const config = guard.getConfig();
      const logSpy = jest.spyOn(guard['logger'], 'log');

      // Make requests
      for (let i = 0; i < 10; i++) {
        guard.canActivate(context);
      }

      // Advance time past window
      jest.advanceTimersByTime(config.windowMs + 1000);

      // Trigger cleanup
      guard['cleanupOldRecords']();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cleaned up'),
      );
    });
  });

  describe('sliding window', () => {
    it('should implement sliding window correctly', () => {
      const context = createMockContext('user-1');
      const config = guard.getConfig();

      // Make 50 requests at time 0
      for (let i = 0; i < 50; i++) {
        guard.canActivate(context);
      }

      // Advance time by 30 minutes
      jest.advanceTimersByTime(30 * 60 * 1000);

      // Make 50 more requests
      for (let i = 0; i < 50; i++) {
        guard.canActivate(context);
      }

      // Should have 100 requests in window
      expect(guard.getCurrentCount('user-1')).toBe(100);

      // Advance time by another 31 minutes (total 61 minutes)
      jest.advanceTimersByTime(31 * 60 * 1000);

      // First 50 requests should be outside window now
      expect(guard.getCurrentCount('user-1')).toBe(50);

      // Should be able to make more requests
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
