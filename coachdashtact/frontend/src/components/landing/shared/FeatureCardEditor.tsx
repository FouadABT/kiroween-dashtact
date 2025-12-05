'use client';

import { FeatureCard } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from '@/components/landing/shared/IconPicker';

interface FeatureCardEditorProps {
  value: FeatureCard;
  onChange: (value: FeatureCard) => void;
}

export function FeatureCardEditor({ value, onChange }: FeatureCardEditorProps) {
  const handleChange = (field: keyof FeatureCard, fieldValue: any) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Icon</Label>
        <IconPicker value={value.icon} onChange={(iconValue) => handleChange('icon', iconValue)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`feature-title-${value.id}`}>Title</Label>
        <Input
          id={`feature-title-${value.id}`}
          value={value.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`feature-description-${value.id}`}>Description</Label>
        <Textarea
          id={`feature-description-${value.id}`}
          value={value.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
