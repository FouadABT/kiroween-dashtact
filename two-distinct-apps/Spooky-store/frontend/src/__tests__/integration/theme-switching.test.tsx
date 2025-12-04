/**
 * Integration Tests: Theme Switching Functionality
 * Tests Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Settings } from '@/types/settings';

// Test component to access theme context
function ThemeTestComponent() {
  const { themeMode, resolvedTheme, setThemeMode, isLoading } = useTheme();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div data-testid="theme-mode">{themeMode}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={() => setThemeMode('light')}>Light</button>
      <button onClick={() => setThemeMode('dark')}>Dark</button>
      <button onClick={() => setThemeMode('system')}>System</button>
    </div>
  );
}

// Mock settings data
const mockSettings: Settings = {
  id: 'test-settings-1',
  userId: null,
  scope: 'global',
  themeMode: 'light',
  activeTheme: 'default',
  lightPalette: {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.145 0 0)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.145 0 0)',
    primary: 'oklch(0.205 0 0)',
    primaryForeground: 'oklch(0.985 0 0)',
    secondary: 'oklch(0.97 0 0)',
    secondaryForeground: 'oklch(0.205 0 0)',
    muted: 'oklch(0.97 0 0)',
    mutedForeground: 'oklch(0.5 0 0)',
    accent: 'oklch(0.97 0 0)',
    accentForeground: 'oklch(0.205 0 0)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.985 0 0)',
    border: 'oklch(0.922 0 0)',
    input: 'oklch(0.922 0 0)',
    ring: 'oklch(0.205 0 0)',
    chart1: 'oklch(0.65 0.2 250)',
    chart2: 'oklch(0.7 0.18 150)',
    chart3: 'oklch(0.6 0.22 50)',
    chart4: 'oklch(0.75 0.15 350)',
    chart5: 'oklch(0.55 0.25 200)',
    sidebar: 'oklch(1 0 0)',
    sidebarForeground: 'oklch(0.145 0 0)',
    sidebarPrimary: 'oklch(0.205 0 0)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.97 0 0)',
    sidebarAccentForeground: 'oklch(0.205 0 0)',
    sidebarBorder: 'oklch(0.922 0 0)',
    sidebarRing: 'oklch(0.205 0 0)',
    radius: '0.5rem',
  },
  darkPalette: {
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.145 0 0)',
    cardForeground: 'oklch(0.985 0 0)',
    popover: 'oklch(0.145 0 0)',
    popoverForeground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.922 0 0)',
    primaryForeground: 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    secondaryForeground: 'oklch(0.922 0 0)',
    muted: 'oklch(0.269 0 0)',
    mutedForeground: 'oklch(0.7 0 0)',
    accent: 'oklch(0.269 0 0)',
    accentForeground: 'oklch(0.922 0 0)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.985 0 0)',
    border: 'oklch(0.269 0 0)',
    input: 'oklch(0.269 0 0)',
    ring: 'oklch(0.922 0 0)',
    chart1: 'oklch(0.65 0.2 250)',
    chart2: 'oklch(0.7 0.18 150)',
    chart3: 'oklch(0.6 0.22 50)',
    chart4: 'oklch(0.75 0.15 350)',
    chart5: 'oklch(0.55 0.25 200)',
    sidebar: 'oklch(0.145 0 0)',
    sidebarForeground: 'oklch(0.985 0 0)',
    sidebarPrimary: 'oklch(0.922 0 0)',
    sidebarPrimaryForeground: 'oklch(0.205 0 0)',
    sidebarAccent: 'oklch(0.269 0 0)',
    sidebarAccentForeground: 'oklch(0.922 0 0)',
    sidebarBorder: 'oklch(0.269 0 0)',
    sidebarRing: 'oklch(0.922 0 0)',
    radius: '0.5rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Theme Switching Functionality', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    
    // Reset document classes
    document.documentElement.className = '';
    
    // Mock fetch to return settings
    global.fetch = vi.fn((url) => {
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('should initialize with light mode by default', async () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('should switch to dark mode when dark button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const darkButton = screen.getByText('Dark');
    await user.click(darkButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('should switch to light mode when light button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const lightButton = screen.getByText('Light');
    await user.click(lightButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
  });

  it('should detect system theme when system mode is selected', async () => {
    const user = userEvent.setup();
    
    // Mock system preference as dark
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const systemButton = screen.getByText('System');
    await user.click(systemButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });
  });

  it('should persist theme mode to localStorage', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const darkButton = screen.getByText('Dark');
    await user.click(darkButton);

    await waitFor(() => {
      expect(localStorage.getItem('theme-mode')).toBe('dark');
    });
  });

  it('should load theme mode from localStorage on mount', async () => {
    localStorage.setItem('theme-mode', 'dark');
    
    // Mock settings with dark mode
    const darkModeSettings = { ...mockSettings, themeMode: 'dark' as const };
    global.fetch = vi.fn((url) => {
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(darkModeSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    // Initially should use localStorage value
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // After settings load, should still be dark
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should update CSS variables when theme changes', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Switch to dark mode
    const darkButton = screen.getByText('Dark');
    await user.click(darkButton);

    await waitFor(() => {
      const root = document.documentElement;
      const bgColor = root.style.getPropertyValue('--background');
      // Dark mode background should be set
      expect(bgColor).toBeTruthy();
    });
  });
});
