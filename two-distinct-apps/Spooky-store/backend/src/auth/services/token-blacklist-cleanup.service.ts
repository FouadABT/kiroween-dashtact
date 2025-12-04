import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { authConfig } from '../../config/auth.config';

/**
 * Token Blacklist Cleanup Service
 * 
 * Automatically removes expired tokens from the blacklist to prevent
 * the table from growing indefinitely.
 * 
 * Runs daily at midnight by default.
 */
@Injectable()
export class TokenBlacklistCleanupService {
  private readonly logger = new Logger(TokenBlacklistCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cleanup expired blacklisted tokens
   * Runs daily at midnight (00:00)
   * 
   * Can be manually triggered by calling this method
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    if (!authConfig.blacklistCleanup.enabled) {
      this.logger.debug('Token blacklist cleanup is disabled');
      return;
    }

    try {
      this.logger.log('Starting token blacklist cleanup...');

      const now = new Date();
      
      // Delete all tokens that have expired
      const result = await this.prisma.tokenBlacklist.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      this.logger.log(
        `Token blacklist cleanup completed. Removed ${result.count} expired tokens.`,
      );
    } catch (error) {
      this.logger.error(
        'Error during token blacklist cleanup',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Get statistics about the token blacklist
   * Useful for monitoring and debugging
   */
  async getBlacklistStats(): Promise<{
    total: number;
    expired: number;
    active: number;
  }> {
    const now = new Date();

    const [total, expired] = await Promise.all([
      this.prisma.tokenBlacklist.count(),
      this.prisma.tokenBlacklist.count({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      }),
    ]);

    return {
      total,
      expired,
      active: total - expired,
    };
  }

  /**
   * Manually trigger cleanup
   * Useful for testing or manual maintenance
   */
  async manualCleanup(): Promise<number> {
    const now = new Date();
    
    const result = await this.prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    this.logger.log(`Manual cleanup removed ${result.count} expired tokens`);
    
    return result.count;
  }
}
