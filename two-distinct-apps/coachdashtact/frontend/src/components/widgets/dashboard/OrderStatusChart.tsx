'use client';

/**
 * Order Status Chart Widget
 * Displays orders by status using a bar chart
 */

import { useMemo, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';

export interface OrderStatusChartProps {
  title?: string;
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

const STATUS_COLORS = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-foreground mb-1">{data.label}</p>
      <p className="text-lg font-bold" style={{ color: data.color }}>{data.count} orders</p>
    </div>
  );
};

export function OrderStatusChart({
  title = 'Orders by Status',
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'orders:read',
}: OrderStatusChartProps) {
  const { resolvedTheme } = useTheme();
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const data = propData || (useContext ? context.stats : undefined);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  const chartData = useMemo(() => {
    if (!data) return null;
    return [
      { status: 'pending', label: STATUS_LABELS.pending, count: data.ordersPending ?? 0, color: STATUS_COLORS.pending },
      { status: 'processing', label: STATUS_LABELS.processing, count: data.ordersProcessing ?? 0, color: STATUS_COLORS.processing },
      { status: 'completed', label: STATUS_LABELS.completed, count: data.ordersCompleted ?? 0, color: STATUS_COLORS.completed },
      { status: 'cancelled', label: STATUS_LABELS.cancelled, count: data.ordersCancelled ?? 0, color: STATUS_COLORS.cancelled },
    ];
  }, [data]);

  const themeColors = useMemo(() => ({
    gridColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
  }), [resolvedTheme]);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="chart" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (!data || data.ordersTotal === undefined || !chartData) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={BarChart3} title="No Data" description="No order data available" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {chartData.map((item) => (
            <div key={item.status} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="text-xl font-bold" style={{ color: item.color }}>{item.count}</p>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} opacity={0.3} />
            <XAxis dataKey="label" stroke={themeColors.textColor} fontSize={12} tickLine={false} />
            <YAxis stroke={themeColors.textColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetContainer>
  );
}
