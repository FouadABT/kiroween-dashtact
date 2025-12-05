/**
 * useSearch Hook Tests
 * Tests debouncing, API calls, state management, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSearch } from '../useSearch';
import * as searchApi from '@/lib/api/search';

// Mock the search API
vi.mock('@/lib/api/search');

describe('useSearch', () => {
  const mockQuickSearch = vi.mocked(searchApi.searchApi.quickSearch);
  const mockSearch = vi.mocked(searchApi.searchApi.search);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useSearch('', {}));
    
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.totalCount).toBe(0);
  });

  it('should not search with empty query', () => {
    renderHook(() => useSearch('', {}));
    
    expect(mockQuickSearch).not.toHaveBeenCalled();
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('should debounce search input by 300ms', async () => {
    const mockResults = [
      {
        id: '1',
        entityType: 'users' as const,
        title: 'Test User',
        description: 'test@example.com',
        url: '/dashboard/users/1',
        metadata: {},
        relevanceScore: 100,
      },
    ];

    mockQuickSearch.mockResolvedValue(mockResults);

    const { rerender } = renderHook(
      ({ query }) => useSearch(query, { quick: true }),
      { initialProps: { query: '' } }
    );

    // Type first character
    rerender({ query: 't' });
    expect(mockQuickSearch).not.toHaveBeenCalled();

    // Type more characters quickly
    rerender({ query: 'te' });
    rerender({ query: 'tes' });
    rerender({ query: 'test' });
    
    // Still shouldn't have called API
    expect(mockQuickSearch).not.toHaveBeenCalled();

    // Wait for debounce (300ms)
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockQuickSearch).toHaveBeenCalledTimes(1);
      expect(mockQuickSearch).toHaveBeenCalledWith('test');
    });
  });

  it('should call quickSearch API in quick mode', async () => {
    const mockResults = [
      {
        id: '1',
        entityType: 'users' as const,
        title: 'Test User',
        description: 'test@example.com',
        url: '/dashboard/users/1',
        metadata: {},
        relevanceScore: 100,
      },
    ];

    mockQuickSearch.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch('test', { quick: true }));

    // Advance timers for debounce
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockQuickSearch).toHaveBeenCalledWith('test');
      expect(result.current.results).toEqual(mockResults);
      expect(result.current.totalCount).toBe(1);
    });
  });

  it('should call search API in full mode', async () => {
    const mockResponse = {
      results: [
        {
          id: '1',
          entityType: 'users' as const,
          title: 'Test User',
          description: 'test@example.com',
          url: '/dashboard/users/1',
          metadata: {},
          relevanceScore: 100,
        },
      ],
      total: 10,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    mockSearch.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useSearch('test', {
        quick: false,
        type: 'users',
        page: 1,
        limit: 20,
      })
    );

    // Advance timers for debounce
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith({
        q: 'test',
        type: 'users',
        page: 1,
        limit: 20,
      });
      expect(result.current.results).toEqual(mockResponse.results);
      expect(result.current.totalCount).toBe(10);
    });
  });

  it('should set loading state during search', async () => {
    mockQuickSearch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    const { result } = renderHook(() => useSearch('test', { quick: true }));

    // Advance timers for debounce
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Advance timers for API call
    vi.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Network error';
    mockQuickSearch.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useSearch('test', { quick: true }));

    // Advance timers for debounce
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.results).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle non-Error exceptions', async () => {
    mockQuickSearch.mockRejectedValue('String error');

    const { result } = renderHook(() => useSearch('test', { quick: true }));

    // Advance timers for debounce
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.error).toBe('Search failed');
      expect(result.current.results).toEqual([]);
    });
  });

  it('should clear results when query becomes empty', async () => {
    const mockResults = [
      {
        id: '1',
        entityType: 'users' as const,
        title: 'Test User',
        description: 'test@example.com',
        url: '/dashboard/users/1',
        metadata: {},
        relevanceScore: 100,
      },
    ];

    mockQuickSearch.mockResolvedValue(mockResults);

    const { result, rerender } = renderHook(
      ({ query }) => useSearch(query, { quick: true }),
      { initialProps: { query: 'test' } }
    );

    // Advance timers for debounce
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults);
    });

    // Clear query
    rerender({ query: '' });

    expect(result.current.results).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('should update results when query changes', async () => {
    const mockResults1 = [
      {
        id: '1',
        entityType: 'users' as const,
        title: 'Test User 1',
        description: 'test1@example.com',
        url: '/dashboard/users/1',
        metadata: {},
        relevanceScore: 100,
      },
    ];

    const mockResults2 = [
      {
        id: '2',
        entityType: 'users' as const,
        title: 'Test User 2',
        description: 'test2@example.com',
        url: '/dashboard/users/2',
        metadata: {},
        relevanceScore: 100,
      },
    ];

    mockQuickSearch
      .mockResolvedValueOnce(mockResults1)
      .mockResolvedValueOnce(mockResults2);

    const { result, rerender } = renderHook(
      ({ query }) => useSearch(query, { quick: true }),
      { initialProps: { query: 'test1' } }
    );

    // Advance timers for first search
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults1);
    });

    // Change query
    rerender({ query: 'test2' });

    // Advance timers for second search
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults2);
    });
  });
});
