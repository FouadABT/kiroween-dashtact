import { Test, TestingModule } from '@nestjs/testing';
import { SearchRegistryService } from './search-registry.service';
import { ISearchable } from './interfaces';
import { UsersSearchProvider } from './providers/users-search.provider';
import { ProductsSearchProvider } from './providers/products-search.provider';
import { BlogPostsSearchProvider } from './providers/blog-posts-search.provider';
import { PagesSearchProvider } from './providers/pages-search.provider';
import { CustomersSearchProvider } from './providers/customers-search.provider';
import { OrdersSearchProvider } from './providers/orders-search.provider';

describe('SearchRegistryService', () => {
  let service: SearchRegistryService;

  // Mock providers
  const mockUsersProvider = {
    getEntityType: () => 'users',
    getRequiredPermission: () => 'users:read',
    search: jest.fn(),
    count: jest.fn(),
    formatResult: jest.fn(),
    getEntityUrl: jest.fn(),
  } as unknown as UsersSearchProvider;

  const mockProductsProvider = {
    getEntityType: () => 'products',
    getRequiredPermission: () => 'products:read',
    search: jest.fn(),
    count: jest.fn(),
    formatResult: jest.fn(),
    getEntityUrl: jest.fn(),
  } as unknown as ProductsSearchProvider;

  const mockBlogPostsProvider = {
    getEntityType: () => 'posts',
    getRequiredPermission: () => 'blog:read',
    search: jest.fn(),
    count: jest.fn(),
    formatResult: jest.fn(),
    getEntityUrl: jest.fn(),
  } as unknown as BlogPostsSearchProvider;

  const mockPagesProvider = {
    getEntityType: () => 'pages',
    getRequiredPermission: () => 'pages:read',
    search: jest.fn(),
    count: jest.fn(),
    formatResult: jest.fn(),
    getEntityUrl: jest.fn(),
  } as unknown as PagesSearchProvider;

  const mockCustomersProvider = {
    getEntityType: () => 'customers',
    getRequiredPermission: () => 'customers:read',
    search: jest.fn(),
    count: jest.fn(),
    formatResult: jest.fn(),
    getEntityUrl: jest.fn(),
  } as unknown as CustomersSearchProvider;

  const mockOrdersProvider = {
    getEntityType: () => 'orders',
    getRequiredPermission: () => 'orders:read',
    search: jest.fn(),
    count: jest.fn(),
    formatResult: jest.fn(),
    getEntityUrl: jest.fn(),
  } as unknown as OrdersSearchProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchRegistryService,
        {
          provide: UsersSearchProvider,
          useValue: mockUsersProvider,
        },
        {
          provide: ProductsSearchProvider,
          useValue: mockProductsProvider,
        },
        {
          provide: BlogPostsSearchProvider,
          useValue: mockBlogPostsProvider,
        },
        {
          provide: PagesSearchProvider,
          useValue: mockPagesProvider,
        },
        {
          provide: CustomersSearchProvider,
          useValue: mockCustomersProvider,
        },
        {
          provide: OrdersSearchProvider,
          useValue: mockOrdersProvider,
        },
      ],
    }).compile();

    service = module.get<SearchRegistryService>(SearchRegistryService);
  });

  describe('onModuleInit', () => {
    it('should register all providers on initialization', () => {
      service.onModuleInit();

      expect(service.getProviderCount()).toBe(6);
      expect(service.hasProvider('users')).toBe(true);
      expect(service.hasProvider('products')).toBe(true);
      expect(service.hasProvider('posts')).toBe(true);
      expect(service.hasProvider('pages')).toBe(true);
      expect(service.hasProvider('customers')).toBe(true);
      expect(service.hasProvider('orders')).toBe(true);
    });

    it('should log registered providers', () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      
      service.onModuleInit();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Search registry initialized with 6 providers'),
      );
    });
  });

  describe('registerProvider', () => {
    it('should register a new provider', () => {
      const customProvider: ISearchable = {
        getEntityType: () => 'custom',
        getRequiredPermission: () => 'custom:read',
        search: jest.fn(),
        count: jest.fn(),
        formatResult: jest.fn(),
        getEntityUrl: jest.fn(),
      };

      service.registerProvider(customProvider);

      expect(service.hasProvider('custom')).toBe(true);
      expect(service.getProvider('custom')).toBe(customProvider);
    });

    it('should overwrite existing provider with warning', () => {
      const warnSpy = jest.spyOn(service['logger'], 'warn');
      
      service.onModuleInit();
      
      const newUsersProvider: ISearchable = {
        getEntityType: () => 'users',
        getRequiredPermission: () => 'users:read',
        search: jest.fn(),
        count: jest.fn(),
        formatResult: jest.fn(),
        getEntityUrl: jest.fn(),
      };

      service.registerProvider(newUsersProvider);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('already registered'),
      );
      expect(service.getProvider('users')).toBe(newUsersProvider);
    });
  });

  describe('getProvider', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return provider for valid entity type', () => {
      const provider = service.getProvider('users');

      expect(provider).toBeDefined();
      expect(provider?.getEntityType()).toBe('users');
    });

    it('should return undefined for non-existent entity type', () => {
      const provider = service.getProvider('nonexistent');

      expect(provider).toBeUndefined();
    });
  });

  describe('getAllProviders', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return all registered providers', () => {
      const providers = service.getAllProviders();

      expect(providers).toHaveLength(6);
      expect(providers).toContain(mockUsersProvider);
      expect(providers).toContain(mockProductsProvider);
      expect(providers).toContain(mockBlogPostsProvider);
      expect(providers).toContain(mockPagesProvider);
      expect(providers).toContain(mockCustomersProvider);
      expect(providers).toContain(mockOrdersProvider);
    });

    it('should return empty array when no providers registered', () => {
      const emptyService = new SearchRegistryService(
        mockUsersProvider,
        mockProductsProvider,
        mockBlogPostsProvider,
        mockPagesProvider,
        mockCustomersProvider,
        mockOrdersProvider,
      );

      const providers = emptyService.getAllProviders();

      expect(providers).toHaveLength(0);
    });
  });

  describe('getProvidersByTypes', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return providers for specified types', () => {
      const providers = service.getProvidersByTypes(['users', 'products']);

      expect(providers).toHaveLength(2);
      expect(providers[0].getEntityType()).toBe('users');
      expect(providers[1].getEntityType()).toBe('products');
    });

    it('should filter out non-existent types', () => {
      const providers = service.getProvidersByTypes(['users', 'nonexistent', 'products']);

      expect(providers).toHaveLength(2);
      expect(providers.map(p => p.getEntityType())).toEqual(['users', 'products']);
    });

    it('should return empty array for all non-existent types', () => {
      const providers = service.getProvidersByTypes(['nonexistent1', 'nonexistent2']);

      expect(providers).toHaveLength(0);
    });

    it('should return empty array for empty types array', () => {
      const providers = service.getProvidersByTypes([]);

      expect(providers).toHaveLength(0);
    });
  });

  describe('hasProvider', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return true for registered provider', () => {
      expect(service.hasProvider('users')).toBe(true);
      expect(service.hasProvider('products')).toBe(true);
    });

    it('should return false for non-registered provider', () => {
      expect(service.hasProvider('nonexistent')).toBe(false);
    });
  });

  describe('getRegisteredTypes', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return all registered entity types', () => {
      const types = service.getRegisteredTypes();

      expect(types).toHaveLength(6);
      expect(types).toContain('users');
      expect(types).toContain('products');
      expect(types).toContain('posts');
      expect(types).toContain('pages');
      expect(types).toContain('customers');
      expect(types).toContain('orders');
    });

    it('should return empty array when no providers registered', () => {
      const emptyService = new SearchRegistryService(
        mockUsersProvider,
        mockProductsProvider,
        mockBlogPostsProvider,
        mockPagesProvider,
        mockCustomersProvider,
        mockOrdersProvider,
      );

      const types = emptyService.getRegisteredTypes();

      expect(types).toHaveLength(0);
    });
  });

  describe('getProviderCount', () => {
    it('should return correct count of registered providers', () => {
      expect(service.getProviderCount()).toBe(0);

      service.onModuleInit();

      expect(service.getProviderCount()).toBe(6);
    });

    it('should update count when providers are added', () => {
      service.onModuleInit();
      
      const initialCount = service.getProviderCount();

      const customProvider: ISearchable = {
        getEntityType: () => 'custom',
        getRequiredPermission: () => 'custom:read',
        search: jest.fn(),
        count: jest.fn(),
        formatResult: jest.fn(),
        getEntityUrl: jest.fn(),
      };

      service.registerProvider(customProvider);

      expect(service.getProviderCount()).toBe(initialCount + 1);
    });
  });
});
