# Messaging System Design Document

## Overview

The messaging system is a real-time communication feature that enables users to exchange messages through direct conversations and group chats. The system leverages the existing WebSocket infrastructure, notification system, and permission framework while introducing new database models, backend services, and frontend components.

### Key Design Principles

1. **Leverage Existing Infrastructure**: Utilize the established WebSocket gateway, notification system, and permission framework
2. **Real-Time First**: Prioritize WebSocket communication for immediate message delivery
3. **Scalable Architecture**: Design for horizontal scaling with efficient database queries and caching
4. **Security by Default**: Implement authentication, authorization, and input validation at every layer
5. **Professional UX**: Provide a modern, accessible interface consistent with the existing design system

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Message Icon │ Message Panel │ Conversation View │ Settings │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─── REST API (HTTP) ──────────┐
         │                               │
         └─── WebSocket (Socket.IO) ────┤
                                         │
┌────────────────────────────────────────▼────────────────────┐
│                        Backend Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Messages Module │ Conversations Module │ Settings Module   │
│  ├─ Controller   │ ├─ Controller        │ ├─ Controller     │
│  ├─ Service      │ ├─ Service           │ └─ Service        │
│  └─ Gateway      │ └─ Repository        │                   │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─── Notifications Module (existing)
         ├─── Permissions Module (existing)
         └─── WebSocket Gateway (extended)
         │
┌────────▼────────────────────────────────────────────────────┐
│                      Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Conversation │ Message │ ConversationParticipant │         │
│  MessageStatus │ MessagingSettings │ (existing tables)      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: NestJS, Prisma ORM, PostgreSQL, Socket.IO
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Real-Time**: Socket.IO (existing WebSocket infrastructure)
- **State Management**: React Context API, SWR for data fetching
- **Validation**: Zod schemas, class-validator DTOs

## Components and Interfaces

### Database Models

#### 1. Conversation Model

```prisma
model Conversation {
  id              String                    @id @default(cuid())
  type            ConversationType          @default(DIRECT)
  name            String?                   // Required for group conversations
  createdById     String                    @map("created_by_id")
  createdAt       DateTime                  @default(now()) @map("created_at")
  updatedAt       DateTime                  @updatedAt @map("updated_at")
  lastMessageAt   DateTime?                 @map("last_message_at")
  lastMessageText String?                   @map("last_message_text")
  isActive        Boolean                   @default(true) @map("is_active")
  
  createdBy       User                      @relation("ConversationCreator", fields: [createdById], references: [id])
  participants    ConversationParticipant[]
  messages        Message[]

  @@index([createdById])
  @@index([lastMessageAt])
  @@index([isActive])
  @@map("conversations")
}

enum ConversationType {
  DIRECT
  GROUP
}
```

#### 2. ConversationParticipant Model

```prisma
model ConversationParticipant {
  id                String       @id @default(cuid())
  conversationId    String       @map("conversation_id")
  userId            String       @map("user_id")
  joinedAt          DateTime     @default(now()) @map("joined_at")
  lastReadAt        DateTime?    @map("last_read_at")
  lastReadMessageId String?      @map("last_read_message_id")
  isActive          Boolean      @default(true) @map("is_active")
  isMuted           Boolean      @default(false) @map("is_muted")
  leftAt            DateTime?    @map("left_at")
  
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  lastReadMessage   Message?     @relation("LastReadMessage", fields: [lastReadMessageId], references: [id])

  @@unique([conversationId, userId])
  @@index([conversationId])
  @@index([userId])
  @@index([isActive])
  @@map("conversation_participants")
}
```

#### 3. Message Model

```prisma
model Message {
  id                String          @id @default(cuid())
  conversationId    String          @map("conversation_id")
  senderId          String          @map("sender_id")
  content           String          @db.Text
  type              MessageType     @default(TEXT)
  metadata          Json?           // For attachments, links, etc.
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")
  editedAt          DateTime?       @map("edited_at")
  deletedAt         DateTime?       @map("deleted_at")
  isSystemMessage   Boolean         @default(false) @map("is_system_message")
  
  conversation      Conversation    @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender            User            @relation("MessageSender", fields: [senderId], references: [id])
  statuses          MessageStatus[]
  lastReadBy        ConversationParticipant[] @relation("LastReadMessage")

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
  @@index([deletedAt])
  @@map("messages")
}

enum MessageType {
  TEXT
  SYSTEM
}
```

#### 4. MessageStatus Model

