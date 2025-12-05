# Notification System

## Overview

A comprehensive, production-ready notification system for the dashboard starter kit that provides real-time notifications, multi-channel delivery, flexible categorization, user preferences, and permission-based filtering.

### Key Features

- **Real-Time Notifications**: WebSocket-based instant delivery
- **In-App Notification Center**: Bell icon with badge counts and dropdown panel
- **User Preferences**: Granular control over notification types and categories
- **Do Not Disturb Mode**: Schedule quiet hours with day-of-week support
- **Permission Integration**: Seamless integration with JWT auth system
- **Template System**: Reusable templates with variable substitution
- **Interactive Actions**: Buttons within notifications for quick actions
- **Analytics**: Track delivery, read rates, and user engagement
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **Zero External Dependencies**: Works with existing PostgreSQL database

## Quick Start

### For Users

1. **View Notifications**: Click the bell icon in the dashboard header
2. **Mark as Read**: Click on a notification or use the "Mark as Read" button
3. **Manage Preferences**: Navigate to Settings → Notifications
4. **Set Do Not Disturb**: Configure quiet hours in notification settings

### For Developers

```typescript
// Send a notification
import { NotificationHelpers } from '@/backend/src/notifications/notification-helpers';

await NotificationHelpers.sendSystemNotification(
  userId,
  'Welcome!',
  'Thanks for joining our platform'
);

// Use in frontend
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  );
}
```

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
│  NotificationsModule  │  WebSocketGateway  │  DeliveryService│
│  TemplateEngine       │  PreferencesService│  AnalyticsService│
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  notifications  │  notification_preferences  │  templates    │
│  delivery_logs  │  notification_actions      │               │
└─────────────────────────────────────────────────────────────┘
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

## Database Schema

### Core Models

#### Notification
```prisma
model Notification {
  id                String                 @id @default(cuid())
  userId            String                 @map("user_id")
  title             String
  message           String                 @db.Text
  category          NotificationCategory
  priority          NotificationPriority   @default(NORMAL)
  metadata          Json?
  actionUrl         String?                @map("action_url")
  actionLabel       String?                @map("action_label")
  channel           NotificationChannel    @default(IN_APP)
  isRead            Boolean                @default(false) @map("is_read")
  readAt            DateTime?              @map("read_at")
  deletedAt         DateTime?              @map("deleted_at")
  requiredPermission String?               @map("required_permission")
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  
  user              User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  deliveryLogs      NotificationDeliveryLog[]
  actions           NotificationAction[]
  
  @@index([userId])
  @@index([category])
  @@index([priority])
  @@index([isRead])
  @@index([createdAt])
  @@map("notifications")
}
```

#### NotificationPreference
```prisma
model NotificationPreference {
  id                String                 @id @default(cuid())
  userId            String                 @map("user_id")
  category          NotificationCategory
  enabled           Boolean                @default(true)
  dndEnabled        Boolean                @default(false) @map("dnd_enabled")
  dndStartTime      String?                @map("dnd_start_time")
  dndEndTime        String?                @map("dnd_end_time")
  dndDays           Int[]                  @default([]) @map("dnd_days")
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  
  user              User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, category])
  @@index([userId])
  @@map("notification_preferences")
}
```

### Enums

```prisma
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
Response: {
  notifications: Notification[];
  total: number;
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

## WebSocket Events

### Client → Server

```typescript
// Authenticate connection
socket.emit('authenticate', { token: 'jwt-token' });
```

### Server → Client

```typescript
// New notification received
socket.on('notification', (notification: Notification) => {
  // Handle new notification
});

// Notification marked as read
socket.on('notification:read', ({ notificationId: string }) => {
  // Update UI
});

// Notification deleted
socket.on('notification:deleted', ({ notificationId: string }) => {
  // Remove from UI
});

// Connection authenticated
socket.on('authenticated', ({ userId: string }) => {
  // Connection successful
});
```

## Frontend Integration

### NotificationContext

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const {
    notifications,      // Notification[]
    unreadCount,        // number
    isLoading,          // boolean
    isConnected,        // boolean (WebSocket)
    fetchNotifications, // (filters?) => Promise<void>
    markAsRead,         // (id: string) => Promise<void>
    markAllAsRead,      // () => Promise<void>
    deleteNotification, // (id: string) => Promise<void>
    clearAll,           // () => Promise<void>
    preferences,        // NotificationPreference[]
    updatePreference,   // (category, data) => Promise<void>
  } = useNotifications();
  
  return <div>...</div>;
}
```

### NotificationCenter Component

```typescript
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

// Add to dashboard header
<Header>
  <NotificationCenter />
  <UserMenu />
</Header>
```

### Permission Guards

```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard';

// Protect notification creation UI
<PermissionGuard permission="notifications:write">
  <CreateNotificationButton />
</PermissionGuard>
```

## Backend Integration

### Sending Notifications

