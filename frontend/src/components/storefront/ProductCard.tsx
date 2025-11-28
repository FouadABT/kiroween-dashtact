'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StorefrontProductResponseDto } from '@/types/ecommerce';

interface ProductCardProps {
  product: StorefrontProductResponseDto;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.variants && product.variants.length > 0
    ? product.variants.every(v => v.inventory && v.inventory.available <= 0)
    : false;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.basePrice) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(product.id);
    }
  };

  return (
    <Link href={`/shop/${product.slug}`}>
      <div className="group h-full flex flex-col overflow-hidden transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted rounded-lg mb-3 sm:mb-4 transition-all duration-300">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              quality={85}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No Image
            </div>
          )}

          {/* Badges - Top Left */}
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col gap-1.5 transition-all duration-300">
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs font-medium shadow-sm">
                Out of Stock
              </Badge>
            )}
            {product.isFeatured && !isOutOfStock && (
              <Badge variant="secondary" className="text-xs font-medium shadow-sm">
                Featured
              </Badge>
            )}
            {hasDiscount && !isOutOfStock && (
              <Badge className="bg-accent text-accent-foreground text-xs font-bold shadow-sm">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Wishlist Button - Top Right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-2 top-2 sm:right-3 sm:top-3 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-all duration-500 ease-out opacity-0 group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors duration-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Category */}
          {product.categories && product.categories.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 transition-colors duration-500 group-hover:text-primary">
              {product.categories[0].name}
            </p>
          )}

          {/* Title */}
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-foreground transition-colors duration-500 group-hover:text-primary mb-1.5 sm:mb-2">
            {product.name}
          </h3>

          {/* Description */}
          {product.shortDescription && (
            <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
            <span className="text-base sm:text-lg font-bold text-foreground transition-colors duration-500">
              ${product.basePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full min-h-[40px] sm:min-h-[44px] touch-manipulation text-sm font-medium transition-all duration-500 ease-out group-hover:shadow-xl px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
