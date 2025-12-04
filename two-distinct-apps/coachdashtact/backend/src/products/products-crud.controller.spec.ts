import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductStatus } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';

describe('ProductsController - CRUD Operations', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    publish: jest.fn(),
    unpublish: jest.fn(),
    bulkUpdateStatus: jest.fn(),
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
    images: ['/images/test1.jpg'],
    status: ProductStatus.DRAFT,
    isVisible: true,
    isFeatured: false,
    metaTitle: 'Test Product',
    metaDescription: 'Test meta',
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockResponse = {
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockProductsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(mockResponse);
      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });

    it('should pass query filters to service', async () => {
      const query = {
        status: ProductStatus.PUBLISHED,
        isVisible: true,
        isFeatured: true,
        search: 'test',
        page: 1,
        limit: 20,
      };

      mockProductsService.findAll.mockResolvedValue({
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('product-1');

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('product-1');
    });
  });

  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      mockProductsService.findBySlug.mockResolvedValue(mockProduct);

      const result = await controller.findBySlug('test-product');

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findBySlug).toHaveBeenCalledWith(
        'test-product',
      );
    });
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      slug: 'new-product',
      basePrice: 99.99,
      description: 'Description',
      shortDescription: 'Short',
      status: ProductStatus.DRAFT,
      isVisible: true,
      isFeatured: false,
    };

    it('should create a new product', async () => {
      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle product creation with all fields', async () => {
      const fullDto: CreateProductDto = {
        ...createDto,
        compareAtPrice: 129.99,
        cost: 50.00,
        sku: 'NEW-001',
        barcode: '987654321',
        featuredImage: '/images/new.jpg',
        images: ['/images/new1.jpg', '/images/new2.jpg'],
        metaTitle: 'New Product Meta',
        metaDescription: 'Meta description',
        categoryIds: ['cat-1'],
        tagIds: ['tag-1'],
      };

      mockProductsService.create.mockResolvedValue(mockProduct);

      await controller.create(fullDto);

      expect(mockProductsService.create).toHaveBeenCalledWith(fullDto);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      basePrice: 149.99,
    };

    it('should update a product', async () => {
      const updatedProduct = { ...mockProduct, ...updateDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('product-1', updateDto);

      expect(result).toEqual(updatedProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        'product-1',
        updateDto,
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateProductDto = {
        isVisible: false,
      };

      mockProductsService.update.mockResolvedValue({
        ...mockProduct,
        isVisible: false,
      });

      await controller.update('product-1', partialUpdate);

      expect(mockProductsService.update).toHaveBeenCalledWith(
        'product-1',
        partialUpdate,
      );
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      mockProductsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('product-1');

      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(mockProductsService.delete).toHaveBeenCalledWith('product-1');
    });
  });

  describe('publish', () => {
    it('should publish a product', async () => {
      const publishedProduct = {
        ...mockProduct,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      };

      mockProductsService.publish.mockResolvedValue(publishedProduct);

      const result = await controller.publish('product-1');

      expect(result.status).toBe(ProductStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
      expect(mockProductsService.publish).toHaveBeenCalledWith('product-1');
    });
  });

  describe('unpublish', () => {
    it('should unpublish a product', async () => {
      const unpublishedProduct = {
        ...mockProduct,
        status: ProductStatus.DRAFT,
      };

      mockProductsService.unpublish.mockResolvedValue(unpublishedProduct);

      const result = await controller.unpublish('product-1');

      expect(result.status).toBe(ProductStatus.DRAFT);
      expect(mockProductsService.unpublish).toHaveBeenCalledWith('product-1');
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update status for multiple products', async () => {
      const bulkUpdateDto = {
        productIds: ['product-1', 'product-2'],
        status: ProductStatus.PUBLISHED,
      };

      mockProductsService.bulkUpdateStatus.mockResolvedValue({
        updated: 2,
        productIds: bulkUpdateDto.productIds,
      });

      const result = await controller.bulkUpdateStatus(bulkUpdateDto);

      expect(result.updated).toBe(2);
      expect(mockProductsService.bulkUpdateStatus).toHaveBeenCalledWith(
        bulkUpdateDto.productIds,
        bulkUpdateDto.status,
      );
    });
  });
});
