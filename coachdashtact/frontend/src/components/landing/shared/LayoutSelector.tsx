'use client';

/**
 * Layout Selector
 * 
 * Select layout options for sections.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LayoutOption {
  value: string;
  label: string;
  description?: string;
}

interface LayoutSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: LayoutOption[];
  label?: string;
}

export function LayoutSelector({ value, onChange, options, label }: LayoutSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div>
                <div>{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
