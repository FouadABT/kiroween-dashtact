'use client';

/**
 * NotificationAnnouncer Component
 * Provides screen reader announcements for new notifications
 * Uses aria-live regions to announce notifications to assistive technologies
 */

import { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationPriority } from '@/types/notification';

/**
 * NotificationAnnouncer Component
 * Hidden component that announces notifications to screen readers
 */
export function NotificationAnnouncer() {
  const { notifications, unreadCount } = useNotifications();
  const [announcement, setAnnouncement] = useState('');
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  /**
   * Announce new notifications
   */
  useEffect(() => {
    if (notifications.length === 0) return;

    const latestNotification = notifications[0];
    
    // Only announce if it's a new notification
    if (latestNotification.id !== lastNotificationId) {
      const priorityText = latestNotification.priority === NotificationPriority.URGENT 
        ? 'Urgent notification: ' 
        : 'New notification: ';
      
      const message = `${priorityText}${latestNotification.title}. ${latestNotification.message}`;
      
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setAnnouncement(message);
        setLastNotificationId(latestNotification.id);

        // Clear announcement after it's been read
        setTimeout(() => setAnnouncement(''), 1000);
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [notifications, lastNotificationId]);

  /**
   * Announce unread count changes
   */
  useEffect(() => {
    if (unreadCount > 0 && lastNotificationId !== null) {
      const countMessage = `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`;
      
      // Delay announcement to avoid conflicts
      const timeoutId = setTimeout(() => {
        setAnnouncement(countMessage);
        setTimeout(() => setAnnouncement(''), 1000);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [unreadCount, lastNotificationId]);

  return (
    <>
      {/* Polite announcements for normal notifications */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement && !announcement.includes('Urgent') && announcement}
      </div>

      {/* Assertive announcements for urgent notifications */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement && announcement.includes('Urgent') && announcement}
      </div>
    </>
  );
}
