import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { SearchRegistryService } from './search-registry.service';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditLoggingService } from '../auth/services/audit-logging.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { InvalidSearchQueryException } from './exceptions/search.exceptions';
import { ISearchable, SearchResultItem } from './interfaces';

describe('SearchService', () => {
  let service: SearchService;
  let registryService: SearchRegistryService;
  let permissionsService: PermissionsService;
  let auditService: AuditLoggingService;

  // Mock search provider
  const mockProvider: ISearchable = {
    getEntityType: () => 'test',
    getRequiredPermission: () => 'test:read',
    search: jest.fn(),
    count: jest.fn(),
    formatResult: jest.fn(),
    getEntityUrl: jest.fn(),
  };

  const mockSearchResults: SearchResultItem[] = [
    {
      id: '1',
      entityType: 'test',
      title: 'Test Result 1',
      description: 'Test description 1',
      url: '/test/1',
      metadata: { date: new Date() },
      relevanceScore: 100,
    },
    {
      id: '2',
      entityType: 'test',
      title: 'Test Result 2',
      description: 'Test description 2',
      url: '/test/2',
      metadata: { date: new Date() },
      relevanceScore: 50,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: SearchRegistryService,
          useValue: {
            getAllProviders: jest.fn(),
            getProvidersByTypes: jest.fn(),
            getProvider: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            userHasPermission: jest.fn(),
          },
        },
        {
          provide: AuditLoggingService,
          useValue: {
            logSensitiveSearch: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    registryService = module.get<SearchRegistryService>(SearchRegistryService);
    permissionsService = module.get<PermissionsService>(PermissionsService);
    auditService = module.get<AuditLoggingService>(AuditLoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should search across all providers when type is "all"', async () => {
      const query: SearchQueryDto = {
        q: 'test query',
        type: 'all',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      jest.spyOn(registryService, 'getAllProviders').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(true);
      jest.spyOn(mockProvider, 'search').mockResolvedValue(mockSearchResults);
      jest.spyOn(mockProvider, 'count').mockResolvedValue(2);

      const result = await service.search('user-id', query);

      expect(registryService.getAllProviders).toHaveBeenCalled();
      expect(mockProvider.search).toHaveBeenCalledWith('user-id', 'test query', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });
      expect(result.results).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter results by entity type', async () => {
      const query: SearchQueryDto = {
        q: 'test query',
        type: 'test',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      jest.spyOn(registryService, 'getProvidersByTypes').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(true);
      jest.spyOn(mockProvider, 'search').mockResolvedValue(mockSearchResults);
      jest.spyOn(mockProvider, 'count').mockResolvedValue(2);

      const result = await service.search('user-id', query);

      expect(registryService.getProvidersByTypes).toHaveBeenCalledWith(['test']);
      expect(result.results).toHaveLength(2);
    });

    it('should respect user permissions', async () => {
      const query: SearchQueryDto = {
        q: 'test query',
        type: 'all',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      jest.spyOn(registryService, 'getAllProviders').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(false);

      const result = await service.search('user-id', query);

      expect(permissionsService.userHasPermission).toHaveBeenCalledWith('user-id', 'test:read');
      expect(result.results).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should sort results by relevance score', async () => {
      const query: SearchQueryDto = {
        q: 'test query',
        type: 'all',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      const unsortedResults = [
        { ...mockSearchResults[1], relevanceScore: 50 },
        { ...mockSearchResults[0], relevanceScore: 100 },
      ];

      jest.spyOn(registryService, 'getAllProviders').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(true);
      jest.spyOn(mockProvider, 'search').mockResolvedValue(unsortedResults);
      jest.spyOn(mockProvider, 'count').mockResolvedValue(2);

      const result = await service.search('user-id', query);

      expect(result.results[0].relevanceScore).toBe(100);
      expect(result.results[1].relevanceScore).toBe(50);
    });

    it('should paginate results correctly', async () => {
      const query: SearchQueryDto = {
        q: 'test query',
        type: 'all',
        page: 2,
        limit: 10,
        sortBy: 'relevance',
      };

      // Create 25 mock results to test pagination
      const manyResults = Array.from({ length: 25 }, (_, i) => ({
        id: `${i}`,
        entityType: 'test',
        title: `Result ${i}`,
        description: `Description ${i}`,
        url: `/test/${i}`,
        metadata: {},
        relevanceScore: 100 - i,
      }));

      jest.spyOn(registryService, 'getAllProviders').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(true);
      jest.spyOn(mockProvider, 'search').mockResolvedValue(manyResults);

      const result = await service.search('user-id', query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3);
      expect(result.results.length).toBeLessThanOrEqual(10);
    });

    it('should throw error for empty query', async () => {
      const query: SearchQueryDto = {
        q: '',
        type: 'all',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      await expect(service.search('user-id', query)).rejects.toThrow(
        InvalidSearchQueryException,
      );
    });

    it('should throw error for query exceeding max length', async () => {
      const query: SearchQueryDto = {
        q: 'a'.repeat(201),
        type: 'all',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      await expect(service.search('user-id', query)).rejects.toThrow(
        InvalidSearchQueryException,
      );
    });

    it('should audit log sensitive entity searches', async () => {
      const sensitiveProvider: ISearchable = {
        ...mockProvider,
        getEntityType: () => 'users',
      };

      const usersResults = [
        {
          id: '1',
          entityType: 'users',
          title: 'User 1',
          description: 'Test user 1',
          url: '/users/1',
          metadata: {},
          relevanceScore: 100,
        },
        {
          id: '2',
          entityType: 'users',
          title: 'User 2',
          description: 'Test user 2',
          url: '/users/2',
          metadata: {},
          relevanceScore: 90,
        },
      ];

      const query: SearchQueryDto = {
        q: 'test query',
        type: 'users',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      jest.spyOn(registryService, 'getProvidersByTypes').mockReturnValue([sensitiveProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(true);
      jest.spyOn(sensitiveProvider, 'search').mockResolvedValue(usersResults);

      await service.search('user-id', query);

      // Wait for setImmediate to complete
      await new Promise(resolve => setImmediate(resolve));

      expect(auditService.logSensitiveSearch).toHaveBeenCalledWith(
        'user-id',
        'users',
        'test query',
        2,
      );
    });
  });

  describe('quickSearch', () => {
    it('should return top 8 results across all providers', async () => {
      const manyResults = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        entityType: 'test',
        title: `Result ${i}`,
        description: `Description ${i}`,
        url: `/test/${i}`,
        metadata: {},
        relevanceScore: 100 - i,
      }));

      jest.spyOn(registryService, 'getAllProviders').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(true);
      jest.spyOn(mockProvider, 'search').mockResolvedValue(manyResults);

      const result = await service.quickSearch('user-id', 'test query');

      expect(result).toHaveLength(8);
      expect(result[0].relevanceScore).toBeGreaterThanOrEqual(result[7].relevanceScore);
    });

    it('should respect user permissions in quick search', async () => {
      jest.spyOn(registryService, 'getAllProviders').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(false);

      const result = await service.quickSearch('user-id', 'test query');

      expect(result).toHaveLength(0);
    });

    it('should return fewer than 8 results if not enough matches', async () => {
      jest.spyOn(registryService, 'getAllProviders').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(true);
      jest.spyOn(mockProvider, 'search').mockResolvedValue([mockSearchResults[0]]);

      const result = await service.quickSearch('user-id', 'test query');

      expect(result).toHaveLength(1);
    });

    it('should throw error for empty query in quick search', async () => {
      await expect(service.quickSearch('user-id', '')).rejects.toThrow(
        InvalidSearchQueryException,
      );
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', async () => {
      const query: SearchQueryDto = {
        q: 'test query',
        type: 'all',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      jest.spyOn(registryService, 'getAllProviders').mockReturnValue([mockProvider]);
      jest.spyOn(permissionsService, 'userHasPermission').mockResolvedValue(true);
      jest.spyOn(mockProvider, 'search').mockRejectedValue(new Error('Database error'));

      const result = await service.search('user-id', query);

      // Should return empty results instead of throwing
      expect(result.results).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should validate query parameters', async () => {
      const invalidQuery: SearchQueryDto = {
        q: 'test',
        type: 'all',
        page: 0, // Invalid page
        limit: 20,
        sortBy: 'relevance',
      };

      await expect(service.search('user-id', invalidQuery)).rejects.toThrow();
    });
  });
});
