'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Settings, 
  Search, 
  Layout, 
  Zap, 
  Code, 
  HelpCircle,
  Save,
  RotateCcw,
  Eye,
  Upload,
  FileCode,
  BarChart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { LandingSettings } from '@/types/landing-cms';

interface SettingsPanelProps {
  settings: LandingSettings;
  onChange: (settings: LandingSettings) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  isSaving?: boolean;
}

export function SettingsPanel({
  settings,
  onChange,
  onSave,
  onReset,
  isSaving = false,
}: SettingsPanelProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Ensure settings has the proper structure with defaults
  const safeSettings: LandingSettings = {
    general: {
      title: settings?.general?.title || '',
      description: settings?.general?.description || '',
      favicon: settings?.general?.favicon || '/favicon.ico',
      language: settings?.general?.language || 'en',
    },
    seo: {
      ogTitle: settings?.seo?.ogTitle || '',
      ogDescription: settings?.seo?.ogDescription || '',
      ogImage: settings?.seo?.ogImage || '',
      twitterCard: settings?.seo?.twitterCard || 'summary_large_image',
      structuredData: settings?.seo?.structuredData ?? true,
    },
    theme: {
      mode: settings?.theme?.mode || 'auto',
      colors: {
        primary: settings?.theme?.colors?.primary || { light: '', dark: '' },
        secondary: settings?.theme?.colors?.secondary || { light: '', dark: '' },
        accent: settings?.theme?.colors?.accent || { light: '', dark: '' },
      },
    },
    layout: {
      maxWidth: (() => {
        const mw = settings?.layout?.maxWidth || settings?.layout?.containerWidth;
        // Map old values to new values
        if (mw === 'standard' || mw === 'wide') return 'container';
        if (mw === 'full' || mw === 'narrow') return mw;
        return 'container';
      })(),
      spacing: settings?.layout?.spacing || settings?.layout?.sectionSpacing || 'normal',
    },
    performance: {
      imageOptimization: settings?.performance?.imageOptimization ?? true,
      lazyLoading: settings?.performance?.lazyLoading ?? true,
      cacheStrategy: settings?.performance?.cacheStrategy || 'normal',
    },
    advanced: settings?.advanced || {},
  };

  const handleSave = async () => {
    try {
      await onSave();
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      onReset();
      toast.info('Settings reset to defaults');
    }
  };

  const updateSettings = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...safeSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(newSettings);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
        <div className="border-b border-border px-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="layout" className="gap-2">
              <Layout className="h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Code className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic page information and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="page-title">
                    Page Title
                    <HelpTooltip content="The title that appears in browser tabs and search results" />
                  </Label>
                  <Input
                    id="page-title"
                    value={safeSettings.general.title}
                    onChange={(e) => updateSettings('general.title', e.target.value)}
                    placeholder="My Awesome Landing Page"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta-description">
                    Meta Description
                    <HelpTooltip content="A brief description of your page for search engines (150-160 characters)" />
                  </Label>
                  <Textarea
                    id="meta-description"
                    value={safeSettings.general.description}
                    onChange={(e) => updateSettings('general.description', e.target.value)}
                    placeholder="Describe your landing page..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {safeSettings.general.description.length} / 160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon">
                    Favicon
                    <HelpTooltip content="The small icon that appears in browser tabs" />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="favicon"
                      value={safeSettings.general.favicon}
                      onChange={(e) => updateSettings('general.favicon', e.target.value)}
                      placeholder="/favicon.ico"
                    />
                    <Button variant="outline" size="sm" disabled title="Coming Soon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 File upload coming soon. For now, enter the URL directly.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">
                    Language
                    <HelpTooltip content="The primary language of your content" />
                  </Label>
                  <Select
                    value={safeSettings.general.language}
                    onValueChange={(value) => updateSettings('general.language', value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings Tab */}
          <TabsContent value="seo" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Social Media</CardTitle>
                <CardDescription>
                  Optimize your page for search engines and social sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="open-graph">
                    <AccordionTrigger>Open Graph (Facebook, LinkedIn)</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="og-title">OG Title</Label>
                        <Input
                          id="og-title"
                          value={safeSettings.seo.ogTitle}
                          onChange={(e) => updateSettings('seo.ogTitle', e.target.value)}
                          placeholder="Title for social media"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="og-description">OG Description</Label>
                        <Textarea
                          id="og-description"
                          value={safeSettings.seo.ogDescription}
                          onChange={(e) => updateSettings('seo.ogDescription', e.target.value)}
                          placeholder="Description for social media"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="og-image">OG Image URL</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="og-image"
                            value={safeSettings.seo.ogImage}
                            onChange={(e) => updateSettings('seo.ogImage', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
                          <Button variant="outline" size="sm" disabled title="Coming Soon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Recommended: 1200x630px. 💡 File upload coming soon.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="twitter">
                    <AccordionTrigger>Twitter Card</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter-card">Card Type</Label>
                        <Select
                          value={safeSettings.seo.twitterCard}
                          onValueChange={(value: 'summary' | 'summary_large_image') => 
                            updateSettings('seo.twitterCard', value)
                          }
                        >
                          <SelectTrigger id="twitter-card">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="summary">Summary</SelectItem>
                            <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advanced-seo">
                    <AccordionTrigger>Advanced SEO</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Structured Data</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable JSON-LD structured data
                          </p>
                        </div>
                        <Switch
                          checked={safeSettings.seo.structuredData}
                          onCheckedChange={(checked) => 
                            updateSettings('seo.structuredData', checked)
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Layout Settings Tab */}
          <TabsContent value="layout" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Layout Configuration</CardTitle>
                <CardDescription>
                  Control spacing, width, and alignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 mb-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ <strong>Active:</strong> Layout settings are fully functional and applied to your landing page in real-time.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-width">
                    Container Width
                    <HelpTooltip content="Maximum width of content containers" />
                  </Label>
                  <Select
                    value={safeSettings.layout.maxWidth}
                    onValueChange={(value: 'full' | 'container' | 'narrow') => 
                      updateSettings('layout.maxWidth', value)
                    }
                  >
                    <SelectTrigger id="max-width">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Width (100%)</SelectItem>
                      <SelectItem value="container">Container (1280px)</SelectItem>
                      <SelectItem value="narrow">Narrow (1024px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spacing">
                    Section Spacing
                    <HelpTooltip content="Vertical spacing between sections" />
                  </Label>
                  <Select
                    value={safeSettings.layout.spacing}
                    onValueChange={(value: 'compact' | 'normal' | 'relaxed') => 
                      updateSettings('layout.spacing', value)
                    }
                  >
                    <SelectTrigger id="spacing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact (2rem)</SelectItem>
                      <SelectItem value="normal">Normal (4rem)</SelectItem>
                      <SelectItem value="relaxed">Relaxed (6rem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Settings Tab */}
          <TabsContent value="performance" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Performance Optimization</CardTitle>
                <CardDescription>
                  Configure loading and caching strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Image Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically optimize and compress images
                    </p>
                  </div>
                  <Switch
                    checked={safeSettings.performance.imageOptimization}
                    onCheckedChange={(checked) => 
                      updateSettings('performance.imageOptimization', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lazy Loading</Label>
                    <p className="text-sm text-muted-foreground">
                      Load images and content as they enter viewport
                    </p>
                  </div>
                  <Switch
                    checked={safeSettings.performance.lazyLoading}
                    onCheckedChange={(checked) => 
                      updateSettings('performance.lazyLoading', checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cache-strategy">
                    Cache Strategy
                    <HelpTooltip content="How aggressively to cache content" />
                  </Label>
                  <Select
                    value={safeSettings.performance.cacheStrategy}
                    onValueChange={(value: 'aggressive' | 'normal' | 'minimal') => 
                      updateSettings('performance.cacheStrategy', value)
                    }
                  >
                    <SelectTrigger id="cache-strategy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aggressive">Aggressive (1 hour)</SelectItem>
                      <SelectItem value="normal">Normal (5 minutes)</SelectItem>
                      <SelectItem value="minimal">Minimal (1 minute)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>
                  Custom code and third-party integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="custom-css">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        Custom CSS
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-4">
                      <Label htmlFor="custom-css">
                        Add custom CSS styles
                        <HelpTooltip content="These styles will be applied to your landing page in real-time" />
                      </Label>
                      <Textarea
                        id="custom-css"
                        value={safeSettings.advanced?.customCSS || ''}
                        onChange={(e) => updateSettings('advanced.customCSS', e.target.value)}
                        placeholder=".my-custom-class { color: red; }"
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-green-600 dark:text-green-500">
                        ✅ Custom CSS is applied to your landing page in real-time.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="custom-js">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Custom JavaScript
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-4">
                      <Label htmlFor="custom-js">
                        Add custom JavaScript
                        <HelpTooltip content="This code will run on your landing page" />
                      </Label>
                      <Textarea
                        id="custom-js"
                        value={safeSettings.advanced?.customJS || ''}
                        onChange={(e) => updateSettings('advanced.customJS', e.target.value)}
                        placeholder="console.log('Hello World');"
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-green-600 dark:text-green-500">
                        ✅ Custom JavaScript is executed on your landing page.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="analytics">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Analytics Integration
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="ga-id">Google Analytics ID</Label>
                        <Input
                          id="ga-id"
                          value={safeSettings.advanced?.analyticsId || ''}
                          onChange={(e) => updateSettings('advanced.analyticsId', e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gtm-id">Google Tag Manager ID</Label>
                        <Input
                          id="gtm-id"
                          value={safeSettings.advanced?.gtmId || ''}
                          onChange={(e) => updateSettings('advanced.gtmId', e.target.value)}
                          placeholder="GTM-XXXXXXX"
                        />
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        ✅ Analytics scripts are injected into your landing page.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="third-party">
                    <AccordionTrigger>Third-Party Scripts</AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-4">
                      <Label htmlFor="third-party-scripts">
                        Script URLs (one per line)
                        <HelpTooltip content="External scripts to load on your page" />
                      </Label>
                      <Textarea
                        id="third-party-scripts"
                        value={safeSettings.advanced?.thirdPartyScripts?.join('\n') || ''}
                        onChange={(e) => 
                          updateSettings('advanced.thirdPartyScripts', e.target.value.split('\n').filter(Boolean))
                        }
                        placeholder="https://example.com/script.js"
                        rows={4}
                      />
                      <p className="text-xs text-green-600 dark:text-green-500">
                        ✅ Third-party scripts are loaded on your landing page.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Helper Components

function HelpTooltip({ content }: { content: string }) {
  return (
    <span className="inline-flex items-center ml-1" title={content}>
      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
    </span>
  );
}





