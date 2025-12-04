import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationChannel,
  NotificationCategory,
  DeliveryStatus,
} from '@prisma/client';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface NotificationMetrics {
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  averageTimeToOpen: number; // in seconds
  deliverySuccessRate: number;
}

export interface CategoryStats {
  category: NotificationCategory;
  count: number;
  openRate: number;
  clickRate: number;
}

export interface ChannelPerformance {
  channel: NotificationChannel;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  successRate: number;
  openRate: number;
  clickRate: number;
}

@Injectable()
export class NotificationAnalyticsService {
  private readonly logger = new Logger(NotificationAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track notification delivery event
   */
  async trackDelivery(
    notificationId: string,
    channel: NotificationChannel,
    status: DeliveryStatus,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.prisma.notificationDeliveryLog.create({
        data: {
          notificationId,
          channel,
          status,
          errorMessage,
          sentAt: status === DeliveryStatus.SENT ? new Date() : null,
          deliveredAt: status === DeliveryStatus.DELIVERED ? new Date() : null,
          failedAt: status === DeliveryStatus.FAILED ? new Date() : null,
          attempts: 1,
        },
      });

      this.logger.log(
        `Tracked delivery: notification=${notificationId}, channel=${channel}, status=${status}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to track delivery: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Track notification open event
   */
  async trackOpen(notificationId: string): Promise<void> {
    try {
      // Update notification read status
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      // Update delivery log
      await this.prisma.notificationDeliveryLog.updateMany({
        where: {
          notificationId,
          openedAt: null,
        },
        data: {
          openedAt: new Date(),
          status: DeliveryStatus.OPENED,
        },
      });

      this.logger.log(`Tracked open: notification=${notificationId}`);
    } catch (error) {
      this.logger.error(`Failed to track open: ${error.message}`, error.stack);
    }
  }

  /**
   * Track notification action click event
   */
  async trackClick(notificationId: string, actionId?: string): Promise<void> {
    try {
      // Update delivery log
      await this.prisma.notificationDeliveryLog.updateMany({
        where: {
          notificationId,
          clickedAt: null,
        },
        data: {
          clickedAt: new Date(),
          status: DeliveryStatus.CLICKED,
        },
      });

      // If action ID provided, mark action as executed
      if (actionId) {
        await this.prisma.notificationAction.update({
          where: { id: actionId },
          data: {
            isExecuted: true,
            executedAt: new Date(),
          },
        });
      }

      this.logger.log(
        `Tracked click: notification=${notificationId}, action=${actionId || 'none'}`,
      );
    } catch (error) {
      this.logger.error(`Failed to track click: ${error.message}`, error.stack);
    }
  }

  /**
   * Get notification metrics for a user
   */
  async getMetrics(
    userId: string,
    dateRange: DateRange,
  ): Promise<NotificationMetrics> {
    try {
      const { startDate, endDate } = dateRange;

      // Get all notifications in date range
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          deliveryLogs: true,
        },
      });

      // Calculate metrics
      const totalDelivered = notifications.length;
      const totalOpened = notifications.filter((n) => n.isRead).length;

      // Count clicks from delivery logs
      const totalClicked = await this.prisma.notificationDeliveryLog.count({
        where: {
          notification: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          clickedAt: { not: null },
        },
      });

      // Calculate rates
      const openRate = totalDelivered > 0 ? totalOpened / totalDelivered : 0;
      const clickRate = totalOpened > 0 ? totalClicked / totalOpened : 0;

      // Calculate average time to open
      const openedNotifications = notifications.filter(
        (n) => n.isRead && n.readAt,
      );
      const totalTimeToOpen = openedNotifications.reduce((sum, n) => {
        const timeToOpen =
          (n.readAt!.getTime() - n.createdAt.getTime()) / 1000;
        return sum + timeToOpen;
      }, 0);
      const averageTimeToOpen =
        openedNotifications.length > 0
          ? totalTimeToOpen / openedNotifications.length
          : 0;

      // Calculate delivery success rate
      const deliveryLogs = await this.prisma.notificationDeliveryLog.findMany({
        where: {
          notification: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      });

      const successfulDeliveries = deliveryLogs.filter(
        (log) =>
          log.status === DeliveryStatus.DELIVERED ||
          log.status === DeliveryStatus.SENT ||
          log.status === DeliveryStatus.OPENED ||
          log.status === DeliveryStatus.CLICKED,
      ).length;

      const deliverySuccessRate =
        deliveryLogs.length > 0 ? successfulDeliveries / deliveryLogs.length : 0;

      return {
        totalDelivered,
        totalOpened,
        totalClicked,
        openRate,
        clickRate,
        averageTimeToOpen,
        deliverySuccessRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(dateRange: DateRange): Promise<CategoryStats[]> {
    try {
      const { startDate, endDate } = dateRange;

      // Get all categories
      const categories = Object.values(NotificationCategory);

      const stats: CategoryStats[] = [];

      for (const category of categories) {
        // Count notifications by category
        const notifications = await this.prisma.notification.findMany({
          where: {
            category,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            deliveryLogs: true,
          },
        });

        const count = notifications.length;
        const opened = notifications.filter((n) => n.isRead).length;

        // Count clicks
        const clicked = await this.prisma.notificationDeliveryLog.count({
          where: {
            notification: {
              category,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            clickedAt: { not: null },
          },
        });

        const openRate = count > 0 ? opened / count : 0;
        const clickRate = opened > 0 ? clicked / opened : 0;

        stats.push({
          category,
          count,
          openRate,
          clickRate,
        });
      }

      return stats.sort((a, b) => b.count - a.count);
    } catch (error) {
      this.logger.error(
        `Failed to get category stats: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get channel performance metrics
   */
  async getChannelPerformance(
    dateRange: DateRange,
  ): Promise<ChannelPerformance[]> {
    try {
      const { startDate, endDate } = dateRange;

      // Get all channels
      const channels = Object.values(NotificationChannel);

      const performance: ChannelPerformance[] = [];

      for (const channel of channels) {
        // Get delivery logs for this channel
        const logs = await this.prisma.notificationDeliveryLog.findMany({
          where: {
            channel,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const delivered = logs.filter(
          (log) =>
            log.status === DeliveryStatus.DELIVERED ||
            log.status === DeliveryStatus.SENT ||
            log.status === DeliveryStatus.OPENED ||
            log.status === DeliveryStatus.CLICKED,
        ).length;

        const failed = logs.filter(
          (log) => log.status === DeliveryStatus.FAILED,
        ).length;

        const opened = logs.filter((log) => log.openedAt !== null).length;

        const clicked = logs.filter((log) => log.clickedAt !== null).length;

        const total = logs.length;
        const successRate = total > 0 ? delivered / total : 0;
        const openRate = delivered > 0 ? opened / delivered : 0;
        const clickRate = opened > 0 ? clicked / opened : 0;

        performance.push({
          channel,
          delivered,
          failed,
          opened,
          clicked,
          successRate,
          openRate,
          clickRate,
        });
      }

      return performance.sort((a, b) => b.delivered - a.delivered);
    } catch (error) {
      this.logger.error(
        `Failed to get channel performance: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
