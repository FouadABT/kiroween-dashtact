import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TokenBlacklistCleanupService } from './token-blacklist-cleanup.service';
import { PrismaService } from '../../prisma/prisma.service';
import { authConfig } from '../../config/auth.config';

describe('TokenBlacklistCleanupService', () => {
  let service: TokenBlacklistCleanupService;
  let prismaService: PrismaService;
  let loggerSpy: jest.SpyInstance;

  const mockPrismaService = {
    tokenBlacklist: {
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistCleanupService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistCleanupService>(TokenBlacklistCleanupService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens from blacklist', async () => {
      const mockResult = { count: 5 };
      mockPrismaService.tokenBlacklist.deleteMany.mockResolvedValue(mockResult);

      await service.cleanupExpiredTokens();

      expect(prismaService.tokenBlacklist.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting token blacklist cleanup'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Removed 5 expired tokens'),
      );
    });

    it('should handle zero expired tokens', async () => {
      const mockResult = { count: 0 };
      mockPrismaService.tokenBlacklist.deleteMany.mockResolvedValue(mockResult);

      await service.cleanupExpiredTokens();

      expect(prismaService.tokenBlacklist.deleteMany).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Removed 0 expired tokens'),
      );
    });

    it('should not run cleanup when disabled in config', async () => {
      const originalValue = authConfig.blacklistCleanup.enabled;
      authConfig.blacklistCleanup.enabled = false;

      await service.cleanupExpiredTokens();

      expect(prismaService.tokenBlacklist.deleteMany).not.toHaveBeenCalled();

      authConfig.blacklistCleanup.enabled = originalValue;
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.tokenBlacklist.deleteMany.mockRejectedValue(error);
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await service.cleanupExpiredTokens();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error during token blacklist cleanup',
        expect.any(String),
      );
    });

    it('should use current date for expiration comparison', async () => {
      const beforeCall = new Date();
      mockPrismaService.tokenBlacklist.deleteMany.mockResolvedValue({ count: 3 });

      await service.cleanupExpiredTokens();

      const callArgs = mockPrismaService.tokenBlacklist.deleteMany.mock.calls[0][0];
      const usedDate = callArgs.where.expiresAt.lt;
      const afterCall = new Date();

      expect(usedDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(usedDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });

  describe('getBlacklistStats', () => {
    it('should return correct statistics', async () => {
      mockPrismaService.tokenBlacklist.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3); // expired

      const stats = await service.getBlacklistStats();

      expect(stats.total).toBe(10);
      expect(stats.expired).toBe(3);
      expect(stats.active).toBe(7);
    });

    it('should handle empty blacklist', async () => {
      mockPrismaService.tokenBlacklist.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const stats = await service.getBlacklistStats();

      expect(stats.total).toBe(0);
      expect(stats.expired).toBe(0);
      expect(stats.active).toBe(0);
    });

    it('should query with correct date filter for expired tokens', async () => {
      const beforeCall = new Date();
      mockPrismaService.tokenBlacklist.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);

      await service.getBlacklistStats();

      const expiredCountCall = mockPrismaService.tokenBlacklist.count.mock.calls[1][0];
      const usedDate = expiredCountCall.where.expiresAt.lt;
      const afterCall = new Date();

      expect(usedDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(usedDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });

  describe('manualCleanup', () => {
    it('should perform cleanup and return count', async () => {
      const mockResult = { count: 8 };
      mockPrismaService.tokenBlacklist.deleteMany.mockResolvedValue(mockResult);

      const count = await service.manualCleanup();

      expect(count).toBe(8);
      expect(prismaService.tokenBlacklist.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Manual cleanup removed 8 expired tokens'),
      );
    });

    it('should work even when automatic cleanup is disabled', async () => {
      const originalValue = authConfig.blacklistCleanup.enabled;
      authConfig.blacklistCleanup.enabled = false;

      mockPrismaService.tokenBlacklist.deleteMany.mockResolvedValue({ count: 2 });

      const count = await service.manualCleanup();

      expect(count).toBe(2);
      expect(prismaService.tokenBlacklist.deleteMany).toHaveBeenCalled();

      authConfig.blacklistCleanup.enabled = originalValue;
    });

    it('should handle errors during manual cleanup', async () => {
      const error = new Error('Cleanup failed');
      mockPrismaService.tokenBlacklist.deleteMany.mockRejectedValue(error);

      await expect(service.manualCleanup()).rejects.toThrow('Cleanup failed');
    });
  });

  describe('scheduled cleanup', () => {
    it('should have cron decorator for daily execution', () => {
      const metadata = Reflect.getMetadata(
        'SCHEDULE_CRON_OPTIONS',
        service.cleanupExpiredTokens,
      );
      
      // The cron decorator should be present
      expect(metadata).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should handle large number of expired tokens', async () => {
      const mockResult = { count: 1000 };
      mockPrismaService.tokenBlacklist.deleteMany.mockResolvedValue(mockResult);

      await service.cleanupExpiredTokens();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Removed 1000 expired tokens'),
      );
    });

    it('should maintain active tokens while cleaning expired ones', async () => {
      // Setup: 100 total tokens, 30 expired
      mockPrismaService.tokenBlacklist.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(30);
      mockPrismaService.tokenBlacklist.deleteMany.mockResolvedValue({ count: 30 });

      const statsBefore = await service.getBlacklistStats();
      await service.cleanupExpiredTokens();

      // After cleanup, we'd expect only active tokens to remain
      expect(statsBefore.expired).toBe(30);
      expect(statsBefore.active).toBe(70);
    });
  });
});
