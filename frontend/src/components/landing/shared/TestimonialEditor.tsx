'use client';

import { Testimonial } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadField } from '@/components/landing/shared/ImageUploadField';

interface TestimonialEditorProps {
  value: Testimonial;
  onChange: (value: Testimonial) => void;
}

export function TestimonialEditor({ value, onChange }: TestimonialEditorProps) {
  const handleChange = (field: keyof Testimonial, fieldValue: any) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`testimonial-quote-${value.id}`}>Quote</Label>
        <Textarea
          id={`testimonial-quote-${value.id}`}
          value={value.quote}
          onChange={(e) => handleChange('quote', e.target.value)}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`testimonial-author-${value.id}`}>Author</Label>
          <Input
            id={`testimonial-author-${value.id}`}
            value={value.author}
            onChange={(e) => handleChange('author', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`testimonial-role-${value.id}`}>Role</Label>
          <Input
            id={`testimonial-role-${value.id}`}
            value={value.role}
            onChange={(e) => handleChange('role', e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`testimonial-company-${value.id}`}>Company (Optional)</Label>
        <Input
          id={`testimonial-company-${value.id}`}
          value={value.company || ''}
          onChange={(e) => handleChange('company', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Avatar (Optional)</Label>
        <ImageUploadField
          value={value.avatar}
          onChange={(avatarUrl) => handleChange('avatar', avatarUrl)}
        />
      </div>
    </div>
  );
}
