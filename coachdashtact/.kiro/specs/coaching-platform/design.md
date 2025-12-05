# Design Document

## Overview

The Coaching Platform is a comprehensive system that enables coaches to manage members, schedule sessions, and facilitate direct booking with capacity limits. The system extends the existing full-stack application infrastructure (NestJS backend, Next.js frontend, PostgreSQL database) with five new database tables, four backend modules, and eight frontend pages.

The platform supports three primary user flows:
1. **Member Flow**: Signup → Assignment to coach → Book sessions → Attend sessions → Rate sessions
2. **Coach Flow**: Set availability → Manage members → Conduct sessions → Track progress
3. **Admin Flow**: Oversee all coaches and members → Assign relationships → Monitor system health

Key architectural decisions:
- Leverage existing calendar system for session scheduling
- Leverage existing messaging system for coach-member communication
- Leverage existing notification system for reminders and alerts
- Use database transactions for booking to prevent race conditions
- Implement real-time slot updates via WebSocket

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Member Portal          │  Coach Dashboard                   │
│  - Signup               │  - Dashboard                       │
│  - Dashboard            │  - Members List                    │
│  - Book Session         │  - Sessions Calendar               │
│  - My Sessions          │  - Manage Availability             │
│  - Profile              │  - Member Details                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │ WebSocket (real-time updates)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (NestJS)                         │
├─────────────────────────────────────────────────────────────┤
│  New Modules:                                                │
│  - Members Module        - Sessions Module                   │
│  - Coach Availability    - Bookings Module                   │
│                                                              │
│  Existing Modules (Integration):                             │
│  - Auth Module          - Permissions Module                 │
│  - Calendar Module      - Messaging Module                   │
│  - Notifications Module - Users Module                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  New Tables:                                                 │
│  - member_profiles      - sessions                           │
│  - coach_profiles       - session_bookings                   │
│  - coach_availability                                        │
│                                                              │
│  Existing Tables (Used):                                     │
│  - users                - calendar_events                    │
│  - conversations        - notifications                      │
│  - permissions          - user_permissions                   │
└─────────────────────────────────────────────────────────────┘
```

### Module Dependencies

```
Members Module
├── depends on: PrismaModule, PermissionsModule, UsersModule
└── used by: Sessions Module, Bookings Module

Coach Availability Module
├── depends on: PrismaModule, PermissionsModule
└── used by: Bookings Module

Sessions Module
├── depends on: PrismaModule, PermissionsModule, CalendarModule, NotificationsModule
└── used by: Bookings Module

Bookings Module
├── depends on: PrismaModule, PermissionsModule, SessionsModule, CoachAvailabilityModule
└── used by: Frontend booking interface
```

## Components and Interfaces

### Backend Modules

#### 1. Members Module

**Purpose**: Manage member profiles, coach assignments, and member-specific operations.

**Controller Endpoints**:
```typescript
GET    /members                    // List members (filtered by role)
GET    /members/:id                // Get member details
POST   /members                    // Create member profile
PATCH  /members/:id                // Update member profile
PATCH  /members/:id/assign-coach   // Assign/reassign coach
PATCH  /members/:id/onboarding     // Update onboarding status
GET    /members/coach/:coachId     // Get coach's members
```

**Service Methods**:
```typescript
findAll(userId: string, role: string): Promise<MemberProfile[]>
findOne(id: string, userId: string, role: string): Promise<MemberProfile>
create(dto: CreateMemberDto): Promise<MemberProfile>
update(id: string, dto: UpdateMemberDto): Promise<MemberProfile>
assignCoach(memberId: string, coachId: string): Promise<MemberProfile>
updateOnboardingStatus(memberId: string, status: string): Promise<MemberProfile>
getMembersByCoach(coachId: string): Promise<MemberProfile[]>
```

**DTOs**:
```typescript
CreateMemberDto {
  userId: string;
  coachId?: string;
  goals?: string;
  healthInfo?: string;
}

UpdateMemberDto {
  goals?: string;
  healthInfo?: string;
  coachNotes?: string;
  membershipStatus?: 'active' | 'inactive' | 'paused';
}

