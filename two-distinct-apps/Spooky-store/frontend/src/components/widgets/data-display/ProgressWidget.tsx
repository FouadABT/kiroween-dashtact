"use client";

import React from "react";
import { WidgetContainer } from "../core/WidgetContainer";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BaseWidgetProps } from "../types/widget.types";

/**
 * Progress variant types
 */
export type ProgressVariant = "bar" | "circle";

/**
 * Props for the ProgressWidget component
 */
export interface ProgressWidgetProps extends BaseWidgetProps {
  /** Widget title */
  title: string;
  /** Current value */
  current: number;
  /** Maximum/target value */
  max: number;
  /** Progress variant (bar or circle) */
  variant?: ProgressVariant;
  /** Optional label for the progress */
  label?: string;
  /** Optional description */
  description?: string;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show value text (current/max) */
  showValue?: boolean;
  /** Optional color for the progress bar */
  color?: string;
}

/**
 * Calculate percentage from current and max values
 */
function calculatePercentage(current: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(Math.round((current / max) * 100), 100);
}

/**
 * CircularProgress Component
 * 
 * Renders a circular progress indicator using SVG
 */
function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = "primary",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Color mapping
  const colorClasses = {
    primary: "stroke-primary",
    secondary: "stroke-secondary",
    accent: "stroke-accent",
    success: "stroke-green-600 dark:stroke-green-400",
    warning: "stroke-yellow-600 dark:stroke-yellow-400",
    destructive: "stroke-destructive",
  };

  const strokeColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn("transition-all duration-300", strokeColor)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Percentage text in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

/**
 * ProgressWidget Component
 * 
 * Displays progress towards a goal with bar or circle variants.
 * Automatically calculates and displays percentage.
 * 
 * @example Bar variant
 * ```tsx
 * <ProgressWidget
 *   title="Storage Used"
 *   current={75}
 *   max={100}
 *   variant="bar"
 *   label="GB"
 *   showPercentage
 *   showValue
 * />
 * ```
 * 
 * @example Circle variant
 * ```tsx
 * <ProgressWidget
 *   title="Project Completion"
 *   current={45}
 *   max={100}
 *   variant="circle"
 *   description="Tasks completed"
 * />
 * ```
 * 
 * @example With custom color
 * ```tsx
 * <ProgressWidget
 *   title="Sales Target"
 *   current={8500}
 *   max={10000}
 *   variant="bar"
 *   color="success"
 *   showValue
 * />
 * ```
 */
export function ProgressWidget({
  title,
  current,
  max,
  variant = "bar",
  label,
  description,
  showPercentage = true,
  showValue = false,
  color = "primary",
  loading = false,
  error,
  permission,
  className,
}: ProgressWidgetProps) {
  const percentage = calculatePercentage(current, max);

  return (
    <WidgetContainer
      title={title}
      loading={loading}
      error={error}
      permission={permission}
      className={cn("h-full", className)}
      contentClassName="p-6"
    >
      <div className="space-y-4">
        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* Progress Display */}
        {variant === "bar" ? (
          <div className="space-y-3">
            {/* Progress Bar */}
            <Progress
              value={percentage}
              className="h-3"
            />

            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {showPercentage && (
                  <span className="font-semibold text-foreground">
                    {percentage}%
                  </span>
                )}
                {showValue && (
                  <span className="text-muted-foreground">
                    {current.toLocaleString()} / {max.toLocaleString()}
                    {label && ` ${label}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {/* Circular Progress */}
            <CircularProgress
              percentage={percentage}
              color={color}
            />

            {/* Value Display */}
            {showValue && (
              <p className="text-sm text-muted-foreground mt-4">
                {current.toLocaleString()} / {max.toLocaleString()}
                {label && ` ${label}`}
              </p>
            )}
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
