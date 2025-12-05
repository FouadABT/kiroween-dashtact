/**
 * Messaging API Client
 * 
 * API methods for the messaging system.
 */

import { ApiClient } from '../api';
import type {
  ConversationsResponse,
  CreateConversationData,
  Conversation,
  MessagesResponse,
  SendMessageData,
  Message,
  MessagingSettings,
  UpdateMessagingSettingsDto,
} from '@/types/messaging';

/**
 * Messaging API Class
 */
export class MessagingApi {
  /**
   * Get all conversations for current user
   */
  static async getConversations(): Promise<ConversationsResponse> {
    return ApiClient.get<ConversationsResponse>('/messaging/conversations');
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(id: string): Promise<Conversation> {
    const response = await ApiClient.get<{ data: Conversation }>(`/messaging/conversations/${id}`);
    return response.data;
  }

  /**
   * Create new conversation (direct or group)
   */
  static async createConversation(data: CreateConversationData): Promise<Conversation> {
    const response = await ApiClient.post<{ data: Conversation; message?: string }>('/messaging/conversations', data);
    return response.data;
  }

  /**
   * Add participants to group conversation
   */
  static async addParticipants(conversationId: string, userIds: string[]): Promise<void> {
    return ApiClient.post<void>(`/messaging/conversations/${conversationId}/participants`, { userIds });
  }

  /**
   * Remove participant from group conversation
   */
  static async removeParticipant(conversationId: string, userId: string): Promise<void> {
    return ApiClient.delete<void>(`/messaging/conversations/${conversationId}/participants/${userId}`);
  }

  /**
   * Search conversations
   */
  static async searchConversations(query: string): Promise<Conversation[]> {
    return ApiClient.get<Conversation[]>('/messaging/conversations/search', { query });
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    return ApiClient.get<MessagesResponse>('/messaging/messages', { conversationId, page, limit });
  }

  /**
   * Get message by ID
   */
  static async getMessage(id: string): Promise<Message> {
    const response = await ApiClient.get<{ data: Message }>(`/messaging/messages/${id}`);
    return response.data;
  }

  /**
   * Send message
   */
  static async sendMessage(data: SendMessageData): Promise<Message> {
    const response = await ApiClient.post<{ data: Message; message?: string }>('/messaging/messages', data);
    return response.data;
  }

  /**
   * Delete message
   */
  static async deleteMessage(messageId: string): Promise<void> {
    return ApiClient.delete<void>(`/messaging/messages/${messageId}`);
  }

  /**
   * Mark conversation as read (marks ALL unread messages in conversation)
   */
  static async markAsRead(conversationId: string): Promise<void> {
    return ApiClient.post<void>(`/messaging/conversations/${conversationId}/read`);
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(): Promise<number> {
    const response = await ApiClient.get<{ count: number }>('/messaging/unread-count');
    return response.count;
  }

  /**
   * Get messaging settings (admin only)
   */
  static async getSettings(): Promise<MessagingSettings> {
    return ApiClient.get<MessagingSettings>('/messaging-settings');
  }

  /**
   * Update messaging settings (admin only)
   */
  static async updateSettings(data: UpdateMessagingSettingsDto): Promise<MessagingSettings> {
    return ApiClient.patch<MessagingSettings>('/messaging-settings', data);
  }

  /**
   * Check if messaging is enabled
   */
  static async isEnabled(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.enabled;
    } catch {
      return false;
    }
  }
}
