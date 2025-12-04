/**
 * Color Palette Interface
 * Defines the complete structure for color palettes in the design system
 * All colors are in HSL format (shorthand)
 */

/**
 * Complete color palette interface with all semantic color tokens
 *
 * HSL Color Format (Shorthand):
 * - H (Hue): 0-360 degrees
 * - S (Saturation): 0-100%
 * - L (Lightness): 0-100%
 *
 * Example: "240 5.9% 10%" or "0 0% 100%"
 * This format is used by Tailwind CSS and shadcn/ui
 */
export interface ColorPalette {
  // ===== Base Colors =====
  /**
   * Main background color for the application
   * Light mode: typically high lightness (0.95-1.0)
   * Dark mode: typically low lightness (0.1-0.2)
   */
  background: string;

  /**
   * Main foreground/text color
   * Should have sufficient contrast with background (WCAG AA: 4.5:1 minimum)
   */
  foreground: string;

  // ===== Component Colors =====
  /** Card/panel background color */
  card: string;

  /** Text color for card content */
  cardForeground: string;

  /** Popover/dropdown background color */
  popover: string;

  /** Text color for popover content */
  popoverForeground: string;

  // ===== Semantic Colors =====
  /**
   * Primary brand color
   * Used for main CTAs, links, and brand elements
   */
  primary: string;

  /** Text color on primary background */
  primaryForeground: string;

  /**
   * Secondary color for less prominent elements
   * Used for secondary buttons and accents
   */
  secondary: string;

  /** Text color on secondary background */
  secondaryForeground: string;

  /**
   * Muted/subdued color for backgrounds
   * Used for disabled states, subtle backgrounds
   */
  muted: string;

  /** Text color on muted background */
  mutedForeground: string;

  /**
   * Accent color for highlights and emphasis
   * Used for hover states, active elements
   */
  accent: string;

  /** Text color on accent background */
  accentForeground: string;

  /**
   * Destructive/error color
   * Used for error messages, delete actions, warnings
   */
  destructive: string;

  /** Text color on destructive background */
  destructiveForeground: string;

  // ===== UI Elements =====
  /**
   * Border color for components
   * Used for dividers, component outlines
   */
  border: string;

  /**
   * Input field border color
   * May differ from general border for emphasis
   */
  input: string;

  /**
   * Focus ring color
   * Must be visible in both light and dark modes
   * Should meet WCAG focus indicator requirements
   */
  ring: string;

  // ===== Chart Colors =====
  /** Chart color 1 - for data visualization */
  chart1: string;

  /** Chart color 2 - for data visualization */
  chart2: string;

  /** Chart color 3 - for data visualization */
  chart3: string;

  /** Chart color 4 - for data visualization */
  chart4: string;

  /** Chart color 5 - for data visualization */
  chart5: string;

  // ===== Sidebar Colors =====
  /** Sidebar background color */
  sidebar: string;

  /** Sidebar text color */
  sidebarForeground: string;

  /** Sidebar primary/active color */
  sidebarPrimary: string;

  /** Text color on sidebar primary background */
  sidebarPrimaryForeground: string;

  /** Sidebar accent/hover color */
  sidebarAccent: string;

  /** Text color on sidebar accent background */
  sidebarAccentForeground: string;

  /** Sidebar border color */
  sidebarBorder: string;

  /** Sidebar focus ring color */
  sidebarRing: string;

  // ===== Layout =====
  /**
   * Border radius value for components
   * Example: '0.5rem', '8px', '0.375rem'
   */
  radius: string;
}

/**
 * Type guard to check if a string is a valid HSL color
 */
export function isValidHSLColor(color: string): boolean {
  const hslRegex = /^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/;
  return hslRegex.test(color);
}

/**
 * Parse HSL color string into components
 * Returns null if invalid format
 */
export function parseHSLColor(color: string): {
  hue: number;
  saturation: number;
  lightness: number;
} | null {
  if (!isValidHSLColor(color)) {
    return null;
  }

  // Extract values from "H S% L%"
  const match = color.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) return null;

  return {
    hue: parseFloat(match[1]),
    saturation: parseFloat(match[2]),
    lightness: parseFloat(match[3]),
  };
}
