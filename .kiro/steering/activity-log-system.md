---
inclusion: fileMatch
fileMatchPattern: '{backend/src/activity-log/**,frontend/src/components/activity-log/**,frontend/src/app/dashboard/activity/**}'
---

# Activity Log / Audit System

## Overview

Production-ready activity logging system with automatic tracking of all user actions, smart filtering, and comprehensive audit trail. Logs are captured automatically via global interceptor - no manual logging code needed.

## System Architecture

### Stack
- **Backend**: NestJS + Prisma + PostgreSQL + Global Interceptor
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Database**: PostgreSQL with optimized indexes
- **Logging**: Automatic via ActivityLoggingInterceptor

### Key Components

**Backend** (`backend/src/activity-log/`):
- `activity-log.service.ts` - Core logging service
- `activity-log.controller.ts` - REST API endpoints
- `interceptors/activity-logging.interceptor.ts` - **Automatic logging for all actions**
- `decorators/skip-activity-log.decorator.ts` - Optional skip decorator

**Frontend** (`frontend/src/`):
- `app/dashboard/activity/page.tsx` - Activity log viewer page
- `components/activity-log/ActivityLogList.tsx` - Log list with grouping
- `components/activity-log/ActivityLogItem.tsx` - Individual log display
- `components/activity-log/ActivityLogFilters.tsx` - Advanced filtering
- `components/activity-log/ActivityLogPagination.tsx` - Pagination controls
- `lib/api/activity-log.ts` - API client

## Automatic Logging

### How It Works

The `ActivityLoggingInterceptor` is registered **globally** in `app.module.ts` and automatically logs:

- ✅ **POST** → `RESOURCE_CREATED` (e.g., `USER_CREATED`, `PRODUCT_CREATED`)
- ✅ **PUT/PATCH** → `RESOURCE_UPDATED` (e.g., `ORDER_UPDATED`)
- ✅ **DELETE** → `RESOURCE_DELETED` (e.g., `PRODUCT_DELETED`)
- ❌ **GET** → NOT logged (read-only operations)

### Smart Action Detection

Special patterns automatically recognized:
- `/auth/login` → `USER_LOGIN`
- `/auth/logout` → `USER_LOGOUT`
- `/auth/register` → `USER_REGISTER`
- `/*/password` → `PASSWORD_CHANGED`
- `/*/publish` → `{RESOURCE}_PUBLISHED`
- `/*/status` → `{RESOURCE}_STATUS_CHANGED`
- `/*/role` → `USER_ROLE_CHANGED`

Default: `{RESOURCE}_{ACTION}` (e.g., `BLOG_POST_UPDATED`)

### What Gets Logged

Each log entry captures:
- **Action**: Auto-detected action name
- **User**: ID and name of actor
- **Entity**: Type and ID of affected resource
- **Metadata**: Request/response data (sanitized)
- **Context**: IP address, browser, timestamp
- **Duration**: Request processing time

### Security Features

