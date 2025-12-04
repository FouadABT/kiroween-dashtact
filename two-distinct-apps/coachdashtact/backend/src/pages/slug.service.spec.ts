import { Test, TestingModule } from '@nestjs/testing';
import { SlugService } from './slug.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SlugService', () => {
  let service: SlugService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customPage: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlugService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SlugService>(SlugService);
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
      expect(service.generateSlug('My First Page')).toBe('my-first-page');
    });

    it('should remove special characters', () => {
      expect(service.generateSlug('Hello! World?')).toBe('hello-world');
      expect(service.generateSlug('Page #1 @ 2024')).toBe('page-1-2024');
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

    it('should handle titles with underscores', () => {
      // Underscores are treated as word characters and kept
      expect(service.generateSlug('hello_world_page')).toBe('hello_world_page');
    });

    it('should handle titles with numbers', () => {
      expect(service.generateSlug('Page 123')).toBe('page-123');
    });

    it('should handle titles with mixed case', () => {
      expect(service.generateSlug('CamelCaseTitle')).toBe('camelcasetitle');
    });
  });

  describe('validateSlugFormat', () => {
    it('should return true for valid slug format', () => {
      expect(service.validateSlugFormat('hello-world')).toBe(true);
      expect(service.validateSlugFormat('page-123')).toBe(true);
      expect(service.validateSlugFormat('about-us')).toBe(true);
    });

    it('should return false for uppercase letters', () => {
      expect(service.validateSlugFormat('Hello-World')).toBe(false);
      expect(service.validateSlugFormat('ABOUT')).toBe(false);
    });

    it('should return false for spaces', () => {
      expect(service.validateSlugFormat('hello world')).toBe(false);
    });

    it('should return false for special characters', () => {
      expect(service.validateSlugFormat('hello!world')).toBe(false);
      expect(service.validateSlugFormat('hello@world')).toBe(false);
      expect(service.validateSlugFormat('hello#world')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.validateSlugFormat('')).toBe(false);
    });

    it('should return false for slug exceeding 200 characters', () => {
      const longSlug = 'a'.repeat(201);
      expect(service.validateSlugFormat(longSlug)).toBe(false);
    });

    it('should return true for slug with exactly 200 characters', () => {
      const maxSlug = 'a'.repeat(200);
      expect(service.validateSlugFormat(maxSlug)).toBe(true);
    });

    it('should not allow underscores', () => {
      // The regex /^[a-z0-9-]+$/ only allows lowercase letters, numbers, and hyphens
      expect(service.validateSlugFormat('hello_world')).toBe(false);
    });

    it('should allow numbers', () => {
      expect(service.validateSlugFormat('123')).toBe(true);
      expect(service.validateSlugFormat('page-123')).toBe(true);
    });
  });

  describe('isSlugAvailable', () => {
    it('should return true if slug is not used', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue(null);

      const result = await service.isSlugAvailable('hello-world');

      expect(result).toBe(true);
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledWith({
        where: { slug: 'hello-world' },
      });
    });

    it('should return false if slug is already used', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue({
        id: 'page-123',
        slug: 'hello-world',
      });

      const result = await service.isSlugAvailable('hello-world');

      expect(result).toBe(false);
    });

    it('should return true if slug is used by the same page (excludeId)', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue({
        id: 'page-123',
        slug: 'hello-world',
      });

      const result = await service.isSlugAvailable('hello-world', 'page-123');

      expect(result).toBe(true);
    });

    it('should return false if slug is used by a different page', async () => {
      mockPrismaService.customPage.findUnique.mockResolvedValue({
        id: 'page-456',
        slug: 'hello-world',
      });

      const result = await service.isSlugAvailable('hello-world', 'page-123');

      expect(result).toBe(false);
    });
  });

  describe('isSystemRoute', () => {
    it('should return true for system routes', () => {
      expect(service.isSystemRoute('dashboard')).toBe(true);
      expect(service.isSystemRoute('login')).toBe(true);
      expect(service.isSystemRoute('signup')).toBe(true);
      expect(service.isSystemRoute('api')).toBe(true);
      expect(service.isSystemRoute('admin')).toBe(true);
    });

    it('should return false for non-system routes', () => {
      expect(service.isSystemRoute('about')).toBe(false);
      expect(service.isSystemRoute('contact')).toBe(false);
      expect(service.isSystemRoute('hello-world')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(service.isSystemRoute('DASHBOARD')).toBe(true);
      expect(service.isSystemRoute('Dashboard')).toBe(true);
      expect(service.isSystemRoute('DashBoard')).toBe(true);
    });

    it('should check all system routes', () => {
      const systemRoutes = [
        'dashboard',
        'login',
        'signup',
        'logout',
        'api',
        'auth',
        'admin',
        'settings',
        'profile',
        'users',
        'roles',
        'permissions',
        'notifications',
        'blog',
        'pages',
        'landing',
        'uploads',
        '_next',
        'static',
      ];

      systemRoutes.forEach((route) => {
        expect(service.isSystemRoute(route)).toBe(true);
      });
    });
  });

  describe('suggestSlug', () => {
    it('should return slug with -2 if base slug is taken', async () => {
      // First call checks hello-world-2, which is available
      mockPrismaService.customPage.findUnique.mockResolvedValueOnce(null);

      const result = await service.suggestSlug('hello-world');

      expect(result).toBe('hello-world-2');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should increment number until unique slug found', async () => {
      // Checks hello-world-2 (taken), hello-world-3 (taken), hello-world-4 (available)
      mockPrismaService.customPage.findUnique
        .mockResolvedValueOnce({ id: 'page-1', slug: 'hello-world-2' })
        .mockResolvedValueOnce({ id: 'page-2', slug: 'hello-world-3' })
        .mockResolvedValueOnce(null);

      const result = await service.suggestSlug('hello-world');

      expect(result).toBe('hello-world-4');
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledTimes(3);
    });

    it('should handle base slug with existing number', async () => {
      // Checks hello-world-1-2 (available)
      mockPrismaService.customPage.findUnique.mockResolvedValueOnce(null);

      const result = await service.suggestSlug('hello-world-1');

      expect(result).toBe('hello-world-1-2');
    });

    it('should find first available number', async () => {
      // Checks about-2 (taken), about-3 (available)
      mockPrismaService.customPage.findUnique
        .mockResolvedValueOnce({ id: 'page-1', slug: 'about-2' })
        .mockResolvedValueOnce(null);

      const result = await service.suggestSlug('about');

      expect(result).toBe('about-3');
    });
  });

  describe('Integration: generateSlug + validateSlugFormat', () => {
    it('should generate valid slug from title', () => {
      const title = 'My New Page';
      const slug = service.generateSlug(title);
      
      expect(service.validateSlugFormat(slug)).toBe(true);
    });

    it('should generate valid slug from complex title', () => {
      const title = 'The Ultimate Guide to Next.js 14!';
      const slug = service.generateSlug(title);
      
      expect(service.validateSlugFormat(slug)).toBe(true);
    });

    it('should generate valid slug from title with special characters', () => {
      const title = 'Hello! World? #2024';
      const slug = service.generateSlug(title);
      
      expect(service.validateSlugFormat(slug)).toBe(true);
    });
  });

  describe('Integration: generateSlug + isSystemRoute', () => {
    it('should not generate system route slugs from normal titles', () => {
      const titles = [
        'About Us',
        'Contact Page',
        'Our Services',
        'Privacy Policy',
      ];

      titles.forEach((title) => {
        const slug = service.generateSlug(title);
        expect(service.isSystemRoute(slug)).toBe(false);
      });
    });

    it('should detect if generated slug conflicts with system route', () => {
      const title = 'Dashboard Overview';
      const slug = service.generateSlug(title);
      
      // This would generate 'dashboard-overview', which doesn't conflict
      expect(service.isSystemRoute(slug)).toBe(false);
    });
  });
});
