'use client';

import { useState, useEffect } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { OrderStatus } from '@/types/ecommerce';
import { PieChart } from 'lucide-react';
import { OrdersApi } from '@/lib/api';

export interface OrderStatusChartProps {
  title?: string;
  period?: '7d' | '30d' | '90d';
  loading?: boolean;
  error?: string;
  permission?: string;
}

interface StatusCount {
  status: OrderStatus;
  count: number;
  percentage: number;
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-blue-500',
  SHIPPED: 'bg-purple-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  REFUNDED: 'bg-gray-500',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export function OrderStatusChart({
  title = 'Order Status Distribution',
  period = '30d',
  loading: externalLoading = false,
  error: externalError,
  permission = 'orders:read',
}: OrderStatusChartProps) {
  const [data, setData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalLoading) {
      setLoading(true);
      return;
    }

    const fetchStatusData = async () => {
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
          limit: 1000,
        });
        const orders: Array<{ status: string }> = Array.isArray(result.orders) ? result.orders : [];
        
        // Count orders by status
        const statusCounts: Record<OrderStatus, number> = {
          PENDING: 0,
          PROCESSING: 0,
          SHIPPED: 0,
          DELIVERED: 0,
          CANCELLED: 0,
          REFUNDED: 0,
        };
        
        orders.forEach((order: { status: string }) => {
          if (order.status in statusCounts) {
            statusCounts[order.status as OrderStatus]++;
          }
        });
        
        const total = orders.length;
        
        // Convert to array with percentages
        const statusData: StatusCount[] = Object.entries(statusCounts)
          .filter(([_, count]) => count > 0)
          .map(([status, count]) => ({
            status: status as OrderStatus,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          }));
        
        setData(statusData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load status data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, [period, externalLoading]);

  if (loading) {
    return (
      <WidgetContainer title={title} loading>
        <SkeletonLoader variant="chart" />
      </WidgetContainer>
    );
  }

  if (error || externalError) {
    return (
      <WidgetContainer title={title} error={error || externalError}>
        <EmptyState
          icon={PieChart}
          title="Failed to load status data"
          description={error || externalError}
        />
      </WidgetContainer>
    );
  }

  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <WidgetContainer title={title} permission={permission}>
        <EmptyState
          icon={PieChart}
          title="No order data"
          description="Order status distribution will appear once orders are placed"
        />
      </WidgetContainer>
    );
  }

  const totalOrders = safeData.reduce((sum, item) => sum + item.count, 0);

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        {/* Total Orders */}
        <div className="text-center pb-4 border-b border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-3">
          {safeData.map((item) => (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors[item.status]}`} />
                  <span className="font-medium">{statusLabels[item.status]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.count}</span>
                  <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${statusColors[item.status]} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetContainer>
  );
}
