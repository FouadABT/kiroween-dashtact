'use client';

/**
 * Design System Documentation Page
 * Displays all available design tokens with examples and code snippets
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getColorToken,
  getChartColors,
  getFontSize,
  getFontWeight,
  getLineHeight,
  getLetterSpacing,
  getFontFamily,
  getColorCSSVariable,
  getTypographyCSSVariable,
  getForegroundToken,
  type ColorTokenName,
  type FontSizeScale,
  type FontWeightScale,
  type LineHeightScale,
  type LetterSpacingScale,
} from '@/lib/design-tokens';
import { ColorPalette } from '@/types/settings';

/**
 * Color swatch component
 */
function ColorSwatch({ 
  name, 
  value, 
  palette 
}: { 
  name: ColorTokenName; 
  value: string; 
  palette: ColorPalette;
}) {
  const foregroundToken = getForegroundToken(name);
  const foregroundValue = foregroundToken ? getColorToken(palette, foregroundToken) : undefined;
  
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <div 
        className="h-20 rounded-md border flex items-center justify-center text-sm font-medium"
        style={{ 
          backgroundColor: value,
          color: foregroundValue || 'inherit'
        }}
      >
        {name}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{value}</p>
        <code className="text-xs bg-muted px-2 py-1 rounded block">
          {getColorCSSVariable(name)}
        </code>
      </div>
    </div>
  );
}

/**
 * Typography example component
 */
function TypographyExample({
  label,
  value,
  cssVar,
  example,
}: {
  label: string;
  value: string | number;
  cssVar: string;
  example?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{String(value)}</p>
        <code className="text-xs bg-muted px-2 py-1 rounded block">
          {cssVar}
        </code>
      </div>
      {example && (
        <div className="mt-2 p-3 bg-muted/50 rounded">
          {example}
        </div>
      )}
    </div>
  );
}

/**
 * Code snippet component
 */
function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1 text-xs bg-background border rounded hover:bg-accent"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

