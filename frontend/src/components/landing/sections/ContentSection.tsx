/**
 * Content Section Component
 * 
 * Renders rich content section with optional image.
 */

'use client';

import Image from 'next/image';
import { LandingPageSection, ContentSectionData } from '@/types/landing-page';

interface ContentSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function ContentSection({ section, maxWidth = 'container' }: ContentSectionProps) {
  const data = section.data as ContentSectionData;

  // Determine if we have an image
  const hasImage = data.image && data.layout === 'two-column';

  // Determine container width based on global setting
  const getContainerClass = () => {
    // If section has specific contentWidth, use it; otherwise use global maxWidth
    if (data.contentWidth) {
      switch (data.contentWidth) {
        case 'full':
          return 'w-full';
        case 'wide':
          return 'max-w-6xl mx-auto';
        case 'narrow':
          return 'max-w-3xl mx-auto';
        case 'standard':
        default:
          return 'max-w-4xl mx-auto';
      }
    }
    
    // Use global maxWidth setting
    return maxWidth === 'full'
      ? 'w-full'
      : maxWidth === 'narrow'
      ? 'max-w-4xl mx-auto'
      : 'max-w-7xl mx-auto'; // container (default)
  };

  // Determine image position classes
  const getLayoutClasses = () => {
    if (!hasImage) {
      return getContainerClass();
    }

    const baseClasses = 'grid grid-cols-1 md:grid-cols-2 gap-8 items-center';
    const containerClass = getContainerClass();
    
    if (data.imagePosition === 'right') {
      return `${containerClass} ${baseClasses}`;
    } else if (data.imagePosition === 'left') {
      return `${containerClass} ${baseClasses} md:grid-flow-dense`;
    }
    
    return `${containerClass} ${baseClasses}`;
  };

  // Generate unique section ID for CSS scoping
  const sectionId = `content-section-${section.id}`;

  return (
    <section 
      id={sectionId}
      data-section-type="content" 
      className="py-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Custom CSS scoped to this section */}
      {data.customCSS && (
        <style dangerouslySetInnerHTML={{ 
          __html: `#${sectionId} { ${data.customCSS} }` 
        }} />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Title (optional) */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              {data.title}
            </h2>
          </div>
        )}

        {/* Content Layout */}
        <div className={getLayoutClasses()}>
          {/* Image (if two-column and image exists) */}
          {hasImage && data.imagePosition !== 'top' && data.imagePosition !== 'bottom' && (
            <div className={`relative aspect-video rounded-lg overflow-hidden ${
              data.imagePosition === 'left' ? 'md:col-start-1' : 'md:col-start-2'
            }`}>
              <Image
                src={data.image!}
                alt={data.title || 'Content image'}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Text Content */}
          <div className={`prose prose-lg max-w-none ${
            hasImage && data.imagePosition === 'left' ? 'md:col-start-2' : ''
          }`}>
            {/* Image at top */}
            {hasImage && data.imagePosition === 'top' && (
              <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image
                  src={data.image!}
                  alt={data.title || 'Content image'}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Render content as HTML (sanitized on backend) */}
            <div
              className="text-foreground content-html"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />

            {/* Image at bottom */}
            {hasImage && data.imagePosition === 'bottom' && (
              <div className="relative aspect-video rounded-lg overflow-hidden mt-8">
                <Image
                  src={data.image!}
                  alt={data.title || 'Content image'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