```prisma
model MessageStatus {
  id          String              @id @default(cuid())
  messageId   String              @map("message_id")
  userId      String              @map("user_id")
  status      MessageStatusType   @default(SENT)
  timestamp   DateTime            @default(now())
  
  message     Message             @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId])
  @@index([messageId])
  @@index([userId])
  @@index([status])
  @@map("message_statuses")
}

enum MessageStatusType {
  SENT
  DELIVERED
  READ
}
```

#### 5. MessagingSettings Model

```prisma
model MessagingSettings {
  id                      String   @id @default(cuid())
  enabled                 Boolean  @default(false)
  maxMessageLength        Int      @default(2000) @map("max_message_length")
  messageRetentionDays    Int      @default(90) @map("message_retention_days")
  maxGroupParticipants    Int      @default(50) @map("max_group_participants")
  allowFileAttachments    Boolean  @default(false) @map("allow_file_attachments")
  maxFileSize             Int      @default(5242880) @map("max_file_size") // 5MB in bytes
  allowedFileTypes        String[] @default(["image/jpeg", "image/png", "application/pdf"]) @map("allowed_file_types")
  typingIndicatorTimeout  Int      @default(3000) @map("typing_indicator_timeout") // milliseconds
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  @@map("messaging_settings")
}
```

#### 6. User Model Extensions

```prisma
// Add to existing User model
model User {
  // ... existing fields ...
  
  // Messaging relationships
  createdConversations    Conversation[]            @relation("ConversationCreator")
  conversationParticipants ConversationParticipant[]
  sentMessages            Message[]                 @relation("MessageSender")
  messageStatuses         MessageStatus[]
}
```

### Backend Services

#### 1. MessagingSettingsService

**Responsibilities:**
- Manage messaging system configuration
- Validate settings changes
- Provide settings to other services

**Key Methods:**
```typescript
class MessagingSettingsService {
  async getSettings(): Promise<MessagingSettings>
  async updateSettings(dto: UpdateMessagingSettingsDto): Promise<MessagingSettings>
  async isMessagingEnabled(): Promise<boolean>
  async getMaxMessageLength(): Promise<number>
  async getRetentionDays(): Promise<number>
}
```

#### 2. ConversationsService

**Responsibilities:**
- Create and manage conversations
- Handle participant management
- Provide conversation queries

**Key Methods:**
```typescript
class ConversationsService {
  async createDirectConversation(userId: string, recipientId: string): Promise<Conversation>
  async createGroupConversation(userId: string, dto: CreateGroupConversationDto): Promise<Conversation>
  async getConversations(userId: string, pagination: PaginationDto): Promise<PaginatedResponse<Conversation>>
  async getConversation(conversationId: string, userId: string): Promise<Conversation>
  async addParticipants(conversationId: string, userIds: string[]): Promise<void>
  async removeParticipant(conversationId: string, userId: string): Promise<void>
  async markAsRead(conversationId: string, userId: string, messageId: string): Promise<void>
  async getUnreadCount(userId: string): Promise<number>
  async searchConversations(userId: string, query: string): Promise<Conversation[]>
}
```

#### 3. MessagesService

**Responsibilities:**
- Send and retrieve messages
- Handle message status updates
- Implement message search

**Key Methods:**
```typescript
class MessagesService {
  async sendMessage(userId: string, dto: SendMessageDto): Promise<Message>
  async getMessages(conversationId: string, userId: string, pagination: PaginationDto): Promise<PaginatedResponse<Message>>
  async updateMessageStatus(messageId: string, userId: string, status: MessageStatusType): Promise<void>
  async deleteMessage(messageId: string, userId: string): Promise<void>
  async searchMessages(userId: string, query: string): Promise<Message[]>
  async getMessageStatuses(messageId: string): Promise<MessageStatus[]>
}
```

#### 4. MessagingWebSocketGateway

**Responsibilities:**
- Handle real-time message delivery
- Manage typing indicators
- Broadcast status updates

**Key Events:**
```typescript
class MessagingWebSocketGateway {
  // Client -> Server
  @SubscribeMessage('message:send')
  handleSendMessage(client: Socket, data: SendMessageDto)
  
  @SubscribeMessage('message:typing')
  handleTyping(client: Socket, data: { conversationId: string })
  
  @SubscribeMessage('message:read')
  handleMarkAsRead(client: Socket, data: { conversationId: string, messageId: string })
  
  // Server -> Client
  emitNewMessage(conversationId: string, message: Message)
  emitTypingIndicator(conversationId: string, userId: string, isTyping: boolean)
  emitMessageStatusUpdate(messageId: string, userId: string, status: MessageStatusType)
  emitConversationUpdate(conversationId: string, data: any)
}
```

