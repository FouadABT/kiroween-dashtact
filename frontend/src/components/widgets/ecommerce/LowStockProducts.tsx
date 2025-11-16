'use client';

import { useState, useEffect } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Inventory } from '@/types/ecommerce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InventoryApi } from '@/lib/api';

export interface LowStockProductsProps {
  title?: string;
  limit?: number;
  threshold?: number;
  loading?: boolean;
  error?: string;
  permission?: string;
}

interface InventoryWithProduct extends Inventory {
  productVariant?: {
    name: string;
    product?: {
      name: string;
    };
  };
}

export function LowStockProducts({
  title = 'Low Stock Alert',
  limit = 5,
  threshold = 10,
  loading: externalLoading = false,
  error: externalError,
  permission = 'inventory:read',
}: LowStockProductsProps) {
  const router = useRouter();
  const [items, setItems] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalLoading) {
      setLoading(true);
      return;
    }

    const fetchLowStock = async () => {
      try {
        setLoading(true);
        const data = await InventoryApi.getLowStockItems();
        
        setItems(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, [limit, threshold, externalLoading]);

  const handleViewInventory = () => {
    router.push('/dashboard/ecommerce/inventory');
  };

  if (loading) {
    return (
      <WidgetContainer title={title} loading>
        <SkeletonLoader variant="table" count={limit} />
      </WidgetContainer>
    );
  }

  if (error || externalError) {
    return (
      <WidgetContainer title={title} error={error || externalError}>
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load inventory"
          description={error || externalError}
        />
      </WidgetContainer>
    );
  }

  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <WidgetContainer title={title} permission={permission}>
        <EmptyState
          icon={Package}
          title="All stock levels healthy"
          description="No products are running low on stock"
        />
      </WidgetContainer>
    );
  }

  const getStockLevel = (available: number, threshold: number) => {
    const percentage = (available / threshold) * 100;
    if (percentage <= 25) return { label: 'Critical', color: 'bg-red-500' };
    if (percentage <= 50) return { label: 'Low', color: 'bg-orange-500' };
    return { label: 'Warning', color: 'bg-yellow-500' };
  };

  return (
    <WidgetContainer
      title={title}
      permission={permission}
      actions={
        <Button variant="ghost" size="sm" onClick={handleViewInventory}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-3">
        {safeItems.map((item) => {
          const stockLevel = getStockLevel(item.available, item.lowStockThreshold);
          const productName = item.productVariant?.product?.name || 'Unknown Product';
          const variantName = item.productVariant?.name || '';

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{productName}</p>
                  {variantName && (
                    <p className="text-xs text-muted-foreground truncate">
                      {variantName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {stockLevel.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.available} / {item.lowStockThreshold}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stockLevel.color} transition-all`}
                    style={{
                      width: `${Math.min((item.available / item.lowStockThreshold) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetContainer>
  );
}
