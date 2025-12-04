'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, X, Search as SearchIcon } from 'lucide-react';
import {
  ProductGrid,
  ProductSort,
  Pagination,
  type SortOption,
} from '@/components/storefront';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader';
import { CartApi, StorefrontApi } from '@/lib/api';
import type {
  StorefrontProductListResponseDto,
} from '@/types/ecommerce';

interface ShopSearchPageClientProps {
  initialSearchParams: Record<string, string | undefined>;
}

export function ShopSearchPageClient({
  initialSearchParams,
}: ShopSearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<StorefrontProductListResponseDto>({
    products: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.q || '');

  const [sortBy, setSortBy] = useState<SortOption>(
    (initialSearchParams.sortBy as SortOption) || 'newest'
  );

  const [currentPage, setCurrentPage] = useState(
    initialSearchParams.page ? parseInt(initialSearchParams.page) : 1
  );

  const [limit] = useState(
    initialSearchParams.limit ? parseInt(initialSearchParams.limit) : 12
  );

  // Fetch products when search query, sort, or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery.trim()) {
        setProducts({
          products: [],
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
        });
        return;
      }

      setIsLoading(true);
      try {
        const data = await StorefrontApi.searchProducts(searchQuery, {
          page: currentPage,
          limit,
          sortBy: sortBy as any,
        });
        setProducts(data);
      } catch (error) {
        console.error('Failed to search products:', error);
        toast.error('Failed to search products');
        setProducts({
          products: [],
          total: 0,
          page: currentPage,
          limit,
          totalPages: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, limit, sortBy, searchQuery]);

  // Update URL when search/sort/page changes
  const updateURL = useCallback(
    (newQuery: string, newSortBy: SortOption, newPage: number) => {
      const params = new URLSearchParams();

      if (newQuery) params.set('q', newQuery);
      if (newSortBy !== 'newest') params.set('sortBy', newSortBy);
      if (newPage > 1) params.set('page', newPage.toString());
      if (limit !== 12) params.set('limit', limit.toString());

      const queryString = params.toString();
      router.push(`/shop/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [router, limit]
  );

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      updateURL(searchQuery, sortBy, 1);
    }
  };

  // Handle sort changes
  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    updateURL(searchQuery, newSortBy, 1);
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL(searchQuery, sortBy, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    setIsAddingToCart(productId);

    try {
      const sessionId = localStorage.getItem('cartSessionId') || generateSessionId();
      localStorage.setItem('cartSessionId', sessionId);

      await CartApi.addToCart({
        sessionId,
        productId,
        quantity: 1,
      });

      window.dispatchEvent(new Event('cartUpdated'));

      toast.success('Product added to cart', {
        description: 'View your cart to proceed to checkout',
        action: {
          label: 'View Cart',
          onClick: () => router.push('/cart'),
        },
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  const generateSessionId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setSortBy('newest');
    router.push('/shop/search');
  };

  return (
    <>
      <StorefrontHeader />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-10">
          {/* Page Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Search Products
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Find exactly what you're looking for
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8 sm:mb-10">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search products by name, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 text-base bg-card border border-border rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 px-6 min-h-[44px] touch-manipulation"
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </form>

          {/* Search Info */}
          {searchQuery && (
            <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Searching for: <span className="font-semibold text-foreground">"{searchQuery}"</span>
              </span>
              <button
                onClick={clearSearch}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Main Content */}
          <main className="space-y-6">
            {/* Toolbar */}
            {searchQuery && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {products.products.length > 0 ? (
                    <>
                      Found <span className="font-semibold text-foreground">{products.total}</span> product{products.total !== 1 ? 's' : ''}
                      {currentPage > 1 && (
                        <>
                          {' '}
                          (Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
                          <span className="font-semibold text-foreground">{products.totalPages}</span>)
                        </>
                      )}
                    </>
                  ) : (
                    'No products found'
                  )}
                </div>

                {products.products.length > 0 && (
                  <ProductSort value={sortBy} onChange={handleSortChange} />
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && searchQuery && products.products.length > 0 && (
              <>
                <ProductGrid
                  products={products.products}
                  onAddToCart={handleAddToCart}
                />

                {/* Pagination */}
                {products.totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={products.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}

            {/* Empty State - No Search Query */}
            {!isLoading && !searchQuery && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-8 text-center">
                <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Start searching
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Enter a search term above to find products by name, description, or other details
                </p>
              </div>
            )}

            {/* Empty State - No Results */}
            {!isLoading && searchQuery && products.products.length === 0 && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-8 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  No products found
                </h3>
                <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                  We couldn't find any products matching "{searchQuery}". Try different keywords or browse our shop.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="min-h-[40px] touch-manipulation"
                  >
                    Clear Search
                  </Button>
                  <Button
                    onClick={() => router.push('/shop')}
                    className="min-h-[40px] touch-manipulation"
                  >
                    Browse Shop
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
