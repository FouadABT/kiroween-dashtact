'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSearch } from '@/hooks/useSearch';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { SearchEmptyState } from '@/components/search/SearchEmptyState';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const { results, isLoading, error } = useSearch(query, { quick: false });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = (url: string) => {
    router.push(url);
  };

  const handleClearSearch = () => {
    setQuery('');
    router.push('/dashboard/search');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search Results"
        description={query ? `Results for "${query}"` : 'Enter a search query'}
        actions={
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search users, products, blog posts, pages, customers, orders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
              aria-label="Search query"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!query.trim() || isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Search
            </Button>
            {query && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {isLoading && (
          <Card className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Searching...</span>
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="text-destructive text-center">
              <p className="font-medium">Search failed</p>
              <p className="text-sm mt-1">Please try again or contact support if the problem persists.</p>
            </div>
          </Card>
        )}

        {!isLoading && !error && query && (
          <>
            {results.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{results.length}</span> result{results.length !== 1 ? 's' : ''}
                </div>
                <SearchResultsList
                  results={results}
                  onResultClick={handleResultClick}
                  highlightQuery={query}
                />
              </div>
            ) : (
              <SearchEmptyState query={query} />
            )}
          </>
        )}

        {!query && !isLoading && (
          <Card className="p-8">
            <div className="text-center text-muted-foreground space-y-2">
              <Search className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-lg font-medium">Start searching</p>
              <p className="text-sm">Enter a search query to find users, products, blog posts, pages, customers, and orders.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
