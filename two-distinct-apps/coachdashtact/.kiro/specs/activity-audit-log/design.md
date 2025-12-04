# Activity Log / Audit Log System - Design Document

## Overview

The Activity Log system provides comprehensive audit trail functionality for the full-stack dashboard. It captures user actions, system events, and entity changes in a structured, queryable format. The design emphasizes extensibility, performance, and ease of integration across the entire application.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Activity Log Page (/dashboard/activity)               │ │
│  │  - List view with filters                              │ │
│  │  - Pagination controls                                 │ │
│  │  - Detail expansion                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Client (frontend/src/lib/api/activity.ts)        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                     Backend (NestJS)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Activity Log Controller                               │ │
│  │  - POST /activity-logs (create)                        │ │
│  │  - GET /activity-logs (list with filters)             │ │
│  │  - GET /activity-logs/:id (get single)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Activity Log Service                                  │ │
│  │  - logActivity()                                       │ │
│  │  - findAll() with filters                             │ │
│  │  - findOne()                                           │ │
│  │  - Helper methods for common actions                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Prisma ORM                                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  activity_logs table                                   │ │
│  │  - Indexed for efficient queries                       │ │
│  │  - JSON metadata support                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

The Activity Log system integrates with existing modules through:
1. **Decorator Pattern**: `@LogActivity()` decorator for automatic logging
2. **Service Injection**: Direct service calls for custom logging
3. **Middleware**: Optional HTTP middleware for request logging
4. **Event Listeners**: Subscribe to domain events for automatic logging

## Components and Interfaces

### Database Schema (Prisma)

```prisma
model ActivityLog {
  id          String   @id @default(uuid())
  action      String   // e.g., "USER_LOGIN", "PRODUCT_CREATED", "ORDER_UPDATED"
  userId      String?  // Nullable for system events
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  actorName   String   // Cached name for display (handles deleted users)
  entityType  String?  // e.g., "User", "Product", "Order", "Page"
  entityId    String?  // ID of the affected entity
  metadata    Json?    // Additional context (old values, new values, etc.)
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
  @@map("activity_logs")
}
```

### Backend DTOs

**CreateActivityLogDto**
```typescript
export class CreateActivityLogDto {
  action: string;           // Required: Action type
  userId?: string;          // Optional: User who performed action
  actorName?: string;       // Optional: Will be auto-populated if userId provided
  entityType?: string;      // Optional: Type of entity affected
  entityId?: string;        // Optional: ID of entity affected
  metadata?: Record<string, any>; // Optional: Additional context
  ipAddress?: string;       // Optional: Will be auto-extracted from request
  userAgent?: string;       // Optional: Will be auto-extracted from request
}
```

**ActivityLogQueryDto**
```typescript
export class ActivityLogQueryDto {
  userId?: string;          // Filter by user
  entityType?: string;      // Filter by entity type
  entityId?: string;        // Filter by specific entity
  action?: string;          // Filter by action type
  startDate?: Date;         // Filter by date range start
  endDate?: Date;           // Filter by date range end
  page?: number;            // Pagination: page number (default: 1)
  limit?: number;           // Pagination: items per page (default: 50, max: 100)
  sortOrder?: 'asc' | 'desc'; // Sort order (default: 'desc')
}
```

**ActivityLogResponseDto**
```typescript
export class ActivityLogResponseDto {
  id: string;
  action: string;
  userId: string | null;
  actorName: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
```

### Backend Service Interface

```typescript
export interface IActivityLogService {
  // Core logging method
  logActivity(data: CreateActivityLogDto, request?: Request): Promise<ActivityLog>;
  
  // Query methods
  findAll(query: ActivityLogQueryDto): Promise<{
    data: ActivityLog[];
    total: number;
    page: number;
    limit: number;
  }>;
  
  findOne(id: string): Promise<ActivityLog | null>;
  
  // Helper methods for common actions
  logUserLogin(userId: string, request: Request): Promise<ActivityLog>;
  logUserLogout(userId: string, request: Request): Promise<ActivityLog>;
  logEntityCreated(entityType: string, entityId: string, userId: string, metadata?: any): Promise<ActivityLog>;
  logEntityUpdated(entityType: string, entityId: string, userId: string, changes: any): Promise<ActivityLog>;
  logEntityDeleted(entityType: string, entityId: string, userId: string): Promise<ActivityLog>;
}
```

### Frontend Types

```typescript
export interface ActivityLog {
  id: string;
  action: string;
  userId: string | null;
  actorName: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityLogFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityLogResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}
```

## Data Models

### Action Types (Extensible Enum)

Predefined action types with ability to add custom ones:

```typescript
export enum ActivityAction {
  // Authentication
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Content Management
  PAGE_CREATED = 'PAGE_CREATED',
  PAGE_UPDATED = 'PAGE_UPDATED',
  PAGE_DELETED = 'PAGE_DELETED',
  PAGE_PUBLISHED = 'PAGE_PUBLISHED',
  
  BLOG_POST_CREATED = 'BLOG_POST_CREATED',
  BLOG_POST_UPDATED = 'BLOG_POST_UPDATED',
  BLOG_POST_DELETED = 'BLOG_POST_DELETED',
  BLOG_POST_PUBLISHED = 'BLOG_POST_PUBLISHED',
  
  // E-commerce
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  
  // Settings
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  MENU_UPDATED = 'MENU_UPDATED',
  WIDGET_ADDED = 'WIDGET_ADDED',
  WIDGET_REMOVED = 'WIDGET_REMOVED',
  
  // System
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_WARNING = 'SYSTEM_WARNING',
}
```

