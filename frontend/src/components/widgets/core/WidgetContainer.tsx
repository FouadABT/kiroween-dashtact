"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, RefreshCw } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the WidgetContainer component
 */
export interface WidgetContainerProps {
  /** Widget title displayed in the header */
  title?: string;
  /** Optional description displayed below the title */
  description?: string;
  /** Optional action buttons or elements displayed in the header */
  actions?: React.ReactNode;
  /** Loading state - shows skeleton loader when true */
  loading?: boolean;
  /** Error message - displays error state when provided */
  error?: string;
  /** Optional callback when retry button is clicked in error state */
  onRetry?: () => void;
  /** Permission required to view this widget */
  permission?: string;
  /** Whether the widget can be collapsed */
  collapsible?: boolean;
  /** Default collapsed state (only applies if collapsible is true) */
  defaultCollapsed?: boolean;
  /** Widget content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS classes for the content area */
  contentClassName?: string;
}

/**
 * SkeletonLoader component for loading states
 */
function SkeletonLoader({ variant = "default" }: { variant?: "default" | "compact" | "tall" }) {
  const heights = {
    default: "h-32",
    compact: "h-20",
    tall: "h-48",
  };

  return (
    <div className="space-y-3">
      <Skeleton className={cn("w-full", heights[variant])} />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * ErrorState component for error display
 */
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * WidgetContainer Component
 * 
 * A flexible container component that provides consistent styling and features for all widgets.
 * Supports loading states, error handling, permission-based access control, and collapsible functionality.
 * 
 * @example Basic usage
 * ```tsx
 * <WidgetContainer title="User Statistics">
 *   <p>Widget content here</p>
 * </WidgetContainer>
 * ```
 * 
 * @example With loading state
 * ```tsx
 * <WidgetContainer title="Loading Data" loading={true}>
 *   <p>This won't be visible while loading</p>
 * </WidgetContainer>
 * ```
 * 
 * @example With error state
 * ```tsx
 * <WidgetContainer 
 *   title="Failed to Load" 
 *   error="Unable to fetch data"
 *   onRetry={() => refetch()}
 * >
 *   <p>This won't be visible when error is present</p>
 * </WidgetContainer>
 * ```
 * 
 * @example With permission check
 * ```tsx
 * <WidgetContainer 
 *   title="Admin Only" 
 *   permission="analytics:read"
 * >
 *   <p>Only visible to users with analytics:read permission</p>
 * </WidgetContainer>
 * ```
 * 
 * @example Collapsible widget
 * ```tsx
 * <WidgetContainer 
 *   title="Collapsible Widget" 
 *   collapsible={true}
 *   defaultCollapsed={false}
 * >
 *   <p>This content can be collapsed</p>
 * </WidgetContainer>
 * ```
 * 
 * @example With actions
 * ```tsx
 * <WidgetContainer 
 *   title="Widget with Actions"
 *   actions={
 *     <Button size="sm" variant="outline">
 *       <Plus className="h-4 w-4" />
 *     </Button>
 *   }
 * >
 *   <p>Widget content</p>
 * </WidgetContainer>
 * ```
 */
export function WidgetContainer({
  title,
  description,
  actions,
  loading = false,
  error,
  onRetry,
  permission,
  collapsible = false,
  defaultCollapsed = false,
  children,
  className,
  contentClassName,
}: WidgetContainerProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  // Render the widget content
  const renderContent = () => {
    // Show skeleton loader when loading
    if (loading) {
      return <SkeletonLoader />;
    }

    // Show error state when error is present
    if (error) {
      return <ErrorState message={error} onRetry={onRetry} />;
    }

    // Show actual content
    return children;
  };

  // Build the widget card
  const widgetCard = collapsible ? (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("bg-card text-card-foreground border-border min-h-[320px] flex flex-col", className)}>
        {(title || description || actions) && (
          <CardHeader>
            {title && (
              <CardTitle className="flex items-center justify-between">
                <span>{title}</span>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {isOpen ? "Collapse" : "Expand"}
                    </span>
                  </Button>
                </CollapsibleTrigger>
              </CardTitle>
            )}
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
            {actions && (
              <CardAction>{actions}</CardAction>
            )}
          </CardHeader>
        )}
        <CollapsibleContent>
          <CardContent className={cn("flex-1 flex flex-col", contentClassName)}>
            {renderContent()}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  ) : (
    <Card className={cn("bg-card text-card-foreground border-border min-h-[320px] flex flex-col", className)}>
      {(title || description || actions) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
          {actions && (
            <CardAction>{actions}</CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 flex flex-col", contentClassName)}>
        {renderContent()}
      </CardContent>
    </Card>
  );

  // Wrap in PermissionGuard if permission is specified
  if (permission) {
    return (
      <PermissionGuard permission={permission} fallback={null}>
        {widgetCard}
      </PermissionGuard>
    );
  }

  return widgetCard;
}
