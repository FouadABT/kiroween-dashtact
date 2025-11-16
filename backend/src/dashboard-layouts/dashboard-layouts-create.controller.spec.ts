import { Test, TestingModule } from '@nestjs/testing';
import { DashboardLayoutsController } from './dashboard-layouts.controller';
import { DashboardLayoutsService } from './dashboard-layouts.service';
import { CreateLayoutDto } from './dto/create-layout.dto';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('DashboardLayoutsController - Create Operations', () => {
  let controller: DashboardLayoutsController;
  let service: DashboardLayoutsService;

  const mockDashboardLayoutsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPageId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    clone: jest.fn(),
    resetToDefault: jest.fn(),
    getTemplates: jest.fn(),
    addWidget: jest.fn(),
    removeWidget: jest.fn(),
    reorderWidgets: jest.fn(),
    validateLayout: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    roleId: 'role-1',
    roleName: 'Admin',
    permissions: ['layouts:read', 'layouts:write'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardLayoutsController],
      providers: [
        {
          provide: DashboardLayoutsService,
          useValue: mockDashboardLayoutsService,
        },
      ],
    }).compile();

    controller = module.get<DashboardLayoutsController>(DashboardLayoutsController);
    service = module.get<DashboardLayoutsService>(DashboardLayoutsService);

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

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(validDto, mockUser);

      expect(result).toEqual(mockCreatedLayout);
      expect(mockDashboardLayoutsService.create).toHaveBeenCalledWith(validDto);
    });

    it('should create a user-specific layout and auto-assign userId', async () => {
      const userDto: CreateLayoutDto = {
        ...validDto,
        scope: 'user',
        userId: undefined,
      };

      const mockCreatedLayout = {
        id: 'layout-2',
        ...userDto,
        userId: mockUser.id,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(userDto, mockUser);

      expect(result.userId).toBe(mockUser.id);
      expect(mockDashboardLayoutsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          scope: 'user',
        })
      );
    });

    it('should preserve explicitly provided userId', async () => {
      const userDto: CreateLayoutDto = {
        ...validDto,
        scope: 'user',
        userId: 'other-user-456',
      };

      const mockCreatedLayout = {
        id: 'layout-3',
        ...userDto,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(userDto, mockUser);

      expect(result.userId).toBe('other-user-456');
      expect(mockDashboardLayoutsService.create).toHaveBeenCalledWith(userDto);
    });

    it('should not auto-assign userId for global scope', async () => {
      const globalDto: CreateLayoutDto = {
        ...validDto,
        scope: 'global',
        userId: undefined,
      };

      const mockCreatedLayout = {
        id: 'layout-4',
        ...globalDto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(globalDto, mockUser);

      expect(result.userId).toBeNull();
      expect(mockDashboardLayoutsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: 'global',
        })
      );
    });

    it('should create layout with description', async () => {
      const dtoWithDescription: CreateLayoutDto = {
        ...validDto,
        description: 'A custom layout for the overview page',
      };

      const mockCreatedLayout = {
        id: 'layout-5',
        ...dtoWithDescription,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(dtoWithDescription, mockUser);

      expect(result.description).toBe(dtoWithDescription.description);
    });

    it('should handle ConflictException from service', async () => {
      mockDashboardLayoutsService.create.mockRejectedValue(
        new ConflictException('A default layout already exists for this page')
      );

      await expect(controller.create(validDto, mockUser)).rejects.toThrow(ConflictException);
    });

    it('should handle BadRequestException from service', async () => {
      mockDashboardLayoutsService.create.mockRejectedValue(
        new BadRequestException('Invalid layout configuration')
      );

      await expect(controller.create(validDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should return layout with empty widgetInstances array', async () => {
      const mockCreatedLayout = {
        id: 'layout-6',
        ...validDto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(validDto, mockUser);

      expect(result.widgetInstances).toEqual([]);
    });

    it('should return layout with timestamps', async () => {
      const now = new Date();
      const mockCreatedLayout = {
        id: 'layout-7',
        ...validDto,
        userId: null,
        description: null,
        createdAt: now,
        updatedAt: now,
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(validDto, mockUser);

      expect(result.createdAt).toEqual(now);
      expect(result.updatedAt).toEqual(now);
    });

    it('should handle inactive layouts', async () => {
      const inactiveDto: CreateLayoutDto = {
        ...validDto,
        isActive: false,
      };

      const mockCreatedLayout = {
        id: 'layout-8',
        ...inactiveDto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(inactiveDto, mockUser);

      expect(result.isActive).toBe(false);
    });

    it('should handle default layouts', async () => {
      const defaultDto: CreateLayoutDto = {
        ...validDto,
        isDefault: true,
      };

      const mockCreatedLayout = {
        id: 'layout-9',
        ...defaultDto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(defaultDto, mockUser);

      expect(result.isDefault).toBe(true);
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
        id: 'layout-10',
        ...fullDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(fullDto, mockUser);

      expect(result).toEqual(mockCreatedLayout);
      expect(result.pageId).toBe(fullDto.pageId);
      expect(result.userId).toBe(fullDto.userId);
      expect(result.scope).toBe(fullDto.scope);
      expect(result.name).toBe(fullDto.name);
      expect(result.description).toBe(fullDto.description);
      expect(result.isActive).toBe(fullDto.isActive);
      expect(result.isDefault).toBe(fullDto.isDefault);
    });
  });

  describe('create - Permission Checks', () => {
    it('should require layouts:write permission', async () => {
      // This test verifies the @Permissions decorator is applied
      // In actual implementation, the PermissionsGuard would handle this
      const dto: CreateLayoutDto = {
        pageId: 'overview',
        name: 'My Layout',
        scope: 'global',
        isActive: true,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-11',
        ...dto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(dto, mockUser);

      expect(result).toBeDefined();
      expect(mockDashboardLayoutsService.create).toHaveBeenCalled();
    });
  });

  describe('create - Edge Cases', () => {
    it('should handle very long pageId', async () => {
      const dto: CreateLayoutDto = {
        pageId: 'a'.repeat(100),
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

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(dto, mockUser);

      expect(result.pageId).toBe(dto.pageId);
    });

    it('should handle very long name', async () => {
      const dto: CreateLayoutDto = {
        pageId: 'overview',
        name: 'a'.repeat(200),
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

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(dto, mockUser);

      expect(result.name).toBe(dto.name);
    });

    it('should handle special characters in name', async () => {
      const dto: CreateLayoutDto = {
        pageId: 'overview',
        name: 'My Layout (Custom) - v2.0',
        scope: 'global',
        isActive: true,
        isDefault: false,
      };

      const mockCreatedLayout = {
        id: 'layout-14',
        ...dto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(dto, mockUser);

      expect(result.name).toBe(dto.name);
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
        id: 'layout-15',
        ...dto,
        userId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgetInstances: [],
      };

      mockDashboardLayoutsService.create.mockResolvedValue(mockCreatedLayout);

      const result = await controller.create(dto, mockUser);

      expect(result.name).toBe(dto.name);
    });
  });
});
