/**
 * Integration Tests: Typography Customization
 * Tests Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Settings } from '@/types/settings';

// Test component to access theme context and test typography
function TypographyTestComponent() {
  const { settings, isLoading, updateTypography } = useTheme();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!settings) {
    return <div>No settings</div>;
  }
  
  return (
    <div>
      <div data-testid="font-sans">{settings.typography.fontFamily.sans.join(', ')}</div>
      <div data-testid="font-serif">{settings.typography.fontFamily.serif.join(', ')}</div>
      <div data-testid="font-mono">{settings.typography.fontFamily.mono.join(', ')}</div>
      <div data-testid="font-size-base">{settings.typography.fontSize.base}</div>
      <div data-testid="font-size-xl">{settings.typography.fontSize.xl}</div>
      <div data-testid="font-weight-normal">{settings.typography.fontWeight.normal}</div>
      <div data-testid="font-weight-bold">{settings.typography.fontWeight.bold}</div>
      <div data-testid="line-height-normal">{settings.typography.lineHeight.normal}</div>
      <div data-testid="letter-spacing-normal">{settings.typography.letterSpacing.normal}</div>
      
      <button 
        onClick={() => updateTypography({ 
          fontFamily: {
            sans: ['Roboto', 'Arial', 'sans-serif'],
            serif: settings.typography.fontFamily.serif,
            mono: settings.typography.fontFamily.mono,
          },
          fontSize: settings.typography.fontSize,
          fontWeight: settings.typography.fontWeight,
          lineHeight: settings.typography.lineHeight,
          letterSpacing: settings.typography.letterSpacing,
        })}
      >
        Update Font Family
      </button>
      
      <button 
        onClick={() => updateTypography({ 
          fontFamily: settings.typography.fontFamily,
          fontSize: {
            ...settings.typography.fontSize,
            base: '1.125rem',
            xl: '1.5rem',
          },
          fontWeight: settings.typography.fontWeight,
          lineHeight: settings.typography.lineHeight,
          letterSpacing: settings.typography.letterSpacing,
        })}
      >
        Update Font Sizes
      </button>
      
      <button 
        onClick={() => updateTypography({ 
          fontFamily: settings.typography.fontFamily,
          fontSize: settings.typography.fontSize,
          fontWeight: {
            ...settings.typography.fontWeight,
            normal: 450,
            bold: 750,
          },
          lineHeight: settings.typography.lineHeight,
          letterSpacing: settings.typography.letterSpacing,
        })}
      >
        Update Font Weights
      </button>
      
      <button 
        onClick={() => updateTypography({ 
          fontFamily: settings.typography.fontFamily,
          fontSize: settings.typography.fontSize,
          fontWeight: settings.typography.fontWeight,
          lineHeight: {
            ...settings.typography.lineHeight,
            normal: 1.6,
            relaxed: 1.8,
          },
          letterSpacing: settings.typography.letterSpacing,
        })}
      >
        Update Line Heights
      </button>
      
      <div 
        data-testid="test-text" 
        style={{ 
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-base)',
        }}
      >
        Test Text
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

describe('Typography Customization', () => {
  beforeEach(() => {
    localStorage.clear();
    
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
        if (body.typography) {
          updatedSettings.typography = { ...updatedSettings.typography, ...body.typography };
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

  it('should display font family settings correctly', async () => {
    render(
      <ThemeProvider>
        <TypographyTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('font-sans')).toHaveTextContent('Inter, system-ui, sans-serif');
    expect(screen.getByTestId('font-serif')).toHaveTextContent('Georgia, serif');
    expect(screen.getByTestId('font-mono')).toHaveTextContent('Consolas, monospace');
  });

  it('should update font families and apply application-wide', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <TypographyTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Font Family');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('font-sans')).toHaveTextContent('Roboto, Arial, sans-serif');
    });

    // Verify CSS variable is updated
    const root = document.documentElement;
    const fontSans = root.style.getPropertyValue('--font-sans');
    expect(fontSans).toContain('Roboto');
  });

  it('should adjust type scale and update all text sizes', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <TypographyTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('font-size-base')).toHaveTextContent('1rem');
    expect(screen.getByTestId('font-size-xl')).toHaveTextContent('1.25rem');

    const updateButton = screen.getByText('Update Font Sizes');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('font-size-base')).toHaveTextContent('1.125rem');
      expect(screen.getByTestId('font-size-xl')).toHaveTextContent('1.5rem');
    });

    // Verify CSS variables are updated
    const root = document.documentElement;
    const fontSizeBase = root.style.getPropertyValue('--font-size-base');
    expect(fontSizeBase).toBe('1.125rem');
  });

  it('should update font weights across the application', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <TypographyTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('font-weight-normal')).toHaveTextContent('400');
    expect(screen.getByTestId('font-weight-bold')).toHaveTextContent('700');

    const updateButton = screen.getByText('Update Font Weights');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('font-weight-normal')).toHaveTextContent('450');
      expect(screen.getByTestId('font-weight-bold')).toHaveTextContent('750');
    });

    // Verify CSS variables are updated
    const root = document.documentElement;
    const fontWeightNormal = root.style.getPropertyValue('--font-weight-normal');
    expect(fontWeightNormal).toBe('450');
  });

  it('should update line heights for better readability', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <TypographyTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('line-height-normal')).toHaveTextContent('1.5');

    const updateButton = screen.getByText('Update Line Heights');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('line-height-normal')).toHaveTextContent('1.6');
    });

    // Verify CSS variables are updated
    const root = document.documentElement;
    const lineHeightNormal = root.style.getPropertyValue('--line-height-normal');
    expect(lineHeightNormal).toBe('1.6');
  });

  it('should persist typography changes across updates', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <TypographyTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Update font family
    const fontFamilyButton = screen.getByText('Update Font Family');
    await user.click(fontFamilyButton);

    await waitFor(() => {
      expect(screen.getByTestId('font-sans')).toHaveTextContent('Roboto, Arial, sans-serif');
    });

    // Update font sizes
    const fontSizeButton = screen.getByText('Update Font Sizes');
    await user.click(fontSizeButton);

    await waitFor(() => {
      expect(screen.getByTestId('font-size-base')).toHaveTextContent('1.125rem');
    });

    // Verify both changes persisted
    expect(screen.getByTestId('font-sans')).toHaveTextContent('Roboto, Arial, sans-serif');
    expect(screen.getByTestId('font-size-base')).toHaveTextContent('1.125rem');
  });

  it('should apply typography changes to CSS custom properties', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <TypographyTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Font Family');
    await user.click(updateButton);

    await waitFor(() => {
      const root = document.documentElement;
      
      // Check multiple CSS variables
      expect(root.style.getPropertyValue('--font-sans')).toContain('Roboto');
      expect(root.style.getPropertyValue('--font-serif')).toContain('Georgia');
      expect(root.style.getPropertyValue('--font-mono')).toContain('Consolas');
    });
  });

  it('should maintain letter spacing settings', async () => {
    render(
      <ThemeProvider>
        <TypographyTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('letter-spacing-normal')).toHaveTextContent('0');

    // Verify CSS variable
    const root = document.documentElement;
    const letterSpacingNormal = root.style.getPropertyValue('--letter-spacing-normal');
    expect(letterSpacingNormal).toBe('0');
  });
});
