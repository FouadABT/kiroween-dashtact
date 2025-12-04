'use client';

import { CustomerOrderDetails } from '@/types/storefront';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Circle, Package, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  order: CustomerOrderDetails;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const steps = [
    {
      label: 'Order Placed',
      status: 'PENDING',
      icon: Package,
      date: order.createdAt,
      completed: true,
    },
    {
      label: 'Processing',
      status: 'PROCESSING',
      icon: Circle,
      date: order.statusHistory?.find(h => h.toStatus === 'PROCESSING')?.createdAt,
      completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status.toUpperCase()),
    },
    {
      label: 'Shipped',
      status: 'SHIPPED',
      icon: Truck,
      date: order.shippedAt,
      completed: ['SHIPPED', 'DELIVERED'].includes(order.status.toUpperCase()),
    },
    {
      label: 'Delivered',
      status: 'DELIVERED',
      icon: Home,
      date: order.deliveredAt,
      completed: order.status.toUpperCase() === 'DELIVERED',
    },
  ];

  const currentStepIndex = steps.findIndex(step => 
    step.status === order.status.toUpperCase()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = step.completed;
            const isCancelled = order.status.toUpperCase() === 'CANCELLED';

            return (
              <div key={step.status} className="flex gap-4">
                {/* Icon */}
                <div className="relative">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2',
                      isCompleted && !isCancelled
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    {isCompleted && !isCancelled ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-1/2 top-10 w-0.5 h-6 -translate-x-1/2',
                        isCompleted && !isCancelled
                          ? 'bg-green-500'
                          : 'bg-muted-foreground/20'
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <h4
                    className={cn(
                      'font-medium',
                      isActive && 'text-primary',
                      isCompleted && !isCancelled && 'text-green-600 dark:text-green-400'
                    )}
                  >
                    {step.label}
                  </h4>
                  {step.date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(step.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {order.status.toUpperCase() === 'CANCELLED' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                Order Cancelled
              </p>
              {order.internalNotes && (
                <p className="text-sm text-muted-foreground mt-1">
                  {order.internalNotes}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
