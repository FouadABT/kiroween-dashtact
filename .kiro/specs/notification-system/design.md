# Notification System Design Document

## Overview

The notification system is a comprehensive, production-ready solution for managing multi-channel notifications in the dashboard starter kit. It provides real-time in-app notifications, email delivery, push notifications, SMS, and webhooks, with flexible categorization, user preferences, permission-based filtering, and analytics.

### Key Features

- **In-App Notifications**: Real-time notification center with badge counts
- **Real-Time Updates**: WebSocket-based instant notification delivery
- **Permission Integration**: Seamless integration with JWT auth and permission system
- **User Preferences**: Granular control over notification types and categories
- **Template System**: Reusable templates with variable substitution
- **Analytics**: Basic tracking and reporting
- **Accessibility**: WCAG 2.1 AA compliant UI components
- **Zero External Dependencies**: Works out of the box with existing PostgreSQL database

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  NotificationContext  │  NotificationCenter  │  Settings UI  │
│  WebSocket Client     │  Toast Notifications │  Preferences  │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                     Backend (NestJS)                         │
├─────────────────────────────────────────────────────────────┤
│  NotificationsModule  │  WebSocketGateway  │  QueueService   │
│  TemplateEngine       │  DeliveryService   │  AnalyticsService│
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  notifications  │  notification_preferences  │  templates    │
│  delivery_logs  │  notification_actions      │  webhooks     │
└─────────────────────────────────────────────────────────────┘
                              ↕

```

### Technology Stack

**Backend**:
- NestJS framework
- Prisma ORM
- PostgreSQL database
- Socket.IO for WebSocket

**Frontend**:
- Next.js 14 with App Router
- React Context for state management
- Socket.IO client for real-time
- Tailwind CSS + shadcn/ui components
- React Query for data fetching



## Data Models

### Database Schema


#### Notification Model

```prisma
model Notification {
  id                String                 @id @default(cuid())
  userId            String                 @map("user_id")
  user              User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Content
  title             String
  message           String                 @db.Text
  category          NotificationCategory
  priority          NotificationPriority   @default(NORMAL)
  
  // Metadata
  metadata          Json?                  // Flexible JSON for custom data
  actionUrl         String?                @map("action_url")
  actionLabel       String?                @map("action_label")
  imageUrl          String?                @map("image_url")
  
  // Channel (always IN_APP for starter kit)
  channel           NotificationChannel    @default(IN_APP)
  
  // Status
  isRead            Boolean                @default(false) @map("is_read")
  readAt            DateTime?              @map("read_at")
  deletedAt         DateTime?              @map("deleted_at")
  
  // Permissions
  requiredPermission String?               @map("required_permission")
  
  // Timestamps
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  scheduledFor      DateTime?              @map("scheduled_for")
  
  // Relations
  deliveryLogs      NotificationDeliveryLog[]
  actions           NotificationAction[]
  
  @@index([userId])
  @@index([category])
  @@index([priority])
  @@index([isRead])
  @@index([createdAt])
  @@index([scheduledFor])
  @@map("notifications")
}

