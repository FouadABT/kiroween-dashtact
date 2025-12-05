'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { KanbanColumn, KanbanItem, BaseWidgetProps } from '../types/widget.types';
import { GripVertical } from 'lucide-react';

interface KanbanBoardProps extends BaseWidgetProps {
  columns: KanbanColumn[];
  onItemMove?: (itemId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void;
  onItemClick?: (item: KanbanItem) => void;
  renderItem?: (item: KanbanItem) => React.ReactNode;
  maxHeight?: string;
}

interface SortableItemProps {
  item: KanbanItem;
  onItemClick?: (item: KanbanItem) => void;
  renderItem?: (item: KanbanItem) => React.ReactNode;
}

function SortableItem({ item, onItemClick, renderItem }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (renderItem) {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div className="flex items-start gap-2">
          <button
            className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1" onClick={() => onItemClick?.(item)}>
            {renderItem(item)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onItemClick?.(item)}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{item.title}</h4>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
              {item.metadata && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {String(value)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function KanbanBoard({
  columns: initialColumns,
  onItemMove,
  onItemClick,
  renderItem,
  maxHeight = '600px',
  permission,
  className = '',
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = columns
      .flatMap((col) => col.items)
      .find((item) => item.id === active.id);
    setActiveItem(item || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the columns
    const activeColumn = columns.find((col) =>
      col.items.some((item) => item.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.items.some((item) => item.id === overId)
    );

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    setColumns((cols) => {
      const activeItems = activeColumn.items;
      const overItems = overColumn.items;

      const activeIndex = activeItems.findIndex((item) => item.id === activeId);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      const activeItem = activeItems[activeIndex];

      return cols.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            items: activeItems.filter((item) => item.id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          const newItems = [...overItems];
          const insertIndex = overIndex >= 0 ? overIndex : overItems.length;
          newItems.splice(insertIndex, 0, { ...activeItem, columnId: overColumn.id });
          return {
            ...col,
            items: newItems,
          };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = columns.find((col) =>
      col.items.some((item) => item.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.items.some((item) => item.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    const activeIndex = activeColumn.items.findIndex((item) => item.id === activeId);
    const overIndex = overColumn.items.findIndex((item) => item.id === overId);

    if (activeColumn.id === overColumn.id && activeIndex !== overIndex) {
      // Reorder within same column
      setColumns((cols) =>
        cols.map((col) => {
          if (col.id === activeColumn.id) {
            const newItems = [...col.items];
            const [removed] = newItems.splice(activeIndex, 1);
            newItems.splice(overIndex, 0, removed);
            return { ...col, items: newItems };
          }
          return col;
        })
      );

      onItemMove?.(activeId, activeColumn.id, overColumn.id, overIndex);
    } else if (activeColumn.id !== overColumn.id) {
      // Move to different column
      const newIndex = overIndex >= 0 ? overIndex : overColumn.items.length;
      onItemMove?.(activeId, activeColumn.id, overColumn.id, newIndex);
    }
  };

  const content = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            style={{ maxHeight }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{column.title}</span>
                  <Badge variant="secondary">{column.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="pr-4" style={{ maxHeight: `calc(${maxHeight} - 80px)` }}>
                  <SortableContext
                    items={column.items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {column.items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Drop items here
                      </div>
                    ) : (
                      column.items.map((item) => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          onItemClick={onItemClick}
                          renderItem={renderItem}
                        />
                      ))
                    )}
                  </SortableContext>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <Card className="w-80 opacity-90 shadow-lg">
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-1">{activeItem.title}</h4>
              {activeItem.description && (
                <p className="text-xs text-muted-foreground">{activeItem.description}</p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  if (permission) {
    return (
      <PermissionGuard permission={permission} fallback={null}>
        {content}
      </PermissionGuard>
    );
  }

  return content;
}
