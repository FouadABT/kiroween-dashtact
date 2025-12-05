/**
 * Hero Section Component
 * 
 * Stunning hero section with gradient background, animated elements, and dark mode support.
 */

'use client';

import Link from 'next/link';
import { LandingPageSection, HeroSectionData } from '@/types/landing-page';
import { resolveCtaLink } from '@/lib/landing-helpers';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function HeroSection({ section, maxWidth = 'container' }: HeroSectionProps) {
  const data = section.data as HeroSectionData;

  // Determine height class
  const heightClass = {
    small: 'min-h-[500px]',
    medium: 'min-h-[600px]',
    large: 'min-h-[700px]',
    'extra-large': 'min-h-[800px]',
    full: 'min-h-screen',
  }[data.height] || 'min-h-[700px]';

  // Determine text alignment class
  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[data.textAlignment] || 'text-center items-center';

  // Determine container width class based on global setting
  const containerClass = maxWidth === 'full'
    ? 'w-full'
    : maxWidth === 'narrow'
    ? 'max-w-4xl mx-auto'
    : 'max-w-7xl mx-auto'; // container (default)

  return (
    <section
      data-section-type="hero"
      className={`relative ${heightClass} flex flex-col justify-center overflow-hidden`}
    >
      {/* Animated gradient background - works in both light and dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-primary/20 dark:via-background dark:to-secondary/20" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      
      {/* Gradient orbs for visual interest */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content - Respects global width setting */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className={`${containerClass} flex flex-col ${alignmentClass} gap-8`}>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80">
              {data.headline}
            </span>
          </h1>
          
          {/* Subheadline */}
          {data.subheadline && (
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-4xl leading-relaxed">
              {data.subheadline}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            {/* Primary CTA */}
            {data.primaryCta && (
              <Link
                href={resolveCtaLink(data.primaryCta)}
                className="group inline-flex items-center justify-center px-10 py-5 text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-2xl hover:shadow-primary/50 hover:scale-105 gap-3"
              >
                <span>{data.primaryCta.text}</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {/* Secondary CTA */}
            {data.secondaryCta && (
              <Link
                href={resolveCtaLink(data.secondaryCta)}
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold rounded-xl bg-card/80 dark:bg-card/50 text-foreground hover:bg-card transition-all duration-200 border-2 border-border/50 backdrop-blur-sm hover:scale-105 gap-3"
              >
                <span>{data.secondaryCta.text}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