enum NotificationCategory {
  SYSTEM
  USER_ACTION
  SECURITY
  BILLING
  CONTENT
  WORKFLOW
  SOCIAL
  CUSTOM
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum NotificationChannel {
  IN_APP
}
```

#### Notification Preferences Model

```prisma
model NotificationPreference {
  id                String                 @id @default(cuid())
  userId            String                 @map("user_id")
  user              User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Category preferences
  category          NotificationCategory
  enabled           Boolean                @default(true)
  
  // Do Not Disturb
  dndEnabled        Boolean                @default(false) @map("dnd_enabled")
  dndStartTime      String?                @map("dnd_start_time") // HH:MM format
  dndEndTime        String?                @map("dnd_end_time")   // HH:MM format
  dndDays           Int[]                  @default([]) @map("dnd_days") // 0-6 (Sun-Sat)
  
  // Timestamps
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  
  @@unique([userId, category])
  @@index([userId])
  @@map("notification_preferences")
}


```


#### Notification Template Model

```prisma
model NotificationTemplate {
  id                String                 @id @default(cuid())
  key               String                 @unique
  name              String
  description       String?
  category          NotificationCategory
  
  // Template content
  title             String
  message           String                 @db.Text
  
  // Template variables
  variables         Json                   // Array of variable names
  
  // Settings
  defaultChannels   NotificationChannel[]  @default([IN_APP]) @map("default_channels")
  defaultPriority   NotificationPriority   @default(NORMAL) @map("default_priority")
  
  // Versioning
  version           Int                    @default(1)
  isActive          Boolean                @default(true) @map("is_active")
  
  // Timestamps
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  
  @@index([key])
  @@index([category])
  @@map("notification_templates")
}
```

#### Delivery Log Model

```prisma
model NotificationDeliveryLog {
  id                String                 @id @default(cuid())
  notificationId    String                 @map("notification_id")
  notification      Notification           @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  
  // Delivery details
  channel           NotificationChannel
  status            DeliveryStatus         @default(PENDING)
  attempts          Int                    @default(0)
  
  // External IDs
  externalId        String?                @map("external_id") // Email ID, Push token, etc.
  
  // Error tracking
  errorMessage      String?                @db.Text @map("error_message")
  errorCode         String?                @map("error_code")
  
  // Timestamps
  sentAt            DateTime?              @map("sent_at")
  deliveredAt       DateTime?              @map("delivered_at")
  failedAt          DateTime?              @map("failed_at")
  openedAt          DateTime?              @map("opened_at")
  clickedAt         DateTime?              @map("clicked_at")
  createdAt         DateTime               @default(now()) @map("created_at")
  
  @@index([notificationId])
  @@index([channel])
  @@index([status])
  @@map("notification_delivery_logs")
}

enum DeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  OPENED
  CLICKED
}
```

#### Notification Action Model

```prisma
model NotificationAction {
  id                String                 @id @default(cuid())
  notificationId    String                 @map("notification_id")
  notification      Notification           @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  
  // Action details
  label             String
  actionType        ActionType             @map("action_type")
  actionUrl         String?                @map("action_url")
  actionMethod      String?                @default("GET") @map("action_method")
  actionPayload     Json?                  @map("action_payload")
  
  // Styling
  variant           String?                @default("default") // primary, secondary, destructive
  icon              String?
  
  // Status
  isExecuted        Boolean                @default(false) @map("is_executed")
  executedAt        DateTime?              @map("executed_at")
  executedBy        String?                @map("executed_by")
  
  // Timestamps
  createdAt         DateTime               @default(now()) @map("created_at")
  
  @@index([notificationId])
  @@map("notification_actions")
}

