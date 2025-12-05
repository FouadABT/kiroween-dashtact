'use client';

/**
 * Section Editor with Properties Panel
 * 
 * Wrapper component that combines section-specific editor with common properties panel
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionPropertiesPanel } from './SectionPropertiesPanel';
import { HeroSectionEditor } from './editors/HeroSectionEditor';
import { FeaturesSectionEditor } from './editors/FeaturesSectionEditor';
import { TestimonialsSectionEditor } from './editors/TestimonialsSectionEditor';
import { CtaSectionEditor } from './editors/CtaSectionEditor';
import { StatsSectionEditor } from './editors/StatsSectionEditor';
import { ContentSectionEditor } from './editors/ContentSectionEditor';
import type { LandingPageSection } from '@/types/landing-cms';

interface SectionEditorWithPropertiesProps {
  section: LandingPageSection;
  onChange: (section: LandingPageSection) => void;
}

export function SectionEditorWithProperties({
  section,
  onChange,
}: SectionEditorWithPropertiesProps) {
  const handleContentChange = (content: any) => {
    onChange({
      ...section,
      content,
    });
  };

  const handleDesignChange = (design: any) => {
    onChange({
      ...section,
      design,
    });
  };

  const handleLayoutChange = (layout: any) => {
    onChange({
      ...section,
      layout,
    });
  };

  const handleAnimationChange = (animation: any) => {
    onChange({
      ...section,
      animation,
    });
  };

  const handleAdvancedChange = (advanced: any) => {
    onChange({
      ...section,
      advanced,
    });
  };

  // Render section-specific editor based on type
  const renderSectionEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <HeroSectionEditor
            data={section.content}
            onChange={handleContentChange}
          />
        );
      case 'features':
        return (
          <FeaturesSectionEditor
            data={section.content}
            onChange={handleContentChange}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsSectionEditor
            data={section.content}
            onChange={handleContentChange}
          />
        );
      case 'cta':
        return (
          <CtaSectionEditor
            data={section.content}
            onChange={handleContentChange}
          />
        );
      case 'stats':
        return (
          <StatsSectionEditor
            data={section.content}
            onChange={handleContentChange}
          />
        );
      case 'content':
        return (
          <ContentSectionEditor
            data={section.content}
            onSave={handleContentChange}
            onClose={() => {}}
          />
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Unknown section type: {section.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          {renderSectionEditor()}
        </TabsContent>

        <TabsContent value="properties" className="mt-4">
          <SectionPropertiesPanel
            design={section.design}
            layout={section.layout}
            animation={section.animation}
            advanced={section.advanced}
            onDesignChange={handleDesignChange}
            onLayoutChange={handleLayoutChange}
            onAnimationChange={handleAnimationChange}
            onAdvancedChange={handleAdvancedChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
