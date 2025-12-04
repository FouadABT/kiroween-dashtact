'use client';

/**
 * Branding & Theme Demo Page
 * Demonstrates branding integration and theme mode features
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BrandingPanel } from '@/components/landing/BrandingPanel';
import { ThemePreview } from '@/components/landing/ThemePreview';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { BulkBrandingUpdate } from '@/components/landing/BulkBrandingUpdate';
import { LandingThemeProvider } from '@/contexts/LandingThemeContext';
import { Badge } from '@/components/ui/badge';
import { Palette, Moon, Sun, Sparkles } from 'lucide-react';

function DemoContent() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Palette className="h-8 w-8" />
          Branding & Theme Integration
        </h1>
        <p className="text-muted-foreground">
          Comprehensive branding and theme mode management for landing pages
        </p>
      </div>

      <Separator />

      {/* Main Content */}
      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4 mr-2" />
            Branding Panel
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Moon className="h-4 w-4 mr-2" />
            Theme Preview
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Sparkles className="h-4 w-4 mr-2" />
            Bulk Updates
          </TabsTrigger>
        </TabsList>

        {/* Branding Panel Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding Panel Component</CardTitle>
              <CardDescription>
                Displays current branding settings with sync and edit capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Panel */}
              <div>
                <h3 className="text-sm font-medium mb-3">Full Panel</h3>
                <BrandingPanel />
              </div>

              <Separator />

              {/* Compact Panel */}
              <div>
                <h3 className="text-sm font-medium mb-3">Compact Panel</h3>
                <BrandingPanel compact />
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">✓</Badge>
                    <div>
                      <p className="text-sm font-medium">Brand Display</p>
                      <p className="text-xs text-muted-foreground">
                        Shows brand name, logos, and social links
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">✓</Badge>
                    <div>
                      <p className="text-sm font-medium">Sync Button</p>
                      <p className="text-xs text-muted-foreground">
                        Syncs branding with landing pages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">✓</Badge>
                    <div>
                      <p className="text-sm font-medium">Edit Access</p>
                      <p className="text-xs text-muted-foreground">
                        Quick link to branding settings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">✓</Badge>
                    <div>
                      <p className="text-sm font-medium">Light/Dark Logos</p>
                      <p className="text-xs text-muted-foreground">
                        Displays both theme variants
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Preview Tab */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preview Component</CardTitle>
              <CardDescription>
                Side-by-side comparison of light and dark themes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ThemePreview>
                <div className="p-8 space-y-4">
                  <h2 className="text-2xl font-bold">Sample Landing Section</h2>
                  <p className="text-muted-foreground">
                    This is how your landing page will look in different theme modes.
                  </p>
                  <div className="flex gap-2">
                    <Badge>Feature 1</Badge>
                    <Badge variant="secondary">Feature 2</Badge>
                    <Badge variant="outline">Feature 3</Badge>
                  </div>
                </div>
              </ThemePreview>

              <Separator />

              {/* Theme Toggle Examples */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Theme Toggle Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Icon Only</p>
                    <ThemeToggle />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">With Label</p>
                    <ThemeToggle showLabel size="default" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Outline</p>
                    <ThemeToggle variant="outline" showLabel size="default" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Default</p>
                    <ThemeToggle variant="default" showLabel size="default" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Theme Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Sun className="h-4 w-4 mt-0.5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Light Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Optimized for daytime viewing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Moon className="h-4 w-4 mt-0.5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Reduced eye strain at night
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">Auto</Badge>
                    <div>
                      <p className="text-sm font-medium">System Detection</p>
                      <p className="text-xs text-muted-foreground">
                        Follows system preferences
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">Toggle</Badge>
                    <div>
                      <p className="text-sm font-medium">User Control</p>
                      <p className="text-xs text-muted-foreground">
                        Visitors can switch themes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Updates Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Branding Updates</CardTitle>
              <CardDescription>
                Apply branding to all landing pages at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Apply Branding to All Pages</p>
                  <p className="text-sm text-muted-foreground">
                    Updates all landing pages with current branding settings
                  </p>
                </div>
                <BulkBrandingUpdate />
              </div>

              <Separator />

              {/* What Gets Updated */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">What Gets Updated</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <p className="text-sm font-medium">Brand Name</p>
                      <p className="text-xs text-muted-foreground">
                        Updates brand name in all sections and SEO metadata
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <p className="text-sm font-medium">Logos</p>
                      <p className="text-xs text-muted-foreground">
                        Syncs light and dark mode logos in headers and footers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <p className="text-sm font-medium">Social Links</p>
                      <p className="text-xs text-muted-foreground">
                        Updates social media links in footer sections
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <div>
                      <p className="text-sm font-medium">Copyright</p>
                      <p className="text-xs text-muted-foreground">
                        Generates copyright text with current year and brand name
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function BrandingThemeDemoPage() {
  return (
    <LandingThemeProvider defaultMode="auto" enableToggle>
      <DemoContent />
    </LandingThemeProvider>
  );
}
