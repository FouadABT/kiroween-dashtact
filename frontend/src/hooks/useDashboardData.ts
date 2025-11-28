/**
 * useDashboardData Hook
 * 
 * Custom hook to consume Dashboard Data Context
 * Provides access to dashboard stats, activity, alerts, and refresh functionality
 */

import { useDashboardData as useDashboardDataContext } from '@/contexts/DashboardDataContext';

/**
 * Hook to access dashboard data
 * 
 * @returns Dashboard data context value with stats, activity, alerts, loading, error, and refresh
 * @throws Error if used outside DashboardDataProvider
 * 
 * @example
 * ```tsx
 * function MyWidget() {
 *   const { stats, loading, error, refresh } = useDashboardData();
 *   
 *   if (loading) return <Skeleton />;
 *   if (error) return <Error message={error.message} />;
 *   
 *   return <div>{stats?.revenueToday}</div>;
 * }
 * ```
 */
export function useDashboardData() {
  return useDashboardDataContext();
}
