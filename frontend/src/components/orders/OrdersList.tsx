'use client';

import { useState } from 'react';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/ecommerce';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Package, 
  CreditCard, 
  Truck, 
  Calendar,
  User,
  MapPin,
  Grid3x3,
  List,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OrdersListProps {
  orders: Order[];
  onViewOrder: (id: string) => void;
}

type ViewMode = 'card' | 'list';

const statusConfig: Record<OrderStatus, { color: string; icon: typeof Package }> = {
  PENDING: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Package },
  PROCESSING: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Package },
  SHIPPED: { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Truck },
  DELIVERED: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: Package },
  CANCELLED: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: Package },
  REFUNDED: { color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: Package },
};

const paymentStatusConfig: Record<PaymentStatus, { color: string }> = {
  PENDING: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' },
  PAID: { color: 'bg-green-500/10 text-green-700 border-green-500/20' },
  FAILED: { color: 'bg-red-500/10 text-red-700 border-red-500/20' },
  REFUNDED: { color: 'bg-gray-500/10 text-gray-700 border-gray-500/20' },
};

const fulfillmentStatusConfig: Record<FulfillmentStatus, { color: string }> = {
  UNFULFILLED: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/20' },
  PARTIALLY_FULFILLED: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  FULFILLED: { color: 'bg-green-500/10 text-green-700 border-green-500/20' },
};

export function OrdersList({ orders, onViewOrder }: OrdersListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm');
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border bg-muted p-1">
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('card')}
            className="gap-2"
          >
            <Grid3x3 className="h-4 w-4" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card 
                key={order.id} 
                className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer"
                onClick={() => onViewOrder(order.id)}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                        <Badge 
                          variant="outline" 
                          className={cn("border", statusInfo.color)}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(order.createdAt)}</span>
                        <span className="text-xs">at {formatTime(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(order.total)}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs border", paymentStatusConfig[order.paymentStatus].color)}
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      {order.paymentStatus}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs border", fulfillmentStatusConfig[order.fulfillmentStatus].color)}
                    >
                      <Truck className="h-3 w-3 mr-1" />
                      {order.fulfillmentStatus.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* View Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrder(order.id);
                    }}
                  >
                    View Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card 
                key={order.id}
                className="group hover:shadow-md transition-all duration-200 hover:border-primary/50 cursor-pointer"
                onClick={() => onViewOrder(order.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Order Number & Status */}
                    <div className="flex-shrink-0 w-32">
                      <div className="font-semibold">#{order.orderNumber}</div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs border mt-1", statusInfo.color)}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.status}
                      </Badge>
                    </div>

                    {/* Customer */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </div>
                    </div>

                    {/* Payment & Fulfillment */}
                    <div className="hidden md:flex gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs border", paymentStatusConfig[order.paymentStatus].color)}
                      >
                        {order.paymentStatus}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs border", fulfillmentStatusConfig[order.fulfillmentStatus].color)}
                      >
                        {order.fulfillmentStatus.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Date */}
                    <div className="hidden lg:block text-sm text-muted-foreground w-32">
                      {formatDate(order.createdAt)}
                    </div>

                    {/* Total */}
                    <div className="text-right w-28">
                      <div className="font-bold">{formatCurrency(order.total)}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.items?.length || 0} items
                      </div>
                    </div>

                    {/* Action */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
