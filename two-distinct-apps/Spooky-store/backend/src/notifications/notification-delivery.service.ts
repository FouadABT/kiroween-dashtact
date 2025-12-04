import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationWebSocketGateway } from './notification-websocket.gateway';
import {
  Notification,
  NotificationChannel,
  DeliveryStatus,
  NotificationDeliveryLog,
} from '@prisma/client';

@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly preferencesService: NotificationPreferencesService,
    @Inject(forwardRef(() => NotificationWebSocketGateway))
    private readonly websocketGateway: NotificationWebSocketGateway,
  ) {}

  /**
   * Main delivery orchestration method
   * Checks preferences, DND settings, and delivers notification
   */
  async deliver(notification: Notification): Promise<void> {
    try {
      this.logger.log(
        `Delivering notification ${notification.id} to user ${notification.userId}`,
      );

      // Check user preferences for this category
      const preferences = await this.checkPreferences(
        notification.userId,
        notification.category,
      );

      if (!preferences.enabled) {
        this.logger.log(
          `Notification category ${notification.category} disabled for user ${notification.userId}`,
        );
        await this.createDeliveryLog(
          notification.id,
          NotificationChannel.IN_APP,
          DeliveryStatus.FAILED,
          'Category disabled in user preferences',
        );
        return;
      }

      // Check Do Not Disturb settings
      const isInDND = await this.checkDND(notification.userId);

      if (isInDND && notification.priority !== 'URGENT') {
        this.logger.log(
          `User ${notification.userId} is in DND mode, skipping non-urgent notification`,
        );
        await this.createDeliveryLog(
          notification.id,
          NotificationChannel.IN_APP,
          DeliveryStatus.FAILED,
          'User in Do Not Disturb mode',
        );
        return;
      }

      // Deliver in-app notification
      await this.deliverInApp(notification);

      this.logger.log(`Successfully delivered notification ${notification.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to deliver notification ${notification.id}: ${error.message}`,
        error.stack,
      );
      await this.createDeliveryLog(
        notification.id,
        NotificationChannel.IN_APP,
        DeliveryStatus.FAILED,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Deliver in-app notification
   * Creates delivery log and sends via WebSocket if user is connected
   */
  async deliverInApp(notification: Notification): Promise<void> {
    try {
      this.logger.log(`Delivering in-app notification ${notification.id}`);

      // Create delivery log
      await this.createDeliveryLog(
        notification.id,
        NotificationChannel.IN_APP,
        DeliveryStatus.SENT,
      );

      // Send via WebSocket if user is connected
      if (this.websocketGateway.isUserConnected(notification.userId)) {
        this.websocketGateway.sendToUser(notification.userId, notification);
        this.logger.log(
          `Sent notification ${notification.id} via WebSocket to user ${notification.userId}`,
        );
      } else {
        this.logger.log(
          `User ${notification.userId} not connected, notification ${notification.id} stored for later retrieval`,
        );
      }

      this.logger.log(
        `In-app notification ${notification.id} delivered successfully`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to deliver in-app notification ${notification.id}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Check user preferences for notification category
   */
  async checkPreferences(
    userId: string,
    category: string,
  ): Promise<{ enabled: boolean }> {
    try {
      const preference = await this.preferencesService.getPreference(
        userId,
        category as any,
      );

      return {
        enabled: preference?.enabled ?? true, // Default to enabled if no preference
      };
    } catch (error) {
      this.logger.warn(
        `Failed to check preferences for user ${userId}, category ${category}: ${error.message}`,
      );
      // Default to enabled on error
      return { enabled: true };
    }
  }

  /**
   * Check if user is in Do Not Disturb period
   */
  async checkDND(userId: string): Promise<boolean> {
    try {
      return await this.preferencesService.isInDNDPeriod(userId);
    } catch (error) {
      this.logger.warn(
        `Failed to check DND status for user ${userId}: ${error.message}`,
      );
      // Default to not in DND on error
      return false;
    }
  }

  /**
   * Create delivery log entry
   */
  async createDeliveryLog(
    notificationId: string,
    channel: NotificationChannel,
    status: DeliveryStatus,
    errorMessage?: string,
  ): Promise<NotificationDeliveryLog> {
    try {
      const logData: any = {
        notificationId,
        channel,
        status,
        attempts: 1,
      };

      // Set timestamps based on status
      if (status === DeliveryStatus.SENT) {
        logData.sentAt = new Date();
      } else if (status === DeliveryStatus.DELIVERED) {
        logData.sentAt = new Date();
        logData.deliveredAt = new Date();
      } else if (status === DeliveryStatus.FAILED) {
        logData.failedAt = new Date();
        if (errorMessage) {
          logData.errorMessage = errorMessage;
        }
      }

      const log = await this.prisma.notificationDeliveryLog.create({
        data: logData,
      });

      this.logger.log(
        `Created delivery log ${log.id} for notification ${notificationId} with status ${status}`,
      );

      return log;
    } catch (error) {
      this.logger.error(
        `Failed to create delivery log for notification ${notificationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update delivery log status
   */
  async updateDeliveryLog(
    logId: string,
    status: DeliveryStatus,
    errorMessage?: string,
  ): Promise<NotificationDeliveryLog> {
    try {
      const updateData: any = {
        status,
        attempts: {
          increment: 1,
        },
      };

      // Set timestamps based on status
      if (status === DeliveryStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      } else if (status === DeliveryStatus.FAILED) {
        updateData.failedAt = new Date();
        if (errorMessage) {
          updateData.errorMessage = errorMessage;
        }
      } else if (status === DeliveryStatus.OPENED) {
        updateData.openedAt = new Date();
      } else if (status === DeliveryStatus.CLICKED) {
        updateData.clickedAt = new Date();
      }

      const log = await this.prisma.notificationDeliveryLog.update({
        where: { id: logId },
        data: updateData,
      });

      this.logger.log(`Updated delivery log ${logId} to status ${status}`);

      return log;
    } catch (error) {
      this.logger.error(
        `Failed to update delivery log ${logId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get delivery logs for a notification
   */
  async getDeliveryLogs(
    notificationId: string,
  ): Promise<NotificationDeliveryLog[]> {
    try {
      return await this.prisma.notificationDeliveryLog.findMany({
        where: { notificationId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get delivery logs for notification ${notificationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get delivery statistics for a user
   */
  async getDeliveryStats(userId: string): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  }> {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { userId },
        include: {
          deliveryLogs: true,
        },
      });

      const stats = {
        total: notifications.length,
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
      };

      notifications.forEach((notification) => {
        notification.deliveryLogs.forEach((log) => {
          if (log.status === DeliveryStatus.SENT) stats.sent++;
          if (log.status === DeliveryStatus.DELIVERED) stats.delivered++;
          if (log.status === DeliveryStatus.FAILED) stats.failed++;
          if (log.status === DeliveryStatus.OPENED) stats.opened++;
          if (log.status === DeliveryStatus.CLICKED) stats.clicked++;
        });
      });

      return stats;
    } catch (error) {
      this.logger.error(
        `Failed to get delivery stats for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
