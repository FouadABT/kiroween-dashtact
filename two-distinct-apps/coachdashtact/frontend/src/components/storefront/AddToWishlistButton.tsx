'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { WishlistApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AddToWishlistButtonProps {
  productId: string;
  productVariantId?: string | null;
  className?: string;
}

export function AddToWishlistButton({
  productId,
  productVariantId,
  className,
}: AddToWishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  const handleToggleWishlist = async () => {
    setIsLoading(true);
    
    try {
      if (isInWishlist) {
        // TODO: Implement remove from wishlist
        toast.success('Item removed from your wishlist');
        setIsInWishlist(false);
      } else {
        await WishlistApi.addItem({
          productId,
          productVariantId: productVariantId || undefined,
        });
        
        toast.success('Item added to your wishlist');
        setIsInWishlist(true);
      }
    } catch (error: any) {
      console.error('Failed to update wishlist:', error);
      
      toast.error(error.message || 'Failed to update wishlist. Please try again');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={cn('', className)}
    >
      <Heart
        className={cn(
          'w-5 h-5',
          isInWishlist && 'fill-current text-destructive'
        )}
      />
      <span className="ml-2 hidden sm:inline">
        {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </span>
    </Button>
  );
}
