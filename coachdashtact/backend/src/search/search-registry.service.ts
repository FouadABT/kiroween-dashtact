import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ISearchable } from './interfaces';
import { UsersSearchProvider } from './providers/users-search.provider';
import { ProductsSearchProvider } from './providers/products-search.provider';
import { BlogPostsSearchProvider } from './providers/blog-posts-search.provider';
import { PagesSearchProvider } from './providers/pages-search.provider';
import { CustomersSearchProvider } from './providers/customers-search.provider';
import { OrdersSearchProvider } from './providers/orders-search.provider';

/**
 * Service to manage and coordinate all search providers
 * Maintains a registry of available search providers by entity type
 */
@Injectable()
export class SearchRegistryService implements OnModuleInit {
  private readonly logger = new Logger(SearchRegistryService.name);
  private readonly providers: Map<string, ISearchable> = new Map();

  constructor(
    private readonly usersSearchProvider: UsersSearchProvider,
    private readonly productsSearchProvider: ProductsSearchProvider,
    private readonly blogPostsSearchProvider: BlogPostsSearchProvider,
    private readonly pagesSearchProvider: PagesSearchProvider,
    private readonly customersSearchProvider: CustomersSearchProvider,
    private readonly ordersSearchProvider: OrdersSearchProvider,
  ) {}

  /**
   * Initialize and register all search providers on module initialization
   */
  onModuleInit() {
    this.registerProvider(this.usersSearchProvider);
    this.registerProvider(this.productsSearchProvider);
    this.registerProvider(this.blogPostsSearchProvider);
    this.registerProvider(this.pagesSearchProvider);
    this.registerProvider(this.customersSearchProvider);
    this.registerProvider(this.ordersSearchProvider);

    this.logger.log(
      `Search registry initialized with ${this.getProviderCount()} providers: ${this.getRegisteredTypes().join(', ')}`,
    );
  }

  /**
   * Register a search provider
   * @param provider - Search provider implementing ISearchable
   */
  registerProvider(provider: ISearchable): void {
    const entityType = provider.getEntityType();
    
    if (this.providers.has(entityType)) {
      this.logger.warn(
        `Provider for entity type "${entityType}" is already registered. Overwriting.`,
      );
    }

    this.providers.set(entityType, provider);
    this.logger.log(`Registered search provider for entity type: ${entityType}`);
  }

  /**
   * Get a specific search provider by entity type
   * @param entityType - Entity type identifier
   * @returns Search provider or undefined if not found
   */
  getProvider(entityType: string): ISearchable | undefined {
    return this.providers.get(entityType);
  }

  /**
   * Get all registered search providers
   * @returns Array of all search providers
   */
  getAllProviders(): ISearchable[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get search providers filtered by entity types
   * @param types - Array of entity type identifiers
   * @returns Array of matching search providers
   */
  getProvidersByTypes(types: string[]): ISearchable[] {
    return types
      .map((type) => this.providers.get(type))
      .filter((provider): provider is ISearchable => provider !== undefined);
  }

  /**
   * Check if a provider is registered for an entity type
   * @param entityType - Entity type identifier
   * @returns True if provider exists
   */
  hasProvider(entityType: string): boolean {
    return this.providers.has(entityType);
  }

  /**
   * Get all registered entity types
   * @returns Array of entity type identifiers
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get count of registered providers
   * @returns Number of registered providers
   */
  getProviderCount(): number {
    return this.providers.size;
  }
}
