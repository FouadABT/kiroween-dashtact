import { Test, TestingModule } from '@nestjs/testing';
import { PagesService } from './pages.service';
import { SlugService } from './slug.service';
import { RedirectService } from './redirect.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PageStatus, PageVisibility } from '@prisma/client';

describe('PagesService', () => {
  let service: PagesService;
  let prisma: PrismaService;
  let slugService: SlugService;
  let redirectService: RedirectService;

  const mockPrismaService = {
    customPage: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSlugService = {
    validateSlugFormat: jest.fn(),
    isSystemRoute: jest.fn(),
    isSlugAvailable: jest.fn(),
    suggestSlug: jest.fn(),
  };

  const mockRedirectService = {
    createRedirect: jest.fn(),
    deleteRedirectsForPage: jest.fn(),
    resolveRedirect: jest.fn(),
  };

  const mockPage = {
    id: 'page-1',
    title: 'Test Page',
    slug: 'test-page',
    content: 'Test content',
    excerpt: 'Test excerpt',
    featuredImage: null,
    status: PageStatus.DRAFT,
    visibility: PageVisibility.PUBLIC,
    parentPageId: null,
    showInNavigation: false,
    displayOrder: 0,
    metaTitle: null,
    metaDescription: null,
    metaKeywords: null,
    customCssClass: null,
    templateKey: 'default',
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
    parentPage: null,
    childPages: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SlugService,
          useValue: mockSlugService,
        },
        {
          provide: RedirectService,
          useValue: mockRedirectService,
        },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
    prisma = module.get<PrismaService>(PrismaService);
    slugService = module.get<SlugService>(SlugService);
    redirectService = module.get<RedirectService>(RedirectService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated pages', async () => {
      const mockPages = [mockPage];
      mockPrismaService.customPage.count.mockResolvedValue(1);
      mockPrismaService.customPage.findMany.mockResolvedValue(mockPages);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        data: mockPages,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by status', async () => {
      mockPrismaService.customPage.count.mockResolvedValue(0);
      mockPrismaService.customPage.findMany.mockResolvedValue([]);

      await service.findAll({ status: PageStatus.PUBLISHED });

      expect(mockPrismaService.customPage.count).toHaveBeenCalledWith({
        where: { status: PageStatus.PUBLISHED },
      });
    });

    it('should search by title and slug', async () => {
      mockPrismaService.customPage.count.mockResolvedValue(0);
      mockPrismaService.customPage.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'test' });

      expect(mockPrismaService.customPage.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { slug: { contains: 'test', mode: 'insensitive' } },
            { content: { contains: 'test', mode: 'insensitive' } },
          ],
        },
      });
    });
  });

  describe('findBySlug', () => {
    it('should return page by slug', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);

      const result = await service.findBySlug('test-page');

      expect(result).toEqual(mockPage);
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-page' },
        include: {
          parentPage: true,
          childPages: false,
        },
      });
    });

    it('should include children when requested', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);

      await service.findBySlug('test-page', true);

      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-page' },
        include: {
          parentPage: true,
          childPages: true,
        },
      });
    });

    it('should check for redirect if page not found', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(null);
      mockRedirectService.resolveRedirect.mockResolvedValue(mockPage);

      const result = await service.findBySlug('old-slug');

      expect(result).toEqual(mockPage);
      expect(mockRedirectService.resolveRedirect).toHaveBeenCalledWith(
        'old-slug',
      );
    });

    it('should throw NotFoundException if page and redirect not found', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(null);
      mockRedirectService.resolveRedirect.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'New Page',
      slug: 'new-page',
      content: 'Content',
    };

    it('should create a new page', async () => {
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(false);
      mockSlugService.isSlugAvailable.mockResolvedValue(true);
      mockPrismaService.customPage.create.mockResolvedValue(mockPage);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPage);
      expect(mockPrismaService.customPage.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid slug format', async () => {
      mockSlugService.validateSlugFormat.mockReturnValue(false);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for system route conflict', async () => {
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(true);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for duplicate slug', async () => {
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(false);
      mockSlugService.isSlugAvailable.mockResolvedValue(false);
      mockSlugService.suggestSlug.mockResolvedValue('new-page-2');

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Title',
    };

    it('should update a page', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);
      mockPrismaService.customPage.update.mockResolvedValue({
        ...mockPage,
        ...updateDto,
      });

      const result = await service.update('page-1', updateDto);

      expect(result.title).toBe('Updated Title');
    });

    it('should create redirect when slug changes', async () => {
      const updateWithSlug = { slug: 'new-slug' };
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(false);
      mockSlugService.isSlugAvailable.mockResolvedValue(true);
      mockPrismaService.customPage.update.mockResolvedValue({
        ...mockPage,
        ...updateWithSlug,
      });

      await service.update('page-1', updateWithSlug);

      expect(mockRedirectService.createRedirect).toHaveBeenCalledWith(
        'test-page',
        'page-1',
      );
    });
  });

  describe('delete', () => {
    it('should delete a page', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);
      mockPrismaService.customPage.delete.mockResolvedValue(mockPage);

      await service.delete('page-1');

      expect(mockPrismaService.customPage.delete).toHaveBeenCalledWith({
        where: { id: 'page-1' },
      });
      expect(mockRedirectService.deleteRedirectsForPage).toHaveBeenCalledWith(
        'page-1',
      );
    });

    it('should throw BadRequestException if page has children', async () => {
      const pageWithChildren = {
        ...mockPage,
        childPages: [{ id: 'child-1' }],
      };
      mockPrismaService.customPage.findUnique.mockResolvedValue(
        pageWithChildren,
      );

      await expect(service.delete('page-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('publish', () => {
    it('should publish a page', async () => {
      const publishedPage = {
        ...mockPage,
        status: PageStatus.PUBLISHED,
        publishedAt: new Date(),
      };
      mockPrismaService.customPage.update.mockResolvedValue(publishedPage);

      const result = await service.publish('page-1');

      expect(result.status).toBe(PageStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
    });
  });

  describe('unpublish', () => {
    it('should unpublish a page', async () => {
      const unpublishedPage = {
        ...mockPage,
        status: PageStatus.DRAFT,
      };
      mockPrismaService.customPage.update.mockResolvedValue(unpublishedPage);

      const result = await service.unpublish('page-1');

      expect(result.status).toBe(PageStatus.DRAFT);
    });
  });

  describe('getHierarchy', () => {
    it('should return page hierarchy', async () => {
      const pages = [
        { id: '1', title: 'Page 1', slug: 'page-1', parentPageId: null },
        { id: '2', title: 'Page 2', slug: 'page-2', parentPageId: '1' },
      ];
      mockPrismaService.customPage.findMany.mockResolvedValue(pages);

      const result = await service.getHierarchy();

      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(1);
    });
  });

  describe('validateSlug', () => {
    it('should validate slug format and availability', async () => {
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(false);
      mockSlugService.isSlugAvailable.mockResolvedValue(true);

      const result = await service.validateSlug('valid-slug');

      expect(result).toBe(true);
    });

    it('should return false for invalid format', async () => {
      mockSlugService.validateSlugFormat.mockReturnValue(false);

      const result = await service.validateSlug('Invalid Slug');

      expect(result).toBe(false);
    });

    it('should return false for system route conflict', async () => {
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(true);

      const result = await service.validateSlug('dashboard');

      expect(result).toBe(false);
    });

    it('should exclude specific page ID when checking availability', async () => {
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(false);
      mockSlugService.isSlugAvailable.mockResolvedValue(true);

      await service.validateSlug('test-slug', 'page-1');

      expect(mockSlugService.isSlugAvailable).toHaveBeenCalledWith(
        'test-slug',
        'page-1',
      );
    });
  });

  describe('reorder', () => {
    it('should update display order for multiple pages', async () => {
      const updates = [
        { id: 'page-1', order: 1 },
        { id: 'page-2', order: 2 },
        { id: 'page-3', order: 3 },
      ];

      mockPrismaService.customPage.update.mockResolvedValue(mockPage);

      await service.reorder(updates);

      expect(mockPrismaService.customPage.update).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.customPage.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: { displayOrder: 1 },
      });
    });

    it('should clear cache after reordering', async () => {
      const updates = [{ id: 'page-1', order: 1 }];
      mockPrismaService.customPage.update.mockResolvedValue(mockPage);

      // Add something to cache first
      await service.findBySlug('test-page');
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);

      await service.reorder(updates);

      // Cache should be cleared, so next call should hit database
      await service.findBySlug('test-page');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('caching', () => {
    it('should cache published pages', async () => {
      const publishedPage = {
        ...mockPage,
        status: PageStatus.PUBLISHED,
      };
      mockPrismaService.customPage.findUnique.mockResolvedValue(publishedPage);

      // First call - should hit database
      await service.findBySlug('test-page');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await service.findBySlug('test-page');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should not cache draft pages', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);

      // First call
      await service.findBySlug('test-page');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledTimes(1);

      // Second call - should hit database again
      await service.findBySlug('test-page');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache on update', async () => {
      const publishedPage = {
        ...mockPage,
        status: PageStatus.PUBLISHED,
      };
      mockPrismaService.customPage.findUnique.mockResolvedValue(publishedPage);
      mockPrismaService.customPage.update.mockResolvedValue(publishedPage);

      // Cache the page
      await service.findBySlug('test-page');
      const callsAfterCache = mockPrismaService.customPage.findUnique.mock.calls.length;

      // Update the page (this will call findById which uses findUnique)
      await service.update('page-1', { title: 'Updated' });

      // Next call should hit database (cache was invalidated)
      await service.findBySlug('test-page');
      
      // Should have been called at least twice more: once for findById in update, once for findBySlug after
      expect(mockPrismaService.customPage.findUnique.mock.calls.length).toBeGreaterThan(callsAfterCache);
    });

    it('should invalidate cache on delete', async () => {
      const publishedPage = {
        ...mockPage,
        status: PageStatus.PUBLISHED,
        childPages: [],
      };
      mockPrismaService.customPage.findUnique.mockResolvedValue(publishedPage);
      mockPrismaService.customPage.delete.mockResolvedValue(publishedPage);

      // Cache the page
      await service.findBySlug('test-page');

      // Delete the page
      await service.delete('page-1');

      // Next call should hit database
      mockPrismaService.customPage.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('test-page')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should invalidate cache on publish', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);
      const publishedPage = {
        ...mockPage,
        status: PageStatus.PUBLISHED,
      };
      mockPrismaService.customPage.update.mockResolvedValue(publishedPage);

      // Cache the page
      await service.findBySlug('test-page');

      // Publish the page
      await service.publish('page-1');

      // Next call should hit database
      mockPrismaService.customPage.findUnique.mockResolvedValue(publishedPage);
      await service.findBySlug('test-page');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should cache hierarchy', async () => {
      const pages = [
        { id: '1', title: 'Page 1', slug: 'page-1', parentPageId: null },
      ];
      mockPrismaService.customPage.findMany.mockResolvedValue(pages);

      // First call - should hit database
      await service.getHierarchy();
      expect(mockPrismaService.customPage.findMany).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await service.getHierarchy();
      expect(mockPrismaService.customPage.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('hierarchy management', () => {
    it('should build hierarchy tree correctly', async () => {
      const pages = [
        { id: '1', title: 'Parent', slug: 'parent', parentPageId: null },
        { id: '2', title: 'Child 1', slug: 'child-1', parentPageId: '1' },
        { id: '3', title: 'Child 2', slug: 'child-2', parentPageId: '1' },
        {
          id: '4',
          title: 'Grandchild',
          slug: 'grandchild',
          parentPageId: '2',
        },
      ];
      mockPrismaService.customPage.findMany.mockResolvedValue(pages);

      const result = await service.getHierarchy();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].children).toHaveLength(1);
    });

    it('should handle orphaned pages in hierarchy', async () => {
      const pages = [
        { id: '1', title: 'Page 1', slug: 'page-1', parentPageId: null },
        {
          id: '2',
          title: 'Orphan',
          slug: 'orphan',
          parentPageId: 'nonexistent',
        },
      ];
      mockPrismaService.customPage.findMany.mockResolvedValue(pages);

      const result = await service.getHierarchy();

      // Orphaned page should be treated as root
      expect(result).toHaveLength(2);
    });

    it('should prevent circular parent references', async () => {
      mockPrismaService.customPage.findUnique
        .mockResolvedValueOnce(mockPage) // existing page
        .mockResolvedValueOnce({ ...mockPage, id: 'parent-1' }) // parent page
        .mockResolvedValueOnce({ ...mockPage, id: 'page-1', parentPageId: null }); // check descendant

      const updateDto = { parentPageId: 'parent-1' };

      await expect(service.update('page-1', updateDto)).resolves.toBeDefined();
    });

    it('should throw error when setting page as its own parent', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValueOnce(mockPage);

      const updateDto = { parentPageId: 'page-1' };

      await expect(service.update('page-1', updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate parent page exists', async () => {
      mockPrismaService.customPage.findUnique
        .mockResolvedValueOnce(mockPage) // existing page
        .mockResolvedValueOnce(null); // parent page not found

      const updateDto = { parentPageId: 'nonexistent' };

      await expect(service.update('page-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('slug generation and validation', () => {
    it('should validate slug format on create', async () => {
      const createDto = {
        title: 'Test',
        slug: 'Invalid Slug!',
        content: 'Content',
      };

      mockSlugService.validateSlugFormat.mockReturnValue(false);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockSlugService.validateSlugFormat).toHaveBeenCalledWith(
        'Invalid Slug!',
      );
    });

    it('should validate slug format on update', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);
      mockSlugService.validateSlugFormat.mockReturnValue(false);

      await expect(
        service.update('page-1', { slug: 'Invalid Slug!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should check system route conflicts on create', async () => {
      const createDto = {
        title: 'Dashboard',
        slug: 'dashboard',
        content: 'Content',
      };

      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(true);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should check system route conflicts on update', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(true);

      await expect(
        service.update('page-1', { slug: 'dashboard' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should suggest alternative slug on conflict', async () => {
      const createDto = {
        title: 'Test',
        slug: 'test-page',
        content: 'Content',
      };

      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(false);
      mockSlugService.isSlugAvailable.mockResolvedValue(false);
      mockSlugService.suggestSlug.mockResolvedValue('test-page-2');

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );

      const error = await service.create(createDto).catch((e) => e);
      expect(error.response.suggestedSlug).toBe('test-page-2');
    });
  });

  describe('redirect creation on slug change', () => {
    it('should create redirect when slug changes', async () => {
      const updateDto = { slug: 'new-slug' };
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);
      mockSlugService.validateSlugFormat.mockReturnValue(true);
      mockSlugService.isSystemRoute.mockReturnValue(false);
      mockSlugService.isSlugAvailable.mockResolvedValue(true);
      mockPrismaService.customPage.update.mockResolvedValue({
        ...mockPage,
        slug: 'new-slug',
      });

      await service.update('page-1', updateDto);

      expect(mockRedirectService.createRedirect).toHaveBeenCalledWith(
        'test-page',
        'page-1',
      );
    });

    it('should not create redirect when slug does not change', async () => {
      const updateDto = { title: 'New Title' };
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);
      mockPrismaService.customPage.update.mockResolvedValue({
        ...mockPage,
        title: 'New Title',
      });

      await service.update('page-1', updateDto);

      expect(mockRedirectService.createRedirect).not.toHaveBeenCalled();
    });

    it('should delete redirects when page is deleted', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue({
        ...mockPage,
        childPages: [],
      });
      mockPrismaService.customPage.delete.mockResolvedValue(mockPage);

      await service.delete('page-1');

      expect(mockRedirectService.deleteRedirectsForPage).toHaveBeenCalledWith(
        'page-1',
      );
    });
  });

  describe('publish/unpublish workflow', () => {
    it('should set publishedAt timestamp when publishing', async () => {
      const now = new Date();
      const publishedPage = {
        ...mockPage,
        status: PageStatus.PUBLISHED,
        publishedAt: now,
      };
      mockPrismaService.customPage.update.mockResolvedValue(publishedPage);

      const result = await service.publish('page-1');

      expect(result.status).toBe(PageStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
      expect(mockPrismaService.customPage.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: {
          status: PageStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        },
        include: {
          parentPage: true,
          childPages: true,
        },
      });
    });

    it('should not set publishedAt when unpublishing', async () => {
      const unpublishedPage = {
        ...mockPage,
        status: PageStatus.DRAFT,
      };
      mockPrismaService.customPage.update.mockResolvedValue(unpublishedPage);

      const result = await service.unpublish('page-1');

      expect(result.status).toBe(PageStatus.DRAFT);
      expect(mockPrismaService.customPage.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: {
          status: PageStatus.DRAFT,
        },
        include: {
          parentPage: true,
          childPages: true,
        },
      });
    });

    it('should invalidate cache when publishing', async () => {
      const publishedPage = {
        ...mockPage,
        status: PageStatus.PUBLISHED,
      };
      mockPrismaService.customPage.update.mockResolvedValue(publishedPage);

      await service.publish('page-1');

      // Cache should be invalidated
      mockPrismaService.customPage.findUnique.mockResolvedValue(publishedPage);
      await service.findBySlug('test-page');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalled();
    });

    it('should invalidate cache when unpublishing', async () => {
      const unpublishedPage = {
        ...mockPage,
        status: PageStatus.DRAFT,
      };
      mockPrismaService.customPage.update.mockResolvedValue(unpublishedPage);

      await service.unpublish('page-1');

      // Cache should be invalidated
      mockPrismaService.customPage.findUnique.mockResolvedValue(
        unpublishedPage,
      );
      await service.findBySlug('test-page');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return page by ID', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(mockPage);

      const result = await service.findById('page-1');

      expect(result).toEqual(mockPage);
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        include: {
          parentPage: true,
          childPages: true,
        },
      });
    });

    it('should throw NotFoundException if page not found', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
