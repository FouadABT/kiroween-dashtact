/**
 * Represents a single search result item
 * Standardized format for all entity types
 */
export interface SearchResultItem {
  /**
   * Unique identifier of the entity
   */
  id: string;

  /**
   * Type of entity (users, products, posts, pages, customers, orders)
   */
  entityType: string;

  /**
   * Display title of the entity
   */
  title: string;

  /**
   * Brief description or excerpt (max 150 characters)
   */
  description: string;

  /**
   * URL path to entity detail page
   */
  url: string;

  /**
   * Additional metadata about the entity
   */
  metadata: {
    /**
     * Creation or update date
     */
    date?: Date;

    /**
     * Author or creator name
     */
    author?: string;

    /**
     * Status (published, draft, active, inactive, etc.)
     */
    status?: string;

    /**
     * Additional custom fields
     */
    [key: string]: any;
  };

  /**
   * Relevance score for sorting (higher is more relevant)
   */
  relevanceScore: number;
}
