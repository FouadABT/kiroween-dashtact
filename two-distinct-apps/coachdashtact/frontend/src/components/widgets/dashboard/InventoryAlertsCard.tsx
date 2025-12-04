'use client';

/**
 * Inventory Alerts Card Widget
 * Displays low stock and out of stock alerts
 */

import { useMemo, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { Package, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface InventoryAlertsCardProps {
  title?: string;
  linkToInventory?: boolean;
  data?: {
    lowStockCount?: number;
    outOfStockCount?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

export function InventoryAlertsCard({
  title = 'Inventory Alerts',
  linkToInventory = true,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'inventory:read',
}: InventoryAlertsCardProps) {
  const router = useRouter();
  
  // Use context data if no props provided (backward compatibility)
  const context = useDashboardData();
  const [useContext] = useState(!propData);
  
  const data = propData || (useContext ? context.stats : undefined);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  // Memoize inventory data
  const inventoryData = useMemo(() => {
    if (!data) return null;
    
    const lowStockCount = data.lowStockCount || 0;
    const outOfStockCount = data.outOfStockCount || 0;
    
    return {
      lowStockCount,
      outOfStockCount,
      hasAlerts: lowStockCount > 0 || outOfStockCount > 0,
    };
  }, [data]);

  const handleViewInventory = () => {
    router.push('/dashboard/ecommerce/inventory');
  };

  // Loading state
  if (loading) {
    return (
      <WidgetContainer title={title} loading>
        <SkeletonLoader variant="card" />
      </WidgetContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}>
        <EmptyState title="Error" description="Unable to load inventory data" />
      </WidgetContainer>
    );
  }

  // Empty state
  if (!data || !inventoryData) {
    return (
      <WidgetContainer title={title}>
        <EmptyState title="No Data" description="No inventory data available" />
      </WidgetContainer>
    );
  }

  const { lowStockCount, outOfStockCount, hasAlerts } = inventoryData;

  return (
    <WidgetContainer 
      title={title} 
      permission={permission}
      actions={
        <div className="p-2 rounded-lg bg-primary/10">
          <Package className="h-4 w-4 text-primary" />
        </div>
      }
    >
      {!hasAlerts ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">All inventory levels are healthy</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Low Stock Alert */}
            {lowStockCount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Low Stock</p>
                    <p className="text-xs text-muted-foreground">Products below threshold</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                  {lowStockCount}
                </Badge>
              </div>
            )}

            {/* Out of Stock Alert */}
            {outOfStockCount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Out of Stock</p>
                    <p className="text-xs text-muted-foreground">Products unavailable</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                  {outOfStockCount}
                </Badge>
              </div>
            )}
          </div>

          {linkToInventory && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleViewInventory}
            >
              View Inventory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </WidgetContainer>
  );
}
