# Notification System - Developer Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Sending Notifications](#sending-notifications)
3. [Creating Templates](#creating-templates)
4. [Adding Notification Categories](#adding-notification-categories)
5. [Customizing Notification UI](#customizing-notification-ui)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)
8. [Advanced Topics](#advanced-topics)

## Getting Started

### Prerequisites

- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Next.js 14 + React + TypeScript
- JWT authentication system configured
- Database migrations applied

### Installation

The notification system is already integrated. To verify:

```bash
# Backend
cd backend
npm run prisma:generate
npm run start:dev

# Frontend
cd frontend
npm run dev
```

### Quick Test

```typescript
// Backend: Send a test notification
import { NotificationHelpers } from './notifications/notification-helpers';

await NotificationHelpers.sendSystemNotification(
  'user-id',
  'Test Notification',
  'This is a test message'
);
```

## Sending Notifications

### Basic Notification

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications/notifications.service';

@Injectable()
export class MyService {
  constructor(private notificationsService: NotificationsService) {}
  
  async sendWelcomeNotification(userId: string) {
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

### Using Helper Functions

```typescript
import { NotificationHelpers } from './notifications/notification-helpers';

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
```

