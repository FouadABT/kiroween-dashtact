import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';

describe('ProductsService - CRUD Operations', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    productCategory: {
      findMany: jest.fn(),
    },
    productTag: {
      findMany: jest.fn(),
    },
  };

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    shortDescription: 'Short desc',
    basePrice: 99.99,
    compareAtPrice: 129.99,
    cost: 50.00,
    sku: 'TEST-001',
    barcode: '123456789',
    featuredImage: '/images/test.jpg',
    images: ['/images/test1.jpg', '/images/test2.jpg'],
    status: ProductStatus.DRAFT,
    isVisible: true,
    isFeatured: false,
    metaTitle: 'Test Product Meta',
    metaDescription: 'Test meta description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: null,
    _count: { variants: 0 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      slug: 'new-product',
      description: 'Product description',
      shortDescription: 'Short description',
      basePrice: 99.99,
      compareAtPrice: 129.99,
      cost: 50.00,
      sku: 'NEW-001',
      barcode: '987654321',
      featuredImage: '/images/new.jpg',
      images: ['/images/new1.jpg'],
      status: ProductStatus.DRAFT,
      isVisible: true,
      isFeatured: false,
      metaTitle: 'New Product',
      metaDescription: 'New product meta',
      categoryIds: ['cat-1'],
      tagIds: ['tag-1'],
    };

    it('should create a new product successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createDto.name,
          slug: createDto.slug,
          basePrice: createDto.basePrice,
        }),
        include: expect.any(Object),
      });
    });

    it('should generate unique slug if slug already exists', async () => {
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce({ id: 'existing', slug: 'new-product' })
        .mockResolvedValueOnce(null);
      mockPrismaService.product.create.mockResolvedValue({
        ...mockProduct,
        slug: 'new-product-1',
      });

      const result = await service.create(createDto);

      expect(result.slug).toBe('new-product-1');
    });

    it('should throw ConflictException if SKU already exists', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.findFirst.mockResolvedValue({
        id: 'existing',
        sku: createDto.sku,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create product with minimal required fields', async () => {
      const minimalDto: CreateProductDto = {
        name: 'Minimal Product',
        slug: 'minimal-product',
        basePrice: 49.99,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue({
        ...mockProduct,
        ...minimalDto,
      });

      const result = await service.create(minimalDto);

      expect(result.name).toBe(minimalDto.name);
      expect(result.slug).toBe(minimalDto.slug);
      expect(result.basePrice).toBe(minimalDto.basePrice);
    });

    it('should validate price is non-negative', async () => {
      const invalidDto: CreateProductDto = {
        name: 'Invalid Product',
        slug: 'invalid-product',
        basePrice: -10,
      };

      // This would be caught by DTO validation, but we test service logic
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Service should handle this gracefully or validation should catch it
      await expect(service.create(invalidDto)).rejects.toThrow();
    });

    it('should connect categories when categoryIds provided', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      await service.create(createDto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          categories: {
            connect: createDto.categoryIds?.map((id) => ({ id })),
          },
        }),
        include: expect.any(Object),
      });
    });

    it('should connect tags when tagIds provided', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      await service.create(createDto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tags: {
            connect: createDto.tagIds?.map((id) => ({ id })),
          },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [mockProduct];
      mockPrismaService.product.count.mockResolvedValue(1);
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        products: mockProducts,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by status', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ status: ProductStatus.PUBLISHED });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: { status: ProductStatus.PUBLISHED },
      });
    });

    it('should filter by visibility', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ isVisible: true });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: { isVisible: true },
      });
    });

    it('should filter by featured status', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ isFeatured: true });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: { isFeatured: true },
      });
    });

    it('should search by name, description, and SKU', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'test' });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { sku: { contains: 'test', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should filter by category', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ categoryId: 'cat-1' });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: {
          categories: {
            some: { id: 'cat-1' },
          },
        },
      });
    });

    it('should filter by tag', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ tagId: 'tag-1' });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: {
          tags: {
            some: { id: 'tag-1' },
          },
        },
      });
    });

    it('should sort by different fields', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ sortBy: 'basePrice', sortOrder: 'asc' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { basePrice: 'asc' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('test-product');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      basePrice: 149.99,
    };

    it('should update a product successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });

      const result = await service.update('product-1', updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.basePrice).toBe(updateDto.basePrice);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update slug and ensure uniqueness', async () => {
      const updateWithSlug: UpdateProductDto = {
        slug: 'new-slug',
      };

      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(null);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        slug: 'new-slug',
      });

      const result = await service.update('product-1', updateWithSlug);

      expect(result.slug).toBe('new-slug');
    });

    it('should throw ConflictException if new SKU already exists', async () => {
      const updateWithSku: UpdateProductDto = {
        sku: 'EXISTING-SKU',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.findFirst.mockResolvedValue({
        id: 'other-product',
        sku: 'EXISTING-SKU',
      });

      await expect(
        service.update('product-1', updateWithSku),
      ).rejects.toThrow(ConflictException);
    });

    it('should update categories when categoryIds provided', async () => {
      const updateWithCategories: UpdateProductDto = {
        categoryIds: ['cat-2', 'cat-3'],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(mockProduct);

      await service.update('product-1', updateWithCategories);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: expect.objectContaining({
          categories: {
            set: [],
            connect: updateWithCategories.categoryIds?.map((id) => ({ id })),
          },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('delete', () => {
    it('should delete a product successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      await service.delete('product-1');

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('publish', () => {
    it('should publish a draft product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      const result = await service.publish('product-1');

      expect(result.status).toBe(ProductStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.publish('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unpublish', () => {
    it('should unpublish a published product', async () => {
      const publishedProduct = {
        ...mockProduct,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(publishedProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...publishedProduct,
        status: ProductStatus.DRAFT,
      });

      const result = await service.unpublish('product-1');

      expect(result.status).toBe(ProductStatus.DRAFT);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.unpublish('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
