# Implementation Plan

## Overview

This implementation plan breaks down the notification system into discrete, manageable tasks. Each task builds incrementally on previous work, following the pattern established in your dashboard starter kit.

**Note**: The Prisma sync hook will automatically handle backend sync, test generation, and type updates when you modify the schema in Task 1.

## Tasks

- [x] 1. Database Schema and Models








- [x] 1.1 Create Prisma schema for notification models

  - Add Notification model with all fields (id, userId, title, message, category, priority, metadata, etc.)
  - Add NotificationPreference model for user preferences
  - Add NotificationTemplate model for reusable templates
  - Add NotificationDeliveryLog model for tracking
  - Add NotificationAction model for interactive buttons
  - Add enums: NotificationCategory, NotificationPriority, NotificationChannel, DeliveryStatus, ActionType
  - Add relations to existing User model
  - **Note**: After saving schema.prisma, the Prisma sync hook will automatically:
    - Generate migration
    - Regenerate Prisma client
    - Update seed.ts
    - Create backend DTOs and services
    - Create frontend TypeScript types
    - Update API client
    - Generate comprehensive tests (unit + controller + E2E)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2. Backend - Core Notification Module




- [x] 2.1 Implement NotificationsService core methods


  - create() - Create new notification
  - findAll() - Get notifications with filters and pagination
  - findOne() - Get single notification
  - markAsRead() - Mark notification as read
  - markAllAsRead() - Mark all user notifications as read
  - delete() - Soft delete notification
  - deleteAll() - Clear all user notifications
  - getUnreadCount() - Get unread count for user
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 2.2 Implement permission filtering in NotificationsService


  - filterByPermissions() method
  - Check requiredPermission field against user permissions
  - Support wildcard permissions (*:*)
  - Integrate with existing JWT auth system
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 2.3 Create NotificationsController endpoints


  - GET /notifications - List notifications
  - GET /notifications/:id - Get single notification
  - POST /notifications - Create notification (admin only)
  - PATCH /notifications/:id/read - Mark as read
  - PATCH /notifications/read-all - Mark all as read
  - DELETE /notifications/:id - Delete notification
  - DELETE /notifications/clear-all - Clear all
  - GET /notifications/unread-count - Get unread count
  - Apply JwtAuthGuard and PermissionsGuard
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [x] 3. Backend - Notification Templates




- [x] 3.1 Implement NotificationTemplateService methods


  - create() - Create template
  - findAll() - List templates with filters
  - findByKey() - Get template by unique key
  - update() - Update template
  - delete() - Delete template
  - render() - Render template with variables
  - substituteVariables() - Replace {{variable}} placeholders
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8_

- [x] 3.2 Create template controller endpoints


  - GET /notifications/templates - List templates
  - GET /notifications/templates/:key - Get by key
  - POST /notifications/templates - Create template (admin)
  - PATCH /notifications/templates/:id - Update template (admin)
  - DELETE /notifications/templates/:id - Delete template (admin)
  - POST /notifications/templates/:key/test - Test rendering
  - Apply guards and permissions
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Backend - User Preferences







- [x] 4.1 Implement NotificationPreferencesService methods


  - getPreferences() - Get all user preferences
  - getPreference() - Get preference for category
  - updatePreference() - Update category preference
  - setDND() - Configure Do Not Disturb
  - isInDNDPeriod() - Check if user is in DND
  - createDefaultPreferences() - Initialize for new users
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 4.2 Create preferences controller endpoints


  - GET /notifications/preferences - Get all preferences
  - GET /notifications/preferences/:category - Get category preference
  - PATCH /notifications/preferences/:category - Update preference
  - PATCH /notifications/preferences/dnd - Set DND settings
  - POST /notifications/preferences/reset - Reset to defaults
  - Apply authentication guards
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 4.8_

- [x] 5. Backend - Notification Delivery





- [x] 5.1 Create delivery service


  - Generate NotificationDeliveryService
  - Inject NotificationsService and PreferencesService
  - Create delivery log helper methods
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 5.2 Implement delivery logic

  - deliver() - Main delivery orchestration
  - deliverInApp() - In-app notification delivery
  - checkPreferences() - Validate user preferences
  - checkDND() - Respect Do Not Disturb settings
  - createDeliveryLog() - Track delivery status
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 6. Backend - WebSocket Gateway





