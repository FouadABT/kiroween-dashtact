'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { LandingPageSection, ProductsSectionData } from '@/types/landing-page';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  basePrice: number;
  compareAtPrice?: number | null;
  featuredImage?: string | null;
  images: string[];
  status: string;
  isVisible: boolean;
  isFeatured: boolean;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    sku?: string | null;
    attributes: Record<string, any>;
    price?: number | null;
    isActive: boolean;
    inventory?: {
      quantity: number;
      reserved: number;
      available: number;
    };
  }>;
}

interface ProductsSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function ProductsSection({ section, maxWidth = 'container' }: ProductsSectionProps) {
  const data = section.data as ProductsSectionData;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters for storefront API
        const params = new URLSearchParams({
          limit: (data.productCount || 6).toString(),
        });

        if (data.filterByCategory) {
          params.append('categorySlug', data.filterByCategory);
        }

        if (data.filterByTag) {
          params.append('tag', data.filterByTag);
        }

        // Use storefront endpoint (public, no auth required)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/storefront/products?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const result = await response.json();
        // Storefront API returns { products: [...], total, page, limit, totalPages }
        setProducts(result.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [data.productCount, data.filterByCategory, data.filterByTag]);

  const maxWidthClass =
    maxWidth === 'full'
      ? 'w-full px-0'
      : maxWidth === 'narrow'
      ? 'max-w-4xl mx-auto px-4'
      : 'max-w-7xl mx-auto px-4';

  const gridColsClass =
    data.layout === 'grid' || data.layout === 'featured'
      ? data.columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : data.columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      : '';

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (basePrice: number, compareAtPrice: number) => {
    return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
  };

  // Check if product is in stock
  const isProductInStock = (product: Product): boolean => {
    if (!product.variants || product.variants.length === 0) {
      return true; // Assume in stock if no variants
    }
    return product.variants.some(v => 
      v.isActive && v.inventory && v.inventory.available > 0
    );
  };

  // Get total stock
  const getTotalStock = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) {
      return 0;
    }
    return product.variants.reduce((total, v) => 
      total + (v.inventory?.available || 0), 0
    );
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);

      // Get or create session ID for guest users
      let sessionId = localStorage.getItem('cart_session_id');
      if (!sessionId) {
        sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', sessionId);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      toast.success(`${product.name} added to cart`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };



  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className={maxWidthClass}>
          {(data.title || data.subtitle) && (
            <div className="text-center mb-12">
              {data.title && (
                <Skeleton className="h-10 w-64 mx-auto mb-4" />
              )}
              {data.subtitle && (
                <Skeleton className="h-6 w-96 mx-auto" />
              )}
            </div>
          )}
          <div className={cn('grid gap-6', gridColsClass)}>
            {Array.from({ length: data.productCount || 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full aspect-square" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className={maxWidthClass}>
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className={maxWidthClass}>
          {(data.title || data.subtitle) && (
            <div className="text-center mb-12">
              {data.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{data.title}</h2>
              )}
              {data.subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {data.subtitle}
                </p>
              )}
            </div>
          )}
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">No products available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  // Render product card
  const renderProductCard = (product: Product, isFeatured = false) => {
    const currentPrice = product.basePrice;
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;
    const inStock = isProductInStock(product);
    const stockCount = getTotalStock(product);
    const displayImage = product.featuredImage || product.images[0];

    return (
      <Card
        key={product.id}
        className={cn(
          'overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col',
          isFeatured && 'md:col-span-2 md:row-span-2'
        )}
      >
        {/* Product Image */}
        <Link
          href={`/shop/${product.slug}`}
          className={cn(
            'relative block overflow-hidden bg-muted',
            isFeatured ? 'aspect-[4/3]' : 'aspect-square'
          )}
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes={isFeatured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Sale Badge */}
          {hasDiscount && product.compareAtPrice && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              -{getDiscountPercentage(product.basePrice, product.compareAtPrice)}% OFF
            </Badge>
          )}

          {/* Stock Badge */}
          {data.showStock && !inStock && (
            <Badge variant="secondary" className="absolute top-3 right-3">
              Out of Stock
            </Badge>
          )}
        </Link>

        {/* Product Info */}
        <div className={cn('p-6 flex flex-col flex-1', isFeatured && 'md:p-8')}>
          {/* Product Name */}
          <Link href={`/shop/${product.slug}`}>
            <h3 className={cn(
              'font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2',
              isFeatured ? 'text-2xl' : 'text-lg'
            )}>
              {product.name}
            </h3>
          </Link>

          {/* Description (featured only) */}
          {isFeatured && (product.shortDescription || product.description) && (
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {product.shortDescription || product.description}
            </p>
          )}

          {/* Price */}
          {data.showPrice && (
            <div className={cn('mb-4', isFeatured && 'text-xl')}>
              <span className="font-bold text-foreground">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && product.compareAtPrice && (
                <span className="ml-2 text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          )}

          {/* Stock Status */}
          {data.showStock && inStock && stockCount > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 mb-4">
              ✓ In Stock ({stockCount} available)
            </p>
          )}

          {/* Add to Cart Button */}
          <div className="mt-auto">
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={!inStock || addingToCart === product.id}
              className="w-full gap-2"
              size={isFeatured ? 'lg' : 'default'}
            >
              <ShoppingCart className="h-4 w-4" />
              {addingToCart === product.id
                ? 'Adding...'
                : !inStock
                ? 'Out of Stock'
                : data.ctaText || 'Add to Cart'}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <section className="py-16 bg-background">
      <div className={maxWidthClass}>
        {/* Section header */}
        {(data.title || data.subtitle) && (
          <div className="text-center mb-12">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{data.title}</h2>
            )}
            {data.subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Products grid/carousel/featured */}
        {data.layout === 'carousel' ? (
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {products.map((product) => (
                <div key={product.id} className="flex-none w-full md:w-1/2 lg:w-1/3 snap-start">
                  {renderProductCard(product)}
                </div>
              ))}
            </div>
          </div>
        ) : data.layout === 'featured' && products.length > 0 ? (
          <div className={cn('grid gap-6', gridColsClass)}>
            {/* First product is featured (larger) */}
            {renderProductCard(products[0], true)}
            {/* Rest are normal size */}
            {products.slice(1).map((product) => renderProductCard(product, false))}
          </div>
        ) : (
          <div className={cn('grid gap-6', gridColsClass)}>
            {products.map((product) => renderProductCard(product, false))}
          </div>
        )}

        {/* CTA button */}
        {data.ctaText && (
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/shop">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
