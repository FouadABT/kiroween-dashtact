"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { WidgetContainer } from "./WidgetContainer";
import { cn } from "@/lib/utils";
import { BaseWidgetProps } from "../types/widget.types";

/**
 * Trend data for showing increase/decrease indicators
 */
export interface TrendData {
  /** Percentage value (e.g., 12 for 12%) */
  value: number;
  /** Direction of trend */
  direction: "up" | "down";
  /** Optional period label (e.g., "vs last month") */
  period?: string;
}

/**
 * Props for the StatsCard component
 */
export interface StatsCardProps extends BaseWidgetProps {
  /** Stat title/label */
  title: string;
  /** Stat value (number or formatted string) */
  value: string | number;
  /** Optional icon from Lucide React */
  icon?: LucideIcon;
  /** Optional trend indicator */
  trend?: TrendData;
  /** Optional color token (primary, secondary, accent, etc.) */
  color?: string;
  /** Optional description */
  description?: string;
}

/**
 * StatsCard Component
 * 
 * Displays a single metric with optional icon, trend indicator, and color.
 * Responsive text sizing adapts to screen size.
 * 
 * @example Basic usage
 * ```tsx
 * <StatsCard
 *   title="Total Users"
 *   value={1234}
 * />
 * ```
 * 
 * @example With icon and trend
 * ```tsx
 * <StatsCard
 *   title="Revenue"
 *   value="$45,678"
 *   icon={DollarSign}
 *   trend={{ value: 12, direction: 'up', period: 'vs last month' }}
 *   color="primary"
 * />
 * ```
 * 
 * @example With permission
 * ```tsx
 * <StatsCard
 *   title="Admin Stats"
 *   value={999}
 *   permission="analytics:read"
 * />
 * ```
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
  description,
  loading = false,
  error,
  permission,
  className,
}: StatsCardProps) {
  // Color mapping to Tailwind classes
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  const iconColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  // Trend color classes
  const trendColorClasses = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
  };

  return (
    <WidgetContainer
      loading={loading}
      error={error}
      permission={permission}
      className={cn("h-full", className)}
      contentClassName="p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>

          {/* Value - Responsive sizing */}
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {value}
          </p>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}

          {/* Trend Indicator */}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === "up" ? (
                <TrendingUp className={cn("h-4 w-4", trendColorClasses.up)} />
              ) : (
                <TrendingDown className={cn("h-4 w-4", trendColorClasses.down)} />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trendColorClasses[trend.direction]
                )}
              >
                {trend.value}%
              </span>
              {trend.period && (
                <span className="text-xs text-muted-foreground ml-1">
                  {trend.period}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={cn("p-3 rounded-lg bg-muted/50", iconColorClass)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
