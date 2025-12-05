'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CartApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  productId,
  productVariantId,
  quantity,
  disabled = false,
  className,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleAddToCart = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      // Get or create session ID for guest cart
      let sessionId = localStorage.getItem('cartSessionId');
      if (!sessionId) {
        sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('cartSessionId', sessionId);
      }
      
      await CartApi.addToCart({
        sessionId,
        productId,
        productVariantId: productVariantId || undefined,
        quantity,
      });
      
      // Dispatch cart update event for header badge
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success state
      setIsSuccess(true);
      
      toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to your cart`);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
      
      // Trigger cart refresh event
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      
      toast.error(error.message || 'Failed to add to cart. Please try again');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      className={cn('relative', className)}
      size="lg"
    >
      {isSuccess ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          {isLoading ? 'Adding...' : 'Add to Cart'}
        </>
      )}
    </Button>
  );
}
