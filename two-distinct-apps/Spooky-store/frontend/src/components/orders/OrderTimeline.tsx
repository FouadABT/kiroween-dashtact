'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatusHistory } from '@/types/ecommerce';
import { OrdersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle2, XCircle, Package, Truck, Home } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface OrderTimelineProps {
  order: Order;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-5 w-5 text-yellow-500" />,
  PROCESSING: <Package className="h-5 w-5 text-blue-500" />,
  SHIPPED: <Truck className="h-5 w-5 text-purple-500" />,
  DELIVERED: <Home className="h-5 w-5 text-green-500" />,
  CANCELLED: <XCircle className="h-5 w-5 text-red-500" />,
  REFUNDED: <CheckCircle2 className="h-5 w-5 text-gray-500" />,
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await OrdersApi.getStatusHistory(order.id);
        setHistory(data);
      } catch (error) {
        toast.error('Failed to load order history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [order.id]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No status history available</p>
        ) : (
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-8 bottom-8 w-0.5 bg-border" />

            {history.map((entry, index) => (
              <div key={entry.id} className="relative flex gap-4">
                {/* Icon */}
                <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-card">
                  {statusIcons[entry.toStatus] || statusIcons.PENDING}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {entry.fromStatus ? (
                          <>
                            {entry.fromStatus} → {entry.toStatus}
                          </>
                        ) : (
                          <>Order {entry.toStatus}</>
                        )}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {entry.toStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>

                  {entry.notes && (
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  )}

                  {entry.userId && (
                    <p className="text-xs text-muted-foreground">
                      Updated by user {entry.userId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
