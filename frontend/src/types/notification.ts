/**
 * Notification System Type Definitions
 * 
 * TypeScript interfaces for notification-related data structures
 * that correspond to the backend Prisma Notification models.
 */

/**
 * Notification category enumeration
 */
export enum NotificationCategory {
  SYSTEM = 'SYSTEM',
  USER_ACTION = 'USER_ACTION',
  SECURITY = 'SECURITY',
  BILLING = 'BILLING',
  CONTENT = 'CONTENT',
  WORKFLOW = 'WORKFLOW',
  SOCIAL = 'SOCIAL',
  CUSTOM = 'CUSTOM',
}

/**
 * Notification priority enumeration
 */
export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Notification channel enumeration
 */
export enum NotificationChannel {
  IN_APP = 'IN_APP',
}

/**
 * Delivery status enumeration
 */
export enum DeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
}

/**
 * Action type enumeration
 */
export enum ActionType {
  LINK = 'LINK',
  API_CALL = 'API_CALL',
  INLINE_FORM = 'INLINE_FORM',
  DISMISS = 'DISMISS',
}

/**
 * Notification interface matching the Prisma Notification model
 */
export interface Notification {
  /** Unique notification identifier */
  id: string;
  /** User ID this notification belongs to */
  userId: string;
  
  // Content
  /** Notification title */
  title: string;
  /** Notification message body */
  message: string;
  /** Notification category */
  category: NotificationCategory;
  /** Notification priority */
  priority: NotificationPriority;
  
  // Metadata
  /** Additional metadata as JSON */
  metadata?: Record<string, unknown> | null;
  /** Optional action URL */
  actionUrl?: string | null;
  /** Optional action button label */
  actionLabel?: string | null;
  /** Optional image URL */
  imageUrl?: string | null;
  
  // Channel
  /** Delivery channel */
  channel: NotificationChannel;
  
  // Status
  /** Whether notification has been read */
  isRead: boolean;
  /** Timestamp when notification was read */
  readAt?: string | null;
  /** Soft delete timestamp */
  deletedAt?: string | null;
  
  // Permissions
  /** Required permission to view this notification */
  requiredPermission?: string | null;
  
  // Timestamps
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Optional scheduled delivery time */
  scheduledFor?: string | null;
  
  // Relations
  /** Delivery logs for this notification */
  deliveryLogs?: NotificationDeliveryLog[];
  /** Actions associated with this notification */
  actions?: NotificationAction[];
}

/**
 * Notification preference interface matching the Prisma NotificationPreference model
 */
export interface NotificationPreference {
  /** Unique identifier */
  id: string;
  /** User ID */
  userId: string;
  
  // Category preferences
  /** Notification category */
  category: NotificationCategory;
  /** Whether notifications for this category are enabled */
  enabled: boolean;
  
  // Do Not Disturb
  /** Whether DND mode is enabled */
  dndEnabled: boolean;
  /** DND start time (HH:mm format) */
  dndStartTime?: string | null;
  /** DND end time (HH:mm format) */
  dndEndTime?: string | null;
  /** Days of week for DND (0=Sunday, 6=Saturday) */
  dndDays: number[];
  
  // Timestamps
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Notification template interface matching the Prisma NotificationTemplate model
 */
export interface NotificationTemplate {
  /** Unique identifier */
  id: string;
  /** Unique template key */
  key: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string | null;
  /** Template category */
  category: NotificationCategory;
  
  // Template content
  /** Template title (supports variables) */
  title: string;
  /** Template message (supports variables) */
  message: string;
  
  // Template variables
  /** Available variables for this template */
  variables: Record<string, unknown>;
  
  // Settings
  /** Default delivery channels */
  defaultChannels: NotificationChannel[];
  /** Default priority */
  defaultPriority: NotificationPriority;
  
  // Versioning
  /** Template version number */
  version: number;
  /** Whether template is active */
  isActive: boolean;
  
  // Timestamps
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Notification delivery log interface matching the Prisma NotificationDeliveryLog model
 */
export interface NotificationDeliveryLog {
  /** Unique identifier */
  id: string;
  /** Notification ID */
  notificationId: string;
  
  // Delivery details
  /** Delivery channel */
  channel: NotificationChannel;
  /** Delivery status */
  status: DeliveryStatus;
  /** Number of delivery attempts */
  attempts: number;
  
  // External IDs
  /** External service notification ID */
  externalId?: string | null;
  
  // Error tracking
  /** Error message if delivery failed */
  errorMessage?: string | null;
  /** Error code if delivery failed */
  errorCode?: string | null;
  
