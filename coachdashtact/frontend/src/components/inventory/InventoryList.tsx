'use client';

import { Inventory } from '@/types/ecommerce';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, AlertTriangle, CheckCircle } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface InventoryListProps {
  inventory: Inventory[];
  onAdjust: (item: Inventory) => void;
}

export function InventoryList({ inventory, onAdjust }: InventoryListProps) {
  if (inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No inventory items found</p>
      </div>
    );
  }

  const getStockStatus = (item: Inventory) => {
    if (item.available <= 0) {
      return { label: 'Out of Stock', color: 'bg-red-500/10 text-red-500', icon: AlertTriangle };
    }
    if (item.available <= item.lowStockThreshold) {
      return { label: 'Low Stock', color: 'bg-yellow-500/10 text-yellow-500', icon: AlertTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-500/10 text-green-500', icon: CheckCircle };
  };

  return (
    <div className="space-y-4">
      {inventory.map((item) => {
        const status = getStockStatus(item);
        const StatusIcon = status.icon;

        return (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">Product Variant ID: {item.productVariantId}</h3>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Quantity</p>
                      <p className="font-semibold">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reserved</p>
                      <p className="font-semibold">{item.reserved}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className="font-semibold text-primary">{item.available}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Low Stock Threshold</p>
                      <p className="font-semibold">{item.lowStockThreshold}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Track Inventory: {item.trackInventory ? 'Yes' : 'No'}</span>
                    <span>Allow Backorder: {item.allowBackorder ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <PermissionGuard permission="inventory:write" fallback={null}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAdjust(item)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Adjust
                  </Button>
                </PermissionGuard>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
