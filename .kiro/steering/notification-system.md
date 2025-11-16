---
inclusion: fileMatch
fileMatchPattern: '{backend/src/notifications/**,frontend/src/components/notifications/**,frontend/src/contexts/NotificationContext.tsx}'
---

# Notification System - Complete Steering Guide

## Overview

This project implements a comprehensive, production-ready notification system with real-time WebSocket delivery, user preferences, permission-based filtering, and full accessibility support. The system is designed to be highly adaptable for any dashboard use case.

## System Architecture

### Stack
- **Backend**: NestJS + Prisma + PostgreSQL + Socket.IO
- **Frontend**: Next.js 14 + React Context + Socket.IO Client
- **Database**: PostgreSQL with optimized indexes
- **Real-Time**: WebSocket-based instant delivery

### Key Components

**Backend** (`backend/src/notifications/`):
- `notifications.service.ts` - Core CRUD operations and business logic
- `notifications.controller.ts` - REST API endpoints
- `notification-delivery.service.ts` - Multi-channel delivery orchestration
- `notification-websocket.gateway.ts` - Real-time WebSocket gateway
- `notification-preferences.service.ts` - User preference management
- `notification-template.service.ts` - Template rendering engine
- `notification-actions.service.ts` - Interactive action handling
- `notification-analytics.service.ts` - Metrics and reporting
- `notification-cache.service.ts` - Performance caching layer

**Frontend** (`frontend/src/`):
- `contexts/NotificationContext.tsx` - Global state management
- `components/notifications/NotificationCenter.tsx` - Bell icon dropdown
- `components/notifications/NotificationList.tsx` - Grouped notification list
- `components/notifications/NotificationItem.tsx` - Individual notification display
- `components/notifications/NotificationFilters.tsx` - Category/priority filters
- `app/dashboard/settings/notifications/page.tsx` - Settings page

## Database Schema

### Core Models

#### Notification
```prisma
model Notification {
  id                 String                    @id @default(cuid())
  userId             String                    @map("user_id")
  
  // Content
  title              String
  message            String
  category           NotificationCategory
  priority           NotificationPriority      @default(NORMAL)
  
  // Metadata
  metadata           Json?
  actionUrl          String?                   @map("action_url")
  actionLabel        String?                   @map("action_label")
  imageUrl           String?                   @map("image_url")
  
  // Channel
  channel            NotificationChannel       @default(IN_APP)
  
  // Status
  isRead             Boolean                   @default(false) @map("is_read")
  readAt             DateTime?                 @map("read_at")
  deletedAt          DateTime?                 @map("deleted_at")
  
  // Permissions
  requiredPermission String?                   @map("required_permission")
  
  // Timestamps
  createdAt          DateTime                  @default(now()) @map("created_at")
  updatedAt          DateTime                  @updatedAt @map("updated_at")
  scheduledFor       DateTime?                 @map("scheduled_for")
  
  // Relations
  user               User                      @relation(fields: [userId], references: [id], onDelete: Cascade)
  actions            NotificationAction[]
  deliveryLogs       NotificationDeliveryLog[]
  
  @@index([userId])
  @@index([category])
  @@index([priority])
  @@index([isRead])
  @@index([createdAt])
  @@index([userId, isRead, createdAt])
  @@map("notifications")
}
```

#### NotificationPreference
```prisma
model NotificationPreference {
  id           String               @id @default(cuid())
  userId       String               @map("user_id")
  category     NotificationCategory
  enabled      Boolean              @default(true)
  
  // Do Not Disturb
  dndEnabled   Boolean              @default(false) @map("dnd_enabled")
  dndStartTime String?              @map("dnd_start_time") // HH:MM format
  dndEndTime   String?              @map("dnd_end_time")   // HH:MM format
  dndDays      Int[]                @default([]) @map("dnd_days") // 0-6 (Sun-Sat)
  
  createdAt    DateTime             @default(now()) @map("created_at")
  updatedAt    DateTime             @updatedAt @map("updated_at")
  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, category])
  @@index([userId])
  @@map("notification_preferences")
}
```

### Enums

```prisma
enum NotificationCategory {
  SYSTEM        // System updates, maintenance
  USER_ACTION   // User-triggered actions
  SECURITY      // Security alerts, login attempts
  BILLING       // Payment, subscription updates
  CONTENT       // Content updates, new posts
  WORKFLOW      // Workflow status, approvals
  SOCIAL        // Social interactions, mentions
  CUSTOM        // Custom notifications
}

enum NotificationPriority {
  LOW           // Can wait, no urgency
  NORMAL        // Standard notification
  HIGH          // Important, needs attention
  URGENT        // Critical, bypasses DND
}

enum NotificationChannel {
  IN_APP        // In-app notification center
}

enum DeliveryStatus {
  PENDING       // Queued for delivery
  SENT          // Sent to channel
  DELIVERED     // Confirmed delivery
  FAILED        // Delivery failed
  OPENED        // User opened notification
  CLICKED       // User clicked action
}

enum ActionType {
  LINK          // Navigate to URL
  API_CALL      // Execute API request
  INLINE_FORM   // Show inline form
  DISMISS       // Dismiss notification
}
```

