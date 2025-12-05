# Implementation Plan

## Phase 1: Database & Permissions Foundation

- [x] 1. Create database schema, migrations, and permissions ✅ COMPLETED





  - Add 5 new tables: member_profiles, coach_profiles, coach_availability, sessions, session_bookings
  - Add all necessary indexes and foreign key relationships
  - Run Prisma migration and generate client
  - Create all Coach permissions (members:read/write/assign, sessions:read/write/complete/cancel, bookings:read/manage, availability:manage, groups:create)
  - Create all Member permissions (profile:read-own/update-own, sessions:read-own/rate, bookings:create/cancel-own, messages:coach)
  - Assign permissions to Coach, Member, Admin, and Super Admin roles
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 12.1-12.7_

## Phase 2: Backend - Members & Coach Profiles Module

- [x] 2. Implement Members module with full CRUD and coach profiles





  - Create module structure: members.module.ts, members.controller.ts, members.service.ts
  - Create all DTOs: create-member, update-member, assign-coach, member-filters, create-coach-profile, update-coach-profile
  - Implement service methods: findAll (role-based filtering), findOne, create (auto-create profile), update, assignCoach (with conversation creation), getMembersByCoach
  - Implement coach profile methods: createCoachProfile, updateCoachProfile, getCoachProfile (with member count), getAvailableCoaches
  - Implement all controller endpoints with proper guards and permissions
  - Register module in app.module.ts
  - _Requirements: 1.1-1.5, 2.1-2.5, 6.1-6.7, 10.1, 11.8_

- [ ]* 2.1 Write property tests for Members module
  - **Property 1: Member Profile Auto-Creation**
  - **Property 2: Coach Data Isolation**
  - **Property 5: Coach Assignment Side Effects**
  - **Property 8: Coach Capacity Enforcement**
  - **Validates: Requirements 1.1-1.5, 2.1-2.5**

## Phase 3: Backend - Coach Availability Module

- [x] 3. Implement Coach Availability module with slot calculation





  - Create module structure: coach-availability.module.ts, controller, service
  - Create DTOs: create-availability, update-availability, get-available-slots
  - Implement CRUD operations with validation (overlap prevention, booking conflict checks)
  - Implement slot calculation logic: getAvailableSlots() considering duration, buffer time, capacity, existing bookings
  - Implement helper methods: checkSlotAvailability, checkOverlap, hasExistingBookings
  - Implement all controller endpoints with proper permissions
  - Register module in app.module.ts
  - _Requirements: 3.1-3.6, 5.1-5.3_

- [ ]* 3.1 Write property tests for Coach Availability
  - **Property 11: Availability Slot Validation**
  - **Property 12: Availability Overlap Prevention**
  - **Property 15: Available Slot Calculation**
  - **Property 16: Slot Capacity Enforcement**
  - **Validates: Requirements 3.1-3.6**

## Phase 4: Backend - Sessions Module

- [x] 4. Implement Sessions module with calendar integration





  - Create module structure: sessions.module.ts, controller, service
  - Import CalendarModule, NotificationsModule, MessagingModule
  - Create all DTOs: create-session, update-session, complete-session, cancel-session, add-notes, rate-session
  - Implement create() with calendar event creation, notifications, optional group chat
  - Implement queries with role-based filtering: findAll, findOne, getUpcomingSessions, getSessionsByMember/Coach
  - Implement lifecycle methods: update (with calendar sync), complete, cancel (with notifications)
  - Implement notes methods: addCoachNotes (visibility control), addMemberNotes
  - Implement rateSession with validation (1-5, completed sessions only, no duplicates)
  - Implement all controller endpoints with proper access control
  - Register module in app.module.ts
  - _Requirements: 4.1-4.9, 9.2-9.6, 10.4, 11.1-11.8, 13.1-13.6, 14.1, 14.5-14.7_

- [ ]* 4.1 Write property tests for Sessions module
  - **Property 17: Session Calendar Integration**
  - **Property 19: Session Completion State**
  - **Property 20: Session Cancellation Side Effects**
  - **Property 41: Session Rating Validation**
  - **Property 45: Session Rating Duplicate Prevention**
  - **Validates: Requirements 4.1-4.9, 9.2-9.6**

## Phase 5: Backend - Bookings Module

- [x] 5. Implement Bookings module with capacity management




  - Create module structure: bookings.module.ts, controller, service
  - Import SessionsModule, CoachAvailabilityModule, NotificationsModule
  - Create DTOs: create-booking, cancel-booking
  - Implement create() with transaction: verify availability, check capacity, auto-confirm or reject, create session, send notifications
  - Implement capacity checking: checkSlotCapacity() counting existing bookings
  - Implement cancelBooking() with capacity release and session cancellation
  - Implement queries with role-based filtering: findAll, findOne, getPendingBookings
  - Implement all controller endpoints with proper permissions
  - Register module in app.module.ts
  - _Requirements: 5.1-5.8, 11.4-11.5, 14.3_

- [ ]* 5.1 Write property tests for Bookings module
  - **Property 26: Booking Auto-Confirmation**
  - **Property 27: Booking Capacity Rejection**
  - **Property 29: Booking Cancellation Capacity Release**
  - **Validates: Requirements 5.1-5.8**

- [ ] 6. Backend checkpoint - Verify all modules and tests




  - Run all unit tests: `npm test` in backend/
  - Verify all modules registered in app.module.ts
  - Test API endpoints with Postman or similar
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Frontend - API Client Layer

