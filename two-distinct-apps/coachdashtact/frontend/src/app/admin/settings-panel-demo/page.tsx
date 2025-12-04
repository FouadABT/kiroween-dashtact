'use client';

import React, { useState } from 'react';
import { SettingsPanel } from '@/components/landing/SettingsPanel';
import type { LandingSettings } from '@/types/landing-cms';

const DEFAULT_SETTINGS: LandingSettings = {
  general: {
    title: 'My Awesome Landing Page',
    description: 'A beautiful landing page built with our CMS',
    favicon: '/favicon.ico',
    language: 'en',
  },
  seo: {
    ogTitle: 'My Awesome Landing Page',
    ogDescription: 'A beautiful landing page built with our CMS',
    ogImage: 'https://example.com/og-image.jpg',
    twitterCard: 'summary_large_image',
    structuredData: true,
  },
  theme: {
    mode: 'auto',
    colors: {
      primary: { light: '#0ea5e9', dark: '#38bdf8' },
      secondary: { light: '#06b6d4', dark: '#22d3ee' },
      accent: { light: '#3b82f6', dark: '#60a5fa' },
    },
  },
  layout: {
    containerWidth: 'standard',
    sectionSpacing: 'normal',
    contentAlignment: 'center',
  },
  performance: {
    imageOptimization: true,
    lazyLoading: true,
    cacheStrategy: 'normal',
  },
  advanced: {
    customCSS: '',
    customJS: '',
    analyticsId: '',
    gtmId: '',
    thirdPartyScripts: [],
  },
};

export default function SettingsPanelDemoPage() {
  const [settings, setSettings] = useState<LandingSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    console.log('Settings saved:', settings);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-border p-4">
        <h1 className="text-2xl font-bold">Settings Panel Demo</h1>
        <p className="text-sm text-muted-foreground">
          Comprehensive settings interface with all configuration options
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onSave={handleSave}
          onReset={handleReset}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
