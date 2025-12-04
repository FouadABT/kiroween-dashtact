'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function CoachMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messaging = useMessaging();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Get conversationId from URL if provided
  const urlConversationId = searchParams.get('conversation');

  useEffect(() => {
    // Load conversations on mount
    messaging.fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Select conversation from URL if provided
    if (urlConversationId && !messaging.selectedConversationId) {
      messaging.selectConversation(urlConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    messaging.selectConversation(conversationId);
    router.push(`/dashboard/coaching/messages?conversation=${conversationId}`);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !messaging.selectedConversationId) return;

    try {
      setIsSending(true);
      await messaging.sendMessage(messaging.selectedConversationId, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = messaging.conversations.filter(conv =>
    searchQuery
      ? conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participants?.some(p => p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const selectedConversation = messaging.conversations.find(
    c => c.id === messaging.selectedConversationId
  );

  const currentMessages = messaging.selectedConversationId
    ? messaging.messages[messaging.selectedConversationId] || []
    : [];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <PageHeader
        title="Messages"
        description="Chat with your members"
        breadcrumbProps={{
          customItems: [
            { label: 'Coaching', href: '/dashboard/coaching' },
            { label: 'Messages', href: '/dashboard/coaching/messages' },
          ],
        }}
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* Conversations List */}
        <Card className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {messaging.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Start by messaging your members</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants?.find(
                    p => p.userId !== conversation.id
                  );
                  const isSelected = conversation.id === messaging.selectedConversationId;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors ${
                        isSelected ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={otherParticipant?.user?.avatarUrl || undefined} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {otherParticipant?.user?.name?.[0]?.toUpperCase() || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-foreground truncate">
                              {conversation.name || otherParticipant?.user?.name || 'Member'}
                            </p>
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-foreground/60 flex-shrink-0">
                                {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-foreground/70 truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-xs font-medium mt-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Messages View */}
        <Card className="md:col-span-2 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    messaging.selectConversation(null);
                    router.push('/dashboard/coaching/messages');
                  }}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      selectedConversation.participants?.find(p => p.userId !== selectedConversation.id)
                        ?.user?.avatarUrl || undefined
                    }
                  />
                  <AvatarFallback>
                    {selectedConversation.participants
                      ?.find(p => p.userId !== selectedConversation.id)
                      ?.user?.name?.[0]?.toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">
                    {selectedConversation.name ||
                      selectedConversation.participants?.find(p => p.userId !== selectedConversation.id)
                        ?.user?.name ||
                      'Member'}
                  </p>
                  {messaging.isConnected && (
                    <p className="text-xs text-muted-foreground">Online</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 bg-muted/30">
                <div className="space-y-4">
                  {currentMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm mt-2">Start the conversation!</p>
                    </div>
                  ) : (
                    currentMessages.map((message, index) => {
                      const isOwn = message.sender?.id === user?.id;
                      const showAvatar = index === 0 || currentMessages[index - 1]?.sender?.id !== message.sender?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender?.avatarUrl || undefined} />
                                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                  {isOwn ? 'You' : message.sender?.name?.[0]?.toUpperCase() || 'M'}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8" />
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            {showAvatar && (
                              <span className="text-xs text-muted-foreground mb-1 px-1">
                                {isOwn ? 'You' : message.sender?.name || 'Member'}
                              </span>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                  : 'bg-muted text-foreground rounded-tl-sm'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 px-1">
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex gap-2 items-end">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    className="resize-none min-h-[44px] max-h-[120px] rounded-2xl"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || isSending}
                    size="icon"
                    className="flex-shrink-0 h-11 w-11 rounded-full"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 px-1">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-2">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
