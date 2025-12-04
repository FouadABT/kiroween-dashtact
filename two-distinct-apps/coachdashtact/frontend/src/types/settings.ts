/**
 * Settings Type Definitions
 * Auto-generated and enhanced for the Design System Theming feature
 */

/**
 * Color palette interface defining all semantic color tokens
 * All colors are in OKLCH format for perceptual uniformity
 */
export interface ColorPalette {
  // Base colors
  /** Main background color */
  background: string;
  /** Main foreground/text color */
  foreground: string;

  // Component colors
  /** Card background color */
  card: string;
  /** Card foreground/text color */
  cardForeground: string;
  /** Popover background color */
  popover: string;
  /** Popover foreground/text color */
  popoverForeground: string;

  // Semantic colors
  /** Primary brand color */
  primary: string;
  /** Primary foreground/text color */
  primaryForeground: string;
  /** Secondary color for less prominent elements */
  secondary: string;
  /** Secondary foreground/text color */
  secondaryForeground: string;
  /** Muted/subdued color for backgrounds */
  muted: string;
  /** Muted foreground/text color */
  mutedForeground: string;
  /** Accent color for highlights and emphasis */
  accent: string;
  /** Accent foreground/text color */
  accentForeground: string;
  /** Destructive/error color */
  destructive: string;
  /** Destructive foreground/text color */
  destructiveForeground: string;

  // UI elements
  /** Border color for components */
  border: string;
  /** Input field border color */
  input: string;
  /** Focus ring color */
  ring: string;

  // Chart colors for data visualization
  /** Chart color 1 */
  chart1: string;
  /** Chart color 2 */
  chart2: string;
  /** Chart color 3 */
  chart3: string;
  /** Chart color 4 */
  chart4: string;
  /** Chart color 5 */
  chart5: string;

  // Sidebar colors
  /** Sidebar background color */
  sidebar: string;
  /** Sidebar foreground/text color */
  sidebarForeground: string;
  /** Sidebar primary color */
  sidebarPrimary: string;
  /** Sidebar primary foreground color */
  sidebarPrimaryForeground: string;
  /** Sidebar accent color */
  sidebarAccent: string;
  /** Sidebar accent foreground color */
  sidebarAccentForeground: string;
  /** Sidebar border color */
  sidebarBorder: string;
  /** Sidebar focus ring color */
  sidebarRing: string;

  // Border radius
  /** Border radius value for components */
  radius: string;
}

/**
 * Typography configuration interface defining font families, sizes, weights, and spacing
 */
export interface TypographyConfig {
  /** Font family definitions for different text types */
  fontFamily: {
    /** Sans-serif font stack */
    sans: string[];
    /** Serif font stack */
    serif: string[];
    /** Monospace font stack */
    mono: string[];
  };

  /** Type scale defining font sizes in rem units */
  fontSize: {
    /** Extra small: 12px */
    xs: string;
    /** Small: 14px */
    sm: string;
    /** Base: 16px */
    base: string;
    /** Large: 18px */
    lg: string;
    /** Extra large: 20px */
    xl: string;
    /** 2x extra large: 24px */
    '2xl': string;
    /** 3x extra large: 30px */
    '3xl': string;
    /** 4x extra large: 36px */
    '4xl': string;
    /** 5x extra large: 48px */
    '5xl': string;
    /** 6x extra large: 60px */
    '6xl': string;
  };

  /** Font weight scale */
  fontWeight: {
    /** Light: 300 */
    light: number;
    /** Normal: 400 */
    normal: number;
    /** Medium: 500 */
    medium: number;
    /** Semibold: 600 */
    semibold: number;
    /** Bold: 700 */
    bold: number;
    /** Extra bold: 800 */
    extrabold: number;
  };

  /** Line height values for different text densities */
  lineHeight: {
    /** Tight: 1.25 */
    tight: number;
    /** Normal: 1.5 */
    normal: number;
    /** Relaxed: 1.75 */
    relaxed: number;
    /** Loose: 2 */
    loose: number;
  };

  /** Letter spacing values for different text styles */
  letterSpacing: {
    /** Tighter: -0.05em */
    tighter: string;
    /** Tight: -0.025em */
    tight: string;
    /** Normal: 0 */
    normal: string;
    /** Wide: 0.025em */
    wide: string;
    /** Wider: 0.05em */
    wider: string;
  };
}

/**
 * Theme mode type union
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Settings scope type union
 */
export type SettingsScope = 'global' | 'user';

/**
 * Complete settings entity as stored in the database
 */
export interface Settings {
  /** Unique identifier */
  id: string;
  /** Optional user ID for user-specific settings */
  userId?: string | null;
  /** Settings scope: global or user */
  scope: SettingsScope;
  /** Theme mode preference */
  themeMode: ThemeMode;
  /** Active theme identifier */
  activeTheme: string;
  /** Light mode color palette */
  lightPalette: ColorPalette;
  /** Dark mode color palette */
  darkPalette: ColorPalette;
  /** Typography configuration */
  typography: TypographyConfig;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * DTO for creating new settings
 */
export interface CreateSettingsDto {
  /** Optional user ID for user-specific settings */
  userId?: string;
  /** Settings scope: global or user */
  scope: SettingsScope;
  /** Theme mode preference */
  themeMode: ThemeMode;
  /** Active theme identifier */
  activeTheme: string;
  /** Light mode color palette */
  lightPalette: ColorPalette;
  /** Dark mode color palette */
  darkPalette: ColorPalette;
  /** Typography configuration */
  typography: TypographyConfig;
}

/**
 * DTO for updating existing settings (all fields optional)
 */
export interface UpdateSettingsDto {
  /** Theme mode preference */
  themeMode?: ThemeMode;
  /** Active theme identifier */
  activeTheme?: string;
  /** Partial light mode color palette updates */
  lightPalette?: Partial<ColorPalette>;
  /** Partial dark mode color palette updates */
  darkPalette?: Partial<ColorPalette>;
  /** Partial typography configuration updates */
  typography?: Partial<TypographyConfig>;
}