### Frontend Components

#### 1. MessageIcon Component

**Location:** `frontend/src/components/layout/MessageIcon.tsx`

**Responsibilities:**
- Display message icon in page header
- Show unread count badge
- Toggle message panel

**Props:**
```typescript
interface MessageIconProps {
  className?: string;
}
```

#### 2. MessagePanel Component

**Location:** `frontend/src/components/messaging/MessagePanel.tsx`

**Responsibilities:**
- Sliding panel container
- Conversation list view
- Search functionality
- New conversation creation

**Props:**
```typescript
interface MessagePanelProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### 3. ConversationList Component

**Location:** `frontend/src/components/messaging/ConversationList.tsx`

**Responsibilities:**
- Display list of conversations
- Show unread indicators
- Handle conversation selection

**Props:**
```typescript
interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}
```

#### 4. ConversationView Component

**Location:** `frontend/src/components/messaging/ConversationView.tsx`

**Responsibilities:**
- Display messages in conversation
- Handle message sending
- Show typing indicators
- Display message statuses

**Props:**
```typescript
interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}
```

#### 5. MessageInput Component

**Location:** `frontend/src/components/messaging/MessageInput.tsx`

**Responsibilities:**
- Text input for composing messages
- Send button
- Typing indicator emission
- Character count display

**Props:**
```typescript
interface MessageInputProps {
  conversationId: string;
  onSend: (content: string) => void;
  maxLength: number;
}
```

#### 6. MessageBubble Component

**Location:** `frontend/src/components/messaging/MessageBubble.tsx`

**Responsibilities:**
- Display individual message
- Show sender info
- Display timestamp
- Show message status

**Props:**
```typescript
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSender: boolean;
}
```

#### 7. NewConversationDialog Component

**Location:** `frontend/src/components/messaging/NewConversationDialog.tsx`

**Responsibilities:**
- User search interface
- Recipient selection
- Group name input (for groups)
- Conversation creation

**Props:**
```typescript
interface NewConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (recipientIds: string[], groupName?: string) => void;
}
```

#### 8. MessagingSettingsPage Component

**Location:** `frontend/src/app/dashboard/settings/messaging/page.tsx`

**Responsibilities:**
- Display messaging settings form
- Handle settings updates
- Show current configuration

### Frontend State Management

#### MessagingContext

**Location:** `frontend/src/contexts/MessagingContext.tsx`

**Responsibilities:**
- Manage WebSocket connection for messaging
- Handle real-time events
- Provide messaging state to components
- Manage unread counts

**Context Value:**
```typescript
interface MessagingContextValue {
  isConnected: boolean;
  conversations: Conversation[];
  unreadCount: number;
  selectedConversationId: string | null;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (recipientIds: string[], groupName?: string) => Promise<Conversation>;
  markAsRead: (conversationId: string, messageId: string) => void;
  selectConversation: (id: string) => void;
  searchConversations: (query: string) => Promise<Conversation[]>;
}
```

## Data Models

### DTOs (Data Transfer Objects)

#### Backend DTOs

```typescript
// Create Group Conversation DTO
export class CreateGroupConversationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(49) // Creator + 49 others = 50 max
  @IsString({ each: true })
  participantIds: string[];
}

// Send Message DTO
export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000) // Will be validated against settings
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// Update Messaging Settings DTO
export class UpdateMessagingSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(5000)
  maxMessageLength?: number;

  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  messageRetentionDays?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(100)
  maxGroupParticipants?: number;

  @IsOptional()
  @IsBoolean()
  allowFileAttachments?: boolean;
}

// Pagination DTO
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

#### Frontend Types

```typescript
// Conversation Type
export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Message Type
export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  type: 'TEXT' | 'SYSTEM';
  status?: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

// Conversation Participant Type
export interface ConversationParticipant {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  joinedAt: string;
  lastReadAt?: string;
  isActive: boolean;
}

// Messaging Settings Type
export interface MessagingSettings {
  id: string;
  enabled: boolean;
  maxMessageLength: number;
  messageRetentionDays: number;
  maxGroupParticipants: number;
  allowFileAttachments: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  typingIndicatorTimeout: number;
}
```

## Error Handling

### Backend Error Responses

