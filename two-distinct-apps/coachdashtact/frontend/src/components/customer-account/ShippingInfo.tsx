'use client';

import { CustomerOrderDetails } from '@/types/storefront';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Truck, Package } from 'lucide-react';

interface ShippingInfoProps {
  order: CustomerOrderDetails;
}

export function ShippingInfo({ order }: ShippingInfoProps) {
  const address = order.shippingAddress as any; // Can be Address or CheckoutAddress

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shipping Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shipping Address */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Delivery Address</p>
            <div className="text-sm text-muted-foreground space-y-0.5">
              {address.firstName && <p>{address.firstName} {address.lastName}</p>}
              <p>{address.addressLine1 || address.street}</p>
              {(address.addressLine2 || address.apartment) && <p>{address.addressLine2 || address.apartment}</p>}
              <p>
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p>{address.country}</p>
              {address.phone && <p>Phone: {address.phone}</p>}
            </div>
          </div>
        </div>

        {/* Shipping Method */}
        {order.shippingMethod && (
          <div className="flex items-start gap-3 pt-4 border-t">
            <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Shipping Method</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingMethod.name}
              </p>
              {order.shippingMethod.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {order.shippingMethod.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tracking Number */}
        {order.trackingNumber && (
          <div className="flex items-start gap-3 pt-4 border-t">
            <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Tracking Number</p>
              <p className="text-sm font-mono text-muted-foreground">
                {order.trackingNumber}
              </p>
            </div>
          </div>
        )}


      </CardContent>
    </Card>
  );
}
