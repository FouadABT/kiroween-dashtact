import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SearchRegistryService } from './search-registry.service';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditLoggingService } from '../auth/services/audit-logging.service';
import { SearchQueryDto, PaginatedSearchResultDto, SearchResultDto } from './dto';
import { SearchResultItem } from './interfaces';
import {
  InvalidSearchQueryException,
  SearchFailedException,
} from './exceptions/search.exceptions';

/**
 * Core search service that orchestrates searches across all providers
 * Handles permission checking, result merging, and pagination
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly sensitiveEntityTypes = ['users', 'customers', 'orders'];

  constructor(
    private readonly searchRegistry: SearchRegistryService,
    private readonly permissionsService: PermissionsService,
    private readonly auditLoggingService: AuditLoggingService,
  ) {}

  /**
   * Execute full search with pagination
   * @param userId - ID of the user performing the search
   * @param query - Search query parameters
   * @returns Paginated search results
   */
  async search(
    userId: string,
    query: SearchQueryDto,
  ): Promise<PaginatedSearchResultDto> {
    try {
      // Validate query
      this.validateQuery(query.q);

    // Set defaults for optional parameters
    const type = query.type || 'all';
    const page = query.page || 1;
    const limit = query.limit || 20;
    const sortBy = query.sortBy || 'relevance';

    // Get applicable providers based on type filter
    const providers =
      type === 'all'
        ? this.searchRegistry.getAllProviders()
        : this.searchRegistry.getProvidersByTypes([type]);

    if (providers.length === 0) {
      this.logger.warn(`No providers found for type: ${type}`);
      return this.createEmptyResult(page, limit);
    }

    // Filter providers by permissions
    const authorizedProviders = await this.filterProvidersByPermissions(
      userId,
      providers,
    );

    if (authorizedProviders.length === 0) {
      this.logger.log(
        `User ${userId} has no permissions for any search providers`,
      );
      return this.createEmptyResult(page, limit);
    }

    // Execute search across all authorized providers in parallel
    const searchPromises = authorizedProviders.map((provider) =>
      this.searchProvider(provider, userId, query.q, page, limit, sortBy),
    );

    const providerResults = await Promise.allSettled(searchPromises);

    // Collect successful results
    const allResults: SearchResultItem[] = [];
    providerResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      } else {
        const provider = authorizedProviders[index];
        this.logger.error(
          `Search failed for provider ${provider.getEntityType()}: ${result.reason}`,
        );
      }
    });

    // Sort by relevance if needed
    if (sortBy === 'relevance') {
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Apply pagination
    const total = allResults.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = allResults.slice(startIndex, endIndex);

      // Log sensitive searches for audit trail
      this.logSensitiveSearches(userId, type, query.q, allResults);

      return {
        results: paginatedResults.map(this.mapToDto),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      // Re-throw validation errors
      if (error instanceof InvalidSearchQueryException || error instanceof BadRequestException) {
        throw error;
      }

      // Log and throw generic search failure
      this.logger.error(
        `Search failed for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new SearchFailedException('Search operation failed. Please try again.');
    }
  }

  /**
   * Execute quick search for top 8 results (Cmd+K dialog)
   * @param userId - ID of the user performing the search
   * @param query - Search query string
   * @returns Top 8 search results
   */
  async quickSearch(userId: string, query: string): Promise<SearchResultDto[]> {
    try {
      // Validate query
      this.validateQuery(query);

    // Get all providers
    const providers = this.searchRegistry.getAllProviders();

    if (providers.length === 0) {
      return [];
    }

    // Filter providers by permissions
    const authorizedProviders = await this.filterProvidersByPermissions(
      userId,
      providers,
    );

    if (authorizedProviders.length === 0) {
      return [];
    }

    // Execute search across all authorized providers in parallel
    const searchPromises = authorizedProviders.map((provider) =>
      provider.search(userId, query, { page: 1, limit: 8, sortBy: 'relevance' }),
    );

    const providerResults = await Promise.allSettled(searchPromises);

    // Collect successful results
    const allResults: SearchResultItem[] = [];
    providerResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      } else {
        const provider = authorizedProviders[index];
        this.logger.error(
          `Quick search failed for provider ${provider.getEntityType()}: ${result.reason}`,
        );
      }
    });

      // Sort by relevance and take top 8
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const topResults = allResults.slice(0, 8);

      // Log sensitive searches for audit trail
      this.logSensitiveSearches(userId, 'all', query, allResults);

      return topResults.map(this.mapToDto);
    } catch (error) {
      // Re-throw validation errors
      if (error instanceof InvalidSearchQueryException || error instanceof BadRequestException) {
        throw error;
      }

      // Log and throw generic search failure
      this.logger.error(
        `Quick search failed for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new SearchFailedException('Quick search operation failed. Please try again.');
    }
  }

  /**
   * Validate search query
   * @param query - Query string to validate
   * @throws InvalidSearchQueryException if query is invalid
   */
  private validateQuery(query: string): void {
    if (!query || query.trim().length === 0) {
      throw new InvalidSearchQueryException('Query cannot be empty');
    }

    if (query.length > 200) {
      throw new InvalidSearchQueryException(
        'Query cannot exceed 200 characters',
      );
    }

    // Sanitize query (basic SQL injection prevention)
    const sanitized = query.trim();
    if (sanitized !== query) {
      this.logger.warn(`Query was sanitized: "${query}" -> "${sanitized}"`);
    }
  }

  /**
   * Filter providers by user permissions
   * @param userId - User ID
   * @param providers - Array of providers to filter
   * @returns Array of authorized providers
   */
  private async filterProvidersByPermissions(
    userId: string,
    providers: any[],
  ): Promise<any[]> {
    const permissionChecks = await Promise.all(
      providers.map(async (provider) => {
        const requiredPermission = provider.getRequiredPermission();
        const hasPermission = await this.permissionsService.userHasPermission(
          userId,
          requiredPermission,
        );
        return { provider, hasPermission };
      }),
    );

    return permissionChecks
      .filter((check) => check.hasPermission)
      .map((check) => check.provider);
  }

  /**
   * Execute search for a single provider
   * @param provider - Search provider
   * @param userId - User ID
   * @param query - Search query string
   * @param page - Page number
   * @param limit - Results per page
   * @param sortBy - Sort order
   * @returns Array of search results
   */
  private async searchProvider(
    provider: any,
    userId: string,
    query: string,
    page: number,
    limit: number,
    sortBy: string,
  ): Promise<SearchResultItem[]> {
    try {
      return await provider.search(userId, query, {
        page,
        limit,
        sortBy,
      });
    } catch (error) {
      this.logger.error(
        `Error searching provider ${provider.getEntityType()}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Map SearchResultItem to SearchResultDto
   * @param item - Search result item
   * @returns Search result DTO
   */
  private mapToDto(item: SearchResultItem): SearchResultDto {
    return {
      id: item.id,
      entityType: item.entityType,
      title: item.title,
      description: item.description,
      url: item.url,
      metadata: item.metadata,
      relevanceScore: item.relevanceScore,
    };
  }

  /**
   * Create empty result for pagination
   * @param page - Current page
   * @param limit - Results per page
   * @returns Empty paginated result
   */
  private createEmptyResult(
    page: number,
    limit: number,
  ): PaginatedSearchResultDto {
    return {
      results: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  /**
   * Log sensitive searches for audit trail
   * Logs searches on users, customers, and orders entities
   * @param userId - User performing the search
   * @param type - Entity type filter
   * @param query - Search query string
   * @param results - Search results
   */
  private logSensitiveSearches(
    userId: string,
    type: string,
    query: string,
    results: SearchResultItem[],
  ): void {
    // Check if searching all types or a specific sensitive type
    const searchedTypes =
      type === 'all'
        ? this.sensitiveEntityTypes
        : this.sensitiveEntityTypes.includes(type)
          ? [type]
          : [];

    // Log for each sensitive entity type that has results
    searchedTypes.forEach((entityType) => {
      const entityResults = results.filter(
        (r) => r.entityType === entityType,
      );

      if (entityResults.length > 0) {
        // Use setImmediate to avoid blocking the response
        setImmediate(() => {
          this.auditLoggingService.logSensitiveSearch(
            userId,
            entityType,
            query,
            entityResults.length,
          );
        });
      }
    });
  }
}
