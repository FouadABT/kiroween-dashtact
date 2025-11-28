'use client';

import { useState, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { Bell, Clock } from 'lucide-react';
import Link from 'next/link';

export interface NotificationsFeedProps {
  title?: string;
  limit?: number;
  data?: Array<{ id: string; title: string; message: string; isRead: boolean; createdAt: string; priority: string }>;
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

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'NORMAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

export function NotificationsFeed({
  title = 'Recent Notifications',
  limit = 10,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission,
}: NotificationsFeedProps) {
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const notifications = useMemo(() => {
    if (propData) return propData.slice(0, limit);
    if (!useContext || !context.recentActivity) return [];
    return context.recentActivity
      .filter(activity => activity.type === 'notification')
      .slice(0, limit)
      .map(activity => ({
        id: activity.id,
        title: activity.description,
        message: activity.metadata?.message || 'No details',
        isRead: activity.metadata?.isRead || false,
        createdAt: activity.timestamp,
        priority: activity.metadata?.priority || 'NORMAL',
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

  if (notifications.length === 0) {
    return (
      <WidgetContainer title={title}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">No notifications yet</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/notifications">View All Notifications</Link>
          </Button>
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {notifications.map((notification) => (
          <div key={notification.id} className={`p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)} flex-shrink-0`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`text-sm ${!notification.isRead ? 'font-bold' : 'font-medium'} text-foreground truncate`}>{notification.title}</h4>
                  {!notification.isRead && <Badge variant="default" className="flex-shrink-0 text-xs">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{notification.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(notification.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
