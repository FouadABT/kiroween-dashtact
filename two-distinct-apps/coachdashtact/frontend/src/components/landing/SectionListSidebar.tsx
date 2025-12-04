'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GripVertical, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingPageSection } from '@/types/landing-cms';

interface SectionListSidebarProps {
  sections: LandingPageSection[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onToggleVisibility: (sectionId: string) => void;
}

interface SortableSectionItemProps {
  section: LandingPageSection;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative border border-border rounded-lg bg-card transition-all',
        isDragging && 'opacity-50 shadow-lg',
        isSelected && 'ring-2 ring-primary',
        !section.visible && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-2 p-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Section Info */}
        <button
          onClick={onSelect}
          className="flex-1 text-left min-w-0"
        >
          <div className="font-medium text-sm text-foreground truncate">
            {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
          </div>
          <div className="text-xs text-muted-foreground">
            Order: {section.order + 1}
          </div>
        </button>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            title={section.visible ? 'Hide section' : 'Show section'}
            className="h-8 w-8 p-0"
          >
            {section.visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate section"
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete section"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SectionListSidebar({
  sections,
  selectedSectionId,
  onSelectSection,
  onDuplicateSection,
  onDeleteSection,
  onToggleVisibility,
}: SectionListSidebarProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-2">
        {sections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No sections yet</p>
            <p className="text-xs mt-1">Add sections to get started</p>
          </div>
        ) : (
          sections.map((section) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
              onDuplicate={() => onDuplicateSection(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              onToggleVisibility={() => onToggleVisibility(section.id)}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
