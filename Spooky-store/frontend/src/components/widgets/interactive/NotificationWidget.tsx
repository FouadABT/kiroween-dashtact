'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read?: boolean;
}

export interface NotificationWidgetProps {
  notifications: Notification[];
  maxVisible?: number;
  position?: 'top' | 'bottom';
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export function NotificationWidget({
  notifications,
  maxVisible = 5,
  position = 'top',
  onDismiss,
  onDismissAll,
  onNotificationClick,
  className,
}: NotificationWidgetProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Filter out dismissed notifications
  const visibleNotifications = notifications
    .filter((n) => !dismissedIds.has(n.id))
    .slice(0, maxVisible);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    onDismiss?.(id);
  };

  const handleDismissAll = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setDismissedIds(allIds);
    onDismissAll?.();
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20';
      case 'error':
        return 'border-l-4 border-l-destructive bg-destructive/10';
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'info':
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Show toast notifications for new notifications
  React.useEffect(() => {
    notifications.forEach((notification) => {
      if (!dismissedIds.has(notification.id)) {
        const toastFn = notification.type === 'error' 
          ? toast.error 
          : notification.type === 'success'
          ? toast.success
          : notification.type === 'warning'
          ? toast.warning
          : toast.info;

        // Only show toast for very recent notifications (within last 5 seconds)
        const isRecent = new Date().getTime() - notification.timestamp.getTime() < 5000;
        if (isRecent) {
          toastFn(notification.title, {
            description: notification.message,
          });
        }
      }
    });
  }, [notifications, dismissedIds]);

  if (visibleNotifications.length === 0) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center', className)}>
        <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-card',
        position === 'top' ? 'flex flex-col' : 'flex flex-col-reverse',
        className
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notifications</h3>
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {visibleNotifications.length}
          </span>
        </div>
        {visibleNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="h-8 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="divide-y">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'relative p-4 transition-colors',
                getTypeStyles(notification.type),
                onNotificationClick && 'cursor-pointer hover:bg-accent/50',
                !notification.read && 'font-medium'
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notification.id);
                      }}
                      className="h-6 w-6 p-0 hover:bg-background/50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {notifications.length > maxVisible && (
        <div className="border-t p-2 text-center">
          <p className="text-xs text-muted-foreground">
            Showing {maxVisible} of {notifications.length} notifications
          </p>
        </div>
      )}
    </div>
  );
}
