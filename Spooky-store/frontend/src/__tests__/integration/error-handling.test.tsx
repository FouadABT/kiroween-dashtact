/**
 * Integration Tests: Error Handling
 * Tests Requirements: 2.7, 7.10
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Settings } from '@/types/settings';

// Test component to access theme context and trigger errors
function ErrorTestComponent() {
  const { settings, isLoading, updateColorPalette, updateTypography, refreshSettings } = useTheme();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!settings) {
    return <div>No settings</div>;
  }
  
  return (
    <div>
      <div data-testid="settings-id">{settings.id}</div>
      <div data-testid="primary-color">{settings.lightPalette.primary}</div>
      
      <button 
        onClick={() => updateColorPalette({ 
          primary: 'invalid-color-format',
        }, 'light')}
      >
        Update Invalid Color
      </button>
      
      <button 
        onClick={() => updateColorPalette({ 
          primary: 'oklch(0.5 0.2 250)',
        }, 'light')}
      >
        Update Valid Color
      </button>
      
      <button 
        onClick={() => updateTypography({ 
          fontFamily: settings.typography.fontFamily,
          fontSize: settings.typography.fontSize,
          fontWeight: settings.typography.fontWeight,
          lineHeight: settings.typography.lineHeight,
          letterSpacing: settings.typography.letterSpacing,
        })}
      >
        Update Typography
      </button>
      
      <button onClick={() => refreshSettings()}>
        Refresh Settings
      </button>
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

describe('Error Handling', () => {
  beforeEach(() => {
    localStorage.clear();
    
    // Mock console.error to suppress error logs in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle invalid color format submission', async () => {
    const user = userEvent.setup();
    
    // Mock fetch to return validation error
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            message: 'Invalid color format',
            statusCode: 400,
          }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <ErrorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Invalid Color');
    
    // Click should trigger error
    await user.click(updateButton);

    // Wait for error to be processed
    await waitFor(() => {
      // Settings should remain unchanged
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.205 0 0)');
    });
  });

  it('should handle network errors during save', async () => {
    const user = userEvent.setup();
    
    // Mock fetch to simulate network error
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        return Promise.reject(new Error('Network error'));
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <ErrorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Valid Color');
    
    // Click should trigger network error
    await user.click(updateButton);

    // Wait for error to be processed
    await waitFor(() => {
      // Settings should remain unchanged
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.205 0 0)');
    });
  });

  it('should handle concurrent update conflicts (409)', async () => {
    const user = userEvent.setup();
    let callCount = 0;
    
    // Mock fetch to return 409 conflict on first update, then success
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        callCount++;
        
        if (callCount === 1) {
          // First call returns 409 conflict
          return Promise.resolve({
            ok: false,
            status: 409,
            json: () => Promise.resolve({
              message: 'Conflict: Settings were updated by another session',
              statusCode: 409,
            }),
            headers: new Headers({ 'content-type': 'application/json' }),
          } as Response);
        }
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <ErrorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Valid Color');
    await user.click(updateButton);

    // Should trigger refresh after 409
    await waitFor(() => {
      // Verify refresh was called (fetch to /settings/global)
      const fetchCalls = (global.fetch as any).mock.calls;
      const refreshCalls = fetchCalls.filter((call: unknown) => 
        call[0].includes('/settings/global')
      );
      expect(refreshCalls.length).toBeGreaterThan(1);
    });
  });

  it('should handle server errors (500)', async () => {
    const user = userEvent.setup();
    
    // Mock fetch to return 500 server error
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({
            message: 'Internal server error',
            statusCode: 500,
          }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <ErrorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Typography');
    await user.click(updateButton);

    // Wait for error to be processed
    await waitFor(() => {
      // Settings should remain unchanged
      expect(screen.getByTestId('settings-id')).toHaveTextContent('test-settings-1');
    });
  });

  it('should handle settings not found error', async () => {
    // Mock fetch to return 404 for settings
    global.fetch = vi.fn((url) => {
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({
            message: 'Settings not found',
            statusCode: 404,
          }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <ErrorTestComponent />
      </ThemeProvider>
    );

    // Should handle gracefully and show no settings
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Component should handle missing settings
    expect(screen.queryByText('No settings')).toBeInTheDocument();
  });

  it('should recover from errors and allow retry', async () => {
    const user = userEvent.setup();
    
    // Mock fetch to fail first time
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        return Promise.reject(new Error('Network error'));
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <ErrorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Valid Color');
    
    // First attempt fails
    await user.click(updateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.205 0 0)');
    });

    // Now mock success for retry
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        const updatedSettings = {
          ...mockSettings,
          lightPalette: {
            ...mockSettings.lightPalette,
            primary: 'oklch(0.5 0.2 250)',
          },
        };
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(updatedSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      return Promise.reject(new Error('Not found'));
    });

    // Second attempt succeeds
    await user.click(updateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('primary-color')).toHaveTextContent('oklch(0.5 0.2 250)');
    });
  });

  it('should maintain UI state during error conditions', async () => {
    const user = userEvent.setup();
    
    // Mock fetch to return error
    global.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      
      if (url.toString().includes('/settings/global')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettings),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      }
      
      if (url.toString().includes('/settings/') && method === 'PATCH') {
        return Promise.reject(new Error('Update failed'));
      }
      
      return Promise.reject(new Error('Not found'));
    });
    
    render(
      <ThemeProvider>
        <ErrorTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const originalPrimaryColor = screen.getByTestId('primary-color').textContent;

    const updateButton = screen.getByText('Update Valid Color');
    await user.click(updateButton);

    // UI should remain stable after error
    await waitFor(() => {
      expect(screen.getByTestId('primary-color')).toHaveTextContent(originalPrimaryColor!);
      expect(screen.getByTestId('settings-id')).toHaveTextContent('test-settings-1');
    });
  });
});
