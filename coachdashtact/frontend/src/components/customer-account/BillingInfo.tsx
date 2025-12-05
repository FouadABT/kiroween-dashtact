'use client';

import { CustomerOrderDetails } from '@/types/storefront';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, MapPin } from 'lucide-react';

interface BillingInfoProps {
  order: CustomerOrderDetails;
}

export function BillingInfo({ order }: BillingInfoProps) {
  const address = order.billingAddress as any; // Can be Address or CheckoutAddress

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Billing Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Method */}
        {order.paymentMethod && (
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Payment Method</p>
              <p className="text-sm text-muted-foreground">
                {order.paymentMethod.name}
              </p>
              {order.paymentMethod.type === 'COD' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pay with cash when your order is delivered
                </p>
              )}
            </div>
          </div>
        )}

        {/* Billing Address */}
        <div className="flex items-start gap-3 pt-4 border-t">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Billing Address</p>
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

        {/* Payment Status */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-1">Payment Status</p>
          <p className="text-sm text-muted-foreground">
            {order.paymentStatus}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
