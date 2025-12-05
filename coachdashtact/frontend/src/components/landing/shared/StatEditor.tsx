'use client';

import { Stat } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconPicker } from '@/components/landing/shared/IconPicker';

interface StatEditorProps {
  value: Stat;
  onChange: (value: Stat) => void;
}

export function StatEditor({ value, onChange }: StatEditorProps) {
  const handleChange = (field: keyof Stat, fieldValue: any) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`stat-value-${value.id}`}>Value</Label>
          <Input
            id={`stat-value-${value.id}`}
            value={value.value}
            onChange={(e) => handleChange('value', e.target.value)}
            placeholder="100+"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`stat-label-${value.id}`}>Label</Label>
          <Input
            id={`stat-label-${value.id}`}
            value={value.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Customers"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Icon (Optional)</Label>
        <IconPicker value={value.icon} onChange={(iconValue) => handleChange('icon', iconValue)} />
      </div>
    </div>
  );
}
