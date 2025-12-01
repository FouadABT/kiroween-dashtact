'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Palette, Type, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';
import { ColorPalette, TypographyConfig } from '@/types/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OKLCHColorPicker } from '@/components/settings/OKLCHColorPicker';
import { FontVerification } from './font-verification';
// import { SidebarColorTest } from './test-sidebar-colors';

// Helper function to convert ColorPalette key to CSS variable name
function getCSSVariableName(key: keyof ColorPalette): string {
  const mapping: Record<keyof ColorPalette, string> = {
    background: '--background',
    foreground: '--foreground',
    card: '--card',
    cardForeground: '--card-foreground',
    popover: '--popover',
    popoverForeground: '--popover-foreground',
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    secondary: '--secondary',
    secondaryForeground: '--secondary-foreground',
    muted: '--muted',
    mutedForeground: '--muted-foreground',
    accent: '--accent',
    accentForeground: '--accent-foreground',
    destructive: '--destructive',
    destructiveForeground: '--destructive-foreground',
    border: '--border',
    input: '--input',
    ring: '--ring',
    chart1: '--chart-1',
    chart2: '--chart-2',
    chart3: '--chart-3',
    chart4: '--chart-4',
    chart5: '--chart-5',
    sidebar: '--sidebar-background',
    sidebarForeground: '--sidebar-foreground',
    sidebarPrimary: '--sidebar-primary',
    sidebarPrimaryForeground: '--sidebar-primary-foreground',
    sidebarAccent: '--sidebar-accent',
    sidebarAccentForeground: '--sidebar-accent-foreground',
    sidebarBorder: '--sidebar-border',
    sidebarRing: '--sidebar-ring',
    radius: '--radius',
  };
  return mapping[key] || `--${key}`;
}

