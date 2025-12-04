# Email Notification System - Developer Documentation

## Overview

The Email Notification System provides configurable SMTP-based email delivery for the application. This system is designed for Super Administrators to configure and manage email settings, templates, and monitor email delivery.

## Table of Contents

1. [SMTP Configuration](#smtp-configuration)
2. [Template Variable Syntax](#template-variable-syntax)
3. [API Endpoints](#api-endpoints)
4. [Integration Guide](#integration-guide)
5. [Testing](#testing)

## SMTP Configuration

### Configuration Process

Super Administrators can configure SMTP settings through the dashboard:

1. Navigate to **Dashboard > Settings > Email Settings**
2. Fill in the SMTP configuration form:
   - **SMTP Host**: Your email server hostname (e.g., `smtp.gmail.com`)
   - **SMTP Port**: Port number (typically 587 for TLS, 465 for SSL)
   - **Secure Connection**: Enable for SSL/TLS
   - **Username**: SMTP authentication username
   - **Password**: SMTP authentication password (encrypted at rest)
   - **Sender Email**: From email address
   - **Sender Name**: Display name for sender

3. Click **Save Configuration**
4. Test the configuration using the **Send Test Email** button

### Security

- Passwords are encrypted using AES-256-GCM before storage
- Passwords are masked in the UI and API responses
- Only Super Administrators can access email configuration

### Example Configuration

```typescript
const config = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpSecure: true,
  smtpUsername: 'your-email@gmail.com',
  smtpPassword: 'your-app-password',
  senderEmail: 'noreply@yourapp.com',
  senderName: 'Your App Name'
};
```


## Template Variable Syntax

### Variable Format

Email templates support dynamic variable substitution using double curly brace syntax:

```
{{variableName}}
```

### Example Template

**Subject:**
```
Welcome to {{appName}}, {{userName}}!
```

**HTML Body:**
```html
<h1>Welcome {{userName}}!</h1>
<p>Thank you for joining {{appName}}.</p>
<p>Your account email is: {{userEmail}}</p>
<a href="{{verificationLink}}">Verify your email</a>
```

**Text Body:**
```
Welcome {{userName}}!

Thank you for joining {{appName}}.
Your account email is: {{userEmail}}

Verify your email: {{verificationLink}}
```

### Variable Validation

- Variables must be alphanumeric with underscores
- Variables are case-sensitive
- All variables used in template must be declared in the `variables` array
- Missing variables will be replaced with empty strings

### Common Variables

- `{{userName}}` - User's display name
- `{{userEmail}}` - User's email address
- `{{appName}}` - Application name
- `{{verificationLink}}` - Email verification URL
- `{{resetLink}}` - Password reset URL
- `{{notificationCount}}` - Number of notifications
- `{{date}}` - Current date
- `{{time}}` - Current time


## API Endpoints

All email endpoints require Super Administrator authentication.

### Configuration Endpoints

#### Save SMTP Configuration
```http
POST /email/configuration
Authorization: Bearer <token>
Content-Type: application/json

{
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpSecure": true,
  "smtpUsername": "user@gmail.com",
  "smtpPassword": "password",
  "senderEmail": "noreply@app.com",
  "senderName": "App Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "config-id",
    "smtpHost": "smtp.gmail.com",
    "smtpPassword": "********",
    "isEnabled": false
  }
}
```

#### Get Configuration
```http
GET /email/configuration
Authorization: Bearer <token>
```

#### Toggle Email System
```http
PATCH /email/configuration/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "isEnabled": true
}
```

#### Send Test Email
```http
POST /email/configuration/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient": "test@example.com",
  "message": "Optional test message"
}
```


### Template Endpoints

#### Create Template
```http
POST /email/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Welcome Email",
  "slug": "welcome-email",
  "subject": "Welcome {{userName}}!",
  "htmlBody": "<h1>Welcome {{userName}}</h1>",
  "textBody": "Welcome {{userName}}",
  "variables": ["userName"],
  "category": "SYSTEM"
}
```

#### List Templates
```http
GET /email/templates
Authorization: Bearer <token>
```

#### Get Template
```http
GET /email/templates/:id
Authorization: Bearer <token>
```

#### Update Template
```http
PUT /email/templates/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Updated subject",
  "isActive": true
}
```

#### Delete Template
```http
DELETE /email/templates/:id
Authorization: Bearer <token>
```


### Log Endpoints

#### Get Email Logs
```http
GET /email/logs?page=1&limit=20&status=SENT&recipient=user@example.com
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (SENT, FAILED, BOUNCED, SKIPPED)
- `recipient` - Filter by recipient email
- `startDate` - Filter from date (ISO 8601)
- `endDate` - Filter to date (ISO 8601)

#### Get Log Details
```http
GET /email/logs/:id
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /email/logs/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalSent": 1250,
  "totalFailed": 45,
  "sentToday": 120,
  "sentThisWeek": 580,
  "sentThisMonth": 1250,
  "queuedCount": 15,
  "failureRate": 3.6
}
```


## Integration Guide

### Sending Emails from Your Code

#### Using EmailService

```typescript
import { EmailService } from './email/email.service';

@Injectable()
export class YourService {
  constructor(private emailService: EmailService) {}

  async sendWelcomeEmail(user: User) {
    await this.emailService.sendEmail({
      recipient: user.email,
      subject: 'Welcome to Our App',
      htmlBody: '<h1>Welcome!</h1>',
      textBody: 'Welcome!',
      userId: user.id,
    });
  }
}
```

#### Using Templates

```typescript
async sendTemplateEmail(user: User) {
  await this.emailService.sendTemplateEmail(
    'welcome-email', // template slug
    user.email,
    {
      userName: user.name,
      userEmail: user.email,
      appName: 'Your App',
    }
  );
}
```

#### Sending to Multiple Recipients

```typescript
await this.emailService.sendEmail({
  recipient: ['user1@example.com', 'user2@example.com'],
  subject: 'Bulk Email',
  htmlBody: '<p>Content</p>',
});
```

#### Priority Emails

```typescript
await this.emailService.sendEmail({
  recipient: 'urgent@example.com',
  subject: 'Urgent Notification',
  htmlBody: '<p>Urgent content</p>',
  priority: 1, // Higher priority (1-10, default: 5)
});
```


### Email Queue System

Emails are processed asynchronously through a queue system:

1. **Queuing**: Emails are added to the queue with PENDING status
2. **Processing**: Background job processes queue every 30 seconds
3. **Retry Logic**: Failed emails retry up to 3 times with exponential backoff
4. **Failure**: After max attempts, emails are marked as FAILED

#### Queue Status Flow

```
PENDING → PROCESSING → SENT
                    ↓
                  FAILED (after 3 attempts)
```

#### Retry Intervals

- Attempt 1: Immediate
- Attempt 2: 1 minute delay
- Attempt 3: 5 minutes delay
- After 3 attempts: Marked as FAILED

### Rate Limiting

The system enforces rate limits to prevent abuse:

- **Hourly Limit**: Maximum emails per hour
- **Daily Limit**: Maximum emails per day
- **Behavior**: Emails exceeding limits are queued for later delivery

#### Checking Rate Limits

```typescript
const canSend = await this.emailService.checkRateLimit();
if (!canSend) {
  // Handle rate limit exceeded
}
```

### Notification Preferences Integration

The system respects user notification preferences:

```typescript
// User preferences are checked automatically
await this.emailService.sendEmail({
  recipient: user.email,
  subject: 'Notification',
  htmlBody: '<p>Content</p>',
  userId: user.id, // Required for preference check
});
```

**System-critical emails** bypass user preferences:

```typescript
await this.emailService.sendEmail({
  recipient: user.email,
  subject: 'Security Alert',
  htmlBody: '<p>Critical alert</p>',
  metadata: { systemCritical: true },
});
```


## Testing

### Running Integration Tests

```bash
cd backend
node test-email-integration.js
```

This runs comprehensive tests covering:
- Email configuration management
- Template CRUD operations
- Email queue processing
- Email logging
- Rate limiting
- Access control
- Statistics

### Running API Endpoint Tests

```bash
cd backend
node test-email-api.js
```

Verifies:
- Module and controller files exist
- Database tables are accessible
- Permissions are configured
- Menu items are created
- API endpoints are properly wired

### Manual Testing Checklist

#### Configuration Flow
- [ ] Super admin can access email settings page
- [ ] Non-admin users are redirected to access denied
- [ ] SMTP configuration saves successfully
- [ ] Passwords are encrypted in database
- [ ] Configuration retrieval masks passwords
- [ ] Test email sends successfully
- [ ] Test email shows error messages on failure

#### Email Sending Flow
- [ ] Emails queue when system is enabled
- [ ] Emails are blocked when system is disabled
- [ ] Queue processor sends emails
- [ ] Failed emails retry with exponential backoff
- [ ] Emails marked as failed after max attempts

#### Template System
- [ ] Templates can be created
- [ ] Template variables are validated
- [ ] Templates render with data correctly
- [ ] Template-based emails send successfully
- [ ] Active templates cannot be deleted

#### Rate Limiting
- [ ] Rate limits prevent excessive sending
- [ ] Emails queue when limit reached
- [ ] Usage statistics update correctly

#### Access Control
- [ ] All email endpoints require Super Admin role
- [ ] Non-admin API requests return 403 Forbidden
- [ ] Email menu only visible to Super Admins


## Troubleshooting

### Common Issues

#### Emails Not Sending

1. **Check email system is enabled**
   - Navigate to Email Settings
   - Verify toggle is ON

2. **Verify SMTP configuration**
   - Check all fields are filled correctly
   - Test connection using "Send Test Email"

3. **Check queue processor**
   - Verify background job is running
   - Check logs for errors

#### Test Email Fails

1. **SMTP Connection Error**
   - Verify host and port are correct
   - Check firewall settings
   - Ensure credentials are valid

2. **Authentication Failed**
   - Verify username and password
   - For Gmail, use App Password instead of account password
   - Check if 2FA is enabled

3. **TLS/SSL Issues**
   - Try toggling `smtpSecure` setting
   - Use port 587 for TLS, 465 for SSL

#### Templates Not Rendering

1. **Variable Mismatch**
   - Ensure all variables in template are declared
   - Check variable names match exactly (case-sensitive)

2. **Template Not Found**
   - Verify template slug is correct
   - Check template is active

#### Rate Limit Exceeded

1. **Check current usage**
   - View Statistics tab in Email Settings
   - Review hourly/daily limits

2. **Adjust limits**
   - Contact system administrator
   - Limits are configured in rate limit settings

### Error Codes

- `EMAIL_SYSTEM_DISABLED` - Email system is turned off
- `CONFIGURATION_MISSING` - SMTP configuration not set
- `SMTP_CONNECTION_FAILED` - Cannot connect to SMTP server
- `TEMPLATE_NOT_FOUND` - Email template doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many emails sent
- `INVALID_RECIPIENT` - Email address format invalid

## Support

For additional help:
- Check application logs in `backend/logs/`
- Review email queue status in database
- Contact system administrator

---

**Last Updated**: November 2025
**Version**: 1.0.0
