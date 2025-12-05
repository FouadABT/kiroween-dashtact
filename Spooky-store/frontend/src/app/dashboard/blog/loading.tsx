import { Skeleton } from '@/components/ui/skeleton';

/**
 * Blog Management Loading State
 * 
 * Displayed while blog management data is being fetched.
 * Shows skeleton loaders for a better user experience.
 * 
 * Features:
 * - Skeleton loaders for page header
 * - Skeleton loaders for blog post table
 * - Matches actual blog management layout
 */

export default function BlogManagementLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:w-[200px]" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg">
        {/* Table Header */}
        <div className="border-b bg-muted/50 p-4">
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="h-4 w-full col-span-5" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-1" />
          </div>
        </div>

        {/* Table Rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b last:border-b-0 p-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-5 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 col-span-2 rounded-full" />
              <Skeleton className="h-4 w-24 col-span-2" />
              <Skeleton className="h-4 w-24 col-span-2" />
              <div className="col-span-1 flex justify-end">
                <Skeleton className="h-8 w-8 rounded" />
              </div>
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
  );
}
