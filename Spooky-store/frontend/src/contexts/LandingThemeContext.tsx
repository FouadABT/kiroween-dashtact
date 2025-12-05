'use client';

/**
 * Landing Theme Context
 * Manages theme state specifically for landing pages with light/dark/auto modes
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LandingThemeMode = 'light' | 'dark' | 'auto' | 'toggle';
export type ResolvedTheme = 'light' | 'dark';

interface LandingThemeColors {
  light: {
    primary: string;
    secondary: string;
    accent: string;
  };
  dark: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface LandingThemeContextValue {
  themeMode: LandingThemeMode;
  resolvedTheme: ResolvedTheme;
  colors: LandingThemeColors;
  setThemeMode: (mode: LandingThemeMode) => void;
  toggleTheme: () => void;
  updateColors: (colors: Partial<LandingThemeColors>) => void;
}

const LandingThemeContext = createContext<LandingThemeContextValue | undefined>(undefined);

interface LandingThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: LandingThemeMode;
  defaultColors?: LandingThemeColors;
  storageKey?: string;
  enableToggle?: boolean;
}

const DEFAULT_COLORS: LandingThemeColors = {
  light: {
    primary: 'hsl(222.2 47.4% 11.2%)',
    secondary: 'hsl(210 40% 96.1%)',
    accent: 'hsl(210 40% 96.1%)',
  },
  dark: {
    primary: 'hsl(210 40% 98%)',
    secondary: 'hsl(217.2 32.6% 17.5%)',
    accent: 'hsl(217.2 32.6% 17.5%)',
  },
};

/**
 * Detect system theme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme colors to CSS variables
 */
function applyThemeColors(theme: ResolvedTheme, colors: LandingThemeColors): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const themeColors = theme === 'light' ? colors.light : colors.dark;

  root.style.setProperty('--landing-primary', themeColors.primary);
  root.style.setProperty('--landing-secondary', themeColors.secondary);
  root.style.setProperty('--landing-accent', themeColors.accent);
}

/**
 * Landing Theme Provider
 * Provides theme context for landing pages with light/dark mode support
 */
export function LandingThemeProvider({
  children,
  defaultMode = 'auto',
  defaultColors = DEFAULT_COLORS,
  storageKey = 'landing-theme-mode',
  enableToggle = true,
}: LandingThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<LandingThemeMode>(defaultMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [colors, setColors] = useState<LandingThemeColors>(defaultColors);

  /**
   * Load theme mode from localStorage
   */
  const loadStoredThemeMode = useCallback((): LandingThemeMode => {
    if (typeof window === 'undefined') return defaultMode;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && ['light', 'dark', 'auto', 'toggle'].includes(stored)) {
        return stored as LandingThemeMode;
      }
    } catch (error) {
      console.error('Failed to load theme mode from localStorage:', error);
    }

    return defaultMode;
  }, [defaultMode, storageKey]);

  /**
   * Save theme mode to localStorage
   */
  const saveThemeMode = useCallback(
    (mode: LandingThemeMode) => {
      if (typeof window === 'undefined') return;

      try {
        localStorage.setItem(storageKey, mode);
      } catch (error) {
        console.error('Failed to save theme mode to localStorage:', error);
      }
    },
    [storageKey]
  );

  /**
   * Resolve theme based on mode and system preference
   */
  const resolveTheme = useCallback((mode: LandingThemeMode): ResolvedTheme => {
    if (mode === 'auto' || mode === 'toggle') {
      return getSystemTheme();
    }
    return mode;
  }, []);

  /**
   * Apply theme to document
   */
  const applyTheme = useCallback(
    (theme: ResolvedTheme) => {
      if (typeof window === 'undefined') return;

      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);

      applyThemeColors(theme, colors);
    },
    [colors]
  );

  /**
   * Set theme mode
   */
  const setThemeMode = useCallback(
    (mode: LandingThemeMode) => {
      setThemeModeState(mode);
      saveThemeMode(mode);

      const resolved = resolveTheme(mode);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    },
    [resolveTheme, applyTheme, saveThemeMode]
  );

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    if (!enableToggle) return;

    const newTheme: ResolvedTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setResolvedTheme(newTheme);
    applyTheme(newTheme);

    // If mode is 'toggle', update the stored preference
    if (themeMode === 'toggle') {
      saveThemeMode(newTheme);
    }
  }, [resolvedTheme, themeMode, applyTheme, saveThemeMode, enableToggle]);

  /**
   * Update theme colors
   */
  const updateColors = useCallback(
    (newColors: Partial<LandingThemeColors>) => {
      const updatedColors = {
        light: { ...colors.light, ...newColors.light },
        dark: { ...colors.dark, ...newColors.dark },
      };

      setColors(updatedColors);
      applyThemeColors(resolvedTheme, updatedColors);
    },
    [colors, resolvedTheme]
  );

  /**
   * Initialize theme on mount
   */
  useEffect(() => {
    const storedMode = loadStoredThemeMode();
    setThemeModeState(storedMode);

    const resolved = resolveTheme(storedMode);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [loadStoredThemeMode, resolveTheme, applyTheme]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (themeMode === 'auto' || themeMode === 'toggle') {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, applyTheme]);

  const value: LandingThemeContextValue = {
    themeMode,
    resolvedTheme,
    colors,
    setThemeMode,
    toggleTheme,
    updateColors,
  };

  return (
    <LandingThemeContext.Provider value={value}>
      {children}
    </LandingThemeContext.Provider>
  );
}

/**
 * useLandingTheme hook
 * Access landing theme context in components
 */
export function useLandingTheme(): LandingThemeContextValue {
  const context = useContext(LandingThemeContext);

  if (context === undefined) {
    throw new Error('useLandingTheme must be used within a LandingThemeProvider');
  }

  return context;
}
