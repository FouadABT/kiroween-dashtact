# Design Document

## Overview

The Smart Calendar Planning System is a full-stack feature that provides comprehensive calendar and scheduling capabilities. It integrates deeply with the existing Dashtact architecture including authentication, permissions, notifications, widgets, theming, and cron jobs. The system is designed to be industry-agnostic and extensible, supporting various use cases from team meetings to appointment booking to task management.

## Architecture

### Backend Architecture

**Technology Stack:**
- NestJS framework with TypeScript
- Prisma ORM for database operations
- PostgreSQL for data persistence
- Cron jobs for reminder processing and recurring event generation

**Module Structure:**
```
backend/src/calendar/
├── calendar.module.ts          # Main module with dependencies
├── calendar.controller.ts      # HTTP endpoints
├── calendar.service.ts         # Business logic
├── calendar-reminders.service.ts  # Reminder processing
├── calendar-recurrence.service.ts # Recurrence rule engine
├── dto/
│   ├── create-event.dto.ts
│   ├── update-event.dto.ts
│   ├── event-filter.dto.ts
│   ├── recurrence-rule.dto.ts
│   ├── reminder.dto.ts
│   └── calendar-settings.dto.ts
└── guards/
    └── event-access.guard.ts   # Event-level permission guard
```

### Frontend Architecture

**Technology Stack:**
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- date-fns for date manipulation

**Component Structure:**
```
frontend/src/
├── app/
│   ├── calendar/
│   │   └── page.tsx            # Main calendar page
│   └── admin/
│       └── calendar-settings/
│           └── page.tsx        # Admin settings page
├── components/
│   ├── calendar/
│   │   ├── CalendarView.tsx    # Main calendar container
│   │   ├── MonthView.tsx       # Month grid view
│   │   ├── WeekView.tsx        # Week timeline view
│   │   ├── DayView.tsx         # Day hourly view
│   │   ├── AgendaView.tsx      # List view
│   │   ├── EventCard.tsx       # Event display component
│   │   ├── EventDetailsPanel.tsx  # Event details sidebar
│   │   ├── EventForm.tsx       # Create/edit event form
│   │   ├── RecurrenceEditor.tsx   # Recurrence rule editor
│   │   ├── ReminderEditor.tsx     # Reminder configuration
│   │   ├── CalendarFilters.tsx    # Filter controls
│   │   └── CalendarToolbar.tsx    # View switcher and actions
│   ├── widgets/
│   │   └── calendar/
│   │       ├── MiniCalendarWidget.tsx
│   │       ├── UpcomingEventsWidget.tsx
│   │       ├── TodayAgendaWidget.tsx
│   │       └── TeamScheduleWidget.tsx
│   └── admin/
│       └── calendar/
│           ├── CalendarSettingsClient.tsx
│           ├── CategoryManager.tsx
│           └── CalendarPermissions.tsx
├── types/
│   └── calendar.ts             # TypeScript interfaces
└── lib/
    └── calendar-utils.ts       # Utility functions
```

## Components and Interfaces

### Database Models

#### CalendarEvent Model
```prisma
model CalendarEvent {
  id                String                @id @default(cuid())
  title             String
  description       String?               @db.Text
  startTime         DateTime              @map("start_time")
  endTime           DateTime              @map("end_time")
  allDay            Boolean               @default(false) @map("all_day")
  location          String?
  color             String?               // Hex color code
  categoryId        String                @map("category_id")
  status            EventStatus           @default(SCHEDULED)
  visibility        EventVisibility       @default(PUBLIC)
  creatorId         String                @map("creator_id")
  recurrenceRuleId  String?               @unique @map("recurrence_rule_id")
  parentEventId     String?               @map("parent_event_id") // For recurring event instances
  metadata          Json?                 // Extensible metadata
  createdAt         DateTime              @default(now()) @map("created_at")
  updatedAt         DateTime              @updatedAt @map("updated_at")
  
  category          EventCategory         @relation(fields: [categoryId], references: [id])
  creator           User                  @relation("CreatedEvents", fields: [creatorId], references: [id])
  recurrenceRule    RecurrenceRule?       @relation("EventRecurrence")
  parentEvent       CalendarEvent?        @relation("RecurringInstances", fields: [parentEventId], references: [id])
  instances         CalendarEvent[]       @relation("RecurringInstances")
  attendees         EventAttendee[]
  reminders         EventReminder[]
  linkedEntities    EventEntityLink[]
  
  @@index([startTime, endTime])
  @@index([categoryId])
  @@index([creatorId])
  @@index([status])
  @@index([visibility])
  @@index([parentEventId])
  @@map("calendar_events")
}
```

