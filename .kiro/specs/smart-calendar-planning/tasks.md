# Implementation Plan

- [x] 1. Database Schema & Core Models





  - Extend Prisma schema with calendar models (CalendarEvent, EventCategory, RecurrenceRule, EventAttendee, EventReminder, EventEntityLink, CalendarSettings)
  - Add enums for EventStatus, EventVisibility, RecurrenceFreq, AttendeeStatus
  - Update User model with calendar relations
  - Create and run database migration
  - Generate Prisma client
  - Create backend DTOs for all calendar entities (create, update, filter)
  - Create frontend TypeScript interfaces matching backend models
  - Seed database with default event categories (Meeting, Task, Deadline, Booking, Class, Promotion, Reminder, Custom)
  - _Requirements: 1.1, 2.1, 6.2, 10.1_

- [x] 2. Calendar Backend Module




- [x] 2.1 Create calendar service with CRUD operations


  - Implement CalendarService with create, findAll, findOne, update, delete methods
  - Implement event filtering by category, user, team, status, date range
  - Implement event search by title, description, location
  - Add permission checks for event operations
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 9.1, 9.2, 9.3_

- [x] 2.2 Create recurrence engine service


  - Implement RecurrenceService for generating recurring event instances
  - Support DAILY, WEEKLY, MONTHLY, YEARLY frequencies
  - Support custom intervals and weekday patterns
  - Handle recurrence end conditions (count, until date, never)
  - Implement exception dates for skipping occurrences
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.3 Create reminder processing service


  - Implement ReminderService for managing event reminders
  - Create method to find pending reminders
  - Integrate with notification system to create reminder notifications
  - Respect user notification preferences and DND settings
  - _Requirements: 3.1, 3.2, 3.3, 8.1_

- [x] 2.4 Create calendar controller with REST endpoints


  - Implement GET /calendar/events (list with filters)
  - Implement GET /calendar/events/:id (get single event)
  - Implement POST /calendar/events (create event)
  - Implement PUT /calendar/events/:id (update event)
  - Implement DELETE /calendar/events/:id (delete event)
  - Implement GET /calendar/categories (list categories)
  - Implement POST /calendar/categories (create category - admin only)
  - Implement PUT /calendar/categories/:id (update category - admin only)
  - Implement DELETE /calendar/categories/:id (delete category - admin only)
  - Implement GET /calendar/settings (get user settings)
  - Implement PUT /calendar/settings (update user settings)
  - Apply JwtAuthGuard and PermissionsGuard to all endpoints
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 6.1, 6.2, 9.1, 9.2, 9.3, 9.5_

- [x] 2.5 Register calendar module in app.module.ts


  - Import CalendarModule in AppModule
  - Ensure PrismaModule and PermissionsModule are imported
  - _Requirements: All backend requirements_

- [x] 3. Calendar Frontend Components




- [x] 3.1 Create calendar view container and toolbar



  - Implement CalendarView.tsx as main container component
  - Implement CalendarToolbar.tsx with view switcher (month/week/day/agenda)
  - Add "Today" button to navigate to current date
  - Add date range navigation (prev/next)
  - Implement CalendarFilters.tsx with category, user, status filters
  - Add search input for event search
  - Use shadcn/ui components (Button, Select, Input, Popover)
  - Apply theme colors for light/dark mode
  - Make toolbar responsive for mobile
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.5, 11.1, 13.1, 13.2_

- [x] 3.2 Create month view component


  - Implement MonthView.tsx with calendar grid
  - Display events as colored dots or bars on dates
  - Support clicking dates to create events
  - Support clicking events to open details
  - Implement responsive grid for mobile (stack weeks vertically)
  - Apply theme colors and ensure contrast
  - _Requirements: 4.1, 4.6, 11.1, 13.1, 13.2_

