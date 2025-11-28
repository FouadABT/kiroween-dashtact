'use client';

/**
 * Revenue Chart Widget
 * Displays revenue trends over time using a line chart
 */

import { useMemo, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';

export interface RevenueChartProps {
  title?: string;
  period?: string;
  data?: {
    daily?: Array<{ date: string; revenue: number; orders: number }>;
    totalRevenue?: number;
    averageOrderValue?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-foreground mb-1">{formatDate(data.date)}</p>
      <p className="text-lg font-bold text-primary">{formatCurrency(data.revenue)}</p>
      <p className="text-xs text-muted-foreground mt-1">{data.orders} orders</p>
    </div>
  );
};

export function RevenueChart({
  title = 'Revenue Trend',
  period = '30d',
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'orders:read',
}: RevenueChartProps) {
  const { theme, resolvedTheme } = useTheme();
  const [useApi] = useState(!propData);

  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, []);

  const { data: apiData, isLoading: apiLoading, error: apiError } = useQuery({
    queryKey: ['dashboard', 'revenue', dateRange.start, dateRange.end],
    queryFn: () => DashboardApi.getRevenue(dateRange.start, dateRange.end),
    enabled: useApi,
    staleTime: 5 * 60 * 1000,
  });

  const data = propData || apiData;
  const loading = propLoading || (useApi ? apiLoading : false);
  const error = propError || (useApi && apiError ? 'Failed to load data' : undefined);

  const themeColors = useMemo(() => {
    const isDark = resolvedTheme === 'dark' || theme === 'dark';
    return {
      gridColor: 'hsl(var(--border))',
      textColor: 'hsl(var(--muted-foreground))',
      lineColor: 'hsl(var(--primary))',
    };
  }, [resolvedTheme, theme]);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="chart" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={error}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (!data || !data.daily || data.daily.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={TrendingUp} title="No Data" description="No revenue data available" />
      </WidgetContainer>
    );
  }

  const { gridColor, textColor, lineColor } = themeColors;

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(data.totalRevenue || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Order Value</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(data.averageOrderValue || 0)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.daily} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke={textColor} fontSize={12} tickLine={false} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" stroke={lineColor} strokeWidth={2} dot={false} activeDot={{ r: 6, fill: lineColor }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetContainer>
  );
}
