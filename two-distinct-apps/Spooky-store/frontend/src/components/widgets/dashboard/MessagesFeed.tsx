'use client';

import { useState, useEffect, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export interface MessagesFeedProps {
  title?: string;
  limit?: number;
  data?: Array<{ id: string; senderId: string; senderName: string; senderAvatar?: string; message: string; isRead: boolean; createdAt: string }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

function getInitials(name: string): string {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
}

function truncateMessage(message: string, maxLength: number = 60): string {
  return message.length <= maxLength ? message : message.slice(0, maxLength) + '...';
}

export function MessagesFeed({
  title = 'Recent Messages',
  limit = 10,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission,
}: MessagesFeedProps) {
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const messages = useMemo(() => {
    if (propData) return propData.slice(0, limit);
    if (!useContext || !context.recentActivity) return [];
    return context.recentActivity
      .filter(activity => activity.type === 'message')
      .slice(0, limit)
      .map(activity => ({
        id: activity.id,
        senderId: activity.metadata?.senderId || activity.entityId,
        senderName: activity.metadata?.senderName || 'Unknown User',
        senderAvatar: activity.metadata?.senderAvatar,
        message: activity.description,
        isRead: activity.metadata?.isRead || false,
        createdAt: activity.timestamp,
      }));
  }, [propData, useContext, context.recentActivity, limit]);

  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="card" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (messages.length === 0) {
    return (
      <WidgetContainer title={title}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">No messages yet</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/messages">View All Messages</Link>
          </Button>
        </div>
      </WidgetContainer>
    );
  }

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {unreadCount > 0 && (
          <div className="flex items-center justify-between mb-2">
            <Badge variant="default" className="text-xs">{unreadCount} new</Badge>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer ${!message.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(message.senderName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`text-sm ${!message.isRead ? 'font-bold' : 'font-medium'} text-foreground truncate`}>{message.senderName}</h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(message.createdAt)}</span>
                    {!message.isRead && <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
                  </div>
                </div>
                <p className={`text-sm ${!message.isRead ? 'text-foreground' : 'text-muted-foreground'} line-clamp-2`}>{truncateMessage(message.message)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
