'use client';

import { useState, useEffect } from 'react';
import { OrdersApi, ProductsApi, InventoryApi } from '@/lib/api';
import { Order, Product, Inventory, OrderStatus } from '@/types/ecommerce';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { EcommerceFeatureGuard } from '@/components/ecommerce/EcommerceFeatureGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  topProducts: Array<{ product: Product; orderCount: number }>;
  ordersByStatus: Record<OrderStatus, number>;
  lowStockCount: number;
}

export default function EcommerceDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));

        // Fetch orders (use pagination limit)
        const ordersResponse = await OrdersApi.getAll({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 100, // Use max allowed limit
        });

        // Backend returns { orders: [], total, page, limit, totalPages }
        const orders = ordersResponse.orders || [];

        console.log('Orders fetched:', orders.length);
        console.log('Sample order:', orders[0]);

        // Calculate revenue
        const totalRevenue = orders.reduce(
          (sum, order) => {
            const orderTotal = typeof order.total === 'string' 
              ? parseFloat(order.total) 
              : Number(order.total);
            return sum + (isNaN(orderTotal) ? 0 : orderTotal);
          },
          0
        );

        // Calculate average order value
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        // Count orders by status
        const ordersByStatus = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<OrderStatus, number>);

        // Get top products (simplified - in production, this would be a backend endpoint)
        const productCounts = new Map<string, number>();
        orders.forEach((order) => {
          order.items?.forEach((item) => {
            productCounts.set(
              item.productId,
              (productCounts.get(item.productId) || 0) + item.quantity
            );
          });
        });

        // Fetch low stock items
        const lowStockItems = await InventoryApi.getLowStockItems();

        setStats({
          totalRevenue,
          orderCount: orders.length,
          averageOrderValue,
          topProducts: [], // Would need backend support for full product details
          ordersByStatus,
          lowStockCount: lowStockItems.length,
        });
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-500';
      case 'SHIPPED':
        return 'bg-purple-500/10 text-purple-500';
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-500';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500';
      case 'REFUNDED':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <EcommerceFeatureGuard>
        <PermissionGuard permission="orders:read">
          <div className="space-y-6">
            <Skeleton className="h-20" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </PermissionGuard>
      </EcommerceFeatureGuard>
    );
  }

  return (
    <EcommerceFeatureGuard>
      <PermissionGuard permission="orders:read">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="E-Commerce Dashboard"
          description="Overview of your e-commerce performance"
          breadcrumbProps={{
            customItems: [
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'E-Commerce', href: '/dashboard/ecommerce' },
            ],
          }}
          actions={
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${stats?.totalRevenue.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats?.orderCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    ${stats?.averageOrderValue.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">{stats?.lowStockCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => (
                <div key={status} className="space-y-2">
                  <Badge className={getStatusColor(status as OrderStatus)}>
                    {status}
                  </Badge>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.orderCount
                      ? ((count / stats.orderCount) * 100).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => router.push('/dashboard/ecommerce/products')}
              >
                <Package className="h-6 w-6 mb-2" />
                <span className="font-semibold">Manage Products</span>
                <span className="text-xs text-muted-foreground">
                  View and edit products
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => router.push('/dashboard/ecommerce/orders')}
              >
                <ShoppingCart className="h-6 w-6 mb-2" />
                <span className="font-semibold">View Orders</span>
                <span className="text-xs text-muted-foreground">
                  Process and track orders
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => router.push('/dashboard/ecommerce/customers')}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="font-semibold">Manage Customers</span>
                <span className="text-xs text-muted-foreground">
                  View customer database
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => router.push('/dashboard/ecommerce/inventory')}
              >
                <AlertTriangle className="h-6 w-6 mb-2" />
                <span className="font-semibold">Check Inventory</span>
                <span className="text-xs text-muted-foreground">
                  {stats?.lowStockCount || 0} items need attention
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
    </EcommerceFeatureGuard>
  );
}
