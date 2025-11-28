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
import { SidebarColorTest } from './test-sidebar-colors';

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

  const handleTypographyChange = (category: string, key: string, value: any) => {
    setTypography(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof TypographyConfig] || {}),
        [key]: value,
      },
    }));
  };

  const handleSaveTypography = async () => {
    try {
      setIsSaving(true);
      
      if (Object.keys(typography).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await updateTypography(typography);
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
    return {
      ...settings.typography,
      ...typography,
    };
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
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
  onChange: (category: string, key: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Font Families */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Font Families</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="font-sans">Sans Serif</Label>
            <Input
              id="font-sans"
              type="text"
              value={typography.fontFamily.sans.join(', ')}
              onChange={(e) => onChange('fontFamily', 'sans', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Inter, system-ui, sans-serif"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-serif">Serif</Label>
            <Input
              id="font-serif"
              type="text"
              value={typography.fontFamily.serif.join(', ')}
              onChange={(e) => onChange('fontFamily', 'serif', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Georgia, serif"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-mono">Monospace</Label>
            <Input
              id="font-mono"
              type="text"
              value={typography.fontFamily.mono.join(', ')}
              onChange={(e) => onChange('fontFamily', 'mono', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Consolas, monospace"
            />
          </div>
        </div>
      </div>

      {/* Font Sizes */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Font Sizes (rem)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(typography.fontSize).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`size-${key}`} className="text-xs">{key}</Label>
              <Input
                id={`size-${key}`}
                type="text"
                value={value}
                onChange={(e) => onChange('fontSize', key, e.target.value)}
                placeholder="1rem"
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Font Weights</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`weight-${key}`} className="text-xs capitalize">{key}</Label>
              <Input
                id={`weight-${key}`}
                type="number"
                min="100"
                max="900"
                step="100"
                value={value}
                onChange={(e) => onChange('fontWeight', key, parseInt(e.target.value))}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground" style={{ fontWeight: value }}>
                Sample Text
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Line Heights */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Line Heights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(typography.lineHeight).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`lineheight-${key}`} className="text-xs capitalize">{key}</Label>
              <Input
                id={`lineheight-${key}`}
                type="number"
                min="1"
                max="3"
                step="0.05"
                value={value}
                onChange={(e) => onChange('lineHeight', key, parseFloat(e.target.value))}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground" style={{ lineHeight: value }}>
                Sample text with<br />multiple lines
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Letter Spacing */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Letter Spacing</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(typography.letterSpacing).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`spacing-${key}`} className="text-xs capitalize">{key}</Label>
              <Input
                id={`spacing-${key}`}
                type="text"
                value={value}
                onChange={(e) => onChange('letterSpacing', key, e.target.value)}
                placeholder="0em"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground" style={{ letterSpacing: value }}>
                SAMPLE
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Typography Preview</h3>
        <div className="space-y-6">
          <div style={{ fontFamily: typography.fontFamily.sans.join(', ') }}>
            <p className="text-xs text-muted-foreground mb-2">Sans Serif Font</p>
            <div className="space-y-2">
              <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight }}>
                Heading Example
              </p>
              <p style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.normal, lineHeight: typography.lineHeight.normal }}>
                The quick brown fox jumps over the lazy dog. This is a sample paragraph to demonstrate how the typography settings affect the appearance of body text.
              </p>
            </div>
          </div>
          <div style={{ fontFamily: typography.fontFamily.serif.join(', ') }}>
            <p className="text-xs text-muted-foreground mb-2">Serif Font</p>
            <p style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.normal, lineHeight: typography.lineHeight.relaxed }}>
              The quick brown fox jumps over the lazy dog. Serif fonts are often used for long-form content and editorial text.
            </p>
          </div>
          <div style={{ fontFamily: typography.fontFamily.mono.join(', ') }}>
            <p className="text-xs text-muted-foreground mb-2">Monospace Font</p>
            <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal, lineHeight: typography.lineHeight.normal, letterSpacing: typography.letterSpacing.normal }}>
              const example = "Monospace fonts are used for code";
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
