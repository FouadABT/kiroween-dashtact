import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingSettingsService } from '../messaging-settings/messaging-settings.service';

@Injectable()
export class MessagingCleanupService {
  private readonly logger = new Logger(MessagingCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingSettingsService: MessagingSettingsService,
  ) {}

  /**
   * Run cleanup task daily at 2 AM
   */
  @Cron('0 2 * * *', {
    name: 'message-retention-cleanup',
    timeZone: 'UTC',
  })
  async handleMessageRetentionCleanup(): Promise<void> {
    this.logger.log('Starting message retention cleanup task');

    try {
      // Get retention settings
      const settings = await this.messagingSettingsService.getSettings();
      const retentionDays = settings.messageRetentionDays;

      if (retentionDays <= 0) {
        this.logger.log('Message retention is disabled (retention days <= 0)');
        return;
      }

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      this.logger.log(
        `Deleting messages older than ${retentionDays} days (before ${cutoffDate.toISOString()})`,
      );

      // Soft delete old messages
      const result = await this.prisma.message.updateMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          content: '[Message deleted by retention policy]',
        },
      });

      this.logger.log(
        `Message retention cleanup completed. Deleted ${result.count} messages`,
      );

      // Log cleanup operation for audit
      await this.logCleanupOperation(result.count, retentionDays, cutoffDate);
    } catch (error) {
      this.logger.error(
        `Message retention cleanup failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Log cleanup operation for audit purposes
   */
  private async logCleanupOperation(
    deletedCount: number,
    retentionDays: number,
    cutoffDate: Date,
  ): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          action: 'message_retention_cleanup',
          actorName: 'System',
          entityType: 'message',
          metadata: {
            deletedCount,
            retentionDays,
            cutoffDate: cutoffDate.toISOString(),
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log cleanup operation: ${error.message}`);
    }
  }

  /**
   * Manual cleanup trigger (for testing or admin use)
   */
  async triggerManualCleanup(): Promise<{ deletedCount: number }> {
    this.logger.log('Manual message retention cleanup triggered');

    const settings = await this.messagingSettingsService.getSettings();
    const retentionDays = settings.messageRetentionDays;

    if (retentionDays <= 0) {
      this.logger.log('Message retention is disabled');
      return { deletedCount: 0 };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.message.updateMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        content: '[Message deleted by retention policy]',
      },
    });

    await this.logCleanupOperation(result.count, retentionDays, cutoffDate);

    this.logger.log(`Manual cleanup completed. Deleted ${result.count} messages`);

    return { deletedCount: result.count };
  }
}
