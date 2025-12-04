/**
 * Typography Configuration Interface
 * Defines the complete structure for typography settings in the design system
 */

/**
 * Font family configuration
 * Each category should include a fallback stack
 */
export interface FontFamily {
  /**
   * Sans-serif font stack
   * Used for UI elements, body text, headings
   * Example: ['Inter', 'system-ui', 'sans-serif']
   */
  sans: string[];

  /**
   * Serif font stack
   * Used for editorial content, formal text
   * Example: ['Georgia', 'Cambria', 'Times New Roman', 'serif']
   */
  serif: string[];

  /**
   * Monospace font stack
   * Used for code, technical content
   * Example: ['Consolas', 'Monaco', 'Courier New', 'monospace']
   */
  mono: string[];
}

/**
 * Type scale configuration
 * All sizes in rem units for accessibility (scalable with browser settings)
 * Base size should be 1rem (16px by default)
 */
export interface FontSize {
  /** Extra small: 0.75rem (12px) - Use sparingly, may not meet accessibility standards */
  xs: string;

  /** Small: 0.875rem (14px) - Minimum recommended for body text */
  sm: string;

  /** Base: 1rem (16px) - Standard body text size */
  base: string;

  /** Large: 1.125rem (18px) - Emphasized body text */
  lg: string;

  /** Extra large: 1.25rem (20px) - Small headings */
  xl: string;

  /** 2x extra large: 1.5rem (24px) - Medium headings */
  '2xl': string;

  /** 3x extra large: 1.875rem (30px) - Large headings */
  '3xl': string;

  /** 4x extra large: 2.25rem (36px) - Extra large headings */
  '4xl': string;

  /** 5x extra large: 3rem (48px) - Hero text */
  '5xl': string;

  /** 6x extra large: 3.75rem (60px) - Display text */
  '6xl': string;
}

/**
 * Font weight scale
 * Standard numeric values from 100-900
 */
export interface FontWeight {
  /** Light: 300 - Use for large text only */
  light: number;

  /** Normal: 400 - Standard body text weight */
  normal: number;

  /** Medium: 500 - Slightly emphasized text */
  medium: number;

  /** Semibold: 600 - Headings, important text */
  semibold: number;

  /** Bold: 700 - Strong emphasis, headings */
  bold: number;

  /** Extra bold: 800 - Maximum emphasis, display text */
  extrabold: number;
}

/**
 * Line height configuration
 * Unitless values that multiply the font size
 */
export interface LineHeight {
  /**
   * Tight: 1.25
   * Use for headings, display text
   * Provides compact vertical spacing
   */
  tight: number;

  /**
   * Normal: 1.5
   * Standard for body text
   * Meets WCAG readability guidelines
   */
  normal: number;

  /**
   * Relaxed: 1.75
   * Use for long-form content
   * Improves readability for extended reading
   */
  relaxed: number;

  /**
   * Loose: 2
   * Use for very large text or special layouts
   * Maximum spacing for emphasis
   */
  loose: number;
}

/**
 * Letter spacing configuration
 * Values in em units (relative to font size)
 */
export interface LetterSpacing {
  /**
   * Tighter: -0.05em
   * Use for large headings to improve visual density
   */
  tighter: string;

  /**
   * Tight: -0.025em
   * Subtle tightening for headings
   */
  tight: string;

  /**
   * Normal: 0
   * Default spacing, no adjustment
   */
  normal: string;

  /**
   * Wide: 0.025em
   * Slight increase for readability
   */
  wide: string;

  /**
   * Wider: 0.05em
   * Use for uppercase text, small caps
   */
  wider: string;
}

/**
 * Complete typography configuration
 * Combines all typography settings into a single interface
 */
export interface TypographyConfig {
  /** Font family definitions for different text types */
  fontFamily: FontFamily;

  /** Type scale defining font sizes in rem units */
  fontSize: FontSize;

  /** Font weight scale from light to extrabold */
  fontWeight: FontWeight;

  /** Line height values for different text densities */
  lineHeight: LineHeight;

  /** Letter spacing values for different text styles */
  letterSpacing: LetterSpacing;
}

/**
 * Validate that a font size meets minimum accessibility standards
 * @param fontSize Font size string (e.g., '1rem', '16px')
 * @returns true if size meets minimum standards (>= 12px or 0.75rem)
 */
export function isAccessibleFontSize(fontSize: string): boolean {
  // Convert to pixels for comparison
  const pxMatch = fontSize.match(/^(\d+(?:\.\d+)?)px$/);
  if (pxMatch) {
    return parseFloat(pxMatch[1]) >= 12;
  }

  const remMatch = fontSize.match(/^(\d+(?:\.\d+)?)rem$/);
  if (remMatch) {
    // Assuming 1rem = 16px
    return parseFloat(remMatch[1]) * 16 >= 12;
  }

  // If we can't parse it, assume it's valid
  return true;
}

/**
 * Validate that line height is within reasonable bounds
 * @param lineHeight Line height value (unitless number)
 * @returns true if line height is between 1.0 and 3.0
 */
export function isValidLineHeight(lineHeight: number): boolean {
  return lineHeight >= 1.0 && lineHeight <= 3.0;
}
