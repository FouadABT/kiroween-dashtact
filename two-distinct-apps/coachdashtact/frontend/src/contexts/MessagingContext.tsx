'use client';

/**
 * Messaging Context and Provider
 * Manages messaging state, WebSocket connection, and messaging methods
 */

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useRef,
  ReactNode 
} from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Conversation,
  Message,
  MessageStatusType,
  CreateConversationData,
  SendMessageData
} from '@/types/messaging';
import { MessagingApi } from '@/lib/api/messaging';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  shouldShowToast,
  isInDNDMode
} from '@/lib/toast-helpers';
import { NotificationCategory, NotificationPriority } from '@/types/notification';
import type { ExternalToast } from 'sonner';

/**
 * Messaging Context Value Interface
 */
interface MessagingContextValue {
  // State
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  unreadCount: number;
  selectedConversationId: string | null;
  isLoading: boolean;
  isConnected: boolean;
  typingUsers: Record<string, string[]>; // conversationId -> userIds
  isPanelOpen: boolean;
  
  // Conversation methods
  fetchConversations: () => Promise<void>;
  createConversation: (data: CreateConversationData) => Promise<Conversation>;
  selectConversation: (id: string | null) => void;
  searchConversations: (query: string) => Promise<Conversation[]>;
  
  // Message methods
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  retryMessage: (conversationId: string, messageId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  
  // Panel methods
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  
  // WebSocket methods
  subscribe: () => void;
  unsubscribe: () => void;
  emitTyping: (conversationId: string) => void;
}

/**
 * Messaging Context
 */
const MessagingContext = createContext<MessagingContextValue | undefined>(undefined);

/**
 * Messaging Provider Props
 */
interface MessagingProviderProps {
  children: ReactNode;
}

/**
 * Messaging Provider Component
 * Provides messaging context to the entire application
 */
export function MessagingProvider({ children }: MessagingProviderProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { preferences } = useNotifications();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // WebSocket ref
  const socketRef = useRef<Socket | null>(null);
  const isSubscribedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  /**
   * Fetch conversations from backend
   */
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await MessagingApi.getConversations();
      setConversations(response.conversations);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      showErrorToast('Failed to load conversations', 'Please try again later');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Create new conversation
   */
  const createConversation = useCallback(async (data: CreateConversationData): Promise<Conversation> => {
    try {
      const conversation = await MessagingApi.createConversation(data);
      setConversations(prev => [conversation, ...prev]);
      showSuccessToast('Conversation created');
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      showErrorToast('Failed to create conversation', 'Please try again');
      throw error;
    }
  }, []);

  /**
   * Select conversation
   */
  const selectConversation = useCallback((id: string | null) => {
    setSelectedConversationId(id);
  }, []);

  /**
   * Search conversations
   */
  const searchConversations = useCallback(async (query: string): Promise<Conversation[]> => {
    try {
      return await MessagingApi.searchConversations(query);
    } catch (error) {
      console.error('Failed to search conversations:', error);
      showErrorToast('Search failed', 'Please try again');
      return [];
    }
  }, []);

  /**
   * Fetch messages for a conversation
   */
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await MessagingApi.getMessages(conversationId, 1, 50);
      setMessages(prev => ({
        ...prev,
        [conversationId]: response.messages
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      showErrorToast('Failed to load messages', 'Please try again');
    }
  }, [isAuthenticated]);

  /**
   * Send message with optimistic update
   */
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user) return;
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      sender: {
        id: user.id,
        name: user.name || 'User',
        avatarUrl: user.avatarUrl || undefined
      },
      content,
      type: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { pending: true } // Mark as pending
    };
    
    // Optimistic update
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), optimisticMessage]
    }));
    
    // Update conversation's last message optimistically and move to top
    setConversations(prev => {
      const updated = prev.map(c => 
        c.id === conversationId 
          ? { ...c, lastMessage: optimisticMessage, lastMessageAt: optimisticMessage.createdAt }
          : c
      );
      
      // Sort by lastMessageAt to move updated conversation to top
      return updated.sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA;
      });
    });
    
    try {
      const message = await MessagingApi.sendMessage({ conversationId, content });
      
      // Replace optimistic message with real one
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(m => 
          m.id === optimisticMessage.id ? message : m
        )
      }));
      
      // Update conversation's last message with real message and resort
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === conversationId 
            ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
            : c
        );
        
        // Sort by lastMessageAt
        return updated.sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        });
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark message as failed instead of removing it
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(m => 
          m.id === optimisticMessage.id 
            ? { ...m, metadata: { ...m.metadata, failed: true, error: 'Failed to send' } }
            : m
        )
      }));
      
      showErrorToast('Failed to send message', 'Click retry to try again');
    }
  }, [user]);

  /**
   * Retry sending a failed message
   */
  const retryMessage = useCallback(async (conversationId: string, messageId: string) => {
    const message = messages[conversationId]?.find(m => m.id === messageId);
    if (!message || !message.metadata?.failed) return;
    
    // Mark as pending again
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId].map(m => 
        m.id === messageId 
          ? { ...m, metadata: { ...m.metadata, failed: false, pending: true } }
          : m
      )
    }));
    
    try {
      const newMessage = await MessagingApi.sendMessage({ 
        conversationId, 
        content: message.content 
      });
      
      // Replace failed message with new one
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(m => 
          m.id === messageId ? newMessage : m
        )
      }));
      
      // Update conversation's last message and resort
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === conversationId 
            ? { ...c, lastMessage: newMessage, lastMessageAt: newMessage.createdAt }
            : c
        );
        
        // Sort by lastMessageAt
        return updated.sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        });
      });
      
      showSuccessToast('Message sent');
    } catch (error) {
      console.error('Failed to retry message:', error);
      
      // Mark as failed again
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(m => 
          m.id === messageId 
            ? { ...m, metadata: { ...m.metadata, failed: true, pending: false } }
            : m
        )
      }));
      
      showErrorToast('Failed to send message', 'Please try again');
    }
  }, [messages]);

  /**
   * Mark conversation as read (marks ALL unread messages)
   */
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await MessagingApi.markAsRead(conversationId);
      
      // Get the conversation's unread count before updating
      const conversation = conversations.find(c => c.id === conversationId);
      const conversationUnreadCount = conversation?.unreadCount || 0;
      
      // Update local state - set unread count to 0
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
      
      // Update messages status to READ
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(m => ({
          ...m,
          status: m.sender?.id === user?.id ? m.status : 'READ'
        }))
      }));
      
      // Recalculate total unread count
      setUnreadCount(prev => Math.max(0, prev - conversationUnreadCount));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [conversations, user]);

  /**
   * Emit typing indicator
   */
  const emitTyping = useCallback((conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message:typing', { conversationId, isTyping: true });
    }
  }, [isConnected]);

  /**
   * Open message panel
   */
  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  /**
   * Close message panel
   */
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  /**
   * Toggle message panel
   */
  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  /**
   * Initialize WebSocket connection
   */
  const subscribe = useCallback(() => {
    if (!isAuthenticated || !user || isSubscribedRef.current) {
      console.log('[MessagingContext] Skipping WebSocket connection:', {
        isAuthenticated,
        hasUser: !!user,
        isSubscribed: isSubscribedRef.current,
      });
      return;
    }
    
    console.log('[MessagingContext] Initializing WebSocket connection...');
    
    const token = localStorage.getItem('accessToken');
    console.log('[MessagingContext] Token found:', !!token);
    
    if (!token) {
      console.error('[MessagingContext] No access token found in localStorage');
      return;
    }
    
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/messaging`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      randomizationFactor: 0.5, // Add jitter to prevent thundering herd
    });
    
    socket.on('connect', () => {
      console.log('[MessagingContext] WebSocket connected, sending authentication...');
      socket.emit('authenticate', { token });
    });
    
    socket.on('authenticated', (data) => {
      console.log('[MessagingContext] Authentication successful:', data);
      setIsConnected(true);
    });
    
    socket.on('error', (error) => {
      console.error('[MessagingContext] WebSocket error:', error);
      setIsConnected(false);
    });
    
    socket.on('disconnect', () => {
      console.log('[MessagingContext] WebSocket disconnected');
      setIsConnected(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('[MessagingContext] WebSocket connection error:', error);
      setIsConnected(false);
    });
    
    // Listen for new messages
    socket.on('message:new', (data: { message: Message }) => {
      console.log('[MessagingContext] New message received:', data.message);
      
      const message = data.message;
      
      // Don't process messages from self
      if (message.sender.id === user?.id) {
        return;
      }
      
      // Add to messages list
      setMessages(prev => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] || []), message]
      }));
      
      // Update conversation and move to top
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === message.conversationId
            ? { 
                ...c, 
                lastMessage: message, 
                lastMessageAt: message.createdAt,
                unreadCount: c.id === selectedConversationId ? 0 : (c.unreadCount || 0) + 1
              }
            : c
        );
        
        // Sort by lastMessageAt to move updated conversation to top
        return updated.sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        });
      });
      
      // Update unread count if not viewing this conversation
      if (message.conversationId !== selectedConversationId) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Show toast notification if panel is closed or conversation is not selected
      if (!isPanelOpen || message.conversationId !== selectedConversationId) {
        // Check if we should show toast based on SOCIAL category preferences
        const shouldShow = shouldShowToast(NotificationCategory.SOCIAL, preferences);
        const inDND = isInDNDMode(preferences);
        
        // Don't show toast if SOCIAL category is disabled or in DND mode
        if (!shouldShow || inDND) {
          console.log('[MessagingContext] Toast suppressed by user preferences');
          return;
        }
        
        // Find conversation to get name
        const conversation = conversations.find(c => c.id === message.conversationId);
        const senderName = message.sender?.name || 'Someone';
        const conversationName = conversation?.name || senderName;
        
        // Truncate message content for toast
        const truncatedContent = message.content.length > 60 
          ? `${message.content.substring(0, 60)}...` 
          : message.content;
        
        // Show compact toast with better UX
        showInfoToast(
          conversationName,
          truncatedContent,
          {
            duration: 3000, // Short duration - 3 seconds
            position: 'bottom-right',
            action: {
              label: 'View',
              onClick: () => {
                setIsPanelOpen(true);
                setSelectedConversationId(message.conversationId);
              },
            },
          }
        );
      }
    });
    
    // Listen for typing indicators
    socket.on('message:typing:start', (data: { conversationId: string; userId: string; userName?: string }) => {
      console.log('[MessagingContext] User started typing:', data);
      
      setTypingUsers(prev => ({
        ...prev,
        [data.conversationId]: [...(prev[data.conversationId] || []), data.userId]
      }));
      
      // Clear existing timeout
      if (typingTimeoutRef.current[`${data.conversationId}-${data.userId}`]) {
        clearTimeout(typingTimeoutRef.current[`${data.conversationId}-${data.userId}`]);
      }
      
      // Auto-clear after 5 seconds
      typingTimeoutRef.current[`${data.conversationId}-${data.userId}`] = setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [data.conversationId]: (prev[data.conversationId] || []).filter(id => id !== data.userId)
        }));
      }, 5000);
    });
    
    socket.on('message:typing:stop', (data: { conversationId: string; userId: string }) => {
      console.log('[MessagingContext] User stopped typing:', data);
      
      // Clear timeout
      if (typingTimeoutRef.current[`${data.conversationId}-${data.userId}`]) {
        clearTimeout(typingTimeoutRef.current[`${data.conversationId}-${data.userId}`]);
        delete typingTimeoutRef.current[`${data.conversationId}-${data.userId}`];
      }
      
      setTypingUsers(prev => ({
        ...prev,
        [data.conversationId]: (prev[data.conversationId] || []).filter(id => id !== data.userId)
      }));
    });
    
    // Listen for message status updates
    socket.on('message:status', (data: { messageId: string; userId: string; status: MessageStatusType }) => {
      console.log('[MessagingContext] Message status updated:', data);
      
      // Update message status in all conversations
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(conversationId => {
          updated[conversationId] = updated[conversationId].map(m =>
            m.id === data.messageId ? { ...m, status: data.status } : m
          );
        });
        return updated;
      });
    });
    
    socketRef.current = socket;
    isSubscribedRef.current = true;
  }, [isAuthenticated, user, selectedConversationId, isPanelOpen, preferences, conversations]);

  /**
   * Close WebSocket connection
   */
  const unsubscribe = useCallback(() => {
    if (socketRef.current) {
      console.log('[MessagingContext] Closing WebSocket connection...');
      socketRef.current.close();
      socketRef.current = null;
      isSubscribedRef.current = false;
      setIsConnected(false);
    }
    
    // Clear all typing timeouts
    Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    typingTimeoutRef.current = {};
  }, []);

  /**
   * Initialize messaging on mount
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated && user && !hasInitializedRef.current) {
      console.log('[MessagingContext] User authenticated, initializing...');
      hasInitializedRef.current = true;
      fetchConversations();
      subscribe();
    } else if (!isAuthenticated && hasInitializedRef.current) {
      console.log('[MessagingContext] User logged out, cleaning up...');
      hasInitializedRef.current = false;
      unsubscribe();
      setConversations([]);
      setMessages({});
      setUnreadCount(0);
      setSelectedConversationId(null);
      setTypingUsers({});
    }
  }, [authLoading, fetchConversations, isAuthenticated, subscribe, unsubscribe, user]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  /**
   * Fetch messages when conversation is selected
   */
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  const value: MessagingContextValue = {
    conversations,
    messages,
    unreadCount,
    selectedConversationId,
    isLoading,
    isConnected,
    typingUsers,
    isPanelOpen,
    fetchConversations,
    createConversation,
    selectConversation,
    searchConversations,
    fetchMessages,
    sendMessage,
    retryMessage,
    markAsRead,
    openPanel,
    closePanel,
    togglePanel,
    subscribe,
    unsubscribe,
    emitTyping,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

/**
 * useMessaging Hook
 * Custom hook to access messaging context
 */
export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
