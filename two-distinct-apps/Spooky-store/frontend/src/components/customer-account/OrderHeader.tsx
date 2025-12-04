'use client';

import Link from 'next/link';
import { CustomerOrderDetails } from '@/types/storefront';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface OrderHeaderProps {
  order: CustomerOrderDetails;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'SHIPPED':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/account/orders">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
          {order.paymentStatus && (
            <Badge variant="outline">
              Payment: {order.paymentStatus}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="font-semibold">${parseFloat(order.subtotal).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Shipping</p>
          <p className="font-semibold">${parseFloat(order.shipping).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tax</p>
          <p className="font-semibold">${parseFloat(order.tax).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-bold text-lg">${parseFloat(order.total).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
