'use client';

import { useState, useEffect } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { OrdersApi } from '@/lib/api';

export interface RevenueStatsProps {
  title?: string;
  period?: '7d' | '30d' | '90d';
  loading?: boolean;
  error?: string;
  permission?: string;
}

interface RevenueData {
  total: number;
  previousTotal: number;
  orderCount: number;
  averageOrderValue: number;
}

export function RevenueStats({
  title = 'Revenue Overview',
  period = '30d',
  loading: externalLoading = false,
  error: externalError,
  permission = 'orders:read',
}: RevenueStatsProps) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalLoading) {
      setLoading(true);
      return;
    }

    const fetchRevenue = async () => {
      try {
        setLoading(true);
        
        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();
        if (period === '7d') startDate.setDate(endDate.getDate() - 7);
        else if (period === '30d') startDate.setDate(endDate.getDate() - 30);
        else if (period === '90d') startDate.setDate(endDate.getDate() - 90);
        
        // Fetch orders for the period
        const result = await OrdersApi.getAll({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 100, // Max allowed limit
        });
        const orders = Array.isArray(result.orders) ? result.orders : [];
        
        // Calculate revenue metrics
        const total = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total || '0'), 0);
        const orderCount = orders.length;
        const averageOrderValue = orderCount > 0 ? total / orderCount : 0;
        
        // Calculate previous period for comparison
        const prevStartDate = new Date(startDate);
        const prevEndDate = new Date(startDate);
        if (period === '7d') prevStartDate.setDate(prevStartDate.getDate() - 7);
        else if (period === '30d') prevStartDate.setDate(prevStartDate.getDate() - 30);
        else if (period === '90d') prevStartDate.setDate(prevStartDate.getDate() - 90);
        
        const prevResult = await OrdersApi.getAll({
          startDate: prevStartDate.toISOString(),
          endDate: prevEndDate.toISOString(),
          limit: 100, // Max allowed limit
        }).catch(() => ({ orders: [] }));
        const prevOrders = Array.isArray(prevResult.orders) ? prevResult.orders : [];
        const previousTotal = prevOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total || '0'), 0);
        
        setData({
          total,
          previousTotal,
          orderCount,
          averageOrderValue,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load revenue');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [period, externalLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <WidgetContainer title={title} loading>
        <SkeletonLoader variant="card" count={1} />
      </WidgetContainer>
    );
  }

  if (error || externalError) {
    return (
      <WidgetContainer title={title} error={error || externalError}>
        <EmptyState
          icon={DollarSign}
          title="Failed to load revenue"
          description={error || externalError}
        />
      </WidgetContainer>
    );
  }

  if (!data) {
    return (
      <WidgetContainer title={title} permission={permission}>
        <EmptyState
          icon={DollarSign}
          title="No revenue data"
          description="Revenue data will appear once orders are placed"
        />
      </WidgetContainer>
    );
  }

  const change = calculateChange(data.total, data.previousTotal);
  const isPositive = change >= 0;

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-6">
        {/* Main Revenue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(data.total)}</p>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-border rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Orders</p>
            <p className="text-xl font-semibold">{data.orderCount}</p>
          </div>
          <div className="p-3 border border-border rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Avg Order</p>
            <p className="text-xl font-semibold">
              {formatCurrency(data.averageOrderValue)}
            </p>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}
