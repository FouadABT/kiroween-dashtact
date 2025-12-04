# Theme Context Usage Guide

Quick reference for using the new theme context types in your components.

## Import Types

```typescript
import { ThemeContextValue, ThemeProviderProps } from '@/types/theme-context';
// or
import { ThemeContextValue, ThemeProviderProps } from '@/types';
```

## ThemeContextValue Interface

The context value provides theme state and management methods:

```typescript
interface ThemeContextValue {
  // State
  themeMode: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  settings: Settings | null;
  isLoading: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  updateColorPalette: (palette: Partial<ColorPalette>, mode: 'light' | 'dark') => Promise<void>;
  updateTypography: (typography: Partial<TypographyConfig>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}
```

## ThemeProviderProps Interface

Props for the ThemeProvider component:

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
  userId?: string;
}
```

## Example Implementation

### 1. Create ThemeContext

```typescript
// frontend/src/contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeContextValue, ThemeProviderProps } from '@/types/theme-context';
import { SettingsApi } from '@/lib/api';
import { Settings, ColorPalette, TypographyConfig, ThemeMode } from '@/types/settings';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
  userId
}: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultTheme);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve system theme
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setThemeModeState(stored as ThemeMode);
    }

    // Load settings from API
    loadSettings();
  }, [userId]);

  useEffect(() => {
    // Resolve theme based on mode
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedTheme(themeMode);
    }
  }, [themeMode]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = userId
        ? await SettingsApi.getByUserId(userId)
        : await SettingsApi.getGlobal();
      setSettings(data);
      setThemeModeState(data.themeMode);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(storageKey, mode);
    if (settings) {
      SettingsApi.update(settings.id, { themeMode: mode });
    }
  };

  const updateColorPalette = async (
    palette: Partial<ColorPalette>,
    mode: 'light' | 'dark'
  ) => {
    if (!settings) return;
    
    const key = mode === 'light' ? 'lightPalette' : 'darkPalette';
    await SettingsApi.update(settings.id, {
      [key]: palette
    });
    await loadSettings();
  };

  const updateTypography = async (typography: Partial<TypographyConfig>) => {
    if (!settings) return;
    
    await SettingsApi.update(settings.id, { typography });
    await loadSettings();
  };

  const resetToDefaults = async () => {
    if (!settings) return;
    
    // Reset logic here
    await loadSettings();
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const value: ThemeContextValue = {
    themeMode,
    resolvedTheme,
    settings,
    isLoading,
    setThemeMode,
    updateColorPalette,
    updateTypography,
    resetToDefaults,
    refreshSettings
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### 2. Add to App Layout

```typescript
// frontend/src/app/layout.tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="dashboard-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3. Use in Components

```typescript
// frontend/src/components/ThemeToggle.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <div className="flex gap-2">
      <Button
        variant={themeMode === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setThemeMode('light')}
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={themeMode === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setThemeMode('dark')}
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={themeMode === 'system' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setThemeMode('system')}
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### 4. Update Colors

```typescript
// frontend/src/components/ColorPicker.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function ColorPicker() {
  const { updateColorPalette, resolvedTheme } = useTheme();

  const handleColorChange = async (color: string) => {
    await updateColorPalette(
      { primary: color },
      resolvedTheme
    );
  };

  return (
    <input
      type="color"
      onChange={(e) => handleColorChange(e.target.value)}
    />
  );
}
```

## API Integration

The theme context uses the existing SettingsApi:

```typescript
import { SettingsApi } from '@/lib/api';

// Get global settings
const settings = await SettingsApi.getGlobal();

// Get user-specific settings
const userSettings = await SettingsApi.getByUserId('user-id');

// Update theme mode
await SettingsApi.update(settings.id, {
  themeMode: 'dark'
});

// Update color palette
await SettingsApi.update(settings.id, {
  darkPalette: {
    primary: 'oklch(0.7 0.2 250)',
    background: 'oklch(0.2 0.02 250)'
  }
});

// Update typography
await SettingsApi.update(settings.id, {
  typography: {
    fontSize: {
      base: '1rem',
      lg: '1.125rem'
    }
  }
});
```

## Type Safety Benefits

With these types, you get:

✅ **Autocomplete** - IDE suggests available methods and properties  
✅ **Type Checking** - Catch errors at compile time  
✅ **Documentation** - Inline JSDoc comments explain each field  
✅ **Refactoring** - Safe renames and updates across codebase  
✅ **Consistency** - Ensures frontend matches backend API

## Related Types

These types work with existing Settings types:

- `Settings` - Complete settings entity
- `ColorPalette` - Color token definitions
- `TypographyConfig` - Font and spacing configuration
- `ThemeMode` - 'light' | 'dark' | 'system'
- `CreateSettingsDto` - For creating new settings
- `UpdateSettingsDto` - For updating settings

All types are exported from `@/types` or `@/types/settings`.
