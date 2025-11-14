'use client';

import { Cart } from '@/types/ecommerce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface OrderSummaryProps {
  cart: Cart;
  shippingCost?: number;
  taxAmount?: number;
}

export function OrderSummary({ cart, shippingCost = 0, taxAmount = 0 }: OrderSummaryProps) {
  const subtotal = parseFloat(cart.subtotal);
  const total = subtotal + shippingCost + taxAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cart.items.map((item) => {
            const product = item.product;
            const variant = item.productVariant;
            const price = parseFloat(item.priceSnapshot);
            const itemTotal = price * item.quantity;

            return (
              <div key={item.id} className="flex gap-3">
                {/* Product Image */}
                <div className="relative w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                  {(variant?.image || product?.featuredImage) ? (
                    <Image
                      src={variant?.image || product?.featuredImage || ''}
                      alt={product?.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">
                    {product?.name || 'Product'}
                  </h4>
                  {variant && (
                    <p className="text-xs text-muted-foreground truncate">
                      {variant.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-sm font-medium">
                      ${itemTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">
              {taxAmount === 0 ? 'Calculated at checkout' : `$${taxAmount.toFixed(2)}`}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-semibold pt-2">
            <span>Total</span>
            <span className="text-lg">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Item Count */}
        <div className="text-xs text-center text-muted-foreground pt-2">
          {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in cart
        </div>
      </CardContent>
    </Card>
  );
}
