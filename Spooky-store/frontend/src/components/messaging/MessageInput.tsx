'use client';

/**
 * MessageInput Component
 * Text input for sending messages with typing indicators
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMessaging } from '@/contexts/MessagingContext';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  conversationId: string;
  onSend: (content: string) => Promise<void>;
  maxLength?: number;
}

export function MessageInput({ 
  conversationId, 
  onSend, 
  maxLength = 2000 
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { emitTyping } = useMessaging();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Emit typing indicator with debounce
  const handleTyping = () => {
    emitTyping(conversationId);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 300);
  };

  const handleSend = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent || isSending) return;
    
    if (trimmedContent.length > maxLength) {
      return;
    }

    setIsSending(true);
    try {
      await onSend(trimmedContent);
      setContent('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    handleTyping();
  };

  const isNearLimit = content.length > maxLength * 0.9;
  const isOverLimit = content.length > maxLength;

  return (
    <div className="p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none text-foreground',
              isOverLimit && 'border-destructive focus-visible:ring-destructive'
            )}
            disabled={isSending}
            rows={1}
          />
          
          {/* Character count */}
          {isNearLimit && (
            <div className={cn(
              'absolute bottom-2 right-2 text-xs',
              isOverLimit ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {content.length}/{maxLength}
            </div>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={!content.trim() || isSending || isOverLimit}
          size="icon"
          className="h-[44px] w-[44px] flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
