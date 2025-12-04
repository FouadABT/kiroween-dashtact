'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerQueryDto, Customer } from '@/types/ecommerce';
import { CustomersApi } from '@/lib/api';
import { CustomersList } from '@/components/customers/CustomersList';
import { CustomerSearch } from '@/components/customers/CustomerSearch';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

const DEFAULT_FILTERS: CustomerQueryDto = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CustomerQueryDto>(DEFAULT_FILTERS);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await CustomersApi.getAll(filters);
        setCustomers(response.customers || []);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load customers:', error);
        toast.error('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.search]);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await CustomersApi.getAll(filters);
      setCustomers(response.customers || []);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search: search || undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      setIsDeleting(true);
      await CustomersApi.delete(customerToDelete);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const totalPages = Math.ceil(total / (filters.limit || 20));

  return (
    <PermissionGuard permission="customers:read">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Customers"
          description="Manage your customer database"
          actions={
            <PermissionGuard permission="customers:write" fallback={null}>
              <Button onClick={() => router.push('/dashboard/ecommerce/customers/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </PermissionGuard>
          }
        />

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <CustomerSearch
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Customers List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <CustomersList
            customers={customers || []}
            onDelete={handleDelete}
            onView={(id) => router.push(`/dashboard/ecommerce/customers/${id}`)}
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
                This action cannot be undone. This will permanently delete the customer.
                Customers with existing orders cannot be deleted.
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
  );
}