AssignCoachDto {
  coachId: string;
}
```

#### 2. Coach Availability Module

**Purpose**: Manage coach weekly schedules and calculate available booking slots.

**Controller Endpoints**:
```typescript
GET    /coach-availability                    // Get current user's availability
GET    /coach-availability/:coachId           // Get specific coach's availability
GET    /coach-availability/:coachId/slots     // Get available booking slots
POST   /coach-availability                    // Create availability slot
PATCH  /coach-availability/:id                // Update availability slot
DELETE /coach-availability/:id                // Delete availability slot
```

**Service Methods**:
```typescript
findByCoach(coachId: string): Promise<CoachAvailability[]>
create(dto: CreateAvailabilityDto): Promise<CoachAvailability>
update(id: string, dto: UpdateAvailabilityDto): Promise<CoachAvailability>
delete(id: string): Promise<void>
getAvailableSlots(coachId: string, startDate: Date, endDate: Date): Promise<AvailableSlot[]>
checkSlotAvailability(coachId: string, date: Date, time: string): Promise<boolean>
```

**DTOs**:
```typescript
CreateAvailabilityDto {
  coachId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  maxSessionsPerSlot: number;
  bufferMinutes: number;
}

GetAvailableSlotsDto {
  startDate: Date;
  endDate: Date;
  duration?: number; // Session duration in minutes (default: 60)
}

AvailableSlot {
  date: Date;
  time: string;
  availableCapacity: number;
  maxCapacity: number;
}
```

#### 3. Sessions Module

**Purpose**: Manage coaching sessions with full lifecycle tracking and calendar integration.

**Controller Endpoints**:
```typescript
GET    /sessions                    // List sessions (filtered by role)
GET    /sessions/:id                // Get session details
POST   /sessions                    // Create session
PATCH  /sessions/:id                // Update session
PATCH  /sessions/:id/complete       // Complete session
PATCH  /sessions/:id/cancel         // Cancel session
POST   /sessions/:id/coach-notes    // Add coach notes
POST   /sessions/:id/member-notes   // Add member notes
POST   /sessions/:id/rate           // Rate session
GET    /sessions/upcoming           // Get upcoming sessions
GET    /sessions/member/:memberId   // Get member's sessions
GET    /sessions/coach/:coachId     // Get coach's sessions
```

**Service Methods**:
```typescript
findAll(userId: string, role: string): Promise<Session[]>
findOne(id: string, userId: string, role: string): Promise<Session>
create(dto: CreateSessionDto): Promise<Session>
update(id: string, dto: UpdateSessionDto): Promise<Session>
complete(id: string, dto: CompleteSessionDto): Promise<Session>
cancel(id: string, reason?: string): Promise<Session>
addCoachNotes(id: string, notes: string): Promise<Session>
addMemberNotes(id: string, notes: string): Promise<Session>
rateSession(id: string, rating: number, feedback?: string): Promise<Session>
getUpcomingSessions(userId: string, role: string): Promise<Session[]>
```

**DTOs**:
```typescript
CreateSessionDto {
  memberId: string;
  coachId: string;
  scheduledAt: Date;
  duration: number; // minutes
  type: 'initial' | 'regular' | 'followup';
  memberNotes?: string;
}

CompleteSessionDto {
  coachNotes: string;
  outcomes?: string;
}

RateSessionDto {
  rating: number; // 1-5
  feedback?: string;
}
```

#### 4. Bookings Module

**Purpose**: Handle direct booking requests with capacity management and auto-confirmation.

**Controller Endpoints**:
```typescript
GET    /bookings              // List bookings (filtered by role)
GET    /bookings/:id          // Get booking details
POST   /bookings              // Create booking
DELETE /bookings/:id          // Cancel booking
GET    /bookings/pending      // Get pending bookings (coach)
```

**Service Methods**:
```typescript
findAll(userId: string, role: string): Promise<SessionBooking[]>
findOne(id: string): Promise<SessionBooking>
create(dto: CreateBookingDto): Promise<SessionBooking>
cancelBooking(id: string): Promise<void>
checkSlotCapacity(coachId: string, date: Date, time: string): Promise<number>
getPendingBookings(coachId: string): Promise<SessionBooking[]>
```

**DTOs**:
```typescript
CreateBookingDto {
  memberId: string;
  coachId: string;
  requestedDate: Date;
  requestedTime: string; // HH:mm format
  duration: number; // minutes
  memberNotes?: string;
}
```

### Frontend Components

#### Member Portal Components

**MemberSignupForm**:
```typescript
interface MemberSignupFormProps {
  availableCoaches: Coach[];
}

