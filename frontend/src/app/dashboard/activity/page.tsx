'use client';

/**
 * Activity Log Page
 * Full-page view of all activity logs with pagination and filtering
 * Admin/Manager only - tracks all significant actions in the system
 */

import { useState, useEffect } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';
import { ActivityLogList } from '@/components/activity-log/ActivityLogList';
import { ActivityLogFilters } from '@/components/activity-log/ActivityLogFilters';
import { ActivityLogPagination } from '@/components/activity-log/ActivityLogPagination';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ActivityLogApi } from '@/lib/api/activity-log';
import type { ActivityLog, ActivityLogFilters as Filters, ActivityLogResponse } from '@/types/activity-log';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ActivityLogPage() {
  const { updateMetadata } = useMetadata();
  
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 25,
    sortOrder: 'desc',
  });

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: 'Activity Log',
      description: 'View and audit all system activities and user actions',
      keywords: ['activity', 'audit', 'log', 'history', 'tracking'],
    });
  }, [updateMetadata]);

  // Fetch activity logs
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: ActivityLogResponse = await ActivityLogApi.getAll(filters);
      
      setActivities(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity logs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchActivities();
  }, [filters]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: Filters) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
      limit: filters.limit,
      sortOrder: filters.sortOrder,
    });
  };

  // Handle search
  const handleSearch = () => {
    fetchActivities();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 25,
      sortOrder: 'desc',
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  // Handle page size change
  const handlePageSizeChange = (limit: number) => {
    setFilters({ ...filters, limit, page: 1 });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchActivities();
  };

  return (
    <AuthGuard>
      <PermissionGuard permission="activity-logs:read">
        <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Activity Log"
          description="Monitor and audit all system activities and user actions"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          }
        />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>
              Filter activity logs by action, entity, user, or date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityLogFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              onReset={handleResetFilters}
            />
          </CardContent>
        </Card>

        {/* Activity List */}
        <ActivityLogList
          activities={activities}
          isLoading={isLoading}
          error={error}
        />

        {/* Pagination */}
        {!isLoading && !error && totalItems > 0 && (
          <ActivityLogPagination
            currentPage={filters.page || 1}
            totalPages={totalPages}
            pageSize={filters.limit || 25}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
        </div>
      </PermissionGuard>
    </AuthGuard>
  );
}
