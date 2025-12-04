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
      {/* Storefront Header */}
      <StorefrontHeader />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-10">
          {/* Page Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Shop
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover our curated collection of premium products
            </p>
          </div>

          {/* Active Filters */}
          {(activeFiltersCount > 0 || selectedCategory) && (
            <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-2">
              {selectedCategory && (
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {selectedCategory.name}
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  Search: {filters.search}
                </Badge>
              )}
              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                </Badge>
              )}
              {filters.isFeatured && (
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  Featured
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  In Stock
                </Badge>
              )}
              <button
                onClick={() => handleFiltersChange({
                  search: '',
                  categorySlug: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  isFeatured: undefined,
                  inStock: undefined,
                })}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[260px_1fr]">
            {/* Desktop Sidebar - Filters */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-6">
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  priceRange={{ min: 0, max: 1000 }}
                />
              </div>
            </aside>

            {/* Main Content */}
            <main className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {products.products.length > 0 ? (
                    <>
                      Showing <span className="font-semibold text-foreground">{products.products.length}</span> of{' '}
                      <span className="font-semibold text-foreground">{products.total}</span> products
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

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden min-h-[40px] touch-manipulation"
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
                      <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Sort */}
                  <ProductSort value={sortBy} onChange={handleSortChange} />
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex min-h-[400px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {/* Products Grid */}
              {!isLoading && products.products.length > 0 && (
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

              {/* Empty State */}
              {!isLoading && products.products.length === 0 && (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-8 text-center">
                  <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    No products found
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                    Try adjusting your filters or search query to find what you're looking for
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleFiltersChange({
                      search: '',
                      categorySlug: undefined,
                      minPrice: undefined,
                      maxPrice: undefined,
                      isFeatured: undefined,
                      inStock: undefined,
                    })}
                    className="min-h-[40px] touch-manipulation"
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
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-semibold">Filters</SheetTitle>
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

              <div className="mt-8 flex gap-2 border-t border-border pt-6">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[40px] touch-manipulation"
                  onClick={() => {
                    handleFiltersChange({
                      search: '',
                      categorySlug: undefined,
                      minPrice: undefined,
                      maxPrice: undefined,
                      isFeatured: undefined,
                      inStock: undefined,
                    });
                    setIsMobileFiltersOpen(false);
                  }}
                >
                  Clear All
                </Button>
                <Button
                  className="flex-1 min-h-[40px] touch-manipulation"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  Done
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
