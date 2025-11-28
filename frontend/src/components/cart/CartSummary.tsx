'use client';

import { Cart } from '@/types/ecommerce';
import { Separator } from '@/components/ui/separator';

interface CartSummaryProps {
  cart: Cart;
}

export function CartSummary({ cart }: CartSummaryProps) {
  // Calculate subtotal from cart items
  const subtotal = cart.items.reduce((total, item) => {
    return total + parseFloat(item.priceSnapshot) * item.quantity;
  }, 0);

  // Estimated tax (10% for demo - would be calculated by backend in real app)
  const estimatedTax = subtotal * 0.1;

  // Estimated shipping (flat rate for demo - would be calculated by backend)
  const estimatedShipping = subtotal > 50 ? 0 : 5.99;

  // Total
  const total = subtotal + estimatedTax + estimatedShipping;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        {/* Estimated Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated Tax</span>
          <span className="font-medium text-foreground">${estimatedTax.toFixed(2)}</span>
        </div>

        {/* Estimated Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated Shipping</span>
          <span className="font-medium">
            {estimatedShipping === 0 ? (
              <span className="text-green-600 dark:text-green-400">FREE</span>
            ) : (
              <span className="text-foreground">${estimatedShipping.toFixed(2)}</span>
            )}
          </span>
        </div>

        {/* Free Shipping Notice */}
        {subtotal < 50 && (
          <div className="text-xs text-muted-foreground bg-muted border border-border p-2 rounded">
            Add ${(50 - subtotal).toFixed(2)} more for free shipping!
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold text-foreground">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Tax Notice */}
      <p className="text-xs text-muted-foreground mt-4">
        Tax and shipping calculated at checkout
      </p>
    </div>
  );
}
