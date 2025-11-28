import { Test, TestingModule } from '@nestjs/testing';
import { ProductsSearchProvider } from './products-search.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { Role, ProductStatus } from '@prisma/client';

describe('ProductsSearchProvider', () => {
  let provider: ProductsSearchProvider;
  let prismaService: PrismaService;
  let usersService: UsersService;

  const mockProduct = {
    id: 'product-1',
    title: 'Test Product',
    description: 'Test description',
    sku: 'TEST-001',
    price: 99.99,
    status: ProductStatus.PUBLISHED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDraftProduct = {
    id: 'product-2',
    title: 'Draft Product',
    description: 'Draft description',
    sku: 'DRAFT-001',
    price: 49.99,
    status: ProductStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    role: Role.USER,
  };

  const mockAdmin = {
    id: 'admin-1',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsSearchProvider,
        {
          provide: PrismaService,
          useValue: {
            product: {
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

    provider = module.get<ProductsSearchProvider>(ProductsSearchProvider);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEntityType', () => {
    it('should return "products"', () => {
      expect(provider.getEntityType()).toBe('products');
    });
  });

  describe('getRequiredPermission', () => {
    it('should return "products:read"', () => {
      expect(provider.getRequiredPermission()).toBe('products:read');
    });
  });

  describe('search', () => {
    it('should search products by title', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([mockProduct]);

      const results = await provider.search('admin-1', 'Test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.any(Object) }),
            ]),
          }),
        }),
      );
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Product');
    });

    it('should search products by description', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([mockProduct]);

      const results = await provider.search('admin-1', 'description', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results).toHaveLength(1);
    });

    it('should search products by SKU', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([mockProduct]);

      const results = await provider.search('admin-1', 'TEST-001', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ sku: expect.any(Object) }),
            ]),
          }),
        }),
      );
      expect(results).toHaveLength(1);
    });

    it('should show only published products for regular users', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([mockProduct]);

      await provider.search('user-1', 'product', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ProductStatus.PUBLISHED,
          }),
        }),
      );
    });

    it('should show all products for admin', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([
        mockProduct,
        mockDraftProduct,
      ]);

      const results = await provider.search('admin-1', 'product', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results).toHaveLength(2);
    });

    it('should paginate results', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([mockProduct]);

      await provider.search('admin-1', 'test', {
        page: 2,
        limit: 10,
        sortBy: 'relevance',
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should sort by date when specified', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([mockProduct]);

      await provider.search('admin-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'date',
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should sort by name when specified', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([mockProduct]);

      await provider.search('admin-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'name',
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { title: 'asc' },
        }),
      );
    });
  });

  describe('count', () => {
    it('should return total count of matching products', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'count').mockResolvedValue(10);

      const count = await provider.count('admin-1', 'test');

      expect(count).toBe(10);
      expect(prismaService.product.count).toHaveBeenCalled();
    });

    it('should respect status filtering in count', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(prismaService.product, 'count').mockResolvedValue(5);

      await provider.count('user-1', 'test');

      expect(prismaService.product.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ProductStatus.PUBLISHED,
          }),
        }),
      );
    });
  });

  describe('formatResult', () => {
    it('should format product result correctly', () => {
      const result = provider.formatResult(mockProduct);

      expect(result.id).toBe('product-1');
      expect(result.entityType).toBe('products');
      expect(result.title).toBe('Test Product');
      expect(result.description).toContain('Test description');
      expect(result.description).toContain('$99.99');
      expect(result.url).toBe('/dashboard/products/product-1');
      expect(result.metadata.status).toBe('PUBLISHED');
      expect(result.metadata.price).toBe(99.99);
      expect(result.metadata.sku).toBe('TEST-001');
    });

    it('should truncate long descriptions', () => {
      const longDescription = 'a'.repeat(200);
      const productWithLongDesc = { ...mockProduct, description: longDescription };
      const result = provider.formatResult(productWithLongDesc);

      expect(result.description.length).toBeLessThanOrEqual(153); // 150 + '...'
    });

    it('should handle null description', () => {
      const productWithoutDesc = { ...mockProduct, description: null };
      const result = provider.formatResult(productWithoutDesc);

      expect(result.description).toContain('$99.99');
    });
  });

  describe('getEntityUrl', () => {
    it('should return correct URL for product', () => {
      const url = provider.getEntityUrl('product-123');

      expect(url).toBe('/dashboard/products/product-123');
    });
  });

  describe('relevance scoring', () => {
    it('should score exact title match highest', async () => {
      const exactMatch = { ...mockProduct, title: 'test' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([exactMatch]);

      const results = await provider.search('admin-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results[0].relevanceScore).toBeGreaterThan(0);
    });

    it('should prioritize title matches over description matches', async () => {
      const titleMatch = { ...mockProduct, title: 'test product', description: 'other' };
      const descMatch = { ...mockProduct, title: 'other', description: 'test description' };
      
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([descMatch, titleMatch]);

      const results = await provider.search('admin-1', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      // Results should be sorted by relevance, title match should be first
      expect(results[0].relevanceScore).toBeGreaterThanOrEqual(results[1].relevanceScore);
    });

    it('should score SKU matches highly', async () => {
      const skuMatch = { ...mockProduct, sku: 'TEST-001' };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([skuMatch]);

      const results = await provider.search('admin-1', 'TEST-001', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results[0].relevanceScore).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prismaService.product, 'findMany').mockRejectedValue(
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
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([]);

      const results = await provider.search('nonexistent', 'test', {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      expect(results).toHaveLength(0);
    });
  });
});
