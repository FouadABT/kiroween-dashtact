/**
 * Search System Types
 * 
 * TypeScript interfaces for search functionality.
 * These types match the backend DTOs.
 */

/**
 * Search query parameters for full search
 */
export interface SearchQuery {
  q: string;
  type?: 'all' | 'users' | 'products' | 'posts' | 'pages' | 'customers' | 'orders';
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'name';
}

/**
 * Quick search query parameters (Cmd+K dialog)
 */
export interface QuickSearchQuery {
  q: string;
}

/**
 * Individual search result item
 */
export interface SearchResult {
  id: string;
  entityType: string;
  title: string;
  description: string;
  url: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

/**
 * Paginated search results
 */
export interface PaginatedSearchResult {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Search API response wrapper
 */
export interface SearchResponse<T> {
  data: T;
  message?: string;
}

/**
 * Search filters for UI components
 */
export interface SearchFilters {
  type: 'all' | 'users' | 'products' | 'posts' | 'pages' | 'customers' | 'orders';
  sortBy: 'relevance' | 'date' | 'name';
}

/**
 * Search options for hooks and components
 */
export interface SearchOptions {
  quick?: boolean;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'name';
}
