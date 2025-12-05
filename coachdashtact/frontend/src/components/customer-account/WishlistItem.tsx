'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { WishlistItem as WishlistItemType, StorefrontProductResponseDto } from '@/types/ecommerce';

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove?: (itemId: string) => void;
  onAddToCart?: (productId: string) => void;
  isLoading?: boolean;
}

export function WishlistItem({
  item,
  onRemove,
  onAddToCart,
  isLoading = false,
}: WishlistItemProps) {
  const product = item.product as StorefrontProductResponseDto | undefined;

  if (!product) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Product no longer available</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isOutOfStock = product.variants && product.variants.length > 0
    ? product.variants.every(v => v.inventory && v.inventory.available <= 0)
    : false;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.basePrice) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Image */}
        <Link href={`/shop/${product.slug}`} className="flex-shrink-0">
          <div className="relative w-full sm:w-32 h-32 bg-muted rounded-lg overflow-hidden group">
            {product.featuredImage ? (
              <Image
                src={product.featuredImage}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 128px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No Image
              </div>
            )}

            {/* Discount Badge */}
            {hasDiscount && !isOutOfStock && (
              <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground text-xs font-bold">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Link href={`/shop/${product.slug}`} className="hover:text-primary transition-colors">
              <h3 className="font-semibold text-base line-clamp-2">{product.name}</h3>
            </Link>

            {product.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.shortDescription}
              </p>
            )}

            {/* Category */}
            {product.categories && product.categories.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {product.categories[0].name}
              </p>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                ${product.basePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.compareAtPrice!.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddToCart?.(product.id)}
                disabled={isOutOfStock || isLoading}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Add to Cart</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove?.(item.id)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Stock Status */}
          {isOutOfStock && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">Out of stock</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Card>
  );
}
