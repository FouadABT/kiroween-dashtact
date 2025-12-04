'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingPageSection, BlogPostsSectionData } from '@/types/landing-page';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  publishedAt: string;
  createdAt: string;
}

interface BlogPostsSectionProps {
  section: LandingPageSection;
  maxWidth?: 'full' | 'container' | 'narrow';
}

export function BlogPostsSection({ section, maxWidth = 'container' }: BlogPostsSectionProps) {
  const data = section.data as BlogPostsSectionData;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          status: 'PUBLISHED',
          limit: (data.postCount || 6).toString(),
        });

        if (data.filterByCategory) {
          params.append('category', data.filterByCategory);
        }

        if (data.filterByTag) {
          params.append('tag', data.filterByTag);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blog?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

        const result = await response.json();
        // API returns { posts: [...], pagination: {...} }
        setPosts(result.posts || result.data || result || []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [data.postCount, data.filterByCategory, data.filterByTag]);

  const maxWidthClass =
    maxWidth === 'full'
      ? 'w-full px-0'
      : maxWidth === 'narrow'
      ? 'max-w-4xl mx-auto px-4'
      : 'max-w-7xl mx-auto px-4';

  const gridColsClass =
    data.layout === 'grid'
      ? data.columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : data.columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      : '';

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
            {Array.from({ length: data.postCount }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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
  if (posts.length === 0) {
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
            <p className="text-muted-foreground text-lg">No blog posts available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  // Render blog post card
  const renderPostCard = (post: BlogPost) => (
    <Card
      key={post.id}
      className={cn(
        'overflow-hidden hover:shadow-lg transition-all duration-300 group',
        data.layout === 'list' && 'flex flex-col md:flex-row'
      )}
    >
      {post.featuredImage && (
        <Link
          href={`/blog/${post.slug}`}
          className={cn(
            'relative block overflow-hidden',
            data.layout === 'list' ? 'md:w-1/3' : 'w-full aspect-video'
          )}
        >
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      )}
      <div className={cn('p-6', data.layout === 'list' && 'md:flex-1')}>
        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
          {data.showDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
          )}
          {data.showAuthor && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author.name}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {data.showExcerpt && post.excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
        )}

        {/* Categories */}
        {data.showCategories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Tag className="h-3 w-3" />
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Read more link */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
        >
          Read More
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

        {/* Posts grid/list */}
        {data.layout === 'carousel' ? (
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {posts.map((post) => (
                <div key={post.id} className="flex-none w-full md:w-1/2 lg:w-1/3 snap-start">
                  {renderPostCard(post)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'gap-6',
              data.layout === 'grid' ? `grid ${gridColsClass}` : 'space-y-6'
            )}
          >
            {posts.map((post) => renderPostCard(post))}
          </div>
        )}

        {/* CTA button */}
        {data.ctaText && data.ctaLink && (
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href={data.ctaLink}>
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
