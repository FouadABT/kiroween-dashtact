import { Skeleton } from '@/components/ui/skeleton';

/**
 * Blog Post Loading State
 * 
 * Displayed while a blog post is being fetched.
 * Shows skeleton loaders for a better user experience.
 * 
 * Features:
 * - Skeleton loaders matching blog post layout
 * - Featured image placeholder
 * - Content structure preview
 * - Responsive design
 */

export default function BlogPostLoading() {
  return (
    <article className="pb-16">
      {/* Header with Breadcrumb Skeleton */}
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </header>

      {/* Featured Image Skeleton */}
      <Skeleton className="w-full h-[400px] md:h-[500px] lg:h-[600px]" />

      {/* Content Container */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button Skeleton */}
          <Skeleton className="h-9 w-32 mb-6" />

          {/* Category Badge Skeleton */}
          <Skeleton className="h-7 w-24 rounded-full mb-4" />

          {/* Title Skeleton */}
          <div className="space-y-3 mb-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>

          {/* Metadata Skeleton */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>

          {/* Excerpt Skeleton */}
          <div className="space-y-3 mb-8 pb-8 border-b">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            {/* Paragraph 1 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Heading */}
            <Skeleton className="h-8 w-2/3 mt-6" />

            {/* Paragraph 2 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Image Placeholder */}
            <Skeleton className="h-64 w-full rounded-lg my-6" />

            {/* Paragraph 3 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Heading */}
            <Skeleton className="h-8 w-1/2 mt-6" />

            {/* Paragraph 4 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          {/* Tags Skeleton */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center gap-3 flex-wrap">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>

          {/* Back Button Skeleton (Bottom) */}
          <div className="mt-12 pt-8 border-t">
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>
    </article>
  );
}
