'use client';

/**
 * MessageIcon Component
 * Displays message icon with unread count badge in page header
 */

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessaging } from '@/contexts/MessagingContext';
import { cn } from '@/lib/utils';

interface MessageIconProps {
  onClick: () => void;
  className?: string;
}

export function MessageIcon({ onClick, className }: MessageIconProps) {
  const { unreadCount, togglePanel } = useMessaging();

  const handleClick = () => {
    togglePanel();
    onClick?.();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn('relative', className)}
      aria-label={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