  // Timestamps
  /** When notification was sent */
  sentAt?: string | null;
  /** When notification was delivered */
  deliveredAt?: string | null;
  /** When delivery failed */
  failedAt?: string | null;
  /** When notification was opened */
  openedAt?: string | null;
  /** When notification action was clicked */
  clickedAt?: string | null;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Notification action interface matching the Prisma NotificationAction model
 */
export interface NotificationAction {
  /** Unique identifier */
  id: string;
  /** Notification ID */
  notificationId: string;
  
  // Action details
  /** Action button label */
  label: string;
  /** Type of action */
  actionType: ActionType;
  /** Action URL (for LINK and API_CALL types) */
  actionUrl?: string | null;
  /** HTTP method for API_CALL type */
  actionMethod?: string | null;
  /** Payload for API_CALL type */
  actionPayload?: Record<string, unknown> | null;
  
  // Styling
  /** Button variant (default, primary, destructive, etc.) */
  variant?: string | null;
  /** Optional icon name */
  icon?: string | null;
  
  // Status
  /** Whether action has been executed */
  isExecuted: boolean;
  /** When action was executed */
  executedAt?: string | null;
  /** User ID who executed the action */
  executedBy?: string | null;
  
  // Timestamps
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Webhook configuration interface matching the Prisma WebhookConfig model
 */
export interface WebhookConfig {
  /** Unique identifier */
  id: string;
  /** Optional user ID (null for global webhooks) */
  userId?: string | null;
  
  // Webhook details
  /** Webhook name */
  name: string;
  /** Webhook URL */
  url: string;
  /** Optional webhook secret for signature verification */
  secret?: string | null;
  
  // Filters
  /** Categories to trigger webhook */
  categories: NotificationCategory[];
  /** Priorities to trigger webhook */
  priorities: NotificationPriority[];
  
  // Settings
  /** Whether webhook is active */
  isActive: boolean;
  /** Number of retry attempts on failure */
  retryAttempts: number;
  
  // Timestamps
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Last time webhook was triggered */
  lastTriggeredAt?: string | null;
}

/**
 * Token blacklist interface matching the Prisma TokenBlacklist model
 */
export interface TokenBlacklist {
  /** Unique identifier */
  id: string;
  /** Blacklisted token */
  token: string;
  /** User ID who owned the token */
  userId: string;
  /** Token expiration timestamp */
  expiresAt: string;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Create notification data (matches backend CreateNotificationDto)
 */
export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  metadata?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  requiredPermission?: string;
  scheduledFor?: Date;
}

/**
 * Update notification data (matches backend UpdateNotificationDto)
 */
export interface UpdateNotificationData {
  isRead?: boolean;
}

/**
 * Create notification preference data
 */
export interface CreateNotificationPreferenceData {
  userId: string;
  category: NotificationCategory;
  enabled?: boolean;
  dndEnabled?: boolean;
  dndStartTime?: string;
  dndEndTime?: string;
  dndDays?: number[];
}

/**
 * Update notification preference data (matches backend UpdatePreferenceDto)
 */
export interface UpdateNotificationPreferenceData {
  enabled?: boolean;
  dndEnabled?: boolean;
  dndStartTime?: string;
  dndEndTime?: string;
  dndDays?: number[];
}

/**
 * DND settings data (matches backend DNDSettingsDto)
 */
export interface DNDSettingsData {
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: number[];
}

/**
 * Notification list response
 */
export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

/**
 * Notification query parameters (matches backend NotificationFiltersDto)
 */
export interface NotificationQueryParams {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Create notification template data (matches backend CreateTemplateDto)
 */
export interface CreateNotificationTemplateData {
  key: string;
  name: string;
  description?: string;
  category: NotificationCategory;
  title: string;
  message: string;
  variables?: string[];
  defaultChannels?: NotificationChannel[];
  defaultPriority?: NotificationPriority;
  isActive?: boolean;
}

/**
 * Update notification template data (matches backend UpdateTemplateDto)
 */
export interface UpdateNotificationTemplateData {
  key?: string;
  name?: string;
  description?: string;
  category?: NotificationCategory;
  title?: string;
  message?: string;
  variables?: string[];
  defaultChannels?: NotificationChannel[];
  defaultPriority?: NotificationPriority;
  isActive?: boolean;
}

/**
 * Template filters (matches backend TemplateFiltersDto)
 */
export interface TemplateFiltersParams {
  category?: NotificationCategory;
  isActive?: boolean;
  search?: string;
}

/**
 * Render template data (matches backend RenderTemplateDto)
 */
export interface RenderTemplateData {
  variables: Record<string, any>;
}

/**
 * Rendered template response
 */
export interface RenderedTemplate {
  title: string;
  message: string;
}
