'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg touch-manipulation">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              quality={85}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm sm:text-base text-muted-foreground">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isOutOfStock && (
              <Badge variant="destructive" className="shadow-sm text-xs">
                Out of Stock
              </Badge>
            )}
            {product.isFeatured && !isOutOfStock && (
              <Badge variant="secondary" className="shadow-sm text-xs">
                Featured
              </Badge>
            )}
            {hasDiscount && !isOutOfStock && (
              <Badge className="bg-green-600 shadow-sm hover:bg-green-700 text-xs">
                {discountPercent}% OFF
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-foreground group-hover:text-primary">
            {product.name}
          </h3>
          
          {product.shortDescription && (
            <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-foreground">
              ${product.basePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {product.categories && product.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((category) => (
                <Badge key={category.id} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 sm:p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full min-h-[44px] touch-manipulation"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span className="text-sm">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
