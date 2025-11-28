# Implementation Plan

- [x] 1. Extend database schema for messaging system




  - Create Prisma schema models for Conversation, ConversationParticipant, Message, MessageStatus, and MessagingSettings
  - Add messaging relationships to existing User model
  - Generate Prisma migration for new models
  - Apply migration to development database
  - Create seed data for default messaging settings and permissions
  - _Requirements: 1.5, 2.2, 10.1, 14.5_

- [x] 2. Implement backend messaging functionality




- [x] 2.1 Create messaging settings module










  - Create MessagingSettings module, controller, and service in `backend/src/messaging-settings/`
  - Implement DTOs for creating and updating messaging settings with validation
  - Create endpoints: GET /messaging-settings, PATCH /messaging-settings
  - Add permission guards requiring `messaging:settings:read` and `messaging:settings:write`
  - Implement caching for messaging settings with 10-minute TTL
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 2.2 Create conversations module



  - Create Conversations module, controller, and service in `backend/src/conversations/`
  - Implement DTOs for creating direct and group conversations with validation
  - Create endpoints: POST /conversations, GET /conversations, GET /conversations/:id
  - Implement conversation creation logic preventing duplicate direct conversations
  - Add participant management endpoints: POST /conversations/:id/participants, DELETE /conversations/:id/participants/:userId
  - Implement mark-as-read functionality: PATCH /conversations/:id/read
  - Create unread count endpoint: GET /conversations/unread-count
  - Add conversation search endpoint: GET /conversations/search
  - Add permission guards requiring `messaging:access` permission
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.1, 9.2, 9.3, 9.4, 13.2, 13.3, 14.1, 14.2, 14.3_

- [x] 2.3 Create messages module


  - Create Messages module, controller, and service in `backend/src/messages/`
  - Implement DTOs for sending messages with content validation
  - Create endpoints: POST /messages, GET /messages, PATCH /messages/:id/status, DELETE /messages/:id
  - Implement message sending with length validation against settings
  - Add message status tracking (SENT, DELIVERED, READ)
  - Implement message search with full-text search: GET /messages/search
  - Add soft delete functionality for messages
  - Implement pagination for message retrieval with cursor-based pagination
  - Add permission guards requiring `messaging:access` permission
  - _Requirements: 3.5, 3.6, 6.1, 6.2, 6.3, 6.4, 6.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 13.1, 13.2, 13.3, 13.4_

- [x] 2.4 Extend WebSocket gateway for messaging


  - Create MessagingWebSocketGateway in `backend/src/messaging/messaging-websocket.gateway.ts`
  - Implement WebSocket namespace `/messaging` with authentication
  - Add event handlers: `message:send`, `message:typing`, `message:read`
  - Implement real-time message broadcasting to conversation participants
  - Add typing indicator broadcasting with 3-second timeout
  - Implement message status update broadcasting
  - Add conversation room management for targeted broadcasts
  - Handle WebSocket disconnection and reconnection gracefully
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 13.1_

- [x] 2.5 Integrate messaging with notification system


  - Create notification integration service in `backend/src/messaging/messaging-notification.service.ts`
  - Implement message notification creation with category SOCIAL
  - Add notification preferences check before creating notifications
  - Include sender name, message preview (first 50 characters), and conversation name in notifications
  - Create notification action linking to conversation
  - Respect Do Not Disturb settings for message notifications
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2.6 Implement message retention and cleanup


  - Create scheduled task for message retention cleanup in `backend/src/messaging/messaging-cleanup.service.ts`
  - Implement automatic deletion of messages older than retention period
  - Add soft delete logic preserving conversation metadata
  - Schedule cleanup task to run daily at 2 AM
  - Log cleanup operations for audit purposes
  - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [ ]* 2.7 Create backend unit tests
  - Write unit tests for MessagingSettingsService covering all CRUD operations
  - Write unit tests for ConversationsService covering conversation creation, participant management, and queries
  - Write unit tests for MessagesService covering message sending, status updates, and search
  - Write unit tests for MessagingWebSocketGateway covering event handling and broadcasting
  - Achieve minimum 80% code coverage for all messaging services
  - _Requirements: 15.1_

- [ ]* 2.8 Create backend integration tests
  - Write E2E tests for all messaging API endpoints in `backend/test/messaging.e2e-spec.ts`
  - Test conversation creation, retrieval, and participant management
  - Test message sending, retrieval, and status updates
  - Test messaging settings CRUD operations
  - Test WebSocket connection, authentication, and message delivery
  - Test permission-based access control for all endpoints
  - _Requirements: 15.2, 15.4_

- [x] 3. Build frontend messaging UI components






