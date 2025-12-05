'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export function EmptyCart() {
  return (
    <div className="container mx-auto px-4 py-16 bg-background">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up!
        </p>

        <Button asChild size="lg">
          <Link href="/shop">
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}
