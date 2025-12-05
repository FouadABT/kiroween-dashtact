'use client';

/**
 * MessagePanel Component
 * Sliding panel for messaging interface
 */

import { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConversationList } from './ConversationList';
import { ConversationView } from './ConversationView';
import { NewConversationDialog } from './NewConversationDialog';
import { useMessaging } from '@/contexts/MessagingContext';
import { cn } from '@/lib/utils';

interface MessagePanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MessagePanel({ open: externalOpen, onOpenChange: externalOnOpenChange }: MessagePanelProps) {
  const { selectedConversationId, selectConversation, isPanelOpen, closePanel } = useMessaging();
  
  // Use external props if provided, otherwise use context state
  const open = externalOpen !== undefined ? externalOpen : isPanelOpen;
  const onOpenChange = externalOnOpenChange || ((isOpen: boolean) => {
    if (!isOpen) closePanel();
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  const handleBack = () => {
    selectConversation(null);
  };

  const handleClose = () => {
    selectConversation(null);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[400px] md:w-[500px] p-0 flex flex-col [&>button]:hidden"
        >
          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">
                {selectedConversationId ? 'Conversation' : 'Messages'}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="Close messages"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search and New Message - Only show in list view */}
            {!selectedConversationId && (
              <div className="flex items-center gap-2 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  size="icon"
                  onClick={() => setIsNewConversationOpen(true)}
                  aria-label="New message"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {selectedConversationId ? (
              <ConversationView 
                conversationId={selectedConversationId}
                onBack={handleBack}
              />
            ) : (
              <ConversationList searchQuery={searchQuery} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
      />
    </>
  );
}
