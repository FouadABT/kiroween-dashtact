/**
 * Stats Section Component
 * 
 * Renders statistics section with key metrics and values.
 */

'use client';

import { LandingPageSection, StatsSectionData } from '@/types/landing-page';
import { getIconByName } from '@/lib/icon-loader';

interface StatsSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function StatsSection({ section, maxWidth = 'container' }: StatsSectionProps) {
  const data = section.data as StatsSectionData;

  // Sort stats by order
  const sortedStats = [...data.stats].sort((a, b) => a.order - b.order);

  // Determine layout classes
  const layoutClass = data.layout === 'horizontal'
    ? 'flex flex-wrap justify-center gap-8'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8';

  return (
    <section data-section-type="stats" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title (optional) */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              {data.title}
            </h2>
          </div>
        )}

        {/* Stats Grid/Horizontal */}
        <div className={layoutClass}>
          {sortedStats.map((stat) => {
            const IconComponent = stat.icon ? getIconByName(stat.icon) : null;
            const statKey = `stat-${stat.id || stat.label}`;
            
            return (
              <div
                key={statKey}
                className="text-center p-6"
              >
                {/* Icon (optional) */}
                {IconComponent && (
                  <div className="mb-4 text-primary flex justify-center">
                    <IconComponent className="w-8 h-8" />
                  </div>
                )}

                {/* Value */}
                <div className="text-4xl sm:text-5xl font-bold mb-2 text-foreground">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
