'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';
import { StorefrontProductResponseDto } from '@/types/ecommerce';

interface RelatedProductsProps {
  products: StorefrontProductResponseDto[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };
  
  if (products.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
        
        {/* Navigation Buttons (Desktop) */}
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Products Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-[280px] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* Mobile Navigation Dots */}
      <div className="flex md:hidden justify-center gap-2">
        {products.map((_, index) => (
          <button
            key={index}
            className="w-2 h-2 rounded-full bg-muted hover:bg-muted-foreground/50 transition-colors"
            onClick={() => {
              if (scrollContainerRef.current) {
                const scrollAmount = 280 * index;
                scrollContainerRef.current.scrollTo({
                  left: scrollAmount,
                  behavior: 'smooth',
                });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