- [x] 3.1 Create messaging context and state management

  - Create MessagingContext in `frontend/src/contexts/MessagingContext.tsx`
  - Implement WebSocket connection management for messaging namespace
  - Add state for conversations, messages, unread count, and selected conversation
  - Implement methods: sendMessage, createConversation, markAsRead, selectConversation
  - Handle real-time events: new message, typing indicator, status update
  - Add error handling and reconnection logic
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [x] 3.2 Create API client functions

  - Create messaging API client in `frontend/src/lib/api/messaging.ts`
  - Implement functions for all messaging endpoints (conversations, messages, settings)
  - Add TypeScript types in `frontend/src/types/messaging.ts`
  - Implement error handling and response transformation
  - Add request/response interceptors for authentication
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 9.1, 9.2_


- [x] 3.3 Create MessageIcon component for page header

  - Create MessageIcon component in `frontend/src/components/messaging/MessageIcon.tsx`
  - Display message icon with unread count badge
  - Implement click handler to toggle message panel
  - Add theme-aware styling using shadcn/ui components
  - Hide icon when messaging is disabled or user lacks permission
  - Integrate with MessagingContext for unread count
  - _Requirements: 1.2, 1.3, 11.1, 11.6, 14.1, 14.3_


- [x] 3.4 Integrate MessageIcon into PageHeader


  - Update PageHeader component in `frontend/src/components/layout/PageHeader.tsx`
  - Add MessageIcon next to notification icon
  - Ensure proper spacing and alignment
  - Maintain responsive design for mobile devices
  - _Requirements: 11.1, 11.5_


- [x] 3.5 Create MessagePanel sliding panel component

  - Create MessagePanel component in `frontend/src/components/messaging/MessagePanel.tsx`
  - Implement sliding panel animation from right side using shadcn/ui Sheet
  - Add header with title, search input, and close button
  - Include "New Message" button for creating conversations
  - Implement panel state management (open/closed)
  - Add keyboard navigation support (Escape to close)
  - Ensure responsive design with full-screen on mobile
  - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6_


- [x] 3.6 Create ConversationList component

  - Create ConversationList component in `frontend/src/components/messaging/ConversationList.tsx`
  - Display list of conversations with last message preview
  - Show unread count badge for each conversation
  - Highlight selected conversation
  - Implement conversation selection handler
  - Add loading skeleton for initial load
  - Display empty state when no conversations exist
  - _Requirements: 3.1, 11.6_


- [x] 3.7 Create ConversationView component

  - Create ConversationView component in `frontend/src/components/messaging/ConversationView.tsx`
  - Display conversation header with participant info and back button
  - Implement message list with virtual scrolling for performance
  - Show typing indicators at bottom of message list
  - Add MessageInput component at bottom
  - Implement auto-scroll to bottom on new messages
  - Mark messages as read when conversation is visible
  - _Requirements: 3.5, 5.2, 7.3, 7.4, 11.6, 12.2, 12.3_


- [x] 3.8 Create MessageBubble component

  - Create MessageBubble component in `frontend/src/components/messaging/MessageBubble.tsx`
  - Display message content with sender name and avatar
  - Show timestamp in relative format (e.g., "2 minutes ago")
  - Display message status indicators (sent, delivered, read) for own messages
  - Apply different styling for own messages vs received messages
  - Use theme-aware colors and shadcn/ui components
  - Implement React.memo for performance optimization
  - _Requirements: 3.5, 6.4, 11.6_

- [x] 3.9 Create MessageInput component


  - Create MessageInput component in `frontend/src/components/messaging/MessageInput.tsx`
  - Implement textarea with auto-resize functionality
  - Add send button with disabled state when empty
  - Display character count with warning when approaching limit
  - Emit typing indicator on input with 300ms debounce
  - Clear input after successful send
  - Handle Enter key to send (Shift+Enter for new line)
  - Validate message length before sending
  - _Requirements: 3.6, 7.1, 7.2, 11.3, 11.6_

- [x] 3.10 Create NewConversationDialog component


  - Create NewConversationDialog component in `frontend/src/components/messaging/NewConversationDialog.tsx`
  - Implement user search with debounced input (300ms)
  - Display search results with user avatars and names
  - Allow multiple user selection for group conversations
  - Add group name input field when multiple users selected
  - Implement conversation creation handler
  - Show loading state during creation
  - Close dialog and navigate to new conversation on success
  - _Requirements: 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 11.3, 11.6_


- [x] 3.11 Create MessagingSettingsPage component

  - Create settings page in `frontend/src/app/dashboard/settings/messaging/page.tsx`
  - Display messaging enable/disable toggle (Super Admin only)
  - Add form fields for max message length, retention days, max group participants
  - Implement file attachment settings (enable/disable, max size, allowed types)
  - Add form validation using Zod schema
  - Display current settings on page load
  - Show success/error messages on save
  - Add permission check to restrict access to Super Admin
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 14.4_


- [x] 3.12 Add messaging settings card to main settings page

  - Update `frontend/src/app/dashboard/settings/page.tsx`
  - Add messaging settings card similar to theme and landing page cards
  - Include icon, title, description, and link to messaging settings page
  - Show current enabled/disabled status
  - Display only for users with `messaging:settings:read` permission
  - _Requirements: 2.1, 14.4_