export default function DesignSystemPage() {
  const { settings, resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'usage'>('colors');

  // Get current palette based on resolved theme
  const currentPalette = useMemo(() => {
    if (!settings) return null;
    return resolvedTheme === 'light' ? settings.lightPalette : settings.darkPalette;
  }, [settings, resolvedTheme]);

  // Filter color tokens based on search
  const filteredColorTokens = useMemo(() => {
    if (!currentPalette) return [];
    
    const tokens = Object.keys(currentPalette) as ColorTokenName[];
    
    if (!searchQuery) return tokens;
    
    return tokens.filter(token =>
      token.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentPalette, searchQuery]);

  // Group color tokens by category
  const colorGroups = useMemo(() => {
    if (!currentPalette) return {};
    
    const groups: Record<string, ColorTokenName[]> = {
      'Base Colors': [],
      'Component Colors': [],
      'Semantic Colors': [],
      'UI Elements': [],
      'Chart Colors': [],
      'Sidebar Colors': [],
      'Other': [],
    };

    filteredColorTokens.forEach(token => {
      if (['background', 'foreground'].includes(token)) {
        groups['Base Colors'].push(token);
      } else if (token.startsWith('card') || token.startsWith('popover')) {
        groups['Component Colors'].push(token);
      } else if (
        token.startsWith('primary') ||
        token.startsWith('secondary') ||
        token.startsWith('muted') ||
        token.startsWith('accent') ||
        token.startsWith('destructive')
      ) {
        groups['Semantic Colors'].push(token);
      } else if (['border', 'input', 'ring'].includes(token)) {
        groups['UI Elements'].push(token);
      } else if (token.startsWith('chart')) {
        groups['Chart Colors'].push(token);
      } else if (token.startsWith('sidebar')) {
        groups['Sidebar Colors'].push(token);
      } else {
        groups['Other'].push(token);
      }
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([, tokens]) => tokens.length > 0)
    );
  }, [currentPalette, filteredColorTokens]);

  if (!settings || !currentPalette) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Design System</h1>
        <p className="text-muted-foreground">
          Complete reference of design tokens, colors, and typography available in the application.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg bg-background"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'colors'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Colors
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'typography'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Typography
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'usage'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Usage
          </button>
        </div>
      </div>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-8">
          {Object.entries(colorGroups).map(([groupName, tokens]) => (
            <div key={groupName} className="space-y-4">
              <h2 className="text-2xl font-semibold">{groupName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tokens.map((token) => (
                  <ColorSwatch
                    key={token}
                    name={token}
                    value={getColorToken(currentPalette, token)}
                    palette={currentPalette}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Chart Colors Preview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Chart Color Palette</h2>
            <div className="flex gap-2 h-20">
              {getChartColors(currentPalette).map((color, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-lg border"
                  style={{ backgroundColor: color }}
                  title={`chart${index + 1}: ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <div className="space-y-8">
          {/* Font Families */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Font Families</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TypographyExample
                label="Sans Serif"
                value={getFontFamily(settings.typography, 'sans')}
                cssVar="var(--font-sans)"
                example={
                  <p style={{ fontFamily: getFontFamily(settings.typography, 'sans') }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                }
              />
              <TypographyExample
                label="Serif"
                value={getFontFamily(settings.typography, 'serif')}
                cssVar="var(--font-serif)"
                example={
                  <p style={{ fontFamily: getFontFamily(settings.typography, 'serif') }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                }
              />
              <TypographyExample
                label="Monospace"
                value={getFontFamily(settings.typography, 'mono')}
                cssVar="var(--font-mono)"
                example={
                  <p style={{ fontFamily: getFontFamily(settings.typography, 'mono') }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                }
              />
            </div>
          </div>

          {/* Font Sizes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Font Sizes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as FontSizeScale[]).map(
                (scale) => (
                  <TypographyExample
                    key={scale}
                    label={scale}
                    value={getFontSize(settings.typography, scale)}
                    cssVar={getTypographyCSSVariable('font-size', scale)}
                    example={
                      <p style={{ fontSize: getFontSize(settings.typography, scale) }}>
                        Sample Text
                      </p>
                    }
                  />
                )
              )}
            </div>
          </div>

          {/* Font Weights */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Font Weights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'] as FontWeightScale[]).map(
                (scale) => (
                  <TypographyExample
                    key={scale}
                    label={scale}
                    value={getFontWeight(settings.typography, scale)}
                    cssVar={getTypographyCSSVariable('font-weight', scale)}
                    example={
                      <p style={{ fontWeight: getFontWeight(settings.typography, scale) }}>
                        Sample Text
                      </p>
                    }
                  />
                )
              )}
            </div>
          </div>

          {/* Line Heights */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Line Heights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['tight', 'normal', 'relaxed', 'loose'] as LineHeightScale[]).map((scale) => (
                <TypographyExample
                  key={scale}
                  label={scale}
                  value={getLineHeight(settings.typography, scale)}
                  cssVar={getTypographyCSSVariable('line-height', scale)}
                  example={
                    <p style={{ lineHeight: getLineHeight(settings.typography, scale) }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  }
                />
              ))}
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Letter Spacing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {(['tighter', 'tight', 'normal', 'wide', 'wider'] as LetterSpacingScale[]).map(
                (scale) => (
                  <TypographyExample
                    key={scale}
                    label={scale}
                    value={getLetterSpacing(settings.typography, scale)}
                    cssVar={getTypographyCSSVariable('letter-spacing', scale)}
                    example={
                      <p
                        style={{
                          letterSpacing: getLetterSpacing(settings.typography, scale),
                        }}
                      >
                        SAMPLE TEXT
                      </p>
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Using Design Tokens</h2>
            <p className="text-muted-foreground">
              Design tokens can be accessed programmatically using utility functions or via CSS
              variables.
            </p>
          </div>

          {/* Color Token Usage */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Accessing Color Tokens</h3>
            <CodeSnippet
              code={`import { getColorToken, getColorCSSVariable } from '@/lib/design-tokens';
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { settings, resolvedTheme } = useTheme();
  const palette = resolvedTheme === 'light' 
    ? settings.lightPalette 
    : settings.darkPalette;
  
  // Get color value
  const primaryColor = getColorToken(palette, 'primary');
  
  // Get CSS variable
  const cssVar = getColorCSSVariable('primary');
  
  return (
    <div style={{ backgroundColor: primaryColor }}>
      {/* Or use CSS variable */}
      <div style={{ color: cssVar }}>
        Content
      </div>
    </div>
  );
}`}
            />
          </div>

          {/* Typography Token Usage */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Accessing Typography Tokens</h3>
            <CodeSnippet
              code={`import { getFontSize, getFontWeight, getTypographyStyle } from '@/lib/design-tokens';
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { settings } = useTheme();
  
  // Get individual values
  const fontSize = getFontSize(settings.typography, 'lg');
  const fontWeight = getFontWeight(settings.typography, 'semibold');
  
  // Get complete style object
  const headingStyle = getTypographyStyle(
    settings.typography,
    '2xl',
    'bold',
    'tight'
  );
  
  return (
    <h1 style={headingStyle}>
      Heading Text
    </h1>
  );
}`}
            />
          </div>

          {/* CSS Variable Usage */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Using CSS Variables</h3>
            <CodeSnippet
              code={`/* In your CSS or Tailwind classes */
.my-component {
  background-color: var(--primary);
  color: var(--primary-foreground);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

/* With Tailwind arbitrary values */
<div className="bg-[var(--primary)] text-[var(--primary-foreground)]">
  Content
</div>`}
            />
          </div>

          {/* Chart Colors Usage */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Using Chart Colors</h3>
            <CodeSnippet
              code={`import { getChartColors } from '@/lib/design-tokens';
import { useTheme } from '@/contexts/ThemeContext';

function MyChart() {
  const { settings, resolvedTheme } = useTheme();
  const palette = resolvedTheme === 'light' 
    ? settings.lightPalette 
    : settings.darkPalette;
  
  const chartColors = getChartColors(palette);
  
  return (
    <Chart
      data={data}
      colors={chartColors}
    />
  );
}`}
            />
          </div>

          {/* Best Practices */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Best Practices</h3>
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <div>
                <h4 className="font-semibold mb-2">✓ Do:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Use semantic color tokens (primary, secondary, etc.) instead of specific colors</li>
                  <li>Use CSS variables for dynamic theming support</li>
                  <li>Use typography scale for consistent text sizing</li>
                  <li>Pair background colors with their corresponding foreground colors</li>
                  <li>Use chart colors for data visualization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✗ Don&apos;t:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Hardcode color values in components</li>
                  <li>Use arbitrary font sizes outside the type scale</li>
                  <li>Mix light and dark palette colors</li>
                  <li>Override CSS variables without good reason</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