export default function ThemeSettingsPage() {
  const { themeMode, resolvedTheme, settings, isLoading, setThemeMode, updateColorPalette, updateTypography, resetToDefaults } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'mode' | 'colors' | 'typography'>('mode');
  const [paletteMode, setPaletteMode] = useState<'light' | 'dark'>('light');
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for color editing
  const [lightColors, setLightColors] = useState<Partial<ColorPalette>>({});
  const [darkColors, setDarkColors] = useState<Partial<ColorPalette>>({});
  
  // Local state for typography editing
  const [typography, setTypography] = useState<Partial<TypographyConfig>>({});

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    toast.success(`Switched to ${mode} mode`);
  };

  const handleColorChange = useCallback((key: keyof ColorPalette, value: string) => {
    if (paletteMode === 'light') {
      setLightColors(prev => ({ ...prev, [key]: value }));
    } else {
      setDarkColors(prev => ({ ...prev, [key]: value }));
    }
    
    // Apply live preview if editing current theme mode
    if ((paletteMode === 'light' && resolvedTheme === 'light') || 
        (paletteMode === 'dark' && resolvedTheme === 'dark')) {
      const cssVarName = getCSSVariableName(key);
      document.documentElement.style.setProperty(cssVarName, value);
    }
  }, [paletteMode, resolvedTheme]);

  const handleSaveColors = async () => {
    try {
      setIsSaving(true);
      const colorsToSave = paletteMode === 'light' ? lightColors : darkColors;
      
      if (Object.keys(colorsToSave).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await updateColorPalette(colorsToSave, paletteMode);
      
      // Clear local state after successful save
      if (paletteMode === 'light') {
        setLightColors({});
      } else {
        setDarkColors({});
      }
      
      toast.success(`${paletteMode === 'light' ? 'Light' : 'Dark'} palette updated successfully`);
    } catch (error) {
      console.error('Failed to save colors:', error);
      toast.error('Failed to save color palette');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelColors = useCallback(() => {
    // Restore original colors from settings
    if (!settings) return;
    
    const originalPalette = paletteMode === 'light' ? settings.lightPalette : settings.darkPalette;
    const localChanges = paletteMode === 'light' ? lightColors : darkColors;
    
    // Only restore if we're viewing the current theme
    if ((paletteMode === 'light' && resolvedTheme === 'light') || 
        (paletteMode === 'dark' && resolvedTheme === 'dark')) {
      Object.keys(localChanges).forEach((key) => {
        const cssVarName = getCSSVariableName(key as keyof ColorPalette);
        const originalValue = originalPalette[key as keyof ColorPalette];
        if (originalValue) {
          document.documentElement.style.setProperty(cssVarName, originalValue);
        }
      });
    }
    
    // Clear local state
    if (paletteMode === 'light') {
      setLightColors({});
    } else {
      setDarkColors({});
    }
    
    toast.info('Changes discarded');
  }, [paletteMode, resolvedTheme, settings, lightColors, darkColors]);

  const handleTypographyChange = (category: string, key: string, value: string | number | string[]) => {
    setTypography(prev => {
      // Get the current category object from either local state or settings
      const currentCategory = prev[category as keyof TypographyConfig] || 
                             settings?.typography[category as keyof TypographyConfig] || 
                             {};
      
      return {
        ...prev,
        [category]: {
          ...currentCategory,
          [key]: value,
        },
      };
    });
  };

  const handleSaveTypography = async () => {
    try {
      setIsSaving(true);
      
      if (Object.keys(typography).length === 0) {
        toast.info('No changes to save');
        return;
      }

      // Get the complete merged typography to send to backend
      const completeTypography = getCurrentTypography();
      
      await updateTypography(completeTypography);
      setTypography({});
      toast.success('Typography updated successfully');
    } catch (error) {
      console.error('Failed to save typography:', error);
      toast.error('Failed to save typography');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all theme settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      setIsSaving(true);
      await resetToDefaults();
      setLightColors({});
      setDarkColors({});
      setTypography({});
      toast.success('Theme settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentPalette = useCallback(() => {
    if (!settings) return {} as ColorPalette;
    const basePalette = paletteMode === 'light' ? settings.lightPalette : settings.darkPalette;
    const localChanges = paletteMode === 'light' ? lightColors : darkColors;
    return { ...basePalette, ...localChanges };
  }, [paletteMode, settings, lightColors, darkColors]);

  const getCurrentTypography = useCallback(() => {
    if (!settings) return {} as TypographyConfig;
    
    // Deep merge typography changes with settings
    const merged: TypographyConfig = {
      fontFamily: {
        ...settings.typography.fontFamily,
        ...(typography.fontFamily || {}),
      },
      fontSize: {
        ...settings.typography.fontSize,
        ...(typography.fontSize || {}),
      },
      fontWeight: {
        ...settings.typography.fontWeight,
        ...(typography.fontWeight || {}),
      },
      lineHeight: {
        ...settings.typography.lineHeight,
        ...(typography.lineHeight || {}),
      },
      letterSpacing: {
        ...settings.typography.letterSpacing,
        ...(typography.letterSpacing || {}),
      },
    };
    
    return merged;
  }, [settings, typography]);

  const hasUnsavedChanges = Object.keys(lightColors).length > 0 || 
                            Object.keys(darkColors).length > 0 || 
                            Object.keys(typography).length > 0;

  // Show loading state AFTER all hooks are defined
  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PageHeader
        title="Theme Settings"
        description="Customize your application appearance with colors, typography, and theme modes"
        breadcrumbProps={{
          customItems: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings', href: '/dashboard/settings' },
            { label: 'Theme', href: '/dashboard/settings/theme' },
          ],
        }}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'mode' | 'colors' | 'typography')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mode" className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Theme Mode
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </TabsTrigger>
        </TabsList>

        {/* Theme Mode Tab */}
        <TabsContent value="mode" className="space-y-6">
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Theme Mode</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Choose how you want your interface to look
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  themeMode === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Sun className="w-8 h-8 text-yellow-500" />
                  <div className="text-center">
                    <div className="font-medium text-foreground">Light Mode</div>
                    <div className="text-xs text-muted-foreground">Bright interface</div>
                  </div>
                  {themeMode === 'light' && (
                    <div className="text-xs font-medium text-primary">✓ Active</div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  themeMode === 'dark'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Moon className="w-8 h-8 text-blue-500" />
                  <div className="text-center">
                    <div className="font-medium text-foreground">Dark Mode</div>
                    <div className="text-xs text-muted-foreground">Dark interface</div>
                  </div>
                  {themeMode === 'dark' && (
                    <div className="text-xs font-medium text-primary">✓ Active</div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleThemeChange('system')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  themeMode === 'system'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-8 h-8">
                    <Sun className="w-4 h-4 absolute top-0 left-0 text-yellow-500" />
                    <Moon className="w-4 h-4 absolute bottom-0 right-0 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">System</div>
                    <div className="text-xs text-muted-foreground">Follow OS</div>
                  </div>
                  {themeMode === 'system' && (
                    <div className="text-xs font-medium text-primary">✓ Active</div>
                  )}
                </div>
              </button>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Preview</h2>
            <p className="text-sm text-muted-foreground mb-6">
              See how your interface looks in {resolvedTheme} mode
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Buttons</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                    <Button variant="destructive" size="sm">Destructive</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Text</p>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Heading Text</p>
                    <p className="text-sm text-muted-foreground">Muted text</p>
                    <p className="text-sm text-primary">Primary colored text</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">Card Example</p>
                <p className="text-xs text-muted-foreground">
                  This shows how cards look in {resolvedTheme} mode
                </p>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border rounded-lg p-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Color Palette Editor
                {((paletteMode === 'light' && resolvedTheme === 'light') || 
                  (paletteMode === 'dark' && resolvedTheme === 'dark')) && (
                  <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-1 rounded">
                    Live Preview
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize colors for {paletteMode} mode (HSL format)
                {((paletteMode === 'light' && resolvedTheme === 'light') || 
                  (paletteMode === 'dark' && resolvedTheme === 'dark')) && (
                  <span className="ml-1">• Changes apply instantly</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={paletteMode} onValueChange={(v) => setPaletteMode(v as 'light' | 'dark')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              {(paletteMode === 'light' ? Object.keys(lightColors).length > 0 : Object.keys(darkColors).length > 0) && (
                <Button
                  onClick={handleCancelColors}
                  disabled={isSaving}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSaveColors}
                disabled={isSaving || (paletteMode === 'light' ? Object.keys(lightColors).length === 0 : Object.keys(darkColors).length === 0)}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Colors
              </Button>
            </div>
          </div>

          <ColorPaletteEditor
            palette={getCurrentPalette()}
            onChange={handleColorChange}
          />
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Typography Settings</h2>
              <p className="text-sm text-muted-foreground">
                Customize fonts, sizes, and spacing
              </p>
            </div>
            <Button
              onClick={handleSaveTypography}
              disabled={isSaving || Object.keys(typography).length === 0}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Typography
            </Button>
          </div>

          {/* Font Verification */}
          <FontVerification />

          <TypographyEditor
            typography={getCurrentTypography()}
            onChange={handleTypographyChange}
          />
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="mt-8 flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 dark:text-amber-400">
              ⚠️ You have unsaved changes
            </span>
          )}
        </div>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

// Color Palette Editor Component
function ColorPaletteEditor({
  palette,
  onChange,
}: {
  palette: ColorPalette;
  onChange: (key: keyof ColorPalette, value: string) => void;
}) {
  const colorGroups = [
    {
      title: 'Base Colors',
      description: 'Main background and text colors',
      colors: [
        { key: 'background' as keyof ColorPalette, label: 'Background' },
        { key: 'foreground' as keyof ColorPalette, label: 'Foreground' },
      ],
    },
    {
      title: 'Component Colors',
      description: 'Colors for cards, popovers, and containers',
      colors: [
        { key: 'card' as keyof ColorPalette, label: 'Card' },
        { key: 'cardForeground' as keyof ColorPalette, label: 'Card Text' },
        { key: 'popover' as keyof ColorPalette, label: 'Popover' },
        { key: 'popoverForeground' as keyof ColorPalette, label: 'Popover Text' },
      ],
    },
    {
      title: 'Brand Colors',
      description: 'Primary and secondary brand colors',
      colors: [
        { key: 'primary' as keyof ColorPalette, label: 'Primary' },
        { key: 'primaryForeground' as keyof ColorPalette, label: 'Primary Text' },
        { key: 'secondary' as keyof ColorPalette, label: 'Secondary' },
        { key: 'secondaryForeground' as keyof ColorPalette, label: 'Secondary Text' },
      ],
    },
    {
      title: 'State Colors',
      description: 'Colors for different UI states',
      colors: [
        { key: 'muted' as keyof ColorPalette, label: 'Muted' },
        { key: 'mutedForeground' as keyof ColorPalette, label: 'Muted Text' },
        { key: 'accent' as keyof ColorPalette, label: 'Accent' },
        { key: 'accentForeground' as keyof ColorPalette, label: 'Accent Text' },
        { key: 'destructive' as keyof ColorPalette, label: 'Destructive' },
        { key: 'destructiveForeground' as keyof ColorPalette, label: 'Destructive Text' },
      ],
    },
    {
      title: 'UI Elements',
      description: 'Borders, inputs, and focus rings',
      colors: [
        { key: 'border' as keyof ColorPalette, label: 'Border' },
        { key: 'input' as keyof ColorPalette, label: 'Input' },
        { key: 'ring' as keyof ColorPalette, label: 'Focus Ring' },
      ],
    },
    {
      title: 'Sidebar Colors',
      description: 'Navigation sidebar colors and text',
      colors: [
        { key: 'sidebar' as keyof ColorPalette, label: 'Sidebar Background' },
        { key: 'sidebarForeground' as keyof ColorPalette, label: 'Sidebar Text' },
        { key: 'sidebarPrimary' as keyof ColorPalette, label: 'Sidebar Primary' },
        { key: 'sidebarPrimaryForeground' as keyof ColorPalette, label: 'Sidebar Primary Text' },
        { key: 'sidebarAccent' as keyof ColorPalette, label: 'Sidebar Accent (Active)' },
        { key: 'sidebarAccentForeground' as keyof ColorPalette, label: 'Sidebar Accent Text' },
        { key: 'sidebarBorder' as keyof ColorPalette, label: 'Sidebar Border' },
        { key: 'sidebarRing' as keyof ColorPalette, label: 'Sidebar Focus Ring' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Preview Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Live Preview Active</h3>
            <p className="text-sm text-muted-foreground">
              Changes are applied instantly. Click the color swatch to open the HSL picker with sliders. Format: H S% L% (e.g., 240 5.9% 10%)
            </p>
          </div>
        </div>
      </div>

      {/* Color Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {colorGroups.map((group) => (
          <div key={group.title} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
            </div>
            <div className="space-y-4">
              {group.colors.map((color) => (
                <OKLCHColorPicker
                  key={color.key}
                  id={color.key}
                  label={color.label}
                  value={palette[color.key]}
                  onChange={(value) => onChange(color.key, value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Typography Editor Component
function TypographyEditor({
  typography,
  onChange,
}: {
  typography: TypographyConfig;
  onChange: (category: string, key: string, value: string | number | string[]) => void;
}) {
  // Popular font choices with good UI/UX
  // These fonts are loaded via Next.js font optimization in layout.tsx
  const popularFonts = {
    sans: [
      { value: 'var(--font-inter), system-ui, sans-serif', label: 'Inter' },
      { value: 'var(--font-roboto), system-ui, sans-serif', label: 'Roboto' },
      { value: 'var(--font-open-sans), system-ui, sans-serif', label: 'Open Sans' },
      { value: 'var(--font-lato), system-ui, sans-serif', label: 'Lato' },
      { value: 'var(--font-poppins), system-ui, sans-serif', label: 'Poppins' },
      { value: 'var(--font-montserrat), system-ui, sans-serif', label: 'Montserrat' },
      { value: 'var(--font-source-sans), system-ui, sans-serif', label: 'Source Sans 3' },
      { value: 'var(--font-nunito), system-ui, sans-serif', label: 'Nunito' },
      { value: 'system-ui, -apple-system, sans-serif', label: 'System Default' },
    ],
    serif: [
      { value: 'Georgia, serif', label: 'Georgia' },
      { value: 'var(--font-merriweather), Georgia, serif', label: 'Merriweather' },
      { value: 'var(--font-playfair), Georgia, serif', label: 'Playfair Display' },
      { value: 'var(--font-lora), Georgia, serif', label: 'Lora' },
      { value: 'var(--font-pt-serif), Georgia, serif', label: 'PT Serif' },
      { value: 'var(--font-crimson-text), Georgia, serif', label: 'Crimson Text' },
      { value: 'var(--font-source-serif), Georgia, serif', label: 'Source Serif 4' },
    ],
    mono: [
      { value: 'var(--font-fira-code), monospace', label: 'Fira Code' },
      { value: 'var(--font-jetbrains-mono), monospace', label: 'JetBrains Mono' },
      { value: 'var(--font-source-code-pro), monospace', label: 'Source Code Pro' },
      { value: 'var(--font-ibm-plex-mono), monospace', label: 'IBM Plex Mono' },
      { value: 'Consolas, monospace', label: 'Consolas' },
      { value: 'Monaco, monospace', label: 'Monaco' },
      { value: 'Courier New, monospace', label: 'Courier New' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Font Families */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Font Families</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose professional fonts for different text types
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sans Serif */}
          <div className="space-y-3">
            <Label htmlFor="font-sans" className="text-sm font-medium">
              Sans Serif (Body Text)
            </Label>
            <Select
              value={typography.fontFamily.sans.join(', ')}
              onValueChange={(value) => onChange('fontFamily', 'sans', value.split(',').map(s => s.trim()))}
            >
              <SelectTrigger id="font-sans">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {popularFonts.sans.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div 
              className="p-3 bg-muted/50 rounded border border-border"
              style={{ fontFamily: typography.fontFamily.sans.join(', ') }}
            >
              <p className="text-sm text-foreground">The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>

          {/* Serif */}
          <div className="space-y-3">
            <Label htmlFor="font-serif" className="text-sm font-medium">
              Serif (Headings)
            </Label>
            <Select
              value={typography.fontFamily.serif.join(', ')}
              onValueChange={(value) => onChange('fontFamily', 'serif', value.split(',').map(s => s.trim()))}
            >
              <SelectTrigger id="font-serif">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {popularFonts.serif.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div 
              className="p-3 bg-muted/50 rounded border border-border"
              style={{ fontFamily: typography.fontFamily.serif.join(', ') }}
            >
              <p className="text-sm text-foreground">The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>

          {/* Monospace */}
          <div className="space-y-3">
            <Label htmlFor="font-mono" className="text-sm font-medium">
              Monospace (Code)
            </Label>
            <Select
              value={typography.fontFamily.mono.join(', ')}
              onValueChange={(value) => onChange('fontFamily', 'mono', value.split(',').map(s => s.trim()))}
            >
              <SelectTrigger id="font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {popularFonts.mono.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div 
              className="p-3 bg-muted/50 rounded border border-border"
              style={{ fontFamily: typography.fontFamily.mono.join(', ') }}
            >
              <p className="text-sm text-foreground">const code = &quot;example&quot;;</p>
            </div>
          </div>
        </div>
      </div>

      {/* Font Sizes with Sliders */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Font Sizes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust the type scale for your application
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(typography.fontSize).map(([key, value]) => {
            const remValue = parseFloat(value);
            const pxValue = Math.round(remValue * 16);
            
            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`size-${key}`} className="text-sm font-medium capitalize">
                    {key}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {value} ({pxValue}px)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id={`size-${key}`}
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.125"
                    value={remValue}
                    onChange={(e) => onChange('fontSize', key, `${e.target.value}rem`)}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange('fontSize', key, e.target.value)}
                    className="w-24 text-sm"
                  />
                </div>
                <p 
                  className="text-foreground"
                  style={{ fontSize: value }}
                >
                  Sample Text
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Font Weights with Visual Preview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Font Weights</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Define weight scale from light to extra bold
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={`weight-${key}`} className="text-sm font-medium capitalize">
                  {key}
                </Label>
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <Select
                value={value.toString()}
                onValueChange={(v) => onChange('fontWeight', key, parseInt(v))}
              >
                <SelectTrigger id={`weight-${key}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 - Thin</SelectItem>
                  <SelectItem value="200">200 - Extra Light</SelectItem>
                  <SelectItem value="300">300 - Light</SelectItem>
                  <SelectItem value="400">400 - Normal</SelectItem>
                  <SelectItem value="500">500 - Medium</SelectItem>
                  <SelectItem value="600">600 - Semibold</SelectItem>
                  <SelectItem value="700">700 - Bold</SelectItem>
                  <SelectItem value="800">800 - Extra Bold</SelectItem>
                  <SelectItem value="900">900 - Black</SelectItem>
                </SelectContent>
              </Select>
              <p 
                className="text-base text-foreground"
                style={{ fontWeight: value }}
              >
                The quick brown fox
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Line Heights with Slider */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Line Heights</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Control vertical spacing between lines of text
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(typography.lineHeight).map(([key, value]) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={`lineheight-${key}`} className="text-sm font-medium capitalize">
                  {key}
                </Label>
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id={`lineheight-${key}`}
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={value}
                  onChange={(e) => onChange('lineHeight', key, parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <Input
                  type="number"
                  min="1"
                  max="3"
                  step="0.05"
                  value={value}
                  onChange={(e) => onChange('lineHeight', key, parseFloat(e.target.value))}
                  className="w-20 text-sm"
                />
              </div>
              <div 
                className="p-3 bg-muted/50 rounded border border-border"
                style={{ lineHeight: value }}
              >
                <p className="text-sm text-foreground">
                  This is sample text with multiple lines to demonstrate the line height setting. 
                  Notice how the spacing between lines changes.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Letter Spacing with Slider */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Letter Spacing</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust horizontal spacing between characters
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(typography.letterSpacing).map(([key, value]) => {
            const emValue = parseFloat(value) || 0;
            
            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`spacing-${key}`} className="text-sm font-medium capitalize">
                    {key}
                  </Label>
                  <span className="text-xs text-muted-foreground">{value}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id={`spacing-${key}`}
                    type="range"
                    min="-0.1"
                    max="0.1"
                    step="0.005"
                    value={emValue}
                    onChange={(e) => onChange('letterSpacing', key, `${e.target.value}em`)}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange('letterSpacing', key, e.target.value)}
                    className="w-24 text-sm"
                  />
                </div>
                <div 
                  className="p-3 bg-muted/50 rounded border border-border"
                  style={{ letterSpacing: value }}
                >
                  <p className="text-sm text-foreground uppercase">
                    SAMPLE TEXT
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
          <p className="text-sm text-muted-foreground mt-1">
            See how your typography settings look in real content
          </p>
        </div>
        <div className="space-y-6 bg-background rounded-lg p-6 border border-border">
          {/* Sans Serif Preview */}
          <div style={{ fontFamily: typography.fontFamily.sans.join(', ') }}>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
              Sans Serif Font Family
            </p>
            <h1 
              className="text-foreground mb-2"
              style={{ 
                fontSize: typography.fontSize['3xl'], 
                fontWeight: typography.fontWeight.bold,
                lineHeight: typography.lineHeight.tight 
              }}
            >
              Main Heading Example
            </h1>
            <h2 
              className="text-foreground mb-3"
              style={{ 
                fontSize: typography.fontSize.xl, 
                fontWeight: typography.fontWeight.semibold,
                lineHeight: typography.lineHeight.normal 
              }}
            >
              Subheading Example
            </h2>
            <p 
              className="text-foreground mb-4"
              style={{ 
                fontSize: typography.fontSize.base, 
                fontWeight: typography.fontWeight.normal,
                lineHeight: typography.lineHeight.relaxed 
              }}
            >
              The quick brown fox jumps over the lazy dog. This is a sample paragraph to demonstrate 
              how the typography settings affect the appearance of body text. Notice the font family, 
              size, weight, line height, and letter spacing all working together to create readable, 
              beautiful text.
            </p>
            <p 
              className="text-muted-foreground"
              style={{ 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.normal,
                lineHeight: typography.lineHeight.normal 
              }}
            >
              Small text example for captions and metadata
            </p>
          </div>

          {/* Serif Preview */}
          <div 
            className="pt-6 border-t border-border"
            style={{ fontFamily: typography.fontFamily.serif.join(', ') }}
          >
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
              Serif Font Family
            </p>
            <h2 
              className="text-foreground mb-3"
              style={{ 
                fontSize: typography.fontSize['2xl'], 
                fontWeight: typography.fontWeight.bold,
                lineHeight: typography.lineHeight.tight 
              }}
            >
              Elegant Serif Heading
            </h2>
            <p 
              className="text-foreground"
              style={{ 
                fontSize: typography.fontSize.base, 
                fontWeight: typography.fontWeight.normal,
                lineHeight: typography.lineHeight.relaxed 
              }}
            >
              Serif fonts are often used for long-form content and editorial text. They provide 
              a classic, sophisticated look that&apos;s easy to read in longer passages.
            </p>
          </div>

          {/* Monospace Preview */}
          <div 
            className="pt-6 border-t border-border"
            style={{ fontFamily: typography.fontFamily.mono.join(', ') }}
          >
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
              Monospace Font Family
            </p>
            <div 
              className="bg-muted/50 rounded p-4 border border-border"
              style={{ 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.normal,
                lineHeight: typography.lineHeight.relaxed,
                letterSpacing: typography.letterSpacing.normal 
              }}
            >
              <p className="text-foreground">const greeting = &quot;Hello, World!&quot;;</p>
              <p className="text-foreground">function example() {`{`}</p>
              <p className="text-foreground ml-4">return true;</p>
              <p className="text-foreground">{`}`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
