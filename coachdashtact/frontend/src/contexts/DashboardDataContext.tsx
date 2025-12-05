'use client';

/**
 * Dashboard Data Context and Provider
 * Manages dashboard data fetching, caching, and sharing across widgets
 * Optimized with React Query for caching and automatic refetching
 */

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DashboardStats,
  Activity,
  Alert,
  DateRange,
} from '@/types/dashboard';
import { DashboardApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Dashboard Data Context Value Interface
 */
interface DashboardDataContextValue {
  // State
  stats: DashboardStats | null;
  recentActivity: Activity[];
  alerts: Alert[];
  loading: boolean;
  error: Error | null;
  
  // Methods
  refresh: () => Promise<void>;
}

/**
 * Dashboard Data Context
 */
const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined);

/**
 * Dashboard Data Provider Props
 */
interface DashboardDataProviderProps {
  children: ReactNode;
  dateRange?: DateRange;
}

/**
 * Dashboard Data Provider Component
 * Provides dashboard data context to all child components
 * Uses React Query for automatic caching and refetching
 */
export function DashboardDataProvider({ 
  children, 
  dateRange 
}: DashboardDataProviderProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query for dashboard stats with 5-minute stale time
  const {
    data: stats = null,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => DashboardApi.getStats(),
    enabled: isAuthenticated && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
  });

  // Query for recent activity with 5-minute stale time
  const {
    data: recentActivity = [],
    isLoading: activityLoading,
    error: activityError,
  } = useQuery({
    queryKey: ['dashboard', 'activity', 10],
    queryFn: () => DashboardApi.getRecentActivity(10),
    enabled: isAuthenticated && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Query for alerts with 5-minute stale time
  const {
    data: alerts = [],
    isLoading: alertsLoading,
    error: alertsError,
  } = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => DashboardApi.getAlerts(),
    enabled: isAuthenticated && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Combine loading states
  const loading = statsLoading || activityLoading || alertsLoading;

  // Combine errors (prioritize stats error)
  const error = statsError || activityError || alertsError || null;

  /**
   * Refresh all dashboard data manually
   * Invalidates all dashboard queries to force refetch
   */
  const refresh = useMemo(
    () => async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    [queryClient]
  );

  // Memoize context value to prevent unnecessary re-renders
  const value: DashboardDataContextValue = useMemo(
    () => ({
      stats,
      recentActivity,
      alerts,
      loading,
      error: error as Error | null,
      refresh,
    }),
    [stats, recentActivity, alerts, loading, error, refresh]
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

/**
 * Hook to use Dashboard Data Context
 * Must be used within DashboardDataProvider
 */
export function useDashboardData(): DashboardDataContextValue {
  const context = useContext(DashboardDataContext);
  
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  
  return context;
}