// Fields: name, email, password, coach selection, goals
// Calls: AuthApi.registerMember(), MembersApi.createProfile()
```

**MemberDashboard**:
```typescript
interface MemberDashboardProps {
  member: MemberProfile;
  nextSession?: Session;
  upcomingSessions: Session[];
}

// Displays: Next session countdown, quick actions, upcoming sessions
```

**BookSessionForm**:
```typescript
interface BookSessionFormProps {
  coachId: string;
  availableSlots: AvailableSlot[];
  onBookingComplete: () => void;
}

// Features: Calendar view, slot selection, capacity display, real-time updates
```

**SessionDetailView**:
```typescript
interface SessionDetailViewProps {
  session: Session;
  userRole: 'member' | 'coach';
  onUpdate: () => void;
}

// Displays: Session info, notes, actions (cancel, complete, rate)
```

#### Coach Dashboard Components

**CoachDashboard**:
```typescript
interface CoachDashboardProps {
  coach: CoachProfile;
  todaysSessions: Session[];
  upcomingSessions: Session[];
  memberCount: number;
}

// Displays: Today's schedule, upcoming sessions, member stats
```

**MembersList**:
```typescript
interface MembersListProps {
  members: MemberProfile[];
  onMemberSelect: (id: string) => void;
}

// Features: Table view, filters, search, pagination
```

**MemberDetailView**:
```typescript
interface MemberDetailViewProps {
  member: MemberProfile;
  sessions: Session[];
  onUpdate: () => void;
}

// Displays: Member info, goals, session history, coach notes
```

**AvailabilityGrid**:
```typescript
interface AvailabilityGridProps {
  availability: CoachAvailability[];
  onUpdate: () => void;
}

