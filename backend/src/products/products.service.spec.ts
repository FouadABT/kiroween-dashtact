import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  UpdateVariantDto,
  BulkStatusUpdateDto,
} from './dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
    cost: 50.0,
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
    categories: [],
    tags: [],
    variants: [],
    _count: { variants: 0, orderItems: 0 },
  };

  const mockVariant = {
    id: 'variant-1',
    productId: 'product-1',
    name: 'Large / Blue',
    sku: 'TEST-001-LG-BLU',
    barcode: '987654321',
    attributes: { size: 'Large', color: 'Blue' },
    price: 109.99,
    compareAtPrice: 139.99,
    cost: 55.0,
    image: '/images/variant.jpg',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: { orderItems: 0 },
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

  describe('findAll', () => {
    it('should return paginated products', async () => {
      mockPrismaService.product.count.mockResolvedValue(1);
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        products: expect.arrayContaining([
          expect.objectContaining({
            id: 'product-1',
            name: 'Test Product',
          }),
        ]),
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
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

    it('should filter by status', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ status: ProductStatus.PUBLISHED });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: { status: ProductStatus.PUBLISHED },
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

    it('should filter by visibility', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ isVisible: false });

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: { isVisible: false },
      });
    });

    it('should sort by specified field', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await service.findAll({ sortBy: 'basePrice', sortOrder: 'asc' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { basePrice: 'asc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-1');

      expect(result).toMatchObject({
        id: 'product-1',
        name: 'Test Product',
      });
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
    it('should return a published product by slug', async () => {
      const publishedProduct = {
        ...mockProduct,
        status: ProductStatus.PUBLISHED,
        isVisible: true,
      };
      mockPrismaService.product.findUnique.mockResolvedValue(publishedProduct);

      const result = await service.findBySlug('test-product');

      expect(result).toMatchObject({
        slug: 'test-product',
        name: 'Test Product',
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if product is not published', async () => {
      const draftProduct = {
        ...mockProduct,
        status: ProductStatus.DRAFT,
      };
      mockPrismaService.product.findUnique.mockResolvedValue(draftProduct);

      await expect(service.findBySlug('test-product')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if product is not visible', async () => {
      const hiddenProduct = {
        ...mockProduct,
        status: ProductStatus.PUBLISHED,
        isVisible: false,
      };
      mockPrismaService.product.findUnique.mockResolvedValue(hiddenProduct);

      await expect(service.findBySlug('test-product')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      basePrice: 99.99,
    };

    it('should create a new product with generated slug', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toMatchObject({
        name: 'Test Product',
      });
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createDto.name,
          slug: expect.any(String),
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

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException if SKU already exists', async () => {
      const dtoWithSku: CreateProductDto = {
        ...createDto,
        sku: 'EXISTING-SKU',
      };

      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(null) // slug check
        .mockResolvedValueOnce({ id: 'existing', sku: 'EXISTING-SKU' }); // SKU check

      await expect(service.create(dtoWithSku)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should set publishedAt when status is PUBLISHED', async () => {
      const publishedDto: CreateProductDto = {
        ...createDto,
        status: ProductStatus.PUBLISHED,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue({
        ...mockProduct,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      await service.create(publishedDto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: ProductStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });

    it('should connect categories when categoryIds provided', async () => {
      const dtoWithCategories: CreateProductDto = {
        ...createDto,
        categoryIds: ['cat-1', 'cat-2'],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      await service.create(dtoWithCategories);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          categories: {
            connect: [{ id: 'cat-1' }, { id: 'cat-2' }],
          },
        }),
        include: expect.any(Object),
      });
    });

    it('should connect tags when tagIds provided', async () => {
      const dtoWithTags: CreateProductDto = {
        ...createDto,
        tagIds: ['tag-1', 'tag-2'],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      await service.create(dtoWithTags);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tags: {
            connect: [{ id: 'tag-1' }, { id: 'tag-2' }],
          },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      basePrice: 149.99,
    };

    it('should update a product successfully', async () => {
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(null); // slug uniqueness check
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

    it('should generate new slug when name changes', async () => {
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(null); // slug uniqueness check
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        name: 'Updated Product',
        slug: 'updated-product',
      });

      await service.update('product-1', updateDto);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: expect.objectContaining({
          slug: expect.any(String),
        }),
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException if new SKU already exists', async () => {
      const updateWithSku: UpdateProductDto = {
        sku: 'EXISTING-SKU',
      };

      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce({ id: 'other-product', sku: 'EXISTING-SKU' });

      await expect(
        service.update('product-1', updateWithSku),
      ).rejects.toThrow(ConflictException);
    });

    it('should set publishedAt when status changes to PUBLISHED', async () => {
      const updateToPublished: UpdateProductDto = {
        status: ProductStatus.PUBLISHED,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      await service.update('product-1', updateToPublished);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: expect.objectContaining({
          publishedAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
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
            set: [{ id: 'cat-2' }, { id: 'cat-3' }],
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

    it('should throw BadRequestException if product has orders', async () => {
      const productWithOrders = {
        ...mockProduct,
        _count: { orderItems: 5 },
      };
      mockPrismaService.product.findUnique.mockResolvedValue(
        productWithOrders,
      );

      await expect(service.delete('product-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addVariant', () => {
    const createVariantDto: CreateVariantDto = {
      name: 'Large / Blue',
      attributes: { size: 'Large', color: 'Blue' },
      price: 109.99,
    };

    it('should add a variant to a product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productVariant.findUnique.mockResolvedValue(null);
      mockPrismaService.productVariant.create.mockResolvedValue(mockVariant);

      const result = await service.addVariant('product-1', createVariantDto);

      expect(result).toMatchObject({
        name: 'Large / Blue',
      });
      expect(mockPrismaService.productVariant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'product-1',
          name: createVariantDto.name,
          attributes: createVariantDto.attributes,
        }),
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addVariant('nonexistent', createVariantDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if variant SKU already exists', async () => {
      const dtoWithSku: CreateVariantDto = {
        ...createVariantDto,
        sku: 'EXISTING-SKU',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productVariant.findUnique.mockResolvedValue({
        id: 'existing',
        sku: 'EXISTING-SKU',
      });

      await expect(
        service.addVariant('product-1', dtoWithSku),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateVariant', () => {
    const updateVariantDto: UpdateVariantDto = {
      name: 'Extra Large / Blue',
      price: 119.99,
    };

    it('should update a variant successfully', async () => {
      mockPrismaService.productVariant.findUnique
        .mockResolvedValueOnce(mockVariant)
        .mockResolvedValueOnce(null); // SKU check
      mockPrismaService.productVariant.update.mockResolvedValue({
        ...mockVariant,
        ...updateVariantDto,
      });

      const result = await service.updateVariant('variant-1', updateVariantDto);

      expect(result.name).toBe(updateVariantDto.name);
      expect(result.price).toBe(updateVariantDto.price);
    });

    it('should throw NotFoundException if variant not found', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        service.updateVariant('nonexistent', updateVariantDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new SKU already exists', async () => {
      const updateWithSku: UpdateVariantDto = {
        sku: 'EXISTING-SKU',
      };

      mockPrismaService.productVariant.findUnique
        .mockResolvedValueOnce(mockVariant)
        .mockResolvedValueOnce({ id: 'other-variant', sku: 'EXISTING-SKU' });

      await expect(
        service.updateVariant('variant-1', updateWithSku),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteVariant', () => {
    it('should delete a variant successfully', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(
        mockVariant,
      );
      mockPrismaService.productVariant.delete.mockResolvedValue(mockVariant);

      await service.deleteVariant('variant-1');

      expect(mockPrismaService.productVariant.delete).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
      });
    });

    it('should throw NotFoundException if variant not found', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(null);

      await expect(service.deleteVariant('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if variant has orders', async () => {
      const variantWithOrders = {
        ...mockVariant,
        _count: { orderItems: 3 },
      };
      mockPrismaService.productVariant.findUnique.mockResolvedValue(
        variantWithOrders,
      );

      await expect(service.deleteVariant('variant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('bulkUpdateStatus', () => {
    const bulkUpdateDto: BulkStatusUpdateDto = {
      productIds: ['product-1', 'product-2', 'product-3'],
      status: ProductStatus.PUBLISHED,
    };

    it('should update status for multiple products', async () => {
      mockPrismaService.product.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.bulkUpdateStatus(bulkUpdateDto);

      expect(result.count).toBe(3);
      expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: bulkUpdateDto.productIds },
        },
        data: {
          status: ProductStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        },
      });
    });

    it('should set publishedAt when status is PUBLISHED', async () => {
      mockPrismaService.product.updateMany.mockResolvedValue({ count: 2 });

      await service.bulkUpdateStatus(bulkUpdateDto);

      expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        data: expect.objectContaining({
          publishedAt: expect.any(Date),
        }),
      });
    });

    it('should not set publishedAt when status is not PUBLISHED', async () => {
      const draftDto: BulkStatusUpdateDto = {
        productIds: ['product-1'],
        status: ProductStatus.DRAFT,
      };

      mockPrismaService.product.updateMany.mockResolvedValue({ count: 1 });

      await service.bulkUpdateStatus(draftDto);

      expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        data: {
          status: ProductStatus.DRAFT,
          publishedAt: undefined,
        },
      });
    });
  });
});
