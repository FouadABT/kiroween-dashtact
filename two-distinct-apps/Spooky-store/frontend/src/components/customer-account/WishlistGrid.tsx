'use client';

import { useState, useCallback } from 'react';
import { WishlistItem } from './WishlistItem';
import { WishlistEmpty } from './WishlistEmpty';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CustomerAccountApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { Wishlist } from '@/types/ecommerce';

interface WishlistGridProps {
  wishlist: Wishlist | null;
  isLoading?: boolean;
  error?: string | null;
  onRemoveItem?: (itemId: string) => Promise<void>;
  onAddToCart?: (productId: string) => Promise<void>;
}

export function WishlistGrid({
  wishlist,
  isLoading = false,
  error = null,
  onRemoveItem,
  onAddToCart,
}: WishlistGridProps) {
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      setRemovingItemId(itemId);
      try {
        if (onRemoveItem) {
          await onRemoveItem(itemId);
        } else {
          // Use default API call if no handler provided
          const productId = wishlist?.items.find(i => i.id === itemId)?.productId;
          if (productId) {
            await CustomerAccountApi.removeFromWishlist(productId);
            toast.success('Removed from wishlist');
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to remove from wishlist');
      } finally {
        setRemovingItemId(null);
      }
    },
    [onRemoveItem, wishlist?.items]
  );

  const handleAddToCart = useCallback(
    async (productId: string) => {
      setAddingToCartId(productId);
      try {
        if (onAddToCart) {
          await onAddToCart(productId);
        } else {
          // Use default API call if no handler provided
          toast.info('Add to cart functionality not configured');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
      } finally {
        setAddingToCartId(null);
      }
    },
    [onAddToCart]
  );

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return <WishlistEmpty />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-muted rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          My Wishlist ({wishlist.items.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {wishlist.items.map((item) => (
          <WishlistItem
            key={item.id}
            item={item}
            onRemove={handleRemoveItem}
            onAddToCart={handleAddToCart}
            isLoading={removingItemId === item.id || addingToCartId === item.product?.id}
          />
        ))}
      </div>
    </div>
  );
}
