'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  permission?: string;
  disabled?: boolean;
}

export interface QuickActionsProps {
  actions: QuickAction[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickActions({
  actions,
  layout = 'horizontal',
  columns = 3,
  className,
}: QuickActionsProps) {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-2';
      case 'grid':
        return cn(
          'grid gap-2',
          columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        );
      case 'horizontal':
      default:
        return 'flex flex-wrap gap-2';
    }
  };

  return (
    <div className={cn(getLayoutClasses(), className)}>
      {actions.map((action) => {
        const ActionButton = (
          <Button
            key={action.id}
            variant={action.variant || 'default'}
            size={action.size || 'default'}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              layout === 'vertical' && 'w-full justify-start',
              layout === 'grid' && 'w-full'
            )}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        );

        // If action has permission requirement, wrap in PermissionGuard
        if (action.permission) {
          return (
            <PermissionGuard
              key={action.id}
              permission={action.permission}
              fallback={null}
            >
              {ActionButton}
            </PermissionGuard>
          );
        }

        return ActionButton;
      })}
    </div>
  );
}
