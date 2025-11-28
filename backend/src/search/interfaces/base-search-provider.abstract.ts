import { ISearchable } from './searchable.interface';
import { SearchOptions } from './search-options.interface';
import { SearchResultItem } from './search-result.interface';

/**
 * Abstract base class for search providers
 * Provides common utility methods for implementing ISearchable
 */
export abstract class BaseSearchProvider implements ISearchable {
  abstract getEntityType(): string;
  abstract getRequiredPermission(): string;
  abstract search(
    userId: string,
    query: string,
    options: SearchOptions,
  ): Promise<SearchResultItem[]>;
  abstract count(userId: string, query: string): Promise<number>;
  abstract formatResult(entity: any): SearchResultItem;
  abstract getEntityUrl(entityId: string): string;

  /**
   * Calculate relevance score based on field matches
   * @param entity - Entity to score
   * @param query - Search query
   * @param fields - Fields to check for matches
   * @returns Relevance score (0-100+)
   */
  protected calculateRelevance(
    entity: any,
    query: string,
    fields: string[],
  ): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    for (const field of fields) {
      const value = entity[field];
      if (!value) continue;

      const lowerValue = String(value).toLowerCase();

      // Exact match: +100 points
      if (lowerValue === lowerQuery) {
        score += 100;
      }
      // Starts with query: +50 points
      else if (lowerValue.startsWith(lowerQuery)) {
        score += 50;
      }
      // Contains query: +25 points
      else if (lowerValue.includes(lowerQuery)) {
        score += 25;
      }
    }

    return score;
  }

  /**
   * Truncate text to specified length with ellipsis
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @returns Truncated text
   */
  protected truncateText(text: string, maxLength: number = 150): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get Prisma orderBy clause based on sort option
   * @param sortBy - Sort option
   * @param dateField - Name of date field (default: 'createdAt')
   * @param nameField - Name of name/title field (default: 'name')
   * @returns Prisma orderBy object
   */
  protected getOrderBy(
    sortBy: string = 'relevance',
    dateField: string = 'createdAt',
    nameField: string = 'name',
  ): any {
    switch (sortBy) {
      case 'date':
        return { [dateField]: 'desc' };
      case 'name':
        return { [nameField]: 'asc' };
      default:
        // Relevance sorting handled by score calculation
        return {};
    }
  }

  /**
   * Build case-insensitive search WHERE clause for multiple fields
   * @param query - Search query
   * @param fields - Fields to search
   * @returns Prisma WHERE clause
   */
  protected buildSearchWhere(query: string, fields: string[]): any {
    return {
      OR: fields.map((field) => ({
        [field]: { contains: query, mode: 'insensitive' },
      })),
    };
  }
}
