---
inclusion: fileMatch
fileMatchPattern: '{backend/src/email/**,frontend/src/app/dashboard/settings/email/**,frontend/src/lib/api/email.ts,frontend/src/types/email.ts,backend/prisma/seed-data/email.seed.ts}'
---

# SMTP Email Service

## Overview

Production-ready email system with SMTP configuration, templating, queue management, rate limiting, and comprehensive logging.

## Stack

- **Backend**: NestJS + Prisma + BullMQ + Nodemailer
- **Frontend**: Next.js 14 + React
- **Queue**: Redis (BullMQ)
- **Database**: PostgreSQL

## Key Components

**Backend** (`backend/src/email/`):
- `email.service.ts` - Core email logic
- `email.controller.ts` - API endpoints
- `services/smtp.service.ts` - SMTP transport
- `services/email-queue.service.ts` - Queue management
- `services/email-template.service.ts` - Template CRUD
- `processors/email-queue.processor.ts` - Queue worker

**Frontend** (`frontend/src/app/dashboard/settings/email/`):
- `components/EmailConfigurationForm.tsx` - SMTP config
- `components/EmailTemplateList.tsx` - Template management
- `components/EmailLogsTable.tsx` - Email logs
- `components/EmailStatsCards.tsx` - Statistics

## SMTP Configuration

### Supported Providers

**Standard (username + password)**:
- Gmail, Outlook, SendGrid, Mailgun, etc.
- Username: email or API username
- Password: password or API key

**Brevo/Sendinblue (key-only)**:
- Host: `smtp-relay.brevo.com`
- Port: `587`
- Secure: `false`
- Username: Full SMTP key (e.g., `xsmtpsib-...`)
- Password: **Leave empty**

### Backend Implementation

```typescript
// Save configuration
const config = await emailService.saveConfiguration({
  smtpHost: 'smtp-relay.brevo.com',
  smtpPort: 587,
  smtpSecure: false,
  smtpUsername: 'xsmtpsib-your-key',
  smtpPassword: '', // Optional - empty for Brevo
  senderEmail: 'noreply@example.com',
  senderName: 'My App',
}, userId);

// Send email
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Welcome!</h1>',
  category: 'TRANSACTIONAL',
  priority: 'NORMAL',
});

// Send with template
await emailService.sendTemplateEmail({
  to: 'user@example.com',
  templateId: 'welcome-template-id',
  variables: { userName: 'John', verifyUrl: 'https://...' },
  category: 'TRANSACTIONAL',
  priority: 'HIGH',
});
```

### Frontend Implementation

```typescript
import { emailConfigApi } from '@/lib/api/email';

// Save configuration
const config = await emailConfigApi.saveConfiguration({
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpSecure: true,
  smtpUsername: 'user@example.com',
  smtpPassword: 'password', // Optional
  senderEmail: 'noreply@example.com',
  senderName: 'My App',
});

// Toggle system
await emailConfigApi.toggleEmailSystem(true);

// Send test email
await emailConfigApi.sendTestEmail({
  recipient: 'test@example.com',
  message: 'Test message',
});

// Get logs
const logs = await emailConfigApi.getEmailLogs({
  page: 1,
  limit: 20,
  status: 'SENT',
  category: 'TRANSACTIONAL',
});
```

## Email Templates

### Template Variables

Use `{{variableName}}` syntax:

```html
<h1>Hello {{userName}}!</h1>
<p>Click here: <a href="{{verifyUrl}}">Verify Email</a></p>
<p>Code: {{verificationCode}}</p>
```

### Template Management

```typescript
// Create template
const template = await templateService.create({
  name: 'welcome-email',
  subject: 'Welcome {{userName}}!',
  htmlBody: '<h1>Welcome {{userName}}!</h1>',
  textBody: 'Welcome {{userName}}!',
  category: 'TRANSACTIONAL',
  variables: ['userName', 'verifyUrl'],
}, userId);

// Use template
await emailService.sendTemplateEmail({
  to: 'user@example.com',
  templateId: template.id,
  variables: {
    userName: 'John',
    verifyUrl: 'https://example.com/verify/123',
  },
});
```

