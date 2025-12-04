'use client';

import { Inventory } from '@/types/ecommerce';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface LowStockAlertProps {
  items: Inventory[];
  onAdjust: (item: Inventory) => void;
}

export function LowStockAlert({ items, onAdjust }: LowStockAlertProps) {
  if (items.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Low Stock Warning</AlertTitle>
      <AlertDescription>
        <p className="mb-3">
          {items.length} {items.length === 1 ? 'item is' : 'items are'} running low on stock.
        </p>
        <div className="space-y-2">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-background/50 p-2 rounded">
              <div className="text-sm">
                <p className="font-medium">Variant ID: {item.productVariantId}</p>
                <p className="text-muted-foreground">
                  Available: {item.available} / Threshold: {item.lowStockThreshold}
                </p>
              </div>
              <PermissionGuard permission="inventory:write" fallback={null}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjust(item)}
                >
                  Adjust
                </Button>
              </PermissionGuard>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-sm text-muted-foreground">
              And {items.length - 3} more items...
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
