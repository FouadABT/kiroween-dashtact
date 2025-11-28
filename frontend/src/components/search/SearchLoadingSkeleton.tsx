/**
 * SearchLoadingSkeleton Component
 * Loading skeleton for search results
 */

import { Skeleton } from '@/components/ui/skeleton';

export function SearchLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Result items skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-lg p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