- [x] 3.3 Create week view component


  - Implement WeekView.tsx with hourly timeline
  - Display events as blocks in time slots
  - Support drag and drop to reschedule events
  - Support resize to change event duration
  - Show working hours with visual distinction
  - Implement horizontal scroll for mobile
  - Apply theme colors
  - _Requirements: 4.1, 4.4, 4.5, 11.2, 13.1_

- [x] 3.4 Create day view component


  - Implement DayView.tsx with hourly breakdown
  - Display events in time slots
  - Support drag and drop and resize
  - Show working hours
  - Optimize for mobile with touch gestures
  - Apply theme colors
  - _Requirements: 4.1, 4.4, 4.5, 11.2, 13.1_

- [x] 3.5 Create agenda list view component


  - Implement AgendaView.tsx as chronological list
  - Group events by date
  - Display event details inline
  - Support infinite scroll for loading more events
  - Optimize for mobile
  - Apply theme colors
  - _Requirements: 4.1, 11.1, 13.1_

- [x] 3.6 Create event card and details panel


  - Implement EventCard.tsx for displaying event summary
  - Implement EventDetailsPanel.tsx as sidebar with full event info
  - Show event title, time, location, description, attendees, category
  - Add edit and delete buttons (permission-based)
  - Display recurrence information if applicable
  - Show linked entities if present
  - Apply theme colors and ensure mobile-friendly
  - _Requirements: 1.1, 4.6, 9.2, 9.3, 11.1, 13.1_

- [x] 4. Event Management UI




- [x] 4.1 Create event form component

  - Implement EventForm.tsx for create/edit operations
  - Add fields: title, description, start/end date/time, all-day toggle, location, category, visibility
  - Implement date/time pickers using shadcn/ui components
  - Add attendee selector with user search
  - Validate form inputs (required fields, time range)
  - Make form responsive for mobile
  - Apply theme colors
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 11.4, 13.1_

- [x] 4.2 Create recurrence editor component


  - Implement RecurrenceEditor.tsx for defining recurrence rules
  - Support frequency selection (daily, weekly, monthly, yearly)
  - Add interval input (every N days/weeks/months/years)
  - Add weekday selector for weekly recurrence
  - Add month day selector for monthly recurrence
  - Add end condition selector (never, count, until date)
  - Provide human-readable summary of recurrence rule
  - Make mobile-friendly
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 11.4_

- [x] 4.3 Create reminder editor component


  - Implement ReminderEditor.tsx for configuring reminders
  - Support adding multiple reminders
  - Provide preset options (10 min, 1 hour, 1 day) and custom input
  - Display list of configured reminders with remove option
  - Make mobile-friendly
  - _Requirements: 3.1, 11.4_

- [x] 4.4 Implement drag and drop functionality


  - Add drag handlers to event components in week/day views
  - Calculate new start/end times based on drop position
  - Call API to update event
  - Show loading state during update
  - Handle errors with toast notifications
  - Support touch gestures for mobile
  - _Requirements: 4.4, 11.2_

- [x] 4.5 Implement event resize functionality


  - Add resize handles to event components
  - Calculate new end time based on resize
  - Call API to update event
  - Show loading state during update
  - Handle errors with toast notifications
  - Support touch gestures for mobile
  - _Requirements: 4.5, 11.2_

- [x] 4.6 Create calendar page


  - Implement /calendar/page.tsx as main calendar page
  - Integrate CalendarView component
  - Add page metadata for SEO
  - Protect route with authentication
  - Make fully responsive
  - _Requirements: All frontend requirements_

- [x] 5. Calendar Widgets




- [x] 5.1 Create mini-calendar widget


  - Implement MiniCalendarWidget.tsx
  - Display month view with event indicators (dots)
  - Highlight current date
  - Show busy days with visual distinction
  - Support clicking dates to navigate to full calendar
  - Register widget in widget-registry.ts as 'mini-calendar'
  - Add to dashboard-widgets.seed.ts
  - Make responsive for mobile
  - Apply theme colors
  - _Requirements: 7.1, 11.5, 13.1, 13.4, 13.5_

