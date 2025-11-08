'use client';

/**
 * ColorPicker Component
 * Interactive color picker with OKLCH support
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

/**
 * Parse OKLCH color string to components
 * Format: oklch(L C H) or oklch(L C H / A)
 */
function parseOKLCH(color: string): { l: number; c: number; h: number; a: number } {
  const match = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)/);
  if (!match) {
    return { l: 0.5, c: 0.1, h: 0, a: 1 };
  }
  
  const [, l, c, h, a] = match;
  return {
    l: parseFloat(l),
    c: parseFloat(c),
    h: parseFloat(h),
    a: a ? (a.includes('%') ? parseFloat(a) / 100 : parseFloat(a)) : 1,
  };
}

/**
 * Format OKLCH components to string
 */
function formatOKLCH(l: number, c: number, h: number, a: number = 1): string {
  if (a < 1) {
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)} / ${(a * 100).toFixed(0)}%)`;
  }
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [color, setColor] = useState(parseOKLCH(value));
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setColor(parseOKLCH(value));
    setInputValue(value);
  }, [value]);

  const handleChange = (component: 'l' | 'c' | 'h' | 'a', newValue: number) => {
    const newColor = { ...color, [component]: newValue };
    setColor(newColor);
    const formatted = formatOKLCH(newColor.l, newColor.c, newColor.h, newColor.a);
    setInputValue(formatted);
    onChange(formatted);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    const parsed = parseOKLCH(newValue);
    setColor(parsed);
    onChange(newValue);
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Label htmlFor={`color-${label}`} className="text-sm font-medium">
            {label}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div
          className="w-16 h-16 rounded-lg border-2 border-border shadow-sm flex-shrink-0"
          style={{ backgroundColor: inputValue }}
          aria-hidden="true"
        />
      </div>

      {/* Lightness Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Lightness</Label>
          <span className="text-xs font-mono text-muted-foreground">{color.l.toFixed(3)}</span>
        </div>
        <Slider
          value={[color.l]}
          onValueChange={([v]) => handleChange('l', v)}
          min={0}
          max={1}
          step={0.001}
          className="w-full"
        />
      </div>

      {/* Chroma Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Chroma (Saturation)</Label>
          <span className="text-xs font-mono text-muted-foreground">{color.c.toFixed(3)}</span>
        </div>
        <Slider
          value={[color.c]}
          onValueChange={([v]) => handleChange('c', v)}
          min={0}
          max={0.4}
          step={0.001}
          className="w-full"
        />
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Hue</Label>
          <span className="text-xs font-mono text-muted-foreground">{color.h.toFixed(1)}°</span>
        </div>
        <Slider
          value={[color.h]}
          onValueChange={([v]) => handleChange('h', v)}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>

      {/* Alpha Slider (if needed) */}
      {color.a < 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Opacity</Label>
            <span className="text-xs font-mono text-muted-foreground">{(color.a * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[color.a]}
            onValueChange={([v]) => handleChange('a', v)}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
      )}

      {/* Manual Input */}
      <div className="space-y-2">
        <Label htmlFor={`color-input-${label}`} className="text-xs text-muted-foreground">
          OKLCH Value
        </Label>
        <Input
          id={`color-input-${label}`}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="font-mono text-sm"
          placeholder="oklch(0.5 0.1 180)"
        />
      </div>
    </div>
  );
}