- Passwords, tokens, secrets automatically redacted
- Async logging (doesn't slow responses)
- Silent failure (won't break app)
- Skips `/activity-logs` endpoints (prevents recursion)

## Database Schema

```prisma
model ActivityLog {
  id          String    @id @default(cuid())
  action      String    // e.g., USER_LOGIN, PRODUCT_CREATED
  userId      String?   @map("user_id")
  actorName   String    @map("actor_name")
  entityType  String?   @map("entity_type")
  entityId    String?   @map("entity_id")
  metadata    Json?     // Request/response data
  ipAddress   String?   @map("ip_address")
  userAgent   String?   @map("user_agent")
  createdAt   DateTime  @default(now()) @map("created_at")
  
  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([action])
  @@index([entityType])
  @@index([createdAt])
  @@index([userId, createdAt])
  @@map("activity_logs")
}
```

## Usage

### Viewing Logs

**Frontend**: Navigate to `/dashboard/activity`
- Requires `activity-logs:read` permission
- Visible to Super Admin, Admin, Manager roles

**Features**:
- Filter by action, entity type, user, date range
- Expandable metadata view
- Relative timestamps ("2 hours ago")
- Pagination with configurable page size
- Color-coded action badges
- Browser and OS detection

### API Endpoints

```typescript
GET    /activity-logs              // List logs with filters
GET    /activity-logs/:id           // Get single log
POST   /activity-logs               // Manual log creation (admin)
```

**Query Parameters**:
- `userId` - Filter by user
- `action` - Filter by action type
- `entityType` - Filter by entity
- `entityId` - Filter by specific entity
- `startDate` / `endDate` - Date range
- `page` / `limit` - Pagination
- `sortOrder` - asc/desc

### Manual Logging (Optional)

If you need to log custom actions:

```typescript
import { ActivityLogService } from './activity-log/activity-log.service';

@Injectable()
export class MyService {
  constructor(private activityLog: ActivityLogService) {}
  
  async customAction() {
    await this.activityLog.logActivity({
      action: 'CUSTOM_ACTION',
      userId: user.id,
      actorName: user.name,
      entityType: 'CustomEntity',
      entityId: 'entity-123',
      metadata: { key: 'value' },
    }, request);
  }
}
```

### Skip Logging (Optional)

To skip logging for specific routes:

```typescript
import { SkipActivityLog } from './activity-log/decorators/skip-activity-log.decorator';

@Post('internal')
@SkipActivityLog()
async internalAction() {
  // This won't be logged
}
```

## Common Actions Logged

**Authentication**:
- USER_LOGIN, USER_LOGOUT, USER_REGISTER, PASSWORD_CHANGED

**User Management**:
- USER_CREATED, USER_UPDATED, USER_DELETED, USER_ROLE_CHANGED

**Content**:
- PAGE_CREATED, PAGE_UPDATED, PAGE_DELETED, PAGE_PUBLISHED
- BLOG_POST_CREATED, BLOG_POST_UPDATED, BLOG_POST_DELETED, BLOG_POST_PUBLISHED

**E-Commerce**:
- PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED
- ORDER_CREATED, ORDER_UPDATED, ORDER_STATUS_CHANGED
- CUSTOMER_CREATED, CUSTOMER_UPDATED, INVENTORY_UPDATED

**Settings**:
- SETTINGS_UPDATED, MENU_UPDATED, WIDGET_ADDED, WIDGET_REMOVED

**System**:
- SYSTEM_ERROR, SYSTEM_WARNING

## Permissions

**Required Permission**: `activity-logs:read`
- View activity logs

**Required Roles**: Super Admin, Admin, Manager
- Access to activity log page

**Permission Assignment**:
```typescript
// In backend/prisma/seed-data/auth.seed.ts
{
  name: 'activity-logs:read',
  resource: 'activity-logs',
  action: 'read',
  description: 'View activity logs and audit trail',
}
```

## Performance

**Optimized Indexes**:
- `userId` - Fast user filtering
- `action` - Fast action filtering
- `entityType` - Fast entity filtering
- `createdAt` - Fast date sorting
- `userId + createdAt` - Composite for user timeline

**Async Logging**:
- Logs written asynchronously via `setImmediate()`
- Zero impact on response times
- Silent failure if logging fails

**Pagination**:
- Default: 25 logs per page
- Configurable: 10, 25, 50, 100
- Cursor-based pagination for large datasets

## Troubleshooting

**Logs not appearing?**
- Check backend is running
- Verify user has `activity-logs:read` permission
- Check user role is Super Admin, Admin, or Manager
- Ensure action is not GET request

**Too many logs?**
- Use filters to narrow results
- Adjust date range
- Filter by specific user or entity

**Missing action types?**
- Interceptor auto-detects from URL patterns
- Add custom patterns in `determineAction()` method
- Or use manual logging for special cases

## Quick Reference

### View Logs
```
Navigate to: /dashboard/activity
Permission: activity-logs:read
Roles: Super Admin, Admin, Manager
```

### API Client
```typescript
import { ActivityLogApi } from '@/lib/api/activity-log';

const logs = await ActivityLogApi.getAll({
  userId: 'user-123',
  action: 'USER_LOGIN',
  startDate: '2024-01-01',
  page: 1,
  limit: 25,
});
```

### Skip Logging
```typescript
@SkipActivityLog()
```

### Manual Log
```typescript
await activityLogService.logActivity(data, request);
```

## Resources

- **Spec**: `.kiro/specs/activity-audit-log/`
- **Backend**: `backend/src/activity-log/`
- **Frontend**: `frontend/src/components/activity-log/`
- **Interceptor**: `backend/src/activity-log/interceptors/activity-logging.interceptor.ts`