- [x] 5.2 Create upcoming events widget


  - Implement UpcomingEventsWidget.tsx
  - Display next 5-10 events in chronological order
  - Show event title, time, category color
  - Support filtering by user (show only my events)
  - Add "View All" link to full calendar
  - Register widget in widget-registry.ts as 'upcoming-events'
  - Add to dashboard-widgets.seed.ts
  - Make responsive for mobile
  - Apply theme colors
  - _Requirements: 7.2, 11.5, 13.1, 13.4, 13.5_

- [x] 5.3 Create today's agenda widget


  - Implement TodayAgendaWidget.tsx
  - Display hourly breakdown of current day
  - Show events in time slots
  - Highlight current time
  - Show "No events today" message when empty
  - Add "Add Event" button
  - Register widget in widget-registry.ts as 'today-agenda'
  - Add to dashboard-widgets.seed.ts
  - Make responsive for mobile
  - Apply theme colors
  - _Requirements: 7.3, 11.5, 13.1, 13.4, 13.5_

- [x] 5.4 Create team schedule widget


  - Implement TeamScheduleWidget.tsx
  - Display horizontal timeline with multiple user rows
  - Show events for selected team members
  - Support selecting users to display
  - Add time range selector (today, this week)
  - Register widget in widget-registry.ts as 'team-schedule'
  - Add to dashboard-widgets.seed.ts
  - Make responsive for mobile (stack users vertically)
  - Apply theme colors
  - _Requirements: 7.4, 11.5, 13.1, 13.4, 13.5_

- [x] 6. Notifications & Reminders Integration


- [x] 6.1 Create reminder cron job

  - Create CalendarRemindersCronJob in backend/src/calendar/
  - Schedule to run every 5 minutes
  - Query events with pending reminders in next 10 minutes
  - Create notifications for due reminders
  - Mark reminders as sent
  - Log execution statistics
  - Register cron job in CronJobsModule
  - _Requirements: 3.2, 3.4, 12.1, 12.2, 12.3, 12.4, 12.5_


- [x] 6.2 Create recurring event generation cron job
  - Create RecurringEventsCronJob in backend/src/calendar/
  - Schedule to run daily at midnight
  - Generate future instances for recurring events (next 90 days)
  - Skip exception dates
  - Log execution statistics
  - Register cron job in CronJobsModule
  - _Requirements: 2.1, 2.2, 12.4, 12.5_

- [x] 6.3 Implement event notification triggers

  - Create notifications when event is created (notify attendees)
  - Create notifications when event is updated (notify attendees)
  - Create notifications when event is cancelled (notify attendees)
  - Create notifications when user is added as attendee (invitation)
  - Create notifications when user is removed as attendee
  - Respect user notification preferences
  - _Requirements: 3.3, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6.4 Create notification templates


  - Add calendar notification templates to seed data
  - Template: "event_reminder" - "Reminder: {event_title} starts in {minutes} minutes"
  - Template: "event_created" - "You've been invited to {event_title}"
  - Template: "event_updated" - "{event_title} has been updated"
  - Template: "event_cancelled" - "{event_title} has been cancelled"
  - Template: "attendee_added" - "You've been added to {event_title}"
  - Template: "attendee_removed" - "You've been removed from {event_title}"
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 7. Admin Management Page





- [x] 7.1 Create calendar settings page


  - Implement /admin/calendar-settings/page.tsx
  - Create CalendarSettingsClient.tsx component
  - Add sections: General Settings, Default Preferences, Working Hours
  - Allow configuring default view, week start day, time zone
  - Allow configuring default reminders
  - Allow configuring working hours and working days
  - Protect route with super admin permission
  - Make responsive for mobile
  - Apply theme colors
  - _Requirements: 6.1, 11.1, 13.1_

