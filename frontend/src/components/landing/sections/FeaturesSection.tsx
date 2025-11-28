/**
 * Features Section Component
 * 
 * Renders the features section with title, subtitle, and feature cards.
 */

'use client';

import { LandingPageSection, FeaturesSectionData } from '@/types/landing-page';
import * as Icons from 'lucide-react';

interface FeaturesSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function FeaturesSection({ section, maxWidth = 'container' }: FeaturesSectionProps) {
  const data = section.data as FeaturesSectionData;

  // Sort features by order
  const sortedFeatures = [...(data.features || [])].sort((a, b) => a.order - b.order);

  // Determine layout classes
  const layoutClass = data.layout === 'list' 
    ? 'flex flex-col space-y-8'
    : data.layout === 'carousel'
    ? 'flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4'
    : `grid grid-cols-1 md:grid-cols-${data.columns} gap-8`;

  // Get icon component
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-8 h-8" /> : null;
  };

  return (
    <section data-section-type="features" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title and Subtitle */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Features Grid/List/Carousel */}
        <div className={layoutClass}>
          {sortedFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`${
                data.layout === 'carousel' ? 'flex-shrink-0 w-80 snap-center' : ''
              } p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow`}
            >
              {/* Icon */}
              <div className="mb-4 text-primary">
                {getIcon(feature.icon)}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