```typescript
// Standard error response format
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

// Common error scenarios
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: Messaging disabled or insufficient permissions
- 404 Not Found: Conversation or message not found
- 409 Conflict: Conversation already exists
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Unexpected server error
```

### Frontend Error Handling

```typescript
// Error handling strategy
1. Display user-friendly error messages using toast notifications
2. Log errors to console in development mode
3. Retry failed WebSocket connections automatically
4. Provide fallback UI for failed data fetches
5. Validate input before sending to backend
```

## Testing Strategy

### Backend Testing

#### Unit Tests

**Coverage Target:** 80% minimum

**Test Files:**
- `messaging-settings.service.spec.ts`
- `conversations.service.spec.ts`
- `messages.service.spec.ts`
- `messaging-websocket.gateway.spec.ts`

**Test Scenarios:**
```typescript
// MessagingSettingsService
- Should get messaging settings
- Should update messaging settings
- Should validate settings constraints
- Should throw error for invalid settings

// ConversationsService
- Should create direct conversation
- Should create group conversation
- Should get user conversations with pagination
- Should add participants to group
- Should remove participant from group
- Should mark conversation as read
- Should calculate unread count
- Should prevent duplicate direct conversations

// MessagesService
- Should send message to conversation
- Should get messages with pagination
- Should update message status
- Should delete message (soft delete)
- Should search messages by content
- Should enforce max message length

// MessagingWebSocketGateway
- Should handle message:send event
- Should broadcast new message to participants
- Should handle typing indicator
- Should update message status in real-time
- Should handle disconnection gracefully
```

#### Integration Tests

**Test File:** `messaging.e2e-spec.ts`

**Test Scenarios:**
```typescript
// API Endpoints
- POST /conversations - Create conversation
- GET /conversations - List conversations
- GET /conversations/:id - Get conversation details
- POST /conversations/:id/participants - Add participants
- DELETE /conversations/:id/participants/:userId - Remove participant
- POST /messages - Send message
- GET /messages?conversationId=:id - Get messages
- PATCH /messages/:id/status - Update message status
- DELETE /messages/:id - Delete message
- GET /messaging-settings - Get settings
- PATCH /messaging-settings - Update settings

// WebSocket Events
- Connect and authenticate
- Send message via WebSocket
- Receive message in real-time
- Typing indicator broadcast
- Message status updates
```

### Frontend Testing

#### Component Tests

**Test Files:**
- `MessageIcon.test.tsx`
- `MessagePanel.test.tsx`
- `ConversationList.test.tsx`
- `ConversationView.test.tsx`
- `MessageInput.test.tsx`
- `MessageBubble.test.tsx`

**Test Scenarios:**
```typescript
// MessageIcon
- Should display unread count badge
- Should toggle message panel on click
- Should hide when messaging is disabled

// MessagePanel
- Should open and close smoothly
- Should display conversation list
- Should handle search input
- Should create new conversation

// ConversationView
- Should display messages in chronological order
- Should send message on submit
- Should show typing indicator
- Should mark messages as read when visible
- Should display message statuses

// MessageInput
- Should emit typing indicator
- Should validate message length
- Should clear input after send
- Should disable send button when empty
```

#### Integration Tests

**Test File:** `messaging-flow.test.tsx`

**Test Scenarios:**
```typescript
// End-to-End Flows
- User opens message panel and creates new conversation
- User sends message and receives response
- User searches for conversation
- User marks conversation as read
- Admin enables/disables messaging system
- Admin updates messaging settings
```

## Performance Considerations

### Database Optimization

1. **Indexes:**
   - Conversation: `createdById`, `lastMessageAt`, `isActive`
   - ConversationParticipant: `conversationId`, `userId`, `isActive`
   - Message: `conversationId`, `senderId`, `createdAt`, `deletedAt`
   - MessageStatus: `messageId`, `userId`, `status`

2. **Query Optimization:**
   - Use pagination for all list queries
   - Implement cursor-based pagination for messages
   - Use `select` to fetch only required fields
   - Implement database-level full-text search for message content

3. **Caching Strategy:**
   - Cache conversation list for 5 minutes
   - Cache messaging settings for 10 minutes
   - Invalidate cache on updates
   - Use Redis for distributed caching (future enhancement)

### WebSocket Optimization

1. **Connection Management:**
   - Reuse existing WebSocket connection
   - Implement connection pooling
   - Handle reconnection with exponential backoff

2. **Message Broadcasting:**
   - Send messages only to active participants
   - Use rooms for conversation-specific broadcasts
   - Implement message batching for high-frequency updates

