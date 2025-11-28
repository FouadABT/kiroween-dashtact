'use client';

/**
 * MessageBubble Component
 * Displays individual message with sender info and status
 */

import { memo } from 'react';
import { Check, CheckCheck, AlertCircle, RotateCw, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/messaging';
import { useMessaging } from '@/contexts/MessagingContext';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble = memo(function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { sender, content, createdAt, status, metadata } = message;
  const { retryMessage } = useMessaging();
  
  // Safety check for sender
  if (!sender) {
    console.warn('[MessageBubble] Message missing sender:', message);
    return null;
  }
  
  const isFailed = metadata?.failed === true;
  const isPending = metadata?.pending === true;

  // Format timestamp
  let timestamp: string;
  try {
    const messageDate = new Date(createdAt);
    
    // Check if date is valid
    if (isNaN(messageDate.getTime())) {
      timestamp = 'Just now';
    } else if (isToday(messageDate)) {
      timestamp = format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      timestamp = `Yesterday ${format(messageDate, 'h:mm a')}`;
    } else {
      timestamp = format(messageDate, 'MMM d, h:mm a');
    }
  } catch (error) {
    timestamp = 'Just now';
  }

  // Status icon for own messages
  const StatusIcon = () => {
    if (!isOwn) return null;

    if (isFailed) {
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    }

    if (isPending) {
      return <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />;
    }

    if (!status) return null;

    switch (status) {
      case 'SENT':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'DELIVERED':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'READ':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  const handleRetry = () => {
    retryMessage(message.conversationId, message.id);
  };

  return (
    <div className={cn('flex gap-2 items-start', isOwn && 'flex-row-reverse')}>
      {/* Avatar - only show for received messages */}
      {!isOwn && sender && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={sender.avatarUrl || undefined} alt={sender.name || 'User'} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {(sender.name || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn('flex flex-col gap-1 max-w-[70%]', isOwn && 'items-end')}>
        {/* Sender name - only show for received messages */}
        {!isOwn && sender && (
          <span className="text-xs font-medium text-muted-foreground px-3">
            {sender.name || 'Unknown User'}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2 break-words',
            isOwn
              ? isFailed
                ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tr-sm'
                : 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm',
            isPending && 'opacity-60'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>

        {/* Timestamp, status, and retry button */}
        <div className={cn('flex items-center gap-1 px-3', isOwn && 'flex-row-reverse')}>
          <span className="text-xs text-muted-foreground">
            {isFailed ? 'Failed to send' : timestamp}
          </span>
          <StatusIcon />
          {isFailed && isOwn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-6 px-2 text-xs"
            >
              <RotateCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