- [x] 6.1 Set up Socket.IO in NestJS


  - Install @nestjs/websockets and socket.io packages
  - Create NotificationWebSocketGateway
  - Configure CORS for WebSocket
  - Set up namespace '/notifications'
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 6.2 Implement WebSocket authentication


  - Handle 'authenticate' event
  - Validate JWT token from client
  - Store user-socket mapping
  - Join user to personal room
  - Handle disconnect cleanup
  - _Requirements: 6.2, 6.3_

- [x] 6.3 Implement WebSocket notification delivery


  - sendToUser() - Send to specific user
  - broadcastToRole() - Send to all users with role
  - Emit 'notification' event for new notifications
  - Emit 'notification:read' event for read status updates
  - Emit 'notification:deleted' event for deletions
  - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_

- [x] 6.4 Integrate WebSocket with delivery service


  - Call gateway.sendToUser() in deliverInApp()
  - Emit events on notification state changes
  - Handle offline users gracefully
  - _Requirements: 2.5, 2.6, 6.1, 6.4, 6.6_

- [x] 7. Backend - Notification Actions






- [x] 7.1 Implement action execution logic

  - executeAction() - Execute notification action
  - handleLinkAction() - Open URL
  - handleApiCallAction() - Make API request
  - handleInlineFormAction() - Process form data
  - handleDismissAction() - Dismiss notification
  - trackActionExecution() - Log action history
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_


- [x] 7.2 Create action controller endpoint

  - POST /notifications/:id/actions/:actionId - Execute action
  - Validate user permissions
  - Return action result
  - Update notification status
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 8. Backend - Analytics Service





- [x] 8.1 Implement analytics methods


  - trackDelivery() - Log delivery event
  - trackOpen() - Log notification open
  - trackClick() - Log action click
  - getMetrics() - Get user metrics
  - getCategoryStats() - Get category statistics
  - getChannelPerformance() - Get channel metrics
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_


- [x] 8.2 Create analytics controller endpoints

  - GET /notifications/analytics/metrics - Get metrics
  - GET /notifications/analytics/categories - Get category stats
  - GET /notifications/analytics/channels - Get channel performance
  - Apply admin permissions
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 9. Backend - Caching and Performance






- [x] 9.1 Create in-memory cache service

  - Implement NotificationCacheService
  - Cache unread counts with TTL
  - Provide get/set/invalidate methods
  - Use Map for storage
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_


- [x] 9.2 Implement cursor-based pagination


  - Add cursor parameter to findAll()
  - Return nextCursor in response
  - Optimize queries with proper ordering
  - Limit results to 50 per page
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 9.3 Add database indexes


  - Index on userId
  - Index on category
  - Index on priority
  - Index on isRead
  - Index on createdAt
  - Composite index on (userId, isRead, createdAt)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_



- [x] 10. Frontend - Notification API Client



- [x] 10.1 Create NotificationApi class in lib/api.ts


  - getAll() - List notifications with filters
  - getById() - Get single notification
  - create() - Create notification (admin)
  - markAsRead() - Mark as read
  - markAllAsRead() - Mark all as read
  - delete() - Delete notification
  - clearAll() - Clear all notifications
  - getUnreadCount() - Get unread count
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [x] 10.2 Create NotificationPreferenceApi class


  - getPreferences() - Get all preferences
  - getPreference() - Get category preference
  - updatePreference() - Update preference
  - setDND() - Set Do Not Disturb
  - resetToDefaults() - Reset preferences
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 4.8_

- [x] 10.3 Create NotificationTemplateApi class (admin)


  - getAll() - List templates
  - getByKey() - Get template by key
  - create() - Create template
  - update() - Update template
  - delete() - Delete template
  - testRender() - Test template rendering
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 11. Frontend - Notification Context