## Backend Implementation

### Sending Notifications

**Basic Notification**:
```typescript
import { NotificationsService } from './notifications/notifications.service';

@Injectable()
export class MyService {
  constructor(private notificationsService: NotificationsService) {}
  
  async sendNotification(userId: string) {
    await this.notificationsService.create({
      userId,
      title: 'Welcome!',
      message: 'Thanks for joining our platform',
      category: 'SYSTEM',
      priority: 'NORMAL',
    });
  }
}
```

**Using Helper Functions**:
```typescript
import { NotificationHelpers } from './notifications/notification-helpers';

// System notification
await NotificationHelpers.sendSystemNotification(
  userId,
  'System Update',
  'The system will be under maintenance tonight'
);

// Security alert
await NotificationHelpers.sendSecurityAlert(
  userId,
  'New Login Detected',
  'A new login was detected from Chrome on Windows'
);

// With action button
await this.notificationsService.create({
  userId,
  title: 'Approval Required',
  message: 'A new document needs your approval',
  category: 'WORKFLOW',
  priority: 'HIGH',
  actionUrl: '/dashboard/approvals/123',
  actionLabel: 'Review Now',
  requiredPermission: 'approvals:read',
});
```

### Permission-Based Filtering

Notifications automatically filter by user permissions:

```typescript
// In controller
@Get()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('notifications:read')
async findAll(@CurrentUser() user: any, @Query() filters: NotificationFiltersDto) {
  const result = await this.notificationsService.findAll(user.id, filters);
  
  // Filter by user permissions
  const filtered = this.notificationsService.filterByPermissions(
    result.notifications,
    user
  );
  
  return { ...result, notifications: filtered };
}
```

**Permission Format**: `{resource}:{action}`
- Example: `users:read`, `posts:write`, `approvals:admin`
- Wildcard: `*:*` (super admin sees all)

### WebSocket Real-Time Delivery

**Gateway Events**:
```typescript
// Server → Client events
socket.on('notification', (notification) => {
  // New notification received
});

socket.on('notification:read', ({ notificationId }) => {
  // Notification marked as read
});

socket.on('notification:deleted', ({ notificationId }) => {
  // Notification deleted
});

// Client → Server events
socket.emit('authenticate', { token: 'jwt-token' });
```

**Sending to User**:
```typescript
// In any service
constructor(
  private readonly websocketGateway: NotificationWebSocketGateway
) {}

async sendNotification(userId: string) {
  const notification = await this.notificationsService.create({...});
  
  // Send via WebSocket if user is connected
  this.websocketGateway.sendToUser(userId, notification);
}
```

### User Preferences & DND

**Check Preferences Before Delivery**:
```typescript
// In NotificationDeliveryService
async deliver(notification: Notification): Promise<void> {
  // Check if category is enabled
  const preferences = await this.checkPreferences(
    notification.userId,
    notification.category
  );
  
  if (!preferences.enabled) {
    return; // Skip delivery
  }
  
  // Check Do Not Disturb
  const isInDND = await this.checkDND(notification.userId);
  
  if (isInDND && notification.priority !== 'URGENT') {
    return; // Skip non-urgent during DND
  }
  
  // Deliver notification
  await this.deliverInApp(notification);
}
```

**DND Settings**:
- `dndEnabled`: Boolean flag
- `dndStartTime`: "22:00" (HH:MM format)
- `dndEndTime`: "08:00" (HH:MM format)
- `dndDays`: [0, 1, 2, 3, 4, 5, 6] (Sunday=0, Saturday=6)
- **URGENT** priority bypasses DND

### API Endpoints

