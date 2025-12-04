'use client';

import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/ecommerce';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Package, CreditCard, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onView: () => void;
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const fulfillmentStatusColors: Record<FulfillmentStatus, string> = {
  UNFULFILLED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PARTIALLY_FULFILLED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  FULFILLED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export function OrderCard({ order, onView }: OrderCardProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Order Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
              <Badge className={statusColors[order.status]}>
                {order.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                <Badge variant="outline" className={paymentStatusColors[order.paymentStatus]}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                <Badge variant="outline" className={fulfillmentStatusColors[order.fulfillmentStatus]}>
                  {order.fulfillmentStatus.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{formatCurrency(order.total)}</div>
              <div className="text-xs text-muted-foreground">
                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
              </div>
            </div>

            <Button onClick={onView} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
