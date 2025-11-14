'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, X } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { CartApi, StorefrontApi } from '@/lib/api';
import type {
  StorefrontProductListResponseDto,
  StorefrontCategoryResponseDto,
} from '@/types/ecommerce';

interface ShopPageClientProps {
  initialProducts: StorefrontProductListResponseDto;
  categories: StorefrontCategoryResponseDto[];
  initialSearchParams: Record<string, string | undefined>;
}

export function ShopPageClient({
  initialProducts,
  categories,
  initialSearchParams,
}: ShopPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  // Parse filters from URL
  const [filters, setFilters] = useState<ProductFiltersState>({
    search: initialSearchParams.search || '',
    categorySlug: initialSearchParams.categorySlug,
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

  // Fetch products when filters/sort/page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const query = {
          page: currentPage,
          limit,
          search: filters.search || undefined,
          categorySlug: filters.categorySlug || undefined,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          isFeatured: filters.isFeatured,
          inStock: filters.inStock,
          sortBy: sortBy as any,
        };

        const data = await StorefrontApi.getPublicProducts(query);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch on filter/sort/page changes (but not on initial mount)
    const hasFilters = filters.search || filters.categorySlug || filters.minPrice !== undefined || 
                       filters.maxPrice !== undefined || filters.isFeatured || filters.inStock;
    const isNotDefaultSort = sortBy !== 'newest';
    const isNotFirstPage = currentPage > 1;

    if (hasFilters || isNotDefaultSort || isNotFirstPage) {
      fetchProducts();
    }
  }, [currentPage, limit, filters, sortBy]);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: ProductFiltersState, newSortBy: SortOption, newPage: number) => {
      const params = new URLSearchParams();

      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.categorySlug) params.set('categorySlug', newFilters.categorySlug);
      if (newFilters.minPrice !== undefined) params.set('minPrice', newFilters.minPrice.toString());
      if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString());
      if (newFilters.isFeatured) params.set('isFeatured', 'true');
      if (newFilters.inStock) params.set('inStock', 'true');
      if (newSortBy !== 'newest') params.set('sortBy', newSortBy);
      if (newPage > 1) params.set('page', newPage.toString());
      if (limit !== 12) params.set('limit', limit.toString());

      const queryString = params.toString();
      router.push(`/shop${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [router, limit]
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

      // Dispatch cart update event
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
    filters.categorySlug,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.isFeatured,
    filters.inStock,
  ].filter(Boolean).length;

  // Get selected category name
  const selectedCategory = filters.categorySlug
    ? categories.find((c) => c.slug === filters.categorySlug) ||
      categories.flatMap((c) => c.children || []).find((c) => c.slug === filters.categorySlug)
    : null;

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <>
      {/* Storefront Header with Cart and Theme Toggle */}
      <StorefrontHeader />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Shop</h1>
          </div>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Browse our complete catalog of products
          </p>
        </div>

      {/* Active Filters Summary */}
      {(activeFiltersCount > 0 || selectedCategory) && (
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-foreground">Active Filters:</span>
          {selectedCategory && (
            <Badge variant="secondary" className="text-xs">
              Category: {selectedCategory.name}
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: {filters.search}
            </Badge>
          )}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <Badge variant="secondary" className="text-xs">
              Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
            </Badge>
          )}
          {filters.isFeatured && (
            <Badge variant="secondary" className="text-xs">Featured</Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary" className="text-xs">In Stock</Badge>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar - Filters */}
        <aside className="hidden lg:block space-y-6">
          <ProductFilters
            categories={categories}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            priceRange={{ min: 0, max: 1000 }}
          />
        </aside>

        {/* Main Content */}
        <main className="space-y-4 sm:space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {products.products.length} of {products.total} products
                {currentPage > 1 && ` (Page ${currentPage} of ${products.totalPages})`}
              </div>
              
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden min-h-[44px] touch-manipulation"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
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
            <div className="flex min-h-[300px] sm:min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-card p-6 sm:p-8 text-center">
              <ShoppingBag className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <h3 className="mb-2 text-base sm:text-lg font-semibold text-foreground">No products found</h3>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                onClick={() => handleFiltersChange({ search: '' })}
                className="min-h-[44px] touch-manipulation"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
        <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Filters</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          
          <ProductFilters
            categories={categories}
            filters={filters}
            onFiltersChange={(newFilters) => {
              handleFiltersChange(newFilters);
              setIsMobileFiltersOpen(false);
            }}
            priceRange={{ min: 0, max: 1000 }}
          />
          
          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 min-h-[44px] touch-manipulation"
              onClick={() => {
                handleFiltersChange({ search: '' });
                setIsMobileFiltersOpen(false);
              }}
            >
              Clear All
            </Button>
            <Button
              className="flex-1 min-h-[44px] touch-manipulation"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
        </div>
      </div>
    </>
  );
}
