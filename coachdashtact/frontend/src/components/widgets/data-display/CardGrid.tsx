"use client";

import React from "react";
import { WidgetContainer } from "../core/WidgetContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BaseWidgetProps } from "../types/widget.types";

/**
 * Number of columns for the grid
 */
export type GridColumns = 1 | 2 | 3 | 4;

/**
 * Props for the CardGrid component
 */
export interface CardGridProps<T> extends BaseWidgetProps {
  /** Widget title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Array of data items */
  items: T[];
  /** Render function for each card */
  renderCard: (item: T, index: number) => React.ReactNode;
  /** Number of columns (responsive) */
  columns?: GridColumns;
  /** Gap between cards */
  gap?: "sm" | "md" | "lg";
  /** Show loading skeleton cards */
  loadingCount?: number;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * SkeletonCard Component
 */
function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="pt-2">
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * EmptyState Component
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center col-span-full">
      <div className="rounded-full bg-muted p-3 mb-3">
        <svg
          className="h-6 w-6 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

/**
 * CardGrid Component
 * 
 * Displays items in a responsive grid layout with custom card rendering.
 * Supports loading states with skeleton cards and empty states.
 * 
 * @example Basic usage
 * ```tsx
 * <CardGrid
 *   title="Products"
 *   items={products}
 *   columns={3}
 *   renderCard={(product) => (
 *     <div>
 *       <h3>{product.name}</h3>
 *       <p>{product.price}</p>
 *     </div>
 *   )}
 * />
 * ```
 * 
 * @example With loading state
 * ```tsx
 * <CardGrid
 *   title="Loading Products"
 *   items={[]}
 *   loading={true}
 *   loadingCount={6}
 *   columns={3}
 *   renderCard={(product) => <ProductCard product={product} />}
 * />
 * ```
 * 
 * @example Custom columns and gap
 * ```tsx
 * <CardGrid
 *   items={users}
 *   columns={4}
 *   gap="lg"
 *   renderCard={(user) => (
 *     <Card>
 *       <CardContent>
 *         <Avatar src={user.avatar} />
 *         <p>{user.name}</p>
 *       </CardContent>
 *     </Card>
 *   )}
 * />
 * ```
 */
export function CardGrid<T>({
  title,
  description,
  items,
  renderCard,
  columns = 3,
  gap = "md",
  loadingCount = 6,
  emptyMessage = "No items to display",
  loading = false,
  error,
  permission,
  className,
}: CardGridProps<T>) {
  // Gap size mapping
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  // Column classes for responsive grid
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <WidgetContainer
      title={title}
      description={description}
      loading={false} // We handle loading state internally
      error={error}
      permission={permission}
      className={cn("h-full", className)}
      contentClassName="p-6"
    >
      <div
        className={cn(
          "grid",
          columnClasses[columns],
          gapClasses[gap]
        )}
      >
        {loading ? (
          // Show skeleton cards while loading
          Array.from({ length: loadingCount }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))
        ) : items.length === 0 ? (
          // Show empty state
          <EmptyState message={emptyMessage} />
        ) : (
          // Render actual cards
          items.map((item, index) => (
            <div key={index}>
              {renderCard(item, index)}
            </div>
          ))
        )}
      </div>
    </WidgetContainer>
  );
}
