'use client';

/**
 * TypographyEditor Component
 * Provides UI for editing typography settings with live preview
 */

import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FontSizeEditor } from './FontSizeEditor';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export function TypographyEditor() {
  const { settings, updateTypography } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Font Sizes']));
  const [editingSize, setEditingSize] = useState<string | null>(null);

  if (!settings) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  const { typography } = settings;

  // Handler for font size changes
  const handleFontSizeChange = async (key: string, value: string) => {
    try {
      await updateTypography({
        fontSize: {
          ...typography.fontSize,
          [key]: value,
        },
      });
    } catch (error) {
      console.error('Failed to update font size:', error);
    }
  };

  // Handler for font weight changes
  const handleFontWeightChange = async (key: string, value: number) => {
    try {
      await updateTypography({
        fontWeight: {
          ...typography.fontWeight,
          [key]: value,
        },
      });
    } catch (error) {
      console.error('Failed to update font weight:', error);
    }
  };

  // Handler for line height changes
  const handleLineHeightChange = async (key: string, value: number) => {
    try {
      await updateTypography({
        lineHeight: {
          ...typography.lineHeight,
          [key]: value,
        },
      });
    } catch (error) {
      console.error('Failed to update line height:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Font Families Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('Font Families')}
          className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
          aria-expanded={expandedSections.has('Font Families')}
          aria-controls="font-families-section"
          aria-label="Font families section"
        >
          <div className="text-left">
            <h3 className="font-semibold">Font Families</h3>
            <p className="text-sm text-muted-foreground">Configure font stacks for different text types</p>
          </div>
          {expandedSections.has('Font Families') ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        {expandedSections.has('Font Families') && (
          <div className="p-4 space-y-4 bg-card" id="font-families-section">
            {/* Sans-serif */}
            <div>
              <label htmlFor="font-sans" className="block font-medium text-sm mb-2">Sans-serif</label>
              <div 
                id="font-sans"
                className="p-3 bg-muted rounded-md font-mono text-sm"
                role="textbox"
                aria-readonly="true"
                aria-label="Sans-serif font family stack"
                aria-describedby="font-sans-description"
              >
                {typography.fontFamily.sans.join(', ')}
              </div>
              <p id="font-sans-description" className="text-xs text-muted-foreground mt-1">Used for body text and UI elements</p>
            </div>

            {/* Serif */}
            <div>
              <label htmlFor="font-serif" className="block font-medium text-sm mb-2">Serif</label>
              <div 
                id="font-serif"
                className="p-3 bg-muted rounded-md font-mono text-sm"
                role="textbox"
                aria-readonly="true"
                aria-label="Serif font family stack"
                aria-describedby="font-serif-description"
              >
                {typography.fontFamily.serif.join(', ')}
              </div>
              <p id="font-serif-description" className="text-xs text-muted-foreground mt-1">Used for headings and formal content</p>
            </div>

            {/* Monospace */}
            <div>
              <label htmlFor="font-mono" className="block font-medium text-sm mb-2">Monospace</label>
              <div 
                id="font-mono"
                className="p-3 bg-muted rounded-md font-mono text-sm"
                role="textbox"
                aria-readonly="true"
                aria-label="Monospace font family stack"
                aria-describedby="font-mono-description"
              >
                {typography.fontFamily.mono.join(', ')}
              </div>
              <p id="font-mono-description" className="text-xs text-muted-foreground mt-1">Used for code and technical content</p>
            </div>
          </div>
        )}
      </div>

      {/* Font Sizes Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('Font Sizes')}
          className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
          aria-expanded={expandedSections.has('Font Sizes')}
          aria-controls="font-sizes-section"
          aria-label="Font sizes section"
        >
          <div className="text-left">
            <h3 className="font-semibold">Font Sizes</h3>
            <p className="text-sm text-muted-foreground">Type scale for text hierarchy</p>
          </div>
          {expandedSections.has('Font Sizes') ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        {expandedSections.has('Font Sizes') && (
          <div className="p-4 space-y-3 bg-card" id="font-sizes-section">
            {Object.entries(typography.fontSize).map(([key, value]) => (
              <div key={key}>
                {editingSize === key ? (
                  <div className="space-y-2">
                    <FontSizeEditor
                      label={key}
                      value={value}
                      onChange={(newValue) => handleFontSizeChange(key, newValue)}
                    />
                    <button
                      onClick={() => setEditingSize(null)}
                      className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Done Editing
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-baseline gap-3">
                      <span className="font-medium text-sm w-16">{key}</span>
                      <span className="font-mono text-sm text-muted-foreground">{value}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div style={{ fontSize: value }} className="text-foreground">
                        Sample
                      </div>
                      <button
                        onClick={() => setEditingSize(key)}
                        className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Font Weights Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('Font Weights')}
          className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
          aria-expanded={expandedSections.has('Font Weights')}
          aria-controls="font-weights-section"
          aria-label="Font weights section"
        >
          <div className="text-left">
            <h3 className="font-semibold">Font Weights</h3>
            <p className="text-sm text-muted-foreground">Weight scale for emphasis</p>
          </div>
          {expandedSections.has('Font Weights') ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        {expandedSections.has('Font Weights') && (
          <div className="p-4 space-y-3 bg-card" id="font-weights-section">
            {Object.entries(typography.fontWeight).map(([key, value]) => (
              <div key={key} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium capitalize">{key}</Label>
                  <div style={{ fontWeight: value }} className="text-foreground">
                    Sample Text
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Weight</Label>
                    <span className="text-xs font-mono text-muted-foreground">{value}</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={([v]) => handleFontWeightChange(key, v)}
                    min={100}
                    max={900}
                    step={100}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Line Heights Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('Line Heights')}
          className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
          aria-expanded={expandedSections.has('Line Heights')}
          aria-controls="line-heights-section"
          aria-label="Line heights section"
        >
          <div className="text-left">
            <h3 className="font-semibold">Line Heights</h3>
            <p className="text-sm text-muted-foreground">Spacing between lines of text</p>
          </div>
          {expandedSections.has('Line Heights') ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        {expandedSections.has('Line Heights') && (
          <div className="p-4 space-y-4 bg-card" id="line-heights-section">
            {Object.entries(typography.lineHeight).map(([key, value]) => (
              <div key={key} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-medium text-sm w-20 capitalize">{key}</span>
                  <span className="font-mono text-sm text-muted-foreground">{value}</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[value]}
                    onValueChange={([v]) => handleLineHeightChange(key, v)}
                    min={1}
                    max={2.5}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                <div 
                  style={{ lineHeight: value }} 
                  className="text-sm text-foreground bg-muted/30 p-3 rounded"
                >
                  This is sample text to demonstrate line height. Multiple lines help visualize the spacing between
                  lines of text in a paragraph.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Letter Spacing Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('Letter Spacing')}
          className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
          aria-expanded={expandedSections.has('Letter Spacing')}
          aria-controls="letter-spacing-section"
          aria-label="Letter spacing section"
        >
          <div className="text-left">
            <h3 className="font-semibold">Letter Spacing</h3>
            <p className="text-sm text-muted-foreground">Spacing between characters</p>
          </div>
          {expandedSections.has('Letter Spacing') ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        {expandedSections.has('Letter Spacing') && (
          <div className="p-4 space-y-3 bg-card" id="letter-spacing-section" role="list" aria-label="Letter spacing scale">
            {Object.entries(typography.letterSpacing).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between" role="listitem">
                <div className="flex items-baseline gap-3">
                  <span className="font-medium text-sm w-20" aria-label={`Spacing ${key}`}>{key}</span>
                  <span className="font-mono text-sm text-muted-foreground" aria-label={`Value ${value}`}>{value}</span>
                </div>
                <div style={{ letterSpacing: value }} className="text-foreground" aria-label={`Preview with letter spacing ${value}`}>
                  Sample Text
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="p-4 bg-muted/50 border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Use the sliders to adjust font sizes, weights, and line heights. 
          Changes are applied in real-time and saved automatically.
        </p>
      </div>
    </div>
  );
}
