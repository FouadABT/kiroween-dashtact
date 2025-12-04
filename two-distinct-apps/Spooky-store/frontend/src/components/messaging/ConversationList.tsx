'use client';

/**
 * ConversationList Component
 * Displays list of conversations with last message preview
 */

import { useEffect, useMemo } from 'react';
import { MessageSquare, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types/messaging';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  searchQuery?: string;
}

export function ConversationList({ searchQuery = '' }: ConversationListProps) {
  const { user } = useAuth();
  const { 
    conversations, 
    isLoading, 
    selectedConversationId,
    selectConversation,
    fetchConversations 
  } = useMessaging();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.name?.toLowerCase().includes(query) ||
      conv.lastMessage?.content.toLowerCase().includes(query) ||
      conv.participants?.some(p => p.user?.name?.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {searchQuery ? 'No conversations found' : 'No messages yet'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {searchQuery 
            ? 'Try adjusting your search query'
            : 'Start a conversation by clicking the + button above'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {filteredConversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          onClick={() => selectConversation(conversation.id)}
          currentUserId={user?.id}
        />
      ))}
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  currentUserId?: string;
}

function ConversationItem({ conversation, isSelected, onClick, currentUserId }: ConversationItemProps) {
  const { type, name, lastMessage, lastMessageAt, unreadCount, participants = [] } = conversation;

  // For direct conversations, get the OTHER person (not current user)
  const otherParticipant = type === 'DIRECT' && currentUserId
    ? participants.find(p => p.userId !== currentUserId)
    : participants[0];
  
  // Get conversation display name
  const displayName = name || otherParticipant?.user?.name || 'Unknown';
  
  // Get avatar for direct conversations (show OTHER person's avatar)
  const avatarUrl = type === 'DIRECT' && otherParticipant?.user?.avatarUrl 
    ? otherParticipant.user.avatarUrl 
    : undefined;
  
  // Handle lastMessage - backend returns messages array, need to get first item
  const actualLastMessage = lastMessage || ((conversation as any).messages?.[0]);
  
  // Format timestamp
  let timestamp = '';
  if (lastMessageAt) {
    try {
      const date = new Date(lastMessageAt);
      if (!isNaN(date.getTime())) {
        timestamp = formatDistanceToNow(date, { addSuffix: true });
      }
    } catch (error) {
      timestamp = '';
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 hover:bg-accent transition-colors text-left',
        isSelected && 'bg-accent',
        unreadCount > 0 && 'bg-primary/5 dark:bg-primary/10'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        {type === 'GROUP' ? (
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Users className="h-5 w-5" />
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cn(
            'text-sm font-medium truncate text-foreground',
            unreadCount > 0 && 'font-semibold'
          )}>
            {displayName}
          </h4>
          {timestamp && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {timestamp}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-sm text-muted-foreground truncate',
            unreadCount > 0 && 'font-medium text-foreground'
          )}>
            {actualLastMessage?.content || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <Badge variant="default" className="flex-shrink-0 h-5 min-w-[20px] px-1.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}
