'use client';

/**
 * Theme-Aware Section Component
 * Example of a landing page section that adapts to light/dark themes
 */

import React from 'react';
import { useLandingTheme } from '@/contexts/LandingThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ThemeAwareSectionProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: {
    light?: string;
    dark?: string;
  };
  brandColors?: {
    light: {
      primary: string;
      secondary: string;
    };
    dark: {
      primary: string;
      secondary: string;
    };
  };
}

export function ThemeAwareSection({
  title,
  description,
  ctaText = 'Get Started',
  ctaLink = '#',
  backgroundImage,
  brandColors,
}: ThemeAwareSectionProps) {
  const { resolvedTheme } = useLandingTheme();

  // Get theme-specific values
  const currentBgImage = resolvedTheme === 'light' 
    ? backgroundImage?.light 
    : backgroundImage?.dark;

  const currentColors = resolvedTheme === 'light'
    ? brandColors?.light
    : brandColors?.dark;

  return (
    <section
      className="relative py-20 px-4 transition-colors duration-300"
      style={{
        backgroundImage: currentBgImage ? `url(${currentBgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      {currentBgImage && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}

      {/* Content */}
      <div className="relative container mx-auto max-w-4xl text-center space-y-6">
        {/* Theme Indicator Badge */}
        <Badge variant="outline" className="mb-4">
          {resolvedTheme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </Badge>

        {/* Title */}
        <h2 
          className="text-4xl md:text-5xl font-bold tracking-tight transition-colors"
          style={{
            color: currentColors?.primary,
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p 
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          style={{
            color: currentColors?.secondary,
          }}
        >
          {description}
        </p>

        {/* CTA Button */}
        <div className="pt-4">
          <Button
            size="lg"
            asChild
            className="transition-all duration-300"
            style={{
              backgroundColor: currentColors?.primary,
              color: resolvedTheme === 'light' ? '#ffffff' : '#000000',
            }}
          >
            <a href={ctaLink}>{ctaText}</a>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          {[
            { icon: '🎨', title: 'Theme Aware', desc: 'Adapts to light/dark mode' },
            { icon: '🖼️', title: 'Smart Images', desc: 'Different images per theme' },
            { icon: '🎯', title: 'Brand Colors', desc: 'Uses brand color palette' },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-card border border-border transition-colors duration-300"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Example usage with branding integration
 */
export function ThemeAwareSectionExample() {
  return (
    <ThemeAwareSection
      title="Build Amazing Landing Pages"
      description="Create beautiful, theme-aware landing pages that automatically adapt to your visitors' preferences and your brand identity."
      ctaText="Start Building"
      ctaLink="/admin/landing-editor"
      backgroundImage={{
        light: '/images/hero-light.jpg',
        dark: '/images/hero-dark.jpg',
      }}
      brandColors={{
        light: {
          primary: 'hsl(222.2 47.4% 11.2%)',
          secondary: 'hsl(215.4 16.3% 46.9%)',
        },
        dark: {
          primary: 'hsl(210 40% 98%)',
          secondary: 'hsl(215 20.2% 65.1%)',
        },
      }}
    />
  );
}
