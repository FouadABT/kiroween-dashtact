import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationWebSocketGateway } from './notification-websocket.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly websocketGateway: NotificationWebSocketGateway,
  ) {}

  /**
   * Get unread notification count
   */
  @Get('unread-count')
  @Permissions('notifications:read')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * Get all notifications for the current user
   */
  @Get()
  @Permissions('notifications:read')
  async findAll(
    @CurrentUser() user: any,
    @Query() filters: NotificationFiltersDto,
  ) {
    const result = await this.notificationsService.findAll(user.id, filters);

    // Filter by permissions
    const filteredNotifications =
      await this.notificationsService.filterByPermissions(
        result.notifications,
        user,
      );

    return {
      ...result,
      notifications: filteredNotifications,
    };
  }

  /**
   * Create a new notification (admin only)
   */
  @Post()
  @Permissions('notifications:write')
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  /**
   * Create a demo notification for testing
   */
  @Post('demo')
  @Permissions('notifications:read')
  async createDemo(@CurrentUser() user: any) {
    const demoNotification = await this.notificationsService.create({
      userId: user.id,
      title: 'Demo Notification',
      message: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
      category: 'SYSTEM',
      priority: 'NORMAL',
      actionUrl: '/dashboard/notifications',
      actionLabel: 'View All',
    });

    // Emit WebSocket event for real-time update
    this.websocketGateway.emitNotificationCreated(user.id, demoNotification);

    return demoNotification;
  }

  /**
   * Mark a notification as read
   */
  @Patch(':id/read')
  @Permissions('notifications:read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    const notification = await this.notificationsService.markAsRead(
      id,
      user.id,
    );

    // Emit WebSocket event for real-time update
    this.websocketGateway.emitNotificationRead(user.id, id);

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  @Patch('read-all')
  @Permissions('notifications:read')
  async markAllAsRead(@CurrentUser() user: any) {
    const count = await this.notificationsService.markAllAsRead(user.id);

    // Note: Individual read events will be emitted by the service
    // for each notification marked as read

    return { count };
  }

  /**
   * Clear all notifications
   * IMPORTANT: This specific route MUST come before the dynamic :id routes
   */
  @Delete('clear-all')
  @Permissions('notifications:read')
  async clearAll(@CurrentUser() user: any) {
    const count = await this.notificationsService.deleteAll(user.id);

    // Note: Individual deleted events will be emitted by the service
    // for each notification deleted

    return { count };
  }

  /**
   * Delete a notification
   */
  @Delete(':id')
  @Permissions('notifications:read')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    await this.notificationsService.delete(id, user.id);

    // Emit WebSocket event for real-time update
    this.websocketGateway.emitNotificationDeleted(user.id, id);

    return { message: 'Notification deleted successfully' };
  }

  /**
   * Get a single notification by ID
   * IMPORTANT: This route MUST be at the bottom to avoid catching specific routes
   * like /preferences, /demo, /unread-count as :id parameters
   */
  @Get(':id')
  @Permissions('notifications:read')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const notification = await this.notificationsService.findOne(id, user.id);

    // Check permission
    const filtered =  this.notificationsService.filterByPermissions(
      [notification],
      user,
    );

    if (filtered.length === 0) {
      throw new Error('You do not have permission to view this notification');
    }

    return notification;
  }
}
