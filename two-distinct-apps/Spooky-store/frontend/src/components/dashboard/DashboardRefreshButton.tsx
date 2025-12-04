'use client';

/**
 * Dashboard Refresh Button Component
 * Provides manual refresh functionality for dashboard data
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { toast } from '@/hooks/use-toast';

/**
 * Dashboard Refresh Button Component
 * Displays a refresh icon button that triggers dashboard data refresh
 */
export function DashboardRefreshButton() {
  const { refresh, loading } = useDashboardData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refresh();
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="outline"
      size="icon"
      disabled={isRefreshing || loading}
      title="Refresh dashboard data"
      aria-label="Refresh dashboard data"
    >
      <RefreshCw 
        className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
      />
    </Button>
  );
}
