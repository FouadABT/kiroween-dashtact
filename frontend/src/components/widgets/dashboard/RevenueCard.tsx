'use client';

/**
 * Revenue Card Widget
 * Displays revenue metrics for Admin and Manager roles
 * - Revenue today with formatted currency
 * - Percentage change from yesterday with trend arrow
 * - Revenue this month as secondary metric
 */

import { useMemo, useEffect, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
} from 'lucide-react';

export interface RevenueCardProps {
  title?: string;
  showTrend?: boolean;
  data?: {
    revenueToday?: number;
    revenueThisMonth?: number;
    revenueChange?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage change
 */
function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get trend color based on change value
 */
function getTrendColor(change: number): string {
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

/**
 * Get badge variant based on change value
 */
function getBadgeVariant(change: number): 'default' | 'secondary' | 'destructive' {
  if (change > 0) return 'default';
  if (change < 0) return 'destructive';
  return 'secondary';
}

export function RevenueCard({
  title = 'Revenue',
  showTrend = true,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'orders:read',
}: RevenueCardProps) {
  // Use context data if no props provided (backward compatibility)
  const context = useDashboardData();
  const [useContext] = useState(!propData);
  
  const data = propData || (useContext ? context.stats : undefined);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  // Memoize formatted values
  const formattedValues = useMemo(() => {
    if (!data) return null;

    const revenueToday = data.revenueToday ?? 0;
    const revenueThisMonth = data.revenueThisMonth ?? 0;
    const revenueChange = data.revenueChange ?? 0;

    return {
      revenueToday,
      revenueThisMonth,
      revenueChange,
      formattedToday: formatCurrency(revenueToday),
      formattedMonth: formatCurrency(revenueThisMonth),
      formattedChange: formatPercentage(revenueChange),
      trendColor: getTrendColor(revenueChange),
      badgeVariant: getBadgeVariant(revenueChange),
      badgeText: revenueChange > 0 ? 'Up' : revenueChange < 0 ? 'Down' : 'Stable',
    };
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <WidgetContainer title={title} loading>
        <SkeletonLoader variant="card" />
      </WidgetContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}>
        <EmptyState title="Error" description="Unable to load revenue data" />
      </WidgetContainer>
    );
  }

  // Empty state
  if (!data || data.revenueToday === undefined || !formattedValues) {
    return (
      <WidgetContainer title={title}>
        <EmptyState title="No Data" description="Revenue data not available" />
      </WidgetContainer>
    );
  }

  const { 
    revenueChange, 
    formattedToday, 
    formattedMonth, 
    formattedChange, 
    trendColor, 
    badgeVariant, 
    badgeText 
  } = formattedValues;

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        {/* Revenue Today */}
        <div className="flex flex-row items-center justify-between space-y-0">
          <div className="flex-1">
            <div className="text-3xl font-bold text-foreground">
              {formattedToday}
            </div>
            {showTrend && revenueChange !== 0 && (
              <div className="flex items-center gap-2 mt-2">
                {revenueChange > 0 ? (
                  <TrendingUp className={`h-4 w-4 ${trendColor}`} />
                ) : (
                  <TrendingDown className={`h-4 w-4 ${trendColor}`} />
                )}
                <span className={`text-sm font-medium ${trendColor}`}>
                  {formattedChange}
                </span>
                <span className="text-xs text-muted-foreground">
                  vs yesterday
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            {showTrend && (
              <Badge variant={badgeVariant}>
                {badgeText}
              </Badge>
            )}
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              This Month
            </span>
            <span className="text-lg font-semibold text-foreground">
              {formattedMonth}
            </span>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}
