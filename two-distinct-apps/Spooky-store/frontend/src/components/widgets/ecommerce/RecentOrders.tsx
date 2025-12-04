'use client';

import { useState, useEffect } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Order, OrderStatus } from '@/types/ecommerce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Eye, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { OrdersApi } from '@/lib/api';

export interface RecentOrdersProps {
  title?: string;
  limit?: number;
  loading?: boolean;
  error?: string;
  permission?: string;
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  SHIPPED: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  DELIVERED: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  REFUNDED: 'bg-muted text-muted-foreground border-border',
};

export function RecentOrders({
  title = 'Recent Orders',
  limit = 5,
  loading: externalLoading = false,
  error: externalError,
  permission = 'orders:read',
}: RecentOrdersProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalLoading) {
      setLoading(true);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await OrdersApi.getAll({
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [limit, externalLoading]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, HH:mm');
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/dashboard/ecommerce/orders/${orderId}`);
  };

  const handleViewAll = () => {
    router.push('/dashboard/ecommerce/orders');
  };

  if (loading) {
    return (
      <WidgetContainer title={title} loading>
        <SkeletonLoader variant="table" count={limit} />
      </WidgetContainer>
    );
  }

  if (error || externalError) {
    return (
      <WidgetContainer title={title} error={error || externalError}>
        <EmptyState
          icon={Package}
          title="Failed to load orders"
          description={error || externalError}
        />
      </WidgetContainer>
    );
  }

  const safeOrders = Array.isArray(orders) ? orders : [];

  if (safeOrders.length === 0) {
    return (
      <WidgetContainer title={title} permission={permission}>
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Orders will appear here once customers start placing them"
        />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer
      title={title}
      permission={permission}
      actions={
        <Button variant="ghost" size="sm" onClick={handleViewAll}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-3">
        {safeOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">#{order.orderNumber}</p>
                <Badge className={statusColors[order.status]} variant="secondary">
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {order.customerName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(order.total)}</p>
                <p className="text-xs text-muted-foreground">
                  {order.items?.length || 0} items
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewOrder(order.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