#### EventCategory Model
```prisma
model EventCategory {
  id          String          @id @default(cuid())
  name        String          @unique
  slug        String          @unique
  description String?
  color       String          // Hex color code
  icon        String?         // Icon name
  isSystem    Boolean         @default(false) @map("is_system") // System categories can't be deleted
  displayOrder Int            @default(0) @map("display_order")
  isActive    Boolean         @default(true) @map("is_active")
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")
  
  events      CalendarEvent[]
  
  @@index([slug])
  @@index([displayOrder])
  @@map("event_categories")
}
```

#### RecurrenceRule Model
```prisma
model RecurrenceRule {
  id              String          @id @default(cuid())
  frequency       RecurrenceFreq  // DAILY, WEEKLY, MONTHLY, YEARLY
  interval        Int             @default(1) // Every N days/weeks/months/years
  byDay           Int[]           @default([]) @map("by_day") // Days of week (0=Sun, 6=Sat)
  byMonthDay      Int[]           @default([]) @map("by_month_day") // Days of month (1-31)
  byMonth         Int[]           @default([]) @map("by_month") // Months (1-12)
  count           Int?            // Number of occurrences
  until           DateTime?       // End date
  exceptions      DateTime[]      @default([]) // Dates to skip
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")
  
  event           CalendarEvent?  @relation("EventRecurrence")
  
  @@map("recurrence_rules")
}
```

#### EventAttendee Model
```prisma
model EventAttendee {
  id              String          @id @default(cuid())
  eventId         String          @map("event_id")
  userId          String?         @map("user_id")
  teamId          String?         @map("team_id") // For future team support
  responseStatus  AttendeeStatus  @default(PENDING)
  isOrganizer     Boolean         @default(false) @map("is_organizer")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")
  
  event           CalendarEvent   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user            User?           @relation("EventAttendees", fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, userId])
  @@index([eventId])
  @@index([userId])
  @@map("event_attendees")
}
```

#### EventReminder Model
```prisma
model EventReminder {
  id              String          @id @default(cuid())
  eventId         String          @map("event_id")
  userId          String          @map("user_id")
  minutesBefore   Int             @map("minutes_before") // Minutes before event start
  isSent          Boolean         @default(false) @map("is_sent")
  sentAt          DateTime?       @map("sent_at")
  createdAt       DateTime        @default(now()) @map("created_at")
  
  event           CalendarEvent   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user            User            @relation("EventReminders", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([eventId])
  @@index([userId])
  @@index([isSent, sentAt])
  @@map("event_reminders")
}
```

#### EventEntityLink Model (Extensibility)
```prisma
model EventEntityLink {
  id          String          @id @default(cuid())
  eventId     String          @map("event_id")
  entityType  String          @map("entity_type") // 'order', 'customer', 'product', 'blog_post', etc.
  entityId    String          @map("entity_id")
  metadata    Json?           // Additional link metadata
  createdAt   DateTime        @default(now()) @map("created_at")
  
  event       CalendarEvent   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, entityType, entityId])
  @@index([eventId])
  @@index([entityType, entityId])
  @@map("event_entity_links")
}
```

#### CalendarSettings Model
```prisma
model CalendarSettings {
  id                  String   @id @default(cuid())
  userId              String?  @unique @map("user_id") // Null for global settings
  defaultView         String   @default("month") @map("default_view") // month, week, day, agenda
  weekStartsOn        Int      @default(0) @map("week_starts_on") // 0=Sunday, 1=Monday
  workingHoursStart   String   @default("09:00") @map("working_hours_start")
  workingHoursEnd     String   @default("17:00") @map("working_hours_end")
  workingDays         Int[]    @default([1,2,3,4,5]) @map("working_days") // 0=Sun, 6=Sat
  timeZone            String   @default("UTC") @map("time_zone")
  defaultReminders    Int[]    @default([15]) @map("default_reminders") // Minutes before
  showWeekNumbers     Boolean  @default(false) @map("show_week_numbers")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  
  @@index([userId])
  @@map("calendar_settings")
}
```

