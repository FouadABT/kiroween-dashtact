/**
 * Tooltip Component
 * 
 * A flexible tooltip component with positioning options and configurable delay.
 * Built on shadcn/ui Tooltip component with theme integration.
 * 
 * @example
 * ```tsx
 * <Tooltip content="This is a tooltip" side="top" delay={300}>
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 */

import React from 'react';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Tooltip props
 */
export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Element to trigger tooltip */
  children: React.ReactNode;
  /** Tooltip position */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Additional CSS classes for content */
  className?: string;
}

/**
 * Tooltip component with positioning and delay options
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delay}>
      <ShadcnTooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className={cn(
            'bg-popover text-popover-foreground border-border',
            className
          )}
        >
          {content}
        </TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
}

Tooltip.displayName = 'Tooltip';
