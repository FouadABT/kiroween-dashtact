'use client';

/**
 * Personal Stats Card Widget
 * Displays personal metrics for User role
 */

import { useMemo, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { Bell, MessageSquare, FileUp, User } from 'lucide-react';
import Link from 'next/link';

export interface PersonalStatsCardProps {
  title?: string;
  data?: {
    notificationsUnread?: number;
    messagesUnread?: number;
    fileUploadsCount?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
  color: string;
}

function StatItem({ icon, label, count, href, color }: StatItemProps) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
      <div className={`p-3 rounded-full ${color} mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
      <div className="text-3xl font-bold text-foreground mb-1">{formatCount(count)}</div>
      <div className="text-sm text-muted-foreground text-center">{label}</div>
    </Link>
  );
}

export function PersonalStatsCard({
  title = 'My Stats',
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission,
}: PersonalStatsCardProps) {
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const data = propData || (useContext ? context.stats : undefined);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="card" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (!data || data.notificationsUnread === undefined) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={User} title="No Data" description="Personal activity data not available" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatItem icon={<Bell className="h-6 w-6 text-primary" />} label="Unread Notifications" count={data.notificationsUnread ?? 0} href="/dashboard/notifications" color="bg-primary/10" />
        <StatItem icon={<MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />} label="Unread Messages" count={data.messagesUnread ?? 0} href="/dashboard/messages" color="bg-blue-100 dark:bg-blue-900/20" />
        <StatItem icon={<FileUp className="h-6 w-6 text-green-600 dark:text-green-400" />} label="File Uploads" count={data.fileUploadsCount ?? 0} href="/dashboard/uploads" color="bg-green-100 dark:bg-green-900/20" />
      </div>
    </WidgetContainer>
  );
}
