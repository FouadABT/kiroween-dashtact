/**
 * Design Token Utilities
 * Provides utility functions to access design tokens programmatically
 */

import { ColorPalette, TypographyConfig } from '@/types/settings';

/**
 * Color token names that can be accessed from the palette
 */
export type ColorTokenName = keyof ColorPalette;

/**
 * Typography size scale names
 */
export type FontSizeScale = keyof TypographyConfig['fontSize'];

/**
 * Font weight scale names
 */
export type FontWeightScale = keyof TypographyConfig['fontWeight'];

/**
 * Line height scale names
 */
export type LineHeightScale = keyof TypographyConfig['lineHeight'];

/**
 * Letter spacing scale names
 */
export type LetterSpacingScale = keyof TypographyConfig['letterSpacing'];

/**
 * Get a color value by its semantic name from a color palette
 * 
 * @param palette - The color palette object (light or dark)
 * @param tokenName - The semantic name of the color token
 * @returns The OKLCH color value as a string
 * 
 * @example
 * ```typescript
 * const bgColor = getColorToken(lightPalette, 'background');
 * // Returns: 'oklch(1 0 0)'
 * ```
 */
export function getColorToken(palette: ColorPalette, tokenName: ColorTokenName): string {
  return palette[tokenName];
}

/**
 * Get multiple color values by their semantic names
 * 
 * @param palette - The color palette object (light or dark)
 * @param tokenNames - Array of semantic color token names
 * @returns Object mapping token names to their color values
 * 
 * @example
 * ```typescript
 * const colors = getColorTokens(lightPalette, ['primary', 'secondary', 'accent']);
 * // Returns: { primary: 'oklch(...)', secondary: 'oklch(...)', accent: 'oklch(...)' }
 * ```
 */
