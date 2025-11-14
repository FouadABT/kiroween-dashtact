'use client';

import { CartItem as CartItemType } from '@/types/ecommerce';
import { CartItem } from './CartItem';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface CartItemListProps {
  items: CartItemType[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export function CartItemList({
  items,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
}: CartItemListProps) {
  return (
    <div className="bg-card rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Cart Items ({items.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCart}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      {/* Items List */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>
    </div>
  );
}
