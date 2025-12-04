'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WishlistEmptyProps {
  onContinueShopping?: () => void;
}

export function WishlistEmpty({ onContinueShopping }: WishlistEmptyProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4 p-3 bg-muted rounded-full">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>

        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Start adding your favorite products to your wishlist. You can save items for later and get notified when they go on sale.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/shop">
            <Button>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>

          {onContinueShopping && (
            <Button variant="outline" onClick={onContinueShopping}>
              Browse Products
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
