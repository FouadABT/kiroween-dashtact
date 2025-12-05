# Implementation Plan

- [x] 1. Extend database schema to handle activity logging





  - Create Prisma schema model for `ActivityLog` with all required fields (id, action, userId, actorName, entityType, entityId, metadata, ipAddress, userAgent, createdAt)
  - Add proper indexes for efficient querying (userId, entityType+entityId, action, createdAt)
  - Add relationship to User model with onDelete: SetNull to handle user deletions
  - Generate and run Prisma migration to create the activity_logs table
  - Verify schema in database using Prisma Studio
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create backend API endpoints and service





  - [x] 2.1 Create ActivityLog module structure


    - Generate NestJS module, controller, and service files
    - Set up module imports and exports in app.module.ts
    - _Requirements: 2.1, 2.5_

  - [x] 2.2 Implement DTOs for type safety


    - Create CreateActivityLogDto with validation decorators
    - Create ActivityLogQueryDto with optional filters and pagination
    - Create ActivityLogResponseDto for consistent API responses
    - _Requirements: 2.6_

  - [x] 2.3 Implement ActivityLogService core methods


    - Implement logActivity() method with automatic IP/user agent extraction
    - Implement findAll() with filtering, pagination, and sorting
    - Implement findOne() for retrieving single activity log
    - Add helper methods: logUserLogin, logUserLogout, logEntityCreated, logEntityUpdated, logEntityDeleted
    - Add error handling with graceful degradation (logging failures don't crash app)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.4 Implement ActivityLogController REST endpoints


    - POST /activity-logs - Create new activity log entry
    - GET /activity-logs - List activity logs with filters and pagination
    - GET /activity-logs/:id - Get single activity log by ID
    - Add authentication guards to all endpoints
    - Add role-based authorization (admin/manager only)
    - Add request validation using DTOs
    - _Requirements: 2.5, 6.1_

  - [x] 2.5 Add integration with existing modules


    - Update AuthService to log login/logout events
    - Add example integration in one CRUD module (e.g., Products or Pages)
    - Document integration pattern for other developers
    - _Requirements: 4.4_


  - [x]* 2.6 Write backend tests




    - Unit tests for ActivityLogService methods
    - Unit tests for DTO validation
    - Integration tests for API endpoints with authentication
    - E2E test for complete activity logging workflow
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Create frontend UI to list and filter activity logs




  - [x] 3.1 Create TypeScript types and API client

    - Define ActivityLog, ActivityLogFilters, and ActivityLogResponse interfaces
    - Create API client methods in frontend/src/lib/api/activity.ts
    - Add error handling and type safety
    - _Requirements: 4.3_

  - [x] 3.2 Create ActivityLog components


    - Create ActivityLogList component with table/card view
    - Create ActivityLogItem component with expandable metadata
    - Create ActivityLogFilters component with action, user, entity, and date filters
    - Create Pagination component for navigation
    - Use shadcn/ui components (Table, Card, Select, Input, DatePicker)
    - Add proper icons and color coding for different action types
    - _Requirements: 3.2, 3.6_

  - [x] 3.3 Create Activity Log page


    - Create /dashboard/activity page route
    - Implement page with filters, list, and pagination
    - Add loading states with skeleton loaders
    - Add empty state for no activities
    - Format timestamps in relative format (e.g., "2 hours ago")
    - Add responsive design for mobile devices
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [x] 3.4 Add navigation menu item


    - Add "Activity Log" menu item to dashboard sidebar
    - Add appropriate icon (Activity or FileText)
    - Restrict visibility to admin/manager roles
    - _Requirements: 3.7_

  - [x] 3.5 Implement permission-based access


    - Add route protection for activity log page
    - Check user permissions before rendering
    - Redirect unauthorized users to access denied page
    - _Requirements: 6.1_

  - [ ] 3.6 Write frontend tests
    - Component tests for ActivityLogList, ActivityLogItem, ActivityLogFilters
    - Integration tests for API client methods
    - Accessibility tests for keyboard navigation and screen readers
    - Test filter application and pagination
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
