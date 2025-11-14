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

export function LandingPage() {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landing`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch landing page content');
        }
        
        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error('Error fetching landing page content:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
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
  const maxWidthClass = content.settings?.layout?.maxWidth === 'full' 
    ? 'max-w-full' 
    : content.settings?.layout?.maxWidth === 'narrow'
    ? 'max-w-4xl'
    : 'max-w-7xl';

  const spacingClass = content.settings?.layout?.spacing === 'compact'
    ? 'space-y-8'
    : content.settings?.layout?.spacing === 'relaxed'
    ? 'space-y-24'
    : 'space-y-16';

  return (
    <LandingLayout>
      <div className={`${maxWidthClass} mx-auto ${spacingClass}`}>
        {enabledSections.map((section: LandingPageSection) => {
          // Render section based on type
          switch (section.type) {
            case 'hero':
              return <HeroSection key={section.id} section={section} />;
            case 'features':
              return <FeaturesSection key={section.id} section={section} />;
            case 'footer':
              return <FooterSection key={section.id} section={section} />;
            case 'cta':
              return <CtaSection key={section.id} section={section} />;
            case 'testimonials':
              return <TestimonialsSection key={section.id} section={section} />;
            case 'stats':
              return <StatsSection key={section.id} section={section} />;
            case 'content':
              return <ContentSection key={section.id} section={section} />;
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
