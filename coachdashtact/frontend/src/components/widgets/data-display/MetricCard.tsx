"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { WidgetContainer } from "../core/WidgetContainer";
import { cn } from "@/lib/utils";
import { BaseWidgetProps } from "../types/widget.types";

/**
 * Comparison data for showing previous period metrics
 */
export interface ComparisonData {
  /** Previous period value */
  previousValue: number;
  /** Percentage change */
  percentageChange: number;
  /** Period label (e.g., "vs last month") */
  period?: string;
}

/**
 * Format type for metric values
 */
export type MetricFormat = "number" | "currency" | "percentage";

/**
 * Props for the MetricCard component
 */
export interface MetricCardProps extends BaseWidgetProps {
  /** Metric label */
  label: string;
  /** Metric value */
  value: number;
  /** Format type for the value */
  format?: MetricFormat;
  /** Currency code (used when format is 'currency') */
  currency?: string;
  /** Optional icon from Lucide React */
  icon?: LucideIcon;
  /** Optional comparison data */
  comparison?: ComparisonData;
  /** Optional description */
  description?: string;
  /** Optional color token */
  color?: string;
}

/**
 * Format a number based on the specified format type
 */
function formatValue(value: number, format: MetricFormat, currency: string = "USD"): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "number":
    default:
      return new Intl.NumberFormat("en-US").format(value);
  }
}

/**
 * MetricCard Component
 * 
 * Displays a large metric value with optional comparison data and formatting.
 * Supports number, currency, and percentage formatting.
 * 
 * @example Basic usage
 * ```tsx
 * <MetricCard
 *   label="Total Revenue"
 *   value={45678}
 *   format="currency"
 * />
 * ```
 * 
 * @example With comparison
 * ```tsx
 * <MetricCard
 *   label="Active Users"
 *   value={1234}
 *   format="number"
 *   comparison={{
 *     previousValue: 1100,
 *     percentageChange: 12.2,
 *     period: "vs last month"
 *   }}
 *   icon={Users}
 * />
 * ```
 * 
 * @example Percentage format
 * ```tsx
 * <MetricCard
 *   label="Conversion Rate"
 *   value={3.5}
 *   format="percentage"
 *   description="Last 30 days"
 * />
 * ```
 */
export function MetricCard({
  label,
  value,
  format = "number",
  currency = "USD",
  icon: Icon,
  comparison,
  description,
  color = "primary",
  loading = false,
  error,
  permission,
  className,
}: MetricCardProps) {
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

  // Format the main value
  const formattedValue = formatValue(value, format, currency);

  // Calculate comparison direction
  const comparisonDirection = comparison && comparison.percentageChange >= 0 ? "up" : "down";
  const comparisonColorClasses = {
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
          {/* Label */}
          <p className="text-sm font-medium text-muted-foreground mb-3">
            {label}
          </p>

          {/* Value - Large display */}
          <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {formattedValue}
          </p>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground mb-2">
              {description}
            </p>
          )}

          {/* Comparison Data */}
          {comparison && (
            <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                {comparisonDirection === "up" ? (
                  <TrendingUp className={cn("h-4 w-4", comparisonColorClasses.up)} />
                ) : (
                  <TrendingDown className={cn("h-4 w-4", comparisonColorClasses.down)} />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    comparisonColorClasses[comparisonDirection]
                  )}
                >
                  {Math.abs(comparison.percentageChange).toFixed(1)}%
                </span>
                {comparison.period && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {comparison.period}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Previous: {formatValue(comparison.previousValue, format, currency)}
              </p>
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={cn("p-3 rounded-lg bg-muted/50", iconColorClass)}>
            <Icon className="h-7 w-7" />
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