export function getColorTokens(
  palette: ColorPalette,
  tokenNames: ColorTokenName[]
): Record<string, string> {
  return tokenNames.reduce((acc, name) => {
    acc[name] = palette[name];
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Get a font size value by its scale level
 * 
 * @param typography - The typography configuration object
 * @param scale - The font size scale level (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl)
 * @returns The font size value in rem units
 * 
 * @example
 * ```typescript
 * const fontSize = getFontSize(typography, 'lg');
 * // Returns: '1.125rem'
 * ```
 */
export function getFontSize(typography: TypographyConfig, scale: FontSizeScale): string {
  return typography.fontSize[scale];
}

/**
 * Get a font weight value by its scale level
 * 
 * @param typography - The typography configuration object
 * @param scale - The font weight scale level (light, normal, medium, semibold, bold, extrabold)
 * @returns The font weight value as a number
 * 
 * @example
 * ```typescript
 * const fontWeight = getFontWeight(typography, 'semibold');
 * // Returns: 600
 * ```
 */
export function getFontWeight(typography: TypographyConfig, scale: FontWeightScale): number {
  return typography.fontWeight[scale];
}

/**
 * Get a line height value by its scale level
 * 
 * @param typography - The typography configuration object
 * @param scale - The line height scale level (tight, normal, relaxed, loose)
 * @returns The line height value as a number
 * 
 * @example
 * ```typescript
 * const lineHeight = getLineHeight(typography, 'relaxed');
 * // Returns: 1.75
 * ```
 */
export function getLineHeight(typography: TypographyConfig, scale: LineHeightScale): number {
  return typography.lineHeight[scale];
}

/**
 * Get a letter spacing value by its scale level
 * 
 * @param typography - The typography configuration object
 * @param scale - The letter spacing scale level (tighter, tight, normal, wide, wider)
 * @returns The letter spacing value in em units
 * 
 * @example
 * ```typescript
 * const letterSpacing = getLetterSpacing(typography, 'wide');
 * // Returns: '0.025em'
 * ```
 */
export function getLetterSpacing(typography: TypographyConfig, scale: LetterSpacingScale): string {
  return typography.letterSpacing[scale];
}

/**
 * Get a complete typography style object for a specific scale
 * 
 * @param typography - The typography configuration object
 * @param sizeScale - The font size scale level
 * @param weightScale - The font weight scale level (optional, defaults to 'normal')
 * @param lineHeightScale - The line height scale level (optional, defaults to 'normal')
 * @returns Object with fontSize, fontWeight, and lineHeight properties
 * 
 * @example
 * ```typescript
 * const headingStyle = getTypographyStyle(typography, '2xl', 'bold', 'tight');
 * // Returns: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25 }
 * ```
 */
export function getTypographyStyle(
  typography: TypographyConfig,
  sizeScale: FontSizeScale,
  weightScale: FontWeightScale = 'normal',
  lineHeightScale: LineHeightScale = 'normal'
): {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
} {
  return {
    fontSize: getFontSize(typography, sizeScale),
    fontWeight: getFontWeight(typography, weightScale),
    lineHeight: getLineHeight(typography, lineHeightScale),
  };
}

/**
 * Get a font family stack by category
 * 
 * @param typography - The typography configuration object
 * @param category - The font family category (sans, serif, mono)
 * @returns Array of font family names as a comma-separated string
 * 
 * @example
 * ```typescript
 * const fontFamily = getFontFamily(typography, 'sans');
 * // Returns: 'var(--font-geist-sans), system-ui, sans-serif'
 * ```
 */
export function getFontFamily(
  typography: TypographyConfig,
  category: 'sans' | 'serif' | 'mono'
): string {
  return typography.fontFamily[category].join(', ');
}

/**
 * Get all chart colors as an array
 * 
 * @param palette - The color palette object (light or dark)
 * @returns Array of chart color values
 * 
 * @example
 * ```typescript
 * const chartColors = getChartColors(lightPalette);
 * // Returns: ['oklch(...)', 'oklch(...)', 'oklch(...)', 'oklch(...)', 'oklch(...)']
 * ```
 */
export function getChartColors(palette: ColorPalette): string[] {
  return [
    palette.chart1,
    palette.chart2,
    palette.chart3,
    palette.chart4,
    palette.chart5,
  ];
}

/**
 * Get a CSS variable name for a color token
 * Useful for applying colors via inline styles or CSS-in-JS
 * 
 * @param tokenName - The semantic name of the color token
 * @returns The CSS variable name as a string
 * 
 * @example
 * ```typescript
 * const cssVar = getColorCSSVariable('primary');
 * // Returns: 'var(--primary)'
 * ```
 */
export function getColorCSSVariable(tokenName: ColorTokenName): string {
  // Convert camelCase to kebab-case for CSS variables
  const kebabCase = tokenName.replace(/([A-Z])/g, '-$1').toLowerCase();
  
  // Handle special cases for sidebar
  const varName = kebabCase.startsWith('sidebar-')
    ? `--sidebar-${kebabCase.slice(9)}`
    : `--${kebabCase}`;
  
  return `var(${varName})`;
}

/**
 * Get a CSS variable name for a typography token
 * 
 * @param category - The typography category (font-size, font-weight, line-height, letter-spacing)
 * @param scale - The scale level
 * @returns The CSS variable name as a string
 * 
 * @example
 * ```typescript
 * const cssVar = getTypographyCSSVariable('font-size', 'lg');
 * // Returns: 'var(--font-size-lg)'
 * ```
 */
export function getTypographyCSSVariable(
  category: 'font-size' | 'font-weight' | 'line-height' | 'letter-spacing',
  scale: string
): string {
  return `var(--${category}-${scale})`;
}

/**
 * Check if a color token is a foreground color
 * Useful for determining text colors vs background colors
 * 
 * @param tokenName - The semantic name of the color token
 * @returns True if the token is a foreground color
 * 
 * @example
 * ```typescript
 * isForegroundColor('primaryForeground'); // Returns: true
 * isForegroundColor('primary'); // Returns: false
 * ```
 */
export function isForegroundColor(tokenName: ColorTokenName): boolean {
  return tokenName.toLowerCase().includes('foreground');
}

/**
 * Get the corresponding foreground color for a background color token
 * 
 * @param tokenName - The semantic name of the background color token
 * @returns The corresponding foreground color token name, or null if not applicable
 * 
 * @example
 * ```typescript
 * getForegroundToken('primary'); // Returns: 'primaryForeground'
 * getForegroundToken('background'); // Returns: 'foreground'
 * ```
 */
export function getForegroundToken(tokenName: ColorTokenName): ColorTokenName | null {
  const foregroundMap: Partial<Record<ColorTokenName, ColorTokenName>> = {
    background: 'foreground',
    card: 'cardForeground',
    popover: 'popoverForeground',
    primary: 'primaryForeground',
    secondary: 'secondaryForeground',
    muted: 'mutedForeground',
    accent: 'accentForeground',
    destructive: 'destructiveForeground',
    sidebar: 'sidebarForeground',
    sidebarPrimary: 'sidebarPrimaryForeground',
    sidebarAccent: 'sidebarAccentForeground',
  };
  
  return foregroundMap[tokenName] || null;
}
