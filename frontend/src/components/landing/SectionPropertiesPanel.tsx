'use client';

/**
 * Section Properties Panel
 * 
 * Common properties panel for all section types with tabs for:
 * - Design (background, borders, shadows)
 * - Layout (padding, margin, alignment)
 * - Animation (entrance effects, timing)
 * - Advanced (custom CSS, anchor ID, visibility)
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SectionDesign, SectionLayout, SectionAnimation, SectionAdvanced } from '@/types/landing-cms';

interface SectionPropertiesPanelProps {
  design?: SectionDesign;
  layout?: SectionLayout;
  animation?: SectionAnimation;
  advanced?: SectionAdvanced;
  onDesignChange?: (design: SectionDesign) => void;
  onLayoutChange?: (layout: SectionLayout) => void;
  onAnimationChange?: (animation: SectionAnimation) => void;
  onAdvancedChange?: (advanced: SectionAdvanced) => void;
}

export function SectionPropertiesPanel({
  design = {},
  layout = {},
  animation = {},
  advanced = {},
  onDesignChange,
  onLayoutChange,
  onAnimationChange,
  onAdvancedChange,
}: SectionPropertiesPanelProps) {
  const handleDesignChange = (field: keyof SectionDesign, value: any) => {
    if (onDesignChange) {
      onDesignChange({ ...design, [field]: value });
    }
  };

  const handleLayoutChange = (field: keyof SectionLayout, value: any) => {
    if (onLayoutChange) {
      onLayoutChange({ ...layout, [field]: value });
    }
  };

  const handleAnimationChange = (field: keyof SectionAnimation, value: any) => {
    if (onAnimationChange) {
      onAnimationChange({ ...animation, [field]: value });
    }
  };

  const handleAdvancedChange = (field: keyof SectionAdvanced, value: any) => {
    if (onAdvancedChange) {
      onAdvancedChange({ ...advanced, [field]: value });
    }
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={design.background || '#ffffff'}
                onChange={(e) => handleDesignChange('background', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={design.background || '#ffffff'}
                onChange={(e) => handleDesignChange('background', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bg-image">Background Image URL</Label>
            <Input
              id="bg-image"
              value={design.backgroundImage || ''}
              onChange={(e) => handleDesignChange('backgroundImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bg-video">Background Video URL</Label>
            <Input
              id="bg-video"
              value={design.backgroundVideo || ''}
              onChange={(e) => handleDesignChange('backgroundVideo', e.target.value)}
              placeholder="https://example.com/video.mp4"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="border">Border</Label>
            <Input
              id="border"
              value={design.border || ''}
              onChange={(e) => handleDesignChange('border', e.target.value)}
              placeholder="1px solid #e5e7eb"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shadow">Shadow</Label>
            <Select
              value={design.shadow || 'none'}
              onValueChange={(value) => handleDesignChange('shadow', value)}
            >
              <SelectTrigger id="shadow">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Overlay Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={design.overlay || '#000000'}
                onChange={(e) => handleDesignChange('overlay', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={design.overlay || '#000000'}
                onChange={(e) => handleDesignChange('overlay', e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Overlay Opacity: {design.overlayOpacity || 0}%</Label>
            <Slider
              value={[design.overlayOpacity || 0]}
              onValueChange={([value]) => handleDesignChange('overlayOpacity', value)}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="padding">Padding</Label>
            <Input
              id="padding"
              value={layout.padding || ''}
              onChange={(e) => handleLayoutChange('padding', e.target.value)}
              placeholder="e.g., 2rem or 32px"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="margin">Margin</Label>
            <Input
              id="margin"
              value={layout.margin || ''}
              onChange={(e) => handleLayoutChange('margin', e.target.value)}
              placeholder="e.g., 1rem 0 or 16px 0"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="container-width">Container Width</Label>
            <Select
              value={layout.containerWidth || 'standard'}
              onValueChange={(value: any) => handleLayoutChange('containerWidth', value)}
            >
              <SelectTrigger id="container-width">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="wide">Wide (1400px)</SelectItem>
                <SelectItem value="standard">Standard (1200px)</SelectItem>
                <SelectItem value="narrow">Narrow (800px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-alignment">Content Alignment</Label>
            <Select
              value={layout.contentAlignment || 'left'}
              onValueChange={(value: any) => handleLayoutChange('contentAlignment', value)}
            >
              <SelectTrigger id="content-alignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Animation Tab */}
        <TabsContent value="animation" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="entrance">Entrance Animation</Label>
            <Select
              value={animation.entrance || 'none'}
              onValueChange={(value: any) => handleAnimationChange('entrance', value)}
            >
              <SelectTrigger id="entrance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade">Fade In</SelectItem>
                <SelectItem value="slide">Slide Up</SelectItem>
                <SelectItem value="zoom">Zoom In</SelectItem>
                <SelectItem value="bounce">Bounce In</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Animation Duration: {animation.timing || 500}ms</Label>
            <Slider
              value={[animation.timing || 500]}
              onValueChange={([value]) => handleAnimationChange('timing', value)}
              min={100}
              max={2000}
              step={100}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Animation Delay: {animation.delay || 0}ms</Label>
            <Slider
              value={[animation.delay || 0]}
              onValueChange={([value]) => handleAnimationChange('delay', value)}
              min={0}
              max={2000}
              step={100}
              className="w-full"
            />
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="anchor-id">Anchor ID</Label>
            <Input
              id="anchor-id"
              value={advanced.anchorId || ''}
              onChange={(e) => handleAdvancedChange('anchorId', e.target.value)}
              placeholder="section-id"
            />
            <p className="text-xs text-muted-foreground">
              Used for navigation links (e.g., #section-id)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-css">Custom CSS</Label>
            <Textarea
              id="custom-css"
              value={advanced.customCss || ''}
              onChange={(e) => handleAdvancedChange('customCss', e.target.value)}
              placeholder=".my-section { ... }"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Add custom CSS for this section
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Visibility Conditions</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Control when this section is visible
            </p>
            {/* Placeholder for future visibility conditions */}
            <div className="text-sm text-muted-foreground italic">
              Coming soon: Device-specific visibility, user authentication, custom rules
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
