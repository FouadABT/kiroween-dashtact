'use client';

/**
 * ConversationView Component
 * Displays conversation messages and input
 */

import { useEffect, useRef } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

export function ConversationView({ conversationId, onBack }: ConversationViewProps) {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    typingUsers,
    fetchMessages,
    sendMessage,
    markAsRead
  } = useMessaging();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationMessages = messages[conversationId] || [];
  const conversation = conversations.find(c => c.id === conversationId);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Mark ALL messages as read when viewing conversation
  useEffect(() => {
    if (conversationMessages.length > 0 && user) {
      // Check if there are any unread messages from others
      const hasUnreadFromOthers = conversationMessages.some(
        msg => msg.sender?.id !== user.id && msg.status !== 'READ'
      );
      
      if (hasUnreadFromOthers) {
        markAsRead(conversationId);
      }
    }
  }, [conversationMessages, conversationId, markAsRead, user]);

  if (!conversation) {
    return (
      <div className="flex flex-col h-full">
        <ConversationHeaderSkeleton />
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <MessageSkeleton key={i} isOwn={i % 2 === 0} />
          ))}
        </div>
      </div>
    );
  }

  // For direct conversations, get the OTHER person (not current user)
  const otherParticipant = conversation.type === 'DIRECT' && user
    ? conversation.participants?.find(p => p.userId !== user.id)
    : conversation.participants?.[0];
  
  const displayName = conversation.name || otherParticipant?.user?.name || 'Unknown';
  const avatarUrl = conversation.type === 'DIRECT' 
    ? otherParticipant?.user?.avatarUrl 
    : undefined;

  const typingUserNames = typingUsers[conversationId]
    ?.map(userId => {
      const participant = conversation.participants?.find(p => p.userId === userId);
      return participant?.user?.name || 'Someone';
    })
    .filter(name => name !== user?.name) || [];

  const handleSendMessage = async (content: string) => {
    await sendMessage(conversationId, content);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-8 w-8">
          {conversation.type === 'GROUP' ? (
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Users className="h-4 w-4" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{displayName}</h3>
          {conversation.type === 'GROUP' && conversation.participants && (
            <p className="text-xs text-muted-foreground truncate">
              {conversation.participants.length} members
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {conversationMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender?.id === user?.id}
              />
            ))}
            
            {/* Typing indicator */}
            {typingUserNames.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                </div>
                <span>
                  {typingUserNames.length === 1
                    ? `${typingUserNames[0]} is typing...`
                    : `${typingUserNames.length} people are typing...`
                  }
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border flex-shrink-0">
        <MessageInput 
          conversationId={conversationId}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}

function ConversationHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function MessageSkeleton({ isOwn }: { isOwn: boolean }) {
  return (
    <div className={cn('flex gap-2', isOwn && 'flex-row-reverse')}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="space-y-2 max-w-[70%]">
        <Skeleton className="h-4 w-24" />
        <Skeleton className={cn('h-16', isOwn ? 'w-48' : 'w-64')} />
      </div>
    </div>
  );
}