- [x] 11.1 Create NotificationContext


  - Create context file at contexts/NotificationContext.tsx
  - Define NotificationContextValue interface
  - Create NotificationProvider component
  - Create useNotifications hook
  - Follow ThemeContext pattern
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 11.2 Implement state management

  - notifications state array
  - unreadCount state
  - isLoading state
  - isConnected state (WebSocket)
  - preferences state
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 11.3 Implement notification methods

  - fetchNotifications() with filters
  - markAsRead() with optimistic update
  - markAllAsRead() with optimistic update
  - deleteNotification() with optimistic update
  - clearAll() with optimistic update
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 11.4 Implement WebSocket connection

  - Install socket.io-client package
  - Connect to /notifications namespace
  - Authenticate with JWT token
  - Handle connect/disconnect events
  - Auto-reconnect on disconnect
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 11.5 Implement WebSocket event handlers

  - Listen for 'notification' event (new notification)
  - Listen for 'notification:read' event (read status)
  - Listen for 'notification:deleted' event (deletion)
  - Update state on events
  - Show toast notification for new notifications
  - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 11.6 Implement preference methods

  - fetchPreferences()
  - updatePreference() with optimistic update
  - setDND() with validation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 4.8_
-

- [x] 12. Frontend - Notification Center Component



- [x] 12.1 Create NotificationCenter component


  - Create file at components/notifications/NotificationCenter.tsx
  - Use Popover from shadcn/ui
  - Bell icon with badge for unread count
  - Dropdown panel on click
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

- [x] 12.2 Implement notification list


  - Group notifications by date (today, yesterday, this week, older)
  - Display notification items
  - Show loading state
  - Show empty state
  - Implement infinite scroll or pagination
  - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

- [x] 12.3 Add filter and actions


  - Category filter dropdown
  - Priority filter dropdown
  - "Mark All as Read" button
  - "Clear All" button with confirmation
  - Search input for filtering
  - _Requirements: 7.6, 7.7, 7.8, 7.9, 7.10_

- [x] 12.4 Add notification sound


  - Play sound on new notification
  - Respect user preferences
  - Use Web Audio API or HTML5 audio
  - Provide sound toggle in settings
  - _Requirements: 2.7, 6.7_
-

- [x] 13. Frontend - NotificationItem Component





- [x] 13.1 Create NotificationItem component

  - Create file at components/notifications/NotificationItem.tsx
  - Display icon based on category
  - Show title and message
  - Display timestamp (relative time)
  - Show unread indicator
  - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_


- [x] 13.2 Implement priority styling

  - Color code by priority (low, normal, high, urgent)
  - Use appropriate icon colors
  - Add visual indicators for urgent notifications
  - _Requirements: 1.3, 7.4, 7.5_


- [x] 13.3 Add action buttons

  - Render action buttons from notification.actions
  - Handle button clicks
  - Show loading state during action execution
  - Display action result
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_


- [x] 13.4 Add item actions

  - "Mark as Read" button
  - "Delete" button with confirmation
  - Click to navigate (if actionUrl exists)
  - Hover effects and transitions
  - _Requirements: 7.6, 7.7, 7.8, 7.9, 7.10_

- [ ] 14. Frontend - Notification Settings Page





- [x] 14.1 Create settings page


  - Create file at app/dashboard/settings/notifications/page.tsx
  - Use PageHeader component
  - Create responsive layout with cards
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10_

- [x] 14.2 Implement Do Not Disturb section


  - Toggle switch for DND enable/disable
  - Time pickers for start and end time
  - Day selector (checkboxes for each day)
  - Save button with loading state
  - _Requirements: 4.3, 4.4, 12.4_

- [x] 14.3 Implement category preferences section


  - List all notification categories
  - Toggle switch for each category
  - Category descriptions
  - Save automatically on change
  - _Requirements: 4.1, 4.2, 12.2, 12.3, 12.4_

- [x] 14.4 Add global settings


  - Global notification enable/disable toggle
  - Notification sound toggle
  - "Reset to Defaults" button
  - Preview notification button
  - _Requirements: 4.7, 4.8, 12.5, 12.9, 12.10_

- [x] 15. Frontend - Toast Notifications




- [x] 15.1 Create toast notification system


  - Use sonner or react-hot-toast library
  - Create toast helper functions
  - Configure toast position and duration
  - Style toasts to match theme
  - _Requirements: 2.7, 6.7_

- [x] 15.2 Integrate with NotificationContext


  - Show toast on new notification
  - Include notification title and message
  - Add action buttons to toast
  - Respect user preferences
  - _Requirements: 2.7, 6.7, 7.4, 7.5_

- [x] 16. Frontend - Accessibility




