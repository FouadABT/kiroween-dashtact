'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { OrderQueryDto, OrderStatus, Order } from '@/types/ecommerce';
import { OrdersApi } from '@/lib/api';
import { OrdersList } from '@/components/orders/OrdersList';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { EcommerceFeatureGuard } from '@/components/ecommerce/EcommerceFeatureGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Filter, Download, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_FILTERS: OrderQueryDto = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<OrderQueryDto>(DEFAULT_FILTERS);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'E-commerce', href: '/dashboard/ecommerce' },
    { label: 'Orders', href: '/dashboard/ecommerce/orders' },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await OrdersApi.getAll(filters);
        setOrders(response.orders || []);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.search, filters.status, filters.customerId, filters.startDate, filters.endDate]);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await OrdersApi.getAll(filters);
      setOrders(response.orders || []);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const handleFiltersChange = (newFilters: OrderQueryDto) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleViewOrder = (id: string) => {
    router.push(`/dashboard/ecommerce/orders/${id}`);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('Export functionality coming soon');
  };

  const totalPages = Math.ceil(total / (filters.limit || 20));

  return (
    <PermissionGuard permission="orders:read">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Orders"
          description="Manage customer orders and fulfillment"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          }
        />

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders by number, customer name..."
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined, page: 1 })}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Filter Orders</SheetTitle>
                <SheetDescription>
                  Refine your order search with filters
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6">
                <OrderFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <OrdersList
            orders={orders}
            onViewOrder={handleViewOrder}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
                  className={
                    (filters.page || 1) === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === (filters.page || 1)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, (filters.page || 1) + 1))
                  }
                  className={
                    (filters.page || 1) === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </PermissionGuard>
  );
}
