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

      {(data.backgroundType === 'solid' || data.backgroundType === 'gradient') && (
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