- [x] 7. Create all frontend API client methods





  - Create frontend/src/lib/api/members.ts with all member endpoints
  - Create frontend/src/lib/api/coaches.ts with coach profile endpoints
  - Create frontend/src/lib/api/coach-availability.ts with availability and slot endpoints
  - Create frontend/src/lib/api/sessions.ts with all session lifecycle endpoints
  - Create frontend/src/lib/api/bookings.ts with booking endpoints
  - Ensure all methods use correct HTTP verbs and paths
  - Add proper TypeScript types for all requests and responses
  - _Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.6, 4.1-4.9, 5.1-5.8_

## Phase 7: Frontend - Member Portal

- [x] 8. Create member signup and authentication flow





  - Create frontend/src/app/member-signup/page.tsx
  - Create MemberSignupForm component with validation
  - Fetch available coaches, handle coach selection with capacity checks
  - Implement signup flow: create user, create profile, assign coach
  - Add error handling for capacity limits and validation errors
  - Redirect to member dashboard on success
  - _Requirements: 6.1-6.7_

- [x] 9. Create member dashboard and profile pages





  - Create frontend/src/app/member/layout.tsx with navigation
  - Create member dashboard (page.tsx) with next session, quick actions, upcoming sessions list
  - Create member sessions list page with filters (upcoming/past/cancelled)
  - Create member session detail page with notes, rating, cancel functionality
  - Create member profile page with editable goals and coach info
  - Use shadcn/ui components, implement loading states and error handling
  - _Requirements: 1.4, 7.1-7.5, 9.1-9.6_

- [x] 10. Create book session page with real-time slot selection





  - Create frontend/src/app/member/book-session/page.tsx
  - Create BookSessionForm component with calendar grid
  - Fetch and display available slots with capacity indicators
  - Implement slot selection with visual feedback (green=available, red=full, gray=booked)
  - Implement booking submission with error handling (capacity full, validation errors)
  - Add WebSocket connection for real-time slot updates
  - Show success/error toasts using toast from '@/hooks/use-toast'
  - _Requirements: 5.1-5.8, 9.1, 15.1-15.5_

## Phase 8: Frontend - Coach Dashboard

- [x] 11. Create coach dashboard and member management pages





  - Create frontend/src/app/dashboard/coaching/layout.tsx with navigation
  - Create coach dashboard with today's sessions, upcoming sessions, active member count, quick actions
  - Create members list page with table view, filters, search, pagination
  - Create member detail page with info, goals, health info, coach notes (editable), session history, quick actions
  - Use shadcn/ui components, implement loading states and error handling
  - _Requirements: 1.2, 4.8, 8.1-8.5_

- [x] 12. Create coach sessions and calendar pages




  - Create sessions calendar page with month/week/day views and list view toggle
  - Create coach session detail page with member info, notes (editable), complete/cancel buttons
  - Implement complete session with coach notes and outcomes
  - Implement cancel session with reason
  - Add filters for upcoming/past/cancelled sessions
  - Display member ratings on completed sessions
  - _Requirements: 4.5, 4.7, 4.8, 8.2, 8.6_

- [x] 13. Create manage availability page with grid interface





  - Create frontend/src/app/dashboard/coaching/availability/page.tsx
  - Create AvailabilityGrid component showing weekly schedule
  - Display existing slots with time ranges, capacity, and utilization (e.g., "3/5 booked")
  - Create AvailabilityModal for add/edit with validation
  - Implement add, edit, delete operations with error handling (overlaps, booking conflicts)
  - Show confirmation dialog for delete operations
  - Highlight full slots and show progress bars for utilization
  - _Requirements: 3.1-3.6_

## Phase 9: Integration & Polish

- [x] 14. Integrate messaging and notifications





  - Verify conversation creation on coach assignment (backend already implemented)
  - Add "Message Coach" button in member dashboard linking to messaging system
  - Add "Message Member" button in coach member detail page
  - Add "Create Group Chat" option in session creation
  - Test all notification triggers: session created, booking confirmed/rejected, session completed/cancelled, member assigned
  - Verify notification delivery in frontend
  - _Requirements: 10.1-10.5, 11.1-11.8_

- [x] 15. Add coach rating system and dashboard menu updates





  - Implement average rating calculation in coach profile API
  - Display average rating in coach profile pages (stars + count)
  - Add "Coaching" menu item for Coach role users
  - Add "Member Portal" menu item for Member role users
  - Update menu permissions for role-based visibility
  - _Requirements: 9.5, 7.1, 8.1_

- [x] 16. Add loading states, error handling, and responsive design





  - Add loading spinners and skeleton screens for all pages
  - Implement optimistic UI updates where appropriate
  - Add error boundaries for React components
  - Show user-friendly error messages with toasts
  - Add confirmation dialogs for destructive actions
  - Ensure all forms have client-side validation with inline errors
  - Test responsive design on mobile, tablet, and desktop
  - Adjust navigation for mobile (hamburger menu)
  - _Requirements: All frontend requirements_

- [x] 17. Add accessibility features





  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works throughout the app
  - Add focus indicators to all focusable elements
  - Test with screen reader
  - Ensure color contrast meets WCAG standards
  - Add alt text to images and icons
  - _Requirements: All frontend requirements_

- [x] 18. Final end-to-end testing and bug fixes





  - Test complete member flow: signup → coach assignment → book session → attend → rate
  - Test complete coach flow: set availability → member books → view booking → complete session
  - Test capacity limits: fill coach to max members, fill slot to max capacity
  - Test concurrent bookings: simulate multiple members booking same slot
  - Test cancellation flow: cancel booking → verify capacity freed → rebook
  - Test permission enforcement: verify role-based access control
  - Test real-time updates: verify slot availability updates via WebSocket
  - Test all notification deliveries
  - Test messaging integration
  - Fix any bugs found during testing
  - Ensure all tests pass, ask the user if questions arise.

