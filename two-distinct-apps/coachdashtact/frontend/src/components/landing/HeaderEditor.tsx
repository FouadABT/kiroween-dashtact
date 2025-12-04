'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { HeaderConfig, NavigationItem, CTAButton } from '@/types/landing-cms';
import { Upload, Plus, Trash2, GripVertical, ChevronDown, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HeaderPreview } from './HeaderFooterPreview';

interface HeaderEditorProps {
  config: HeaderConfig;
  onChange: (config: HeaderConfig) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export function HeaderEditor({ config, onChange, onSave, isSaving = false }: HeaderEditorProps) {
  const [activeTab, setActiveTab] = useState('logo');

  const updateConfig = (updates: Partial<HeaderConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleSave = async () => {
    try {
      await onSave();
      toast.success('Header configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save header configuration');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Header Editor</h2>
          <p className="text-sm text-muted-foreground">Customize your site header</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-background px-4">
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="ctas">CTAs</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Live Preview */}
          <HeaderPreview config={config} />

          {/* Logo Tab */}
          <TabsContent value="logo" className="mt-0 space-y-4">
            <LogoTab config={config} onChange={updateConfig} />
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="mt-0 space-y-4">
            <NavigationTab config={config} onChange={updateConfig} />
          </TabsContent>

          {/* CTAs Tab */}
          <TabsContent value="ctas" className="mt-0 space-y-4">
            <CTAsTab config={config} onChange={updateConfig} />
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="mt-0 space-y-4">
            <StyleTab config={config} onChange={updateConfig} />
          </TabsContent>

          {/* Mobile Tab */}
          <TabsContent value="mobile" className="mt-0 space-y-4">
            <MobileTab config={config} onChange={updateConfig} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Logo Tab Component
function LogoTab({
  config,
  onChange,
}: {
  config: HeaderConfig;
  onChange: (updates: Partial<HeaderConfig>) => void;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Logo Configuration</h3>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Logos are automatically synced from <Link href="/dashboard/settings/branding" className="text-primary hover:underline">Branding Settings</Link>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Leave fields empty to use branding logos, or enter custom URLs to override
            </p>
          </div>
        </div>
        
        {/* Light Mode Logo */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="logo-light">Light Mode Logo</Label>
          <div className="flex gap-2">
            <Input
              id="logo-light"
              type="text"
              placeholder="https://example.com/logo-light.png"
              value={config.logoLight || ''}
              onChange={(e) => onChange({ logoLight: e.target.value })}
            />
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {config.logoLight && (
            <div className="mt-2 p-4 border border-border rounded-lg bg-background">
              <img src={config.logoLight} alt="Light logo" className="h-12 object-contain" />
            </div>
          )}
        </div>

        {/* Dark Mode Logo */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="logo-dark">Dark Mode Logo</Label>
          <div className="flex gap-2">
            <Input
              id="logo-dark"
              type="text"
              placeholder="https://example.com/logo-dark.png"
              value={config.logoDark || ''}
              onChange={(e) => onChange({ logoDark: e.target.value })}
            />
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {config.logoDark && (
            <div className="mt-2 p-4 border border-border rounded-lg bg-muted">
              <img src={config.logoDark} alt="Dark logo" className="h-12 object-contain" />
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Logo Size */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="logo-size">Logo Size</Label>
          <Select
            value={config.logoSize}
            onValueChange={(value: 'sm' | 'md' | 'lg') => onChange({ logoSize: value })}
          >
            <SelectTrigger id="logo-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logo Link */}
        <div className="space-y-2">
          <Label htmlFor="logo-link">Logo Link</Label>
          <Input
            id="logo-link"
            type="text"
            placeholder="/"
            value={config.logoLink}
            onChange={(e) => onChange({ logoLink: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Where the logo should link to (usually homepage)
          </p>
        </div>
      </div>
    </Card>
  );
}

// Navigation Tab Component
function NavigationTab({
  config,
  onChange,
}: {
  config: HeaderConfig;
  onChange: (updates: Partial<HeaderConfig>) => void;
}) {
  const addNavigationItem = () => {
    const newItem: NavigationItem = {
      label: 'New Link',
      link: '/',
      type: 'internal',
    };
    onChange({ navigation: [...config.navigation, newItem] });
  };

  const updateNavigationItem = (index: number, updates: Partial<NavigationItem>) => {
    const updated = [...config.navigation];
    updated[index] = { ...updated[index], ...updates };
    onChange({ navigation: updated });
  };

  const removeNavigationItem = (index: number) => {
    onChange({ navigation: config.navigation.filter((_, i) => i !== index) });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Navigation Menu</h3>
        <Button onClick={addNavigationItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      <div className="space-y-3">
        {config.navigation.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No navigation items yet</p>
            <p className="text-sm">Click "Add Link" to get started</p>
          </div>
        ) : (
          config.navigation.map((item, index) => (
            <Card key={index} className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Button variant="ghost" size="icon" className="cursor-move mt-1">
                  <GripVertical className="h-4 w-4" />
                </Button>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={item.label}
                        onChange={(e) => updateNavigationItem(index, { label: e.target.value })}
                        placeholder="Home"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link</Label>
                      <Input
                        value={item.link || ''}
                        onChange={(e) => updateNavigationItem(index, { link: e.target.value })}
                        placeholder="/"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={item.type}
                      onValueChange={(value: NavigationItem['type']) =>
                        updateNavigationItem(index, { type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal Link</SelectItem>
                        <SelectItem value="external">External Link</SelectItem>
                        <SelectItem value="dropdown">Dropdown Menu</SelectItem>
                        <SelectItem value="mega-menu">Mega Menu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNavigationItem(index)}
                  className="text-destructive hover:text-destructive mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}

// CTAs Tab Component
function CTAsTab({
  config,
  onChange,
}: {
  config: HeaderConfig;
  onChange: (updates: Partial<HeaderConfig>) => void;
}) {
  const addCTA = () => {
    const newCTA: CTAButton = {
      text: 'Get Started',
      link: '/signup',
      style: 'primary',
    };
    onChange({ ctas: [...config.ctas, newCTA] });
  };

  const updateCTA = (index: number, updates: Partial<CTAButton>) => {
    const updated = [...config.ctas];
    updated[index] = { ...updated[index], ...updates };
    onChange({ ctas: updated });
  };

  const removeCTA = (index: number) => {
    onChange({ ctas: config.ctas.filter((_, i) => i !== index) });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">CTA Buttons</h3>
        <Button onClick={addCTA} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add CTA
        </Button>
      </div>

      <div className="space-y-3">
        {config.ctas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No CTA buttons yet</p>
            <p className="text-sm">Click "Add CTA" to get started</p>
          </div>
        ) : (
          config.ctas.map((cta, index) => (
            <Card key={index} className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={cta.text}
                        onChange={(e) => updateCTA(index, { text: e.target.value })}
                        placeholder="Get Started"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link</Label>
                      <Input
                        value={cta.link}
                        onChange={(e) => updateCTA(index, { link: e.target.value })}
                        placeholder="/signup"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Style</Label>
                    <Select
                      value={cta.style}
                      onValueChange={(value: CTAButton['style']) =>
                        updateCTA(index, { style: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCTA(index)}
                  className="text-destructive hover:text-destructive mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}

// Style Tab Component
function StyleTab({
  config,
  onChange,
}: {
  config: HeaderConfig;
  onChange: (updates: Partial<HeaderConfig>) => void;
}) {
  const updateStyle = (updates: Partial<typeof config.style>) => {
    onChange({ style: { ...config.style, ...updates } });
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-base font-semibold">Header Style</h3>

      {/* Background Color */}
      <div className="space-y-2">
        <Label htmlFor="bg-color">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="bg-color"
            type="color"
            value={config.style.background}
            onChange={(e) => updateStyle({ background: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={config.style.background}
            onChange={(e) => updateStyle({ background: e.target.value })}
            placeholder="#ffffff"
          />
        </div>
      </div>

      <Separator />

      {/* Sticky Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Sticky Header</Label>
          <p className="text-sm text-muted-foreground">Header stays visible when scrolling</p>
        </div>
        <Switch
          checked={config.style.sticky}
          onCheckedChange={(checked) => updateStyle({ sticky: checked })}
        />
      </div>

      {config.style.sticky && (
        <div className="space-y-2">
          <Label>Sticky Behavior</Label>
          <Select
            value={config.style.stickyBehavior}
            onValueChange={(value: typeof config.style.stickyBehavior) =>
              updateStyle({ stickyBehavior: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">Always Visible</SelectItem>
              <SelectItem value="hide-on-scroll">Hide on Scroll Down</SelectItem>
              <SelectItem value="show-on-scroll-up">Show on Scroll Up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      {/* Transparent */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Transparent Background</Label>
          <p className="text-sm text-muted-foreground">Makes header background transparent</p>
        </div>
        <Switch
          checked={config.style.transparent}
          onCheckedChange={(checked) => updateStyle({ transparent: checked })}
        />
      </div>

      {/* Shadow */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Drop Shadow</Label>
          <p className="text-sm text-muted-foreground">Adds shadow below header</p>
        </div>
        <Switch
          checked={config.style.shadow}
          onCheckedChange={(checked) => updateStyle({ shadow: checked })}
        />
      </div>
    </Card>
  );
}

// Mobile Tab Component
function MobileTab({
  config,
  onChange,
}: {
  config: HeaderConfig;
  onChange: (updates: Partial<HeaderConfig>) => void;
}) {
  const updateMobileMenu = (updates: Partial<typeof config.mobileMenu>) => {
    onChange({ mobileMenu: { ...config.mobileMenu, ...updates } });
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-base font-semibold">Mobile Menu</h3>

      {/* Enable Mobile Menu */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Enable Mobile Menu</Label>
          <p className="text-sm text-muted-foreground">Show hamburger menu on mobile devices</p>
        </div>
        <Switch
          checked={config.mobileMenu.enabled}
          onCheckedChange={(checked) => updateMobileMenu({ enabled: checked })}
        />
      </div>

      {config.mobileMenu.enabled && (
        <>
          <Separator />

          {/* Icon Style */}
          <div className="space-y-2">
            <Label>Icon Style</Label>
            <Select
              value={config.mobileMenu.iconStyle}
              onValueChange={(value: typeof config.mobileMenu.iconStyle) =>
                updateMobileMenu({ iconStyle: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hamburger">Hamburger (≡)</SelectItem>
                <SelectItem value="dots">Dots (⋮)</SelectItem>
                <SelectItem value="menu">Menu Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animation */}
          <div className="space-y-2">
            <Label>Menu Animation</Label>
            <Select
              value={config.mobileMenu.animation}
              onValueChange={(value: typeof config.mobileMenu.animation) =>
                updateMobileMenu({ animation: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slide">Slide In</SelectItem>
                <SelectItem value="fade">Fade In</SelectItem>
                <SelectItem value="scale">Scale Up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </Card>
  );
}