#### Enums
```prisma
enum EventStatus {
  SCHEDULED
  CANCELLED
  COMPLETED
}

enum EventVisibility {
  PUBLIC      // Everyone can see
  PRIVATE     // Only creator and attendees
  TEAM_ONLY   // Only team members
}

enum RecurrenceFreq {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

enum AttendeeStatus {
  PENDING
  ACCEPTED
  DECLINED
  TENTATIVE
}
```

### User Model Extensions
```prisma
// Add to existing User model
model User {
  // ... existing fields ...
  createdEvents       CalendarEvent[]     @relation("CreatedEvents")
  eventAttendances    EventAttendee[]     @relation("EventAttendees")
  eventReminders      EventReminder[]     @relation("EventReminders")
  calendarSettings    CalendarSettings?
}
```

## Data Models

### Frontend TypeScript Interfaces

```typescript
// frontend/src/types/calendar.ts

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  allDay: boolean;
  location?: string;
  color?: string;
  category: EventCategory;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'TEAM_ONLY';
  creator: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  recurrenceRule?: RecurrenceRule;
  parentEventId?: string;
  attendees: EventAttendee[];
  reminders: EventReminder[];
  linkedEntities?: EventEntityLink[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface RecurrenceRule {
  id: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  byDay?: number[]; // 0=Sun, 6=Sat
  byMonthDay?: number[];
  byMonth?: number[];
  count?: number;
  until?: string;
  exceptions?: string[];
}

export interface EventAttendee {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  teamId?: string;
  responseStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
  isOrganizer: boolean;
}

export interface EventReminder {
  id: string;
  minutesBefore: number;
  isSent: boolean;
  sentAt?: string;
}

export interface EventEntityLink {
  id: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}

export interface CalendarSettings {
  id: string;
  userId?: string;
  defaultView: 'month' | 'week' | 'day' | 'agenda';
  weekStartsOn: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: number[];
  timeZone: string;
  defaultReminders: number[];
  showWeekNumbers: boolean;
}

export interface CalendarFilters {
  categories?: string[];
  users?: string[];
  teams?: string[];
  statuses?: ('SCHEDULED' | 'CANCELLED' | 'COMPLETED')[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda' | 'timeline';
```

### Backend DTOs

