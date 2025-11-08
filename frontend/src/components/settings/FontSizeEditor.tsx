'use client';

/**
 * FontSizeEditor Component
 * Interactive font size editor with slider
 */

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface FontSizeEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}

/**
 * Parse rem value to number
 */
function parseRem(value: string): number {
  const match = value.match(/([\d.]+)rem/);
  return match ? parseFloat(match[1]) : 1;
}

/**
 * Format number to rem string
 */
function formatRem(value: number): string {
  return `${value.toFixed(2)}rem`;
}

export function FontSizeEditor({ label, value, onChange, min = 0.5, max = 6 }: FontSizeEditorProps) {
  const [size, setSize] = useState(parseRem(value));
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setSize(parseRem(value));
    setInputValue(value);
  }, [value]);

  const handleSliderChange = (newValue: number) => {
    setSize(newValue);
    const formatted = formatRem(newValue);
    setInputValue(formatted);
    onChange(formatted);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    const parsed = parseRem(newValue);
    setSize(parsed);
    onChange(newValue);
  };

  return (
    <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div style={{ fontSize: inputValue }} className="text-foreground">
          Sample
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Size</Label>
          <span className="text-xs font-mono text-muted-foreground">{size.toFixed(2)}rem</span>
        </div>
        <Slider
          value={[size]}
          onValueChange={([v]) => handleSliderChange(v)}
          min={min}
          max={max}
          step={0.01}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`font-size-${label}`} className="text-xs text-muted-foreground">
          Value
        </Label>
        <Input
          id={`font-size-${label}`}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="font-mono text-sm"
          placeholder="1.5rem"
        />
      </div>
    </div>
  );
}
