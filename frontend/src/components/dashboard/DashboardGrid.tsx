"use client";

import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useWidgets } from '@/contexts/WidgetContext';
import { SortableWidgetWrapper } from './SortableWidgetWrapper';
import { WidgetRenderer } from './WidgetRenderer';
import { cn } from '@/lib/utils';

/**
 * DashboardGrid Props
 */
export interface DashboardGridProps {
  /** Page ID to fetch layout for */
  pageId: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DashboardGrid Component
 * 
 * Renders widgets in a responsive CSS Grid layout (12-column system).
 * Supports responsive breakpoints:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 12 columns
 * 
 * Maps gridSpan to Tailwind col-span classes for flexible widget sizing.
 * 
 * @example
 * ```tsx
 * <DashboardGrid pageId="overview" />
 * ```
 */
export function DashboardGrid({ pageId, className }: DashboardGridProps) {
  const { currentLayout, isLoading, isEditMode, error, fetchLayouts, reorderWidgets, clearError } = useWidgets();

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch layout on mount or when pageId changes
  React.useEffect(() => {
    fetchLayouts(pageId);
  }, [pageId, fetchLayouts]);

  // Sort widgets by position
  const sortedWidgets = useMemo(() => {
    if (!currentLayout?.widgetInstances) return [];
    
    return [...currentLayout.widgetInstances]
      .filter(widget => widget.isVisible)
      .sort((a, b) => a.position - b.position);
  }, [currentLayout]);

  // Error state
  if (error && !currentLayout) {
    return (
      <div className={cn('flex min-h-[400px] items-center justify-center', className)}>
        <div 
          className="max-w-md rounded-lg border border-destructive bg-destructive/10 p-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/20 p-3">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            Failed to load dashboard
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {error}
          </p>
          <button
            onClick={() => {
              clearError();
              fetchLayouts(pageId);
            }}
            className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Retry loading dashboard"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && !currentLayout) {
    return (
      <div className={cn('grid grid-cols-1 gap-4', className)} aria-busy="true" aria-live="polite">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-20 w-full rounded bg-muted" />
          </div>
        </div>
        <span className="sr-only">Loading dashboard...</span>
      </div>
    );
  }

  // Empty state
  if (!currentLayout || sortedWidgets.length === 0) {
    return (
      <div className={cn('flex min-h-[400px] items-center justify-center', className)}>
        <div className="text-center" role="status">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No widgets configured
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Click "Add Widget" to start customizing your dashboard'
              : 'This dashboard has no widgets configured'}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Get Tailwind col-span class for grid span value
   * Maps 1-12 to corresponding Tailwind classes
   */
  const getColSpanClass = (gridSpan: number): string => {
    // Clamp gridSpan between 1 and 12
    const span = Math.max(1, Math.min(12, gridSpan));
    
    // Map to Tailwind classes
    const spanMap: Record<number, string> = {
      1: 'lg:col-span-1',
      2: 'lg:col-span-2',
      3: 'lg:col-span-3',
      4: 'lg:col-span-4',
      5: 'lg:col-span-5',
      6: 'lg:col-span-6',
      7: 'lg:col-span-7',
      8: 'lg:col-span-8',
      9: 'lg:col-span-9',
      10: 'lg:col-span-10',
      11: 'lg:col-span-11',
      12: 'lg:col-span-12',
    };
    
    return spanMap[span] || 'lg:col-span-6';
  };

  /**
   * Get grid row class if specified
   */
  const getGridRowClass = (gridRow: number | null): string => {
    if (gridRow === null) return '';
    return `lg:row-start-${gridRow}`;
  };

  /**
   * Handle drag end event
   * Reorders widgets based on drag and drop
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !currentLayout) {
      return;
    }

    // Find old and new indices
    const oldIndex = sortedWidgets.findIndex((w) => w.id === active.id);
    const newIndex = sortedWidgets.findIndex((w) => w.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reorder widgets array
    const reorderedWidgets = arrayMove(sortedWidgets, oldIndex, newIndex);

    // Create updates array with new positions
    const updates = reorderedWidgets.map((widget, index) => ({
      id: widget.id,
      position: index,
      gridRow: widget.gridRow,
    }));

    // Update via context (with optimistic updates)
    reorderWidgets(currentLayout.id, updates);
  };

  // Render without drag-and-drop in view mode (lighter bundle)
  if (!isEditMode) {
    return (
      <div
        className={cn(
          // Base grid layout
          'grid gap-4',
          // Responsive columns
          'grid-cols-1',           // Mobile: 1 column
          'md:grid-cols-2',        // Tablet: 2 columns
          'lg:grid-cols-12',       // Desktop: 12 columns
          // Auto-flow for flexible layout
          'auto-rows-auto',
          className
        )}
        role="region"
        aria-label="Dashboard widgets"
      >
        {sortedWidgets.map((widget, index) => (
          <div
            key={widget.id}
            className={cn(
              // Full width on mobile and tablet
              'col-span-1 md:col-span-2',
              // Dynamic span on desktop
              getColSpanClass(widget.gridSpan),
              // Grid row if specified
              getGridRowClass(widget.gridRow),
              // Transition for smooth layout changes
              'transition-all duration-200'
            )}
            role="article"
            aria-label={`Widget ${index + 1} of ${sortedWidgets.length}`}
          >
            <WidgetRenderer
              widgetKey={widget.widgetKey}
              config={widget.config}
              isEditMode={false}
              widgetId={widget.id}
              layoutId={currentLayout.id}
              gridSpan={widget.gridSpan}
            />
          </div>
        ))}
      </div>
    );
  }

  // Render with drag-and-drop in edit mode
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            return `Picked up widget ${active.id}. Use arrow keys to move, space to drop.`;
          },
          onDragOver({ active, over }) {
            if (over) {
              return `Widget ${active.id} is over position ${over.id}`;
            }
            return `Widget ${active.id} is no longer over a droppable area`;
          },
          onDragEnd({ active, over }) {
            if (over) {
              return `Widget ${active.id} was dropped at position ${over.id}`;
            }
            return `Widget ${active.id} was dropped`;
          },
          onDragCancel({ active }) {
            return `Dragging was cancelled. Widget ${active.id} was returned to its original position.`;
          },
        },
      }}
    >
      <SortableContext
        items={sortedWidgets.map((w) => w.id)}
        strategy={verticalListSortingStrategy}
        disabled={false}
      >
        <div
          className={cn(
            // Base grid layout
            'grid gap-4',
            // Responsive columns
            'grid-cols-1',           // Mobile: 1 column
            'md:grid-cols-2',        // Tablet: 2 columns
            'lg:grid-cols-12',       // Desktop: 12 columns
            // Auto-flow for flexible layout
            'auto-rows-auto',
            className
          )}
          role="region"
          aria-label="Dashboard widgets (edit mode)"
          aria-describedby="edit-mode-instructions"
        >
          <div id="edit-mode-instructions" className="sr-only">
            You are in edit mode. Use Tab to navigate between widgets. 
            Press Space or Enter on a widget to start dragging. 
            Use arrow keys to move the widget. Press Space or Enter again to drop.
          </div>
          {sortedWidgets.map((widget, index) => (
            <SortableWidgetWrapper
              key={widget.id}
              id={widget.id}
              disabled={false}
              className={cn(
                // Full width on mobile and tablet
                'col-span-1 md:col-span-2',
                // Dynamic span on desktop
                getColSpanClass(widget.gridSpan),
                // Grid row if specified
                getGridRowClass(widget.gridRow),
                // Transition for smooth layout changes
                'transition-all duration-200'
              )}
            >
              <WidgetRenderer
                widgetKey={widget.widgetKey}
                config={widget.config}
                isEditMode={true}
                widgetId={widget.id}
                layoutId={currentLayout.id}
                gridSpan={widget.gridSpan}
              />
            </SortableWidgetWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * Memoized DashboardGrid for performance optimization
 */
export const MemoizedDashboardGrid = React.memo(DashboardGrid);