```typescript
// backend/src/calendar/dto/create-event.dto.ts

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i)
  color?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attendeeIds?: string[];

  @IsObject()
  @IsOptional()
  recurrenceRule?: RecurrenceRuleDto;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  reminders?: number[]; // Minutes before

  @IsArray()
  @IsOptional()
  linkedEntities?: EventEntityLinkDto[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Event time validity
*For any* calendar event, the end time must be after or equal to the start time.
**Validates: Requirements 1.1**

### Property 2: Recurrence rule consistency
*For any* recurring event with a recurrence rule, generating instances should produce events that match the rule's frequency and interval.
**Validates: Requirements 2.1, 2.2**

### Property 3: Reminder timing correctness
*For any* event reminder, the reminder notification should be created at exactly (event start time - minutes before).
**Validates: Requirements 3.1, 3.2**

### Property 4: Visibility enforcement
*For any* calendar event with PRIVATE visibility, only the creator and attendees should be able to view the event.
**Validates: Requirements 1.5, 9.4**

### Property 5: Permission-based access
*For any* user attempting to modify an event, the operation should succeed only if the user is the creator, an attendee, or has the appropriate permission.
**Validates: Requirements 9.2, 9.3**

### Property 6: Attendee uniqueness
*For any* calendar event, each user should appear at most once in the attendees list.
**Validates: Requirements 1.4**

### Property 7: Category assignment
*For any* calendar event, the event must be assigned to exactly one active event category.
**Validates: Requirements 1.1, 6.2**

### Property 8: Recurring instance parent link
*For any* recurring event instance, if it has a parent event ID, the parent must exist and have a recurrence rule.
**Validates: Requirements 2.5**

### Property 9: Reminder deduplication
*For any* event and user combination, there should be at most one pending reminder for each unique minutes-before value.
**Validates: Requirements 3.1**

### Property 10: Theme color contrast
*For any* event with a custom color, the color should have sufficient contrast ratio (WCAG AA) against both light and dark theme backgrounds.
**Validates: Requirements 13.3**

### Property 11: Mobile gesture responsiveness
*For any* drag or resize operation on mobile, the event time update should complete within 300ms of gesture end.
**Validates: Requirements 11.2**

### Property 12: Filter result consistency
*For any* set of calendar filters, applying the same filters twice should return the same events in the same order.
**Validates: Requirements 5.1, 5.2**

### Property 13: Cron job idempotency
*For any* reminder processing cron job execution, running the job multiple times for the same time window should not create duplicate notifications.
**Validates: Requirements 12.2**

### Property 14: Audit log completeness
*For any* event creation, update, or deletion operation, an audit log entry must be created with the operation type, user ID, and timestamp.
**Validates: Requirements 14.1, 14.2, 14.3**

## Error Handling

### Backend Error Handling

**Event Not Found:**
- HTTP 404 with message: "Event with ID {id} not found"
- Occurs when accessing non-existent events

**Permission Denied:**
- HTTP 403 with message: "You don't have permission to {action} this event"
- Occurs when user lacks required permissions

**Invalid Time Range:**
- HTTP 400 with message: "Event end time must be after start time"
- Occurs when creating/updating events with invalid times

**Category Not Found:**
- HTTP 404 with message: "Event category with ID {id} not found"
- Occurs when assigning non-existent category

**Recurrence Rule Invalid:**
- HTTP 400 with message: "Invalid recurrence rule: {reason}"
- Occurs when recurrence rule validation fails

**Attendee Not Found:**
- HTTP 404 with message: "User with ID {id} not found"
- Occurs when adding non-existent attendees

**Concurrent Modification:**
- HTTP 409 with message: "Event was modified by another user. Please refresh and try again"
- Occurs when optimistic locking detects conflicts

### Frontend Error Handling

**Network Errors:**
- Display toast notification: "Failed to load calendar events. Please try again."
- Retry button in error state

**Validation Errors:**
- Inline form validation with error messages
- Prevent form submission until errors are resolved

**Permission Errors:**
- Display message: "You don't have permission to perform this action"
- Hide unauthorized UI elements

**Date/Time Errors:**
- Validate date ranges before submission
- Show user-friendly error messages for invalid dates

## Testing Strategy

### Unit Testing

**Backend Unit Tests:**
- CalendarService CRUD operations
- RecurrenceService rule generation
- ReminderService notification creation
- Permission guard logic
- DTO validation

**Frontend Unit Tests:**
- Calendar view rendering
- Event form validation
- Date utility functions
- Filter logic
- Widget components

### Property-Based Testing

**Testing Framework:** fast-check (JavaScript/TypeScript)

**Property Tests:**
1. Event time validity property
2. Recurrence generation consistency
3. Reminder timing accuracy
4. Visibility enforcement
5. Permission-based access control
6. Attendee uniqueness
7. Filter result consistency
8. Cron job idempotency

**Configuration:**
- Minimum 100 iterations per property test
- Custom generators for dates, recurrence rules, and events
- Shrinking enabled for minimal failing examples

### Integration Testing

**Backend Integration Tests:**
- Full event lifecycle (create, read, update, delete)
- Recurring event generation
- Reminder processing cron job
- Permission enforcement across endpoints
- Event filtering and search

**Frontend Integration Tests:**
- Calendar view switching
- Event drag and drop
- Event creation flow
- Filter application
- Widget data loading

### End-to-End Testing

**E2E Test Scenarios:**
1. User creates a one-time event
2. User creates a recurring weekly meeting
3. User receives reminder notification
4. User filters events by category
5. Admin manages event categories
6. Mobile user creates event via touch interface

### Accessibility Testing

**WCAG 2.1 AA Compliance:**
- Keyboard navigation for all calendar interactions
- Screen reader announcements for event changes
- Color contrast for event colors
- Focus indicators for interactive elements
- ARIA labels for calendar controls

### Performance Testing

**Performance Targets:**
- Calendar view render: < 200ms for 100 events
- Event creation: < 500ms
- Filter application: < 100ms
- Widget load: < 300ms
- Mobile gesture response: < 300ms

**Load Testing:**
- 1000 concurrent users viewing calendar
- 100 events created per minute
- Reminder processing for 10,000 events
