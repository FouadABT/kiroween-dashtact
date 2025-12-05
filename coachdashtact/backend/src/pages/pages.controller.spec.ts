import { Test, TestingModule } from '@nestjs/testing';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { UploadsService } from '../uploads/uploads.service';
import { PageStatus, PageVisibility } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('PagesController', () => {
  let controller: PagesController;
  let pagesService: PagesService;
  let uploadsService: UploadsService;

  const mockPagesService = {
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    publish: jest.fn(),
    unpublish: jest.fn(),
    reorder: jest.fn(),
    validateSlug: jest.fn(),
    getHierarchy: jest.fn(),
  };

  const mockUploadsService = {
    uploadFile: jest.fn(),
  };

  const mockPage = {
    id: 'page-1',
    title: 'Test Page',
    slug: 'test-page',
    content: 'Test content',
    excerpt: 'Test excerpt',
    featuredImage: null,
    status: PageStatus.DRAFT,
    visibility: PageVisibility.PUBLIC,
    parentPageId: null,
    showInNavigation: false,
    displayOrder: 0,
    metaTitle: null,
    metaDescription: null,
    metaKeywords: null,
    customCssClass: null,
    templateKey: 'default',
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
    parentPage: null,
    childPages: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagesController],
      providers: [
        {
          provide: PagesService,
          useValue: mockPagesService,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    controller = module.get<PagesController>(PagesController);
    pagesService = module.get<PagesService>(PagesService);
    uploadsService = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllPublic', () => {
    it('should return published pages only', async () => {
      const mockResponse = {
        data: [mockPage],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockPagesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAllPublic({ page: 1, limit: 20 });

      expect(result).toEqual(mockResponse);
      expect(mockPagesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        status: 'PUBLISHED',
      });
    });
  });

  describe('findBySlug', () => {
    it('should return page by slug', async () => {
      mockPagesService.findBySlug.mockResolvedValue(mockPage);

      const result = await controller.findBySlug('test-page');

      expect(result).toEqual(mockPage);
      expect(mockPagesService.findBySlug).toHaveBeenCalledWith(
        'test-page',
        true,
      );
    });
  });

  describe('getHierarchy', () => {
    it('should return page hierarchy', async () => {
      const mockHierarchy = [
        {
          id: '1',
          title: 'Page 1',
          slug: 'page-1',
          children: [],
        },
      ];
      mockPagesService.getHierarchy.mockResolvedValue(mockHierarchy);

      const result = await controller.getHierarchy();

      expect(result).toEqual(mockHierarchy);
    });
  });

  describe('findAll (admin)', () => {
    it('should return all pages with filters', async () => {
      const mockResponse = {
        data: [mockPage],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockPagesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('findById', () => {
    it('should return page by ID', async () => {
      mockPagesService.findById.mockResolvedValue(mockPage);

      const result = await controller.findById('page-1');

      expect(result).toEqual(mockPage);
    });
  });

  describe('create', () => {
    it('should create a new page', async () => {
      const createDto = {
        title: 'New Page',
        slug: 'new-page',
        content: 'Content',
      };
      mockPagesService.create.mockResolvedValue(mockPage);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPage);
      expect(mockPagesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a page', async () => {
      const updateDto = {
        title: 'Updated Title',
      };
      const updatedPage = { ...mockPage, ...updateDto };
      mockPagesService.update.mockResolvedValue(updatedPage);

      const result = await controller.update('page-1', updateDto);

      expect(result).toEqual(updatedPage);
      expect(mockPagesService.update).toHaveBeenCalledWith('page-1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a page', async () => {
      mockPagesService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('page-1');

      expect(result).toEqual({ message: 'Page deleted successfully' });
      expect(mockPagesService.delete).toHaveBeenCalledWith('page-1');
    });
  });

  describe('publish', () => {
    it('should publish a page', async () => {
      const publishedPage = {
        ...mockPage,
        status: PageStatus.PUBLISHED,
        publishedAt: new Date(),
      };
      mockPagesService.publish.mockResolvedValue(publishedPage);

      const result = await controller.publish('page-1');

      expect(result.status).toBe(PageStatus.PUBLISHED);
      expect(mockPagesService.publish).toHaveBeenCalledWith('page-1');
    });
  });

  describe('unpublish', () => {
    it('should unpublish a page', async () => {
      const unpublishedPage = {
        ...mockPage,
        status: PageStatus.DRAFT,
      };
      mockPagesService.unpublish.mockResolvedValue(unpublishedPage);

      const result = await controller.unpublish('page-1');

      expect(result.status).toBe(PageStatus.DRAFT);
      expect(mockPagesService.unpublish).toHaveBeenCalledWith('page-1');
    });
  });

  describe('reorder', () => {
    it('should reorder pages', async () => {
      const reorderDto = {
        updates: [
          { id: 'page-1', order: 1 },
          { id: 'page-2', order: 2 },
        ],
      };
      mockPagesService.reorder.mockResolvedValue(undefined);

      const result = await controller.reorder(reorderDto);

      expect(result).toEqual({ message: 'Pages reordered successfully' });
      expect(mockPagesService.reorder).toHaveBeenCalledWith(reorderDto.updates);
    });
  });

  describe('validateSlug', () => {
    it('should validate slug availability', async () => {
      const validateDto = {
        slug: 'test-slug',
        excludeId: undefined,
      };
      mockPagesService.validateSlug.mockResolvedValue(true);

      const result = await controller.validateSlug(validateDto);

      expect(result).toEqual({
        isValid: true,
        message: 'Slug is available',
      });
    });

    it('should return false for unavailable slug', async () => {
      const validateDto = {
        slug: 'taken-slug',
        excludeId: undefined,
      };
      mockPagesService.validateSlug.mockResolvedValue(false);

      const result = await controller.validateSlug(validateDto);

      expect(result).toEqual({
        isValid: false,
        message: 'Slug is not available',
      });
    });
  });

  describe('uploadFeaturedImage', () => {
    it('should upload featured image', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      const mockUploadResult = {
        url: '/uploads/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
      };

      mockUploadsService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadFeaturedImage(mockFile);

      expect(result).toEqual(mockUploadResult);
      expect(mockUploadsService.uploadFile).toHaveBeenCalledWith(mockFile, {
        type: 'image',
      });
    });

    it('should throw BadRequestException if no file uploaded', async () => {
      await expect(controller.uploadFeaturedImage(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
