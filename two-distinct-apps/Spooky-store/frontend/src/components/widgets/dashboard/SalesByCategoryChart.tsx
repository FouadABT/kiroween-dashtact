'use client';

/**
 * Sales by Category Chart Widget
 * Displays sales distribution by category using a pie chart
 */

import { useState, useEffect, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { PieChart as PieChartIcon } from 'lucide-react';
import { DashboardApi } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export interface SalesByCategoryChartProps {
  title?: string;
  period?: string;
  data?: {
    byCategory?: Array<{ category: string; revenue: number }>;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

const CATEGORY_COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#06b6d4',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-foreground mb-1">{data.category}</p>
      <p className="text-lg font-bold text-primary">{formatCurrency(data.revenue)}</p>
      <p className="text-xs text-muted-foreground mt-1">{data.percentage}% of total</p>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap gap-3 justify-center mt-4">
    {payload.map((entry: any, index: number) => (
      <div key={`legend-${index}`} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs text-muted-foreground">{entry.value} ({entry.payload.percentage}%)</span>
      </div>
    ))}
  </div>
);

export function SalesByCategoryChart({
  title = 'Sales by Category',
  period = '30d',
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'orders:read',
}: SalesByCategoryChartProps) {
  const [apiData, setApiData] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [useApi] = useState(!propData);

  useEffect(() => {
    if (!useApi) return;
    const fetchData = async () => {
      try {
        setApiLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const data = await DashboardApi.getSales(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
        setApiData(data);
      } catch (err) {
        setApiError('Failed to load data');
      } finally {
        setApiLoading(false);
      }
    };
    fetchData();
  }, [useApi]);

  const data = propData || apiData;
  const loading = propLoading || apiLoading;
  const error = propError || apiError;

  const chartData = useMemo(() => {
    if (!data?.byCategory) return null;
    const totalRevenue = data.byCategory.reduce((sum: number, cat: any) => sum + cat.revenue, 0);
    return data.byCategory.map((cat: any) => ({
      ...cat,
      percentage: ((cat.revenue / totalRevenue) * 100).toFixed(1),
    }));
  }, [data]);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="chart" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={error}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (!chartData || chartData.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={PieChartIcon} title="No Data" description="No sales data available" />
      </WidgetContainer>
    );
  }

  const totalRevenue = chartData.reduce((sum: number, cat: any) => sum + cat.revenue, 0);

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="revenue" label={({ percentage }) => `${percentage}%`}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </WidgetContainer>
  );
}
