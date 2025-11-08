'use client';

/**
 * Theme Settings Page
 * Provides UI for customizing theme mode, color palettes, and typography
 * Uses lazy loading to reduce initial bundle size
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/hooks/useTheme';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load heavy components to reduce initial bundle size
const ThemeModeSelector = dynamic(
  () => import('@/components/settings/ThemeModeSelector').then(mod => ({ default: mod.ThemeModeSelector })),
  {
    loading: () => <div className="h-20 flex items-center justify-center"><LoadingSpinner /></div>,
    ssr: false,
  }
);

const ColorPaletteEditor = dynamic(
  () => import('@/components/settings/ColorPaletteEditor').then(mod => ({ default: mod.ColorPaletteEditor })),
  {
    loading: () => <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>,
    ssr: false,
  }
);

const TypographyEditor = dynamic(
  () => import('@/components/settings/TypographyEditor').then(mod => ({ default: mod.TypographyEditor })),
  {
    loading: () => <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>,
    ssr: false,
  }
);

const ThemePreview = dynamic(
  () => import('@/components/settings/ThemePreview').then(mod => ({ default: mod.ThemePreview })),
  {
    loading: () => <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>,
    ssr: false,
  }
);

const ThemeActions = dynamic(
  () => import('@/components/settings/ThemeActions').then(mod => ({ default: mod.ThemeActions })),
  {
    loading: () => <div className="h-20 flex items-center justify-center"><LoadingSpinner /></div>,
    ssr: false,
  }
);

export default function ThemeSettingsPage() {
  const { isLoading, setThemeMode } = useTheme();

  // Keyboard shortcuts for theme switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + L for Light mode
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        setThemeMode('light');
      }
      // Alt + D for Dark mode
      else if (e.altKey && e.key === 'd') {
        e.preventDefault();
        setThemeMode('dark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setThemeMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a href="/dashboard/settings" className="hover:text-foreground transition-colors">
              Settings
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Theme</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Theme Settings</h1>
        <p className="text-muted-foreground text-lg">
          Customize the appearance of your application with theme mode, color palettes, and typography settings.
        </p>
        <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Keyboard shortcuts:</strong> Alt+L (Light), Alt+D (Dark)
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Mode Section */}
          <section 
            className="bg-card border border-border rounded-lg p-6"
            aria-labelledby="theme-mode-heading"
          >
            <h2 id="theme-mode-heading" className="text-2xl font-semibold mb-4">Theme Mode</h2>
            <p className="text-muted-foreground mb-4">
              Choose between light, dark, or system theme preference.
            </p>
            <ThemeModeSelector />
          </section>

          {/* Color Palette Section */}
          <section 
            className="bg-card border border-border rounded-lg p-6"
            aria-labelledby="color-palette-heading"
          >
            <h2 id="color-palette-heading" className="text-2xl font-semibold mb-4">Color Palette</h2>
            <p className="text-muted-foreground mb-4">
              Customize colors for light and dark modes. Changes apply to all UI components.
            </p>
            <ColorPaletteEditor />
          </section>

          {/* Typography Section */}
          <section 
            className="bg-card border border-border rounded-lg p-6"
            aria-labelledby="typography-heading"
          >
            <h2 id="typography-heading" className="text-2xl font-semibold mb-4">Typography</h2>
            <p className="text-muted-foreground mb-4">
              Configure font families, sizes, weights, and spacing for optimal readability.
            </p>
            <TypographyEditor />
          </section>

          {/* Action Buttons Section */}
          <section 
            className="bg-card border border-border rounded-lg p-6"
            aria-labelledby="actions-heading"
          >
            <ThemeActions />
          </section>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <section 
              className="bg-card border border-border rounded-lg p-6"
              aria-labelledby="preview-heading"
            >
              <h2 id="preview-heading" className="text-2xl font-semibold mb-4">Live Preview</h2>
              <p className="text-muted-foreground mb-4">
                See your changes in real-time with sample UI components.
              </p>
              <ThemePreview />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
