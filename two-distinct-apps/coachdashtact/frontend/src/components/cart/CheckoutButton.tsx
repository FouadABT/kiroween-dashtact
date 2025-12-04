'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CartApi } from '@/lib/api';
import { Loader2, ShoppingBag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutButtonProps {
  sessionId?: string;
  userId?: string;
  itemCount: number;
  onCheckout: () => void;
  className?: string;
}

export function CheckoutButton({
  sessionId,
  userId,
  itemCount,
  onCheckout,
  className,
}: CheckoutButtonProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate inventory before proceeding to checkout
      const validation = await CartApi.validateCart(sessionId, userId);

      if (!validation.valid) {
        // Show validation errors
        if (validation.errors && validation.errors.length > 0) {
          const errorMessages = validation.errors.map((err) => {
            if (err.availableQuantity !== undefined) {
              return `${err.productName}: Only ${err.availableQuantity} available`;
            }
            return `${err.productName}: ${err.error}`;
          });
          setValidationError(errorMessages.join(', '));
        } else {
          setValidationError('Some items in your cart are no longer available');
        }
        return;
      }

      // Proceed to checkout
      onCheckout();
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError('Failed to validate cart. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Button
        onClick={handleCheckout}
        disabled={isValidating || itemCount === 0}
        className="w-full h-12 text-base"
        size="lg"
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Validating...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Proceed to Checkout
          </>
        )}
      </Button>

      {validationError && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{validationError}</p>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Secure checkout powered by our payment processor
      </p>
    </div>
  );
}