```typescript
// Notification endpoints
GET    /notifications                    // List notifications
GET    /notifications/unread-count       // Get unread count
GET    /notifications/:id                // Get single notification
POST   /notifications                    // Create notification (admin)
POST   /notifications/demo               // Create demo notification
PATCH  /notifications/:id/read           // Mark as read
PATCH  /notifications/read-all           // Mark all as read
DELETE /notifications/:id                // Delete notification
DELETE /notifications/clear-all          // Clear all notifications

// Preference endpoints
GET    /notifications/preferences        // Get all preferences
GET    /notifications/preferences/:category  // Get category preference
PATCH  /notifications/preferences/:category  // Update preference
PATCH  /notifications/preferences/dnd    // Set DND settings
POST   /notifications/preferences/reset  // Reset to defaults

// Template endpoints (admin)
GET    /notifications/templates          // List templates
GET    /notifications/templates/:key     // Get template
POST   /notifications/templates          // Create template
PATCH  /notifications/templates/:id      // Update template
DELETE /notifications/templates/:id      // Delete template
POST   /notifications/templates/:key/test  // Test rendering

// Analytics endpoints
GET    /notifications/analytics/metrics  // Get metrics
GET    /notifications/analytics/categories  // Category stats
GET    /notifications/analytics/channels    // Channel performance
```

## Frontend Implementation

### NotificationContext Usage

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const {
    notifications,      // Notification[]
    unreadCount,        // number
    isLoading,          // boolean
    isConnected,        // boolean (WebSocket)
    preferences,        // NotificationPreference[]
    
    // Methods
    fetchNotifications, // (filters?) => Promise<void>
    markAsRead,         // (id: string) => Promise<void>
    markAllAsRead,      // () => Promise<void>
    deleteNotification, // (id: string) => Promise<void>
    clearAll,           // () => Promise<void>
    updatePreference,   // (category, data) => Promise<void>
    setDND,             // (data) => Promise<void>
  } = useNotifications();
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}
```

### NotificationCenter Component

Add to dashboard header:
```typescript
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

<Header>
  <NotificationCenter />
  <UserMenu />
</Header>
```

Features:
- Bell icon with unread badge
- Dropdown panel with recent notifications
- Grouped by date (Today, Yesterday, This Week, Older)
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Real-time updates via WebSocket
- Toast notifications for new alerts

### Notification Settings Page

Located at `/dashboard/settings/notifications`:

```typescript
// Features:
- Enable/disable per category
- Do Not Disturb schedule
- Notification sound settings
- Preview notifications
- Reset to defaults
```

### Permission Guards

Protect notification-related UI:
```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard';

<PermissionGuard permission="notifications:write">
  <CreateNotificationButton />
</PermissionGuard>
```

## Common Tasks

### Adding a New Notification Type

1. **Choose Category**: Use existing or add to enum
2. **Create Notification**:
```typescript
await this.notificationsService.create({
  userId,
  title: 'New Feature Available',
  message: 'Check out our new dashboard widgets!',
  category: 'SYSTEM',
  priority: 'NORMAL',
  actionUrl: '/dashboard/widgets',
  actionLabel: 'Explore',
});
```

3. **Add Permission** (if needed):
```typescript
// In backend/prisma/seed-data/auth.seed.ts
{
  name: 'widgets:read',
  resource: 'widgets',
  action: 'read',
  description: 'View widgets'
}
```

4. **Reseed Database**:
```bash
cd backend
npm run prisma:seed
```

### Creating Notification Templates

1. **Create Template**:
```typescript
await this.templateService.create({
  key: 'welcome-user',
  name: 'Welcome User',
  category: 'SYSTEM',
  title: 'Welcome {{userName}}!',
  message: 'Thanks for joining {{appName}}. We\'re excited to have you!',
  variables: ['userName', 'appName'],
  defaultPriority: 'NORMAL',
});
```

2. **Use Template**:
```typescript
const rendered = await this.templateService.render('welcome-user', {
  userName: 'John Doe',
  appName: 'Dashboard',
});

await this.notificationsService.create({
  userId,
  ...rendered,
  category: 'SYSTEM',
});
```

### Adding Interactive Actions

```typescript
// Create notification with actions
const notification = await this.notificationsService.create({
  userId,
  title: 'Approval Required',
  message: 'A new document needs your approval',
  category: 'WORKFLOW',
  priority: 'HIGH',
});

// Add actions
await this.prisma.notificationAction.createMany({
  data: [
    {
      notificationId: notification.id,
      label: 'Approve',
      actionType: 'API_CALL',
      actionUrl: '/api/approvals/123/approve',
      actionMethod: 'POST',
      variant: 'default',
    },
    {
      notificationId: notification.id,
      label: 'Reject',
      actionType: 'API_CALL',
      actionUrl: '/api/approvals/123/reject',
      actionMethod: 'POST',
      variant: 'destructive',
    },
  ],
});
```

## Performance Optimization

### Database Indexes

Optimized indexes for fast queries:
```sql
-- Single column indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_notifications_user_unread 
  ON notifications(user_id, is_read, created_at DESC);
```

### Caching Strategy

**Unread Count Cache**:
```typescript
// In NotificationCacheService
private unreadCountCache = new Map<string, { count: number; timestamp: number }>();
private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

