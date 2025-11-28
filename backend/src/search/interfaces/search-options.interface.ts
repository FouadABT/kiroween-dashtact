/**
 * Options for search operations
 * Includes pagination and sorting parameters
 */
export interface SearchOptions {
  /**
   * Page number (1-based)
   * @default 1
   */
  page?: number;

  /**
   * Number of results per page
   * @default 20
   */
  limit?: number;

  /**
   * Sort order for results
   * - relevance: Sort by relevance score (default)
   * - date: Sort by creation/update date
   * - name: Sort alphabetically by name/title
   * @default 'relevance'
   */
  sortBy?: 'relevance' | 'date' | 'name';
}