// Features: Weekly grid, add/edit/delete slots, capacity display
```

## Data Models

### Database Schema

#### member_profiles
```prisma
model MemberProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  coachId           String?
  membershipStatus  String   @default("active") // active, inactive, paused
  onboardingStatus  String   @default("pending") // pending, in_progress, completed
  goals             String?  @db.Text
  healthInfo        String?  @db.Text
  coachNotes        String?  @db.Text
  joinedAt          DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  coach             User?    @relation("CoachMembers", fields: [coachId], references: [id], onDelete: SetNull)
  sessions          Session[]
  bookings          SessionBooking[]
  
  @@index([coachId])
  @@index([membershipStatus])
  @@map("member_profiles")
}
```

#### coach_profiles
```prisma
model CoachProfile {
  id                  String   @id @default(uuid())
  userId              String   @unique
  specialization      String?
  bio                 String?  @db.Text
  certifications      String?  @db.Text
  maxMembers          Int      @default(20)
  isAcceptingMembers  Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  availability        CoachAvailability[]
  sessions            Session[]
  
  @@index([isAcceptingMembers])
  @@map("coach_profiles")
}
```

#### coach_availability
```prisma
model CoachAvailability {
  id                  String   @id @default(uuid())
  coachId             String
  dayOfWeek           Int      // 0-6 (Sunday-Saturday)
  startTime           String   // HH:mm format
  endTime             String   // HH:mm format
  maxSessionsPerSlot  Int      @default(1)
  bufferMinutes       Int      @default(15)
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  coach               User     @relation(fields: [coachId], references: [id], onDelete: Cascade)
  
  @@index([coachId])
  @@index([dayOfWeek])
  @@index([isActive])
  @@map("coach_availability")
}
```

#### sessions
```prisma
model Session {
  id              String    @id @default(uuid())
  calendarEventId String    @unique
  memberId        String
  coachId         String
  type            String    // initial, regular, followup
  status          String    @default("scheduled") // scheduled, completed, cancelled
  duration        Int       // minutes
  scheduledAt     DateTime
  coachNotes      String?   @db.Text
  memberNotes     String?   @db.Text
  outcomes        String?   @db.Text
  rating          Int?      // 1-5
  ratingFeedback  String?   @db.Text
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancellationReason String? @db.Text
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  calendarEvent   CalendarEvent @relation(fields: [calendarEventId], references: [id], onDelete: Cascade)
  member          MemberProfile @relation(fields: [memberId], references: [id], onDelete: Cascade)
  coach           User          @relation("CoachSessions", fields: [coachId], references: [id], onDelete: Cascade)
  booking         SessionBooking?
  
  @@index([memberId])
  @@index([coachId])
  @@index([status])
  @@index([scheduledAt])
  @@map("sessions")
}
```

#### session_bookings
```prisma
model SessionBooking {
  id              String    @id @default(uuid())
  memberId        String
  coachId         String
  requestedDate   DateTime
  requestedTime   String    // HH:mm format
  duration        Int       // minutes
  status          String    @default("pending") // pending, confirmed, rejected, cancelled
  memberNotes     String?   @db.Text
  sessionId       String?   @unique
  rejectionReason String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  member          MemberProfile @relation(fields: [memberId], references: [id], onDelete: Cascade)
  coach           User          @relation("CoachBookings", fields: [coachId], references: [id], onDelete: Cascade)
  session         Session?      @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  
  @@index([memberId])
  @@index([coachId])
  @@index([status])
  @@index([requestedDate])
  @@map("session_bookings")
}
```

### User Model Extensions

```prisma
model User {
  // ... existing fields ...
  
  memberProfile     MemberProfile?
  coachProfile      CoachProfile?
  coachMembers      MemberProfile[] @relation("CoachMembers")
  coachAvailability CoachAvailability[]
  coachSessions     Session[] @relation("CoachSessions")
  coachBookings     SessionBooking[] @relation("CoachBookings")
}
```

### Relationships

- **User ↔ MemberProfile**: One-to-one (a user can have one member profile)
- **User ↔ CoachProfile**: One-to-one (a user can have one coach profile)
- **Coach (User) ↔ Members (MemberProfile)**: One-to-many (a coach has many members)
- **Coach (User) ↔ CoachAvailability**: One-to-many (a coach has many availability slots)
- **MemberProfile ↔ Sessions**: One-to-many (a member has many sessions)
- **Coach (User) ↔ Sessions**: One-to-many (a coach has many sessions)
- **Session ↔ CalendarEvent**: One-to-one (each session links to one calendar event)
- **SessionBooking ↔ Session**: One-to-one (a booking creates one session when confirmed)



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Member Profile Auto-Creation
*For any* user created with "Member" role, a corresponding member profile should be automatically created with default values (membershipStatus="active", onboardingStatus="pending", joinedAt=current timestamp).
**Validates: Requirements 1.1**

### Property 2: Coach Data Isolation
*For any* coach user querying the members list, the returned members should only include those where coachId matches the coach's user ID.
**Validates: Requirements 1.2, 12.1**

### Property 3: Admin Full Visibility
*For any* admin user querying the members list, the returned members should include all members regardless of coach assignment.
**Validates: Requirements 1.3**

### Property 4: Member Profile Update Validation
*For any* member profile update with valid data, the changes should be persisted and retrievable immediately; for any update with invalid data, the system should reject with validation errors.
**Validates: Requirements 1.4**

### Property 5: Coach Assignment Side Effects
*For any* member assigned to a coach, both the member profile should be updated with the coach ID and a direct conversation should be created between the coach and member.
**Validates: Requirements 1.5, 6.6, 10.1**

### Property 6: Coach Profile Auto-Creation
*For any* user created with "Coach" role, a corresponding coach profile should be automatically created with default values (maxMembers=20, isAcceptingMembers=true).
**Validates: Requirements 2.1**

### Property 7: Coach Profile Validation
*For any* coach profile update, the system should validate specialization format and capacity settings (maxMembers > 0), rejecting invalid updates.
**Validates: Requirements 2.2**

### Property 8: Coach Capacity Enforcement
*For any* coach with maxMembers limit N and N members already assigned, attempting to assign an additional member should be rejected with a capacity error.
**Validates: Requirements 2.3, 14.4**

### Property 9: Coach Acceptance Filtering
*For any* query for available coaches during signup, the returned list should only include coaches where isAcceptingMembers=true.
**Validates: Requirements 2.4**

### Property 10: Coach Profile Member Count
*For any* coach profile retrieved, the response should include currentMemberCount equal to the count of active members assigned to that coach.
**Validates: Requirements 2.5**

### Property 11: Availability Slot Validation
*For any* availability slot creation, the system should validate that dayOfWeek is 0-6, startTime is before endTime in HH:mm format, and maxSessionsPerSlot > 0.
**Validates: Requirements 3.1**

### Property 12: Availability Overlap Prevention
*For any* coach with an existing availability slot on a given day and time range, attempting to create an overlapping slot should be rejected with a conflict error.
**Validates: Requirements 3.2**

### Property 13: Availability Update Protection
*For any* availability slot with existing bookings, attempting to update the time range to exclude those bookings should be rejected with a conflict error.
**Validates: Requirements 3.3**

### Property 14: Availability Deletion Protection
*For any* availability slot with existing confirmed bookings, attempting to delete the slot should be rejected; slots without bookings should be deletable.
**Validates: Requirements 3.4**

### Property 15: Available Slot Calculation
*For any* coach availability and date range, the calculated available slots should respect session duration, buffer time, and exclude times with existing bookings.
**Validates: Requirements 3.5**

### Property 16: Slot Capacity Enforcement
*For any* availability slot with maxSessionsPerSlot=N and N bookings already confirmed, attempting to create an additional booking should be rejected with "slot full" error.
**Validates: Requirements 3.6**

### Property 17: Session Calendar Integration
*For any* session created, a corresponding calendar event should be created with the coach as creator, member as attendee, and category "Coaching Session".
**Validates: Requirements 4.1, 13.1, 13.2, 13.3**

### Property 18: Session Creation Notifications
*For any* session created, notifications should be sent to both the coach and the member.
**Validates: Requirements 4.2, 11.1**

### Property 19: Session Completion State
*For any* session marked as complete, the status should be updated to "completed" and completedAt timestamp should be set to current time.
**Validates: Requirements 4.5**

### Property 20: Session Cancellation Side Effects
*For any* session cancelled, the session status should be "cancelled", the linked calendar event status should be updated, and notifications should be sent to both parties.
**Validates: Requirements 4.7, 11.7, 13.4**

### Property 21: Coach Notes Visibility
*For any* session with coach notes, the notes should be visible to users with "Coach" or "Admin" roles but not to users with "Member" role (unless they are the assigned coach).
**Validates: Requirements 4.8**

### Property 22: Member Notes Visibility
*For any* session with member notes, the notes should be visible to the member who created them, their assigned coach, and users with "Admin" role.
**Validates: Requirements 4.9**

### Property 23: Available Slots Within Availability
*For any* coach and date range, all returned available slots should fall within the coach's defined availability schedule.
**Validates: Requirements 5.1, 15.1**

### Property 24: Available Slots Capacity Filter
*For any* coach and date range, returned available slots should exclude any slots that have reached maxSessionsPerSlot capacity.
**Validates: Requirements 5.2**

### Property 25: Available Slots Buffer Filter
*For any* coach with buffer time B minutes and existing bookings, returned available slots should exclude times within B minutes before or after existing bookings.
**Validates: Requirements 5.3**

### Property 26: Booking Auto-Confirmation
*For any* booking created for an available slot (within availability, under capacity, respecting buffer), the booking should be immediately confirmed and a session should be created.
**Validates: Requirements 5.4**

### Property 27: Booking Capacity Rejection
*For any* booking created for a slot at maximum capacity, the booking should be rejected with error message "This slot is now full, please choose another".
**Validates: Requirements 5.5, 15.5**

### Property 28: Booking Confirmation Side Effects
*For any* booking confirmed, a session should be created, a calendar event should be created, and confirmation notifications should be sent.
**Validates: Requirements 5.6**

### Property 29: Booking Cancellation Capacity Release
*For any* confirmed booking that is cancelled, the session status should be updated to "cancelled" and the slot capacity should be freed for new bookings.
**Validates: Requirements 5.8**

### Property 30: Member Signup Role Assignment
*For any* member completing signup, a user account should be created with role "Member".
**Validates: Requirements 6.1**

### Property 31: Member Signup Profile Creation
*For any* member completing signup, a linked member profile should be created (this is covered by Property 1).
**Validates: Requirements 6.2**

### Property 32: Member Signup Coach Selection
*For any* member selecting a coach during signup where the coach isAcceptingMembers=true and under capacity, the member should be assigned to that coach.
**Validates: Requirements 6.3**

### Property 33: Member Signup Capacity Rejection
*For any* member selecting a coach at maximum capacity during signup, the selection should be rejected with a capacity error.
**Validates: Requirements 6.4**

### Property 34: Member Signup Optional Coach
*For any* member completing signup without selecting a coach, the member profile should be created with coachId=null.
**Validates: Requirements 6.5**

### Property 35: Member Signup Onboarding Status
*For any* member completing signup, the member profile should have onboardingStatus="pending".
**Validates: Requirements 6.7**

### Property 36: Member Dashboard Next Session
*For any* member with upcoming sessions, the dashboard API should return the session with the earliest scheduledAt timestamp.
**Validates: Requirements 7.1**

### Property 37: Member Dashboard Upcoming Sessions
*For any* member with upcoming sessions, the dashboard API should return exactly the next 3 sessions ordered by scheduledAt.
**Validates: Requirements 7.3**

### Property 38: Coach Dashboard Today's Sessions
*For any* coach, the dashboard API should return only sessions where scheduledAt date equals today's date and coachId matches the coach.
**Validates: Requirements 8.1**

### Property 39: Coach Dashboard Week Sessions
*For any* coach, the dashboard API should return sessions where scheduledAt falls within the current week and coachId matches the coach.
**Validates: Requirements 8.2**

### Property 40: Coach Dashboard Member Count
*For any* coach, the dashboard API should return active member count equal to the number of members where coachId matches and membershipStatus="active".
**Validates: Requirements 8.3**

### Property 41: Session Rating Validation
*For any* session rating submission, the system should accept ratings from 1 to 5 inclusive and reject ratings outside this range.
**Validates: Requirements 9.2**

### Property 42: Session Rating Optional Feedback
*For any* session rating submission, the system should accept submissions with or without text feedback.
**Validates: Requirements 9.3**

### Property 43: Session Rating Persistence
*For any* session rating submitted, the rating and optional feedback should be stored linked to the session and retrievable.
**Validates: Requirements 9.4**

### Property 44: Coach Average Rating Calculation
*For any* coach profile, the average rating should equal the mean of all ratings from completed sessions where coachId matches.
**Validates: Requirements 9.5**

### Property 45: Session Rating Duplicate Prevention
*For any* session that has already been rated, attempting to submit another rating should be rejected with a duplicate error.
**Validates: Requirements 9.6**

### Property 46: Session Group Conversation Creation
*For any* session created with group conversation flag enabled, a group conversation should be created with the coach and member as participants.
**Validates: Requirements 10.4**

### Property 47: Booking Confirmation Notification
*For any* booking confirmed, a confirmation notification should be sent to the member.
**Validates: Requirements 11.4**

### Property 48: Booking Rejection Notification
*For any* booking rejected due to capacity, a rejection notification should be sent to the member.
**Validates: Requirements 11.5**

### Property 49: Session Completion Notification
*For any* session completed, completion notifications should be sent to both coach and member.
**Validates: Requirements 11.6**

### Property 50: Member Assignment Notification
*For any* member assigned to a coach, a notification should be sent to the coach.
**Validates: Requirements 11.8**

### Property 51: Member Session Data Isolation
*For any* member user querying sessions, the returned sessions should only include those where memberId matches the member's profile ID.
**Validates: Requirements 12.2**

### Property 52: Permission Enforcement Read
*For any* user without members:read permission attempting to access member list, the system should return 403 Forbidden.
**Validates: Requirements 12.3**

### Property 53: Permission Enforcement Write
*For any* user without sessions:write permission attempting to create a session, the system should return 403 Forbidden.
**Validates: Requirements 12.4**

### Property 54: Admin Full Access
*For any* user with "Admin" role, all coaching endpoints should be accessible without permission errors.
**Validates: Requirements 12.5**

### Property 55: Cross-Member Access Prevention
*For any* member attempting to view another member's profile, the system should return 403 Forbidden.
**Validates: Requirements 12.6**

### Property 56: Cross-Coach Session Access Prevention
*For any* coach attempting to view sessions for members not assigned to them, the system should return 403 Forbidden.
**Validates: Requirements 12.7**

### Property 57: Session Time Update Calendar Sync
*For any* session with updated scheduledAt time, the linked calendar event should be updated to reflect the new time.
**Validates: Requirements 13.6**

### Property 58: Session Creation User Validation
*For any* session creation request, the system should verify both coach and member users exist and are active before creating the session.
**Validates: Requirements 14.1**

### Property 59: Availability Time Range Validation
*For any* availability slot creation, the system should verify startTime is before endTime and reject invalid time ranges.
**Validates: Requirements 14.2**

### Property 60: Booking Availability Validation
*For any* booking creation, the system should verify the requested time falls within the coach's defined availability and reject bookings outside availability.
**Validates: Requirements 14.3**

### Property 61: Session Completion State Validation
*For any* session completion request, the system should verify the session status is "scheduled" and reject completion of non-scheduled sessions.
**Validates: Requirements 14.5**

### Property 62: Session Cancellation State Validation
*For any* session cancellation request, the system should verify the session status is not "completed" and reject cancellation of completed sessions.
**Validates: Requirements 14.6**

### Property 63: Session Rating State Validation
*For any* rating submission, the system should verify the session is completed and not already rated, rejecting invalid rating attempts.
**Validates: Requirements 14.7**

## Error Handling

### Error Categories

**Validation Errors (400 Bad Request)**:
- Invalid field formats (email, time, date)
- Missing required fields
- Out-of-range values (rating not 1-5, invalid day of week)
- Invalid state transitions (complete non-scheduled session)

**Authorization Errors (403 Forbidden)**:
- Missing required permissions
- Accessing resources not owned by user
- Cross-coach/cross-member access attempts

**Not Found Errors (404 Not Found)**:
- User, member, coach, session, or booking not found
- Calendar event not found

**Conflict Errors (409 Conflict)**:
- Overlapping availability slots
- Slot at maximum capacity
- Coach at maximum member capacity
- Duplicate rating submission
- Availability update conflicts with existing bookings

**Business Logic Errors (422 Unprocessable Entity)**:
- Booking outside coach availability
- Assigning member to non-accepting coach
- Deleting availability with existing bookings
- Updating availability that conflicts with bookings

### Error Response Format

All errors should follow consistent format:
```typescript
{
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}
```

### Error Handling Strategy

**Database Errors**:
- Wrap all database operations in try-catch
- Log full error details server-side
- Return sanitized error messages to client
- Use transactions for multi-step operations (booking confirmation)

**Validation Errors**:
- Validate at DTO level using class-validator
- Return detailed validation errors with field names
- Validate business rules in service layer

**Permission Errors**:
- Check permissions in guards before controller execution
- Return 403 with clear message about missing permission
- Log unauthorized access attempts

**Race Conditions**:
- Use database transactions for booking operations
- Implement optimistic locking for capacity checks
- Handle concurrent booking attempts gracefully

## Testing Strategy

### Unit Testing

**Service Layer Tests**:
- Test each service method in isolation
- Mock Prisma client and external dependencies
- Test happy paths and error cases
- Verify correct data transformations

**Example Unit Tests**:
```typescript
describe('MembersService', () => {
  it('should create member profile with defaults', async () => {
    // Test Property 1
  });
  
  it('should filter members by coach', async () => {
    // Test Property 2
  });
  
  it('should reject assignment to full coach', async () => {
    // Test Property 8
  });
});

