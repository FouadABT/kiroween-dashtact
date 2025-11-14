'use client';

import { Order } from '@/types/ecommerce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, CreditCard, Truck } from 'lucide-react';

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return `${address.street}${address.apartment ? `, ${address.apartment}` : ''}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
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
                  <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
              </div>
            ))}

            <Separator />

            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {parseFloat(order.tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}
              {parseFloat(order.shipping) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
              )}
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            {order.customerPhone && (
              <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            )}
          </div>

          {order.customerNotes && (
            <div>
              <p className="text-sm font-medium mb-1">Customer Notes</p>
              <p className="text-sm text-muted-foreground">{order.customerNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping & Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatAddress(order.shippingAddress)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatAddress(order.billingAddress)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Information */}
      {(order.shippingMethod || order.trackingNumber) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.shippingMethod && (
              <div>
                <p className="text-sm font-medium">Shipping Method</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingMethod.name}
                </p>
              </div>
            )}
            {order.trackingNumber && (
              <div>
                <p className="text-sm font-medium">Tracking Number</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {order.trackingNumber}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