```typescript
import { NotificationHelpers } from '@/backend/src/notifications/notification-helpers';

// System notification
await NotificationHelpers.sendSystemNotification(
  userId,
  'System Update',
  'The system will be under maintenance tonight'
);

// User action notification
await NotificationHelpers.sendUserActionNotification(
  userId,
  'Profile Updated',
  'Your profile has been successfully updated'
);

// Security alert
await NotificationHelpers.sendSecurityAlert(
  userId,
  'New Login Detected',
  'A new login was detected from Chrome on Windows'
);

// Custom notification
await this.notificationsService.create({
  userId,
  title: 'Custom Title',
  message: 'Custom message',
  category: 'CUSTOM',
  priority: 'HIGH',
  metadata: { customData: 'value' },
  requiredPermission: 'custom:read',
});
```

### Using Templates

```typescript
// Create template
await this.templateService.create({
  key: 'welcome-email',
  name: 'Welcome Email',
  category: 'SYSTEM',
  title: 'Welcome {{userName}}!',
  message: 'Thanks for joining {{appName}}. We\'re excited to have you!',
  variables: ['userName', 'appName'],
});

// Render and send
const rendered = await this.templateService.render('welcome-email', {
  userName: 'John Doe',
  appName: 'Dashboard',
});

await this.notificationsService.create({
  userId,
  ...rendered,
  category: 'SYSTEM',
});
```

### Permission Filtering

```typescript
// Automatically filters by permissions
@Get()
@UseGuards(JwtAuthGuard)
async findAll(
  @CurrentUser() user: UserProfile,
  @Query() filters: NotificationFilters
): Promise<PaginatedNotifications> {
  const notifications = await this.notificationsService.findAll(user.id, filters);
  
  // Filter by user permissions
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

## Configuration

### Backend Environment Variables

```env
# backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key

# WebSocket (optional)
WEBSOCKET_CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Performance

### Database Indexes

The system includes optimized indexes for fast queries:

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

### Caching

- **Unread Counts**: Cached in memory with 5-minute TTL
- **User Preferences**: Cached in frontend localStorage
- **WebSocket Rooms**: Efficient room-based broadcasting

### Pagination

- **Cursor-based pagination**: Better performance for large datasets
- **Default limit**: 20 notifications per page
- **Maximum limit**: 50 notifications per page

## Security

### Authentication

- All endpoints protected with JWT authentication
- WebSocket connections require JWT token
- Token validation on every request

### Authorization

- Permission-based filtering for notifications
- Role-based access for admin endpoints
- User can only access their own notifications

### Input Validation

- All DTOs validated with class-validator
- XSS prevention with content sanitization
- Rate limiting on notification creation

### Audit Logging

- All notification actions logged
- Delivery status tracked
- User interactions recorded

## Accessibility

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and live regions
- **Focus Management**: Proper focus indicators and trapping
- **Color Contrast**: Meets WCAG AA standards
- **Reduced Motion**: Respects user preferences

### Keyboard Shortcuts

- `Tab`: Navigate through notifications
- `Enter`: Open/read notification
- `Escape`: Close notification center
- `Arrow Keys`: Navigate list items

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm test notifications.service.spec.ts
npm test notification-preferences.service.spec.ts
npm test notification-template.service.spec.ts

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

# Integration tests
npm test notification-flow.test.tsx

# Accessibility tests
npm test accessibility.test.tsx
```

## Troubleshooting

### Notifications Not Appearing

**Checklist**:
- [ ] Backend server running on port 3001
- [ ] WebSocket connection established (check browser console)
- [ ] User authenticated with valid JWT token
- [ ] NotificationProvider wraps application
- [ ] No JavaScript errors in console

**Debug**:
```typescript
const { isConnected, isLoading } = useNotifications();
console.log('Connected:', isConnected);
console.log('Loading:', isLoading);
```

### WebSocket Connection Issues

**Cause**: CORS or authentication issues

**Solution**:
1. Check CORS configuration in backend
2. Verify JWT token is valid
3. Check WebSocket URL matches backend
4. Look for errors in browser Network tab

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
const { refreshSettings } = useNotifications();
await refreshSettings();
```

## Migration Guide

### From No Notification System

1. **Run Prisma Migration**:
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

2. **Add NotificationProvider**:
```typescript
// frontend/src/app/layout.tsx
<AuthProvider>
  <NotificationProvider>
    {children}
  </NotificationProvider>
</AuthProvider>
```

3. **Add NotificationCenter**:
```typescript
// frontend/src/components/dashboard/Header.tsx
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

<Header>
  <NotificationCenter />
</Header>
```

4. **Add Permissions**:
```typescript
// backend/prisma/seed-data/auth.seed.ts
{
  name: 'notifications:read',
  resource: 'notifications',
  action: 'read',
  description: 'View notifications'
},
{
  name: 'notifications:write',
  resource: 'notifications',
  action: 'write',
  description: 'Create notifications'
},
```

5. **Reseed Database**:
```bash
cd backend
npm run prisma:seed
```

## Resources

- **Developer Guide**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **User Guide**: [USER_GUIDE.md](./USER_GUIDE.md)
- **API Documentation**: [design.md](./design.md#api-endpoints)
- **Requirements**: [requirements.md](./requirements.md)
- **Design Document**: [design.md](./design.md)
- **Implementation Tasks**: [tasks.md](./tasks.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the developer guide
3. Check existing GitHub issues
4. Create a new issue with detailed information

## License

This notification system is part of the dashboard starter kit and follows the same license.
