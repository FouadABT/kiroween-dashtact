'use client';

/**
 * Orders Card Widget
 * Displays order counts by status with color-coded badges
 */

import { useMemo, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { ShoppingCart } from 'lucide-react';

export interface OrdersCardProps {
  title?: string;
  showBreakdown?: boolean;
  data?: {
    ordersTotal?: number;
    ordersPending?: number;
    ordersProcessing?: number;
    ordersCompleted?: number;
    ordersCancelled?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

export function OrdersCard({
  title = 'Orders',
  showBreakdown = true,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'orders:read',
}: OrdersCardProps) {
  // Use context data if no props provided (backward compatibility)
  const context = useDashboardData();
  const [useContext] = useState(!propData);
  
  const data = propData || (useContext ? context.stats : undefined);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  // Memoize order counts
  const orderCounts = useMemo(() => {
    if (!data) return null;
    
    return {
      total: data.ordersTotal || 0,
      pending: data.ordersPending || 0,
      processing: data.ordersProcessing || 0,
      completed: data.ordersCompleted || 0,
      cancelled: data.ordersCancelled || 0,
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
        <EmptyState title="Error" description="Unable to load orders data" />
      </WidgetContainer>
    );
  }

  // Empty state
  if (!data || !orderCounts) {
    return (
      <WidgetContainer title={title}>
        <EmptyState title="No Data" description="No orders data available" />
      </WidgetContainer>
    );
  }

  const { total, pending, processing, completed, cancelled } = orderCounts;

  return (
    <WidgetContainer 
      title={title} 
      permission={permission}
      actions={
        <div className="p-2 rounded-lg bg-primary/10">
          <ShoppingCart className="h-4 w-4 text-primary" />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-3xl font-bold text-foreground">{total.toLocaleString()}</div>
        
        {showBreakdown && (
          <div className="grid grid-cols-2 gap-2">
            {/* Pending */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50 border border-border">
              <Badge variant="outline" className="mb-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                Pending
              </Badge>
              <span className="text-lg font-semibold">{pending}</span>
            </div>

            {/* Processing */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50 border border-border">
              <Badge variant="outline" className="mb-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                Processing
              </Badge>
              <span className="text-lg font-semibold">{processing}</span>
            </div>

            {/* Completed */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50 border border-border">
              <Badge variant="outline" className="mb-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                Completed
              </Badge>
              <span className="text-lg font-semibold">{completed}</span>
            </div>

            {/* Cancelled */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50 border border-border">
              <Badge variant="outline" className="mb-1 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                Cancelled
              </Badge>
              <span className="text-lg font-semibold">{cancelled}</span>
            </div>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
