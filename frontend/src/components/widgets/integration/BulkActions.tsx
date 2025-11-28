'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { InlinePermissionWrapper } from './PermissionWrapper';

/**
 * BulkActions - Display action buttons for selected items
 * 
 * Features:
 * - Show selected item count
 * - Multiple action buttons with permissions
 * - Loading state during action execution
 * - Clear selection button
 * - Dropdown menu for additional actions
 * 
 * @example
 * ```tsx
 * <BulkActions
 *   selectedIds={[1, 2, 3]}
 *   onClearSelection={() => setSelectedIds([])}
 *   actions={[
 *     {
 *       label: 'Delete',
 *       icon: <Trash className="w-4 h-4" />,
 *       onClick: (ids) => handleDelete(ids),
 *       permission: 'users:delete',
 *       variant: 'destructive',
 *     },
 *     {
 *       label: 'Export',
 *       icon: <Download className="w-4 h-4" />,
 *       onClick: (ids) => handleExport(ids),
 *       permission: 'users:export',
 *     },
 *   ]}
 * />
 * ```
 */

export interface BulkAction {
  /** Action label */
  label: string;
  /** Action icon */
  icon?: React.ReactNode;
  /** Action handler - receives selected IDs */
  onClick: (selectedIds: string[] | number[]) => Promise<void> | void;
  /** Permission required for this action */
  permission?: string;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  /** Show in dropdown menu instead of as button */
  inDropdown?: boolean;
  /** Confirm before executing */
  requireConfirm?: boolean;
  /** Confirmation message */
  confirmMessage?: string;
}

export interface BulkActionsProps {
  /** Array of selected item IDs */
  selectedIds: string[] | number[];
  /** Callback to clear selection */
  onClearSelection: () => void;
  /** Array of bulk actions */
  actions: BulkAction[];
  /** Show selected count (default: true) */
  showCount?: boolean;
  /** Custom selected count label */
  countLabel?: string;
  /** Position of the actions bar */
  position?: 'top' | 'bottom' | 'sticky';
  /** Additional CSS classes */
  className?: string;
}

export function BulkActions({
  selectedIds,
  onClearSelection,
  actions,
  showCount = true,
  countLabel,
  position = 'top',
  className,
}: BulkActionsProps) {
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const selectedCount = selectedIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const handleAction = async (action: BulkAction) => {
    // Confirm if required
    if (action.requireConfirm) {
      const message = action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} item(s)?`;
      if (!confirm(message)) {
        return;
      }
    }

    setExecutingAction(action.label);

    try {
      await action.onClick(selectedIds);
    } catch (error) {
      console.error(`Bulk action "${action.label}" failed:`, error);
    } finally {
      setExecutingAction(null);
    }
  };

  const buttonActions = actions.filter(action => !action.inDropdown);
  const dropdownActions = actions.filter(action => action.inDropdown);

  const positionClasses = {
    top: '',
    bottom: 'mt-4',
    sticky: 'sticky top-0 z-10',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-lg ${positionClasses[position]} ${className || ''}`}
    >
      {/* Selected count */}
      {showCount && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-semibold">
            {selectedCount}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {countLabel || `${selectedCount === 1 ? 'item' : 'items'} selected`}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-1">
        {buttonActions.map((action, index) => {
          const isExecuting = executingAction === action.label;
          
          const button = (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={() => handleAction(action)}
              disabled={!!executingAction}
              className="flex items-center gap-2"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </Button>
          );

          // Wrap with permission check if permission is provided
          if (action.permission) {
            return (
              <InlinePermissionWrapper key={index} permission={action.permission}>
                {button}
              </InlinePermissionWrapper>
            );
          }

          return button;
        })}

        {/* Dropdown for additional actions */}
        {dropdownActions.length > 0 && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!!executingAction}
                className="flex items-center gap-1"
              >
                More
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {dropdownActions.map((action, index) => {
                const isExecuting = executingAction === action.label;
                
                const menuItem = (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleAction(action)}
                    disabled={!!executingAction}
                  >
                    {isExecuting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      action.icon && <span className="mr-2">{action.icon}</span>
                    )}
                    {action.label}
                  </DropdownMenuItem>
                );

                // Wrap with permission check if permission is provided
                if (action.permission) {
                  return (
                    <InlinePermissionWrapper key={index} permission={action.permission}>
                      {menuItem}
                    </InlinePermissionWrapper>
                  );
                }

                return menuItem;
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Clear selection button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        disabled={!!executingAction}
        className="flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Clear
      </Button>
    </div>
  );
}

/**
 * Compact bulk actions bar for smaller spaces
 */
export function CompactBulkActions({
  selectedIds,
  onClearSelection,
  actions,
}: Pick<BulkActionsProps, 'selectedIds' | 'onClearSelection' | 'actions'>) {
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  if (selectedIds.length === 0) {
    return null;
  }

  const handleAction = async (action: BulkAction) => {
    if (action.requireConfirm) {
      const message = action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()} ${selectedIds.length} item(s)?`;
      if (!confirm(message)) {
        return;
      }
    }

    setExecutingAction(action.label);

    try {
      await action.onClick(selectedIds);
    } catch (error) {
      console.error(`Bulk action "${action.label}" failed:`, error);
    } finally {
      setExecutingAction(null);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 border border-border rounded">
      <Badge variant="secondary" className="text-xs">
        {selectedIds.length}
      </Badge>
      
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!!executingAction}
            className="h-7 text-xs"
          >
            Actions
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {actions.map((action, index) => {
            const isExecuting = executingAction === action.label;
            
            const menuItem = (
              <DropdownMenuItem
                key={index}
                onClick={() => handleAction(action)}
                disabled={!!executingAction}
              >
                {isExecuting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  action.icon && <span className="mr-2">{action.icon}</span>
                )}
                {action.label}
              </DropdownMenuItem>
            );

            if (action.permission) {
              return (
                <InlinePermissionWrapper key={index} permission={action.permission}>
                  {menuItem}
                </InlinePermissionWrapper>
              );
            }

            return menuItem;
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onClearSelection}>
            <X className="w-4 h-4 mr-2" />
            Clear Selection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
