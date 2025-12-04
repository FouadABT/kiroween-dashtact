# Email Notification System - Design Document

## Overview

The Email Notification System is a core, extensible feature that enables configurable SMTP-based email delivery within the full-stack dashboard starter kit. The system provides super administrators with complete control over email configuration, monitoring, and management while offering developers a clean service interface for integrating email notifications throughout the application.

The design emphasizes security, reliability, and extensibility. SMTP credentials are encrypted at rest, emails are processed asynchronously through a queue system, and the architecture supports future enhancements such as multiple email providers, advanced templating engines, and marketing automation features.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Email Settings Page (Super Admin Only)                     │
│  - Configuration Form                                        │
│  - Test Email Interface                                      │
│  - Email Logs Viewer                                         │
│  - Template Manager                                          │
│  - Rate Limit Dashboard                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                  Backend (NestJS)                            │
├─────────────────────────────────────────────────────────────┤
│  Email Module                                                │
│  ├── EmailController (Super Admin endpoints)                │
│  ├── EmailService (Core business logic)                     │
│  ├── EmailQueueService (Async processing)                   │
│  ├── EmailTemplateService (Template management)             │
│  ├── SmtpService (SMTP connection & delivery)               │
│  └── EmailGuard (Role-based access control)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Database (PostgreSQL)                       │
├─────────────────────────────────────────────────────────────┤
│  - email_configuration (SMTP settings)                       │
│  - email_templates (Reusable templates)                      │
│  - email_queue (Pending/processing emails)                   │
│  - email_logs (Delivery history)                             │
│  - settings (System-wide feature toggles)                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Email Configuration Flow:**
1. Super Admin submits SMTP configuration via frontend form
2. Backend validates and encrypts sensitive credentials
3. Configuration stored in `email_configuration` table
4. System validates configuration with test connection

**Email Sending Flow:**
1. Application service calls `EmailService.sendEmail()`
2. Email validated and added to `email_queue` with PENDING status
3. Background job processes queue asynchronously
4. `SmtpService` attempts delivery via configured SMTP server
5. Result logged to `email_logs` with status and metadata
6. Failed emails retried with exponential backoff (max 3 attempts)

**Template Usage Flow:**
1. Service calls `EmailService.sendEmail()` with template ID
2. `EmailTemplateService` retrieves template from database
3. Template variables replaced with provided data
4. Rendered email added to queue for delivery

## Components and Interfaces

### Backend Module Structure

```
backend/src/email/
├── email.module.ts
├── email.controller.ts
├── email.service.ts
├── services/
│   ├── smtp.service.ts
│   ├── email-queue.service.ts
│   ├── email-template.service.ts
│   └── email-encryption.service.ts
├── guards/
│   └── super-admin.guard.ts
├── dto/
│   ├── email-configuration.dto.ts
│   ├── send-email.dto.ts
│   ├── email-template.dto.ts
│   ├── test-email.dto.ts
│   └── email-log-filter.dto.ts
├── entities/
│   ├── email-configuration.entity.ts
│   ├── email-template.entity.ts
│   ├── email-queue.entity.ts
│   └── email-log.entity.ts
└── processors/
    └── email-queue.processor.ts
```

### Database Schema

```prisma
model EmailConfiguration {
  id              String   @id @default(uuid())
  smtpHost        String
  smtpPort        Int
  smtpSecure      Boolean  @default(true)
  smtpUsername    String
  smtpPassword    String   // Encrypted
  senderEmail     String
  senderName      String
  isEnabled       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String
  updatedBy       String
  
  @@map("email_configuration")
}

model EmailTemplate {
  id              String   @id @default(uuid())
  name            String   @unique
  slug            String   @unique
  subject         String
  htmlBody        String   @db.Text
  textBody        String?  @db.Text
  variables       Json     // Array of variable names
  category        String   @default("SYSTEM")
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String
  updatedBy       String
  
  emailLogs       EmailLog[]
  
  @@map("email_templates")
}

model EmailQueue {
  id              String   @id @default(uuid())
  recipient       String
  subject         String
  htmlBody        String?  @db.Text
  textBody        String?  @db.Text
  templateId      String?
  templateData    Json?
  status          EmailQueueStatus @default(PENDING)
  priority        Int      @default(5)
  attempts        Int      @default(0)
  maxAttempts     Int      @default(3)
  lastAttemptAt   DateTime?
  nextAttemptAt   DateTime?
  error           String?  @db.Text
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([status, nextAttemptAt])
  @@index([createdAt])
  @@map("email_queue")
}

model EmailLog {
  id              String   @id @default(uuid())
  recipient       String
  subject         String
  templateId      String?
  template        EmailTemplate? @relation(fields: [templateId], references: [id])
  status          EmailStatus
  sentAt          DateTime?
  error           String?  @db.Text
  metadata        Json?
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  createdAt       DateTime @default(now())
  
  @@index([recipient])
  @@index([status])
  @@index([createdAt])
  @@map("email_logs")
}

enum EmailQueueStatus {
  PENDING
  PROCESSING
  SENT
  FAILED
  CANCELLED
}

enum EmailStatus {
  SENT
  FAILED
  BOUNCED
  SKIPPED
}
```

