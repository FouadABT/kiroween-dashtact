'use client';

import { ActivityLog } from '@/types/activity-log';
import { ActivityLogItem } from './ActivityLogItem';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ActivityLogListProps {
  activities: ActivityLog[];
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Loading skeleton for activity log list
 */
function ActivityLogSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border border-border rounded-lg">
          <div className="flex items-start gap-4">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state for activity log list
 */
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No activities found</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        There are no activity logs matching your filters. Try adjusting your search criteria.
      </p>
    </div>
  );
}

export function ActivityLogList({ activities, isLoading, error }: ActivityLogListProps) {
  // Loading state
  if (isLoading) {
    return <ActivityLogSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return <EmptyState />;
  }

  // Activity list
  return (
    <div className="space-y-4" role="list" aria-label="Activity log entries">
      {activities.map((activity) => (
        <ActivityLogItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
