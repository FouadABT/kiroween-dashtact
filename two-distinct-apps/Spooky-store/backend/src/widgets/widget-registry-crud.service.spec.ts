import { Test, TestingModule } from '@nestjs/testing';
import { WidgetRegistryService } from './widget-registry.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

describe('WidgetRegistryService - CRUD Operations', () => {
  let service: WidgetRegistryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    widgetDefinition: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
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
      providers: [
        WidgetRegistryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WidgetRegistryService>(WidgetRegistryService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
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

    it('should create a new widget successfully', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);
      mockPrismaService.widgetDefinition.create.mockResolvedValue(mockWidget);

      const result = await service.create(createDto);

      expect(result).toEqual(mockWidget);
      expect(mockPrismaService.widgetDefinition.findUnique).toHaveBeenCalledWith({
        where: { key: createDto.key },
      });
      expect(mockPrismaService.widgetDefinition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          key: createDto.key,
          name: createDto.name,
          description: createDto.description,
          component: createDto.component,
          category: createDto.category,
          icon: createDto.icon,
        }),
      });
    });

    it('should apply default values for optional fields', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);
      mockPrismaService.widgetDefinition.create.mockResolvedValue(mockWidget);

      await service.create(createDto);

      expect(mockPrismaService.widgetDefinition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          defaultGridSpan: 6,
          minGridSpan: 3,
          maxGridSpan: 12,
          useCases: [],
          examples: [],
          tags: [],
          isActive: true,
          isSystemWidget: false,
        }),
      });
    });

    it('should throw BadRequestException if key already exists', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'Widget with key "revenue-chart" already exists',
      );
    });

    it('should throw BadRequestException for invalid configSchema', async () => {
      const invalidDto = {
        ...createDto,
        configSchema: null,
      };

      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);

      await expect(service.create(invalidDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if configSchema missing type', async () => {
      const invalidDto = {
        ...createDto,
        configSchema: { properties: {} },
      };

      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto)).rejects.toThrow(
        'configSchema must have a "type" property',
      );
    });

    it('should throw BadRequestException if object type missing properties', async () => {
      const invalidDto = {
        ...createDto,
        configSchema: { type: 'object' },
      };

      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto)).rejects.toThrow(
        'configSchema with type "object" must have "properties"',
      );
    });

    it('should create widget with all optional fields', async () => {
      const fullDto: CreateWidgetDto = {
        ...createDto,
        defaultGridSpan: 8,
        minGridSpan: 4,
        maxGridSpan: 12,
        useCases: ['Show revenue trends', 'Track sales'],
        examples: [
          {
            name: 'Monthly Revenue',
            config: { title: 'Monthly Revenue' },
          },
        ],
        tags: ['chart', 'revenue', 'analytics'],
        isActive: true,
        isSystemWidget: false,
      };

      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);
      mockPrismaService.widgetDefinition.create.mockResolvedValue({
        ...mockWidget,
        ...fullDto,
      });

      const result = await service.create(fullDto);

      expect(result).toMatchObject({
        defaultGridSpan: 8,
        minGridSpan: 4,
        maxGridSpan: 12,
        useCases: ['Show revenue trends', 'Track sales'],
        tags: ['chart', 'revenue', 'analytics'],
      });
    });
  });

  describe('findByKey', () => {
    it('should return widget by key', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);

      const result = await service.findByKey('revenue-chart');

      expect(result).toEqual(mockWidget);
      expect(mockPrismaService.widgetDefinition.findUnique).toHaveBeenCalledWith({
        where: { key: 'revenue-chart' },
      });
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);

      await expect(service.findByKey('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByKey('non-existent')).rejects.toThrow(
        'Widget with key "non-existent" not found',
      );
    });

    it('should use cache on second call', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);

      // First call
      await service.findByKey('revenue-chart');
      expect(mockPrismaService.widgetDefinition.findUnique).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await service.findByKey('revenue-chart');
      expect(mockPrismaService.widgetDefinition.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    const mockWidgets = [mockWidget];

    it('should return all widgets without filters', async () => {
      mockPrismaService.widgetDefinition.findMany.mockResolvedValue(mockWidgets);

      const result = await service.findAll();

      expect(result).toEqual(mockWidgets);
      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });

    it('should filter by category', async () => {
      mockPrismaService.widgetDefinition.findMany.mockResolvedValue(mockWidgets);

      await service.findAll({ category: 'analytics' });

      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledWith({
        where: { category: 'analytics' },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });

    it('should filter by isActive', async () => {
      mockPrismaService.widgetDefinition.findMany.mockResolvedValue(mockWidgets);

      await service.findAll({ isActive: true });

      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });

    it('should filter by tags', async () => {
      mockPrismaService.widgetDefinition.findMany.mockResolvedValue(mockWidgets);

      await service.findAll({ tags: ['chart', 'analytics'] });

      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledWith({
        where: { tags: { hasSome: ['chart', 'analytics'] } },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });

    it('should search by text', async () => {
      mockPrismaService.widgetDefinition.findMany.mockResolvedValue(mockWidgets);

      await service.findAll({ search: 'revenue' });

      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'revenue', mode: 'insensitive' } },
            { description: { contains: 'revenue', mode: 'insensitive' } },
            { tags: { hasSome: ['revenue'] } },
          ],
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });

    it('should combine multiple filters', async () => {
      mockPrismaService.widgetDefinition.findMany.mockResolvedValue(mockWidgets);

      await service.findAll({
        category: 'analytics',
        isActive: true,
        tags: ['chart'],
      });

      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledWith({
        where: {
          category: 'analytics',
          isActive: true,
          tags: { hasSome: ['chart'] },
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });

    it('should use cache on second call with same filters', async () => {
      mockPrismaService.widgetDefinition.findMany.mockResolvedValue(mockWidgets);

      // First call
      await service.findAll({ category: 'analytics' });
      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await service.findAll({ category: 'analytics' });
      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const updateDto: UpdateWidgetDto = {
      name: 'Updated Revenue Chart',
      description: 'Updated description',
    };

    it('should update widget successfully', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);
      mockPrismaService.widgetDefinition.update.mockResolvedValue({
        ...mockWidget,
        ...updateDto,
      });

      const result = await service.update('revenue-chart', updateDto);

      expect(result.name).toBe('Updated Revenue Chart');
      expect(result.description).toBe('Updated description');
      expect(mockPrismaService.widgetDefinition.update).toHaveBeenCalledWith({
        where: { key: 'revenue-chart' },
        data: expect.objectContaining({
          name: 'Updated Revenue Chart',
          description: 'Updated description',
        }),
      });
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate configSchema if provided', async () => {
      const invalidUpdate = {
        configSchema: { invalid: 'schema' },
      };

      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);

      await expect(
        service.update('revenue-chart', invalidUpdate),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { name: 'New Name' };

      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);
      mockPrismaService.widgetDefinition.update.mockResolvedValue({
        ...mockWidget,
        name: 'New Name',
      });

      await service.update('revenue-chart', partialUpdate);

      expect(mockPrismaService.widgetDefinition.update).toHaveBeenCalledWith({
        where: { key: 'revenue-chart' },
        data: { name: 'New Name' },
      });
    });

    it('should clear cache after update', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);
      mockPrismaService.widgetDefinition.update.mockResolvedValue(mockWidget);

      // Cache a widget
      await service.findByKey('revenue-chart');
      expect(mockPrismaService.widgetDefinition.findUnique).toHaveBeenCalledTimes(1);

      // Update widget (should clear cache)
      await service.update('revenue-chart', updateDto);

      // Next findByKey should hit database
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);
      await service.findByKey('revenue-chart');
      expect(mockPrismaService.widgetDefinition.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove (soft delete)', () => {
    it('should soft delete widget by setting isActive to false', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);
      mockPrismaService.widgetDefinition.update.mockResolvedValue({
        ...mockWidget,
        isActive: false,
      });

      const result = await service.remove('revenue-chart');

      expect(result.isActive).toBe(false);
      expect(mockPrismaService.widgetDefinition.update).toHaveBeenCalledWith({
        where: { key: 'revenue-chart' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should clear cache after removal', async () => {
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);
      mockPrismaService.widgetDefinition.update.mockResolvedValue({
        ...mockWidget,
        isActive: false,
      });

      await service.remove('revenue-chart');

      // Cache should be cleared
      // Next call should hit database
      mockPrismaService.widgetDefinition.findUnique.mockResolvedValue(mockWidget);
      await service.findByKey('revenue-chart');
      expect(mockPrismaService.widgetDefinition.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const mockCategoryWidgets = [
        { category: 'analytics' },
        { category: 'ecommerce' },
        { category: 'system' },
      ];

      mockPrismaService.widgetDefinition.findMany.mockResolvedValue(
        mockCategoryWidgets,
      );

      const result = await service.getCategories();

      expect(result).toEqual(['analytics', 'ecommerce', 'system']);
      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });
    });

    it('should use cache on second call', async () => {
      mockPrismaService.widgetDefinition.findMany.mockResolvedValue([
        { category: 'analytics' },
      ]);

      // First call
      await service.getCategories();
      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await service.getCategories();
      expect(mockPrismaService.widgetDefinition.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
