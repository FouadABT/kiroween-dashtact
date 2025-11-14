'use client';

import { ProductCard } from './ProductCard';
import type { StorefrontProductResponseDto } from '@/types/ecommerce';

interface ProductGridProps {
  products: StorefrontProductResponseDto[];
  onAddToCart?: (productId: string) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[300px] sm:min-h-[400px] items-center justify-center rounded-lg border border-dashed p-4">
        <div className="text-center">
          <p className="text-base sm:text-lg font-medium text-muted-foreground">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