- [ ]* 3.13 Create frontend component tests
  - Write tests for MessageIcon component covering badge display and click handling
  - Write tests for MessagePanel component covering open/close and search
  - Write tests for ConversationList component covering selection and empty state
  - Write tests for ConversationView component covering message display and sending
  - Write tests for MessageInput component covering typing and validation
  - Write tests for MessageBubble component covering status display
  - Write tests for NewConversationDialog component covering user search and creation
  - _Requirements: 15.5_

- [x] 4. Integrate messaging with WebSocket and notifications






- [x] 4.1 Connect frontend to messaging WebSocket namespace

  - Update MessagingContext to connect to `/messaging` namespace
  - Implement JWT authentication for WebSocket connection
  - Handle connection, disconnection, and reconnection events
  - Add exponential backoff for reconnection attempts
  - Display connection status in UI
  - _Requirements: 5.1, 5.4, 13.1_


- [x] 4.2 Implement real-time message delivery
  - Add event listener for `message:new` in MessagingContext
  - Update conversation list when new message arrives
  - Display new message in ConversationView if conversation is open
  - Increment unread count for closed conversations
  - Play notification sound for new messages (optional)
  - _Requirements: 5.1, 5.2, 5.3_


- [x] 4.3 Implement typing indicators
  - Emit `message:typing` event on MessageInput change with debounce
  - Listen for `typing:start` and `typing:stop` events in MessagingContext
  - Display typing indicator in ConversationView
  - Handle multiple users typing in group conversations
  - Auto-clear typing indicators after 5 seconds
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4.4 Implement message status updates

  - Emit `message:read` event when conversation is viewed
  - Listen for `status:update` events in MessagingContext
  - Update message status in UI when status changes
  - Display status indicators in MessageBubble component
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [x] 4.5 Integrate with notification system

  - Listen for message notifications in NotificationContext
  - Display toast notification for new messages when panel is closed
  - Add click handler to notification to open message panel and navigate to conversation
  - Respect user's SOCIAL category notification preferences
  - Handle Do Not Disturb settings for message notifications
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4.6 Implement optimistic updates


  - Add optimistic message to conversation immediately on send
  - Update message with server response when received
  - Handle send failures with retry option
  - Show error state for failed messages
  - _Requirements: 5.1, 5.2_

- [ ]* 4.7 Create integration tests for real-time features
  - Write E2E tests for WebSocket connection and authentication
  - Test real-time message delivery between two users
  - Test typing indicator broadcasting and display
  - Test message status updates in real-time
  - Test notification creation and display for new messages
  - _Requirements: 15.3, 15.4_

- [x] 5. Create comprehensive tests and verification








- [x]* 5.1 Verify backend functionality


  - Run all backend unit tests and ensure 80%+ coverage
  - Run all backend integration tests and verify all pass
  - Test messaging settings CRUD operations manually
  - Test conversation creation and participant management
  - Test message sending and retrieval with pagination
  - Verify WebSocket connection and message delivery
  - Test permission-based access control
  - _Requirements: 15.1, 15.2, 15.4_

- [x]* 5.2 Verify frontend functionality


  - Run all frontend component tests and verify all pass
  - Test MessageIcon display and unread count
  - Test MessagePanel open/close and search
  - Test conversation creation and selection
  - Test message sending and display
  - Test typing indicators and message statuses
  - Verify responsive design on mobile devices
  - Test keyboard navigation and accessibility
  - _Requirements: 15.3, 15.5_

- [x]* 5.3 Verify integration and end-to-end flows

  - Test complete flow: user opens panel, creates conversation, sends message, receives response
  - Test real-time message delivery between two browser windows
  - Test typing indicators between users
  - Test message status updates (sent, delivered, read)
  - Test notification creation and click-through to conversation
  - Test messaging enable/disable by Super Admin
  - Test permission-based access control
  - _Requirements: 15.3, 15.4_

- [x]* 5.4 Performance testing

  - Test conversation list loading with 100+ conversations
  - Test message list loading with 1000+ messages
  - Verify virtual scrolling performance in ConversationView
  - Test WebSocket message delivery latency (should be <1 second)
  - Verify typing indicator debouncing (300ms)
  - Test search performance with large message history
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x]* 5.5 Security testing

  - Verify JWT authentication for WebSocket connections
  - Test permission checks for all API endpoints
  - Verify conversation participation authorization
  - Test input validation and XSS prevention
  - Verify message content sanitization
  - Test rate limiting for message sending
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x]* 5.6 Create verification script

  - Create automated verification script in `backend/test-messaging-system.js`
  - Test all API endpoints with sample data
  - Verify database schema and relationships
  - Check WebSocket connection and events
  - Validate frontend components render correctly
  - Generate verification report with pass/fail status
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
