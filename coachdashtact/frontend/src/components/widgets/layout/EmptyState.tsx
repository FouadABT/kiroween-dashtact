'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /**
   * Icon to display (Lucide React icon)
   */
  icon?: LucideIcon;
  
  /**
   * Title text
   */
  title: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Call-to-action button configuration
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  };
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EmptyState component displays a centered message when no content is available.
 * Includes optional icon, title, description, and call-to-action button.
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="No messages"
 *   description="You don't have any messages yet"
 *   action={{
 *     label: "Send a message",
 *     onClick: () => console.log('Send message')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center',
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      
      {/* Title */}
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {/* Call-to-action button */}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

