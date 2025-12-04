import { Test, TestingModule } from '@nestjs/testing';
import { DashboardLayoutsService } from './dashboard-layouts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { CreateLayoutDto } from './dto/create-layout.dto';

describe('DashboardLayoutsService - Create Operations', () => {
  let service: DashboardLayoutsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    dashboardLayout: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    widgetInstance: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardLayoutsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardLayoutsService>(DashboardLayoutsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const validDto: CreateLayoutDto = {
      pageId: 'overview',
      name: 'My Custom Layout',
      scope: 'global',
      isActive: true,
      isDefault: false,
    };

    it('should create a global layout successfully', async () => {
      const mockCreatedLayout = {
        id: 'layout-1',
        ...validDto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(validDto);

      expect(result).toEqual(mockCreatedLayout);
      expect(mockPrismaService.dashboardLayout.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pageId: validDto.pageId,
          name: validDto.name,
          scope: validDto.scope,
          isActive: validDto.isActive,
          isDefault: validDto.isDefault,
        }),
        include: {
          widgetInstances: {
            orderBy: { position: 'asc' },
          },
        },
      });
    });

    it('should create a user-specific layout successfully', async () => {
      const userDto: CreateLayoutDto = {
        ...validDto,
        userId: 'user-123',
        scope: 'user',
      };

      const mockCreatedLayout = {
        id: 'layout-2',
        ...userDto,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(userDto);

      expect(result).toEqual(mockCreatedLayout);
      expect(mockPrismaService.dashboardLayout.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: userDto.userId,
          scope: 'user',
        }),
        include: expect.any(Object),
      });
    });

    it('should create layout with description', async () => {
      const dtoWithDescription: CreateLayoutDto = {
        ...validDto,
        description: 'A custom layout for the overview page',
      };

      const mockCreatedLayout = {
        id: 'layout-3',
        ...dtoWithDescription,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(dtoWithDescription);

      expect(result.description).toBe(dtoWithDescription.description);
    });

    it('should prevent duplicate default layouts for same page', async () => {
      const defaultDto: CreateLayoutDto = {
        ...validDto,
        isDefault: true,
      };

      const existingDefaultLayout = {
        id: 'layout-existing',
        pageId: 'overview',
        isDefault: true,
        scope: 'global',
        userId: null,
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(existingDefaultLayout);

      await expect(service.create(defaultDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.dashboardLayout.create).not.toHaveBeenCalled();
    });

    it('should allow multiple non-default layouts for same page', async () => {
      const nonDefaultDto: CreateLayoutDto = {
        ...validDto,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-4',
        ...nonDefaultDto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(nonDefaultDto);

      expect(result).toEqual(mockCreatedLayout);
    });

    it('should handle inactive layouts', async () => {
      const inactiveDto: CreateLayoutDto = {
        ...validDto,
        isActive: false,
      };

      const mockCreatedLayout = {
        id: 'layout-5',
        ...inactiveDto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(inactiveDto);

      expect(result.isActive).toBe(false);
    });

    it('should validate pageId format', async () => {
      const invalidDto: CreateLayoutDto = {
        ...validDto,
        pageId: '',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.dashboardLayout.create).not.toHaveBeenCalled();
    });

    it('should validate name is not empty', async () => {
      const invalidDto: CreateLayoutDto = {
        ...validDto,
        name: '',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.dashboardLayout.create).not.toHaveBeenCalled();
    });

    it('should validate scope is valid enum value', async () => {
      const invalidDto: CreateLayoutDto = {
        ...validDto,
        scope: 'invalid' as any,
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.dashboardLayout.create).not.toHaveBeenCalled();
    });

    it('should require userId when scope is "user"', async () => {
      const invalidDto: CreateLayoutDto = {
        ...validDto,
        scope: 'user',
        userId: undefined,
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.dashboardLayout.create).not.toHaveBeenCalled();
    });

    it('should prevent userId when scope is "global"', async () => {
      const invalidDto: CreateLayoutDto = {
        ...validDto,
        scope: 'global',
        userId: 'user-123',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.dashboardLayout.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(service.create(validDto)).rejects.toThrow();
    });

    it('should create layout with all optional fields', async () => {
      const fullDto: CreateLayoutDto = {
        pageId: 'analytics',
        userId: 'user-456',
        scope: 'user',
        name: 'Analytics Dashboard',
        description: 'Custom analytics layout with KPIs',
        isActive: true,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-6',
        ...fullDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(fullDto);

      expect(result).toEqual(mockCreatedLayout);
      expect(result.pageId).toBe(fullDto.pageId);
      expect(result.userId).toBe(fullDto.userId);
      expect(result.scope).toBe(fullDto.scope);
      expect(result.name).toBe(fullDto.name);
      expect(result.description).toBe(fullDto.description);
      expect(result.isActive).toBe(fullDto.isActive);
      expect(result.isDefault).toBe(fullDto.isDefault);
    });

    it('should include empty widgetInstances array on creation', async () => {
      const mockCreatedLayout = {
        id: 'layout-7',
        ...validDto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(validDto);

      expect(result.widgetInstances).toEqual([]);
    });

    it('should set timestamps on creation', async () => {
      const now = new Date();
      const mockCreatedLayout = {
        id: 'layout-8',
        ...validDto,
        userId: null,
        description: null,
        createdAt: now,
        updatedAt: now,
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(validDto);

      expect(result.createdAt).toEqual(now);
      expect(result.updatedAt).toEqual(now);
    });
  });

  describe('create - Edge Cases', () => {
    it('should handle very long pageId (at max length)', async () => {
      const dto: CreateLayoutDto = {
        pageId: 'a'.repeat(100),
        name: 'My Layout',
        scope: 'global',
        isActive: true,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-9',
        ...dto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(dto);

      expect(result.pageId).toBe(dto.pageId);
    });

    it('should handle very long name (at max length)', async () => {
      const dto: CreateLayoutDto = {
        pageId: 'overview',
        name: 'a'.repeat(200),
        scope: 'global',
        isActive: true,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-10',
        ...dto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(dto);

      expect(result.name).toBe(dto.name);
    });

    it('should handle very long description (at max length)', async () => {
      const dto: CreateLayoutDto = {
        pageId: 'overview',
        name: 'My Layout',
        description: 'a'.repeat(500),
        scope: 'global',
        isActive: true,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-11',
        ...dto,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(dto);

      expect(result.description).toBe(dto.description);
    });

    it('should handle special characters in pageId', async () => {
      const dto: CreateLayoutDto = {
        pageId: 'page-id_123',
        name: 'My Layout',
        scope: 'global',
        isActive: true,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-12',
        ...dto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(dto);

      expect(result.pageId).toBe(dto.pageId);
    });

    it('should handle unicode characters in name', async () => {
      const dto: CreateLayoutDto = {
        pageId: 'overview',
        name: 'My Layout 中文 العربية',
        scope: 'global',
        isActive: true,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-13',
        ...dto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockPrismaService.dashboardLayout.findFirst.mockResolvedValue(null);
      mockPrismaService.dashboardLayout.create.mockResolvedValue(mockCreatedLayout);

      const result = await service.create(dto);

      expect(result.name).toBe(dto.name);
    });
  });
});
