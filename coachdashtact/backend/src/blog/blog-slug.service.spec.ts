import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BlogService - Slug Generation and Validation', () => {
  let service: BlogService;
  let prisma: PrismaService;

  const mockPrismaService = {
    blogPost: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      expect(service.generateSlug('Hello World')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      expect(service.generateSlug('My First Post')).toBe('my-first-post');
    });

    it('should remove special characters', () => {
      expect(service.generateSlug('Hello! World?')).toBe('hello-world');
      expect(service.generateSlug('Post #1 @ 2024')).toBe('post-1-2024');
    });

    it('should handle multiple spaces', () => {
      expect(service.generateSlug('Hello    World')).toBe('hello-world');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(service.generateSlug('-Hello World-')).toBe('hello-world');
    });

    it('should handle consecutive hyphens', () => {
      expect(service.generateSlug('Hello---World')).toBe('hello-world');
    });

    it('should trim whitespace', () => {
      expect(service.generateSlug('  Hello World  ')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(service.generateSlug('')).toBe('');
    });

    it('should handle complex titles', () => {
      expect(service.generateSlug('The Ultimate Guide to Next.js 14!')).toBe(
        'the-ultimate-guide-to-nextjs-14',
      );
    });
  });

  describe('ensureUniqueSlug', () => {
    it('should return original slug if available', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      const result = await service.ensureUniqueSlug('hello-world');

      expect(result).toBe('hello-world');
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledWith({
        where: { slug: 'hello-world' },
      });
    });

    it('should append number if slug is taken', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({ id: '1', slug: 'hello-world' })
        .mockResolvedValueOnce(null);

      const result = await service.ensureUniqueSlug('hello-world');

      expect(result).toBe('hello-world-1');
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should increment number until unique slug found', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({ id: '1', slug: 'hello-world' })
        .mockResolvedValueOnce({ id: '2', slug: 'hello-world-1' })
        .mockResolvedValueOnce({ id: '3', slug: 'hello-world-2' })
        .mockResolvedValueOnce(null);

      const result = await service.ensureUniqueSlug('hello-world');

      expect(result).toBe('hello-world-3');
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledTimes(4);
    });

    it('should allow same slug for excluded post ID', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue({
        id: 'post-123',
        slug: 'hello-world',
      });

      const result = await service.ensureUniqueSlug('hello-world', 'post-123');

      expect(result).toBe('hello-world');
      expect(mockPrismaService.blogPost.findUnique).toHaveBeenCalledWith({
        where: { slug: 'hello-world' },
      });
    });
  });

  describe('validateSlug', () => {
    it('should return available for unused slug', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);

      const result = await service.validateSlug('hello-world');

      expect(result.available).toBe(true);
      expect(result.slug).toBe('hello-world');
      expect(result.message).toBe('Slug is available');
    });

    it('should return unavailable for taken slug', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue({
        id: 'post-123',
        title: 'Hello World',
        status: 'PUBLISHED',
      });

      const result = await service.validateSlug('hello-world');

      expect(result.available).toBe(false);
      expect(result.message).toContain('already in use');
      expect(result.existingPost).toBeDefined();
      expect(result.existingPost?.title).toBe('Hello World');
    });

    it('should provide suggestions for taken slug', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({
          id: 'post-123',
          title: 'Hello World',
          status: 'PUBLISHED',
        })
        .mockResolvedValueOnce(null) // hello-world-1 available
        .mockResolvedValueOnce(null) // hello-world-2 available
        .mockResolvedValueOnce(null); // hello-world-3 available

      const result = await service.validateSlug('hello-world');

      expect(result.available).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions).toContain('hello-world-1');
      expect(result.suggestions).toContain('hello-world-2');
      expect(result.suggestions).toContain('hello-world-3');
    });

    it('should allow slug for excluded post ID', async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue({
        id: 'post-123',
        title: 'Hello World',
        status: 'PUBLISHED',
      });

      const result = await service.validateSlug('hello-world', 'post-123');

      expect(result.available).toBe(true);
      expect(result.message).toBe('Slug is available');
    });

    it('should skip taken suggestions', async () => {
      mockPrismaService.blogPost.findUnique
        .mockResolvedValueOnce({
          id: 'post-123',
          title: 'Hello World',
          status: 'PUBLISHED',
        })
        .mockResolvedValueOnce({ id: 'post-124' }) // hello-world-1 taken
        .mockResolvedValueOnce(null) // hello-world-2 available
        .mockResolvedValueOnce(null); // hello-world-3 available

      const result = await service.validateSlug('hello-world');

      expect(result.available).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions).toContain('hello-world-2');
      expect(result.suggestions).toContain('hello-world-3');
      expect(result.suggestions).not.toContain('hello-world-1');
    });
  });
});
