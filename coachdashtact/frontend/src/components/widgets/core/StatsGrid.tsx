"use client";

import React from "react";
import { StatsCard } from "./StatsCard";
import { cn } from "@/lib/utils";
import { BaseWidgetProps, StatItem } from "../types/widget.types";

/**
 * Props for the StatsGrid component
 */
export interface StatsGridProps extends BaseWidgetProps {
  /** Array of stat items to display */
  stats: StatItem[];
  /** Number of columns in the grid (2, 3, or 4) */
  columns?: 2 | 3 | 4;
  /** Show loading state for all cards */
  loading?: boolean;
}

/**
 * StatsGrid Component
 * 
 * Displays multiple StatsCard components in a responsive grid layout.
 * Automatically adapts to screen size with configurable column count.
 * 
 * @example Basic usage
 * ```tsx
 * <StatsGrid
 *   stats={[
 *     { title: "Total Users", value: 1234, icon: Users },
 *     { title: "Revenue", value: "$45,678", icon: DollarSign },
 *     { title: "Orders", value: 567, icon: ShoppingCart },
 *   ]}
 *   columns={3}
 * />
 * ```
 * 
 * @example With trends
 * ```tsx
 * <StatsGrid
 *   stats={[
 *     {
 *       title: "Active Users",
 *       value: 2543,
 *       icon: Users,
 *       trend: { value: 12, direction: 'up' }
 *     },
 *     {
 *       title: "Bounce Rate",
 *       value: "32%",
 *       icon: TrendingDown,
 *       trend: { value: 5, direction: 'down' }
 *     },
 *   ]}
 * />
 * ```
 * 
 * @example With loading state
 * ```tsx
 * <StatsGrid
 *   stats={statsData}
 *   loading={isLoading}
 *   columns={4}
 * />
 * ```
 */
export function StatsGrid({
  stats = [],
  columns = 3,
  loading = false,
  error,
  permission,
  className,
}: StatsGridProps) {
  // Ensure stats is always an array
  const safeStats = Array.isArray(stats) ? stats : [];
  
  // Grid column classes based on column count
  const gridColsClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const gridClass = gridColsClasses[columns] || gridColsClasses[3];
  
  // Show empty state if no stats
  if (safeStats.length === 0 && !loading) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-sm text-muted-foreground">
          No statistics to display
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridClass, className)}>
      {safeStats.map((stat, index) => (
        <StatsCard
          key={`${stat.title}-${index}`}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          color={stat.color}
          loading={loading}
          error={error}
          permission={permission}
        />
      ))}
    </div>
  );
}
