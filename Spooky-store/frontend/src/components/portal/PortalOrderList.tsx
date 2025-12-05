'use client';

import { Customer, Order } from '@/types/ecommerce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { CustomersApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface PortalOrderListProps {
  customer: Customer;
  onSelectOrder: (order: Order) => void;
}

export function PortalOrderList({ customer, onSelectOrder }: PortalOrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const ordersData = await CustomersApi.getOrderHistory(customer.id);
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [customer.id]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Orders</h2>
        <p className="text-muted-foreground">
          View and track all your orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      {order.trackingNumber && (
                        <Badge variant="outline">
                          Tracking: {order.trackingNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Placed on {format(new Date(order.createdAt), 'PPP')}</p>
                      {order.shippedAt && (
                        <p>Shipped on {format(new Date(order.shippedAt), 'PPP')}</p>
                      )}
                      {order.deliveredAt && (
                        <p>Delivered on {format(new Date(order.deliveredAt), 'PPP')}</p>
                      )}
                      <p className="font-semibold text-foreground text-base mt-2">
                        Total: ${parseFloat(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => onSelectOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