3. **Typing Indicators:**
   - Debounce typing events (300ms)
   - Auto-clear typing indicators after 5 seconds
   - Limit typing indicator broadcasts to conversation participants

### Frontend Optimization

1. **Component Optimization:**
   - Use React.memo for message bubbles
   - Implement virtual scrolling for long message lists
   - Lazy load conversation details
   - Debounce search input (300ms)

2. **State Management:**
   - Use SWR for data fetching with automatic revalidation
   - Implement optimistic updates for message sending
   - Cache conversation data in memory

3. **Bundle Optimization:**
   - Code-split messaging components
   - Lazy load message panel
   - Optimize images and assets

## Security Considerations

### Authentication & Authorization

1. **WebSocket Authentication:**
   - Require JWT token for WebSocket connection
   - Validate token on every connection
   - Implement token refresh mechanism

2. **API Authorization:**
   - Check `messaging:access` permission on all endpoints
   - Verify conversation participation before allowing access
   - Validate user ownership for message operations

3. **Permission Checks:**
   ```typescript
   // Required permissions
   - messaging:access - Basic messaging access
   - messaging:settings:read - View messaging settings
   - messaging:settings:write - Update messaging settings
   - messaging:admin - Full messaging administration
   ```

### Input Validation & Sanitization

1. **Message Content:**
   - Sanitize HTML to prevent XSS attacks
   - Validate message length against settings
   - Strip dangerous characters and scripts
   - Implement rate limiting (10 messages per minute per user)

2. **User Input:**
   - Validate all DTOs using class-validator
   - Sanitize search queries
   - Validate file uploads (if enabled)

### Data Privacy

1. **Message Retention:**
   - Implement automatic deletion based on retention policy
   - Soft delete messages (mark as deleted, don't remove immediately)
   - Provide user data export functionality

2. **Audit Logging:**
   - Log all message access attempts
   - Log conversation creation and participant changes
   - Log settings modifications

## Deployment Considerations

### Database Migration

1. **Migration Steps:**
   ```bash
   # Generate migration
   npx prisma migrate dev --name add_messaging_system
   
   # Apply migration to production
   npx prisma migrate deploy
   ```

2. **Seed Data:**
   - Create default messaging settings
   - Create `messaging:access` permission
   - Assign permission to existing roles

### Environment Variables

```env
# Backend (.env)
MESSAGING_ENABLED=false
MESSAGING_MAX_MESSAGE_LENGTH=2000
MESSAGING_RETENTION_DAYS=90
MESSAGING_MAX_GROUP_PARTICIPANTS=50

# Frontend (.env.local)
NEXT_PUBLIC_MESSAGING_ENABLED=false
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
```

### Feature Flag

Implement feature flag for gradual rollout:
```typescript
// Check feature flag before displaying messaging UI
const isMessagingEnabled = await featureFlagService.isEnabled('messaging');
```

## Integration Points

### Notification System Integration

1. **Message Notifications:**
   - Create notification when message is received
   - Use category `SOCIAL` for message notifications
   - Include sender name and message preview
   - Link notification to conversation

2. **Notification Preferences:**
   - Respect user's `SOCIAL` category preferences
   - Honor Do Not Disturb settings
   - Allow muting specific conversations

### Permission System Integration

1. **Permission Checks:**
   - Use existing `PermissionsGuard` for API endpoints
   - Check `messaging:access` permission
   - Implement role-based access control

2. **Permission Management:**
   - Add messaging permissions to permission seeder
   - Allow Super Admin to manage messaging permissions
   - Automatically grant permissions on feature enablement

### WebSocket Gateway Integration

1. **Extend Existing Gateway:**
   - Add messaging namespace to existing WebSocket gateway
   - Reuse authentication mechanism
   - Share connection management logic

2. **Event Handling:**
   - Implement messaging-specific events
   - Use existing room-based broadcasting
   - Leverage existing error handling

## Future Enhancements

1. **File Attachments:**
   - Image uploads and previews
   - Document sharing
   - File size and type validation

2. **Rich Text Formatting:**
   - Markdown support
   - Emoji picker
   - Link previews

3. **Advanced Features:**
   - Message reactions
   - Message threading
   - Voice messages
   - Video calls

4. **Analytics:**
   - Message volume metrics
   - User engagement tracking
   - Conversation analytics

5. **Mobile App:**
   - React Native mobile app
   - Push notifications
   - Offline message queue
