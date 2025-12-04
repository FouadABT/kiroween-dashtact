/**
 * Theme Context Type Definitions
 * Defines the shape of the ThemeProvider context and its props
 */

import { ColorPalette, TypographyConfig, ThemeMode, Settings } from './settings';

/**
 * Theme context value interface
 * Provides theme state and methods for managing theme configuration
 */
export interface ThemeContextValue {
  // Current state
  /** Current theme mode setting (light, dark, or system) */
  themeMode: ThemeMode;
  
  /** Resolved theme after system preference detection (light or dark only) */
  resolvedTheme: 'light' | 'dark';
  
  /** Current settings object from the database */
  settings: Settings | null;
  
  /** Loading state for async operations */
  isLoading: boolean;

  // Actions
  /** Set the theme mode (light, dark, or system) */
  setThemeMode: (mode: ThemeMode) => void;
  
  /** Update color palette for a specific theme mode */
  updateColorPalette: (palette: Partial<ColorPalette>, mode: 'light' | 'dark') => Promise<void>;
  
  /** Update typography configuration */
  updateTypography: (typography: Partial<TypographyConfig>) => Promise<void>;
  
  /** Reset all settings to default values */
  resetToDefaults: () => Promise<void>;
  
  /** Refresh settings from the backend API */
  refreshSettings: () => Promise<void>;
}

/**
 * Theme provider component props
 */
export interface ThemeProviderProps {
  /** Child components to be wrapped by the provider */
  children: React.ReactNode;
  
  /** Default theme mode to use on initial load */
  defaultTheme?: ThemeMode;
  
  /** LocalStorage key for persisting theme preference */
  storageKey?: string;
  
  /** Optional user ID for loading user-specific settings */
  userId?: string;
}