## Queue System

### Configuration

**File**: `backend/src/email/email.module.ts`

```typescript
BullModule.registerQueue({
  name: 'email-queue',
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
})
```

### Queue Operations

```typescript
// Add to queue
const job = await emailQueueService.addToQueue({
  to: 'user@example.com',
  subject: 'Test',
  html: '<p>Test</p>',
  category: 'TRANSACTIONAL',
  priority: 'NORMAL',
});

// Get queue stats
const stats = await emailQueueService.getQueueStats();
// { waiting: 5, active: 2, completed: 100, failed: 3 }

// Retry failed job
await emailQueueService.retryJob(jobId);

// Clear queue
await emailQueueService.clearQueue();
```

## Rate Limiting

### Default Limits

- **Per User**: 100 emails/hour
- **Global**: 1000 emails/hour
- **Configurable**: Via database

### Implementation

```typescript
// Check rate limit (automatic in sendEmail)
const canSend = await emailService.checkRateLimit(userId);

// Update limits
await prisma.emailRateLimit.upsert({
  where: { userId },
  update: { maxEmailsPerHour: 200 },
  create: { userId, maxEmailsPerHour: 200 },
});
```

## Email Categories

- `TRANSACTIONAL` - Order confirmations, password resets
- `MARKETING` - Newsletters, promotions
- `NOTIFICATION` - Alerts, updates
- `SYSTEM` - System messages, errors

## Email Priority

- `HIGH` - Immediate delivery
- `NORMAL` - Standard queue
- `LOW` - Batch processing

## Email Status

- `SENT` - Successfully delivered
- `FAILED` - Delivery failed
- `BOUNCED` - Email bounced
- `SKIPPED` - User preferences disabled

## Database Schema

```prisma
model EmailConfiguration {
  id           String   @id @default(cuid())
  smtpHost     String   @map("smtp_host")
  smtpPort     Int      @map("smtp_port")
  smtpSecure   Boolean  @map("smtp_secure")
  smtpUsername String   @map("smtp_username")
  smtpPassword String   @map("smtp_password") // Encrypted
  senderEmail  String   @map("sender_email")
  senderName   String   @map("sender_name")
  isEnabled    Boolean  @default(false) @map("is_enabled")
  createdBy    String   @map("created_by")
  updatedBy    String   @map("updated_by")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  @@map("email_configuration")
}

model EmailTemplate {
  id          String            @id @default(cuid())
  name        String            @unique
  subject     String
  htmlBody    String            @map("html_body")
  textBody    String?           @map("text_body")
  category    EmailCategory
  variables   String[]
  isActive    Boolean           @default(true) @map("is_active")
  createdBy   String            @map("created_by")
  updatedBy   String            @map("updated_by")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  
  @@map("email_templates")
}

model EmailLog {
  id          String        @id @default(cuid())
  recipient   String
  subject     String
  category    EmailCategory
  priority    EmailPriority
  status      EmailStatus
  error       String?
  sentAt      DateTime?     @map("sent_at")
  createdAt   DateTime      @default(now()) @map("created_at")
  
  @@map("email_logs")
}

enum EmailCategory {
  TRANSACTIONAL
  MARKETING
  NOTIFICATION
  SYSTEM
}

enum EmailPriority {
  HIGH
  NORMAL
  LOW
}

enum EmailStatus {
  SENT
  FAILED
  BOUNCED
  SKIPPED
}
```

## API Endpoints

### Configuration
- `POST /email/configuration` - Save SMTP config (Super Admin)
- `GET /email/configuration` - Get config (Super Admin)
- `POST /email/toggle` - Enable/disable system (Super Admin)
- `POST /email/test` - Send test email (Super Admin)

### Templates
- `GET /email/templates` - List templates (Super Admin)
- `GET /email/templates/:id` - Get template (Super Admin)
- `POST /email/templates` - Create template (Super Admin)
- `PATCH /email/templates/:id` - Update template (Super Admin)
- `DELETE /email/templates/:id` - Delete template (Super Admin)

