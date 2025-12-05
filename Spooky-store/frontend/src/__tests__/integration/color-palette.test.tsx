/**
 * Integration Tests: Color Palette Customization
 * Tests Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Settings } from '@/types/settings';

// Test component to access theme context and test colors
function ColorTestComponent() {
  const { settings, isLoading, updateColorPalette, setThemeMode, resolvedTheme } = useTheme();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!settings) {
    return <div>No settings</div>;
  }
  
  const currentPalette = resolvedTheme === 'light' ? settings.lightPalette : settings.darkPalette;
  
  return (
    <div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <div data-testid="primary-color">{currentPalette.primary}</div>
      <div data-testid="secondary-color">{currentPalette.secondary}</div>
      <div data-testid="accent-color">{currentPalette.accent}</div>
      <div data-testid="destructive-color">{currentPalette.destructive}</div>
      <div data-testid="chart1-color">{currentPalette.chart1}</div>
      <div data-testid="sidebar-color">{currentPalette.sidebar}</div>
      
      <button onClick={() => setThemeMode('light')}>Light</button>
      <button onClick={() => setThemeMode('dark')}>Dark</button>
      
      <button 
        onClick={() => updateColorPalette({ 
          primary: 'oklch(0.6 0.25 250)',
          secondary: 'oklch(0.7 0.2 150)',
        }, 'light')}
      >
        Update Light Colors
      </button>
      
      <button 
        onClick={() => updateColorPalette({ 
          primary: 'oklch(0.8 0.15 250)',
          accent: 'oklch(0.75 0.18 150)',
        }, 'dark')}
      >
        Update Dark Colors
      </button>
      
      <button 
        onClick={() => updateColorPalette({ 
          chart1: 'oklch(0.65 0.25 30)',
          chart2: 'oklch(0.7 0.22 120)',
          chart3: 'oklch(0.6 0.28 210)',
        }, 'light')}
      >
        Update Chart Colors
      </button>
      
      <button 
        onClick={() => updateColorPalette({ 
          sidebar: 'oklch(0.95 0.05 250)',
          sidebarForeground: 'oklch(0.2 0 0)',
        }, 'light')}
      >
        Update Sidebar Colors
      </button>
      
      <div 
        data-testid="test-element" 
        style={{ 
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
        }}
      >
        Test Element
      </div>
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

describe('Color Palette Customization', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    
    // Mock fetch to return settings
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      const body = options?.body ? JSON.parse(options.body as string) : undefined;
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        const updatedSettings = { ...mockSettings };
        if (body.lightPalette) {
          updatedSettings.lightPalette = { ...updatedSettings.lightPalette, ...body.lightPalette };
        }
        if (body.darkPalette) {
          updatedSettings.darkPalette = { ...updatedSettings.darkPalette, ...body.darkPalette };
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(updatedSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });
  });

  it('should display semantic color tokens correctly', async () => {
    render(
      <ThemeProvider>
        <ColorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.205 0 0)');
    expect(screen.getByTestId('secondary-color')).toHaveTextContent('oklch(0.97 0 0)');
    expect(screen.getByTestId('accent-color')).toHaveTextContent('oklch(0.97 0 0)');
    expect(screen.getByTestId('destructive-color')).toHaveTextContent('oklch(0.577 0.245 27.325)');
  });

  it('should update light palette colors and reflect in UI', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ColorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Light Colors');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.6 0.25 250)');
      expect(screen.getByTestId('secondary-color')).toHaveTextContent('oklch(0.7 0.2 150)');
    });
  });

  it('should update dark palette colors independently from light palette', async () => {
    const user = userEvent.setup();
    
    // Mock settings with dark mode
    const darkModeSettings = { ...mockSettings, themeMode: 'dark' as const };
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      const body = options?.body ? JSON.parse(options.body as string) : undefined;
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(darkModeSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        const updatedSettings = { ...darkModeSettings };
        if (body.lightPalette) {
          updatedSettings.lightPalette = { ...updatedSettings.lightPalette, ...body.lightPalette };
        }
        if (body.darkPalette) {
          updatedSettings.darkPalette = { ...updatedSettings.darkPalette, ...body.darkPalette };
        }
        if (body.themeMode) {
          updatedSettings.themeMode = body.themeMode;
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(updatedSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <ColorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify initial dark mode colors
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.922 0 0)');

    const updateButton = screen.getByText('Update Dark Colors');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.8 0.15 250)');
      expect(screen.getByTestId('accent-color')).toHaveTextContent('oklch(0.75 0.18 150)');
    });

    // Switch to light mode and verify light colors are unchanged
    const lightButton = screen.getByText('Light');
    await user.click(lightButton);

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.205 0 0)');
    });
  });

  it('should update chart colors for data visualization', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ColorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('chart1-color')).toHaveTextContent('oklch(0.65 0.2 250)');

    const updateButton = screen.getByText('Update Chart Colors');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('chart1-color')).toHaveTextContent('oklch(0.65 0.25 30)');
    });
  });

  it('should update sidebar-specific color tokens', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ColorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('sidebar-color')).toHaveTextContent('oklch(1 0 0)');

    const updateButton = screen.getByText('Update Sidebar Colors');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-color')).toHaveTextContent('oklch(0.95 0.05 250)');
    });
  });

  it('should apply color changes to CSS variables', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ColorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Light Colors');
    await user.click(updateButton);

    await waitFor(() => {
      const root = document.documentElement;
      const primaryColor = root.style.getPropertyValue('--primary');
      expect(primaryColor).toBe('oklch(0.6 0.25 250)');
    });
  });

  it('should switch between light and dark palettes when theme mode changes', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ColorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify light mode colors
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.205 0 0)');

    // Switch to dark mode
    const darkButton = screen.getByText('Dark');
    await user.click(darkButton);

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.922 0 0)');
    });

    // Switch back to light mode
    const lightButton = screen.getByText('Light');
    await user.click(lightButton);

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.205 0 0)');
    });
  });

  it('should preserve other palette values when updating specific colors', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ColorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const originalAccent = screen.getByTestId('accent-color').textContent;
    const originalDestructive = screen.getByTestId('destructive-color').textContent;

    const updateButton = screen.getByText('Update Light Colors');
    await user.click(updateButton);

    await waitFor(() => {
      // Updated colors should change
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.6 0.25 250)');
      
      // Non-updated colors should remain the same
      expect(screen.getByTestId('accent-color')).toHaveTextContent(originalAccent!);
      expect(screen.getByTestId('destructive-color')).toHaveTextContent(originalDestructive!);
    });
  });
});
