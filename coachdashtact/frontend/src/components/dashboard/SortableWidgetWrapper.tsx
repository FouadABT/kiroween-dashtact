"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

/**
 * SortableWidgetWrapper Props
 */
export interface SortableWidgetWrapperProps {
  /** Unique identifier for the sortable item */
  id: string;
  /** Child components to render */
  children: React.ReactNode;
  /** Disable drag and drop */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SortableWidgetWrapper Component
 * 
 * Wraps widgets to make them sortable with drag and drop.
 * Uses @dnd-kit/sortable for drag and drop functionality.
 * 
 * Features:
 * - Drag handle integration
 * - Smooth transitions
 * - Visual feedback during drag
 * - Keyboard accessibility
 * 
 * @example
 * ```tsx
 * <SortableWidgetWrapper id="widget-1" disabled={!isEditMode}>
 *   <WidgetRenderer {...props} />
 * </SortableWidgetWrapper>
 * ```
 */
export function SortableWidgetWrapper({
  id,
  children,
  disabled = false,
  className,
}: SortableWidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        // Base styles
        'relative',
        // Dragging state
        isDragging && 'z-50 opacity-50',
        className
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

/**
 * Memoized SortableWidgetWrapper for performance optimization
 * Only re-renders when props change
 */
export const MemoizedSortableWidgetWrapper = React.memo(SortableWidgetWrapper);
