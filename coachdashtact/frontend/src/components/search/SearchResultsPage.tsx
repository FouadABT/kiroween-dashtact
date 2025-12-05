/**
 * SearchResultsPage Component
 * Main component for full search results page with filtering and pagination
 */

'use client';

import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';
import { SearchBreadcrumb } from './SearchBreadcrumb';
import { SearchFilters } from './SearchFilters';
import { SearchResultsList } from './SearchResultsList';
import { SearchPagination } from './SearchPagination';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchErrorState } from './SearchErrorState';
import { SearchLoadingSkeleton } from './SearchLoadingSkeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchResultsPageProps {
  query: string;
  type: string;
  page: number;
  sortBy: 'relevance' | 'date' | 'name';
}

export function SearchResultsPage({
  query: initialQuery,
  type: initialType,
  page: initialPage,
  sortBy: initialSortBy,
}: SearchResultsPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== initialQuery) {
      updateURL({ q: debouncedQuery, page: 1 });
    }
  }, [debouncedQuery, initialQuery]);

  // Use search hook with full pagination mode
  const { results, isLoading, error, totalCount } = useSearch(initialQuery, {
    quick: false,
    type: initialType === 'all' ? undefined : initialType,
    page: initialPage,
    limit: 20,
    sortBy: initialSortBy,
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / 20);

  // Update URL with new parameters
  const updateURL = (params: {
    q?: string;
    type?: string;
    page?: number;
    sortBy?: string;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('q', params.q ?? initialQuery);
    searchParams.set('type', params.type ?? initialType);
    searchParams.set('page', String(params.page ?? initialPage));
    searchParams.set('sortBy', params.sortBy ?? initialSortBy);

    router.push(`/search?${searchParams.toString()}`);
  };

  const handleTypeChange = (newType: string) => {
    updateURL({ type: newType, page: 1 });
  };

  const handleSortChange = (newSortBy: 'relevance' | 'date' | 'name') => {
    updateURL({ sortBy: newSortBy, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage });
  };

  const handleResultClick = (url: string) => {
    router.push(url);
  };

  const handleRetry = () => {
    // Force re-fetch by updating URL
    updateURL({ page: initialPage });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      updateURL({ q: searchQuery.trim(), page: 1 });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <SearchBreadcrumb />
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Search Results
        </h1>
        {!isLoading && initialQuery && (
          <p className="text-muted-foreground">
            {totalCount === 0
              ? 'No results found'
              : `${totalCount} ${totalCount === 1 ? 'result' : 'results'} found`}
            {initialQuery && ` for "${initialQuery}"`}
          </p>
        )}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-base h-12"
            aria-label="Search query"
          />
        </div>
      </form>

      {/* Filters */}
      <div className="mb-6">
        <SearchFilters
          activeType={initialType}
          sortBy={initialSortBy}
          onTypeChange={handleTypeChange}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Results */}
      <div className="min-h-[400px]">
        {isLoading && <SearchLoadingSkeleton />}

        {error && !isLoading && (
          <SearchErrorState error={error} onRetry={handleRetry} />
        )}

        {!isLoading && !error && initialQuery && results.length === 0 && (
          <SearchEmptyState query={initialQuery} />
        )}

        {!isLoading && !error && !initialQuery && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Enter a search query to see results</p>
          </div>
        )}

        {!isLoading && !error && results.length > 0 && (
          <>
            <SearchResultsList
              results={results}
              onResultClick={handleResultClick}
              highlightQuery={initialQuery}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <SearchPagination
                currentPage={initialPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
