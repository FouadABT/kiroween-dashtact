'use client';

/**
 * Global Settings Editor Component
 * 
 * Edit global settings for the landing page including SEO, theme, and layout.
 */

import { LandingPageSettings } from '@/types/landing-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GlobalSettingsEditorProps {
  settings: LandingPageSettings;
  onChange: (settings: LandingPageSettings) => void;
}

export function GlobalSettingsEditor({ settings, onChange }: GlobalSettingsEditorProps) {
  const handleSeoChange = (field: string, value: string) => {
    const currentSeo = settings.seo || { title: '', description: '' };
    onChange({
      ...settings,
      seo: {
        ...currentSeo,
        [field]: value,
      },
    });
  };

  const handleThemeChange = (field: string, value: string) => {
    onChange({
      ...settings,
      theme: {
        ...settings.theme,
        [field]: value,
      },
    });
  };

  const handleLayoutChange = (field: string, value: string) => {
    onChange({
      ...settings,
      layout: {
        ...settings.layout,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>
            Configure meta tags and search engine optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title">Meta Title</Label>
            <Input
              id="seo-title"
              value={settings.seo?.title || ''}
              onChange={(e) => handleSeoChange('title', e.target.value)}
              placeholder="Landing Page Title"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 50-60 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-description">Meta Description</Label>
            <Textarea
              id="seo-description"
              value={settings.seo?.description || ''}
              onChange={(e) => handleSeoChange('description', e.target.value)}
              placeholder="Brief description of your landing page"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 150-160 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Keywords</Label>
            <Input
              id="seo-keywords"
              value={settings.seo?.keywords || ''}
              onChange={(e) => handleSeoChange('keywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of keywords
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-og-image">Open Graph Image URL</Label>
            <Input
              id="seo-og-image"
              value={settings.seo?.ogImage || ''}
              onChange={(e) => handleSeoChange('ogImage', e.target.value)}
              placeholder="/og-image.png"
            />
            <p className="text-xs text-muted-foreground">
              Image for social media sharing (1200x630px recommended)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Customize colors and typography
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-primary-color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="theme-primary-color"
                type="color"
                value={settings.theme?.primaryColor || '#000000'}
                onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={settings.theme?.primaryColor || '#000000'}
                onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-secondary-color">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="theme-secondary-color"
                type="color"
                value={settings.theme?.secondaryColor || '#666666'}
                onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={settings.theme?.secondaryColor || '#666666'}
                onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                placeholder="#666666"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-font-family">Font Family</Label>
            <Select
              value={settings.theme?.fontFamily || 'system'}
              onValueChange={(value) => handleThemeChange('fontFamily', value)}
            >
              <SelectTrigger id="theme-font-family">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Default</SelectItem>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="open-sans">Open Sans</SelectItem>
                <SelectItem value="lato">Lato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Settings</CardTitle>
          <CardDescription>
            Configure page layout and spacing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="layout-max-width">Maximum Width</Label>
            <Select
              value={settings.layout?.maxWidth || 'container'}
              onValueChange={(value) => handleLayoutChange('maxWidth', value)}
            >
              <SelectTrigger id="layout-max-width">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="container">Container (1280px)</SelectItem>
                <SelectItem value="narrow">Narrow (960px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout-spacing">Section Spacing</Label>
            <Select
              value={settings.layout?.spacing || 'normal'}
              onValueChange={(value) => handleLayoutChange('spacing', value)}
            >
              <SelectTrigger id="layout-spacing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Relaxed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
