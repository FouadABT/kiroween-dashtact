'use client';

/**
 * Landing Page Component
 * 
 * Main landing page component that fetches content from API and renders sections dynamically.
 * This is the entry point for the public-facing landing page.
 */

'use client';

import { useEffect, useState } from 'react';
import { LandingLayout } from './LandingLayout';
import { LandingPageSection, LandingPageContent } from '@/types/landing-page';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { FooterSection } from './sections/FooterSection';
import { CtaSection } from './sections/CtaSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { StatsSection } from './sections/StatsSection';
import { ContentSection } from './sections/ContentSection';
import { BlogPostsSection } from './sections/BlogPostsSection';
import { PagesSection } from './sections/PagesSection';
import { ProductsSection } from './sections/ProductsSection';
import { useLandingSettings } from '@/hooks/use-landing-settings';
import type { LandingSettings } from '@/types/landing-cms';

export function LandingPage() {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [settings, setSettings] = useState<LandingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply settings to the page
  useLandingSettings(settings);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        // Fetch content and settings in parallel
        const [contentResponse, settingsResponse] = await Promise.all([
          fetch(`${apiUrl}/landing`),
          fetch(`${apiUrl}/landing/settings`).catch(() => null),
        ]);
        
        if (!contentResponse.ok) {
          throw new Error('Failed to fetch landing page content');
        }
        
        const contentData = await contentResponse.json();
        setContent(contentData);

        // Settings are optional (may require auth)
        if (settingsResponse?.ok) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData);
        }
      } catch (err) {
        console.error('Error fetching landing page data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <LandingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </LandingLayout>
    );
  }

  // Error state
  if (error || !content) {
    return (
      <LandingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Unable to Load Page</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'Content not available'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </LandingLayout>
    );
  }

  // Filter and sort sections
  const enabledSections = content.sections
    .filter((section: LandingPageSection) => section.enabled)
    .sort((a: LandingPageSection, b: LandingPageSection) => a.order - b.order);

  // Apply global settings
  const maxWidth = content.settings?.layout?.maxWidth || 'container';
  const maxWidthClass = maxWidth === 'full' 
    ? 'w-full px-0' 
    : maxWidth === 'narrow'
    ? 'max-w-4xl mx-auto px-4'
    : 'max-w-7xl mx-auto px-4'; // container (default)

  const spacing = content.settings?.layout?.spacing || 'normal';
  const spacingClass = spacing === 'compact'
    ? 'space-y-8'
    : spacing === 'relaxed'
    ? 'space-y-24'
    : 'space-y-16'; // normal

  return (
    <LandingLayout>
      <div className={spacingClass}>
        {enabledSections.map((section: LandingPageSection) => {
          // Render section based on type
          switch (section.type) {
            case 'hero':
              return <HeroSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'features':
              return <FeaturesSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'footer':
              return <FooterSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'cta':
              return <CtaSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'testimonials':
              return <TestimonialsSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'stats':
              return <StatsSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'content':
              return <ContentSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'blog-posts':
              return <BlogPostsSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'pages':
              return <PagesSection key={section.id} section={section} maxWidth={maxWidth} />;
            case 'products':
              return <ProductsSection key={section.id} section={section} maxWidth={maxWidth} />;
            default:
              // Handle unknown section types gracefully
              console.warn(`Unknown section type: ${section.type}`);
              return null;
          }
        })}
      </div>
    </LandingLayout>
  );
}

