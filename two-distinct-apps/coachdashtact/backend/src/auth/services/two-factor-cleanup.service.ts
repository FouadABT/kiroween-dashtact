import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterCronJob } from '../../cron-jobs/decorators/cron-job.decorator';

@Injectable()
export class TwoFactorCleanupService {
  private readonly logger = new Logger(TwoFactorCleanupService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Clean up expired 2FA codes
   * Runs every 6 hours to delete expired and verified codes
   */
  @RegisterCronJob({
    name: 'two-factor-token-cleanup',
    description: 'Removes expired and verified two-factor authentication codes',
    schedule: '0 */6 * * *', // Every 6 hours
    isLocked: true,
    notifyOnFailure: true,
  })
  async cleanupExpiredCodes(): Promise<void> {
    const now = new Date();

    // Delete codes that are either:
    // 1. Expired (expiresAt < now)
    // 2. Already verified (verified = true)
    const result = await this.prisma.twoFactorCode.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: now,
            },
          },
          {
            verified: true,
          },
        ],
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Cleaned up ${result.count} expired/verified 2FA codes`,
      );
    }
  }

  /**
   * Manual cleanup method for testing or manual execution
   */
  async manualCleanup(): Promise<{ expired: number; old: number }> {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const expiredResult = await this.prisma.twoFactorCode.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: now,
            },
          },
          {
            verified: true,
          },
        ],
      },
    });

    const oldResult = await this.prisma.twoFactorCode.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    this.logger.log(
      `Manual cleanup: ${expiredResult.count} expired, ${oldResult.count} old codes`,
    );

    return {
      expired: expiredResult.count,
      old: oldResult.count,
    };
  }
}