getUnreadCount(userId: string): number | null {
  const cached = this.unreadCountCache.get(userId);
  if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
    return cached.count;
  }
  return null;
}
```

### Pagination

- **Cursor-based pagination**: Better performance for large datasets
- **Default limit**: 20 notifications per page
- **Maximum limit**: 50 notifications per page

```typescript
// Offset-based (page)
GET /notifications?page=1&limit=20

// Cursor-based (better performance)
GET /notifications?cursor=cuid123&limit=20
```

## Accessibility

### WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- `Tab`: Navigate through notifications
- `Enter`/`Space`: Open/read notification
- `Escape`: Close notification center
- `Arrow Up/Down`: Navigate list items
- `Home/End`: Jump to first/last notification

**Screen Reader Support**:
```typescript
// ARIA labels and roles
<div role="listitem" aria-label="Unread notification: Welcome! Thanks for joining...">
  <button aria-label="Mark as read">
  <button aria-label="Delete notification">
</div>

// Live regions for announcements
<div role="status" aria-live="polite" aria-atomic="true">
  {announcement}
</div>
```

**Focus Management**:
- Focus trap in notification panel
- Return focus to trigger button on close
- Visible focus indicators
- Skip to notifications link

**Color Contrast**:
- All text meets WCAG AA standards (4.5:1 ratio)
- Priority colors have sufficient contrast
- Unread indicators are not color-only

## Security

### Authentication & Authorization

- All endpoints protected with JWT authentication
- WebSocket connections require JWT token
- Permission-based filtering for notifications
- User can only access their own notifications

### Input Validation

```typescript
// All DTOs validated with class-validator
export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
  
  @Matches(/^[a-z]+:[a-z]+$/)
  requiredPermission?: string;
}
```

### XSS Prevention

- All notification content sanitized before display
- Template variables escaped
- No `dangerouslySetInnerHTML` used
- React's built-in XSS protection

### Rate Limiting

- Notification creation rate limited
- WebSocket connection throttling
- API endpoint rate limits

## Troubleshooting

### Notifications Not Appearing

**Checklist**:
- [ ] Backend server running on port 3001
- [ ] WebSocket connection established (check browser console)
- [ ] User authenticated with valid JWT token
- [ ] NotificationProvider wraps application
- [ ] Category not disabled in preferences
- [ ] Not in DND mode (unless URGENT priority)

**Debug**:
```typescript
const { isConnected, isLoading, preferences } = useNotifications();
console.log('Connected:', isConnected);
console.log('Loading:', isLoading);
console.log('Preferences:', preferences);
```

### WebSocket Connection Issues

**Cause**: CORS or authentication issues

**Solution**:
1. Check CORS configuration in backend
2. Verify JWT token is valid
3. Check WebSocket URL matches backend
4. Look for errors in browser Network tab (WS)

### Preferences Not Saving

**Cause**: API call failing or validation error

**Solution**:
1. Check Network tab for API errors
2. Verify request body format
3. Check backend logs for validation errors
4. Ensure user is authenticated

### Unread Count Incorrect

**Cause**: Cache out of sync

**Solution**:
```typescript
// Invalidate cache
this.cacheService.invalidateUnreadCount(userId);

// Or refresh from frontend
const { fetchNotifications } = useNotifications();
await fetchNotifications();
```

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm test notifications.service.spec.ts
npm test notification-preferences.service.spec.ts
npm test notification-delivery.service.spec.ts

# E2E tests
npm run test:e2e notification-delivery.e2e-spec.ts

# Coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Component tests
npm test NotificationCenter.test.tsx
npm test NotificationItem.test.tsx

# Accessibility tests
npm test accessibility.test.tsx
```

## Quick Reference

### Send Notification
```typescript
await this.notificationsService.create({
  userId,
  title: 'Title',
  message: 'Message',
  category: 'SYSTEM',
  priority: 'NORMAL',
});
```

### Use in Frontend
```typescript
const { notifications, unreadCount, markAsRead } = useNotifications();
```

### Add Permission Filter
```typescript
requiredPermission: 'resource:action'
```

### Set DND
```typescript
await setDND({
  enabled: true,
  startTime: '22:00',
  endTime: '08:00',
  days: [0, 1, 2, 3, 4, 5, 6],
});
```

### Check WebSocket Status
```typescript
const { isConnected } = useNotifications();
```

## Resources

- **Spec Files**: `.kiro/specs/notification-system/`
- **Requirements**: `.kiro/specs/notification-system/requirements.md`
- **Design Doc**: `.kiro/specs/notification-system/design.md`
- **Developer Guide**: `.kiro/specs/notification-system/DEVELOPER_GUIDE.md`
- **README**: `.kiro/specs/notification-system/README.md`