enum ActionType {
  LINK
  API_CALL
  INLINE_FORM
  DISMISS
}
```


#### Webhook Configuration Model

```prisma
model WebhookConfig {
  id                String                 @id @default(cuid())
  userId            String?                @map("user_id")
  user              User?                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Webhook details
  name              String
  url               String
  secret            String?                // For signature verification
  
  // Filters
  categories        NotificationCategory[] @default([])
  priorities        NotificationPriority[] @default([])
  
  // Settings
  isActive          Boolean                @default(true) @map("is_active")
  retryAttempts     Int                    @default(3) @map("retry_attempts")
  
  // Timestamps
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  lastTriggeredAt   DateTime?              @map("last_triggered_at")
  
  @@index([userId])
  @@map("webhook_configs")
}
```



### User Model Extension

Add these relations to the existing User model:

```prisma
model User {
  // ... existing fields ...
  
  notifications           Notification[]
  notificationPreferences NotificationPreference[]
}
```

## Components and Interfaces

### Backend Services

#### NotificationsService

Core service for notification CRUD operations and business logic.

**Key Methods**:
- `create(data: CreateNotificationDto): Promise<Notification>`
- `findAll(userId: string, filters: NotificationFilters): Promise<PaginatedNotifications>`
- `findOne(id: string, userId: string): Promise<Notification>`
- `markAsRead(id: string, userId: string): Promise<Notification>`
- `markAllAsRead(userId: string): Promise<number>`
- `delete(id: string, userId: string): Promise<void>`
- `deleteAll(userId: string): Promise<number>`
- `getUnreadCount(userId: string): Promise<number>`
- `filterByPermissions(notifications: Notification[], user: UserProfile): Notification[]`

**Permission Integration**:
```typescript
async filterByPermissions(
  notifications: Notification[],
  user: UserProfile
): Promise<Notification[]> {
  return notifications.filter(notification => {
    if (!notification.requiredPermission) return true;
    return user.permissions.includes(notification.requiredPermission) ||
           user.permissions.includes('*:*');
  });
}
```


#### NotificationDeliveryService

Handles multi-channel notification delivery.

**Key Methods**:
- `deliver(notification: Notification): Promise<void>`
- `deliverInApp(notification: Notification): Promise<void>`

**Delivery Flow**:
```typescript
async deliver(notification: Notification): Promise<void> {
  // Check user preferences
  const preferences = await this.getPreferences(notification.userId, notification.category);
  
  // Check if category is enabled
  if (!preferences.enabled) {
    return;
  }
  
  // Check Do Not Disturb
  if (this.isInDNDPeriod(preferences)) {
    if (notification.priority !== 'URGENT') {
      // Skip non-urgent notifications during DND
      return;
    }
  }
  
  // Deliver in-app notification via WebSocket
  await this.deliverInApp(notification);
}
```

#### NotificationTemplateService

Manages notification templates and variable substitution.

**Key Methods**:
- `create(data: CreateTemplateDto): Promise<NotificationTemplate>`
- `findAll(filters: TemplateFilters): Promise<NotificationTemplate[]>`
- `findByKey(key: string): Promise<NotificationTemplate>`
- `update(id: string, data: UpdateTemplateDto): Promise<NotificationTemplate>`
- `delete(id: string): Promise<void>`
- `render(templateKey: string, variables: Record<string, any>): Promise<RenderedTemplate>`

**Template Rendering**:
```typescript
async render(
  templateKey: string,
  variables: Record<string, any>
): Promise<RenderedTemplate> {
  const template = await this.findByKey(templateKey);
  
  return {
    title: this.substituteVariables(template.title, variables),
    message: this.substituteVariables(template.message, variables),
  };
}

private substituteVariables(text: string, variables: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}
```

#### NotificationPreferencesService

Manages user notification preferences.

**Key Methods**:
- `getPreferences(userId: string): Promise<NotificationPreference[]>`
- `getPreference(userId: string, category: NotificationCategory): Promise<NotificationPreference>`
- `updatePreference(userId: string, category: NotificationCategory, data: UpdatePreferenceDto): Promise<NotificationPreference>`
- `setDND(userId: string, settings: DNDSettings): Promise<void>`
- `isInDNDPeriod(userId: string): Promise<boolean>`




#### NotificationWebSocketGateway

Real-time notification delivery via WebSocket.

**Key Methods**:
- `handleConnection(client: Socket): void`
- `handleDisconnect(client: Socket): void`
- `sendToUser(userId: string, notification: Notification): void`
- `broadcastToRole(role: string, notification: Notification): void`
- `updateReadStatus(userId: string, notificationId: string): void`

**WebSocket Events**:
```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationWebSocketGateway {
  @WebSocketServer()
  server: Server;
  
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds
  
  @SubscribeMessage('authenticate')
  async handleAuth(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string }
  ): Promise<void> {
    const user = await this.authService.validateToken(data.token);
    if (user) {
      this.registerUserSocket(user.id, client.id);
      client.emit('authenticated', { userId: user.id });
    }
  }
  
  async sendToUser(userId: string, notification: Notification): Promise<void> {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }
}
```

#### NotificationAnalyticsService

Tracks and reports notification metrics.

**Key Methods**:
- `trackDelivery(notificationId: string, channel: NotificationChannel, status: DeliveryStatus): Promise<void>`
- `trackOpen(notificationId: string): Promise<void>`
- `trackClick(notificationId: string, actionId?: string): Promise<void>`
- `getMetrics(userId: string, dateRange: DateRange): Promise<NotificationMetrics>`
- `getCategoryStats(dateRange: DateRange): Promise<CategoryStats[]>`
- `getChannelPerformance(dateRange: DateRange): Promise<ChannelPerformance[]>`

### Frontend Components

#### NotificationContext

Global state management for notifications.

**Context Value**:
```typescript
interface NotificationContextValue {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  
  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Preferences
  preferences: NotificationPreference[];
  updatePreference: (category: NotificationCategory, data: UpdatePreferenceDto) => Promise<void>;
  
