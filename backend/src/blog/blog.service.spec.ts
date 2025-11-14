import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogQueryDto } from './dto/blog-query.dto';

describe('BlogService', () => {
  let service: BlogService;
  let prisma: PrismaService;

  const mockPrismaService = {
    blogPost: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    blogCategory: {
      findMany: jest.fn(),
    },
    blogTag: {
      findMany: jest.fn(),
    },
  };

  const mockBlogPost = {
    id: 'post-id-1',
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    excerpt: 'This is a test excerpt',
    content: 'This is the full content of the test blog post',
    featuredImage: 'https://example.com/image.jpg',
    status: PostStatus.PUBLISHED,
    publishedAt: new Date('2024-01-15'),
    authorId: 'user-id-1',
    authorName: null,
    authorEmail: null,
    metaTitle: 'Test Blog Post - Meta',
    metaDescription: 'Meta description for test post',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    author: {
      id: 'user-id-1',
      name: 'Test Author',
      email: 'author@example.com',
    },
    categories: [],
    tags: [],
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should generate slug from title', () => {
      const title = 'My First Blog Post';
      const slug = service.generateSlug(title);
      expect(slug).toBe('my-first-blog-post');
    });

    it('should remove special characters', () => {
      const title = 'Hello! World? #Test @Post';
      const slug = service.generateSlug(title);
      expect(slug).toBe('hello-world-test-post');
    });

    it('should replace spaces with hyphens', () => {
      const title = 'Multiple   Spaces   Between   Words';
      const slug = service.generateSlug(title);
      expect(slug).toBe('multiple-spaces-between-words');
    });

    it('should remove leading and trailing hyphens', () => {
      const title = '  -Leading and Trailing-  ';
      const slug = service.generateSlug(title);
      expect(slug).toBe('leading-and-trailing');
    });

    it('should handle empty string', () => {
      const title = '';
      const slug = service.generateSlug(title);
      expect(slug).toBe('');
    });

    it('should handle unicode characters', () => {
      const title = 'Café & Résumé';
      const slug = service.generateSlug(title);
      expect(slug).toBe('caf-rsum');
    });
  });

  describe('ensureUniqueSlug', () => {
    it('should return original slug if unique', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      const slug = await service.ensureUniqueSlug('unique-slug');

      expect(slug).toBe('unique-slug');
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledWith({
        where: { slug: 'unique-slug' },
      });
    });

    it('should append number if slug exists', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({ id: 'existing-id', slug: 'duplicate-slug' })
        .mockResolvedValueOnce(null);

      const slug = await service.ensureUniqueSlug('duplicate-slug');

      expect(slug).toBe('duplicate-slug-1');
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should increment number until unique slug found', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({ id: 'id-1', slug: 'popular-slug' })
        .mockResolvedValueOnce({ id: 'id-2', slug: 'popular-slug-1' })
        .mockResolvedValueOnce({ id: 'id-3', slug: 'popular-slug-2' })
        .mockResolvedValueOnce(null);

      const slug = await service.ensureUniqueSlug('popular-slug');

      expect(slug).toBe('popular-slug-3');
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledTimes(4);
    });

    it('should allow same slug when updating same post', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue({
        id: 'post-id-1',
        slug: 'my-slug',
      });

      const slug = await service.ensureUniqueSlug('my-slug', 'post-id-1');

      expect(slug).toBe('my-slug');
    });
  });

  describe('create', () => {
    const createDto: CreateBlogPostDto = {
      title: 'New Blog Post',
      content: 'Content of the new blog post',
      excerpt: 'Short excerpt',
      status: PostStatus.DRAFT,
    };

    it('should create a blog post with generated slug', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(mockBlogPost);

      const result = await service.create(createDto, 'user-id-1');

      expect(result).toEqual(mockBlogPost);
      expect(mockPrismaService.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createDto.title,
          slug: 'new-blog-post',
          content: createDto.content,
          excerpt: createDto.excerpt,
          status: PostStatus.DRAFT,
          authorId: 'user-id-1',
          publishedAt: null,
        }),
        include: expect.any(Object),
      });
    });

    it('should use provided slug if given', async () => {
      const dtoWithSlug = { ...createDto, slug: 'custom-slug' };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(mockBlogPost);

      await service.create(dtoWithSlug, 'user-id-1');

      expect(mockPrismaService.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'custom-slug',
        }),
        include: expect.any(Object),
      });
    });

    it('should set publishedAt when status is PUBLISHED', async () => {
      const publishedDto = { ...createDto, status: PostStatus.PUBLISHED };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(mockBlogPost);

      await service.create(publishedDto, 'user-id-1');

      expect(mockPrismaService.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: PostStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });

    it('should connect categories if provided', async () => {
      const dtoWithCategories = {
        ...createDto,
        categoryIds: ['cat-1', 'cat-2'],
      };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue(mockBlogPost);

      await service.create(dtoWithCategories, 'user-id-1');

      expect(mockPrismaService.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          categories: {
            connect: [{ id: 'cat-1' }, { id: 'cat-2' }],
          },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findPublished', () => {
    it('should return only published posts', async () => {
      const publishedPosts = [
        { ...mockBlogPost, id: 'post-1', status: PostStatus.PUBLISHED },
        { ...mockBlogPost, id: 'post-2', status: PostStatus.PUBLISHED },
      ];

      mockPrismaService.blogPost.findMany.mockResolvedValue(publishedPosts);
      mockPrismaService.blogPost.count.mockResolvedValue(2);

      const query: BlogQueryDto = { page: 1, limit: 10 };
      const result = await service.findPublished(query);

      expect(result.posts).toEqual(publishedPosts);
      expect(result.pagination.total).toBe(2);
      expect(mockPrismaService.blogPost.findMany).toHaveBeenCalledWith({
        where: { status: PostStatus.PUBLISHED },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.objectContaining({
          author: expect.any(Object),
          categories: true,
          tags: true,
        }),
      });
    });

    it('should not return draft posts', async () => {
      mockPrismaService.blogPost.findMany.mockResolvedValue([]);
      mockPrismaService.blogPost.count.mockResolvedValue(0);

      const query: BlogQueryDto = { page: 1, limit: 10 };
      const result = await service.findPublished(query);

      expect(mockPrismaService.blogPost.findMany).toHaveBeenCalledWith({
        where: { status: PostStatus.PUBLISHED },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.objectContaining({
          author: expect.any(Object),
          categories: true,
          tags: true,
        }),
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.blogPost.findMany.mockResolvedValue([]);
      mockPrismaService.blogPost.count.mockResolvedValue(25);

      const query: BlogQueryDto = { page: 2, limit: 10 };
      const result = await service.findPublished(query);

      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
      expect(mockPrismaService.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findBySlug', () => {
    it('should return published post by slug', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(mockBlogPost);

      const result = await service.findBySlug('test-blog-post');

      expect(result).toEqual(mockBlogPost);
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-blog-post' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent-slug')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if post is not published', async () => {
      const draftPost = { ...mockBlogPost, status: PostStatus.DRAFT };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(draftPost);

      await expect(service.findBySlug('test-blog-post')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return archived post if published', async () => {
      const archivedPost = { ...mockBlogPost, status: PostStatus.ARCHIVED };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(archivedPost);

      await expect(service.findBySlug('test-blog-post')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return post by ID', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(mockBlogPost);

      const result = await service.findOne('post-id-1');

      expect(result).toEqual(mockBlogPost);
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateBlogPostDto = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    it('should update blog post', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(mockBlogPost);
      mockPrismaService.blogPost.update.mockResolvedValue({
        ...mockBlogPost,
        ...updateDto,
      });

      const result = await service.update('post-id-1', updateDto);

      expect(result.title).toBe(updateDto.title);
      expect(mockPrismaService.blogPost.update).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
        data: expect.objectContaining(updateDto),
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce(mockBlogPost)
        .mockResolvedValueOnce({ id: 'different-id', slug: 'existing-slug' });

      const updateWithSlug = { ...updateDto, slug: 'existing-slug' };

      await expect(service.update('post-id-1', updateWithSlug)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow updating to same slug', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce(mockBlogPost)
        .mockResolvedValueOnce(mockBlogPost);
      mockPrismaService.blogPost.update.mockResolvedValue(mockBlogPost);

      const updateWithSlug = { ...updateDto, slug: 'test-blog-post' };

      await expect(
        service.update('post-id-1', updateWithSlug),
      ).resolves.not.toThrow();
    });
  });

  describe('publish', () => {
    it('should publish a draft post', async () => {
      const draftPost = { ...mockBlogPost, status: PostStatus.DRAFT };
      mockPrismaService.blogPost.findUnique.mockResolvedValue(draftPost);
      mockPrismaService.blogPost.update.mockResolvedValue({
        ...draftPost,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      const result = await service.publish('post-id-1');

      expect(result.status).toBe(PostStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
      expect(mockPrismaService.blogPost.update).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      await expect(service.publish('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unpublish', () => {
    it('should unpublish a published post', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(mockBlogPost);
      mockPrismaService.blogPost.update.mockResolvedValue({
        ...mockBlogPost,
        status: PostStatus.DRAFT,
      });

      const result = await service.unpublish('post-id-1');

      expect(result.status).toBe(PostStatus.DRAFT);
      expect(mockPrismaService.blogPost.update).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
        data: { status: PostStatus.DRAFT },
        include: expect.any(Object),
      });
    });
  });

  describe('remove', () => {
    it('should delete a blog post', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(mockBlogPost);
      mockPrismaService.blogPost.delete.mockResolvedValue(mockBlogPost);

      const result = await service.remove('post-id-1');

      expect(result).toEqual(mockBlogPost);
      expect(mockPrismaService.blogPost.delete).toHaveBeenCalledWith({
        where: { id: 'post-id-1' },
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
