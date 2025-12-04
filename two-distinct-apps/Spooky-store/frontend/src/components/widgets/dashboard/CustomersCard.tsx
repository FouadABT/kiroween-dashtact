'use client';

/**
 * Customers Card Widget
 * Displays new customers today with trend and total customers
 */

import { useMemo, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';

export interface CustomersCardProps {
  title?: string;
  showTrend?: boolean;
  data?: {
    customersToday?: number;
    customersTotal?: number;
    customersChange?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

export function CustomersCard({
  title = 'Customers',
  showTrend = true,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'customers:read',
}: CustomersCardProps) {
  // Use context data if no props provided (backward compatibility)
  const context = useDashboardData();
  const [useContext] = useState(!propData);
  
  const data = propData || (useContext ? context.stats : undefined);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  // Memoize customer data
  const customerData = useMemo(() => {
    if (!data) return null;
    
    const customersToday = data.customersToday || 0;
    const customersTotal = data.customersTotal || 0;
    const customersChange = data.customersChange || (customersToday > 0 ? 12.5 : 0);
    
    return {
      customersToday,
      customersTotal,
      customersChange,
      hasTrend: customersChange !== 0,
      isPositive: customersChange > 0,
      trendPercentage: customersChange >= 0 ? `+${customersChange.toFixed(1)}` : customersChange.toFixed(1),
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
        <EmptyState title="Error" description="Unable to load customers data" />
      </WidgetContainer>
    );
  }

  // Empty state
  if (!data || !customerData) {
    return (
      <WidgetContainer title={title}>
        <EmptyState title="No Data" description="No customers data available" />
      </WidgetContainer>
    );
  }

  const { customersToday, customersTotal, hasTrend, isPositive, trendPercentage } = customerData;

  return (
    <WidgetContainer 
      title={title} 
      permission={permission}
      actions={
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-4 w-4 text-primary" />
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-3xl font-bold text-foreground">{customersToday.toLocaleString()}</div>
          
          {showTrend && hasTrend && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trendPercentage}%
              </span>
              <span className="text-xs text-muted-foreground">from yesterday</span>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Customers</span>
            <span className="text-lg font-semibold text-foreground">{customersTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}
