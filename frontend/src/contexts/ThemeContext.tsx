'use client';

/**
 * Theme Context and Provider
 * Manages theme state, settings, and CSS variable application
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ThemeContextValue, ThemeProviderProps } from '@/types/theme-context';
import { Settings, ThemeMode, ColorPalette, TypographyConfig } from '@/types/settings';
import { SettingsApi } from '@/lib/api';
import { useScreenReaderAnnouncement } from '@/hooks/useScreenReaderAnnouncement';
import { CacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// Create the context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Default storage key
const DEFAULT_STORAGE_KEY = 'theme-mode';

/**
 * Utility function to convert ColorPalette to CSS variables
 */
function colorPaletteToCSSVariables(palette: ColorPalette): Record<string, string> {
  return {
    '--background': palette.background,
    '--foreground': palette.foreground,
    '--card': palette.card,
    '--card-foreground': palette.cardForeground,
    '--popover': palette.popover,
    '--popover-foreground': palette.popoverForeground,
    '--primary': palette.primary,
    '--primary-foreground': palette.primaryForeground,
    '--secondary': palette.secondary,
    '--secondary-foreground': palette.secondaryForeground,
    '--muted': palette.muted,
    '--muted-foreground': palette.mutedForeground,
    '--accent': palette.accent,
    '--accent-foreground': palette.accentForeground,
    '--destructive': palette.destructive,
    '--destructive-foreground': palette.destructiveForeground,
    '--border': palette.border,
    '--input': palette.input,
    '--ring': palette.ring,
    '--chart-1': palette.chart1,
    '--chart-2': palette.chart2,
    '--chart-3': palette.chart3,
    '--chart-4': palette.chart4,
    '--chart-5': palette.chart5,
    '--sidebar-background': palette.sidebar,
    '--sidebar-foreground': palette.sidebarForeground,
    '--sidebar-primary': palette.sidebarPrimary,
    '--sidebar-primary-foreground': palette.sidebarPrimaryForeground,
    '--sidebar-accent': palette.sidebarAccent,
    '--sidebar-accent-foreground': palette.sidebarAccentForeground,
    '--sidebar-border': palette.sidebarBorder,
    '--sidebar-ring': palette.sidebarRing,
    '--radius': palette.radius,
  };
}

/**
 * Utility function to convert TypographyConfig to CSS variables
 */
function typographyToCSSVariables(typography: TypographyConfig): Record<string, string> {
  return {
    '--font-sans': typography.fontFamily.sans.join(', '),
    '--font-serif': typography.fontFamily.serif.join(', '),
    '--font-mono': typography.fontFamily.mono.join(', '),
    '--font-size-xs': typography.fontSize.xs,
    '--font-size-sm': typography.fontSize.sm,
    '--font-size-base': typography.fontSize.base,
    '--font-size-lg': typography.fontSize.lg,
    '--font-size-xl': typography.fontSize.xl,
    '--font-size-2xl': typography.fontSize['2xl'],
    '--font-size-3xl': typography.fontSize['3xl'],
    '--font-size-4xl': typography.fontSize['4xl'],
    '--font-size-5xl': typography.fontSize['5xl'],
    '--font-size-6xl': typography.fontSize['6xl'],
    '--font-weight-light': typography.fontWeight.light.toString(),
    '--font-weight-normal': typography.fontWeight.normal.toString(),
    '--font-weight-medium': typography.fontWeight.medium.toString(),
    '--font-weight-semibold': typography.fontWeight.semibold.toString(),
    '--font-weight-bold': typography.fontWeight.bold.toString(),
    '--font-weight-extrabold': typography.fontWeight.extrabold.toString(),
    '--line-height-tight': typography.lineHeight.tight.toString(),
    '--line-height-normal': typography.lineHeight.normal.toString(),
    '--line-height-relaxed': typography.lineHeight.relaxed.toString(),
    '--line-height-loose': typography.lineHeight.loose.toString(),
    '--letter-spacing-tighter': typography.letterSpacing.tighter,
    '--letter-spacing-tight': typography.letterSpacing.tight,
    '--letter-spacing-normal': typography.letterSpacing.normal,
    '--letter-spacing-wide': typography.letterSpacing.wide,
    '--letter-spacing-wider': typography.letterSpacing.wider,
  };
}

/**
 * Pending CSS variable updates queue
 * Used to batch multiple updates into a single DOM operation
 */
let pendingCSSUpdates: Record<string, string> = {};
let updateScheduled = false;

