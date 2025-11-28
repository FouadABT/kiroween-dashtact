'use client';

/**
 * Hero Section Editor
 * 
 * Edit hero section with background options, headline, subheadline, and CTAs.
 */

import { HeroSectionData } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CtaButtonEditor } from '@/components/landing/shared/CtaButtonEditor';
import { ImageUploadField } from '@/components/landing/shared/ImageUploadField';

interface HeroSectionEditorProps {
  data: HeroSectionData;
  onChange: (data: HeroSectionData) => void;
}

export function HeroSectionEditor({ data, onChange }: HeroSectionEditorProps) {
  const handleChange = (field: keyof HeroSectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={data.headline}
          onChange={(e) => handleChange('headline', e.target.value)}
          placeholder="Welcome to Our Platform"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subheadline">Subheadline</Label>
        <Textarea
          id="subheadline"
          value={data.subheadline}
          onChange={(e) => handleChange('subheadline', e.target.value)}
          placeholder="Build amazing things with our tools"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Primary CTA</Label>
        <CtaButtonEditor
          value={data.primaryCta}
          onChange={(value) => handleChange('primaryCta', value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Secondary CTA (Optional)</Label>
        <CtaButtonEditor
          value={data.secondaryCta}
          onChange={(ctaValue) => handleChange('secondaryCta', ctaValue)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="background-type">Background Type</Label>
        <Select
          value={data.backgroundType}
          onValueChange={(value: any) => handleChange('backgroundType', value)}
        >
          <SelectTrigger id="background-type">
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

      {data.backgroundType === 'image' && (
        <div className="space-y-2">
          <Label>Background Image</Label>
          <ImageUploadField
            value={data.backgroundImage}
            onChange={(imgValue) => handleChange('backgroundImage', imgValue)}
          />
        </div>
      )}

      {data.backgroundType === 'video' && (
        <div className="space-y-2">
          <Label htmlFor="background-video">Background Video URL</Label>
          <Input
            id="background-video"
            value={(data as any).backgroundVideo || ''}
            onChange={(e) => handleChange('backgroundVideo' as any, e.target.value)}
            placeholder="https://example.com/video.mp4 or YouTube URL"
          />
          <p className="text-xs text-muted-foreground">
            Supports MP4, WebM, YouTube, and Vimeo URLs
          </p>
        </div>
      )}

      {data.backgroundType === 'solid' && (
        <div className="space-y-2">
          <Label htmlFor="background-color">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={data.backgroundColor || '#000000'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-20 h-10"
            />
            <Input
              id="background-color"
              value={data.backgroundColor || '#000000'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              placeholder="#000000"
            />
          </div>
        </div>
      )}

      {data.backgroundType === 'gradient' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="gradient-start">Gradient Start Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={(data as any).gradientStart || '#000000'}
                onChange={(e) => handleChange('gradientStart' as any, e.target.value)}
                className="w-20 h-10"
              />
              <Input
                id="gradient-start"
                value={(data as any).gradientStart || '#000000'}
                onChange={(e) => handleChange('gradientStart' as any, e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradient-end">Gradient End Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={(data as any).gradientEnd || '#ffffff'}
                onChange={(e) => handleChange('gradientEnd' as any, e.target.value)}
                className="w-20 h-10"
              />
              <Input
                id="gradient-end"
                value={(data as any).gradientEnd || '#ffffff'}
                onChange={(e) => handleChange('gradientEnd' as any, e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradient-angle">Gradient Angle</Label>
            <Select
              value={(data as any).gradientAngle || '180'}
              onValueChange={(value) => handleChange('gradientAngle' as any, value)}
            >
              <SelectTrigger id="gradient-angle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Top to Bottom</SelectItem>
                <SelectItem value="90">Left to Right</SelectItem>
                <SelectItem value="180">Bottom to Top</SelectItem>
                <SelectItem value="270">Right to Left</SelectItem>
                <SelectItem value="45">Diagonal (↗)</SelectItem>
                <SelectItem value="135">Diagonal (↘)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="text-alignment">Text Alignment</Label>
        <Select
          value={data.textAlignment}
          onValueChange={(value: any) => handleChange('textAlignment', value)}
        >
          <SelectTrigger id="text-alignment">
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
          value={data.height}
          onValueChange={(value: any) => handleChange('height', value)}
        >
          <SelectTrigger id="height">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="full">Full Screen</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
