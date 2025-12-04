'use client';

/**
 * Recent Orders Table Widget
 * Displays the last 10 orders with status, customer, and total
 */

import { useMemo, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

export interface RecentOrdersTableProps {
  title?: string;
  limit?: number;
  data?: Array<{ id: string; orderId: string; customer: string; status: string; total: number; date: string }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status.toLowerCase()) {
    case 'completed': return 'default';
    case 'processing': return 'secondary';
    case 'pending': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed': return 'text-green-600 dark:text-green-400';
    case 'processing': return 'text-blue-600 dark:text-blue-400';
    case 'pending': return 'text-yellow-600 dark:text-yellow-400';
    case 'cancelled': return 'text-red-600 dark:text-red-400';
    default: return 'text-muted-foreground';
  }
}

export function RecentOrdersTable({
  title = 'Recent Orders',
  limit = 10,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'orders:read',
}: RecentOrdersTableProps) {
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const orders = useMemo(() => {
    if (propData) return propData.slice(0, limit);
    if (!useContext || !context.recentActivity) return [];
    return context.recentActivity
      .filter(activity => activity.type === 'order')
      .map(activity => ({
        id: activity.id,
        orderId: activity.entityId,
        customer: activity.metadata?.customerName || 'Unknown Customer',
        status: activity.metadata?.status || 'pending',
        total: activity.metadata?.total || 0,
        date: activity.timestamp,
      }))
      .slice(0, limit);
  }, [propData, useContext, context.recentActivity, limit]);

  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="table" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (orders.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={ShoppingCart} title="No Orders" description="No recent orders found" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Order ID</TableHead>
              <TableHead className="min-w-[150px]">Customer</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[100px] text-right">Total</TableHead>
              <TableHead className="min-w-[120px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">#{order.orderId.slice(0, 8)}</TableCell>
                <TableCell className="font-medium">{order.customer}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    <span className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(order.total)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(order.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WidgetContainer>
  );
}
