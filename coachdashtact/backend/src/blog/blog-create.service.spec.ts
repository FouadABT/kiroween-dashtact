import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';

describe('BlogService - Create Operations', () => {
  let service: BlogService;
  let prisma: PrismaService;

  const mockPrismaService = {
    blogPost: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    blogCategory: {
      findMany: jest.fn(),
    },
    blogTag: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      const slug = service.generateSlug('My Blog Post Title');
      expect(slug).toBe('my-blog-post-title');
    });

    it('should replace spaces with hyphens', () => {
      const slug = service.generateSlug('Multiple   Spaces   Here');
      expect(slug).toBe('multiple-spaces-here');
    });

    it('should remove special characters', () => {
      const slug = service.generateSlug('Title with @#$% special chars!');
      expect(slug).toBe('title-with-special-chars');
    });

    it('should handle multiple hyphens', () => {
      const slug = service.generateSlug('Title---with---hyphens');
      expect(slug).toBe('title-with-hyphens');
    });

    it('should remove leading and trailing hyphens', () => {
      const slug = service.generateSlug('---Title---');
      expect(slug).toBe('title');
    });

    it('should handle empty string', () => {
      const slug = service.generateSlug('');
      expect(slug).toBe('');
    });

    it('should handle unicode characters', () => {
      const slug = service.generateSlug('Café & Résumé');
      expect(slug).toBe('caf-rsum');
    });
  });

  describe('ensureUniqueSlug', () => {
    it('should return original slug if unique', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      const slug = await service.ensureUniqueSlug('unique-slug');
      expect(slug).toBe('unique-slug');
      expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
        where: { slug: 'unique-slug' },
      });
    });

    it('should append number if slug exists', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({ id: '1', slug: 'existing-slug' })
        .mockResolvedValueOnce(null);

      const slug = await service.ensureUniqueSlug('existing-slug');
      expect(slug).toBe('existing-slug-1');
    });

    it('should increment number until unique slug found', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({ id: '1', slug: 'popular-slug' })
        .mockResolvedValueOnce({ id: '2', slug: 'popular-slug-1' })
        .mockResolvedValueOnce({ id: '3', slug: 'popular-slug-2' })
        .mockResolvedValueOnce(null);

      const slug = await service.ensureUniqueSlug('popular-slug');
      expect(slug).toBe('popular-slug-3');
    });

    it('should allow same slug for excluded ID', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue({
        id: 'post-123',
        slug: 'my-slug',
      });

      const slug = await service.ensureUniqueSlug('my-slug', 'post-123');
      expect(slug).toBe('my-slug');
    });
  });

  describe('create', () => {
    const mockCreatedPost = {
      id: 'post-123',
      title: 'Test Post',
      slug: 'test-post',
      content: 'Content',
      excerpt: null,
      featuredImage: null,
      status: PostStatus.DRAFT,
      authorId: 'user-123',
      authorName: null,
      authorEmail: null,
      metaTitle: null,
      metaDescription: null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      },
      categories: [],
      tags: [],
    };

    it('should create post with auto-generated slug', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(mockCreatedPost);

      const result = await service.create(
        {
          title: 'Test Post',
          content: 'Content',
        },
        'user-123',
      );

      expect(result).toEqual(mockCreatedPost);
      expect(prisma.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Post',
          slug: 'test-post',
          content: 'Content',
          status: PostStatus.DRAFT,
          authorId: 'user-123',
        }),
        include: expect.any(Object),
      });
    });

    it('should create post with custom slug', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue({
        ...mockCreatedPost,
        slug: 'custom-slug',
      });

      const result = await service.create(
        {
          title: 'Test Post',
          slug: 'custom-slug',
          content: 'Content',
        },
        'user-123',
      );

      expect(result.slug).toBe('custom-slug');
      expect(prisma.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'custom-slug',
        }),
        include: expect.any(Object),
      });
    });

    it('should ensure custom slug is unique', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({ id: '1', slug: 'taken-slug' })
        .mockResolvedValueOnce(null);
      mockPrismaService.blogPost.create.mockResolvedValue({
        ...mockCreatedPost,
        slug: 'taken-slug-1',
      });

      const result = await service.create(
        {
          title: 'Test Post',
          slug: 'taken-slug',
          content: 'Content',
        },
        'user-123',
      );

      expect(result.slug).toBe('taken-slug-1');
    });

    it('should create post with all optional fields', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue({
        ...mockCreatedPost,
        excerpt: 'Excerpt',
        featuredImage: '/image.jpg',
        metaTitle: 'SEO Title',
        metaDescription: 'SEO Description',
      });

      const result = await service.create(
        {
          title: 'Test Post',
          slug: 'test-post',
          excerpt: 'Excerpt',
          content: 'Content',
          featuredImage: '/image.jpg',
          metaTitle: 'SEO Title',
          metaDescription: 'SEO Description',
        },
        'user-123',
      );

      expect(result.excerpt).toBe('Excerpt');
      expect(result.featuredImage).toBe('/image.jpg');
      expect(result.metaTitle).toBe('SEO Title');
      expect(result.metaDescription).toBe('SEO Description');
    });

    it('should set publishedAt when status is PUBLISHED', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue({
        ...mockCreatedPost,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      await service.create(
        {
          title: 'Test Post',
          content: 'Content',
          status: PostStatus.PUBLISHED,
        },
        'user-123',
      );

      expect(prisma.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: PostStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });

    it('should not set publishedAt when status is DRAFT', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(mockCreatedPost);

      await service.create(
        {
          title: 'Test Post',
          content: 'Content',
          status: PostStatus.DRAFT,
        },
        'user-123',
      );

      expect(prisma.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: PostStatus.DRAFT,
          publishedAt: null,
        }),
        include: expect.any(Object),
      });
    });

    it('should connect categories if provided', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(mockCreatedPost);

      await service.create(
        {
          title: 'Test Post',
          content: 'Content',
          categoryIds: ['cat-1', 'cat-2'],
        },
        'user-123',
      );

      expect(prisma.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          categories: {
            connect: [{ id: 'cat-1' }, { id: 'cat-2' }],
          },
        }),
        include: expect.any(Object),
      });
    });

    it('should connect tags if provided', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(mockCreatedPost);

      await service.create(
        {
          title: 'Test Post',
          content: 'Content',
          tagIds: ['tag-1', 'tag-2'],
        },
        'user-123',
      );

      expect(prisma.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tags: {
            connect: [{ id: 'tag-1' }, { id: 'tag-2' }],
          },
        }),
        include: expect.any(Object),
      });
    });
  });
});
