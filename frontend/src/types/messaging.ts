/**
 * Messaging System Types
 * 
 * TypeScript interfaces for the messaging system.
 * These types match the backend Prisma schema models.
 */

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  lastMessage?: Message;
  isActive: boolean;
  unreadCount: number;
  createdBy?: User;
  participants?: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string | null;
  lastReadMessageId: string | null;
  isActive: boolean;
  isMuted: boolean;
  leftAt: string | null;
  conversation?: Conversation;
  user?: User;
  lastReadMessage?: Message;
}

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
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  deletedAt?: string;
}

export interface MessageStatus {
  id: string;
  messageId: string;
  userId: string;
  status: MessageStatusType;
  timestamp: string;
  message?: Message;
  user?: User;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

// Enums

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
}

export enum MessageStatusType {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

// DTOs for API requests

export interface CreateConversationData {
  type: 'DIRECT' | 'GROUP';
  participantIds: string[];
  name?: string; // Required for group conversations
}

export interface SendMessageData {
  conversationId: string;
  content: string;
}

export interface UpdateMessagingSettingsDto {
  enabled?: boolean;
  maxMessageLength?: number;
  messageRetentionDays?: number;
  maxGroupParticipants?: number;
  allowFileAttachments?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  typingIndicatorTimeout?: number;
}

export interface ConversationListQuery {
  page?: number;
  limit?: number;
  type?: ConversationType;
  isActive?: boolean;
}

export interface MessageListQuery {
  conversationId: string;
  page?: number;
  limit?: number;
  before?: string; // Message ID for pagination
  after?: string; // Message ID for pagination
}

// API Response types

export interface ConversationsResponse {
  conversations: Conversation[];
  unreadCount: number;
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

// WebSocket event types

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageEvent {
  type: 'new_message' | 'message_updated' | 'message_deleted';
  message: Message;
}

export interface ConversationEvent {
  type: 'conversation_updated' | 'participant_joined' | 'participant_left';
  conversation: Conversation;
}

export interface MessageStatusEvent {
  messageId: string;
  userId: string;
  status: MessageStatusType;
}
