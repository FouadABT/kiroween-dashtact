'use client';

import { Order, OrderStatus } from '@/types/ecommerce';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusIndicatorProps {
  order: Order;
}

export function OrderStatusIndicator({ order }: OrderStatusIndicatorProps) {
  const statuses: { key: OrderStatus; label: string }[] = [
    { key: OrderStatus.PENDING, label: 'Order Placed' },
    { key: OrderStatus.PROCESSING, label: 'Processing' },
    { key: OrderStatus.SHIPPED, label: 'Shipped' },
    { key: OrderStatus.DELIVERED, label: 'Delivered' },
  ];

  const statusOrder = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
  const currentIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === OrderStatus.CANCELLED;
  const isRefunded = order.status === OrderStatus.REFUNDED;

  if (isCancelled || isRefunded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-500">
            <XCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">
                Order {isCancelled ? 'Cancelled' : 'Refunded'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isCancelled && order.cancelledAt && `Cancelled on ${new Date(order.cancelledAt).toLocaleDateString()}`}
                {isRefunded && 'Your payment has been refunded'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {statuses.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={status.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'rounded-full p-2',
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-xs mt-2 text-center',
                      isCurrent ? 'font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {status.label}
                  </p>
                </div>
                {index < statuses.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
