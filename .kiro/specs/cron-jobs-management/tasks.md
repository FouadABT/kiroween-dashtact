# Implementation Plan

- [x] 1. Backend Cron Jobs Infrastructure





  - Create database schema with CronJob and CronLog models in Prisma
  - Implement CronJob decorator for registering jobs with metadata
  - Create CronJobsService with job discovery, registration, execution, and logging
  - Create CronJobsController with REST endpoints for job management
  - Implement CronJobsModule and register in app.module.ts
  - Migrate existing TwoFactorCleanupService to use new decorator pattern
  - Add seed data for system.cron.manage permission
  - Write unit tests for service methods and integration tests for controller endpoints
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Frontend Cron Jobs Dashboard





  - Create /admin/cron-jobs page with super admin access control
  - Implement CronJobsClient component with job list and detail views
  - Create CronJobsList component with table displaying all jobs and their status
  - Create CronJobDetails component with statistics, controls, and execution history
  - Implement JobControls component for enable/disable/trigger actions
  - Create ScheduleEditor component with cron expression validation and preview
  - Create ExecutionHistory component with filtering and pagination
  - Add CronJobsApi class in frontend/src/lib/api.ts with all API methods
  - Add TypeScript interfaces for CronJob, CronLog, and related types
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2_

- [x] 3. Integration and Polish





  - Run database migration to create CronJob and CronLog tables
  - Run seed script to add system.cron.manage permission to super admin role
  - Test complete workflow: view jobs, enable/disable, manual trigger, view logs
  - Verify two-factor token cleanup job is registered and executing
  - Test schedule editing with validation and preview
  - Verify failure notifications are sent to super admins
  - Test access control (only super admins can access)
  - Verify job statistics and execution history display correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_
