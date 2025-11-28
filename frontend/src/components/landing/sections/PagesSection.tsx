'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingPageSection, PagesSectionData, CustomPage } from '@/types/landing-page';

interface PagesSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function PagesSection({ section, maxWidth = 'container' }: PagesSectionProps) {
  const data = section.data as PagesSectionData;
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPages() {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          limit: (data.pageCount || 6).toString(),
        });

        if (data.filterByParent) {
          params.append('parentPageId', data.filterByParent);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pages?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch pages');
        }

        const result = await response.json();
        // API may return { pages: [...], pagination: {...} } or { data: [...] } or array directly
        setPages(result.pages || result.data || (Array.isArray(result) ? result : []));
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pages');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPages();
  }, [data.pageCount, data.filterByParent]);

  const maxWidthClass =
    maxWidth === 'full'
      ? 'w-full px-0'
      : maxWidth === 'narrow'
      ? 'max-w-4xl mx-auto px-4'
      : 'max-w-7xl mx-auto px-4';

  const gridColsClass =
    data.layout === 'grid' || data.layout === 'cards'
      ? data.columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : data.columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      : '';

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className={maxWidthClass}>
          {(data.title || data.subtitle) && (
            <div className="text-center mb-12">
              {data.title && (
                <Skeleton className="h-10 w-64 mx-auto mb-4" />
              )}
              {data.subtitle && (
                <Skeleton className="h-6 w-96 mx-auto" />
              )}
            </div>
          )}
          <div className={cn('grid gap-6', gridColsClass)}>
            {Array.from({ length: data.pageCount }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                {data.showImage && <Skeleton className="w-full aspect-video" />}
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  {data.showExcerpt && (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className={maxWidthClass}>
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (pages.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className={maxWidthClass}>
          {(data.title || data.subtitle) && (
            <div className="text-center mb-12">
              {data.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{data.title}</h2>
              )}
              {data.subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {data.subtitle}
                </p>
              )}
            </div>
          )}
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">No pages available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  // Render page card
  const renderPageCard = (page: CustomPage) => (
    <Card
      key={page.id}
      className={cn(
        'overflow-hidden hover:shadow-lg transition-all duration-300 group',
        data.layout === 'list' && 'flex flex-col md:flex-row'
      )}
    >
      {data.showImage && page.featuredImage && (
        <Link
          href={`/${page.slug}`}
          className={cn(
            'relative block overflow-hidden',
            data.layout === 'list' ? 'md:w-1/3' : 'w-full aspect-video'
          )}
        >
          <Image
            src={page.featuredImage}
            alt={page.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      )}
      <div className={cn('p-6', data.layout === 'list' && 'md:flex-1')}>
        {/* Title */}
        <Link href={`/${page.slug}`}>
          <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {page.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {data.showExcerpt && page.excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">{page.excerpt}</p>
        )}

        {/* Learn more link */}
        <Link
          href={`/${page.slug}`}
          className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
        >
          Learn More
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );

  return (
    <section className="py-16 bg-background">
      <div className={maxWidthClass}>
        {/* Section header */}
        {(data.title || data.subtitle) && (
          <div className="text-center mb-12">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{data.title}</h2>
            )}
            {data.subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Pages grid/list */}
        <div
          className={cn(
            'gap-6',
            data.layout === 'list' ? 'space-y-6' : `grid ${gridColsClass}`
          )}
        >
          {pages.map((page) => renderPageCard(page))}
        </div>

        {/* CTA button */}
        {data.ctaText && (
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/pages">
                {data.ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
