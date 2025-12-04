'use client';

import { useState, useEffect, useCallback } from 'react';
import { InventoryQueryDto, Inventory } from '@/types/ecommerce';
import { InventoryApi } from '@/lib/api';
import { InventoryList } from '@/components/inventory/InventoryList';
import { LowStockAlert } from '@/components/inventory/LowStockAlert';
import { InventoryAdjuster } from '@/components/inventory/InventoryAdjuster';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DEFAULT_FILTERS: InventoryQueryDto = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Inventory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryQueryDto>(DEFAULT_FILTERS);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        const [inventoryResponse, lowStockResponse] = await Promise.all([
          InventoryApi.getAll(filters),
          InventoryApi.getLowStockItems(),
        ]);
        setInventory(inventoryResponse.data);
        setTotal(inventoryResponse.total);
        setLowStockItems(lowStockResponse);
      } catch (error) {
        toast.error('Failed to load inventory');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.search]);

  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      const [inventoryResponse, lowStockResponse] = await Promise.all([
        InventoryApi.getAll(filters),
        InventoryApi.getLowStockItems(),
      ]);
      setInventory(inventoryResponse.data);
      setTotal(inventoryResponse.total);
      setLowStockItems(lowStockResponse);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleAdjust = (item: Inventory) => {
    setSelectedInventory(item);
    setAdjustDialogOpen(true);
  };

  const handleAdjustmentComplete = () => {
    setAdjustDialogOpen(false);
    setSelectedInventory(null);
    fetchInventory();
  };

  const totalPages = Math.ceil(total / (filters.limit || 20));

  return (
    <PermissionGuard permission="inventory:read">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Inventory Management"
          description="Track and manage product inventory levels"
        />

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <LowStockAlert items={lowStockItems} onAdjust={handleAdjust} />
        )}

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Items ({total})</TabsTrigger>
            <TabsTrigger value="low-stock">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock ({lowStockItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Inventory List */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <InventoryList
                inventory={inventory}
                onAdjust={handleAdjust}
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
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-6">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No low stock items</p>
              </div>
            ) : (
              <InventoryList
                inventory={lowStockItems}
                onAdjust={handleAdjust}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Adjustment Dialog */}
        <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Inventory</DialogTitle>
              <DialogDescription>
                Update inventory quantity for this product variant
              </DialogDescription>
            </DialogHeader>
            {selectedInventory && (
              <InventoryAdjuster
                inventory={selectedInventory}
                onComplete={handleAdjustmentComplete}
                onCancel={() => setAdjustDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
