'use client';

import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, Lock } from 'lucide-react';

interface PlaceOrderButtonProps {
  onPlaceOrder: () => void;
  isSubmitting: boolean;
}

export function PlaceOrderButton({ onPlaceOrder, isSubmitting }: PlaceOrderButtonProps) {
  return (
    <div className="space-y-3">
      <Button
        onClick={onPlaceOrder}
        disabled={isSubmitting}
        size="lg"
        className="w-full h-12 text-base"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Order...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Place Order
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>Secure checkout</span>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        By placing your order, you agree to our terms and conditions
      </p>
    </div>
  );
}
