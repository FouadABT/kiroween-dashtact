'use client';

import Image from 'next/image';
import { CustomPage } from '@/types/pages';
import { getImageUrl } from '@/lib/image-proxy';
import { Calendar, Clock } from 'lucide-react';

interface PageHeaderProps {
  page: CustomPage;
}

export function PageHeader({ page }: PageHeaderProps) {
  const hasFeaturedImage = !!page.featuredImage;

  if (hasFeaturedImage) {
    // Hero-style header with featured image
    return (
      <header className="page-header relative -mt-4">
        {/* Featured Image Background */}
        <div className="relative w-full h-[70vh] min-h-[500px] max-h-[700px]">
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(page.featuredImage!)}
              alt={page.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {/* Gradient Overlay - Stronger at bottom for text */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
          </div>

          {/* Content Overlay - Centered */}
          <div className="relative h-full flex items-center justify-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="max-w-4xl mx-auto">
                {/* Title */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 lg:mb-8 drop-shadow-2xl leading-tight">
                  {page.title}
                </h1>

                {/* Excerpt */}
                {page.excerpt && (
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-8 leading-relaxed drop-shadow-lg font-light">
                    {page.excerpt}
                  </p>
                )}

                {/* Metadata */}
                {(page.publishedAt || page.updatedAt) && (
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base">
                    {page.publishedAt && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 text-white/90 border border-white/20">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={page.publishedAt}>
                          {new Date(page.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    )}
                    {page.updatedAt && page.updatedAt !== page.publishedAt && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 text-white/90 border border-white/20">
                        <Clock className="h-4 w-4" />
                        <span>
                          Updated {new Date(page.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Standard header without featured image
  return (
    <header className="page-header border-b bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Title and Excerpt */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            {page.title}
          </h1>

          {page.excerpt && (
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-8">
              {page.excerpt}
            </p>
          )}

          {/* Metadata */}
          {(page.publishedAt || page.updatedAt) && (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base text-muted-foreground">
              {page.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={page.publishedAt}>
                    {new Date(page.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              )}
              {page.updatedAt && page.updatedAt !== page.publishedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Updated {new Date(page.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
