/**
 * Avatar Component
 * 
 * A flexible avatar component with image support, fallback initials, size variants,
 * and status indicators. Built on shadcn/ui Avatar component.
 * 
 * @example
 * ```tsx
 * <Avatar
 *   src="/avatar.jpg"
 *   fallback="JD"
 *   size="md"
 *   status="online"
 * />
 * ```
 */

import React from 'react';
import {
  Avatar as ShadcnAvatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { AvatarProps } from '../types/widget.types';
import { cn } from '@/lib/utils';

/**
 * Avatar component with image, fallback, sizes, and status indicator
 */
export function Avatar({
  src,
  fallback,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  // Size classes
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  // Status indicator size classes
  const statusSizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  // Status color classes
  const statusColorClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };

  return (
    <div className="relative inline-block">
      <ShadcnAvatar className={cn(sizeClasses[size], className)}>
        {src && <AvatarImage src={src} alt={fallback} />}
        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
          {fallback}
        </AvatarFallback>
      </ShadcnAvatar>
      
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            statusSizeClasses[size],
            statusColorClasses[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

Avatar.displayName = 'Avatar';
