'use client';

import { Order } from '@/types/ecommerce';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface CustomerOrderHistoryProps {
  orders: Order[];
}

export function CustomerOrderHistory({ orders }: CustomerOrderHistoryProps) {
  const router = useRouter();

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No orders found</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{order.orderNumber}</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge variant="outline">{order.paymentStatus}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Placed on {format(new Date(order.createdAt), 'PPP')}</p>
                  <p className="font-semibold text-foreground mt-1">
                    Total: ${parseFloat(order.total).toFixed(2)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/ecommerce/orders/${order.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
