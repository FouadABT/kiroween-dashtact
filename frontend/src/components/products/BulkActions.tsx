'use client';

import React from 'react';
import { ProductStatus } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Archive, CheckCircle, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface BulkActionsProps {
  selectedCount: number;
  onUpdateStatus: (status: ProductStatus) => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  onUpdateStatus,
  onDelete,
  onClearSelection,
}: BulkActionsProps) {
  const canWrite = usePermission('products:write');
  const canDelete = usePermission('products:delete');

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
      </span>
      
      {canWrite && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onUpdateStatus(ProductStatus.PUBLISHED)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(ProductStatus.DRAFT)}>
              <FileText className="mr-2 h-4 w-4" />
              Set as Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(ProductStatus.ARCHIVED)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear selection
      </Button>
    </div>
  );
}