describe('BookingsService', () => {
  it('should auto-confirm booking for available slot', async () => {
    // Test Property 26
  });
  
  it('should reject booking for full slot', async () => {
    // Test Property 27
  });
  
  it('should free capacity on cancellation', async () => {
    // Test Property 29
  });
});
```

### Property-Based Testing

**Testing Framework**: Use **fast-check** for TypeScript property-based testing.

**Configuration**: Each property test should run a minimum of 100 iterations.

**Property Test Structure**:
```typescript
import * as fc from 'fast-check';

describe('Coaching Platform Properties', () => {
  it('Property 1: Member Profile Auto-Creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          password: fc.string({ minLength: 8 }),
        }),
        async (userData) => {
          // Create member user
          const user = await createMemberUser(userData);
          
          // Verify profile exists with defaults
          const profile = await getMemberProfile(user.id);
          expect(profile).toBeDefined();
          expect(profile.membershipStatus).toBe('active');
          expect(profile.onboardingStatus).toBe('pending');
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 8: Coach Capacity Enforcement', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        fc.array(fc.string(), { minLength: 1, maxLength: 20 }),
        async (maxMembers, memberIds) => {
          // Create coach with capacity limit
          const coach = await createCoach({ maxMembers });
          
          // Assign members up to limit
          for (let i = 0; i < Math.min(maxMembers, memberIds.length); i++) {
            await assignMemberToCoach(memberIds[i], coach.id);
          }
          
          // Attempt to assign one more
          if (memberIds.length > maxMembers) {
            await expect(
              assignMemberToCoach(memberIds[maxMembers], coach.id)
            ).rejects.toThrow('capacity');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 16: Slot Capacity Enforcement', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        fc.date(),
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        async (maxSessions, date, memberIds) => {
          // Create availability with capacity
          const availability = await createAvailability({
            maxSessionsPerSlot: maxSessions,
            date,
          });
          
          // Book up to capacity
          for (let i = 0; i < Math.min(maxSessions, memberIds.length); i++) {
            await createBooking({
              memberId: memberIds[i],
              coachId: availability.coachId,
              date,
            });
          }
          
          // Attempt to book beyond capacity
          if (memberIds.length > maxSessions) {
            await expect(
              createBooking({
                memberId: memberIds[maxSessions],
                coachId: availability.coachId,
                date,
              })
            ).rejects.toThrow('slot is now full');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property Test Tags**: Each property-based test MUST include a comment tag:
```typescript
// Feature: coaching-platform, Property 1: Member Profile Auto-Creation
```

### Integration Testing

**E2E Test Scenarios**:
1. **Member Signup Flow**: Signup → Profile creation → Coach assignment → Conversation creation
2. **Booking Flow**: View slots → Create booking → Auto-confirm → Session creation → Calendar event creation
3. **Session Lifecycle**: Create → Remind → Complete → Rate
4. **Capacity Management**: Fill coach to capacity → Reject new assignment
5. **Slot Capacity**: Fill slot to capacity → Reject new booking → Cancel booking → Free capacity

**WebSocket Testing**:
- Test real-time slot availability updates
- Test concurrent booking attempts
- Verify race condition handling

### Test Data Generators

**Generators for Property Tests**:
```typescript
// User generator
const userArb = fc.record({
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: fc.constantFrom('Member', 'Coach', 'Admin'),
});

// Availability generator
const availabilityArb = fc.record({
  dayOfWeek: fc.integer({ min: 0, max: 6 }),
  startTime: fc.integer({ min: 0, max: 23 }).map(h => `${h}:00`),
  endTime: fc.integer({ min: 1, max: 24 }).map(h => `${h}:00`),
  maxSessionsPerSlot: fc.integer({ min: 1, max: 5 }),
  bufferMinutes: fc.integer({ min: 0, max: 60 }),
}).filter(a => a.startTime < a.endTime);

// Session generator
const sessionArb = fc.record({
  type: fc.constantFrom('initial', 'regular', 'followup'),
  duration: fc.constantFrom(30, 60, 90),
  scheduledAt: fc.date({ min: new Date(), max: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }),
});

// Rating generator
const ratingArb = fc.record({
  rating: fc.integer({ min: 1, max: 5 }),
  feedback: fc.option(fc.string({ maxLength: 500 })),
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Property Tests**: All 63 correctness properties implemented
- **Integration Tests**: All major user flows covered
- **E2E Tests**: Critical paths (signup, booking, session lifecycle)

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every PR
- Run integration tests before deployment
- Monitor property test failures for edge cases
