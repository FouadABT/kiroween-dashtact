import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { QuickSearchQueryDto } from './dto/quick-search-query.dto';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  const mockSearchService = {
    search: jest.fn(),
    quickSearch: jest.fn(),
    getSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return paginated search results', async () => {
      const query: SearchQueryDto = {
        q: 'test query',
        type: 'users',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      const mockResults = {
        results: [
          {
            id: '1',
            type: 'user',
            title: 'Test User',
            description: 'A test user',
            url: '/users/1',
            score: 0.95,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockSearchService.search.mockResolvedValue(mockResults);

      const result = await controller.search(query);

      expect(result).toEqual(mockResults);
      expect(mockSearchService.search).toHaveBeenCalledWith(query);
      expect(mockSearchService.search).toHaveBeenCalledTimes(1);
    });

    it('should handle search with default parameters', async () => {
      const query: SearchQueryDto = {
        q: 'test',
        type: 'all',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      const mockResults = {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockSearchService.search.mockResolvedValue(mockResults);

      const result = await controller.search(query);

      expect(result).toEqual(mockResults);
      expect(mockSearchService.search).toHaveBeenCalledWith(query);
    });

    it('should handle search with custom pagination', async () => {
      const query: SearchQueryDto = {
        q: 'test',
        type: 'products',
        page: 2,
        limit: 50,
        sortBy: 'date',
      };

      const mockResults = {
        results: [],
        total: 100,
        page: 2,
        limit: 50,
        totalPages: 2,
      };

      mockSearchService.search.mockResolvedValue(mockResults);

      const result = await controller.search(query);

      expect(result).toEqual(mockResults);
      expect(mockSearchService.search).toHaveBeenCalledWith(query);
    });

    it('should handle empty search results', async () => {
      const query: SearchQueryDto = {
        q: 'nonexistent',
        type: 'all',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      };

      const mockResults = {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockSearchService.search.mockResolvedValue(mockResults);

      const result = await controller.search(query);

      expect(result).toEqual(mockResults);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('quickSearch', () => {
    it('should return top 8 quick search results', async () => {
      const query: QuickSearchQueryDto = {
        q: 'test',
      };

      const mockResults = [
        {
          id: '1',
          type: 'user',
          title: 'Test User',
          url: '/users/1',
          score: 0.95,
        },
        {
          id: '2',
          type: 'product',
          title: 'Test Product',
          url: '/products/2',
          score: 0.90,
        },
      ];

      mockSearchService.quickSearch.mockResolvedValue(mockResults);

      const result = await controller.quickSearch(query);

      expect(result).toEqual(mockResults);
      expect(mockSearchService.quickSearch).toHaveBeenCalledWith('test');
      expect(mockSearchService.quickSearch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty quick search results', async () => {
      const query: QuickSearchQueryDto = {
        q: 'nonexistent',
      };

      mockSearchService.quickSearch.mockResolvedValue([]);

      const result = await controller.quickSearch(query);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should limit results to 8 items', async () => {
      const query: QuickSearchQueryDto = {
        q: 'test',
      };

      const mockResults = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        type: 'user',
        title: `User ${i + 1}`,
        url: `/users/${i + 1}`,
        score: 1 - i * 0.1,
      }));

      mockSearchService.quickSearch.mockResolvedValue(mockResults);

      const result = await controller.quickSearch(query);

      expect(result).toHaveLength(8);
      expect(mockSearchService.quickSearch).toHaveBeenCalledWith('test');
    });
  });

  describe('getSuggestions', () => {
    it('should return search suggestions', async () => {
      const query: QuickSearchQueryDto = {
        q: 'test',
      };

      const mockSuggestions = ['test user', 'test product', 'test page'];

      mockSearchService.getSuggestions.mockResolvedValue(mockSuggestions);

      const result = await controller.getSuggestions(query);

      expect(result).toEqual(mockSuggestions);
      expect(mockSearchService.getSuggestions).toHaveBeenCalledWith('test');
      expect(mockSearchService.getSuggestions).toHaveBeenCalledTimes(1);
    });

    it('should handle empty suggestions', async () => {
      const query: QuickSearchQueryDto = {
        q: 'xyz',
      };

      mockSearchService.getSuggestions.mockResolvedValue([]);

      const result = await controller.getSuggestions(query);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return suggestions based on partial query', async () => {
      const query: QuickSearchQueryDto = {
        q: 'us',
      };

      const mockSuggestions = ['user', 'users', 'username'];

      mockSearchService.getSuggestions.mockResolvedValue(mockSuggestions);

      const result = await controller.getSuggestions(query);

      expect(result).toEqual(mockSuggestions);
      expect(mockSearchService.getSuggestions).toHaveBeenCalledWith('us');
    });
  });
});