- [x] 16.1 Implement keyboard navigation


  - Tab navigation through notification list
  - Arrow keys for list navigation
  - Enter to open notification
  - Escape to close dropdown
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 16.2 Add ARIA attributes


  - aria-label for bell icon
  - aria-live for new notifications
  - role="alert" for urgent notifications
  - aria-expanded for dropdown state
  - aria-describedby for notification content
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 16.3 Implement screen reader support


  - Announce new notifications
  - Announce unread count changes
  - Provide text alternatives for icons
  - Use semantic HTML
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 16.4 Add focus management


  - Focus indicators for all interactive elements
  - Focus trap in modal dialogs
  - Return focus after closing dropdown
  - Skip links for keyboard users
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 17. Integration and Polish




- [x] 17.1 Add NotificationCenter to dashboard header


  - Import NotificationCenter component
  - Place next to user profile menu
  - Ensure responsive layout
  - Test on mobile devices
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 17.2 Add NotificationProvider to app layout


  - Wrap app with NotificationProvider
  - Place after AuthProvider
  - Pass userId from auth context
  - Ensure proper provider nesting
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 17.3 Add notification settings to navigation


  - Add menu item in settings section
  - Use Bell icon
  - Link to /dashboard/settings/notifications
  - Show only to authenticated users
  - _Requirements: 12.1, 12.2_

- [x] 17.4 Create notification permissions


  - Add notifications:read permission
  - Add notifications:write permission (admin)
  - Add notifications:delete permission (admin)
  - Update seed data with permissions
  - Assign to appropriate roles
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 17.5 Add notification creation helper


  - Create utility function for common notification types
  - System notifications
  - User action notifications
  - Security alerts
  - Make it easy for developers to send notifications
  - _Requirements: 3.5, 3.6, 11.1, 11.2, 11.3_

- [x] 17.6 Create example notifications


  - Welcome notification on user registration
  - Password change notification
  - Role change notification
  - Profile update notification
  - Demonstrate notification system usage
  - _Requirements: 3.5, 3.6, 11.1, 11.2, 11.3_

- [-] 18. Documentation


- [x] 18.1 Create notification system README


  - Overview of notification system
  - Architecture diagram
  - Database schema documentation
  - API endpoint documentation
  - WebSocket event documentation
  - _Requirements: All_

- [ ] 18.2 Create developer guide


  - How to send notifications
  - How to create templates
  - How to add notification categories
  - How to customize notification UI
  - Code examples and best practices
  - _Requirements: All_

- [ ] 18.3 Create user guide
  - How to manage notification preferences
  - How to use Do Not Disturb mode
  - How to interact with notifications
  - Screenshots and examples
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [ ] 18.4 Update steering documentation
  - Add notification system to .kiro/steering/
  - Document permission naming conventions
  - Document integration patterns
  - Add troubleshooting guide
  - _Requirements: All_

## Notes

- **Prisma Sync Hook Automation**: After completing Task 1.1 (Prisma schema), the hook will automatically handle:
  - ✅ Prisma migration generation and application
  - ✅ Prisma client regeneration
  - ✅ Backend DTOs creation (CreateNotificationDto, UpdateNotificationDto, etc.)
  - ✅ Backend service scaffolding
  - ✅ Backend controller scaffolding
  - ✅ Frontend TypeScript types (frontend/src/types/notification.ts)
  - ✅ API client methods (NotificationApi in lib/api.ts)
  - ✅ Comprehensive test generation (unit + controller + E2E)
  - ✅ Seed file updates
  - ✅ Type consistency verification

- **What You Need to Implement**: Focus on business logic and UI:
  - Service methods (CRUD operations, permission filtering, template rendering)
  - Controller endpoints (route handlers, guards, permissions)
  - WebSocket gateway (real-time delivery)
  - Frontend components (NotificationCenter, NotificationItem, Settings page)
  - NotificationContext (state management + WebSocket client)
  - Integration (add to dashboard, navigation, permissions)

- **Incremental Development**: Each task builds on previous work. Complete tasks in order for best results.

- **Permission Integration**: The notification system integrates seamlessly with your existing JWT auth and permission system.

- **Zero External Dependencies**: The system works out of the box with your existing PostgreSQL database and NestJS/Next.js stack.
