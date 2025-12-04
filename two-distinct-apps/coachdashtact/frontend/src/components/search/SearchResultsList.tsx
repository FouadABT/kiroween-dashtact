'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchResultItem } from './SearchResultItem';
import type { SearchResult } from '@/types/search';

interface SearchResultsListProps {
  results: SearchResult[];
  onResultClick: (url: string) => void;
  highlightQuery?: string;
}

export function SearchResultsList({
  results,
  onResultClick,
  highlightQuery = '',
}: SearchResultsListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            onResultClick(results[selectedIndex].url);
          }
          break;
      }
    },
    [results, selectedIndex, onResultClick]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" role="listbox" aria-label="Search results">
      {results.map((result, index) => (
        <SearchResultItem
          key={result.id}
          result={result}
          onClick={() => onResultClick(result.url)}
          isSelected={index === selectedIndex}
          highlightQuery={highlightQuery}
        />
      ))}
    </div>
  );
}