### API Endpoints

**Email Configuration (Super Admin Only)**

```typescript
// POST /api/email/configuration
// Create or update SMTP configuration
interface EmailConfigurationDto {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
  senderName: string;
}

// GET /api/email/configuration
// Retrieve current configuration (passwords masked)
interface EmailConfigurationResponse {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string; // Returns "********"
  senderEmail: string;
  senderName: string;
  isEnabled: boolean;
  updatedAt: string;
}

// PATCH /api/email/configuration/toggle
// Enable or disable email system
interface ToggleEmailDto {
  isEnabled: boolean;
}

// POST /api/email/configuration/test
// Send test email
interface TestEmailDto {
  recipient: string;
  message?: string;
}
```

**Email Templates (Super Admin Only)**

```typescript
// POST /api/email/templates
// Create new email template
interface CreateEmailTemplateDto {
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: string[];
  category?: string;
}

// GET /api/email/templates
// List all templates
interface EmailTemplateListResponse {
  templates: EmailTemplate[];
  total: number;
}

// GET /api/email/templates/:id
// Get template details
interface EmailTemplateResponse {
  id: string;
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// PUT /api/email/templates/:id
// Update template
interface UpdateEmailTemplateDto {
  name?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  variables?: string[];
  isActive?: boolean;
}

// DELETE /api/email/templates/:id
// Delete template (if not in use)
```

**Email Logs (Super Admin Only)**

```typescript
// GET /api/email/logs
// Retrieve email delivery logs
interface EmailLogFilterDto {
  page?: number;
  limit?: number;
  status?: EmailStatus;
  recipient?: string;
  startDate?: string;
  endDate?: string;
}

interface EmailLogResponse {
  logs: EmailLog[];
  total: number;
  page: number;
  limit: number;
}

// GET /api/email/logs/:id
// Get detailed log entry
interface EmailLogDetailResponse {
  id: string;
  recipient: string;
  subject: string;
  templateId?: string;
  templateName?: string;
  status: EmailStatus;
  sentAt?: string;
  error?: string;
  metadata?: any;
  createdAt: string;
}

// GET /api/email/logs/stats
// Get email statistics
interface EmailStatsResponse {
  totalSent: number;
  totalFailed: number;
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
  queuedCount: number;
  failureRate: number;
}
```

**Email Sending (Internal Service)**

```typescript
// Service method for sending emails
interface SendEmailOptions {
  recipient: string | string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  priority?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

class EmailService {
  async sendEmail(options: SendEmailOptions): Promise<string> {
    // Returns queue ID for tracking
  }
  
  async sendTemplateEmail(
    templateSlug: string,
    recipient: string,
    data: Record<string, any>
  ): Promise<string> {
    // Convenience method for template-based emails
  }
}
```

### Frontend Components

```
frontend/src/app/dashboard/settings/email/
├── page.tsx                          # Main email settings page
├── components/
│   ├── EmailConfigurationForm.tsx    # SMTP configuration form
│   ├── EmailToggle.tsx               # Enable/disable switch
│   ├── TestEmailDialog.tsx           # Test email modal
│   ├── EmailTemplateList.tsx         # Template management list
│   ├── EmailTemplateEditor.tsx       # Template creation/editing
│   ├── EmailLogsTable.tsx            # Email delivery logs
│   ├── EmailStatsCards.tsx           # Statistics dashboard
│   └── RateLimitSettings.tsx         # Rate limit configuration

frontend/src/lib/api/
├── email.ts                          # Email API client

frontend/src/types/
├── email.ts                          # Email type definitions
```

## Data Models

### EmailConfiguration

