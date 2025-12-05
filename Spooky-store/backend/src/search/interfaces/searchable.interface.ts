import { SearchOptions } from './search-options.interface';
import { SearchResultItem } from './search-result.interface';

/**
 * Interface that all search providers must implement
 * Defines the contract for entity-specific search implementations
 */
export interface ISearchable {
  /**
   * Get the entity type identifier (e.g., 'users', 'products', 'posts')
   */
  getEntityType(): string;

  /**
   * Get the permission required to search this entity type
   */
  getRequiredPermission(): string;

  /**
   * Execute search with user context and query
   * @param userId - ID of the user performing the search
   * @param query - Search query string
   * @param options - Search options (pagination, sorting)
   * @returns Array of search result items
   */
  search(
    userId: string,
    query: string,
    options: SearchOptions,
  ): Promise<SearchResultItem[]>;

  /**
   * Get total count of results for pagination
   * @param userId - ID of the user performing the search
   * @param query - Search query string
   * @returns Total count of matching results
   */
  count(userId: string, query: string): Promise<number>;

  /**
   * Format entity data into search result
   * @param entity - Raw entity data from database
   * @returns Formatted search result item
   */
  formatResult(entity: any): SearchResultItem;

  /**
   * Get URL to entity detail page
   * @param entityId - ID of the entity
   * @returns URL path to entity detail page
   */
  getEntityUrl(entityId: string): string;
}
