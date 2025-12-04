import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { Calendar, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { getImageUrl } from '@/lib/image-proxy';

/**
 * Blog Card Component
 * 
 * Displays a blog post preview card with:
 * - Featured image
 * - Title
 * - Excerpt
 * - Author information
 * - Publish date
 * - Categories/tags
 * 
 * @param post - Blog post data
 */

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean; // For above-the-fold images
}

export function BlogCard({ post, priority = false }: BlogCardProps) {
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const authorName = post.author?.name || post.authorName || 'Anonymous';

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={getImageUrl(post.featuredImage)}
              alt={post.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              quality={85}
              unoptimized
            />
          </div>
        )}

        <CardHeader>
          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h2>
        </CardHeader>

        <CardContent className="flex-grow">
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Link>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        {/* Author */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{authorName}</span>
        </div>

        {/* Publish Date */}
        {publishDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.publishedAt || undefined}>{publishDate}</time>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
