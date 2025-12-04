'use client';

import { Order } from '@/types/ecommerce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { OrderStatusIndicator } from './OrderStatusIndicator';
import { TrackingInfo } from './TrackingInfo';

interface PortalOrderDetailsProps {
  order: Order;
  onBack: () => void;
}

export function PortalOrderDetails({ order, onBack }: PortalOrderDetailsProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Placed on {format(new Date(order.createdAt), 'PPP')}
          </p>
        </div>
      </div>

      {/* Order Status Timeline */}
      <OrderStatusIndicator order={order} />

      {/* Tracking Information */}
      {order.trackingNumber && (
        <TrackingInfo
          trackingNumber={order.trackingNumber}
          status={order.status}
          shippedAt={order.shippedAt}
          deliveredAt={order.deliveredAt}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">{item.variantName}</p>
                    )}
                    {item.sku && (
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${parseFloat(item.unitPrice).toFixed(2)} × {item.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${parseFloat(item.totalPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.customerName}</p>
              {order.shippingAddress.apartment && (
                <p>{order.shippingAddress.apartment}</p>
              )}
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${parseFloat(order.shipping).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${parseFloat(order.tax).toFixed(2)}</span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${parseFloat(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>${parseFloat(order.total).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Notes */}
      {order.customerNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{order.customerNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
