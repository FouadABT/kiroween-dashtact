/**
 * useSearch Hook
 * Manages search state and API calls with debouncing
 */

import { useState, useEffect } from 'react';
import { useDebounceValue } from './useDebounce';
import { searchApi } from '@/lib/api/search';
import type { SearchResult, SearchQuery } from '@/types/search';

interface UseSearchOptions {
  quick?: boolean;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'name';
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce query with 300ms delay
  const debouncedQuery = useDebounceValue(query, 300);

  useEffect(() => {
    // Reset if query is empty
    if (!debouncedQuery || debouncedQuery.trim().length === 0) {
      setResults([]);
      setTotalCount(0);
      setError(null);
      return;
    }

    const executeSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (options.quick) {
          // Quick search for Cmd+K dialog
          const data = await searchApi.quickSearch({ q: debouncedQuery });
          setResults(data);
          setTotalCount(data.length);
        } else {
          // Full search with pagination
          const searchQuery: SearchQuery = {
            q: debouncedQuery,
            type: options.type as any,
            page: options.page,
            limit: options.limit,
            sortBy: options.sortBy,
          };
          
          const data = await searchApi.search(searchQuery);
          setResults(data.results);
          setTotalCount(data.total);
        }
      } catch (err) {
        console.error('Search failed:', err);
        
        // Set user-friendly error messages
        if (err instanceof Error) {
          if (err.message.includes('429')) {
            setError('Too many searches. Please wait a moment.');
          } else if (err.message.includes('400')) {
            setError('Invalid search query.');
          } else {
            setError('Search failed. Please try again.');
          }
        } else {
          setError('Search failed. Please try again.');
        }
        
        setResults([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
  }, [debouncedQuery, options.quick, options.type, options.page, options.limit, options.sortBy]);

  return {
    results,
    isLoading,
    error,
    totalCount,
  };
}
