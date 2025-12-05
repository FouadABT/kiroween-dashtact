import Image from 'next/image';
import Link from 'next/link';
import { BlogPost as BlogPostType } from '@/types/blog';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { getImageUrl } from '@/lib/image-proxy';

/**
 * Blog Post Component
 * 
 * Displays a full blog post with:
 * - Breadcrumb navigation
 * - Featured image
 * - Title and metadata
 * - Full content (markdown rendered)
 * - Author information
 * - Categories and tags
 * - Back to blog link
 * 
 * @param post - Blog post data
 */

interface BlogPostProps {
  post: BlogPostType;
}

export function BlogPost({ post }: BlogPostProps) {
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const authorName = post.author?.name || post.authorName || 'Anonymous';

  return (
    <article className="pb-16">
      {/* Header with Breadcrumb */}
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumb
            dynamicValues={{
              postTitle: post.title,
            }}
          />
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
          <Image
            src={getImageUrl(post.featuredImage)}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        </div>
      )}

      {/* Content Container */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b">
            {/* Author */}
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{authorName}</span>
            </div>

            {/* Publish Date */}
            {publishDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <time dateTime={post.publishedAt || undefined}>{publishDate}</time>
              </div>
            )}
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-xl text-muted-foreground mb-8 pb-8 border-b italic">
              {post.excerpt}
            </div>
          )}

          {/* Content - Render HTML directly */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-sm px-3 py-1 bg-muted text-foreground rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back Button (Bottom) */}
          <div className="mt-12 pt-8 border-t">
            <Button variant="outline" asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
