'use client';

/**
 * ChatWidget Component
 * 
 * Displays a chat interface with message list, avatars, input field,
 * and typing indicator. Auto-scrolls to latest messages.
 * 
 * @example
 * ```tsx
 * <ChatWidget
 *   messages={[
 *     {
 *       id: '1',
 *       text: 'Hello!',
 *       sender: { id: '1', name: 'John', avatar: '/john.jpg' },
 *       timestamp: new Date(),
 *       isOwn: false
 *     }
 *   ]}
 *   currentUser={{ id: '2', name: 'Me', avatar: '/me.jpg' }}
 *   onSendMessage={(text) => console.log('Send:', text)}
 *   typingUsers={['John']}
 * />
 * ```
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { BaseWidgetProps } from '../types/widget.types';

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: ChatUser;
  timestamp: Date | string;
  isOwn?: boolean;
}

export interface ChatWidgetProps extends BaseWidgetProps {
  /** Messages to display */
  messages: ChatMessage[];
  /** Current user */
  currentUser: ChatUser;
  /** Send message handler */
  onSendMessage: (text: string) => void;
  /** Users currently typing */
  typingUsers?: string[];
  /** Widget height */
  height?: number | string;
  /** Placeholder text */
  placeholder?: string;
  /** Disable input */
  disabled?: boolean;
}

/**
 * Get user initials from name
 */
function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Show date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ChatWidget({
  messages,
  currentUser,
  onSendMessage,
  typingUsers = [],
  height = 500,
  placeholder = 'Type a message...',
  disabled = false,
  className = '',
}: ChatWidgetProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(inputValue.trim());
      setInputValue('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <Card className={`flex flex-col ${className}`} style={{ height: containerHeight }}>
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.isOwn || message.sender.id === currentUser.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(message.sender.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Message Content */}
                <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name */}
                  {!isOwn && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {message.sender.name}
                    </span>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {typingUsers.join(', ')}
                </span>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled || isSending}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

