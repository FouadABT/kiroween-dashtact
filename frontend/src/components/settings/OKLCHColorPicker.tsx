'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pipette, Copy, Check, Palette } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HSLColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

interface HSLValues {
  hue: number;
  saturation: number;
  lightness: number;
  alpha?: number;
}

/**
 * Parse HSL color string into components
 * Supports formats: "240 5.9% 10%" or "hsl(240 5.9% 10%)" or "hsl(240, 5.9%, 10%)"
 */
function parseHSL(color: string): HSLValues | null {
  // Try HSL format with parentheses: hsl(240 5.9% 10%) or hsl(240, 5.9%, 10%)
  let match = color.match(/hsl\((\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)%[,\s]+(\d+(?:\.\d+)?)%(?:\s*\/\s*(\d+(?:\.\d+)?))?\)/);
  
  if (match) {
    return {
      hue: parseFloat(match[1]),
      saturation: parseFloat(match[2]),
      lightness: parseFloat(match[3]),
      alpha: match[4] ? parseFloat(match[4]) : undefined,
    };
  }

  // Try shorthand format: "240 5.9% 10%"
  match = color.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  
  if (match) {
    return {
      hue: parseFloat(match[1]),
      saturation: parseFloat(match[2]),
      lightness: parseFloat(match[3]),
    };
  }

  return null;
}

/**
 * Format HSL values into color string (shorthand format to match database)
 */
function formatHSL(values: HSLValues): string {
  const { hue, saturation, lightness, alpha } = values;
  if (alpha !== undefined && alpha < 1) {
    return `hsl(${hue.toFixed(1)} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}% / ${alpha.toFixed(2)})`;
  }
  // Use shorthand format to match database: "240 5.9% 10%"
  return `${hue.toFixed(1)} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}%`;
}

/**
 * Convert HSL to Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Convert Hex to HSL
 */
function hexToHSL(hex: string): HSLValues {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { hue: 0, saturation: 0, lightness: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    hue: Math.round(h * 360),
    saturation: Math.round(s * 100),
    lightness: Math.round(l * 100),
  };
}

export function OKLCHColorPicker({ label, value, onChange, id }: HSLColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [hexValue, setHexValue] = useState('');
  const [hslValues, setHslValues] = useState<HSLValues>(() => {
    const parsed = parseHSL(value);
    return parsed || { hue: 240, saturation: 50, lightness: 50 };
  });

  useEffect(() => {
    setLocalValue(value);
    const parsed = parseHSL(value);
    if (parsed) {
      setHslValues(parsed);
      setHexValue(hslToHex(parsed.hue, parsed.saturation, parsed.lightness));
    }
  }, [value]);

  const handleSliderChange = (key: keyof HSLValues, newValue: number[]) => {
    const updatedValues = { ...hslValues, [key]: newValue[0] };
    setHslValues(updatedValues);
    const formatted = formatHSL(updatedValues);
    setLocalValue(formatted);
    setHexValue(hslToHex(updatedValues.hue, updatedValues.saturation, updatedValues.lightness));
    onChange(formatted);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexValue(hex);
    
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      const hsl = hexToHSL(hex);
      setHslValues(hsl);
      const formatted = formatHSL(hsl);
      setLocalValue(formatted);
      onChange(formatted);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Try to parse and update sliders
    const parsed = parseHSL(newValue);
    if (parsed) {
      setHslValues(parsed);
      setHexValue(hslToHex(parsed.hue, parsed.saturation, parsed.lightness));
    }
    
    onChange(newValue);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localValue);
      setCopied(true);
      toast.success('Color copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy color');
    }
  };

  const isValidColor = parseHSL(localValue) !== null;
  
  // Convert HSL to CSS for preview
  const previewColor = `hsl(${hslValues.hue} ${hslValues.saturation}% ${hslValues.lightness}%)`;

  // Preset colors
  const presetColors = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Gray', hex: '#6b7280' },
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
  ];

  const handlePresetClick = (hex: string) => {
    const hsl = hexToHSL(hex);
    setHslValues(hsl);
    setHexValue(hex);
    const formatted = formatHSL(hsl);
    setLocalValue(formatted);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium flex items-center justify-between">
        <span>{label}</span>
        {!isValidColor && (
          <span className="text-xs text-destructive">Invalid HSL format</span>
        )}
      </Label>
      
      <div className="flex items-center gap-2">
        {/* Color Preview & Picker Trigger */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-12 h-12 rounded-lg border-2 border-border hover:border-primary transition-colors flex-shrink-0 relative overflow-hidden group"
              style={{ background: previewColor }}
              title="Click to open color picker"
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Pipette className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
            </button>
          </PopoverTrigger>
          
          <PopoverContent className="w-96" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Picker
                </h4>
                <div
                  className="w-20 h-10 rounded border-2 border-border"
                  style={{ background: previewColor }}
                />
              </div>

              {/* Hex Input */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Hex Color</Label>
                <Input
                  type="text"
                  value={hexValue}
                  onChange={handleHexChange}
                  placeholder="#3b82f6"
                  className="font-mono"
                  maxLength={7}
                />
              </div>

              {/* Preset Colors */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Quick Colors</Label>
                <div className="grid grid-cols-11 gap-1">
                  {presetColors.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => handlePresetClick(preset.hex)}
                      className="w-7 h-7 rounded border-2 border-border hover:border-primary transition-colors"
                      style={{ background: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <Label className="text-xs font-semibold mb-3 block">Fine Tune</Label>

              {/* Hue Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Hue (H)</Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {hslValues.hue.toFixed(1)}°
                  </span>
                </div>
                <Slider
                  value={[hslValues.hue]}
                  onValueChange={(v: number[]) => handleSliderChange('hue', v)}
                  min={0}
                  max={360}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Red</span>
                  <span>Green</span>
                  <span>Blue</span>
                  <span>Red</span>
                </div>
              </div>

              {/* Saturation Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Saturation (S)</Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {hslValues.saturation.toFixed(1)}%
                  </span>
                </div>
                <Slider
                  value={[hslValues.saturation]}
                  onValueChange={(v: number[]) => handleSliderChange('saturation', v)}
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Gray</span>
                  <span>Vivid</span>
                </div>
              </div>

              {/* Lightness Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Lightness (L)</Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {hslValues.lightness.toFixed(1)}%
                  </span>
                </div>
                <Slider
                  value={[hslValues.lightness]}
                  onValueChange={(v: number[]) => handleSliderChange('lightness', v)}
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Black</span>
                  <span>White</span>
                </div>
              </div>

              {/* Alpha Slider (optional) */}
              {hslValues.alpha !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Alpha (A)</Label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {hslValues.alpha.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[hslValues.alpha]}
                    onValueChange={(v: number[]) => handleSliderChange('alpha', v)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              )}

              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Input
            id={id}
            type="text"
            value={localValue}
            onChange={handleInputChange}
            placeholder="240 5.9% 10%"
            className={`font-mono text-sm pr-10 ${!isValidColor ? 'border-destructive' : ''}`}
          />
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
            title="Copy color"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Format: H S% L% (e.g., 240 5.9% 10%) or hsl(240 5.9% 10%)
      </p>
    </div>
  );
}
