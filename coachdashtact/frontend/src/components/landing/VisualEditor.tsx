'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Undo, Redo, Monitor, Tablet, Smartphone, Maximize, Sun, Moon, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SectionListSidebar } from './SectionListSidebar';
import { VisualEditorPreview } from './VisualEditorPreview';
import { ComponentLibrary } from './ComponentLibrary';
import type { LandingPageSection, PreviewMode, EditorHistoryState, SectionTemplate } from '@/types/landing-cms';

interface VisualEditorProps {
  initialSections: LandingPageSection[];
  onSave: (sections: LandingPageSection[]) => Promise<void>;
  autoSaveEnabled?: boolean;
}

const MAX_HISTORY = 50;

export function VisualEditor({
  initialSections,
  onSave,
  autoSaveEnabled = true,
}: VisualEditorProps) {
  // State
  const [sections, setSections] = useState<LandingPageSection[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<EditorHistoryState[]>([
    { sections: initialSections, timestamp: Date.now() },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);

  // Debounced sections for auto-save
  const [debouncedSections] = useDebounce(sections, 3000);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Add to history
  const addToHistory = useCallback((newSections: LandingPageSection[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ sections: newSections, timestamp: Date.now() });
      
      // Keep only last MAX_HISTORY items
      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(-MAX_HISTORY);
      }
      
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Update sections with history
  const updateSections = useCallback((newSections: LandingPageSection[]) => {
    setSections(newSections);
    addToHistory(newSections);
  }, [addToHistory]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSections(history[newIndex].sections);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSections(history[newIndex].sections);
    }
  }, [history, historyIndex]);

  // Drag end handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = [...sections];
      const [movedSection] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, movedSection);

      // Update order property
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      updateSections(reorderedSections);
    }
  }, [sections, updateSections]);

  // Section actions
  const handleEditSection = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
  }, []);

  const handleDuplicateSection = useCallback((sectionId: string) => {
    const sectionToDuplicate = sections.find((s) => s.id === sectionId);
    if (!sectionToDuplicate) return;

    const newSection: LandingPageSection = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}`,
      order: sectionToDuplicate.order + 1,
    };

    const newSections = [...sections];
    const insertIndex = sections.findIndex((s) => s.id === sectionId) + 1;
    newSections.splice(insertIndex, 0, newSection);

    // Update order for sections after the duplicated one
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index,
    }));

    updateSections(reorderedSections);
    toast.success('Section duplicated');
  }, [sections, updateSections]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    const newSections = sections
      .filter((s) => s.id !== sectionId)
      .map((section, index) => ({
        ...section,
        order: index,
      }));

    updateSections(newSections);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
    toast.success('Section deleted');
  }, [sections, selectedSectionId, updateSections]);

  const handleToggleVisibility = useCallback((sectionId: string) => {
    const newSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, visible: !section.visible }
        : section
    );
    updateSections(newSections);
  }, [sections, updateSections]);

  const handleSelectTemplate = useCallback((template: SectionTemplate) => {
    const newSection: LandingPageSection = {
      id: `section-${Date.now()}`,
      type: template.section.type,
      content: template.section.data,
      visible: true,
      order: sections.length,
    };
    const newSections = [...sections, newSection];
    updateSections(newSections);
    setSelectedSectionId(newSection.id);
  }, [sections, updateSections]);

  // Save handler
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(sections);
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [sections, onSave]);

  // Auto-save effect
  useEffect(() => {
    if (autoSaveEnabled && debouncedSections !== initialSections) {
      handleSave();
    }
  }, [debouncedSections, autoSaveEnabled, handleSave, initialSections]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
      // Save: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave]);

  const previewModeIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
    wide: Maximize,
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Sections</h2>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowComponentLibrary(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <SectionListSidebar
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSelectSection={handleEditSection}
              onDuplicateSection={handleDuplicateSection}
              onDeleteSection={handleDeleteSection}
              onToggleVisibility={handleToggleVisibility}
            />
          </SortableContext>
        </DndContext>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview Mode Selector */}
            {Object.entries(previewModeIcons).map(([mode, Icon]) => (
              <Button
                key={mode}
                variant={previewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode(mode as PreviewMode)}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
            <Separator orientation="vertical" className="h-6" />
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              title="Toggle Theme"
            >
              {themeMode === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <VisualEditorPreview
          sections={sections}
          previewMode={previewMode}
          themeMode={themeMode}
          selectedSectionId={selectedSectionId}
          onSelectSection={handleEditSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
          onToggleVisibility={handleToggleVisibility}
        />
      </div>

      {/* Component Library Modal */}
      <ComponentLibrary
        open={showComponentLibrary}
        onOpenChange={setShowComponentLibrary}
        onSelectTemplate={handleSelectTemplate}
        currentSection={selectedSectionId ? sections.find(s => s.id === selectedSectionId) : undefined}
      />
    </div>
  );
}
