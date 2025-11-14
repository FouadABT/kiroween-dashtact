/**
 * Testimonials Section Component
 * 
 * Renders testimonials section with customer quotes and author information.
 */

'use client';

import Image from 'next/image';
import { LandingPageSection, TestimonialsSectionData } from '@/types/landing-page';

interface TestimonialsSectionProps {
  section: LandingPageSection;
}

export function TestimonialsSection({ section }: TestimonialsSectionProps) {
  const data = section.data as TestimonialsSectionData;

  // Sort testimonials by order
  const sortedTestimonials = [...data.testimonials].sort((a, b) => a.order - b.order);

  // Determine layout classes
  const layoutClass = data.layout === 'carousel'
    ? 'flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

  return (
    <section data-section-type="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
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

        {/* Testimonials Grid/Carousel */}
        <div className={layoutClass}>
          {sortedTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`${
                data.layout === 'carousel' ? 'flex-shrink-0 w-80 snap-center' : ''
              } p-6 rounded-lg border border-border bg-card`}
            >
              {/* Quote */}
              <blockquote className="text-card-foreground mb-6 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {testimonial.avatar && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Author Details */}
                <div>
                  <div className="font-semibold text-card-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                    {testimonial.company && ` at ${testimonial.company}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
