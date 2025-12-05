import { Test, TestingModule } from '@nestjs/testing';
import { WidgetRegistryController } from './widget-registry.controller';
import { WidgetRegistryService } from './widget-registry.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WidgetRegistryController', () => {
  let controller: WidgetRegistryController;
  let service: WidgetRegistryService;

  const mockWidgetRegistryService = {
    findAll: jest.fn(),
    findByKey: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    searchByIntent: jest.fn(),
    getCategories: jest.fn(),
    filterByPermissions: jest.fn(),
  };

  const mockWidget = {
    id: 'widget-1',
    key: 'revenue-chart',
    name: 'Revenue Chart',
    description: 'Displays revenue trends over time',
    component: 'ChartWidget',
    category: 'analytics',
    icon: 'LineChart',
    defaultGridSpan: 6,
    minGridSpan: 3,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
    },
    dataRequirements: {
      endpoint: '/api/analytics/revenue',
      permissions: ['analytics:read'],
    },
    useCases: ['Show revenue trends'],
    examples: [],
    tags: ['chart', 'analytics'],
    isActive: true,
    isSystemWidget: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WidgetRegistryController],
      providers: [
        {
          provide: WidgetRegistryService,
          useValue: mockWidgetRegistryService,
        },
      ],
    }).compile();

    controller = module.get<WidgetRegistryController>(WidgetRegistryController);
    service = module.get<WidgetRegistryService>(WidgetRegistryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all widgets', async () => {
      const mockWidgets = [mockWidget];
      mockWidgetRegistryService.findAll.mockResolvedValue(mockWidgets);

      const result = await controller.findAll();

      expect(result).toEqual(mockWidgets);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return filtered widgets', async () => {
      const mockWidgets = [mockWidget];
      const filters = { category: 'analytics', isActive: true };
      mockWidgetRegistryService.findAll.mockResolvedValue(mockWidgets);

      const result = await controller.findAll(filters);

      expect(result).toEqual(mockWidgets);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should handle empty results', async () => {
      mockWidgetRegistryService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByKey', () => {
    it('should return widget by key', async () => {
      mockWidgetRegistryService.findByKey.mockResolvedValue(mockWidget);

      const result = await controller.findByKey('revenue-chart');

      expect(result).toEqual(mockWidget);
      expect(service.findByKey).toHaveBeenCalledWith('revenue-chart');
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockWidgetRegistryService.findByKey.mockRejectedValue(
        new NotFoundException('Widget with key "non-existent" not found'),
      );

      await expect(controller.findByKey('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateWidgetDto = {
      key: 'revenue-chart',
      name: 'Revenue Chart',
      description: 'Displays revenue trends over time',
      component: 'ChartWidget',
      category: 'analytics',
      icon: 'LineChart',
      configSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
        },
      },
      dataRequirements: {
        endpoint: '/api/analytics/revenue',
        permissions: ['analytics:read'],
      },
    };

    it('should create a new widget', async () => {
      mockWidgetRegistryService.create.mockResolvedValue(mockWidget);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockWidget);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequestException if key already exists', async () => {
      mockWidgetRegistryService.create.mockRejectedValue(
        new BadRequestException('Widget with key "revenue-chart" already exists'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid configSchema', async () => {
      mockWidgetRegistryService.create.mockRejectedValue(
        new BadRequestException('configSchema must be a valid object'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateWidgetDto = {
      name: 'Updated Revenue Chart',
      description: 'Updated description',
    };

    it('should update widget successfully', async () => {
      const updatedWidget = { ...mockWidget, ...updateDto };
      mockWidgetRegistryService.update.mockResolvedValue(updatedWidget);

      const result = await controller.update('revenue-chart', updateDto);

      expect(result).toEqual(updatedWidget);
      expect(service.update).toHaveBeenCalledWith('revenue-chart', updateDto);
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockWidgetRegistryService.update.mockRejectedValue(
        new NotFoundException('Widget with key "non-existent" not found'),
      );

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { name: 'New Name' };
      const updatedWidget = { ...mockWidget, name: 'New Name' };
      mockWidgetRegistryService.update.mockResolvedValue(updatedWidget);

      const result = await controller.update('revenue-chart', partialUpdate);

      expect(result.name).toBe('New Name');
      expect(service.update).toHaveBeenCalledWith('revenue-chart', partialUpdate);
    });
  });

  describe('remove', () => {
    it('should soft delete widget', async () => {
      const deletedWidget = { ...mockWidget, isActive: false };
      mockWidgetRegistryService.remove.mockResolvedValue(deletedWidget);

      const result = await controller.remove('revenue-chart');

      expect(result.isActive).toBe(false);
      expect(service.remove).toHaveBeenCalledWith('revenue-chart');
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockWidgetRegistryService.remove.mockRejectedValue(
        new NotFoundException('Widget with key "non-existent" not found'),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchByIntent', () => {
    it('should search widgets by natural language query', async () => {
      const searchDto = { query: 'show revenue', limit: 5 };
      const mockResults = [mockWidget];
      mockWidgetRegistryService.searchByIntent.mockResolvedValue(mockResults);

      const result = await controller.searchByIntent(searchDto);

      expect(result).toEqual(mockResults);
      expect(service.searchByIntent).toHaveBeenCalledWith(searchDto);
    });

    it('should return results with scores when requested', async () => {
      const searchDto = { query: 'revenue', includeScores: true };
      const mockResults = [{ widget: mockWidget, score: 10 }];
      mockWidgetRegistryService.searchByIntent.mockResolvedValue(mockResults);

      const result = await controller.searchByIntent(searchDto);

      expect(result).toEqual(mockResults);
      expect(result[0]).toHaveProperty('score');
    });

    it('should handle empty search results', async () => {
      const searchDto = { query: 'nonexistent' };
      mockWidgetRegistryService.searchByIntent.mockResolvedValue([]);

      const result = await controller.searchByIntent(searchDto);

      expect(result).toEqual([]);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const mockCategories = ['analytics', 'ecommerce', 'system'];
      mockWidgetRegistryService.getCategories.mockResolvedValue(mockCategories);

      const result = await controller.getCategories();

      expect(result).toEqual(mockCategories);
      expect(service.getCategories).toHaveBeenCalled();
    });

    it('should handle empty categories', async () => {
      mockWidgetRegistryService.getCategories.mockResolvedValue([]);

      const result = await controller.getCategories();

      expect(result).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Database connection failed');
      mockWidgetRegistryService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
    });

    it('should handle validation errors', async () => {
      const validationError = new BadRequestException('Validation failed');
      mockWidgetRegistryService.create.mockRejectedValue(validationError);

      await expect(
        controller.create({} as CreateWidgetDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete widget lifecycle', async () => {
      const createDto: CreateWidgetDto = {
        key: 'test-widget',
        name: 'Test Widget',
        description: 'Test description',
        component: 'TestWidget',
        category: 'test',
        icon: 'Test',
        configSchema: { type: 'object', properties: {} },
        dataRequirements: {},
      };

      // Create
      mockWidgetRegistryService.create.mockResolvedValue(mockWidget);
      const created = await controller.create(createDto);
      expect(created).toBeDefined();

      // Read
      mockWidgetRegistryService.findByKey.mockResolvedValue(mockWidget);
      const found = await controller.findByKey('test-widget');
      expect(found).toEqual(mockWidget);

      // Update
      const updateDto = { name: 'Updated Test Widget' };
      mockWidgetRegistryService.update.mockResolvedValue({
        ...mockWidget,
        ...updateDto,
      });
      const updated = await controller.update('test-widget', updateDto);
      expect(updated.name).toBe('Updated Test Widget');

      // Delete
      mockWidgetRegistryService.remove.mockResolvedValue({
        ...mockWidget,
        isActive: false,
      });
      const deleted = await controller.remove('test-widget');
      expect(deleted.isActive).toBe(false);
    });
  });
});
