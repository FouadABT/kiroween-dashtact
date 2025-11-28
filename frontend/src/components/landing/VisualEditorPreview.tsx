'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import type { LandingPageSection, PreviewMode } from '@/types/landing-cms';

interface VisualEditorPreviewProps {
  sections: LandingPageSection[];
  previewMode: PreviewMode;
  themeMode: 'light' | 'dark';
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onToggleVisibility: (sectionId: string) => void;
}

const DEVICE_DIMENSIONS = {
  mobile: { width: 375, height: 667, label: 'iPhone SE' },
  tablet: { width: 768, height: 1024, label: 'iPad' },
  desktop: { width: 1440, height: 900, label: 'Desktop' },
  wide: { width: 1920, height: 1080, label: 'Wide Screen' },
};

interface SectionPreviewProps {
  section: LandingPageSection;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (hover: boolean) => void;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  themeMode: 'light' | 'dark';
}

function SectionPreview({
  section,
  isSelected,
  isHovered,
  onHover,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  themeMode,
}: SectionPreviewProps) {
  return (
    <div
      className={cn(
        'relative transition-all',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        !section.visible && 'opacity-50'
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onSelect}
    >
      {/* Hover Overlay with Quick Actions */}
      {isHovered && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary z-10 pointer-events-none">
          <div className="absolute top-2 right-2 flex gap-1 pointer-events-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              title="Edit section"
              className="h-8 w-8 p-0 shadow-lg"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              title={section.visible ? 'Hide section' : 'Show section'}
              className="h-8 w-8 p-0 shadow-lg"
            >
              {section.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title="Duplicate section"
              className="h-8 w-8 p-0 shadow-lg"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete section"
              className="h-8 w-8 p-0 shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Section Content */}
      <div
        className={cn(
          'min-h-[200px] p-8 border border-border',
          themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        )}
        style={{
          background: section.design?.background,
          backgroundImage: section.design?.backgroundImage
            ? `url(${section.design.backgroundImage})`
            : undefined,
          padding: section.layout?.padding,
          margin: section.layout?.margin,
        }}
      >
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">
            {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
          </h3>
          <p className="text-muted-foreground">
            Section content will be rendered here
          </p>
          {section.content && (
            <pre className="mt-4 text-xs text-left bg-muted p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(section.content, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export function VisualEditorPreview({
  sections,
  previewMode,
  themeMode,
  selectedSectionId,
  onSelectSection,
  onDuplicateSection,
  onDeleteSection,
  onToggleVisibility,
}: VisualEditorPreviewProps) {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dimensions = DEVICE_DIMENSIONS[previewMode];
  const isFullWidth = previewMode === 'desktop' || previewMode === 'wide';

  // Scroll to selected section
  useEffect(() => {
    if (selectedSectionId && containerRef.current) {
      const element = containerRef.current.querySelector(
        `[data-section-id="${selectedSectionId}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedSectionId]);

  return (
    <div className="flex-1 overflow-auto bg-muted p-8">
      <div className="flex justify-center">
        {/* Device Frame */}
        <div
          className={cn(
            'bg-background shadow-2xl transition-all duration-300',
            !isFullWidth && 'rounded-3xl border-8 border-gray-800'
          )}
          style={{
            width: isFullWidth ? '100%' : dimensions.width,
            maxWidth: isFullWidth ? '100%' : dimensions.width,
          }}
        >
          {/* Device Header (for mobile/tablet) */}
          {!isFullWidth && (
            <div className="h-8 bg-gray-800 rounded-t-2xl flex items-center justify-center">
              <div className="text-xs text-gray-400 font-medium">
                {dimensions.label} - {dimensions.width}x{dimensions.height}
              </div>
            </div>
          )}

          {/* Preview Content */}
          <div
            ref={containerRef}
            className={cn(
              'overflow-auto bg-background',
              !isFullWidth && 'rounded-b-2xl'
            )}
            style={{
              height: isFullWidth ? 'auto' : dimensions.height,
              maxHeight: isFullWidth ? 'none' : dimensions.height,
            }}
          >
            {sections.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium">No sections to preview</p>
                  <p className="text-sm mt-2">Add sections to see them here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {sections.map((section) => (
                  <div key={section.id} data-section-id={section.id}>
                    <SectionPreview
                      section={section}
                      isSelected={selectedSectionId === section.id}
                      isHovered={hoveredSectionId === section.id}
                      onHover={(hover) =>
                        setHoveredSectionId(hover ? section.id : null)
                      }
                      onSelect={() => onSelectSection(section.id)}
                      onDuplicate={() => onDuplicateSection(section.id)}
                      onDelete={() => onDeleteSection(section.id)}
                      onToggleVisibility={() => onToggleVisibility(section.id)}
                      themeMode={themeMode}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device Footer (for mobile/tablet) */}
          {!isFullWidth && (
            <div className="h-8 bg-gray-800 rounded-b-2xl" />
          )}
        </div>
      </div>
    </div>
  );
}