/**
 * Apply CSS variables to document root
 * Batches updates for performance using requestAnimationFrame
 * Multiple calls within the same frame are merged into a single update
 */
function applyCSSVariables(variables: Record<string, string>): void {
  if (typeof window === 'undefined') return;

  // Merge new variables into pending updates
  pendingCSSUpdates = { ...pendingCSSUpdates, ...variables };

  // Schedule update if not already scheduled
  if (!updateScheduled) {
    updateScheduled = true;

    requestAnimationFrame(() => {
      const root = document.documentElement;
      
      // Apply all pending updates in a single batch
      // This minimizes reflows and repaints
      Object.entries(pendingCSSUpdates).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Clear pending updates and reset flag
      pendingCSSUpdates = {};
      updateScheduled = false;
    });
  }
}

/**
 * Apply CSS variables immediately without batching
 * Use this for critical updates that need to be applied synchronously
 * Currently unused but kept for future use cases
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function applyCSSVariablesImmediate(variables: Record<string, string>): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Detect system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * ThemeProvider Component
 * Provides theme context to the entire application
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = DEFAULT_STORAGE_KEY,
  userId,
}: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Screen reader announcements
  const { announce } = useScreenReaderAnnouncement();

  /**
   * Load theme mode from localStorage
   */
  const loadStoredThemeMode = useCallback((): ThemeMode => {
    if (typeof window === 'undefined') return defaultTheme;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        return stored as ThemeMode;
      }
    } catch (error) {
      console.error('Failed to load theme mode from localStorage:', error);
    }
    
    return defaultTheme;
  }, [defaultTheme, storageKey]);

  /**
   * Save theme mode to localStorage
   */
  const saveThemeMode = useCallback((mode: ThemeMode) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(storageKey, mode);
    } catch (error) {
      console.error('Failed to save theme mode to localStorage:', error);
    }
  }, [storageKey]);

  /**
   * Resolve theme based on mode and system preference
   */
  const resolveTheme = useCallback((mode: ThemeMode): 'light' | 'dark' => {
    if (mode === 'system') {
      return getSystemTheme();
    }
    return mode;
  }, []);

  /**
   * Apply theme to document
   * Optimized to batch all CSS variable updates together
   */
  const applyTheme = useCallback((theme: 'light' | 'dark', currentSettings: Settings | null) => {
    if (typeof window === 'undefined') return;

    console.log('[ThemeContext] 🎨 applyTheme called:', { theme, hasSettings: !!currentSettings });

    // Update document class
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Apply CSS variables if settings are available
    if (currentSettings) {
      const palette = theme === 'light' ? currentSettings.lightPalette : currentSettings.darkPalette;
      
      console.log('[ThemeContext] 🎨 Applying palette:', {
        theme,
        border: palette.border,
        input: palette.input,
        sidebarBorder: palette.sidebarBorder
      });
      
      const colorVars = colorPaletteToCSSVariables(palette);
      const typographyVars = typographyToCSSVariables(currentSettings.typography);
      
      console.log('[ThemeContext] 🎨 CSS Variables:', {
        '--border': colorVars['--border'],
        '--input': colorVars['--input'],
        '--sidebar-border': colorVars['--sidebar-border']
      });
      
      // Batch color and typography updates together
      // This ensures a single reflow/repaint instead of two
      applyCSSVariables({ ...colorVars, ...typographyVars });
      
      console.log('[ThemeContext] ✅ Theme applied successfully');
    } else {
      console.log('[ThemeContext] ⚠️ No settings available, using CSS fallback values');
    }
  }, []);

  /**
   * Fetch settings from backend
   */
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      console.log('[ThemeContext] fetchSettings called, userId:', userId);
      
      // Try to load from cache first
      const cacheKey = userId ? CACHE_KEYS.USER_SETTINGS(userId) : CACHE_KEYS.GLOBAL_SETTINGS;
      const cachedSettings = CacheManager.get<Settings>(cacheKey);
      
      console.log('[ThemeContext] Cache key:', cacheKey);
      console.log('[ThemeContext] Cached settings:', cachedSettings ? `found (themeMode: ${cachedSettings.themeMode})` : 'not found');
      
      if (cachedSettings) {
        // Use cached settings
        setSettings(cachedSettings);
        
        const mode = cachedSettings.themeMode;
        setThemeModeState(mode);
        saveThemeMode(mode);
        
        const resolved = resolveTheme(mode);
        setResolvedTheme(resolved);
        applyTheme(resolved, cachedSettings);
        
        console.log('[ThemeContext] Using cached settings, themeMode:', mode, 'resolved:', resolved);
        
        setIsLoading(false);
        return;
      }
      
      // Cache miss - fetch from backend
      let fetchedSettings: Settings;
      
      console.log('[ThemeContext] Cache miss, fetching from backend...');
      
      if (userId) {
        // Try to get user-specific settings
        try {
          console.log('[ThemeContext] Fetching user settings for userId:', userId);
          fetchedSettings = await SettingsApi.getByUserId(userId);
          console.log('[ThemeContext] User settings fetched, themeMode:', fetchedSettings.themeMode);
        } catch (error) {
          // Fall back to global settings if user settings don't exist
          console.warn('[ThemeContext] User settings not found, falling back to global settings', error);
          fetchedSettings = await SettingsApi.getGlobal();
          console.log('[ThemeContext] Global settings fetched, themeMode:', fetchedSettings.themeMode);
        }
      } else {
        // Get global settings (public endpoint, no auth required)
        console.log('[ThemeContext] No userId, fetching global settings');
        fetchedSettings = await SettingsApi.getGlobal();
        console.log('[ThemeContext] Global settings fetched, themeMode:', fetchedSettings.themeMode);
      }
      
      // Cache the fetched settings
      CacheManager.set(cacheKey, fetchedSettings, CACHE_TTL.ONE_HOUR);
      console.log('[ThemeContext] Settings cached with key:', cacheKey);
      
      setSettings(fetchedSettings);
      
      // Apply the theme from settings
      const mode = fetchedSettings.themeMode;
      setThemeModeState(mode);
      saveThemeMode(mode);
      
      const resolved = resolveTheme(mode);
      setResolvedTheme(resolved);
      applyTheme(resolved, fetchedSettings);
      
      console.log('[ThemeContext] Applied theme from fetched settings, themeMode:', mode, 'resolved:', resolved);
      
    } catch (err) {
      console.error('[ThemeContext] Failed to fetch settings:', err);
      // Continue with default theme even if settings fetch fails
      setIsLoading(false);
    }
  }, [userId, resolveTheme, applyTheme, saveThemeMode]);

  /**
   * Initialize theme on mount
   */
  useEffect(() => {
    console.log('[ThemeContext] Initializing theme, userId:', userId);
    
    // Load stored theme mode
    const storedMode = loadStoredThemeMode();
    setThemeModeState(storedMode);
    
    const resolved = resolveTheme(storedMode);
    setResolvedTheme(resolved);
    
    // Apply theme immediately (before settings load)
    applyTheme(resolved, null);
    
    // Fetch settings from backend
    fetchSettings();
  }, [loadStoredThemeMode, resolveTheme, applyTheme, fetchSettings, userId]);
  
  /**
   * Refetch settings when userId changes (user logs in/out)
   */
  useEffect(() => {
    if (userId) {
      console.log('[ThemeContext] userId changed to:', userId, '- refetching settings');
      fetchSettings();
    }
  }, [userId, fetchSettings]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeMode === 'system') {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved, settings);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, settings, applyTheme]);

  /**
   * Set theme mode
   */
  const setThemeMode = useCallback((mode: ThemeMode) => {
    console.log('[ThemeContext] setThemeMode called with:', mode);
    
    setThemeModeState(mode);
    saveThemeMode(mode);
    
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyTheme(resolved, settings);
    
    // Announce theme change to screen readers
    const themeLabel = mode === 'system' ? `system (${resolved})` : mode;
    announce(`Theme changed to ${themeLabel} mode`);
    
    // Update settings in backend if settings exist
    if (settings) {
      // Debounce the API call
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Capture the mode value in the closure to avoid stale closure issues
      const modeToSave = mode;
      const settingsIdToUpdate = settings.id;
      
      debounceTimerRef.current = setTimeout(async () => {
        try {
          console.log('[ThemeContext] Updating backend with mode:', modeToSave, 'settingsId:', settingsIdToUpdate);
          
          const updated = await SettingsApi.update(settingsIdToUpdate, { themeMode: modeToSave });
          
          console.log('[ThemeContext] Backend response:', updated);
          
          // Update settings state with the response
          // This is important because the backend might have created new user-specific settings
          setSettings(updated);
          
          // Invalidate old cache entries
          const globalCacheKey = CACHE_KEYS.GLOBAL_SETTINGS;
          const userCacheKey = userId ? CACHE_KEYS.USER_SETTINGS(userId) : null;
          CacheManager.remove(globalCacheKey);
          if (userCacheKey) {
            CacheManager.remove(userCacheKey);
          }
          
          // Cache the updated settings with the correct key
          // Use user cache if userId exists in the updated settings
          const cacheKey = updated.userId ? CACHE_KEYS.USER_SETTINGS(updated.userId) : CACHE_KEYS.GLOBAL_SETTINGS;
          CacheManager.set(cacheKey, updated, CACHE_TTL.ONE_HOUR);
        } catch (error) {
          console.error('Failed to update theme mode:', error);
        }
      }, 500);
    }
  }, [settings, resolveTheme, applyTheme, saveThemeMode, announce, userId]);

  /**
   * Update color palette
   */
  const updateColorPalette = useCallback(async (palette: Partial<ColorPalette>, mode: 'light' | 'dark') => {
    if (!settings) {
      throw new Error('Settings not loaded');
    }

    try {
      setIsLoading(true);
      
      const updateData = mode === 'light' 
        ? { lightPalette: palette }
        : { darkPalette: palette };
      
      const updated = await SettingsApi.update(settings.id, updateData);
      setSettings(updated);
      
      // Invalidate cache on save
      const cacheKey = userId ? CACHE_KEYS.USER_SETTINGS(userId) : CACHE_KEYS.GLOBAL_SETTINGS;
      CacheManager.remove(cacheKey);
      
      // Cache the updated settings
      CacheManager.set(cacheKey, updated, CACHE_TTL.ONE_HOUR);
      
      // Apply theme if the updated palette is for the current resolved theme
      if (resolvedTheme === mode) {
        applyTheme(resolvedTheme, updated);
      }
      
    } catch (error) {
      console.error('Failed to update color palette:', error);
      
      // Handle 409 conflict by refreshing settings
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 409) {
        // Invalidate cache on conflict
        const cacheKey = userId ? CACHE_KEYS.USER_SETTINGS(userId) : CACHE_KEYS.GLOBAL_SETTINGS;
        CacheManager.remove(cacheKey);
        await fetchSettings();
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [settings, resolvedTheme, applyTheme, fetchSettings, userId]);

  /**
   * Update typography
   */
  const updateTypography = useCallback(async (typography: Partial<TypographyConfig>) => {
    if (!settings) {
      throw new Error('Settings not loaded');
    }

    try {
      setIsLoading(true);
      
      const updated = await SettingsApi.update(settings.id, { typography });
      setSettings(updated);
      
      // Invalidate cache on save
      const cacheKey = userId ? CACHE_KEYS.USER_SETTINGS(userId) : CACHE_KEYS.GLOBAL_SETTINGS;
      CacheManager.remove(cacheKey);
      
      // Cache the updated settings
      CacheManager.set(cacheKey, updated, CACHE_TTL.ONE_HOUR);
      
      // Apply typography changes
      const typographyVars = typographyToCSSVariables(updated.typography);
      applyCSSVariables(typographyVars);
      
    } catch (error) {
      console.error('Failed to update typography:', error);
      
      // Handle 409 conflict by refreshing settings
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 409) {
        // Invalidate cache on conflict
        const cacheKey = userId ? CACHE_KEYS.USER_SETTINGS(userId) : CACHE_KEYS.GLOBAL_SETTINGS;
        CacheManager.remove(cacheKey);
        await fetchSettings();
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [settings, fetchSettings, userId]);

  /**
   * Reset to defaults
   */
  const resetToDefaults = useCallback(async () => {
    if (!settings) {
      throw new Error('Settings not loaded');
    }

    try {
      setIsLoading(true);
      
      // Invalidate cache before reset
      const cacheKey = userId ? CACHE_KEYS.USER_SETTINGS(userId) : CACHE_KEYS.GLOBAL_SETTINGS;
      CacheManager.remove(cacheKey);
      
      // Delete current settings and fetch global defaults
      await SettingsApi.delete(settings.id);
      await fetchSettings();
      
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [settings, fetchSettings, userId]);

  /**
   * Refresh settings
   */
  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  const value: ThemeContextValue = {
    themeMode,
    resolvedTheme,
    settings,
    isLoading,
    setThemeMode,
    updateColorPalette,
    updateTypography,
    resetToDefaults,
    refreshSettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme hook
 * Access theme context in components
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
