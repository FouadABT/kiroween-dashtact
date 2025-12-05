'use client';

import Link from 'next/link';
import { CustomerOrder } from '@/types/storefront';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/button';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

interface OrderListProps {
  orders: CustomerOrder[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OrderList({
  orders,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: OrderListProps) {
  if (orders.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-6">
          Start shopping to see your orders here
        </p>
        <Link href="/shop">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className="min-w-[40px]"
              >
                {p}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
