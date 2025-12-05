import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type SkeletonVariant = 'text' | 'card' | 'table' | 'chart';

export interface SkeletonLoaderProps {
  /**
   * Variant of skeleton to display
   */
  variant: SkeletonVariant;
  
  /**
   * Number of skeleton items to render (for repeating patterns)
   */
  count?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SkeletonLoader component displays loading placeholders that match the layout of actual widgets.
 * Supports multiple variants: text, card, table, and chart.
 * 
 * @example
 * ```tsx
 * // Text skeleton
 * <SkeletonLoader variant="text" count={3} />
 * 
 * // Card skeleton
 * <SkeletonLoader variant="card" count={4} />
 * 
 * // Table skeleton
 * <SkeletonLoader variant="table" />
 * 
 * // Chart skeleton
 * <SkeletonLoader variant="chart" />
 * ```
 */
export function SkeletonLoader({
  variant,
  count = 1,
  className,
}: SkeletonLoaderProps) {
  const renderTextSkeleton = () => (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4 w-full"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card p-6"
        >
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableSkeleton = () => (
    <div className={cn('space-y-4', className)}>
      {/* Table header */}
      <div className="flex gap-4 border-b border-border pb-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      
      {/* Table rows */}
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-4 py-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
      
      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );

  const renderChartSkeleton = () => (
    <div className={cn('space-y-4', className)}>
      {/* Chart title */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Chart area */}
      <div className="relative h-[300px] rounded-lg border border-border bg-muted/50 p-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-8" />
          ))}
        </div>
        
        {/* Chart bars/lines */}
        <div className="ml-12 flex h-full items-end justify-around gap-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-full"
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="ml-12 mt-2 flex justify-around">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-12" />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );

  switch (variant) {
    case 'text':
      return renderTextSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'chart':
      return renderChartSkeleton();
    default:
      return renderTextSkeleton();
  }
}
