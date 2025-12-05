'use client';

import Link from 'next/link';
import { CustomerOrder } from '@/types/storefront';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';

interface OrderCardProps {
  order: CustomerOrder;
}

export function OrderCard({ order }: OrderCardProps) {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Order Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">
                  Order #{order.orderNumber}
                </h3>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              {order.paymentStatus && (
                <Badge variant="outline" className="text-xs">
                  Payment: {order.paymentStatus}
                </Badge>
              )}
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Items</p>
                <p className="font-medium">
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-lg">
                  ${parseFloat(order.total).toFixed(2)}
                </p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-muted-foreground">Tracking</p>
                  <p className="font-medium text-xs">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Delivery Status */}
            {order.shippedAt && (
              <div className="text-sm text-muted-foreground">
                Shipped on {new Date(order.shippedAt).toLocaleDateString()}
              </div>
            )}
            {order.deliveredAt && (
              <div className="text-sm text-green-600 dark:text-green-400">
                ✓ Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* View Details Button */}
          <Link href={`/account/orders/${order.id}`}>
            <Button variant="outline" size="sm">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
