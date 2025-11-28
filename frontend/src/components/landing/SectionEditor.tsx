'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GripVertical, Eye, Trash2, Edit, 
  Sparkles, Grid3x3, MessageSquare, BarChart3, FileText, Zap, Plus, Columns, Layout, BookOpen, Files, ShoppingBag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { LandingPageSection, HeroSectionData, CtaSectionData, StatsSectionData, Stat, ContentSectionData, BlogPostsSectionData, PagesSectionData, ProductsSectionData, FeaturesSectionData, TestimonialsSectionData, FooterSectionData } from '@/types/landing-page';
import { ContentSectionEditor } from './editors/ContentSectionEditor';
import { BlogPostsSectionEditor } from './editors/BlogPostsSectionEditor';
import { PagesSectionEditor } from './editors/PagesSectionEditor';
import { ProductsSectionEditor } from './editors/ProductsSectionEditor';
import { FeaturesSectionEditor } from './editors/FeaturesSectionEditor';
import { TestimonialsSectionEditor } from './editors/TestimonialsSectionEditor';
import { FooterSectionEditor } from './editors/FooterSectionEditor';

interface SectionEditorProps {
  sections: LandingPageSection[];
  onChange: (sections: LandingPageSection[]) => void;
}

interface SortableSectionProps {
  section: LandingPageSection;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

function SortableSection({ section, onToggle, onDelete, onEdit }: SortableSectionProps) {
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

  const getSectionTitle = () => {
    switch (section.type) {
      case 'hero':
        return `Hero: ${(section.data as any).headline || 'Untitled'}`;
      case 'features':
        return 'Features Section';
      case 'cta':
        return `CTA: ${(section.data as any).title || 'Untitled'}`;
      case 'testimonials':
        return 'Testimonials Section';
      case 'stats':
        return 'Stats Section';
      case 'content':
        return `Content: ${(section.data as any).title || 'Untitled'}`;
      case 'blog-posts':
        return `Blog Posts: ${(section.data as any).title || 'Recent Posts'}`;
      case 'pages':
        return `Pages: ${(section.data as any).title || 'Featured Pages'}`;
      case 'products':
        return `Products: ${(section.data as any).title || 'Featured Products'}`;
      case 'footer':
        return 'Footer Section';
      default:
        return 'Section';
    }
  };

  const getSectionIcon = () => {
    switch (section.type) {
      case 'hero':
        return <Sparkles className="h-4 w-4" />;
      case 'features':
        return <Grid3x3 className="h-4 w-4" />;
      case 'cta':
        return <Zap className="h-4 w-4" />;
      case 'testimonials':
        return <MessageSquare className="h-4 w-4" />;
      case 'stats':
        return <BarChart3 className="h-4 w-4" />;
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'blog-posts':
        return <BookOpen className="h-4 w-4" />;
      case 'pages':
        return <Files className="h-4 w-4" />;
      case 'products':
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card border border-border rounded-lg transition-all hover:border-primary/50',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-muted-foreground">
          {getSectionIcon()}
        </div>

        <div className="flex-1">
          <div className="font-medium text-sm">{getSectionTitle()}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {section.type} section
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
            <Switch
              checked={section.enabled}
              onCheckedChange={onToggle}
              aria-label="Toggle section visibility"
            />
            <Eye className={cn(
              'h-4 w-4 transition-colors',
              section.enabled ? 'text-green-500' : 'text-muted-foreground'
            )} />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-9 px-3"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hero Section Editor Dialog
function HeroSectionEditor({ 
  section, 
  onSave, 
  onClose 
}: { 
  section: LandingPageSection; 
  onSave: (data: HeroSectionData) => void; 
  onClose: () => void;
}) {
  const data = section.data as HeroSectionData;
  const [formData, setFormData] = useState<HeroSectionData>(data);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="Enter headline"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subheadline">Subheadline</Label>
          <Textarea
            id="subheadline"
            value={formData.subheadline}
            onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
            placeholder="Enter subheadline"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryCtaText">Primary Button Text</Label>
            <Input
              id="primaryCtaText"
              value={formData.primaryCta.text}
              onChange={(e) => setFormData({
                ...formData,
                primaryCta: { ...formData.primaryCta, text: e.target.value }
              })}
              placeholder="Get Started"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryCtaLink">Primary Button Link</Label>
            <Input
              id="primaryCtaLink"
              value={formData.primaryCta.link}
              onChange={(e) => setFormData({
                ...formData,
                primaryCta: { ...formData.primaryCta, link: e.target.value }
              })}
              placeholder="/signup"
            />
          </div>
        </div>

        {formData.secondaryCta && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="secondaryCtaText">Secondary Button Text</Label>
              <Input
                id="secondaryCtaText"
                value={formData.secondaryCta.text}
                onChange={(e) => setFormData({
                  ...formData,
                  secondaryCta: { ...formData.secondaryCta!, text: e.target.value }
                })}
                placeholder="Learn More"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryCtaLink">Secondary Button Link</Label>
              <Input
                id="secondaryCtaLink"
                value={formData.secondaryCta.link}
                onChange={(e) => setFormData({
                  ...formData,
                  secondaryCta: { ...formData.secondaryCta!, link: e.target.value }
                })}
                placeholder="/about"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="textAlignment">Text Alignment</Label>
            <Select
              value={formData.textAlignment}
              onValueChange={(value: 'left' | 'center' | 'right') => 
                setFormData({ ...formData, textAlignment: value })
              }
            >
              <SelectTrigger id="textAlignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Section Height</Label>
            <Select
              value={formData.height}
              onValueChange={(value: 'small' | 'medium' | 'large' | 'extra-large' | 'full') => 
                setFormData({ ...formData, height: value })
              }
            >
              <SelectTrigger id="height">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
                <SelectItem value="full">Full Screen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backgroundType">Background Type</Label>
          <Select
            value={formData.backgroundType}
            onValueChange={(value: 'image' | 'gradient' | 'solid' | 'video') => 
              setFormData({ ...formData, backgroundType: value })
            }
          >
            <SelectTrigger id="backgroundType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.backgroundType === 'solid' && (
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <Input
              id="backgroundColor"
              type="text"
              value={formData.backgroundColor || ''}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              placeholder="oklch(0.5 0.2 250)"
            />
          </div>
        )}

        {formData.backgroundType === 'image' && (
          <div className="space-y-2">
            <Label htmlFor="backgroundImage">Background Image URL</Label>
            <Input
              id="backgroundImage"
              value={formData.backgroundImage || ''}
              onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// Stats Section Editor Dialog
function StatsSectionEditor({
  section,
  onSave,
  onClose,
}: {
  section: LandingPageSection;
  onSave: (data: StatsSectionData) => void;
  onClose: () => void;
}) {
  const data = section.data as StatsSectionData;
  const [formData, setFormData] = useState<StatsSectionData>(data);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleAddStat = () => {
    const newStat: Stat = {
      id: `stat-${Date.now()}`,
      value: '',
      label: '',
      icon: '',
      order: formData.stats.length + 1,
    };
    setFormData({
      ...formData,
      stats: [...formData.stats, newStat],
    });
  };

  const handleUpdateStat = (index: number, field: keyof Stat, value: string | number) => {
    const updatedStats = [...formData.stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    setFormData({ ...formData, stats: updatedStats });
  };

  const handleRemoveStat = (index: number) => {
    const updatedStats = formData.stats.filter((_, i) => i !== index);
    // Reorder remaining stats
    const reorderedStats = updatedStats.map((stat, i) => ({ ...stat, order: i + 1 }));
    setFormData({ ...formData, stats: reorderedStats });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title (Optional)</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter section title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="layout">Layout</Label>
          <Select
            value={formData.layout}
            onValueChange={(value: 'horizontal' | 'grid') =>
              setFormData({ ...formData, layout: value })
            }
          >
            <SelectTrigger id="layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Statistics</Label>
            <Button type="button" size="sm" onClick={handleAddStat}>
              Add Stat
            </Button>
          </div>

          {formData.stats.map((stat, index) => (
            <Card key={stat.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stat {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStat(index)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`stat-value-${index}`}>Value</Label>
                    <Input
                      id={`stat-value-${index}`}
                      value={stat.value}
                      onChange={(e) => handleUpdateStat(index, 'value', e.target.value)}
                      placeholder="50+"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`stat-label-${index}`}>Label</Label>
                    <Input
                      id={`stat-label-${index}`}
                      value={stat.label}
                      onChange={(e) => handleUpdateStat(index, 'label', e.target.value)}
                      placeholder="Components"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`stat-icon-${index}`}>Icon (Optional)</Label>
                  <Input
                    id={`stat-icon-${index}`}
                    value={stat.icon || ''}
                    onChange={(e) => handleUpdateStat(index, 'icon', e.target.value)}
                    placeholder="package"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lucide icon name (e.g., package, zap, activity)
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {formData.stats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No statistics yet. Click "Add Stat" to create one.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}

// CTA Section Editor Dialog
function CtaSectionEditor({ 
  section, 
  onSave, 
  onClose 
}: { 
  section: LandingPageSection; 
  onSave: (data: CtaSectionData) => void; 
  onClose: () => void;
}) {
  const data = section.data as CtaSectionData;
  const [formData, setFormData] = useState<CtaSectionData>(data);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ctaText">Button Text</Label>
            <Input
              id="ctaText"
              value={formData.primaryCta.text}
              onChange={(e) => setFormData({
                ...formData,
                primaryCta: { ...formData.primaryCta, text: e.target.value }
              })}
              placeholder="Get Started"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaLink">Button Link</Label>
            <Input
              id="ctaLink"
              value={formData.primaryCta.link}
              onChange={(e) => setFormData({
                ...formData,
                primaryCta: { ...formData.primaryCta, link: e.target.value }
              })}
              placeholder="/signup"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <Input
              id="backgroundColor"
              type="text"
              value={formData.backgroundColor}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              placeholder="oklch(0.5 0.2 250)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <Input
              id="textColor"
              type="text"
              value={formData.textColor}
              onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              placeholder="oklch(1 0 0)"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alignment">Text Alignment</Label>
          <Select
            value={formData.alignment}
            onValueChange={(value: 'left' | 'center' | 'right') => 
              setFormData({ ...formData, alignment: value })
            }
          >
            <SelectTrigger id="alignment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export function SectionEditor({ sections, onChange }: SectionEditorProps) {
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddSection = (type: 'hero' | 'features' | 'cta' | 'testimonials' | 'stats' | 'content' | 'blog-posts' | 'pages' | 'products' | 'footer') => {
    const newSectionId = `${type}-${Date.now()}`;
    const newOrder = sections.length + 1;

    let defaultData: any = {};

    switch (type) {
      case 'hero':
        defaultData = {
          headline: 'Welcome to Our Platform',
          subheadline: 'Build amazing things with our powerful tools',
          primaryCta: {
            text: 'Get Started',
            link: '/signup',
            linkType: 'url',
          },
          backgroundType: 'gradient',
          textAlignment: 'center',
          height: 'large',
        };
        break;
      case 'features':
        defaultData = {
          title: 'Our Features',
          subtitle: 'Everything you need to succeed',
          layout: 'grid',
          columns: 3,
          features: [],
        };
        break;
      case 'cta':
        defaultData = {
          title: 'Ready to Get Started?',
          description: 'Join thousands of users already using our platform',
          primaryCta: {
            text: 'Sign Up Now',
            link: '/signup',
            linkType: 'url',
          },
          backgroundColor: 'oklch(0.5 0.2 250)',
          textColor: 'oklch(1 0 0)',
          alignment: 'center',
        };
        break;
      case 'testimonials':
        defaultData = {
          title: 'What Our Customers Say',
          subtitle: 'Trusted by thousands of users worldwide',
          layout: 'grid',
          showRatings: true,
          testimonials: [],
        };
        break;
      case 'stats':
        defaultData = {
          title: 'Our Impact',
          layout: 'horizontal',
          stats: [],
        };
        break;
      case 'content':
        defaultData = {
          title: 'About Us',
          content: 'Add your content here...',
          layout: 'single',
          contentWidth: 'standard',
        };
        break;
      case 'blog-posts':
        defaultData = {
          title: 'Recent Blog Posts',
          subtitle: 'Check out our latest articles',
          layout: 'grid',
          columns: 3,
          postCount: 6,
          showAuthor: true,
          showDate: true,
          showCategories: true,
          showExcerpt: true,
          ctaText: 'View All Posts',
          ctaLink: '/blog',
        };
        break;
      case 'pages':
        defaultData = {
          title: 'Featured Pages',
          subtitle: 'Explore our content',
          layout: 'grid',
          columns: 3,
          pageCount: 6,
          showExcerpt: true,
          showImage: true,
          ctaText: 'View All Pages',
        };
        break;
      case 'products':
        defaultData = {
          title: 'Featured Products',
          subtitle: 'Discover our best-selling products',
          layout: 'grid',
          columns: 3,
          productCount: 6,
          showPrice: true,
          showRating: true,
          showStock: true,
          ctaText: 'Add to Cart',
        };
        break;
      case 'footer':
        defaultData = {
          companyName: 'Dashboard Application',
          description: 'Professional dashboard application',
          navLinks: [],
          socialLinks: [],
          copyright: `© ${new Date().getFullYear()} Dashboard Application. All rights reserved.`,
          showNewsletter: false,
        };
        break;
    }

    const newSection: LandingPageSection = {
      id: newSectionId,
      type,
      enabled: true,
      order: newOrder,
      data: defaultData,
    };

    onChange([...sections, newSection]);
    
    // Automatically open the editor for the new section
    setEditingSection(newSection);
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
        order: index + 1,
      }));

      onChange(reorderedSections);
    }
  };

  const handleToggleEnabled = (sectionId: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    onChange(updatedSections);
  };

  const handleDelete = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      const updatedSections = sections
        .filter((section) => section.id !== sectionId)
        .map((section, index) => ({
          ...section,
          order: index + 1,
        }));
      onChange(updatedSections);
    }
  };

  const handleEdit = (section: LandingPageSection) => {
    setEditingSection(section);
  };

  const handleSaveSection = (sectionId: string, newData: any) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, data: newData }
        : section
    );
    onChange(updatedSections);
  };

  const renderEditor = () => {
    if (!editingSection) return null;

    switch (editingSection.type) {
      case 'hero':
        return (
          <HeroSectionEditor
            section={editingSection}
            onSave={(data) => handleSaveSection(editingSection.id, data)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'cta':
        return (
          <CtaSectionEditor
            section={editingSection}
            onSave={(data) => handleSaveSection(editingSection.id, data)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'stats':
        return (
          <StatsSectionEditor
            section={editingSection}
            onSave={(data) => handleSaveSection(editingSection.id, data)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'content':
        return (
          <ContentSectionEditor
            data={editingSection.data as ContentSectionData}
            onSave={(data) => handleSaveSection(editingSection.id, data)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'blog-posts':
        return (
          <BlogPostsSectionEditor
            data={editingSection.data as BlogPostsSectionData}
            onSave={(data) => handleSaveSection(editingSection.id, data)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'pages':
        return (
          <PagesSectionEditor
            data={editingSection.data as PagesSectionData}
            onSave={(data) => handleSaveSection(editingSection.id, data)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'products':
        return (
          <ProductsSectionEditor
            data={editingSection.data as ProductsSectionData}
            onSave={(data) => handleSaveSection(editingSection.id, data)}
            onClose={() => setEditingSection(null)}
          />
        );
      case 'features':
        return (
          <FeaturesSectionEditor
            data={editingSection.data as FeaturesSectionData}
            onChange={(data) => handleSaveSection(editingSection.id, data)}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsSectionEditor
            data={editingSection.data as TestimonialsSectionData}
            onChange={(data) => handleSaveSection(editingSection.id, data)}
          />
        );
      case 'footer':
        return (
          <FooterSectionEditor
            data={editingSection.data as FooterSectionData}
            onChange={(data) => handleSaveSection(editingSection.id, data)}
          />
        );
      default:
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Visual editor for {editingSection.type} sections is coming soon.
              </p>
              <p className="text-xs text-muted-foreground">
                For now, you can edit the JSON data below:
              </p>
            </div>
            <div className="bg-muted p-3 rounded text-xs">
              <pre className="overflow-auto max-h-96">
                {JSON.stringify(editingSection.data, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setEditingSection(null)}>
                Close
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Page Sections</h3>
            <p className="text-sm text-muted-foreground">
              Drag to reorder, toggle visibility, or edit sections
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {sections.length} section{sections.length !== 1 ? 's' : ''}
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Choose Section Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAddSection('hero')} className="gap-2 cursor-pointer">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div className="flex-1">
                    <div className="font-medium">Hero Section</div>
                    <div className="text-xs text-muted-foreground">Large header with CTA</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection('features')} className="gap-2 cursor-pointer">
                  <Grid3x3 className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">Features</div>
                    <div className="text-xs text-muted-foreground">Feature cards grid</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection('cta')} className="gap-2 cursor-pointer">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <div className="font-medium">Call to Action</div>
                    <div className="text-xs text-muted-foreground">Conversion section</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection('testimonials')} className="gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <div className="font-medium">Testimonials</div>
                    <div className="text-xs text-muted-foreground">Customer reviews</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection('stats')} className="gap-2 cursor-pointer">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <div className="font-medium">Statistics</div>
                    <div className="text-xs text-muted-foreground">Key metrics display</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection('content')} className="gap-2 cursor-pointer">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <div className="flex-1">
                    <div className="font-medium">Content</div>
                    <div className="text-xs text-muted-foreground">Rich text content</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection('blog-posts')} className="gap-2 cursor-pointer">
                  <BookOpen className="h-4 w-4 text-pink-500" />
                  <div className="flex-1">
                    <div className="font-medium">Blog Posts</div>
                    <div className="text-xs text-muted-foreground">Recent blog articles</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection('pages')} className="gap-2 cursor-pointer">
                  <Files className="h-4 w-4 text-cyan-500" />
                  <div className="flex-1">
                    <div className="font-medium">Custom Pages</div>
                    <div className="text-xs text-muted-foreground">Featured pages</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSection('products')} className="gap-2 cursor-pointer">
                  <ShoppingBag className="h-4 w-4 text-emerald-500" />
                  <div className="flex-1">
                    <div className="font-medium">Products</div>
                    <div className="text-xs text-muted-foreground">E-commerce products</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAddSection('footer')} className="gap-2 cursor-pointer">
                  <Columns className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">Footer</div>
                    <div className="text-xs text-muted-foreground">Page footer section</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            <div className="space-y-3">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onToggle={() => handleToggleEnabled(section.id)}
                  onDelete={() => handleDelete(section.id)}
                  onEdit={() => handleEdit(section)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sections.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Layout className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No sections yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Get started by adding your first section. Choose from hero, features, testimonials, and more.
                </p>
              </div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="gap-2 mt-2">
                    <Plus className="h-5 w-5" />
                    Add Your First Section
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuLabel>Choose Section Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAddSection('hero')} className="gap-2 cursor-pointer">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <div className="flex-1">
                      <div className="font-medium">Hero Section</div>
                      <div className="text-xs text-muted-foreground">Large header with CTA</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('features')} className="gap-2 cursor-pointer">
                    <Grid3x3 className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="font-medium">Features</div>
                      <div className="text-xs text-muted-foreground">Feature cards grid</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('cta')} className="gap-2 cursor-pointer">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <div className="flex-1">
                      <div className="font-medium">Call to Action</div>
                      <div className="text-xs text-muted-foreground">Conversion section</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('testimonials')} className="gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <div className="font-medium">Testimonials</div>
                      <div className="text-xs text-muted-foreground">Customer reviews</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('stats')} className="gap-2 cursor-pointer">
                    <BarChart3 className="h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <div className="font-medium">Statistics</div>
                      <div className="text-xs text-muted-foreground">Key metrics display</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('content')} className="gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <div className="flex-1">
                      <div className="font-medium">Content</div>
                      <div className="text-xs text-muted-foreground">Rich text content</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('blog-posts')} className="gap-2 cursor-pointer">
                    <BookOpen className="h-4 w-4 text-pink-500" />
                    <div className="flex-1">
                      <div className="font-medium">Blog Posts</div>
                      <div className="text-xs text-muted-foreground">Recent blog articles</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('pages')} className="gap-2 cursor-pointer">
                    <Files className="h-4 w-4 text-cyan-500" />
                    <div className="flex-1">
                      <div className="font-medium">Custom Pages</div>
                      <div className="text-xs text-muted-foreground">Featured pages</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection('products')} className="gap-2 cursor-pointer">
                    <ShoppingBag className="h-4 w-4 text-emerald-500" />
                    <div className="flex-1">
                      <div className="font-medium">Products</div>
                      <div className="text-xs text-muted-foreground">E-commerce products</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAddSection('footer')} className="gap-2 cursor-pointer">
                    <Columns className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="font-medium">Footer</div>
                      <div className="text-xs text-muted-foreground">Page footer section</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        )}
      </div>

      {/* Edit Dialog - Large size for content editing */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="!w-[95vw] !max-w-[1400px] !h-[95vh] !max-h-[95vh] overflow-y-auto p-8 sm:!max-w-[1400px]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl">
              Edit {editingSection?.type ? editingSection.type.charAt(0).toUpperCase() + editingSection.type.slice(1) : ''} Section
            </DialogTitle>
            <DialogDescription className="text-base">
              Make changes to your section content and styling
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2">
            {renderEditor()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
