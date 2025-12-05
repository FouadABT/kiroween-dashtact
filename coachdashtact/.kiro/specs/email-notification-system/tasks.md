# Implementation Plan

- [x] 1. Backend email infrastructure and core services





  - Create email module directory structure in `backend/src/email/` with controllers, services, DTOs, guards, and processors
  - Define Prisma schema models for EmailConfiguration, EmailTemplate, EmailQueue, and EmailLog with proper indexes and enums
  - Create database migration for all email tables
  - Implement `EmailEncryptionService` with AES-256-GCM encryption for SMTP passwords
  - Implement `SmtpService` with nodemailer for SMTP connections, email delivery, and connection testing
  - Implement `EmailService` with core methods: saveConfiguration(), getConfiguration(), toggleEmailSystem(), sendEmail(), sendTemplateEmail()
  - Implement `EmailQueueService` for queuing emails with priority-based sorting
  - Implement `EmailQueueProcessor` with scheduled job (30-second interval), retry logic with exponential backoff (3 attempts), and error handling
  - Implement `EmailTemplateService` for CRUD operations, variable validation ({{variable}} syntax), and template rendering
  - Create `SuperAdminGuard` for role-based access control on all email endpoints
  - Create all DTOs: EmailConfigurationDto, ToggleEmailDto, TestEmailDto, CreateEmailTemplateDto, UpdateEmailTemplateDto, EmailLogFilterDto
  - Create `EmailController` with endpoints for configuration (POST, GET, PATCH), test email (POST), templates (POST, GET, PUT, DELETE), and logs (GET with filtering and stats)
  - Implement email logging service to track all email attempts with status, timestamps, and error details
  - Integrate with user notification preferences to check before sending and skip if disabled
  - Implement rate limiting with hourly and daily limits, tracking in rolling time windows
  - Add email permissions to database (email:configure, email:send, email:view_logs, email:manage_templates) and assign to SUPER_ADMIN role
  - Create seed script for default email templates (welcome, password reset, notification digest, system alert)
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Frontend email settings page and configuration UI





  - Create `frontend/src/lib/api/email.ts` with API client methods for all email endpoints
  - Create `frontend/src/types/email.ts` with TypeScript interfaces matching backend DTOs
  - Create `frontend/src/app/dashboard/settings/email/page.tsx` as main email settings page with tabs for Configuration, Templates, Logs, and Statistics
  - Implement route protection for super admin only with role verification
  - Create `EmailConfigurationForm.tsx` component with input fields for SMTP settings (host, port, secure, username, password, sender email, sender name), form validation, password masking, and save functionality with toast notifications
  - Create `EmailToggle.tsx` component to display and toggle email system enabled/disabled status with confirmation dialog
  - Create `TestEmailDialog.tsx` component with recipient input, optional message field, loading state, and success/error display
  - Add breadcrumb navigation and page header with title and description
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.5, 3.1, 3.2, 3.3, 8.1_

- [x] 3. Frontend email templates and logs management UI





  - Create `EmailTemplateList.tsx` component to display templates in table/card layout with name, subject, category, status, search, filter, and create button
  - Create `EmailTemplateEditor.tsx` component with fields for name, slug, subject, category, HTML body (rich text editor), plain text body, variable management interface, syntax help text, and preview functionality
  - Add template delete functionality with confirmation dialog, usage validation, and prevention of active template deletion
  - Create `EmailLogsTable.tsx` component to display logs with recipient, subject, status badge (color-coded), timestamp, pagination, and row click for details
  - Create email log filters with date range picker, status dropdown, recipient search input, debouncing, and active filter badges
  - Create email log detail view (modal or side panel) with complete metadata, error messages for failures, template information, and copy-to-clipboard functionality
  - Create `EmailStatsCards.tsx` component to display total sent, failed, queued counts, sent today/week/month, failure rate percentage, and loading skeletons
  - Create `RateLimitSettings.tsx` component to show hourly/daily usage, progress bars, configuration inputs, and warnings when approaching limits
  - _Requirements: 4.1, 4.2, 4.3, 6.1, 6.2, 6.3, 6.4, 6.5, 10.1, 10.5_

- [x] 4. Integration, navigation, and final setup





  - Update dashboard sidebar navigation to add email settings link under Settings section with email icon, visible only to super admin users
  - Wire all frontend components to backend API endpoints with proper error handling and loading states
  - Test complete email configuration flow: super admin saves SMTP config, passwords encrypted in database, configuration retrieval masks passwords, non-admin access denied
  - Test email sending flow: emails queue when enabled, blocked when disabled, queue processor sends emails, retry logic with exponential backoff, failed emails marked after max attempts
  - Test template system: template creation and validation, variable rendering, template-based email sending, deletion protection for active templates
  - Test rate limiting: limits prevent excessive sending, emails queue when limit reached, usage statistics update correctly
  - Test notification preferences integration: preferences checked before sending, emails skipped when disabled, system-critical emails bypass preferences
  - Verify all super admin access controls work correctly across all email endpoints
  - Create basic documentation for SMTP configuration process, template variable syntax, and API endpoints for developers
  - _Requirements: 1.3, 1.4, 2.2, 2.3, 2.5, 5.1, 6.1, 6.2, 6.4, 6.5, 7.2, 7.3, 7.4, 8.1, 8.3, 9.1, 9.2, 9.5, 10.2, 10.4, 10.5_
