import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationCategory, NotificationPriority } from '@prisma/client';

@Injectable()
export class MessagingNotificationService {
  private readonly logger = new Logger(MessagingNotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create notification for new message
   */
  async createMessageNotification(
    recipientId: string,
    senderId: string,
    conversationId: string,
    messageContent: string,
    conversationName?: string,
  ): Promise<void> {
    try {
      // Check if recipient has notifications enabled for SOCIAL category
      const preference = await this.prisma.notificationPreference.findUnique({
        where: {
          userId_category: {
            userId: recipientId,
            category: NotificationCategory.SOCIAL,
          },
        },
      });

      // Skip if notifications are disabled
      if (preference && !preference.enabled) {
        this.logger.log(`Notifications disabled for user ${recipientId}`);
        return;
      }

      // Check Do Not Disturb settings
      if (preference && preference.dndEnabled) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

        if (
          preference.dndStartTime &&
          preference.dndEndTime &&
          preference.dndDays.includes(currentDay)
        ) {
          if (
            currentTime >= preference.dndStartTime &&
            currentTime <= preference.dndEndTime
          ) {
            this.logger.log(
              `User ${recipientId} is in Do Not Disturb mode`,
            );
            return;
          }
        }
      }

      // Get sender information
      const sender = await this.prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true, email: true },
      });

      const senderName = sender?.name || sender?.email || 'Someone';

      // Create message preview (first 50 characters)
      const messagePreview = messageContent.length > 50
        ? `${messageContent.substring(0, 50)}...`
        : messageContent;

      // Determine conversation display name
      const displayName = conversationName || senderName;

      // Create notification
      await this.prisma.notification.create({
        data: {
          userId: recipientId,
          title: `New message from ${senderName}`,
          message: messagePreview,
          category: NotificationCategory.SOCIAL,
          priority: NotificationPriority.NORMAL,
          actionUrl: `/dashboard/messages/${conversationId}`,
          actionLabel: 'View Message',
          metadata: {
            conversationId,
            senderId,
            senderName,
            conversationName: displayName,
          },
        },
      });

      this.logger.log(
        `Created message notification for user ${recipientId} from ${senderName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create message notification: ${error.message}`,
      );
    }
  }
}
