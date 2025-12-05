/**
 * Integration Tests: Settings Save and Load
 * Tests Requirements: 2.1, 2.2, 2.3, 2.4, 7.8, 7.9, 7.10
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Settings, ColorPalette, TypographyConfig } from '@/types/settings';

// Test component to access theme context
function SettingsTestComponent() {
  const { settings, isLoading, updateColorPalette, updateTypography, resetToDefaults } = useTheme();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!settings) {
    return <div>No settings</div>;
  }
  
  return (
    <div>
      <div data-testid="settings-id">{settings.id}</div>
      <div data-testid="settings-scope">{settings.scope}</div>
      <div data-testid="primary-color">{settings.lightPalette.primary}</div>
      <div data-testid="font-family">{settings.typography.fontFamily.sans[0]}</div>
      <button 
        onClick={() => updateColorPalette({ primary: 'oklch(0.5 0.2 250)' }, 'light')}
      >
        Update Color
      </button>
      <button 
        onClick={() => updateTypography({ 
          fontFamily: { 
            sans: ['Roboto', 'sans-serif'],
            serif: ['Georgia', 'serif'],
            mono: ['Consolas', 'monospace']
          },
          fontSize: settings.typography.fontSize,
          fontWeight: settings.typography.fontWeight,
          lineHeight: settings.typography.lineHeight,
          letterSpacing: settings.typography.letterSpacing,
        })}
      >
        Update Typography
      </button>
      <button onClick={() => resetToDefaults()}>Reset</button>
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

describe('Settings Save and Load', () => {
  let fetchCalls: Array<{ url: string; method: string; body?: unknown }> = [];

  beforeEach(() => {
    fetchCalls = [];
    localStorage.clear();
    
    // Mock fetch to track calls
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      const body = options?.body ? JSON.parse(options.body as string) : undefined;
      
      fetchCalls.push({ url: url.toString(), method, body });
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        // Return updated settings
        const updatedSettings = { ...mockSettings, ...body };
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(updatedSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });
  });

  it('should load settings from backend on mount', async () => {
    render(
      <ThemeProvider>
        <SettingsTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('settings-id')).toHaveTextContent('test-settings-1');
    expect(screen.getByTestId('settings-scope')).toHaveTextContent('global');
    expect(fetchCalls.some(call => call.url.includes('/settings/global'))).toBe(true);
  });

  it('should save color palette changes to backend', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <SettingsTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Color');
    await user.click(updateButton);

    await waitFor(() => {
      const patchCall = fetchCalls.find(call => call.method === 'PATCH');
      expect(patchCall).toBeDefined();
      expect(patchCall?.body).toHaveProperty('lightPalette');
    });
  });

  it('should save typography changes to backend', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <SettingsTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Typography');
    await user.click(updateButton);

    await waitFor(() => {
      const patchCall = fetchCalls.find(call => call.method === 'PATCH');
      expect(patchCall).toBeDefined();
      expect(patchCall?.body).toHaveProperty('typography');
    });
  });

  it('should reset settings to defaults', async () => {
    const user = userEvent.setup();
    
    // Mock delete and subsequent fetch
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <SettingsTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/test-settings-1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('should handle user-specific settings', async () => {
    const userSettings = { ...mockSettings, userId: 'user-123', scope: 'user' };
    
    global.fetch = vi.fn((url) => {
      if (url.toString().includes('/settings/user/user-123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(userSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider userId="user-123">
        <SettingsTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('settings-scope')).toHaveTextContent('user');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/settings/user/user-123'),
      expect.any(Object)
    );
  });

  it('should fall back to global settings if user settings not found', async () => {
    global.fetch = vi.fn((url) => {
      if (url.toString().includes('/settings/user/user-456')) {
        return Promise.reject(new Error('Not found'));
      }
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider userId="user-456">
        <SettingsTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('settings-scope')).toHaveTextContent('global');
  });

  it('should persist changes across page reloads using cache', async () => {
    const updatedSettings = {
      ...mockSettings,
      lightPalette: {
        ...mockSettings.lightPalette,
        primary: 'oklch(0.5 0.2 250)',
      },
    };
    
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(updatedSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    const user = userEvent.setup();
    
    const { unmount } = render(
      <ThemeProvider>
        <SettingsTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Update color
    const updateButton = screen.getByText('Update Color');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.5 0.2 250)');
    });

    // Unmount and remount to simulate page reload
    unmount();

    // Mock fetch to return updated settings from cache
    global.fetch = vi.fn((url) => {
      if (url.toString().includes('/settings/global')) {
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
        <SettingsTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should load updated settings
    expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.5 0.2 250)');
  });
});
