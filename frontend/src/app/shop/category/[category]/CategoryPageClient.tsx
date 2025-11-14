'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  StorefrontHeader,
  ProductGrid,
  ProductFilters,
  ProductSort,
  Pagination,
  type ProductFiltersState,
  type SortOption,
} from '@/components/storefront';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartApi } from '@/lib/api';
import type {
  StorefrontProductListResponseDto,
  StorefrontCategoryResponseDto,
} from '@/types/ecommerce';

interface CategoryPageClientProps {
  category: StorefrontCategoryResponseDto;
  initialProducts: StorefrontProductListResponseDto;
  categories: StorefrontCategoryResponseDto[];
  initialSearchParams: Record<string, string | undefined>;
}

export function CategoryPageClient({
  category,
  initialProducts,
  categories,
  initialSearchParams,
}: CategoryPageClientProps) {
  const router = useRouter();

  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  // Parse filters from URL (excluding categorySlug since it's in the route)
  const [filters, setFilters] = useState<ProductFiltersState>({
    search: initialSearchParams.search || '',
    minPrice: initialSearchParams.minPrice ? parseFloat(initialSearchParams.minPrice) : undefined,
    maxPrice: initialSearchParams.maxPrice ? parseFloat(initialSearchParams.maxPrice) : undefined,
    isFeatured: initialSearchParams.isFeatured === 'true' ? true : undefined,
    inStock: initialSearchParams.inStock === 'true' ? true : undefined,
  });

  const [sortBy, setSortBy] = useState<SortOption>(
    (initialSearchParams.sortBy as SortOption) || 'newest'
  );

  const [currentPage, setCurrentPage] = useState(
    initialSearchParams.page ? parseInt(initialSearchParams.page) : 1
  );

  const [limit] = useState(
    initialSearchParams.limit ? parseInt(initialSearchParams.limit) : 12
  );

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: ProductFiltersState, newSortBy: SortOption, newPage: number) => {
      const params = new URLSearchParams();

      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.minPrice !== undefined) params.set('minPrice', newFilters.minPrice.toString());
      if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString());
      if (newFilters.isFeatured) params.set('isFeatured', 'true');
      if (newFilters.inStock) params.set('inStock', 'true');
      if (newSortBy !== 'newest') params.set('sortBy', newSortBy);
      if (newPage > 1) params.set('page', newPage.toString());
      if (limit !== 12) params.set('limit', limit.toString());

      const queryString = params.toString();
      router.push(
        `/shop/category/${category.slug}${queryString ? `?${queryString}` : ''}`,
        { scroll: false }
      );
    },
    [router, category.slug, limit]
  );

  // Handle filter changes
  const handleFiltersChange = (newFilters: ProductFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    updateURL(newFilters, sortBy, 1);
  };

  // Handle sort changes
  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sort changes
    updateURL(filters, newSortBy, 1);
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL(filters, sortBy, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    setIsAddingToCart(productId);

    try {
      // Get or create cart
      const sessionId = localStorage.getItem('cartSessionId') || generateSessionId();
      localStorage.setItem('cartSessionId', sessionId);

      await CartApi.addToCart({
        sessionId,
        productId,
        quantity: 1,
      });

      toast.success('Product added to cart', {
        description: 'View your cart to proceed to checkout',
        action: {
          label: 'View Cart',
          onClick: () => router.push('/cart'),
        },
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart', {
        description: 'Please try again later',
      });
    } finally {
      setIsAddingToCart(null);
    }
  };

  // Generate a unique session ID for guest carts
  const generateSessionId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Get active filters count
  const activeFiltersCount = [
    filters.search,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.isFeatured,
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <>
      <StorefrontHeader />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>
            <Link
              href="/shop"
              className="hover:text-foreground transition-colors"
            >
              Shop
            </Link>
          </li>
          <li>
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>
            <span className="font-medium text-foreground" aria-current="page">
              {category.name}
            </span>
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          {category.image && (
            <div className="hidden sm:block">
              <img
                src={category.image}
                alt={category.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">{category.name}</h1>
            </div>
            {category.description && (
              <p className="mt-2 text-muted-foreground">{category.description}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Active Filters:</span>
          {filters.search && (
            <Badge variant="secondary">Search: {filters.search}</Badge>
          )}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <Badge variant="secondary">
              Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
            </Badge>
          )}
          {filters.isFeatured && <Badge variant="secondary">Featured</Badge>}
          {filters.inStock && <Badge variant="secondary">In Stock</Badge>}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar - Filters */}
        <aside className="space-y-6">
          <ProductFilters
            categories={categories}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            priceRange={{ min: 0, max: 1000 }}
          />
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {products.products.length} of {products.total} products
              {currentPage > 1 && ` (Page ${currentPage} of ${products.totalPages})`}
            </div>
            <ProductSort value={sortBy} onChange={handleSortChange} />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && (
            <>
              <ProductGrid
                products={products.products}
                onAddToCart={handleAddToCart}
              />

              {/* Pagination */}
              {products.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={products.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && products.products.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No products found</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {activeFiltersCount > 0
                  ? 'Try adjusting your filters or search query'
                  : `No products available in ${category.name} yet`}
              </p>
              {activeFiltersCount > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => handleFiltersChange({ search: '' })}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button variant="outline" onClick={() => router.push('/shop')}>
                  Browse All Products
                </Button>
              )}
            </div>
          )}
        </main>
        </div>
      </div>
    </>
  );
}
