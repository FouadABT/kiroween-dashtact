/**
 * Notification Creation Helpers
 * 
 * Utility functions for creating common notification types.
 * Makes it easy for developers to send notifications throughout the application.
 */

import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * Helper interface for notification creation
 */
interface NotificationHelperOptions {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  requiredPermission?: string;
}

/**
 * Create a system notification
 * Used for system-level alerts and maintenance messages
 */
export function createSystemNotification(
  options: NotificationHelperOptions,
): CreateNotificationDto {
  return {
    userId: options.userId,
    title: options.title,
    message: options.message,
    category: 'SYSTEM' as any,
    priority: 'NORMAL' as any,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  };
}

/**
 * Create a user action notification
 * Used when a user performs an action that affects another user
 */
export function createUserActionNotification(
  options: NotificationHelperOptions,
): CreateNotificationDto {
  return {
    userId: options.userId,
    title: options.title,
    message: options.message,
    category: 'USER_ACTION' as any,
    priority: 'NORMAL' as any,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  };
}

/**
 * Create a security alert notification
 * Used for security-related events (login attempts, password changes, etc.)
 */
export function createSecurityAlertNotification(
  options: NotificationHelperOptions,
): CreateNotificationDto {
  return {
    userId: options.userId,
    title: options.title,
    message: options.message,
    category: 'SECURITY' as any,
    priority: 'HIGH' as any,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  };
}

/**
 * Create a billing notification
 * Used for payment, subscription, and billing-related events
 */
export function createBillingNotification(
  options: NotificationHelperOptions,
): CreateNotificationDto {
  return {
    userId: options.userId,
    title: options.title,
    message: options.message,
    category: 'BILLING' as any,
    priority: 'HIGH' as any,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  };
}

/**
 * Create a content notification
 * Used for content updates, new posts, comments, etc.
 */
export function createContentNotification(
  options: NotificationHelperOptions,
): CreateNotificationDto {
  return {
    userId: options.userId,
    title: options.title,
    message: options.message,
    category: 'CONTENT' as any,
    priority: 'NORMAL' as any,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  };
}

/**
 * Create a workflow notification
 * Used for workflow state changes, approvals, rejections, etc.
 */
export function createWorkflowNotification(
  options: NotificationHelperOptions,
): CreateNotificationDto {
  return {
    userId: options.userId,
    title: options.title,
    message: options.message,
    category: 'WORKFLOW' as any,
    priority: 'NORMAL' as any,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  };
}

/**
 * Create a social notification
 * Used for social interactions (follows, mentions, likes, etc.)
 */
export function createSocialNotification(
  options: NotificationHelperOptions,
): CreateNotificationDto {
  return {
    userId: options.userId,
    title: options.title,
    message: options.message,
    category: 'SOCIAL' as any,
    priority: 'LOW' as any,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  };
}

/**
 * Create an urgent notification
 * Used for critical alerts that require immediate attention
 */
export function createUrgentNotification(
  options: NotificationHelperOptions,
): CreateNotificationDto {
  return {
    userId: options.userId,
    title: options.title,
    message: options.message,
    category: 'SYSTEM' as any,
    priority: 'URGENT' as any,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  };
}

/**
 * Batch create notifications for multiple users
 * Useful for broadcasting notifications to a group of users
 */
export function createBatchNotifications(
  userIds: string[],
  options: Omit<NotificationHelperOptions, 'userId'>,
  category: any = 'SYSTEM',
  priority: any = 'NORMAL',
): CreateNotificationDto[] {
  return userIds.map((userId) => ({
    userId,
    title: options.title,
    message: options.message,
    category,
    priority,
    actionUrl: options.actionUrl,
    actionLabel: options.actionLabel,
    metadata: options.metadata,
    requiredPermission: options.requiredPermission,
  }));
}

/**
 * Example usage:
 * 
 * // In your service or controller:
 * import { createSecurityAlertNotification } from './notification-helpers';
 * 
 * // Send a security alert
 * const notification = createSecurityAlertNotification({
 *   userId: user.id,
 *   title: 'New Login Detected',
 *   message: 'A new login was detected from Chrome on Windows',
 *   actionUrl: '/dashboard/settings/security',
 *   actionLabel: 'Review Activity',
 *   metadata: {
 *     ip: '192.168.1.1',
 *     device: 'Chrome on Windows',
 *     location: 'New York, USA'
 *   }
 * });
 * 
 * await this.notificationsService.create(notification);
 */
