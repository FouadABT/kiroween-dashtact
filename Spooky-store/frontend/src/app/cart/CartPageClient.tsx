'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartApi } from '@/lib/api';
import { Cart } from '@/types/ecommerce';
import { StorefrontHeader } from '@/components/storefront';
import { CartItemList } from '@/components/cart/CartItemList';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import { Loader2 } from 'lucide-react';

export default function CartPageClient() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get or create session ID for guest users
  const getSessionId = (): string => {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
  };

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionId = getSessionId();
      const cartData = await CartApi.getCart(sessionId);
      setCart(cartData);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (!cart) return;

    try {
      const updatedCart = await CartApi.updateCartItem(itemId, { quantity });
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!cart) return;

    try {
      const updatedCart = await CartApi.removeCartItem(itemId);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    if (!cart) return;

    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      const updatedCart = await CartApi.clearCart(cart.id);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart. Please try again.');
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <>
        <StorefrontHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <StorefrontHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            {error}
          </div>
          </div>
        </div>
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <StorefrontHeader />
        <div className="min-h-screen bg-background">
          <EmptyCart />
        </div>
      </>
    );
  }

  return (
    <>
      <StorefrontHeader />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-foreground">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items - Takes 2 columns on large screens, stacked on mobile */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <CartItemList
              items={cart.items}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
            />
          </div>

          {/* Cart Summary - Takes 1 column on large screens, shown first on mobile */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-4">
              <CartSummary cart={cart} />
              <CheckoutButton
                sessionId={getSessionId()}
                userId={cart.userId || undefined}
                itemCount={cart.itemCount}
                onCheckout={handleCheckout}
                className="w-full mt-4 min-h-[48px] sm:min-h-[44px] touch-manipulation"
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
