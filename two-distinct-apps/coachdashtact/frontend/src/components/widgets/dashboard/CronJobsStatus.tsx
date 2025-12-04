'use client';

import { useState, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export interface CronJobsStatusProps {
  title?: string;
  limit?: number;
  data?: Array<{ id: string; jobName: string; status: string; startedAt: string; duration: number }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'SUCCESS': return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
    case 'FAILURE': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    case 'RUNNING': return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Running</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export function CronJobsStatus({
  title = 'Cron Jobs Status',
  limit = 10,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'system:*',
}: CronJobsStatusProps) {
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const cronExecutions = useMemo(() => {
    if (propData) return propData.slice(0, limit);
    if (!useContext || !context.recentActivity) return [];
    return context.recentActivity
      .filter(activity => activity.type === 'cron')
      .slice(0, limit)
      .map(activity => ({
        id: activity.id,
        jobName: activity.metadata?.jobName || activity.description,
        status: activity.metadata?.status || 'SUCCESS',
        startedAt: activity.timestamp,
        duration: activity.metadata?.duration || 0,
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

  if (cronExecutions.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={Clock} title="No Executions" description="No recent cron job executions" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Execution Time</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cronExecutions.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell className="font-medium">{execution.jobName}</TableCell>
                <TableCell>{getStatusBadge(execution.status)}</TableCell>
                <TableCell className="text-muted-foreground">{formatRelativeTime(execution.startedAt)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatDuration(execution.duration)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WidgetContainer>
  );
}
