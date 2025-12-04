'use client';

import { CtaSectionData } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CtaButtonEditor } from '../shared/CtaButtonEditor';

interface CtaSectionEditorProps {
  data: CtaSectionData;
  onChange: (data: CtaSectionData) => void;
}

export function CtaSectionEditor({ data, onChange }: CtaSectionEditorProps) {
  const handleChange = (field: keyof CtaSectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={data.title} onChange={(e) => handleChange('title', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={data.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Primary CTA</Label>
        <CtaButtonEditor value={data.primaryCta} onChange={(value) => handleChange('primaryCta', value)} />
      </div>
      <div className="space-y-2">
        <Label>Secondary CTA (Optional)</Label>
        <CtaButtonEditor value={data.secondaryCta} onChange={(value) => handleChange('secondaryCta', value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Background Color</Label>
          <div className="flex gap-2">
            <Input type="color" value={data.backgroundColor} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="w-20 h-10" />
            <Input value={data.backgroundColor} onChange={(e) => handleChange('backgroundColor', e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex gap-2">
            <Input type="color" value={data.textColor} onChange={(e) => handleChange('textColor', e.target.value)} className="w-20 h-10" />
            <Input value={data.textColor} onChange={(e) => handleChange('textColor', e.target.value)} />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Alignment</Label>
        <Select value={data.alignment} onValueChange={(value: any) => handleChange('alignment', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
