'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMonitor } from '@/components/landing/PerformanceMonitor';
import { AccessibilityChecker } from '@/components/landing/AccessibilityChecker';
import { ResponsiveControls, DevicePreview } from '@/components/landing/ResponsiveControls';
import { OptimizedImage, ResponsiveImage, LazyVideo } from '@/components/landing/OptimizedImage';
import { Activity, Eye, Smartphone, Image as ImageIcon } from 'lucide-react';
import type { ResponsiveValue } from '@/lib/responsive-utils';

export default function PerformanceAccessibilityDemo() {
  const [fontSize, setFontSize] = useState<ResponsiveValue<number>>({
    default: 16,
    mobile: 14,
    tablet: 16,
    desktop: 18,
    wide: 20,
  });

  const [padding, setPadding] = useState<ResponsiveValue<number>>({
    default: 16,
    mobile: 12,
    tablet: 16,
    desktop: 24,
    wide: 32,
  });

  // Sample content for accessibility checker
  const sampleContent = {
    images: [
      { src: '/image1.jpg', alt: 'Beautiful landscape' },
      { src: '/image2.jpg', alt: '' }, // Missing alt text
      { src: '/image3.jpg', alt: 'img' }, // Too short
    ],
    headings: [
      { level: 1, text: 'Main Title' },
      { level: 3, text: 'Skipped Level' }, // Skips h2
      { level: 3, text: 'Another Section' },
    ],
    forms: [
      {
        inputs: [
          { id: 'email', label: 'Email', required: true },
          { id: 'name', label: '', required: false }, // Missing label
          { id: 'phone', label: 'Phone Number', required: true },
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Performance, Accessibility & Responsive Design</h1>
        <p className="text-muted-foreground">
          Comprehensive tools for optimizing landing pages
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Eye className="h-4 w-4 mr-2" />
            Accessibility
          </TabsTrigger>
          <TabsTrigger value="responsive">
            <Smartphone className="h-4 w-4 mr-2" />
            Responsive
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="h-4 w-4 mr-2" />
            Images
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Performance Monitoring</h2>
            <p className="text-muted-foreground mb-6">
              Track Core Web Vitals and get optimization suggestions
            </p>
            <PerformanceMonitor
              onOptimizationSuggestion={(suggestions) => {
                console.log('Optimization suggestions:', suggestions);
              }}
            />
          </Card>

          {/* Performance Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Image Optimization</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Automatic WebP/AVIF conversion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Responsive image variants</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Blur placeholders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Lazy loading with intersection observer</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Code Optimization</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Critical CSS inlining</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Code splitting & lazy loading</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Font optimization (font-display: swap)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Deferred third-party scripts</span>
                </li>
              </ul>
            </Card>
          </div>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Accessibility Checker</h2>
            <p className="text-muted-foreground mb-6">
              Validate WCAG compliance and get improvement suggestions
            </p>
            <AccessibilityChecker
              content={sampleContent}
              onIssuesFound={(issues) => {
                console.log('Accessibility issues:', issues);
              }}
            />
          </Card>

          {/* Accessibility Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Automated Checks</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Alt text validation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Color contrast checking (WCAG AA/AAA)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Heading hierarchy validation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>ARIA attribute validation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Form accessibility checks</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Keyboard & Screen Reader</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Full keyboard navigation support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Focus trap for modals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Visible focus indicators</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>ARIA live regions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Reduced motion support</span>
                </li>
              </ul>
            </Card>
          </div>
        </TabsContent>

        {/* Responsive Tab */}
        <TabsContent value="responsive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Font Size Controls */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Font Size (Responsive)</h3>
              <ResponsiveControls
                value={fontSize}
                onChange={setFontSize}
                property="fontSize"
                unit="px"
              />
            </Card>

            {/* Padding Controls */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Padding (Responsive)</h3>
              <ResponsiveControls
                value={padding}
                onChange={setPadding}
                property="padding"
                unit="px"
              />
            </Card>
          </div>

          {/* Device Preview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Device Preview</h3>
            <DevicePreview device="iPhone 14 Pro" zoom={0.75}>
              <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <h1 className="text-4xl font-bold mb-4">Responsive Preview</h1>
                <p className="text-lg mb-6">
                  This content adapts to different screen sizes and devices.
                </p>
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold">
                  Call to Action
                </button>
              </div>
            </DevicePreview>
          </Card>

          {/* Responsive Features */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Responsive Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Breakpoint system (mobile, tablet, desktop, wide)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Per-breakpoint style overrides</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Device frame visualization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Responsive validation</span>
                </li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Touch target size validation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Horizontal scroll detection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Responsive image handling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Column stacking controls</span>
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Optimized Images</h2>
            <p className="text-muted-foreground mb-6">
              Automatic optimization with lazy loading and blur placeholders
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Optimized Image */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Standard Image</h3>
                <OptimizedImage
                  src="/placeholder.jpg"
                  alt="Optimized image example"
                  width={400}
                  height={300}
                  className="rounded-lg"
                  lazyLoad={true}
                  blurPlaceholder={true}
                />
              </div>

              {/* Responsive Image */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Responsive Image</h3>
                <ResponsiveImage
                  src={{
                    default: '/placeholder.jpg',
                    mobile: '/placeholder-mobile.jpg',
                    tablet: '/placeholder-tablet.jpg',
                    desktop: '/placeholder-desktop.jpg',
                  }}
                  alt="Responsive image example"
                  width={400}
                  height={300}
                  className="rounded-lg"
                  artDirection={true}
                />
              </div>
            </div>
          </Card>

          {/* Lazy Video */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Lazy-Loaded Video</h3>
            <LazyVideo
              src="/sample-video.mp4"
              poster="/video-poster.jpg"
              className="w-full rounded-lg"
              controls={true}
              captions={[
                {
                  src: '/captions-en.vtt',
                  label: 'English',
                  srclang: 'en',
                },
              ]}
            />
          </Card>

          {/* Image Features */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Image Optimization Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>WebP/AVIF format support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Automatic compression</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Multiple size variants</span>
                </li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Blur placeholders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Lazy loading</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Intersection observer</span>
                </li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Art direction support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Responsive srcsets</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Video lazy loading</span>
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
