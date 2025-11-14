'use client';

/**
 * CTA Button Editor
 * 
 * Edit CTA buttons with page selector dropdown for internal links.
 */

import { CtaButton } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSelector } from './PageSelector';

interface CtaButtonEditorProps {
  value?: CtaButton;
  onChange: (value?: CtaButton) => void;
}

export function CtaButtonEditor({ value, onChange }: CtaButtonEditorProps) {
  const handleChange = (field: keyof CtaButton, fieldValue: any) => {
    if (!value) {
      onChange({ text: '', link: '', linkType: 'url', [field]: fieldValue });
    } else {
      onChange({ ...value, [field]: fieldValue });
    }
  };

  if (!value) {
    return (
      <div className="text-sm text-muted-foreground">
        No CTA button configured
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="cta-text">Button Text</Label>
        <Input
          id="cta-text"
          value={value.text}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="Get Started"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta-link-type">Link Type</Label>
        <Select
          value={value.linkType}
          onValueChange={(linkValue) => handleChange('linkType', linkValue)}
        >
          <SelectTrigger id="cta-link-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="url">External URL</SelectItem>
            <SelectItem value="page">Internal Page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.linkType === 'url' ? (
        <div className="space-y-2">
          <Label htmlFor="cta-link">URL</Label>
          <Input
            id="cta-link"
            value={value.link}
            onChange={(e) => handleChange('link', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="cta-page">Select Page</Label>
          <PageSelector
            value={value.link}
            onChange={(slug) => handleChange('link', slug)}
            placeholder="Select a page"
          />
        </div>
      )}
    </div>
  );
}
