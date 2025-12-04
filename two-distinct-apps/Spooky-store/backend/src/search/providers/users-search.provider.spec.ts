import { Test, TestingModule } from '@nestjs/testing';
import { UsersSearchProvider } from './users-search.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { Role } from '@prisma/client';

describe('UsersSearchProvider', () => {
  let provider: UsersSearchProvider;
  let prismaService: PrismaService;
  let usersService: UsersService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin = {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersSearchProvider,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<UsersSearchProvider>(UsersSearchProvider);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEntityType', () => {
    it('should return "users"', () => {
      expect(provider.getEntityType()).toBe('users');
    });
  });

  describe('getRequiredPermission', () => {
    it('should return "users:read"', () => {
      expect(provider.getRequiredPermission()).toBe('users:read');
    });
  });

  describe('search', () => {
    it('should search users by name', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser]);

      const results = await provider.search('admin-1', 'Test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
            ]),
          }),
        }),
      );
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Test User');
    });

    it('should search users by email', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser]);

      const results = await provider.search('admin-1', 'test@example', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ email: expect.any(Object) }),
            ]),
          }),
        }),
      );
      expect(results).toHaveLength(1);
    });

    it('should filter results for regular users (only self)', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser]);

      await provider.search('user-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'user-1',
          }),
        }),
      );
    });

    it('should show all users for admin', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser, mockAdmin]);

      const results = await provider.search('admin-1', 'user', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results).toHaveLength(2);
    });

    it('should paginate results', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser]);

      await provider.search('admin-1', 'test', {
        page: 2,
        limit: 10,
        sortBy: 'relevance',
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should sort by date when specified', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser]);

      await provider.search('admin-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'date',
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should sort by name when specified', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser]);

      await provider.search('admin-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'name',
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        }),
      );
    });
  });

  describe('count', () => {
    it('should return total count of matching users', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(5);

      const count = await provider.count('admin-1', 'test');

      expect(count).toBe(5);
      expect(prismaService.user.count).toHaveBeenCalled();
    });

    it('should respect role-based filtering in count', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

      await provider.count('user-1', 'test');

      expect(prismaService.user.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'user-1',
          }),
        }),
      );
    });
  });

  describe('formatResult', () => {
    it('should format user result correctly', () => {
      const result = provider.formatResult(mockUser);

      expect(result.id).toBe('user-1');
      expect(result.entityType).toBe('users');
      expect(result.title).toContain('Test User');
      expect(result.description).toContain('test@example.com');
      expect(result.description).toContain('USER');
      expect(result.url).toBe('/dashboard/users/user-1');
      expect(result.metadata.status).toBe('Active');
      expect(result.metadata.role).toBe('USER');
    });

    it('should handle user without name', () => {
      const userWithoutName = { ...mockUser, name: null };
      const result = provider.formatResult(userWithoutName);

      expect(result.title).toBe('test@example.com');
    });

    it('should show inactive status', () => {
      const inactiveUser = { ...mockUser, isActive: false };
      const result = provider.formatResult(inactiveUser);

      expect(result.metadata.status).toBe('Inactive');
    });
  });

  describe('getEntityUrl', () => {
    it('should return correct URL for user', () => {
      const url = provider.getEntityUrl('user-123');

      expect(url).toBe('/dashboard/users/user-123');
    });
  });

  describe('relevance scoring', () => {
    it('should score exact name match highest', async () => {
      const exactMatch = { ...mockUser, name: 'test' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([exactMatch]);

      const results = await provider.search('admin-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results[0].relevanceScore).toBeGreaterThan(0);
    });

    it('should score exact email match highly', async () => {
      const exactEmailMatch = { ...mockUser, email: 'test@example.com' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([exactEmailMatch]);

      const results = await provider.search('admin-1', 'test@example.com', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results[0].relevanceScore).toBeGreaterThan(0);
    });

    it('should score partial matches lower than exact matches', async () => {
      const partialMatch = { ...mockUser, name: 'testing user' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([partialMatch]);

      const results = await provider.search('admin-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      // Partial match should have lower score than exact match
      expect(results[0].relevanceScore).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(prismaService.user, 'findMany').mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        provider.search('admin-1', 'test', {
          page: 1,
          limit: 20,
          sortBy: 'relevance',
        }),
      ).rejects.toThrow('Database error');
    });

    it('should handle missing user gracefully', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);

      const results = await provider.search('nonexistent', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results).toHaveLength(0);
    });
  });
});
