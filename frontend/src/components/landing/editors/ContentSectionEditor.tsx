'use client';

import { ContentSectionData } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploadField } from '@/components/landing/shared/ImageUploadField';

interface ContentSectionEditorProps {
  data: ContentSectionData;
  onChange: (data: ContentSectionData) => void;
}

export function ContentSectionEditor({ data, onChange }: ContentSectionEditorProps) {
  const handleChange = (field: keyof ContentSectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title (Optional)</Label>
        <Input id="title" value={data.title || ''} onChange={(e) => handleChange('title', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" value={data.content} onChange={(e) => handleChange('content', e.target.value)} rows={6} placeholder="Add your content here..." />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={data.layout} onValueChange={(value: any) => handleChange('layout', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Column</SelectItem>
            <SelectItem value="two-column">Two Column</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {data.layout === 'two-column' && (
        <>
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUploadField value={data.image} onChange={(imgValue) => handleChange('image', imgValue)} />
          </div>
          <div className="space-y-2">
            <Label>Image Position</Label>
            <Select value={data.imagePosition || 'left'} onValueChange={(value: any) => handleChange('imagePosition', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
