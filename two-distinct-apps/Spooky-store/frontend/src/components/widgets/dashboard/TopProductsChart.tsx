'use client';

/**
 * Top Products Chart Widget
 * Displays top 10 products using a horizontal bar chart
 */

import { useState, useEffect, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { TrendingUp } from 'lucide-react';
import { DashboardApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';

export interface TopProductsChartProps {
  title?: string;
  limit?: number;
  data?: {
    topProducts?: Array<{ name: string; sku: string; quantitySold: number; revenue: number }>;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

const PRODUCT_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--primary) / 0.9)', 'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.7)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.5)',
  'hsl(var(--primary) / 0.4)', 'hsl(var(--primary) / 0.3)', 'hsl(var(--primary) / 0.2)', 'hsl(var(--primary) / 0.1)',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

function truncateName(name: string, maxLength: number = 25): string {
  return name.length <= maxLength ? name : name.substring(0, maxLength) + '...';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs">
      <p className="text-sm font-medium text-foreground mb-2">{data.name}</p>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Quantity: <span className="font-semibold text-foreground">{data.quantitySold}</span></p>
        <p className="text-xs text-muted-foreground">Revenue: <span className="font-semibold text-primary">{formatCurrency(data.revenue)}</span></p>
        <p className="text-xs text-muted-foreground">SKU: <span className="font-mono text-foreground">{data.sku}</span></p>
      </div>
    </div>
  );
};

export function TopProductsChart({
  title = 'Top Products',
  limit = 10,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'products:read',
}: TopProductsChartProps) {
  const { resolvedTheme } = useTheme();
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
    if (!data?.topProducts) return null;
    return data.topProducts.slice(0, limit).map((p: any) => ({ ...p, displayName: truncateName(p.name, 25) })).reverse();
  }, [data, limit]);

  const themeColors = useMemo(() => ({
    gridColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
  }), [resolvedTheme]);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="chart" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={error}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (!chartData || chartData.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={TrendingUp} title="No Data" description="No product sales data available" />
      </WidgetContainer>
    );
  }

  const totalQuantity = data.topProducts.reduce((sum: number, p: any) => sum + p.quantitySold, 0);
  const totalRevenue = data.topProducts.reduce((sum: number, p: any) => sum + p.revenue, 0);

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Units Sold</p>
            <p className="text-xl font-bold text-foreground">{totalQuantity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} opacity={0.3} horizontal={true} vertical={false} />
            <XAxis type="number" stroke={themeColors.textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="displayName" stroke={themeColors.textColor} fontSize={11} tickLine={false} axisLine={false} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="quantitySold" radius={[0, 4, 4, 0]}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetContainer>
  );
}
