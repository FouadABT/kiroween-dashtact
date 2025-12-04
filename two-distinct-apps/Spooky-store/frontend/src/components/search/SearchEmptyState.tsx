/**
 * SearchEmptyState Component
 * Displays message when no search results are found
 */

import { SearchX } from 'lucide-react';

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No results found for &quot;{query}&quot;
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Try different keywords or check your spelling. You can also try searching for a different type of content.
      </p>
    </div>
  );
}
