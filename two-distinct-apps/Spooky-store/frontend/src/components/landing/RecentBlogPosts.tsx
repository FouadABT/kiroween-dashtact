'use client';

/**
 * Recent Blog Posts Component
 * 
 * Displays recent blog posts on the landing page.
 * Shows 3 most recent published posts with featured images.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { BlogPost } from '@/types/blog';
import { getImageUrl } from '@/lib/image-proxy';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function RecentBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentPosts() {
      try {
        const response = await fetch(`${API_BASE_URL}/blog?limit=3&page=1`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Error fetching recent blog posts:', err);
        setError('Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentPosts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
            <p className="text-muted-foreground text-lg">
              Stay updated with our latest articles and insights
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    return null; // Don't show section if there are no posts or error
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with our latest articles, insights, and news
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {posts.map((post) => {
            const publishDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : null;

            return (
              <Card key={post.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                <Link href={`/blog/${post.slug}`} className="block">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={getImageUrl(post.featuredImage)}
                        alt={post.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                    </div>
                  )}

                  <CardHeader>
                    {/* Title */}
                    <h3 className="text-xl font-semibold line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>

                    {/* Date */}
                    {publishDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={post.publishedAt || undefined}>{publishDate}</time>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-grow">
                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    )}
                  </CardContent>

                  <CardFooter>
                    <span className="text-primary font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardFooter>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

