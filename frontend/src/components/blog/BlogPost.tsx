import Image from 'next/image';
import Link from 'next/link';
import { BlogPost as BlogPostType } from '@/types/blog';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Customize markdown rendering
                h1: ({ children }) => (
                  <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-xl font-bold mt-4 mb-2">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => {
                  // Ensure src is a string for Next.js Image component
                  const imageSrc: string = typeof src === 'string' ? src : '';
                  
                  // Skip rendering if no valid src
                  if (!imageSrc) {
                    return null;
                  }
                  
                  return (
                    <div className="relative w-full h-96 my-6">
                      <Image
                        src={imageSrc}
                        alt={alt || ''}
                        fill
                        className="object-contain rounded-lg"
                        sizes="(max-width: 768px) 100vw, 896px"
                      />
                    </div>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

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
