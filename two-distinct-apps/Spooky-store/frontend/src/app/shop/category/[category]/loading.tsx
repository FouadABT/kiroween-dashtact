import { Loader2 } from 'lucide-react';

export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>

      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="hidden h-16 w-16 animate-pulse rounded-lg bg-muted sm:block" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Skeleton */}
        <aside className="space-y-6">
          <div className="rounded-lg border p-6">
            <div className="mb-4 h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="space-y-6">
          {/* Toolbar Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          </div>

          {/* Loading Spinner */}
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    </div>
  );
}
