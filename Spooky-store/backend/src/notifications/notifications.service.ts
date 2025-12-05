import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import { NotificationCacheService } from './notification-cache.service';
import type { Notification } from '@prisma/client';

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page?: number;
  limit: number;
  unreadCount: number;
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: NotificationCacheService,
  ) {}

  /**
   * Create a new notification
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          title: dto.title,
          message: dto.message,
          category: dto.category,
          priority: dto.priority || 'NORMAL',
          channel: dto.channel || 'IN_APP',
          metadata: dto.metadata || undefined,
          actionUrl: dto.actionUrl,
          actionLabel: dto.actionLabel,
          imageUrl: dto.imageUrl,
          requiredPermission: dto.requiredPermission,
          scheduledFor: dto.scheduledFor,
        },
      });

      // Invalidate unread count cache since we created a new unread notification
      this.cacheService.invalidateUnreadCount(dto.userId);

      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all notifications for a user with filters and pagination
   * Supports both offset-based (page) and cursor-based pagination
   */
  async findAll(
    userId: string,
    filters: NotificationFiltersDto,
  ): Promise<PaginatedNotifications> {
    try {
      const limit = Math.min(filters.limit || 20, 50); // Max 50 per page
      const useCursor = !!filters.cursor;

      // Build where clause
      const where: any = {
        userId,
        deletedAt: null,
      };

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.isRead !== undefined) {
        where.isRead = filters.isRead;
      }

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }

      // Add cursor condition for cursor-based pagination
      if (useCursor && filters.cursor) {
        const cursorNotification = await this.prisma.notification.findUnique({
          where: { id: filters.cursor },
          select: { createdAt: true },
        });

        if (cursorNotification) {
          where.createdAt = {
            ...where.createdAt,
            lt: cursorNotification.createdAt,
          };
        }
      }

      // Get unread count from cache or database
      let unreadCount = this.cacheService.getUnreadCount(userId);
      if (unreadCount === null) {
        unreadCount = await this.prisma.notification.count({
          where: {
            userId,
            isRead: false,
            deletedAt: null,
          },
        });
        this.cacheService.setUnreadCount(userId, unreadCount);
      }

      if (useCursor) {
        // Cursor-based pagination
        const notifications = await this.prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit + 1, // Fetch one extra to check if there's more
          include: {
            actions: true,
          },
        });

        const hasMore = notifications.length > limit;
        const items = hasMore ? notifications.slice(0, -1) : notifications;
        const nextCursor = hasMore ? items[items.length - 1].id : null;

        return {
          notifications: items,
          total: 0, // Not calculated for cursor pagination
          limit,
          unreadCount,
          nextCursor,
          hasMore,
        };
      } else {
        // Offset-based pagination
        const page = filters.page || 1;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
          this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
              actions: true,
            },
          }),
          this.prisma.notification.count({ where }),
        ]);

        return {
          notifications,
          total,
          page,
          limit,
          unreadCount,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to fetch notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a single notification by ID
   */
  async findOne(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id },
        include: {
          actions: true,
        },
      });

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      if (notification.userId !== userId) {
        throw new ForbiddenException(
          'You do not have permission to access this notification',
        );
      }

      if (notification.deletedAt) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      return notification;
    } catch (error) {
      this.logger.error(`Failed to fetch notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    try {
      // First verify the notification exists and belongs to the user
      await this.findOne(id, userId);

      const result = await this.prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
        include: {
          actions: true,
        },
      });

      // Invalidate unread count cache
      this.cacheService.invalidateUnreadCount(userId);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to mark notification as read: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
          deletedAt: null,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      // Invalidate unread count cache
      this.cacheService.invalidateUnreadCount(userId);

      return result.count;
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Soft delete a notification
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      // First verify the notification exists and belongs to the user
      const notification = await this.findOne(id, userId);

      await this.prisma.notification.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      // Invalidate unread count cache if notification was unread
      if (!notification.isRead) {
        this.cacheService.invalidateUnreadCount(userId);
      }
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear all notifications for a user (soft delete)
   */
  async deleteAll(userId: string): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      // Invalidate unread count cache
      this.cacheService.invalidateUnreadCount(userId);

      return result.count;
    } catch (error) {
      this.logger.error(`Failed to clear all notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   * Uses cache for better performance
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      // Try to get from cache first
      let count = this.cacheService.getUnreadCount(userId);
      
      if (count === null) {
        // Cache miss - fetch from database
        count = await this.prisma.notification.count({
          where: {
            userId,
            isRead: false,
            deletedAt: null,
          },
        });
        
        // Store in cache
        this.cacheService.setUnreadCount(userId, count);
      }

      return count;
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
      throw error;
    }
  }

  /**
   * Filter notifications by user permissions
   */
  filterByPermissions(
    notifications: Notification[],
    user: UserProfile,
  ): Notification[] {
    return notifications.filter((notification) => {
      // If no permission required, show to everyone
      if (!notification.requiredPermission) {
        return true;
      }

      // Check if user has the required permission
      return (
        user.permissions.includes(notification.requiredPermission) ||
        user.permissions.includes('*:*')
      );
    });
  }
}