  // Real-time
  subscribe: () => void;
  unsubscribe: () => void;
}
```


**Implementation Pattern** (following ThemeContext pattern):
```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { NotificationApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Fetch notifications
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const data = await NotificationApi.getAll(filters);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      auth: { token: localStorage.getItem('access_token') },
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Notification WebSocket connected');
    });
    
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Notification WebSocket disconnected');
    });
    
    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      showToast(notification);
    });
    
    newSocket.on('notification:read', ({ notificationId }) => {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user]);
  
  // ... other methods
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
```

#### NotificationCenter Component

Dropdown panel displaying recent notifications.

**Component Structure**:
```typescript
export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  
  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.category === filter);
  }, [notifications, filter]);
  
  const groupedNotifications = useMemo(() => {
    return groupByDate(filteredNotifications);
  }, [filteredNotifications]);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationList
          notifications={groupedNotifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          filter={filter}
          onFilterChange={setFilter}
        />
      </PopoverContent>
    </Popover>
  );
}
```


#### NotificationItem Component

Individual notification display with actions.

**Component Structure**:
```typescript
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const priorityColors = {
    LOW: 'text-gray-500',
    NORMAL: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
  };
  
  const categoryIcons = {
    SYSTEM: Settings,
    USER_ACTION: User,
    SECURITY: Shield,
    BILLING: CreditCard,
    CONTENT: FileText,
    WORKFLOW: GitBranch,
    SOCIAL: Users,
    CUSTOM: Bell,
  };
  
  const Icon = categoryIcons[notification.category];
  
  return (
    <div
      className={cn(
        'flex gap-3 p-4 hover:bg-accent cursor-pointer transition-colors',
        !notification.isRead && 'bg-blue-50 dark:bg-blue-950'
      )}
      onClick={() => onClick?.(notification)}
    >
      <div className={cn('mt-1', priorityColors[notification.priority])}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm">{notification.title}</p>
          {!notification.isRead && (
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {notification.actions.map(action => (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant as any}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(action);
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
          
          <div className="flex gap-1">
            {!notification.isRead && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### NotificationSettingsPage

User preferences configuration page.

**Page Structure**:
```typescript
export default function NotificationSettingsPage() {
  const { preferences, updatePreference } = useNotifications();
  const [dndSettings, setDndSettings] = useState<DNDSettings>({
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    days: [0, 1, 2, 3, 4, 5, 6],
  });
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Manage your notification preferences and channels"
      />
      
      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <CardTitle>Do Not Disturb</CardTitle>
          <CardDescription>
            Silence notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DNDScheduleEditor
            settings={dndSettings}
            onChange={setDndSettings}
          />
        </CardContent>
      </Card>
      
      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive and how
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferences.map(pref => (
            <NotificationPreferenceItem
              key={pref.id}
              preference={pref}
              onUpdate={(data) => updatePreference(pref.category, data)}
            />
          ))}
        </CardContent>
      </Card>
      

    </div>
  );
}
```


## API Endpoints

### Notification Endpoints

```typescript
// Get all notifications for current user
GET /notifications
Query params:
  - page: number (default: 1)
  - limit: number (default: 20)
  - category: NotificationCategory
  - priority: NotificationPriority
  - isRead: boolean
  - startDate: ISO date string
  - endDate: ISO date string
Response: {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

// Get single notification
GET /notifications/:id
Response: Notification

// Create notification (admin/system only)
POST /notifications
Body: CreateNotificationDto
Response: Notification

// Mark as read
PATCH /notifications/:id/read
Response: Notification

// Mark all as read
PATCH /notifications/read-all
Response: { count: number }

// Delete notification
DELETE /notifications/:id
Response: void

// Clear all notifications
DELETE /notifications/clear-all
Response: { count: number }

// Get unread count
GET /notifications/unread-count
Response: { count: number }

// Execute notification action
POST /notifications/:id/actions/:actionId
Response: { success: boolean; result?: any }
```

### Preference Endpoints

```typescript
// Get all preferences
GET /notifications/preferences
Response: NotificationPreference[]

// Get preference for category
GET /notifications/preferences/:category
Response: NotificationPreference

// Update preference
PATCH /notifications/preferences/:category
Body: UpdatePreferenceDto
Response: NotificationPreference

// Set Do Not Disturb
PATCH /notifications/preferences/dnd
Body: DNDSettings
Response: NotificationPreference[]

// Reset to defaults
POST /notifications/preferences/reset
Response: NotificationPreference[]
```

### Template Endpoints (Admin only)

```typescript
// Get all templates
GET /notifications/templates
Response: NotificationTemplate[]

// Get template by key
GET /notifications/templates/:key
Response: NotificationTemplate

// Create template
POST /notifications/templates
Body: CreateTemplateDto
Response: NotificationTemplate

// Update template
PATCH /notifications/templates/:id
Body: UpdateTemplateDto
Response: NotificationTemplate

// Delete template
DELETE /notifications/templates/:id
Response: void

// Test template rendering
POST /notifications/templates/:key/test
Body: { variables: Record<string, any> }
Response: RenderedTemplate
```

### Analytics Endpoints

```typescript
// Get notification metrics
GET /notifications/analytics/metrics
Query params:
  - startDate: ISO date string
  - endDate: ISO date string
Response: NotificationMetrics

// Get category statistics
GET /notifications/analytics/categories
Query params:
  - startDate: ISO date string
  - endDate: ISO date string
Response: CategoryStats[]

// Get channel performance
GET /notifications/analytics/channels
Query params:
  - startDate: ISO date string
  - endDate: ISO date string
Response: ChannelPerformance[]
```

## Data Flow

### Creating and Delivering a Notification

```
1. Trigger Event
   ↓
2. NotificationsService.create()
   - Validate data
   - Check permissions
   - Save to database
   ↓
3. NotificationQueueService.enqueue()
   - Check if immediate or scheduled
   - Add to queue
   ↓
4. NotificationDeliveryService.deliver()
   - Get user preferences
   - Check DND settings
   - Filter channels
   ↓
5. In-App Delivery
   └─ WebSocket push to connected clients
   ↓
6. Log Delivery Status
   - Create delivery log
   - Track metrics
   ↓
7. Real-Time Update
   - Emit WebSocket event
   - Update frontend state
```

### Reading a Notification

```
1. User clicks notification
   ↓
2. Frontend calls markAsRead()
   ↓
3. API: PATCH /notifications/:id/read
   ↓
4. NotificationsService.markAsRead()
   - Update isRead = true
   - Set readAt timestamp
   ↓
5. WebSocket broadcast
   - Emit 'notification:read' event
   - Update all user sessions
   ↓
6. Frontend updates
   - Update notification state
   - Decrement unread count
   - Update UI
```


## Error Handling

### Backend Error Handling

```typescript
// Custom exceptions
export class NotificationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Notification with ID ${id} not found`);
  }
}

export class NotificationPermissionException extends ForbiddenException {
  constructor() {
    super('You do not have permission to access this notification');
  }
}

export class DeliveryFailedException extends InternalServerErrorException {
  constructor(channel: NotificationChannel, reason: string) {
    super(`Failed to deliver notification via ${channel}: ${reason}`);
  }
}

// Error handling in service
async markAsRead(id: string, userId: string): Promise<Notification> {
  try {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification) {
      throw new NotificationNotFoundException(id);
    }
    
    if (notification.userId !== userId) {
      throw new NotificationPermissionException();
    }
    
    return await this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    this.logger.error(`Failed to mark notification as read: ${error.message}`);
    throw error;
  }
}
```

### Frontend Error Handling

```typescript
// Error boundary for notification components
export class NotificationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Notification error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Failed to load notifications</p>
          <Button
            variant="link"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// API error handling
const { notifications, error, isLoading } = useNotifications();

if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {apiUtils.getErrorMessage(error)}
      </AlertDescription>
    </Alert>
  );
}
```

## Testing Strategy

### Backend Tests

#### Unit Tests

```typescript
describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NotificationsService, PrismaService],
    }).compile();
    
    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });
  
  describe('create', () => {
    it('should create a notification', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-1',
        title: 'Test Notification',
        message: 'Test message',
        category: 'SYSTEM',
        priority: 'NORMAL',
        channels: ['IN_APP'],
      };
      
      const result = await service.create(dto);
      
      expect(result).toBeDefined();
      expect(result.title).toBe(dto.title);
    });
  });
  
  describe('filterByPermissions', () => {
    it('should filter notifications by user permissions', async () => {
      const notifications = [
        { id: '1', requiredPermission: 'users:read' },
        { id: '2', requiredPermission: 'posts:write' },
        { id: '3', requiredPermission: null },
      ];
      
      const user = {
        id: 'user-1',
        permissions: ['users:read'],
      };
      
      const filtered = await service.filterByPermissions(notifications, user);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(n => n.id)).toEqual(['1', '3']);
    });
  });
});
```

#### Integration Tests

```typescript
describe('Notifications E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
    
    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginResponse.body.accessToken;
  });
  
  it('/notifications (GET) should return user notifications', () => {
    return request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('notifications');
        expect(res.body).toHaveProperty('unreadCount');
      });
  });
  
  it('/notifications/:id/read (PATCH) should mark notification as read', async () => {
    // Create a notification
    const notification = await prisma.notification.create({
      data: {
        userId: 'user-1',
        title: 'Test',
        message: 'Test message',
        category: 'SYSTEM',
      },
    });
    
    return request(app.getHttpServer())
      .patch(`/notifications/${notification.id}/read`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.isRead).toBe(true);
        expect(res.body.readAt).toBeDefined();
      });
  });
});
```


### Frontend Tests

#### Component Tests

```typescript
describe('NotificationCenter', () => {
  it('should display unread count badge', () => {
    const { getByText } = render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    expect(getByText('5')).toBeInTheDocument();
  });
  
  it('should mark notification as read when clicked', async () => {
    const mockMarkAsRead = jest.fn();
    
    const { getByText } = render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockMarkAsRead}
        onDelete={jest.fn()}
      />
    );
    
    fireEvent.click(getByText('Mark as read'));
    
    expect(mockMarkAsRead).toHaveBeenCalledWith(mockNotification.id);
  });
});
```

#### Integration Tests

```typescript
describe('Notification Flow', () => {
  it('should receive and display real-time notifications', async () => {
    const { getByText, findByText } = render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    // Simulate WebSocket notification
    act(() => {
      mockSocket.emit('notification', {
        id: 'notif-1',
        title: 'New Message',
        message: 'You have a new message',
      });
    });
    
    expect(await findByText('New Message')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### Database Optimization

```sql
-- Indexes for fast queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);

-- Composite index for common query patterns
CREATE INDEX idx_notifications_user_unread 
  ON notifications(user_id, is_read, created_at DESC);

-- Partial index for unread notifications
CREATE INDEX idx_notifications_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE is_read = false AND deleted_at IS NULL;
```

### In-Memory Caching

```typescript
// Simple in-memory cache for unread counts
export class NotificationCacheService {
  private cache = new Map<string, { count: number; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  
  getUnreadCount(userId: string): number | null {
    const cached = this.cache.get(`unread:${userId}`);
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(`unread:${userId}`);
      return null;
    }
    
    return cached.count;
  }
  
  setUnreadCount(userId: string, count: number): void {
    this.cache.set(`unread:${userId}`, {
      count,
      timestamp: Date.now(),
    });
  }
  
  invalidateUnreadCount(userId: string): void {
    this.cache.delete(`unread:${userId}`);
  }
}
```

### Pagination

```typescript
// Cursor-based pagination for better performance
interface PaginationParams {
  cursor?: string; // Last notification ID
  limit?: number;
}

async findAll(
  userId: string,
  params: PaginationParams
): Promise<PaginatedNotifications> {
  const limit = params.limit || 20;
  
  const notifications = await this.prisma.notification.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(params.cursor && {
        createdAt: {
          lt: await this.getCreatedAtByCursor(params.cursor),
        },
      }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1, // Fetch one extra to check if there's more
  });
  
  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, -1) : notifications;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  
  return {
    notifications: items,
    nextCursor,
    hasMore,
  };
}
```

### WebSocket Optimization

```typescript
// Room-based broadcasting for efficient delivery
export class NotificationWebSocketGateway {
  // Join user to their personal room
  @SubscribeMessage('authenticate')
  async handleAuth(client: Socket, data: { token: string }): Promise<void> {
    const user = await this.authService.validateToken(data.token);
    if (user) {
      await client.join(`user:${user.id}`);
      await client.join(`role:${user.role.name}`);
    }
  }
  
  // Send to specific user (uses room)
  async sendToUser(userId: string, notification: Notification): Promise<void> {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
  
  // Broadcast to all users with a role
  async broadcastToRole(role: string, notification: Notification): Promise<void> {
    this.server.to(`role:${role}`).emit('notification', notification);
  }
}
```

## Security Considerations

### Input Validation

```typescript
// DTOs with class-validator
export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
  
  @IsEnum(NotificationCategory)
  category: NotificationCategory;
  
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;
  
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  channels?: NotificationChannel[];
  
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
  
  @IsString()
  @IsOptional()
  @Matches(/^[a-z]+:[a-z]+$/)
  requiredPermission?: string;
}
```

### XSS Prevention

```typescript
// Sanitize notification content
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeNotificationContent(notification: Notification): Notification {
  return {
    ...notification,
    title: DOMPurify.sanitize(notification.title),
    message: DOMPurify.sanitize(notification.message),
  };
}

// Use in component
<div dangerouslySetInnerHTML={{ __html: sanitizeNotificationContent(notification).message }} />
```

### Rate Limiting

```typescript
// Rate limit notification creation
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Throttle(10, 60) // 10 requests per minute
@Post()
async create(@Body() dto: CreateNotificationDto): Promise<Notification> {
  return this.notificationsService.create(dto);
}
```

### Permission Checks

```typescript
// Always filter by permissions
@Get()
@UseGuards(JwtAuthGuard)
async findAll(
  @CurrentUser() user: UserProfile,
  @Query() filters: NotificationFilters
): Promise<PaginatedNotifications> {
  const notifications = await this.notificationsService.findAll(user.id, filters);
  
  // Filter by permissions
  const filtered = await this.notificationsService.filterByPermissions(
    notifications.notifications,
    user
  );
  
  return {
    ...notifications,
    notifications: filtered,
  };
}
```

## Deployment Considerations

### Environment Variables

```env
# Backend (.env)
DATABASE_URL=postgresql://...

# WebSocket (optional, defaults to allow all in development)
WEBSOCKET_CORS_ORIGIN=https://example.com
```

### Scaling Considerations

1. **Database Indexes**: Optimized indexes for fast queries
2. **Pagination**: Cursor-based pagination for large notification lists
3. **Archive Strategy**: Soft delete old notifications after 90 days
4. **WebSocket Rooms**: Efficient room-based broadcasting
5. **Future**: Add Redis for horizontal scaling when needed

### Monitoring

```typescript
// Metrics to track
- Notification creation rate
- Delivery success rate per channel
- Average delivery time
- WebSocket connection count
- Queue depth and processing time
- Error rate per channel
- User engagement (read rate, click rate)
```

## Migration Path

### Phase 1: Core Infrastructure (Week 1-2)
- Database schema and migrations
- Basic CRUD operations
- In-app notifications only
- Simple notification center UI

### Phase 2: Real-Time & Preferences (Week 3-4)
- WebSocket integration
- User preferences system
- Do Not Disturb mode
- Settings page

### Phase 3: Multi-Channel (Week 5-6)
- Email delivery
- Push notifications
- Template system
- Queue and scheduling

### Phase 4: Advanced Features (Week 7-8)
- SMS and webhooks
- Analytics and reporting
- Action buttons
- Digest mode

### Phase 5: Polish & Optimization (Week 9-10)
- Performance optimization
- Accessibility improvements
- Comprehensive testing
- Documentation
