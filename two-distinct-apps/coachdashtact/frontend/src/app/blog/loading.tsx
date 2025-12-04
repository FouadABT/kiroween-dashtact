import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Blog Listing Loading State
 * 
 * Displayed while blog posts are being fetched.
 * Shows skeleton loaders for a better user experience.
 * 
 * Features:
 * - Skeleton loaders for blog cards
 * - Responsive grid layout
 * - Matches actual blog list layout
 */

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Filter Skeletons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full sm:w-[200px]" />
            <Skeleton className="h-10 w-full sm:w-[200px]" />
          </div>

          {/* Blog Cards Grid Skeleton */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                {/* Image Skeleton */}
                <Skeleton className="h-48 w-full rounded-lg" />
                
                {/* Category Badge Skeleton */}
                <Skeleton className="h-6 w-24 rounded-full" />
                
                {/* Title Skeleton */}
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-3/4" />
                
                {/* Excerpt Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                
                {/* Metadata Skeleton */}
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex justify-center gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </main>
    </div>
  );
}
