/**
 * Hero Section Component
 * 
 * Renders the hero section with headline, subheadline, CTA buttons, and background.
 */

'use client';

import Link from 'next/link';
import { LandingPageSection, HeroSectionData } from '@/types/landing-page';
import { resolveCtaLink } from '@/lib/landing-helpers';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard } from 'lucide-react';

interface HeroSectionProps {
  section: LandingPageSection;
}

export function HeroSection({ section }: HeroSectionProps) {
  const data = section.data as HeroSectionData;
  const { isAuthenticated, isLoading } = useAuth();

  // Determine background style
  const getBackgroundStyle = () => {
    if (data.backgroundType === 'image' && data.backgroundImage) {
      return {
        backgroundImage: `url(${data.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else if (data.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${data.backgroundColor || 'hsl(var(--primary))'} 0%, hsl(var(--secondary)) 100%)`,
      };
    } else if (data.backgroundType === 'solid') {
      return {
        backgroundColor: data.backgroundColor || 'hsl(var(--background))',
      };
    }
    return {};
  };

  // Determine height class
  const heightClass = {
    small: 'min-h-[400px]',
    medium: 'min-h-[500px]',
    large: 'min-h-[600px]',
    full: 'min-h-screen',
  }[data.height] || 'min-h-[500px]';

  // Determine text alignment class
  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[data.textAlignment] || 'text-center items-center';

  return (
    <section
      data-section-type="hero"
      className={`relative ${heightClass} flex flex-col justify-center px-4 sm:px-6 lg:px-8`}
      style={getBackgroundStyle()}
    >
      {/* Overlay for better text readability on images */}
      {data.backgroundType === 'image' && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      <div className={`relative z-10 max-w-7xl mx-auto w-full flex flex-col ${alignmentClass}`}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground">
          {data.headline}
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl">
          {data.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Show Dashboard button for authenticated users */}
          {!isLoading && isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors gap-2"
            >
              <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              {/* Primary CTA */}
              <Link
                href={resolveCtaLink(data.primaryCta)}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {data.primaryCta.text}
              </Link>

              {/* Secondary CTA (optional) */}
              {data.secondaryCta && (
                <Link
                  href={resolveCtaLink(data.secondaryCta)}
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  {data.secondaryCta.text}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
