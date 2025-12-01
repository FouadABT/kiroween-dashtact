'use client';

"use client";

import React, { Suspense, useState } from 'react';
import { X, GripVertical, Settings2 } from 'lucide-react';
import { getWidgetComponent, getWidgetMetadata } from '@/lib/widget-registry';
import { SkeletonLoader } from '@/components/widgets/layout/SkeletonLoader';
import { ErrorBoundary } from '@/components/widgets/layout/ErrorBoundary';
import { useWidgets } from '@/contexts/WidgetContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { WidgetConfig } from '@/types/widgets';

/**
 * WidgetRenderer Props
 */
export interface WidgetRendererProps {
  /** Widget key to look up in registry */
  widgetKey: string;
  /** Widget configuration */
  config: WidgetConfig;
  /** Edit mode flag */
  isEditMode?: boolean;
  /** Widget instance ID (for removal) */
  widgetId?: string;
  /** Layout ID (for removal) */
  layoutId?: string;
  /** Current grid span */
  gridSpan?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * WidgetRenderer Component
 * 
 * Dynamically renders widgets from the registry with:
 * - Component lookup by widget key
 * - Configuration passing as props
 * - Loading states with Suspense and SkeletonLoader
 * - Error handling with ErrorBoundary
 * - Edit mode controls (drag handle, remove button)
 * - Error message for missing widgets
 * 
 * @example
 * ```tsx
 * <WidgetRenderer
 *   widgetKey="stats-card"
 *   config={{ title: "Users", value: 1234 }}
 *   isEditMode={false}
 * />
 * ```
 */
export function WidgetRenderer({
  widgetKey,
  config,
  isEditMode = false,
  widgetId,
  layoutId,
  gridSpan = 6,
  className,
}: WidgetRendererProps) {
  const { removeWidget, updateWidget } = useWidgets();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedGridSpan, setSelectedGridSpan] = useState(gridSpan.toString());

  // Look up widget component in registry
  const WidgetComponent = getWidgetComponent(widgetKey);
  
  // Get widget metadata (including default props)
  const widgetMetadata = getWidgetMetadata(widgetKey);
  
  // Merge default props with config
  const mergedProps = {
    ...(widgetMetadata?.defaultProps || {}),
    ...config,
  };

  /**
   * Handle widget removal
   */
  const handleRemove = async () => {
    if (!widgetId || !layoutId) return;

    setIsRemoving(true);
    
    try {
      await removeWidget(layoutId, widgetId);
      setShowRemoveDialog(false);
    } catch (error) {
      console.error('Failed to remove widget:', error);
      alert('Failed to remove widget. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  /**
   * Handle grid span change
   */
  const handleGridSpanChange = async () => {
    if (!widgetId || !layoutId) return;

    const newGridSpan = parseInt(selectedGridSpan, 10);
    if (newGridSpan === gridSpan) {
      setShowSettingsDialog(false);
      return;
    }

    try {
      await updateWidget(layoutId, widgetId, { gridSpan: newGridSpan });
      setShowSettingsDialog(false);
    } catch (error) {
      console.error('Failed to update widget:', error);
      alert('Failed to update widget. Please try again.');
    }
  };

  // Widget not found in registry
  if (!WidgetComponent) {
    return (
      <div
        className={cn(
          'flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-6 text-center',
          className
        )}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="mb-3 text-destructive">
          <X className="h-8 w-8" aria-hidden="true" />
        </div>
        <h3 className="mb-2 text-sm font-semibold text-destructive" id={`widget-error-${widgetId}`}>
          Widget not found
        </h3>
        <p className="text-xs text-muted-foreground">
          Widget key: <code className="rounded bg-muted px-1 py-0.5">{widgetKey}</code>
        </p>
        {isEditMode && widgetId && layoutId && (
          <Button
            onClick={handleRemove}
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={isRemoving}
            aria-label={`Remove widget ${widgetKey}`}
            aria-describedby={`widget-error-${widgetId}`}
          >
            {isRemoving ? 'Removing...' : 'Remove Widget'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={cn('relative', className)} role="group" aria-label={`Widget: ${widgetKey}`}>
        {/* Edit mode controls */}
        {isEditMode && (
          <div className="absolute right-2 top-2 z-10 flex gap-2" role="toolbar" aria-label="Widget controls">
            {/* Drag handle */}
            <div
              className="cursor-move rounded bg-background/80 p-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              title="Drag to reorder"
              tabIndex={0}
              role="button"
              aria-label="Drag to reorder widget"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // Drag functionality is handled by dnd-kit
                }
              }}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>

            {/* Settings button (grid span adjustment) */}
            {widgetId && layoutId && (
              <Button
                onClick={() => setShowSettingsDialog(true)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded bg-background/80 shadow-sm backdrop-blur-sm hover:bg-accent focus:ring-2 focus:ring-ring focus:ring-offset-2"
                title="Widget settings"
                aria-label="Open widget settings"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}

            {/* Remove button */}
            {widgetId && layoutId && (
              <Button
                onClick={() => setShowRemoveDialog(true)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded bg-background/80 shadow-sm backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={isRemoving}
                title="Remove widget"
                aria-label="Remove widget from dashboard"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}

        {/* Widget content with error boundary and suspense */}
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error(`Error in widget ${widgetKey}:`, error, errorInfo);
          }}
        >
          <Suspense
            fallback={
              <div className="rounded-lg border border-border bg-card p-6">
                <SkeletonLoader variant="card" count={1} />
              </div>
            }
          >
            <WidgetComponent {...mergedProps} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Widget</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this widget from your dashboard? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove Widget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Widget Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Widget Settings</DialogTitle>
            <DialogDescription>
              Adjust the width of this widget on your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="grid-span" className="text-sm font-medium">
                Widget Width (Grid Columns)
              </label>
              <Select
                value={selectedGridSpan}
                onValueChange={setSelectedGridSpan}
              >
                <SelectTrigger id="grid-span">
                  <SelectValue placeholder="Select width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 column (Narrow)</SelectItem>
                  <SelectItem value="2">2 columns</SelectItem>
                  <SelectItem value="3">3 columns (Quarter)</SelectItem>
                  <SelectItem value="4">4 columns (Third)</SelectItem>
                  <SelectItem value="6">6 columns (Half)</SelectItem>
                  <SelectItem value="8">8 columns (Two-thirds)</SelectItem>
                  <SelectItem value="9">9 columns (Three-quarters)</SelectItem>
                  <SelectItem value="12">12 columns (Full width)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current width: {gridSpan} {gridSpan === 1 ? 'column' : 'columns'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedGridSpan(gridSpan.toString());
                setShowSettingsDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleGridSpanChange}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Memoized WidgetRenderer for performance optimization
 * Only re-renders when props change
 */
export const MemoizedWidgetRenderer = React.memo(WidgetRenderer);

