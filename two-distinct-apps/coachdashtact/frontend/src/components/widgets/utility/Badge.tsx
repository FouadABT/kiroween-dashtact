/**
 * Badge Component
 * 
 * A versatile badge component with multiple variants, sizes, and icon support.
 * Built on shadcn/ui Badge component with theme integration.
 * 
 * @example
 * ```tsx
 * <Badge variant="success" size="md" icon={Check}>
 *   Active
 * </Badge>
 * ```
 */

import React from 'react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { BadgeProps } from '../types/widget.types';
import { cn } from '@/lib/utils';

/**
 * Badge component with variants, sizes, and icon support
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className,
}: BadgeProps) {
  // Map custom variants to shadcn variants
  const variantMap = {
    default: 'default',
    success: 'default',
    warning: 'default',
    error: 'destructive',
    info: 'secondary',
  } as const;

  // Custom color classes for variants not directly supported by shadcn
  const variantColorClasses = {
    default: '',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100/80',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 hover:bg-yellow-100/80',
    error: '',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100/80',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <ShadcnBadge
      variant={variantMap[variant]}
      className={cn(
        sizeClasses[size],
        variantColorClasses[variant],
        'inline-flex items-center gap-1',
        className
      )}
    >
      {Icon && <Icon className={iconSizeClasses[size]} />}
      {children}
    </ShadcnBadge>
  );
}

Badge.displayName = 'Badge';
