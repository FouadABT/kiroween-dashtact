'use client';

/**
 * NotificationCenter Component
 * Displays a notification bell icon with badge and dropdown panel
 * Includes full keyboard navigation support
 */

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationList } from './NotificationList';
import { NotificationAnnouncer } from './NotificationAnnouncer';

/**
 * NotificationCenter Component
 * Bell icon with unread count badge and dropdown notification panel
 * Supports keyboard navigation: Tab, Enter, Escape
 */
export function NotificationCenter() {
  const { unreadCount, notifications, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('[NotificationCenter] State:', {
      isOpen,
      unreadCount,
      notificationCount: notifications.length,
      isLoading,
    });
  }, [isOpen, unreadCount, notifications.length, isLoading]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close dropdown
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        // Return focus to trigger button
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  /**
   * Handle popover close and return focus
   */
  const handleClose = () => {
    setIsOpen(false);
    // Return focus to trigger button after closing
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  };

  return (
    <>
      {/* Screen reader announcements */}
      <NotificationAnnouncer />
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            className="relative p-2"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            <Bell className="h-5 w-5 text-foreground" aria-hidden="true" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-96 p-0 max-h-[600px]"
          align="end"
          sideOffset={8}
          role="menu"
          aria-label="Notifications panel"
        >
          <NotificationList onClose={handleClose} />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
