'use client';

/**
 * Notification Context and Provider
 * Manages notification state, WebSocket connection, and notification methods
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
  Notification, 
  NotificationPreference, 
  NotificationQueryParams,
  NotificationCategory,
  UpdateNotificationPreferenceData,
  DNDSettingsData,
  NotificationPriority
} from '@/types/notification';
import { NotificationApi, NotificationPreferenceApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  showNotificationToast,
  showSuccessToast,
  showErrorToast,
  shouldShowToast,
  isInDNDMode
} from '@/lib/toast-helpers';
import { playNotificationSound } from '@/lib/notification-sound';
import type { ExternalToast } from 'sonner';

/**
 * Notification Context Value Interface
 */
interface NotificationContextValue {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  preferences: NotificationPreference[];
  
  // Notification methods
  fetchNotifications: (filters?: NotificationQueryParams) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Preference methods
  fetchPreferences: () => Promise<void>;
  updatePreference: (category: NotificationCategory, data: UpdateNotificationPreferenceData) => Promise<void>;
  setDND: (data: DNDSettingsData) => Promise<void>;
  
  // WebSocket methods
  subscribe: () => void;
  unsubscribe: () => void;
}

/**
 * Notification Context
 */
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

/**
 * Notification Provider Props
 */
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Notification Provider Component
 * Provides notification context to the entire application
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  
  // WebSocket ref
  const socketRef = useRef<Socket | null>(null);
  const isSubscribedRef = useRef(false);
  const hasInitializedRef = useRef(false);

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(async (filters?: NotificationQueryParams) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await NotificationApi.getAll(filters);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      showErrorToast('Failed to load notifications', 'Please try again later');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Mark notification as read with optimistic update
   */
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await NotificationApi.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update
      await fetchNotifications();
      showErrorToast('Failed to mark notification as read', 'Please try again');
    }
  }, [fetchNotifications]);

  /**
   * Mark all notifications as read with optimistic update
   */
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    const now = new Date().toISOString();
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: n.readAt || now }))
    );
    setUnreadCount(0);
    
    try {
      await NotificationApi.markAllAsRead();
      showSuccessToast('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert optimistic update
      await fetchNotifications();
      showErrorToast('Failed to mark all notifications as read', 'Please try again');
    }
  }, [fetchNotifications]);

  /**
   * Delete notification with optimistic update
   */
  const deleteNotification = useCallback(async (id: string) => {
    // Find notification to check if it's unread
    const notification = notifications.find(n => n.id === id);
    const wasUnread = notification && !notification.isRead;
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    try {
      await NotificationApi.delete(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Revert optimistic update
      await fetchNotifications();
      showErrorToast('Failed to delete notification', 'Please try again');
    }
  }, [notifications, fetchNotifications]);

  /**
   * Clear all notifications with optimistic update
   */
  const clearAll = useCallback(async () => {
    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);
    
    try {
      await NotificationApi.clearAll();
      showSuccessToast('All notifications cleared');
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      // Revert optimistic update
      await fetchNotifications();
      showErrorToast('Failed to clear notifications', 'Please try again');
    }
  }, [fetchNotifications]);

  /**
   * Fetch notification preferences
   */
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const prefs = await NotificationPreferenceApi.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    }
  }, [isAuthenticated]);

  /**
   * Update notification preference with optimistic update
   */
  const updatePreference = useCallback(async (
    category: NotificationCategory,
    data: UpdateNotificationPreferenceData
  ) => {
    // Optimistic update
    setPreferences(prev =>
      prev.map(p => p.category === category ? { ...p, ...data } : p)
    );
    
    try {
      const updated = await NotificationPreferenceApi.updatePreference(category, data);
      // Update with server response
      setPreferences(prev =>
        prev.map(p => p.category === category ? updated : p)
      );
      showSuccessToast('Preference updated');
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      // Revert optimistic update
      await fetchPreferences();
      showErrorToast('Failed to update preference', 'Please try again');
    }
  }, [fetchPreferences]);

  /**
   * Set Do Not Disturb settings
   */
  const setDND = useCallback(async (data: DNDSettingsData) => {
    try {
      const updated = await NotificationPreferenceApi.setDND(data);
      setPreferences(updated);
      showSuccessToast('Do Not Disturb settings updated');
    } catch (error) {
      console.error('Failed to set DND settings:', error);
      showErrorToast('Failed to update Do Not Disturb settings', 'Please try again');
    }
  }, []);

  /**
   * Initialize WebSocket connection
   */
  const subscribe = useCallback(() => {
    if (!isAuthenticated || !user || isSubscribedRef.current) {
      console.log('[NotificationContext] Skipping WebSocket connection:', {
        isAuthenticated,
        hasUser: !!user,
        isSubscribed: isSubscribedRef.current,
      });
      return;
    }
    
    console.log('[NotificationContext] Initializing WebSocket connection...');
    
    // Get token from localStorage (key is 'accessToken' not 'access_token')
    const token = localStorage.getItem('accessToken');
    console.log('[NotificationContext] Token found:', !!token);
    
    if (!token) {
      console.error('[NotificationContext] No access token found in localStorage');
      console.log('[NotificationContext] Available keys:', Object.keys(localStorage));
      return;
    }
    
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    
    socket.on('connect', () => {
      console.log('[NotificationContext] WebSocket connected, sending authentication...');
      // Send authentication message with token
      socket.emit('authenticate', { token });
    });
    
    socket.on('authenticated', (data) => {
      console.log('[NotificationContext] Authentication successful:', data);
      setIsConnected(true);
    });
    
    socket.on('error', (error) => {
      console.error('[NotificationContext] WebSocket error:', error);
      setIsConnected(false);
    });
    
    socket.on('disconnect', () => {
      console.log('[NotificationContext] WebSocket disconnected');
      setIsConnected(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('[NotificationContext] WebSocket connection error:', error);
      setIsConnected(false);
    });
    
    // Listen for new notifications
    socket.on('notification:created', (data: { notification: Notification; createdAt: string }) => {
      console.log('[NotificationContext] New notification received:', data.notification);
      
      const notification = data.notification;
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Check if we should show toast based on preferences
      const shouldShow = shouldShowToast(notification.category, preferences);
      const inDND = isInDNDMode(preferences);
      
      // Don't show toast if category is disabled or in DND mode (unless urgent)
      if (!shouldShow || (inDND && notification.priority !== NotificationPriority.URGENT)) {
        console.log('[NotificationContext] Toast suppressed by user preferences');
        return;
      }
      
      // Play notification sound
      playNotificationSound();
      
      // Show toast notification with action buttons
      const toastActions: ExternalToast = {
        action: {
          label: 'View',
          onClick: () => {
            // Mark as read when viewed
            markAsRead(notification.id);
          },
        },
      };
      
      // Add custom action button if notification has actions
      if (notification.actions && notification.actions.length > 0) {
        const primaryAction = notification.actions[0];
        toastActions.action = {
          label: primaryAction.label,
          onClick: async () => {
            // Execute the action
            if (primaryAction.actionUrl) {
              if (primaryAction.actionType === 'LINK') {
                window.open(primaryAction.actionUrl, '_blank');
              } else if (primaryAction.actionType === 'API_CALL') {
                try {
                  await fetch(primaryAction.actionUrl, {
                    method: primaryAction.actionMethod || 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    body: primaryAction.actionPayload ? JSON.stringify(primaryAction.actionPayload) : undefined,
                  });
                  showSuccessToast('Action completed');
                } catch {
                  showErrorToast('Action failed', 'Please try again');
                }
              }
            }
            // Mark as read after action
            markAsRead(notification.id);
          },
        };
      }
      
      // Add dismiss button
      toastActions.cancel = {
        label: 'Dismiss',
        onClick: () => {
          // Just dismiss the toast, don't mark as read
        },
      };
      
      // Show toast with enhanced configuration
      showNotificationToast(notification, toastActions);
    });
    
    // Listen for read status updates
    socket.on('notification:read', ({ notificationId }: { notificationId: string }) => {
      console.log('[NotificationContext] Notification marked as read:', notificationId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });
    
    // Listen for deletion events
    socket.on('notification:deleted', ({ notificationId }: { notificationId: string }) => {
      console.log('[NotificationContext] Notification deleted:', notificationId);
      
      const notification = notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });
    
    socketRef.current = socket;
    isSubscribedRef.current = true;
  }, [isAuthenticated, user, notifications, markAsRead, preferences]);

  /**
   * Close WebSocket connection
   */
  const unsubscribe = useCallback(() => {
    if (socketRef.current) {
      console.log('[NotificationContext] Closing WebSocket connection...');
      socketRef.current.close();
      socketRef.current = null;
      isSubscribedRef.current = false;
      setIsConnected(false);
    }
  }, []);

  /**
   * Initialize notifications and preferences on mount
   */
  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      return;
    }

    // User is authenticated and we haven't initialized yet
    if (isAuthenticated && user && !hasInitializedRef.current) {
      console.log('[NotificationContext] User authenticated, initializing...');
      hasInitializedRef.current = true;
      fetchNotifications();
      fetchPreferences();
    } 
    // User is not authenticated and we were initialized - cleanup
    else if (!isAuthenticated && hasInitializedRef.current) {
      console.log('[NotificationContext] User logged out, cleaning up...');
      hasInitializedRef.current = false;
      unsubscribe();
      setNotifications([]);
      setUnreadCount(0);
      setPreferences([]);
    }
  }, [authLoading, fetchNotifications, fetchPreferences, isAuthenticated, unsubscribe, user]);

  /**
   * Subscribe to WebSocket when preferences are loaded
   */
  useEffect(() => {
    // Only subscribe if authenticated, have user, preferences loaded, and not already subscribed
    if (isAuthenticated && user && preferences.length > 0 && !isSubscribedRef.current) {
      console.log('[NotificationContext] Preferences loaded, subscribing to WebSocket...');
      subscribe();
    }
  }, [isAuthenticated, user, preferences.length, subscribe]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    preferences,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    fetchPreferences,
    updatePreference,
    setDND,
    subscribe,
    unsubscribe,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * useNotifications Hook
 * Custom hook to access notification context
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