### Logs
- `GET /email/logs` - Get email logs (Super Admin)
- `GET /email/stats` - Get statistics (Super Admin)

### Queue
- `GET /email/queue/stats` - Queue statistics (Super Admin)
- `POST /email/queue/retry/:id` - Retry failed job (Super Admin)
- `POST /email/queue/clear` - Clear queue (Super Admin)

## Common Tasks

### Setup Email System

1. **Configure SMTP** (Dashboard → Settings → Email):
   - Enter SMTP host, port, credentials
   - Save configuration
   - Send test email

2. **Enable System**:
   - Toggle "Email System Enabled"

3. **Create Templates** (optional):
   - Add email templates
   - Use variables for dynamic content

### Send Email

```typescript
// Simple email
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Hello World!</p>',
  category: 'TRANSACTIONAL',
  priority: 'NORMAL',
});

// With template
await emailService.sendTemplateEmail({
  to: 'user@example.com',
  templateId: 'welcome-template-id',
  variables: { userName: 'John' },
});

// Multiple recipients
await emailService.sendEmail({
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Announcement',
  html: '<p>Important update</p>',
});
```

### Handle User Preferences

```typescript
// Check if user allows emails
const preferences = await prisma.notificationPreference.findUnique({
  where: { userId },
});

if (!preferences?.emailEnabled) {
  // Skip email, log as SKIPPED
}
```

### Monitor Queue

```typescript
// Get stats
const stats = await emailQueueService.getQueueStats();
console.log(`Waiting: ${stats.waiting}, Active: ${stats.active}`);

// Retry failed
const failedJobs = await emailQueueService.getFailedJobs();
for (const job of failedJobs) {
  await emailQueueService.retryJob(job.id);
}
```

## Security

### Password Encryption

- **Algorithm**: AES-256-CBC
- **Service**: `EncryptionService`
- **Storage**: Encrypted in database
- **Decryption**: Only when sending emails

### Access Control

- **All endpoints**: Super Admin only
- **Guards**: `JwtAuthGuard` + `SuperAdminGuard`
- **Test emails**: Work even when system disabled

### Rate Limiting

- **Per user**: Prevents spam
- **Global**: Protects SMTP server
- **Configurable**: Adjust per user/role

## Troubleshooting

### "Authentication failed"

**Cause**: Wrong credentials or provider config
**Solution**:
1. Verify SMTP host, port, username, password
2. For Brevo: Use full key as username, empty password
3. Check provider documentation
4. Send test email to see detailed error

### "Email system disabled"

**Cause**: System toggle is off
**Solution**: Enable in Dashboard → Settings → Email

### "Rate limit exceeded"

**Cause**: Too many emails sent
**Solution**:
1. Check rate limits in database
2. Increase limits if needed
3. Wait for rate limit window to reset

### Queue not processing

**Cause**: Redis not running or worker not started
**Solution**:
1. Check Redis: `redis-cli ping`
2. Check worker logs
3. Restart backend

## Configuration

### Environment Variables

```env
# Backend .env
REDIS_HOST=localhost
REDIS_PORT=6379
ENCRYPTION_KEY=your-32-char-encryption-key
```

### Queue Settings

**File**: `backend/src/email/email.module.ts`

```typescript
defaultJobOptions: {
  attempts: 3,              // Retry 3 times
  backoff: {
    type: 'exponential',
    delay: 2000,            // Start with 2s delay
  },
  removeOnComplete: true,   // Clean up successful jobs
  removeOnFail: false,      // Keep failed jobs for debugging
}
```

## Testing

```bash
# Backend tests
cd backend
npm test -- email.service.spec.ts
npm test -- email.controller.spec.ts
npm run test:e2e -- email.e2e-spec.ts

# Manual test
# 1. Configure SMTP in dashboard
# 2. Send test email
# 3. Check logs for status
```

## Resources

- **Spec**: `.kiro/specs/email-notification-system/`
- **Seed Data**: `backend/prisma/seed-data/email.seed.ts`
- **API Docs**: `backend/EMAIL_SYSTEM_DOCUMENTATION.md`
