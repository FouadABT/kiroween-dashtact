'use client';

/**
 * MessageButton Component
 * Reusable button for starting conversations with users
 * Provides better UX with loading states and error handling
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessaging } from '@/contexts/MessagingContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MessageButtonProps {
  /** User ID to message */
  userId: string;
  /** Display name for the user (for error messages) */
  userName?: string;
  /** Button text */
  children?: React.ReactNode;
  /** Show icon */
  showIcon?: boolean;
  /** Callback after conversation is opened */
  onConversationOpened?: () => void;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Dashboard type - determines which messages page to navigate to */
  dashboardType?: 'member' | 'coach';
}

export function MessageButton({
  userId,
  userName = 'user',
  children = 'Send Message',
  showIcon = true,
  onConversationOpened,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  dashboardType = 'member',
}: MessageButtonProps) {
  const router = useRouter();
  const messaging = useMessaging();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!userId) {
      console.error('[MessageButton] No userId provided');
      toast.error('Cannot start conversation - User ID is missing');
      return;
    }

    console.log('[MessageButton] Starting conversation with userId:', userId);
    console.log('[MessageButton] Current conversations:', messaging.conversations.length);
    console.log('[MessageButton] Messaging context state:', {
      isConnected: messaging.isConnected,
      isPanelOpen: messaging.isPanelOpen,
      conversationsCount: messaging.conversations.length,
    });

    try {
      setIsLoading(true);

      // Check if conversation already exists
      const existingConversation = messaging.conversations.find(conv => {
        console.log('[MessageButton] Checking conversation:', {
          id: conv.id,
          participants: conv.participants?.map(p => ({ userId: p.userId })),
        });
        return conv.participants?.some(p => p.userId === userId);
      });

      let conversationId: string;

      if (existingConversation) {
        console.log('[MessageButton] Found existing conversation:', existingConversation.id);
        conversationId = existingConversation.id;
        toast.success(`Opening conversation with ${userName}`);
      } else {
        console.log('[MessageButton] Creating new conversation with participantIds:', [userId]);
        // Create new conversation
        const newConv = await messaging.createConversation({
          type: 'DIRECT',
          participantIds: [userId],
        });
        console.log('[MessageButton] New conversation created:', newConv.id);
        conversationId = newConv.id;
        toast.success(`Conversation started with ${userName}`);
      }

      // Navigate to messages page with conversation selected
      const messagesPath = dashboardType === 'member' 
        ? `/dashboard/member/messages?conversation=${conversationId}`
        : `/dashboard/coaching/messages?conversation=${conversationId}`;
      
      console.log('[MessageButton] Navigating to:', messagesPath);
      router.push(messagesPath);

      onConversationOpened?.();
    } catch (error) {
      console.error('[MessageButton] Failed to start conversation:', error);
      toast.error(`Could not open conversation with ${userName}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !userId || disabled}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Opening...
        </>
      ) : (
        <>
          {showIcon && <MessageCircle className="h-4 w-4 mr-2" />}
          {children}
        </>
      )}
    </Button>
  );
}
