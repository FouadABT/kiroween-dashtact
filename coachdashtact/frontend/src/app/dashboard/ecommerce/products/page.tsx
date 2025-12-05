'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProductQueryDto, ProductStatus, Product } from '@/types/ecommerce';
import { ProductsApi } from '@/lib/api';
import { ProductsList } from '@/components/products/ProductsList';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductSearch } from '@/components/products/ProductSearch';
import { BulkActions } from '@/components/products/BulkActions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { EcommerceFeatureGuard } from '@/components/ecommerce/EcommerceFeatureGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DEFAULT_FILTERS: ProductQueryDto = {
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductQueryDto>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clean up selected IDs when products change (remove IDs that no longer exist)
  useEffect(() => {
    if (products.length > 0 && selectedIds.length > 0) {
      const productIds = new Set(products.map(p => p.id));
      const validSelectedIds = selectedIds.filter(id => productIds.has(id));
      if (validSelectedIds.length !== selectedIds.length) {
        setSelectedIds(validSelectedIds);
      }
    }
  }, [products, selectedIds]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await ProductsApi.getAll(filters);
        setProducts(response.products || []);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    // Don't clear selection when filters change - only when explicitly requested
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.search, filters.status, filters.categoryId, filters.isVisible, filters.isFeatured]);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ProductsApi.getAll(filters);
      setProducts(response.products || []);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const handleFiltersChange = (newFilters: ProductQueryDto) => {
    setFilters({ ...newFilters, page: 1 });
    // Don't clear selection when filters change
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    // Don't clear selection when resetting filters
  };

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search: search || undefined, page: 1 });
    // Don't clear selection when searching
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    // Don't clear selection when changing pages
  };

  const handleDelete = async (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await ProductsApi.delete(productToDelete);
      toast.success('Product deleted successfully');
      fetchProducts();
      setSelectedIds(selectedIds.filter((id) => id !== productToDelete));
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsDeleting(true);
      await Promise.all(selectedIds.map((id) => ProductsApi.delete(id)));
      toast.success(`${selectedIds.length} products deleted successfully`);
      fetchProducts();
      setSelectedIds([]);
    } catch (error) {
      toast.error('Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkUpdateStatus = async (status: ProductStatus) => {
    if (selectedIds.length === 0) return;

    try {
      await ProductsApi.bulkUpdateStatus(selectedIds, status);
      toast.success(`${selectedIds.length} products updated successfully`);
      fetchProducts();
      setSelectedIds([]);
    } catch (error) {
      toast.error('Failed to update products');
    }
  };

  const totalPages = Math.ceil(total / (filters.limit || 12));

  return (
    <EcommerceFeatureGuard>
      <PermissionGuard permission="products:read">
        <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Products"
          description="Manage your product catalog"
          actions={
            <PermissionGuard permission="products:write" fallback={null}>
              <Button onClick={() => router.push('/dashboard/ecommerce/products/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </PermissionGuard>
          }
        />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <ProductSearch
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
                <SheetDescription>
                  Refine your product search with filters
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6">
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedIds.length}
          onUpdateStatus={handleBulkUpdateStatus}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedIds([])}
        />

        {/* Products List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : (
          <ProductsList
            products={products || []}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={handleDelete}
            onEdit={(id) => router.push(`/dashboard/ecommerce/products/${id}/edit`)}
            onView={(id) => router.push(`/dashboard/ecommerce/products/${id}`)}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
                  className={
                    (filters.page || 1) === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === (filters.page || 1)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, (filters.page || 1) + 1))
                  }
                  className={
                    (filters.page || 1) === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </PermissionGuard>
    </EcommerceFeatureGuard>
  );
}