```typescript
interface EmailConfiguration {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string; // Encrypted in DB
  senderEmail: string;
  senderName: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### EmailTemplate

```typescript
interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### EmailQueue

```typescript
interface EmailQueue {
  id: string;
  recipient: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  status: EmailQueueStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

enum EmailQueueStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
```

### EmailLog

```typescript
interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  templateId?: string;
  status: EmailStatus;
  sentAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
  userId?: string;
  createdAt: Date;
}

enum EmailStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  SKIPPED = 'SKIPPED'
}
```

## Error Handling

### Error Types

```typescript
class EmailSystemDisabledError extends Error {
  constructor() {
    super('Email system is currently disabled');
    this.name = 'EmailSystemDisabledError';
  }
}

class EmailConfigurationMissingError extends Error {
  constructor() {
    super('Email configuration is incomplete or missing');
    this.name = 'EmailConfigurationMissingError';
  }
}

class SmtpConnectionError extends Error {
  constructor(message: string) {
    super(`SMTP connection failed: ${message}`);
    this.name = 'SmtpConnectionError';
  }
}

class EmailValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'EmailValidationError';
  }
}

class TemplateNotFoundError extends Error {
  constructor(templateId: string) {
    super(`Email template not found: ${templateId}`);
    this.name = 'TemplateNotFoundError';
  }
}

class RateLimitExceededError extends Error {
  constructor(limit: number, window: string) {
    super(`Rate limit exceeded: ${limit} emails per ${window}`);
    this.name = 'RateLimitExceededError';
  }
}
```

### Error Handling Strategy

**Service Layer:**
- Validate all inputs before processing
- Catch and log SMTP connection errors
- Return structured error responses with error codes
- Implement retry logic for transient failures

**Controller Layer:**
- Use NestJS exception filters for consistent error responses
- Return appropriate HTTP status codes (400, 403, 404, 500)
- Sanitize error messages before sending to client
- Log detailed errors server-side

**Frontend Layer:**
- Display user-friendly error messages
- Show validation errors inline on forms
- Provide retry options for failed operations
- Log errors to monitoring service

**Queue Processing:**
- Catch all errors during email delivery
- Update queue item with error details
- Implement exponential backoff for retries
- Move permanently failed emails to failed status

## Testing Strategy

### Unit Tests

**Backend Services:**
```typescript
// email.service.spec.ts
describe('EmailService', () => {
  it('should queue email when system is enabled');
  it('should throw error when system is disabled');
  it('should validate email addresses');
  it('should render template with variables');
  it('should respect user notification preferences');
});

// smtp.service.spec.ts
describe('SmtpService', () => {
  it('should connect to SMTP server with valid config');
  it('should throw error with invalid credentials');
  it('should send email successfully');
  it('should handle connection timeout');
});

// email-queue.service.spec.ts
describe('EmailQueueService', () => {
  it('should add email to queue');
  it('should process pending emails');
  it('should retry failed emails with backoff');
  it('should mark email as failed after max attempts');
});

// email-template.service.spec.ts
describe('EmailTemplateService', () => {
  it('should create template with valid data');
  it('should validate template variables');
  it('should render template with data');
  it('should prevent deletion of active templates');
});
```

**Frontend Components:**
```typescript
// EmailConfigurationForm.test.tsx
describe('EmailConfigurationForm', () => {
  it('should render all configuration fields');
  it('should validate required fields');
  it('should mask password field');
  it('should submit valid configuration');
  it('should display error messages');
});

// EmailLogsTable.test.tsx
describe('EmailLogsTable', () => {
  it('should display email logs');
  it('should filter by status');
  it('should filter by date range');
  it('should paginate results');
});
```

### Integration Tests

```typescript
// email.integration.spec.ts
describe('Email System Integration', () => {
  it('should configure SMTP and send test email');
  it('should queue and process email asynchronously');
  it('should render template and send email');
  it('should respect rate limits');
  it('should log email delivery results');
  it('should enforce super admin access control');
});
```

### End-to-End Tests

```typescript
// email-configuration.e2e.spec.ts
describe('Email Configuration E2E', () => {
  it('should allow super admin to configure SMTP');
  it('should prevent non-admin access to settings');
  it('should send test email successfully');
  it('should enable and disable email system');
});

// email-sending.e2e.spec.ts
describe('Email Sending E2E', () => {
  it('should send email through complete flow');
  it('should retry failed emails');
  it('should log delivery results');
});
```

### Manual Testing Checklist

