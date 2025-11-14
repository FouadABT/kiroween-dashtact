'use client';

/**
 * Section List Component
 * 
 * Displays and manages the list of landing page sections with drag-and-drop reordering.
 */

import { useState } from 'react';
import { LandingPageSection, SectionType } from '@/types/landing-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SectionLibrary } from '@/components/landing/SectionLibrary';
import { SectionEditor } from '@/components/landing/SectionEditor';

interface SectionListProps {
  sections: LandingPageSection[];
  onChange: (sections: LandingPageSection[]) => void;
}

export function SectionList({ sections, onChange }: SectionListProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleAddSection = (type: SectionType) => {
    const newSection: LandingPageSection = {
      id: `${type}-${Date.now()}`,
      type,
      enabled: true,
      order: sections.length,
      data: getDefaultSectionData(type) as any,
    };
    onChange([...sections, newSection]);
    setShowLibrary(false);
    setEditingSection(newSection.id);
  };

  const handleToggleEnabled = (id: string) => {
    onChange(
      sections.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const handleDeleteSection = (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    onChange(sections.filter((section) => section.id !== id));
  };

  const handleDuplicateSection = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;

    const newSection: LandingPageSection = {
      ...section,
      id: `${section.type}-${Date.now()}`,
      order: sections.length,
    };
    onChange([...sections, newSection]);
  };

  const handleUpdateSection = (id: string, data: any) => {
    onChange(
      sections.map((section) =>
        section.id === id ? { ...section, data } : section
      )
    );
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newSections = [...sortedSections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    
    // Update order values
    const reordered = newSections.map((section, index) => ({
      ...section,
      order: index,
    }));
    
    onChange(reordered);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    handleReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sections</h2>
        <Button onClick={() => setShowLibrary(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      <div className="space-y-3">
        {sortedSections.map((section, index) => (
          <Card
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {getSectionIcon(section.type)}
                      {getSectionTitle(section.type)}
                      {!section.enabled && (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleEnabled(section.id)}
                  >
                    {section.enabled ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingSection(
                        editingSection === section.id ? null : section.id
                      )
                    }
                  >
                    {editingSection === section.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateSection(section.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editingSection === section.id && (
              <CardContent>
                <SectionEditor
                  section={section}
                  onChange={(data) => handleUpdateSection(section.id, data)}
                />
              </CardContent>
            )}
          </Card>
        ))}

        {sections.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">No sections yet</p>
              <Button onClick={() => setShowLibrary(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Section
              </Button>
            </div>
          </Card>
        )}
      </div>

      <SectionLibrary
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleAddSection}
      />
    </div>
  );
}

function getSectionTitle(type: SectionType): string {
  const titles: Record<SectionType, string> = {
    hero: 'Hero Section',
    features: 'Features Section',
    footer: 'Footer Section',
    cta: 'Call to Action',
    testimonials: 'Testimonials',
    stats: 'Statistics',
    content: 'Content Section',
  };
  return titles[type];
}

function getSectionIcon(type: SectionType) {
  // Icons will be added based on section type
  return null;
}

function getDefaultSectionData(type: SectionType): Record<string, any> {
  switch (type) {
    case 'hero':
      return {
        headline: 'Welcome to Our Platform',
        subheadline: 'Build amazing things with our tools',
        primaryCta: { text: 'Get Started', link: '/signup', linkType: 'url' },
        backgroundType: 'solid',
        backgroundColor: '#000000',
        textAlignment: 'center',
        height: 'large',
      };
    case 'features':
      return {
        title: 'Our Features',
        subtitle: 'Everything you need to succeed',
        layout: 'grid',
        columns: 3,
        features: [],
      };
    case 'footer':
      return {
        companyName: 'Company Name',
        description: 'Building amazing products',
        navLinks: [],
        socialLinks: [],
        copyright: `© ${new Date().getFullYear()} Company Name. All rights reserved.`,
        showNewsletter: false,
      };
    case 'cta':
      return {
        title: 'Ready to Get Started?',
        description: 'Join thousands of satisfied customers',
        primaryCta: { text: 'Sign Up Now', link: '/signup', linkType: 'url' },
        backgroundColor: '#000000',
        textColor: '#ffffff',
        alignment: 'center',
      };
    case 'testimonials':
      return {
        title: 'What Our Customers Say',
        layout: 'grid',
        testimonials: [],
      };
    case 'stats':
      return {
        layout: 'horizontal',
        stats: [],
      };
    case 'content':
      return {
        content: 'Add your content here...',
        layout: 'single',
      };
    default:
      return {};
  }
}