- [x] 7.2 Create category manager component


  - Implement CategoryManager.tsx
  - Display list of event categories with colors and icons
  - Support creating new categories
  - Support editing category name, color, icon, display order
  - Support deleting categories (with confirmation)
  - Prevent deleting system categories
  - Show category usage count
  - Make responsive for mobile
  - Apply theme colors
  - _Requirements: 6.2, 6.3, 6.4, 11.1, 13.1, 13.4_

- [x] 7.3 Create calendar permissions component


  - Implement CalendarPermissions.tsx
  - Display permission matrix for calendar features
  - Show which roles have which calendar permissions
  - Link to main permissions management page
  - Make responsive for mobile
  - _Requirements: 6.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 7.4 Add calendar settings to sidebar navigation


  - Add "Calendar Settings" link to admin section in Sidebar.tsx
  - Show only for users with calendar:adminnow zzz permission
  - Add calendar icon
  - _Requirements: 6.1_

- [x] 8. Integration, Polish & Testing






- [x] 8.1 Create calendar permissions seed data
dssssdqq
  - Add calendar permissions to seed data:zzz
    - calendar:create - Create events
    - calendar:read - View events
    - calendar:update - Edit events
    - calendar:delete - Delete events
    - calendar:admin - Manage calendar settings
  - Assign permissions to roles:
    - Super Admin: all calendar permissions
    - Admin: calendar:create, calendar:read, calendar:update, calendar:delete
    - Manager: calendar:create, calendar:read, calendar:update
    - User: calendar:create, calendar:read (own events)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_


- [x] 8.2 Implement audit logging

  - Log event creation with user ID, timestamp, event details
  - Log event updates with changed fields and previous values
  - Log event deletion with user ID and timestamp
  - Log recurrence rule changes
  - Log reminder additions/removals
  - Use existing ActivityLog model
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_


- [x] 8.3 Add calendar link to main navigation

  - Add "Calendar" link to Sidebar.tsx
  - Show for all authenticated users
  - Add calendar icon
  - Position in main navigation section
  - _Requirements: All requirements_

- [x] 8.4 Implement mobile optimizations


  - Optimize touch targets (minimum 44x44px)
  - Implement swipe gestures for navigation
  - Optimize event forms for mobile input
  - Ensure responsive layouts work correctly
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 8.5 Implement theme integration


  - Verify all calendar components use theme variables
  - Ensure event colors have sufficient contrast
  - Verify widget styling in both themes
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 8.6 Create API client methods


  - Add CalendarApi class to frontend/src/lib/api.ts
  - Implement methods for all calendar endpoints
  - Add proper error handling
  - Add TypeScript types for requests/responses
  - _Requirements: All frontend requirements_

- [x] 8.7 Create calendar utility functions


  - Implement date formatting utilities
  - Implement recurrence rule human-readable formatter
  - Implement event time conflict checker
  - Implement working hours calculator
  - Add to frontend/src/lib/calendar-utils.ts
  - _Requirements: Various_

- [ ]* 8.8 Write unit tests for calendar services
  - Test CalendarService CRUD operations
  - Test RecurrenceService rule generation
  - Test ReminderService notification creation
  - Test permission guard logic
  - Test DTO validation
  - _Requirements: All requirements_

- [ ]* 8.9 Write unit tests for calendar components
  - Test calendar view rendering
  - Test event form validation
  - Test filter logic
  - Test widget components
  - _Requirements: All requirements_

- [ ]* 8.10 Write integration tests
  - Test complete event lifecycle (create, view, edit, delete)
  - Test recurring event creation and instance generation
  - Test reminder notifications
  - Test permissions enforcement
  - _Requirements: All requirements_

- [ ]* 8.11 Write E2E tests
  - Test user creates one-time event
  - Test user creates recurring event
  - Test user receives reminder
  - Test event filtering
  - Test admin manages categories
  - Test mobile interactions
  - _Requirements: All requirements_
