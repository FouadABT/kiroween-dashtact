/**
 * CTA Section Component
 * 
 * Renders a call-to-action section with title, description, and CTA buttons.
 */

'use client';

import Link from 'next/link';
import { LandingPageSection, CtaSectionData } from '@/types/landing-page';
import { resolveCtaLink } from '@/lib/landing-helpers';

interface CtaSectionProps {
  section: LandingPageSection;
}

export function CtaSection({ section }: CtaSectionProps) {
  const data = section.data as CtaSectionData;

  // Determine alignment class
  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[data.alignment] || 'text-center items-center';

  return (
    <section
      data-section-type="cta"
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor,
      }}
    >
      <div className={`max-w-4xl mx-auto flex flex-col ${alignmentClass}`}>
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          {data.title}
        </h2>

        {/* Description */}
        <p className="text-lg sm:text-xl mb-8 opacity-90">
          {data.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
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
        </div>
      </div>
    </section>
  );
}
