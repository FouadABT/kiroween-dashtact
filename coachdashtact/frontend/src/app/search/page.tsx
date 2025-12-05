/**
 * Search Results Page
 * Full-page search interface with filtering, sorting, and pagination
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchResultsPage } from '@/components/search/SearchResultsPage';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { updateMetadata } = useMetadata();
  
  // Extract query parameters
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sortBy') || 'relevance';

  // Update page metadata based on search query
  useEffect(() => {
    if (query) {
      updateMetadata({
        title: `Search Results for "${query}"`,
        description: `Search results for "${query}" - Find users, products, orders, pages, and blog posts`,
      });
    } else {
      updateMetadata({
        title: 'Search',
        description: 'Search across all content including users, products, orders, pages, and blog posts',
      });
    }
  }, [query, updateMetadata]);

  return (
    <SearchResultsPage
      query={query}
      type={type}
      page={page}
      sortBy={sortBy as 'relevance' | 'date' | 'name'}
    />
  );
}

function SearchPageSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="grid gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
