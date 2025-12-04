'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { SearchResultsList } from './SearchResultsList';
import { SearchEmptyState } from './SearchEmptyState';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { results, isLoading, error } = useSearch(query, { quick: true });

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleResultClick = (url: string) => {
    router.push(url);
    onOpenChange(false);
  };

  const handleViewAll = () => {
    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        
        <Input
          type="text"
          placeholder="Start typing to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="mb-4"
          aria-label="Search query"
        />

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Searching...</span>
            </div>
          )}
          
          {error && (
            <div className="text-destructive py-4 text-center">
              Search failed. Please try again.
            </div>
          )}

          {!isLoading && !error && query && (
            <>
              {results.length > 0 ? (
                <>
                  <SearchResultsList
                    results={results}
                    onResultClick={handleResultClick}
                    highlightQuery={query}
                  />
                  <button
                    onClick={handleViewAll}
                    className="mt-4 w-full text-sm text-primary hover:underline text-center py-2"
                  >
                    View all results →
                  </button>
                </>
              ) : (
                <SearchEmptyState query={query} />
              )}
            </>
          )}

          {!query && !isLoading && (
            <div className="text-muted-foreground text-sm text-center py-8">
              Start typing to search across users, products, blog posts, pages, customers, and orders...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
