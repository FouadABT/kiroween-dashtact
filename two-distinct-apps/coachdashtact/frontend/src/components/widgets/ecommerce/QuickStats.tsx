'use client';

import { useState, useEffect } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { OrdersApi, ProductsApi, CustomersApi } from '@/lib/api';

export interface QuickStatsProps {
  title?: string;
  period?: '7d' | '30d' | '90d';
  loading?: boolean;
  error?: string;
  permission?: string;
}

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export function QuickStats({
  title = 'Quick Stats',
  period = '30d',
  loading: externalLoading = false,
  error: externalError,
  permission = 'orders:read',
}: QuickStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalLoading) {
      setLoading(true);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();
        if (period === '7d') startDate.setDate(endDate.getDate() - 7);
        else if (period === '30d') startDate.setDate(endDate.getDate() - 30);
        else if (period === '90d') startDate.setDate(endDate.getDate() - 90);
        
        // Fetch data in parallel (use max allowed limits)
        const [ordersData, productsData, customersData] = await Promise.all([
          OrdersApi.getAll({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 100, // Max allowed for orders
          }).catch(() => ({ orders: [] })),
          ProductsApi.getAll({ status: 'PUBLISHED' as any, limit: 50 }).catch(() => ({ products: [] })),
          CustomersApi.getAll({ limit: 50 }).catch(() => ({ customers: [] })),
        ]);
        
        const orders: Array<{ total: string }> = Array.isArray(ordersData.orders) ? ordersData.orders : [];
        const products: Array<any> = Array.isArray(productsData.products) ? productsData.products : [];
        const customers: Array<any> = Array.isArray(customersData.customers) ? customersData.customers : [];
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum: number, order: { total: string }) => sum + parseFloat(order.total || '0'), 0);
        
        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalCustomers: customers.length,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period, externalLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
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
          title="Failed to load stats"
          description={error || externalError}
        />
      </WidgetContainer>
    );
  }

  if (!stats) {
    return (
      <WidgetContainer title={title} permission={permission}>
        <EmptyState
          icon={DollarSign}
          title="No data available"
          description="Statistics will appear once you have ecommerce data"
        />
      </WidgetContainer>
    );
  }

  const statItems = [
    {
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Orders',
      value: formatNumber(stats.totalOrders),
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Products',
      value: formatNumber(stats.totalProducts),
      icon: Package,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Customers',
      value: formatNumber(stats.totalCustomers),
      icon: Users,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-lg font-bold truncate">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetContainer>
  );
}
