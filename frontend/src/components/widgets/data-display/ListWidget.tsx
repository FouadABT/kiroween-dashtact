'use client';

"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { WidgetContainer } from "../core/WidgetContainer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BaseWidgetProps, ListItem } from "../types/widget.types";

/**
 * Props for the ListWidget component
 */
export interface ListWidgetProps extends BaseWidgetProps {
  /** Widget title */
  title: string;
  /** Array of list items */
  items: ListItem[];
  /** Optional click handler for items */
  onItemClick?: (item: ListItem) => void;
  /** Show chevron icon on items */
  showChevron?: boolean;
  /** Maximum height for scrollable area */
  maxHeight?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Optional description */
  description?: string;
}

/**
 * EmptyState Component
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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
 * ListItemComponent - Separate component for rendering individual list items
 */
interface ListItemComponentProps {
  item: ListItem;
  isClickable: boolean;
  showChevron: boolean;
  onItemClick?: (item: ListItem) => void;
}

function ListItemComponent({ item, isClickable, showChevron, onItemClick }: ListItemComponentProps) {
  const IconComponent = item.icon;
  
  return (
    <div
      onClick={() => onItemClick?.(item)}
      className={cn(
        "flex items-center gap-3 px-6 py-4 transition-colors",
        isClickable && "cursor-pointer hover:bg-muted/50 active:bg-muted",
        !isClickable && "cursor-default"
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onItemClick?.(item);
        }
      }}
      aria-label={item.title}
    >
      {/* Icon */}
      {IconComponent && (
        <div className="flex-shrink-0">
          <div className="p-2 rounded-lg bg-muted/50">
            <IconComponent className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* @ts-expect-error - TypeScript has issues with complex JSX inference */}
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {String(item.title)}
        </p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {String(item.description)}
          </p>
        )}
      </div>

      {/* Chevron */}
      {showChevron && isClickable && (
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}

      {/* Metadata badge (if exists) */}
      {item.metadata?.badge && typeof item.metadata.badge === 'string' && (
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {item.metadata.badge as string}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * ListWidget Component
 * 
 * Displays a scrollable list of items with icons and optional click handlers.
 * Shows an empty state when no items are provided.
 * 
 * @example Basic usage
 * ```tsx
 * <ListWidget
 *   title="Recent Activities"
 *   items={[
 *     { id: '1', title: 'User logged in', icon: LogIn },
 *     { id: '2', title: 'File uploaded', icon: Upload },
 *   ]}
 * />
 * ```
 * 
 * @example With click handler
 * ```tsx
 * <ListWidget
 *   title="Notifications"
 *   items={notifications}
 *   onItemClick={(item) => handleNotificationClick(item)}
 *   showChevron
 * />
 * ```
 * 
 * @example With descriptions
 * ```tsx
 * <ListWidget
 *   title="Tasks"
 *   items={[
 *     {
 *       id: '1',
 *       title: 'Complete project',
 *       description: 'Due tomorrow',
 *       icon: CheckCircle
 *     }
 *   ]}
 *   maxHeight="400px"
 * />
 * ```
 */
export function ListWidget({
  title,
  items,
  onItemClick,
  showChevron = false,
  maxHeight = "400px",
  emptyMessage = "No items to display",
  description,
  loading = false,
  error,
  permission,
  className,
}: ListWidgetProps) {
  const isClickable = !!onItemClick;

  return (
    <WidgetContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      permission={permission}
      className={cn("h-full", className)}
      contentClassName="p-0"
    >
      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ScrollArea style={{ maxHeight }}>
          <div className="divide-y divide-border">
            {items.map((item) => (
              <ListItemComponent
                key={item.id}
                item={item}
                isClickable={isClickable}
                showChevron={showChevron}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </WidgetContainer>
  );
}