- [ ] Super admin can access email settings
- [ ] Non-admin users cannot access email settings
- [ ] SMTP configuration saves successfully
- [ ] Password fields are masked in UI
- [ ] Test email sends successfully
- [ ] Test email shows appropriate error messages
- [ ] Email system toggle works correctly
- [ ] Emails queue when system is enabled
- [ ] Emails are blocked when system is disabled
- [ ] Templates create and save successfully
- [ ] Template variables render correctly
- [ ] Email logs display delivery history
- [ ] Email logs filter by status and date
- [ ] Rate limits prevent excessive sending
- [ ] Failed emails retry with backoff
- [ ] Email statistics display correctly

## Security Considerations

### Credential Encryption

- SMTP passwords encrypted using AES-256-GCM
- Encryption keys stored in environment variables
- Passwords never logged or exposed in API responses
- Passwords masked in UI (show as "********")

### Access Control

- Email configuration endpoints protected by SuperAdminGuard
- Role verification on every request
- Audit logging for all configuration changes
- User ID tracked for all email operations

### Input Validation

- Email addresses validated with RFC 5322 regex
- SMTP configuration validated before saving
- Template variables sanitized to prevent injection
- Rate limits enforced to prevent abuse

### Data Protection

- Email logs contain minimal PII
- Sensitive email content not stored long-term
- Old logs archived and purged after retention period
- Database connections use SSL/TLS

## Performance Considerations

### Asynchronous Processing

- Emails queued immediately, processed in background
- Queue processor runs on configurable interval (default: 30 seconds)
- Multiple queue workers for high-volume scenarios
- Priority-based processing for urgent emails

### Database Optimization

- Indexes on frequently queried fields (status, createdAt, recipient)
- Pagination for large result sets
- Archival strategy for old logs (90+ days)
- Connection pooling for database efficiency

### Caching Strategy

- Email configuration cached in memory (5-minute TTL)
- Templates cached after first retrieval
- Cache invalidated on configuration updates
- Rate limit counters stored in Redis (if available)

### Monitoring

- Track queue depth and processing rate
- Alert on high failure rates
- Monitor SMTP connection health
- Log slow queries and performance issues

## Extensibility

### Future Enhancements

**Multiple Email Providers:**
- Abstract SMTP service behind provider interface
- Support SendGrid, Mailgun, AWS SES, etc.
- Provider-specific configuration and features
- Automatic failover between providers

**Advanced Templating:**
- Rich template editor with WYSIWYG interface
- Template inheritance and partials
- Conditional logic in templates
- Multi-language template support

**Email Campaigns:**
- Bulk email sending with segmentation
- A/B testing for subject lines and content
- Campaign analytics and reporting
- Unsubscribe management

**Webhooks:**
- Delivery status webhooks from providers
- Bounce and complaint handling
- Real-time delivery tracking
- Integration with external systems

**Attachments:**
- Support for email attachments
- File size limits and validation
- Integration with media library
- Inline image embedding

### Extension Points

```typescript
// Provider abstraction
interface EmailProvider {
  send(email: EmailMessage): Promise<EmailResult>;
  testConnection(): Promise<boolean>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

// Template engine abstraction
interface TemplateEngine {
  render(template: string, data: Record<string, any>): string;
  validate(template: string): ValidationResult;
}

// Event hooks
interface EmailEventHooks {
  onBeforeSend?(email: EmailMessage): Promise<void>;
  onAfterSend?(email: EmailMessage, result: EmailResult): Promise<void>;
  onSendFailed?(email: EmailMessage, error: Error): Promise<void>;
}
```

## Migration Strategy

### Initial Setup

1. Add email module to backend
2. Create database migrations for email tables
3. Seed default email templates
4. Add email settings page to frontend
5. Update permissions to include email management

### Rollout Plan

**Phase 1: Core Infrastructure**
- Implement email module and services
- Create database schema
- Build SMTP integration
- Add basic configuration UI

**Phase 2: Queue and Logging**
- Implement email queue system
- Add background job processor
- Create email logging
- Build logs viewer UI

**Phase 3: Templates and Testing**
- Implement template management
- Add template editor UI
- Create test email functionality
- Build email statistics dashboard

**Phase 4: Integration and Polish**
- Integrate with notification system
- Add rate limiting
- Implement retry logic
- Complete documentation

### Backward Compatibility

- Email system disabled by default
- Existing notification system continues to work
- Gradual migration of notifications to email
- No breaking changes to existing APIs
