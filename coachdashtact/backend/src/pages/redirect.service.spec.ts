import { Test, TestingModule } from '@nestjs/testing';
import { RedirectService } from './redirect.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RedirectService', () => {
  let service: RedirectService;
  let prisma: PrismaService;

  const mockPrismaService = {
    pageRedirect: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirectService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RedirectService>(RedirectService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRedirect', () => {
    it('should create a new redirect when none exists', async () => {
      const fromSlug = 'old-page';
      const toPageId = 'page-123';
      const mockRedirect = {
        id: 'redirect-1',
        fromSlug,
        toPageId,
        redirectType: 301,
        createdAt: new Date(),
      };

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue(null);
      mockPrismaService.pageRedirect.create.mockResolvedValue(mockRedirect);

      const result = await service.createRedirect(fromSlug, toPageId);

      expect(result).toEqual(mockRedirect);
      expect(mockPrismaService.pageRedirect.findUnique).toHaveBeenCalledWith({
        where: { fromSlug },
      });
      expect(mockPrismaService.pageRedirect.create).toHaveBeenCalledWith({
        data: {
          fromSlug,
          toPageId,
          redirectType: 301,
        },
      });
    });

    it('should update existing redirect to point to new page', async () => {
      const fromSlug = 'old-page';
      const toPageId = 'page-456';
      const existingRedirect = {
        id: 'redirect-1',
        fromSlug,
        toPageId: 'page-123',
        redirectType: 301,
        createdAt: new Date(),
      };
      const updatedRedirect = {
        ...existingRedirect,
        toPageId,
      };

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue(
        existingRedirect,
      );
      mockPrismaService.pageRedirect.update.mockResolvedValue(
        updatedRedirect,
      );

      const result = await service.createRedirect(fromSlug, toPageId);

      expect(result).toEqual(updatedRedirect);
      expect(mockPrismaService.pageRedirect.findUnique).toHaveBeenCalledWith({
        where: { fromSlug },
      });
      expect(mockPrismaService.pageRedirect.update).toHaveBeenCalledWith({
        where: { fromSlug },
        data: { toPageId },
      });
      expect(mockPrismaService.pageRedirect.create).not.toHaveBeenCalled();
    });

    it('should create redirect with 301 status code', async () => {
      const fromSlug = 'about-old';
      const toPageId = 'page-789';

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue(null);
      mockPrismaService.pageRedirect.create.mockResolvedValue({
        id: 'redirect-2',
        fromSlug,
        toPageId,
        redirectType: 301,
        createdAt: new Date(),
      });

      await service.createRedirect(fromSlug, toPageId);

      expect(mockPrismaService.pageRedirect.create).toHaveBeenCalledWith({
        data: {
          fromSlug,
          toPageId,
          redirectType: 301,
        },
      });
    });

    it('should handle multiple redirects from different slugs', async () => {
      const redirects = [
        { fromSlug: 'old-about', toPageId: 'page-1' },
        { fromSlug: 'old-contact', toPageId: 'page-2' },
        { fromSlug: 'old-services', toPageId: 'page-3' },
      ];

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue(null);

      for (const redirect of redirects) {
        mockPrismaService.pageRedirect.create.mockResolvedValueOnce({
          id: `redirect-${redirect.toPageId}`,
          ...redirect,
          redirectType: 301,
          createdAt: new Date(),
        });

        await service.createRedirect(redirect.fromSlug, redirect.toPageId);
      }

      expect(mockPrismaService.pageRedirect.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('resolveRedirect', () => {
    it('should return target page when redirect exists', async () => {
      const slug = 'old-page';
      const mockPage = {
        id: 'page-123',
        title: 'New Page',
        slug: 'new-page',
        content: 'Content',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockRedirect = {
        id: 'redirect-1',
        fromSlug: slug,
        toPageId: 'page-123',
        redirectType: 301,
        createdAt: new Date(),
        toPage: mockPage,
      };

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue(
        mockRedirect,
      );

      const result = await service.resolveRedirect(slug);

      expect(result).toEqual(mockPage);
      expect(mockPrismaService.pageRedirect.findUnique).toHaveBeenCalledWith({
        where: { fromSlug: slug },
        include: { toPage: true },
      });
    });

    it('should return null when redirect does not exist', async () => {
      const slug = 'non-existent-page';

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue(null);

      const result = await service.resolveRedirect(slug);

      expect(result).toBeNull();
      expect(mockPrismaService.pageRedirect.findUnique).toHaveBeenCalledWith({
        where: { fromSlug: slug },
        include: { toPage: true },
      });
    });

    it('should resolve redirect to correct target page', async () => {
      const slug = 'about-us-old';
      const targetPage = {
        id: 'page-456',
        title: 'About Us',
        slug: 'about-us',
        content: 'About content',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue({
        id: 'redirect-2',
        fromSlug: slug,
        toPageId: 'page-456',
        redirectType: 301,
        createdAt: new Date(),
        toPage: targetPage,
      });

      const result = await service.resolveRedirect(slug);

      expect(result).toEqual(targetPage);
      expect(result?.slug).toBe('about-us');
    });

    it('should handle multiple redirect resolutions', async () => {
      const redirects = [
        {
          slug: 'old-1',
          page: { id: 'page-1', slug: 'new-1', title: 'Page 1' },
        },
        {
          slug: 'old-2',
          page: { id: 'page-2', slug: 'new-2', title: 'Page 2' },
        },
      ];

      for (const redirect of redirects) {
        mockPrismaService.pageRedirect.findUnique.mockResolvedValueOnce({
          id: `redirect-${redirect.page.id}`,
          fromSlug: redirect.slug,
          toPageId: redirect.page.id,
          redirectType: 301,
          createdAt: new Date(),
          toPage: {
            ...redirect.page,
            content: 'Content',
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        const result = await service.resolveRedirect(redirect.slug);
        expect(result?.id).toBe(redirect.page.id);
      }
    });

    it('should return null for redirect without toPage relation', async () => {
      const slug = 'orphaned-redirect';

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue({
        id: 'redirect-3',
        fromSlug: slug,
        toPageId: 'page-999',
        redirectType: 301,
        createdAt: new Date(),
        toPage: null,
      });

      const result = await service.resolveRedirect(slug);

      expect(result).toBeNull();
    });
  });

  describe('deleteRedirectsForPage', () => {
    it('should delete all redirects pointing to a page', async () => {
      const pageId = 'page-123';

      mockPrismaService.pageRedirect.deleteMany.mockResolvedValue({
        count: 3,
      });

      await service.deleteRedirectsForPage(pageId);

      expect(mockPrismaService.pageRedirect.deleteMany).toHaveBeenCalledWith({
        where: { toPageId: pageId },
      });
    });

    it('should handle page with no redirects', async () => {
      const pageId = 'page-456';

      mockPrismaService.pageRedirect.deleteMany.mockResolvedValue({
        count: 0,
      });

      await service.deleteRedirectsForPage(pageId);

      expect(mockPrismaService.pageRedirect.deleteMany).toHaveBeenCalledWith({
        where: { toPageId: pageId },
      });
    });

    it('should delete multiple redirects for same page', async () => {
      const pageId = 'page-789';

      mockPrismaService.pageRedirect.deleteMany.mockResolvedValue({
        count: 5,
      });

      await service.deleteRedirectsForPage(pageId);

      expect(mockPrismaService.pageRedirect.deleteMany).toHaveBeenCalledWith({
        where: { toPageId: pageId },
      });
      expect(mockPrismaService.pageRedirect.deleteMany).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should clean up redirects when page is deleted', async () => {
      const pageId = 'page-to-delete';

      mockPrismaService.pageRedirect.deleteMany.mockResolvedValue({
        count: 2,
      });

      await service.deleteRedirectsForPage(pageId);

      expect(mockPrismaService.pageRedirect.deleteMany).toHaveBeenCalledWith({
        where: { toPageId: pageId },
      });
    });

    it('should handle deletion of redirects for multiple pages', async () => {
      const pageIds = ['page-1', 'page-2', 'page-3'];

      for (const pageId of pageIds) {
        mockPrismaService.pageRedirect.deleteMany.mockResolvedValueOnce({
          count: 1,
        });

        await service.deleteRedirectsForPage(pageId);
      }

      expect(mockPrismaService.pageRedirect.deleteMany).toHaveBeenCalledTimes(
        3,
      );
    });
  });

  describe('Integration: createRedirect + resolveRedirect', () => {
    it('should create redirect and then resolve it', async () => {
      const fromSlug = 'old-about';
      const toPageId = 'page-123';
      const targetPage = {
        id: toPageId,
        title: 'About',
        slug: 'about',
        content: 'About content',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create redirect
      mockPrismaService.pageRedirect.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.pageRedirect.create.mockResolvedValueOnce({
        id: 'redirect-1',
        fromSlug,
        toPageId,
        redirectType: 301,
        createdAt: new Date(),
      });

      await service.createRedirect(fromSlug, toPageId);

      // Resolve redirect
      mockPrismaService.pageRedirect.findUnique.mockResolvedValueOnce({
        id: 'redirect-1',
        fromSlug,
        toPageId,
        redirectType: 301,
        createdAt: new Date(),
        toPage: targetPage,
      });

      const result = await service.resolveRedirect(fromSlug);

      expect(result).toEqual(targetPage);
    });
  });

  describe('Integration: createRedirect + deleteRedirectsForPage', () => {
    it('should create redirect and then delete it when page is removed', async () => {
      const fromSlug = 'old-contact';
      const toPageId = 'page-456';

      // Create redirect
      mockPrismaService.pageRedirect.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.pageRedirect.create.mockResolvedValueOnce({
        id: 'redirect-2',
        fromSlug,
        toPageId,
        redirectType: 301,
        createdAt: new Date(),
      });

      await service.createRedirect(fromSlug, toPageId);

      // Delete redirects for page
      mockPrismaService.pageRedirect.deleteMany.mockResolvedValueOnce({
        count: 1,
      });

      await service.deleteRedirectsForPage(toPageId);

      expect(mockPrismaService.pageRedirect.deleteMany).toHaveBeenCalledWith({
        where: { toPageId },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle redirect chain scenario', async () => {
      // Page A -> Page B -> Page C
      // When slug changes: old-a -> page-b, old-b -> page-c
      const redirects = [
        { fromSlug: 'old-a', toPageId: 'page-b' },
        { fromSlug: 'old-b', toPageId: 'page-c' },
      ];

      for (const redirect of redirects) {
        mockPrismaService.pageRedirect.findUnique.mockResolvedValueOnce(null);
        mockPrismaService.pageRedirect.create.mockResolvedValueOnce({
          id: `redirect-${redirect.toPageId}`,
          ...redirect,
          redirectType: 301,
          createdAt: new Date(),
        });

        await service.createRedirect(redirect.fromSlug, redirect.toPageId);
      }

      expect(mockPrismaService.pageRedirect.create).toHaveBeenCalledTimes(2);
    });

    it('should handle updating redirect to same page', async () => {
      const fromSlug = 'old-page';
      const toPageId = 'page-123';
      const existingRedirect = {
        id: 'redirect-1',
        fromSlug,
        toPageId,
        redirectType: 301,
        createdAt: new Date(),
      };

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue(
        existingRedirect,
      );
      mockPrismaService.pageRedirect.update.mockResolvedValue(
        existingRedirect,
      );

      const result = await service.createRedirect(fromSlug, toPageId);

      expect(result).toEqual(existingRedirect);
      expect(mockPrismaService.pageRedirect.update).toHaveBeenCalledWith({
        where: { fromSlug },
        data: { toPageId },
      });
    });

    it('should handle special characters in slug', async () => {
      const fromSlug = 'old-page-with-numbers-123';
      const toPageId = 'page-999';

      mockPrismaService.pageRedirect.findUnique.mockResolvedValue(null);
      mockPrismaService.pageRedirect.create.mockResolvedValue({
        id: 'redirect-special',
        fromSlug,
        toPageId,
        redirectType: 301,
        createdAt: new Date(),
      });

      await service.createRedirect(fromSlug, toPageId);

      expect(mockPrismaService.pageRedirect.create).toHaveBeenCalledWith({
        data: {
          fromSlug,
          toPageId,
          redirectType: 301,
        },
      });
    });
  });
});
