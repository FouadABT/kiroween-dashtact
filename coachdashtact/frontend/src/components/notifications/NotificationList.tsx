'use client';

/**
 * NotificationList Component
 * Displays grouped notifications with loading and empty states
 * Includes keyboard navigation support with arrow keys
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters } from './NotificationFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useFocusTrap } from '@/lib/focus-trap';

/**
 * NotificationList Props
 */
interface NotificationListProps {
  onClose?: () => void;
}

/**
 * Group notifications by date
 */
function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);

  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Older: [],
  };

  notifications.forEach(notification => {
    const notificationDate = new Date(notification.createdAt);
    const notificationDay = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate()
    );

    if (notificationDay.getTime() === today.getTime()) {
      groups.Today.push(notification);
    } else if (notificationDay.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(notification);
    } else if (notificationDate >= thisWeek) {
      groups['This Week'].push(notification);
    } else {
      groups.Older.push(notification);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

/**
 * NotificationList Component
 * Supports keyboard navigation with arrow keys
 */
export function NotificationList({ onClose }: NotificationListProps) {
  const {
    notifications,
    isLoading,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const notificationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group notifications by date
  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications]
  );

  // Enable focus trap for the notification panel
  useFocusTrap(containerRef as React.RefObject<HTMLElement>, true, {
    escapeDeactivates: true,
    onDeactivate: onClose,
  });

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (notifications.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = Math.min(prev + 1, notifications.length - 1);
            notificationRefs.current[next]?.focus();
            notificationRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            return next;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            notificationRefs.current[next]?.focus();
            notificationRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            return next;
          });
          break;

        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          notificationRefs.current[0]?.focus();
          notificationRefs.current[0]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          break;

        case 'End':
          e.preventDefault();
          const lastIndex = notifications.length - 1;
          setFocusedIndex(lastIndex);
          notificationRefs.current[lastIndex]?.focus();
          notificationRefs.current[lastIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          break;

        case 'Enter':
          // Enter key on focused notification will be handled by NotificationItem
          break;

        case 'Escape':
          // Escape will be handled by NotificationCenter
          break;
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('keydown', handleKeyDown);
      return () => listElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [notifications.length]);

  /**
   * Reset refs array when notifications change
   */
  useEffect(() => {
    notificationRefs.current = notificationRefs.current.slice(0, notifications.length);
  }, [notifications.length]);

  // Loading state
  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="p-8">
        <NotificationFilters />
        <Separator className="my-4" />
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No notifications</p>
          <p className="text-xs text-muted-foreground mt-1">
            You&apos;re all caught up!
          </p>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('accessToken');
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/demo`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });
                  if (response.ok) {
                    // Notification will appear via WebSocket
                    console.log('Demo notification created');
                  }
                } catch (error) {
                  console.error('Failed to create demo notification:', error);
                }
              }}
              className="mt-4 px-4 py-2 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Create Demo Notification
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col max-h-[600px]"
      role="region"
      aria-label="Notifications list"
    >
      <div ref={listRef}>
      {/* Header with filters */}
      <div className="p-4 border-b">
        <NotificationFilters />
      </div>

      {/* Notification list */}
      <ScrollArea className="flex-1">
        <div 
          className="divide-y"
          role="list"
          aria-label="Notification items"
        >
          {Object.entries(groupedNotifications).map(([group, groupNotifications], groupIndex) => {
            // Calculate the starting index for this group
            const startIndex = Object.entries(groupedNotifications)
              .slice(0, groupIndex)
              .reduce((acc, [, notifs]) => acc + notifs.length, 0);

            return (
              <div key={group}>
                {/* Group header */}
                <div className="px-4 py-2 bg-muted/50">
                  <h3 
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    id={`notification-group-${group.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {group}
                  </h3>
                </div>

                {/* Group notifications */}
                {groupNotifications.map((notification, index) => {
                  const absoluteIndex = startIndex + index;
                  return (
                    <NotificationItem
                      key={notification.id}
                      ref={(el: HTMLDivElement | null) => {
                        notificationRefs.current[absoluteIndex] = el;
                      }}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                        onClose?.();
                      }}
                      isFocused={focusedIndex === absoluteIndex}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Loading indicator for pagination */}
      {isLoading && notifications.length > 0 && (
        <div className="flex items-center justify-center p-4 border-t">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading more notifications" />
        </div>
      )}
      </div>
    </div>
  );
}
