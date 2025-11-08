'use client';

/**
 * ColorPaletteEditor Component
 * Provides UI for editing color palettes with OKLCH color format
 */

import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ColorPalette } from '@/types/settings';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { calculateContrastRatio, getContrastLevel, formatContrastRatio } from '@/lib/color-contrast';
import { ColorPicker } from './ColorPicker';

interface ColorGroup {
  title: string;
  description: string;
  colors: Array<{
    key: keyof ColorPalette;
    label: string;
    description: string;
  }>;
}

/**
 * Contrast Indicator Component
 * Shows WCAG compliance status for color pairs
 */
function ContrastIndicator({ background, foreground }: { background: string; foreground: string }) {
  const ratio = calculateContrastRatio(background, foreground);
  const level = getContrastLevel(ratio);

  const getIcon = () => {
    switch (level) {
      case 'aaa':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'aa':
        return <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'aaa':
        return 'AAA';
      case 'aa':
        return 'AA';
      case 'fail':
        return 'Fail';
    }
  };

  const getColor = () => {
    switch (level) {
      case 'aaa':
        return 'text-green-600 dark:text-green-400';
      case 'aa':
        return 'text-blue-600 dark:text-blue-400';
      case 'fail':
        return 'text-destructive';
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs" title={`Contrast ratio: ${formatContrastRatio(ratio)}`}>
      {getIcon()}
      <span className={`font-medium ${getColor()}`}>
        {getLabel()} {formatContrastRatio(ratio)}
      </span>
    </div>
  );
}

const colorGroups: ColorGroup[] = [
  {
    title: 'Base Colors',
    description: 'Foundation colors for backgrounds and text',
    colors: [
      { key: 'background', label: 'Background', description: 'Main background color' },
      { key: 'foreground', label: 'Foreground', description: 'Main text color' },
      { key: 'card', label: 'Card', description: 'Card background' },
      { key: 'cardForeground', label: 'Card Foreground', description: 'Card text color' },
      { key: 'popover', label: 'Popover', description: 'Popover background' },
      { key: 'popoverForeground', label: 'Popover Foreground', description: 'Popover text' },
    ],
  },
  {
    title: 'Semantic Colors',
    description: 'Colors with specific meanings and purposes',
    colors: [
      { key: 'primary', label: 'Primary', description: 'Primary brand color' },
      { key: 'primaryForeground', label: 'Primary Foreground', description: 'Text on primary' },
      { key: 'secondary', label: 'Secondary', description: 'Secondary color' },
      { key: 'secondaryForeground', label: 'Secondary Foreground', description: 'Text on secondary' },
      { key: 'accent', label: 'Accent', description: 'Accent/highlight color' },
      { key: 'accentForeground', label: 'Accent Foreground', description: 'Text on accent' },
      { key: 'muted', label: 'Muted', description: 'Subdued backgrounds' },
      { key: 'mutedForeground', label: 'Muted Foreground', description: 'Subdued text' },
      { key: 'destructive', label: 'Destructive', description: 'Error/danger color' },
      { key: 'destructiveForeground', label: 'Destructive Foreground', description: 'Text on destructive' },
    ],
  },
  {
    title: 'UI Elements',
    description: 'Colors for borders, inputs, and focus states',
    colors: [
      { key: 'border', label: 'Border', description: 'Component borders' },
      { key: 'input', label: 'Input', description: 'Input field borders' },
      { key: 'ring', label: 'Ring', description: 'Focus ring color' },
    ],
  },
  {
    title: 'Chart Colors',
    description: 'Colors for data visualization',
    colors: [
      { key: 'chart1', label: 'Chart 1', description: 'First chart color' },
      { key: 'chart2', label: 'Chart 2', description: 'Second chart color' },
      { key: 'chart3', label: 'Chart 3', description: 'Third chart color' },
      { key: 'chart4', label: 'Chart 4', description: 'Fourth chart color' },
      { key: 'chart5', label: 'Chart 5', description: 'Fifth chart color' },
    ],
  },
  {
    title: 'Sidebar Colors',
    description: 'Colors specific to sidebar navigation',
    colors: [
      { key: 'sidebar', label: 'Sidebar', description: 'Sidebar background' },
      { key: 'sidebarForeground', label: 'Sidebar Foreground', description: 'Sidebar text' },
      { key: 'sidebarPrimary', label: 'Sidebar Primary', description: 'Sidebar primary color' },
      { key: 'sidebarPrimaryForeground', label: 'Sidebar Primary Foreground', description: 'Text on sidebar primary' },
      { key: 'sidebarAccent', label: 'Sidebar Accent', description: 'Sidebar accent' },
      { key: 'sidebarAccentForeground', label: 'Sidebar Accent Foreground', description: 'Text on sidebar accent' },
      { key: 'sidebarBorder', label: 'Sidebar Border', description: 'Sidebar borders' },
      { key: 'sidebarRing', label: 'Sidebar Ring', description: 'Sidebar focus ring' },
    ],
  },
];

export function ColorPaletteEditor() {
  const { settings, resolvedTheme, updateColorPalette } = useTheme();
  const [activeMode, setActiveMode] = useState<'light' | 'dark'>(resolvedTheme);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Base Colors']));
  const [editingColor, setEditingColor] = useState<keyof ColorPalette | null>(null);

  if (!settings) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  const currentPalette = activeMode === 'light' ? settings.lightPalette : settings.darkPalette;

  // Handler for color changes
  const handleColorChange = async (colorKey: keyof ColorPalette, colorValue: string) => {
    try {
      await updateColorPalette({ [colorKey]: colorValue }, activeMode);
    } catch (error) {
      console.error('Failed to update color:', error);
    }
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupTitle)) {
        next.delete(groupTitle);
      } else {
        next.add(groupTitle);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div 
        className="flex gap-2 p-1 bg-muted rounded-lg"
        role="tablist"
        aria-label="Color palette mode selection"
      >
        <button
          onClick={() => setActiveMode('light')}
          role="tab"
          aria-selected={activeMode === 'light'}
          aria-controls="color-palette-panel"
          className={`
            flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeMode === 'light' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}
          `}
        >
          Light Mode
        </button>
        <button
          onClick={() => setActiveMode('dark')}
          role="tab"
          aria-selected={activeMode === 'dark'}
          aria-controls="color-palette-panel"
          className={`
            flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeMode === 'dark' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}
          `}
        >
          Dark Mode
        </button>
      </div>

      {/* Color Groups */}
      <div 
        className="space-y-3"
        id="color-palette-panel"
        role="tabpanel"
        aria-label={`${activeMode} mode color palette`}
      >
        {colorGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.title);

          return (
            <div key={group.title} className="border border-border rounded-lg overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                aria-expanded={isExpanded}
                aria-controls={`color-group-${group.title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="text-left">
                  <h3 className="font-semibold">{group.title}</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                )}
              </button>

              {/* Group Colors */}
              {isExpanded && (
                <div 
                  className="p-4 space-y-3 bg-card"
                  id={`color-group-${group.title.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {group.colors.map((color) => {
                    // Determine if this color has a foreground pair for contrast checking
                    const isForegroundColor = color.key.toString().toLowerCase().includes('foreground');
                    const baseKey = color.key.toString().replace('Foreground', '') as keyof ColorPalette;
                    const hasPair = !isForegroundColor && `${baseKey}Foreground` in currentPalette;
                    const foregroundKey = `${baseKey}Foreground` as keyof ColorPalette;

                    return (
                      <div key={color.key} className="space-y-2">
                        {editingColor === color.key ? (
                          // Edit Mode - Show ColorPicker
                          <div className="space-y-2">
                            <ColorPicker
                              label={color.label}
                              value={currentPalette[color.key]}
                              onChange={(value) => handleColorChange(color.key, value)}
                              description={color.description}
                            />
                            <button
                              onClick={() => setEditingColor(null)}
                              className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                              Done Editing
                            </button>
                          </div>
                        ) : (
                          // View Mode - Show Color Preview
                          <>
                            <div className="flex items-center gap-4">
                              {/* Color Preview */}
                              <button
                                onClick={() => setEditingColor(color.key)}
                                className="w-12 h-12 rounded-md border-2 border-border shadow-sm flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                                style={{ backgroundColor: currentPalette[color.key] }}
                                title={`Click to edit ${color.label}`}
                                aria-label={`Edit ${color.label} color`}
                              />

                              {/* Color Info */}
                              <div className="flex-1 min-w-0">
                                <label className="block font-medium text-sm">
                                  {color.label}
                                </label>
                                <p className="text-xs text-muted-foreground truncate">
                                  {color.description}
                                </p>
                              </div>

                              {/* Color Value Display */}
                              <div className="flex-shrink-0">
                                <div className="px-3 py-2 text-sm font-mono bg-muted border border-border rounded-md">
                                  {currentPalette[color.key]}
                                </div>
                              </div>

                              {/* Edit Button */}
                              <button
                                onClick={() => setEditingColor(color.key)}
                                className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                              >
                                Edit
                              </button>
                            </div>

                            {/* Contrast Indicator for background/foreground pairs */}
                            {hasPair && foregroundKey in currentPalette && (
                              <div 
                                className="ml-16 flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                                role="status"
                                aria-label={`Contrast ratio information for ${color.label}`}
                              >
                                <Info className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                <span className="text-xs text-muted-foreground">Contrast with foreground:</span>
                                <ContrastIndicator
                                  background={currentPalette[color.key]}
                                  foreground={currentPalette[foregroundKey]}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="p-4 bg-muted/50 border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Click on any color preview or &quot;Edit&quot; button to customize colors using interactive sliders. 
          Colors use OKLCH format for perceptual uniformity and better color manipulation.
        </p>
      </div>
    </div>
  );
}