### Metadata Structure Examples

**User Update Example:**
```json
{
  "changes": {
    "name": { "old": "John Doe", "new": "John Smith" },
    "email": { "old": "john@old.com", "new": "john@new.com" }
  },
  "fieldsChanged": ["name", "email"]
}
```

**Order Status Change Example:**
```json
{
  "oldStatus": "PENDING",
  "newStatus": "PROCESSING",
  "orderId": "order_123",
  "orderNumber": "ORD-2024-001"
}
```

**Product Creation Example:**
```json
{
  "productName": "New Widget",
  "sku": "WDG-001",
  "price": 29.99,
  "category": "Electronics"
}
```

## Error Handling

### Backend Error Handling

1. **Validation Errors**: Return 400 Bad Request with validation details
2. **Authentication Errors**: Return 401 Unauthorized
3. **Permission Errors**: Return 403 Forbidden
4. **Not Found Errors**: Return 404 Not Found
5. **Database Errors**: Log error, return 500 Internal Server Error
6. **Logging Failures**: Never throw - log to console and continue

### Frontend Error Handling

1. **Network Errors**: Show toast notification, retry option
2. **Permission Errors**: Redirect to access denied page
3. **Loading States**: Show skeleton loaders
4. **Empty States**: Show friendly "No activities yet" message

### Graceful Degradation

- If activity logging fails, the main operation should still succeed
- Use try-catch blocks around all logging calls
- Log failures to console for debugging
- Consider optional background job queue for reliability

## Testing Strategy

### Backend Tests

**Unit Tests:**
- Activity log service methods
- DTO validation
- Helper functions
- Metadata sanitization

**Integration Tests:**
- API endpoints with authentication
- Database operations
- Query filtering and pagination
- Relationship handling (user deletion)

**E2E Tests:**
- Complete activity logging workflow
- User creates product → activity logged
- User updates order → activity logged with changes
- Admin views activity log → filtered results

### Frontend Tests

**Component Tests:**
- ActivityLogList rendering
- ActivityLogFilters functionality
- ActivityLogItem display
- Pagination controls

**Integration Tests:**
- API client methods
- Filter application
- Pagination navigation
- Error state handling

**Accessibility Tests:**
- Keyboard navigation
- Screen reader compatibility
- ARIA labels
- Color contrast

## Performance Considerations

### Database Optimization

1. **Indexes**: Create indexes on frequently queried fields (userId, entityType, createdAt)
2. **Partitioning**: Consider table partitioning by date for large datasets
3. **Archiving**: Implement retention policy to archive old logs
4. **Query Limits**: Enforce maximum page size (100 items)

### Backend Optimization

1. **Async Logging**: Use fire-and-forget pattern for non-critical logs
2. **Batch Operations**: Consider batching for high-volume scenarios
3. **Caching**: Cache user names to reduce joins
4. **Connection Pooling**: Ensure proper database connection management

### Frontend Optimization

1. **Pagination**: Load data in chunks
2. **Virtual Scrolling**: For very long lists
3. **Debounced Filters**: Debounce filter inputs
4. **Lazy Loading**: Load details on demand

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: Role-based access (admin/manager only)
3. **Input Sanitization**: Sanitize all user inputs
4. **Sensitive Data**: Never log passwords, tokens, or PII
5. **Rate Limiting**: Prevent abuse of logging endpoints
6. **SQL Injection**: Use parameterized queries (Prisma handles this)
7. **XSS Prevention**: Sanitize metadata before display

## Extensibility

### Adding Custom Action Types

```typescript
// Simply use string literals for custom actions
await activityLogService.logActivity({
  action: 'CUSTOM_WORKFLOW_COMPLETED',
  userId: user.id,
  entityType: 'Workflow',
  entityId: workflow.id,
  metadata: { workflowName: workflow.name, steps: 5 }
});
```

### Integration with Existing Modules

**Example: Automatic logging in Products module**

```typescript
@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaClient,
    private activityLog: ActivityLogService
  ) {}

  async create(data: CreateProductDto, userId: string) {
    const product = await this.prisma.product.create({ data });
    
    // Log the activity
    await this.activityLog.logEntityCreated(
      'Product',
      product.id,
      userId,
      { productName: product.name, sku: product.sku }
    );
    
    return product;
  }
}
```

### Custom Decorator for Automatic Logging

```typescript
export function LogActivity(action: string, entityType?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Extract userId from context
      const userId = this.getCurrentUserId?.();
      
      // Log activity
      await this.activityLog?.logActivity({
        action,
        userId,
        entityType,
        entityId: result?.id,
      });
      
      return result;
    };
    
    return descriptor;
  };
}
```

## Migration Strategy

1. **Phase 1**: Create database schema and run migration
2. **Phase 2**: Implement backend service and API
3. **Phase 3**: Add frontend UI
4. **Phase 4**: Integrate with existing modules (optional, incremental)

## Future Enhancements

- Real-time activity feed using WebSockets
- Export activity logs to CSV/JSON
- Advanced analytics and reporting
- Activity log retention policies with automatic archiving
- Audit log signing for compliance
- Integration with external SIEM systems
