'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/types/ecommerce';
import { QuantityUpdater } from './QuantityUpdater';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemoveItem }: CartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemoveItem(item.id);
    } finally {
      setIsRemoving(false);
    }
  };

  // Calculate item total
  const itemTotal = parseFloat(item.priceSnapshot) * item.quantity;

  // Get product image
  const productImage = item.productVariant?.image || item.product?.featuredImage;

  // Get product name with variant
  const productName = item.product?.name || 'Unknown Product';
  const variantName = item.productVariant?.name;

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/shop/${item.product?.slug}`}
          className="flex-shrink-0 w-24 h-24 relative rounded-md overflow-hidden bg-muted"
        >
          {productImage ? (
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                href={`/shop/${item.product?.slug}`}
                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
              >
                {productName}
              </Link>
              {variantName && (
                <p className="text-sm text-muted-foreground mt-1">
                  {variantName}
                </p>
              )}
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <QuantityUpdater
                itemId={item.id}
                quantity={item.quantity}
                onQuantityChange={onQuantityChange}
              />
              <div className="text-sm text-muted-foreground">
                ${parseFloat(item.priceSnapshot).toFixed(2)} each
              </div>
            </div>

            <div className="text-lg font-semibold text-foreground">
              ${itemTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
