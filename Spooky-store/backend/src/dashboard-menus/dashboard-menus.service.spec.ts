import { Test, TestingModule } from '@nestjs/testing';
import { DashboardMenusService } from './dashboard-menus.service';
import { MenuFilterService } from './menu-filter.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PageType } from './dto/create-menu.dto';

describe('DashboardMenusService', () => {
  let service: DashboardMenusService;
  let prisma: PrismaService;
  let menuFilterService: MenuFilterService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    dashboardMenu: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    ecommerceSettings: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockMenuFilterService = {
    filterByRole: jest.fn((menus) => menus),
    filterByPermission: jest.fn((menus) => menus),
    filterByFeatureFlags: jest.fn((menus) => menus),
    sortByOrder: jest.fn((menus) => menus),
    buildHierarchy: jest.fn((menus) => menus),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardMenusService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MenuFilterService,
          useValue: mockMenuFilterService,
        },
      ],
    }).compile();

    service = module.get<DashboardMenusService>(DashboardMenusService);
    prisma = module.get<PrismaService>(PrismaService);
    menuFilterService = module.get<MenuFilterService>(MenuFilterService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserMenus', () => {
    it('should return filtered menus for user', async () => {
      const mockUser = {
        id: 'user-1',
        role: {
          name: 'Admin',
          rolePermissions: [
            { permission: { name: 'products:read' } },
          ],
        },
      };

      const mockMenus = [
        {
          id: 'menu-1',
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'Home',
          route: '/dashboard',
          order: 1,
          isActive: true,
          pageType: PageType.WIDGET_BASED,
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.dashboardMenu.findMany.mockResolvedValue(mockMenus);
      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(null);

      const result = await service.findUserMenus('user-1');

      expect(result).toBeDefined();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findUserMenus('invalid-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new menu item', async () => {
      const createDto = {
        key: 'test-menu',
        label: 'Test Menu',
        icon: 'Home',
        route: '/test',
        order: 1,
        pageType: PageType.WIDGET_BASED,
        pageIdentifier: 'test-page',
      };

      const mockCreatedMenu = { id: 'menu-1', ...createDto };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(null);
      mockPrismaService.dashboardMenu.create.mockResolvedValue(mockCreatedMenu);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedMenu);
      expect(mockPrismaService.dashboardMenu.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when key already exists', async () => {
      const createDto = {
        key: 'existing-menu',
        label: 'Test Menu',
        icon: 'Home',
        route: '/test',
        order: 1,
        pageType: PageType.WIDGET_BASED,
      };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue({
        id: 'existing-menu-id',
        key: 'existing-menu',
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when parent not found', async () => {
      const createDto = {
        key: 'test-menu',
        label: 'Test Menu',
        icon: 'Home',
        route: '/test',
        order: 1,
        pageType: PageType.WIDGET_BASED,
        parentId: 'non-existent-parent',
      };

      mockPrismaService.dashboardMenu.findUnique
        .mockResolvedValueOnce(null) // For key check
        .mockResolvedValueOnce(null); // For parent check

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when WIDGET_BASED without pageIdentifier', async () => {
      const createDto = {
        key: 'test-menu',
        label: 'Test Menu',
        icon: 'Home',
        route: '/test',
        order: 1,
        pageType: PageType.WIDGET_BASED,
        // Missing pageIdentifier
      };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when HARDCODED without componentPath', async () => {
      const createDto = {
        key: 'test-menu',
        label: 'Test Menu',
        icon: 'Home',
        route: '/test',
        order: 1,
        pageType: PageType.HARDCODED,
        // Missing componentPath
      };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update an existing menu item', async () => {
      const updateDto = {
        label: 'Updated Label',
      };

      const existingMenu = {
        id: 'menu-1',
        key: 'test-menu',
        label: 'Test Menu',
        pageType: PageType.WIDGET_BASED,
        pageIdentifier: 'test-page',
      };

      const updatedMenu = { ...existingMenu, ...updateDto };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(existingMenu);
      mockPrismaService.dashboardMenu.update.mockResolvedValue(updatedMenu);

      const result = await service.update('menu-1', updateDto);

      expect(result).toEqual(updatedMenu);
    });

    it('should throw NotFoundException when menu not found', async () => {
      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when setting self as parent', async () => {
      const existingMenu = { id: 'menu-1', key: 'test-menu' };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(existingMenu);

      await expect(
        service.update('menu-1', { parentId: 'menu-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a menu item', async () => {
      const existingMenu = {
        id: 'menu-1',
        key: 'test-menu',
        children: [],
      };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(existingMenu);
      mockPrismaService.dashboardMenu.delete.mockResolvedValue(existingMenu);

      await service.delete('menu-1');

      expect(mockPrismaService.dashboardMenu.delete).toHaveBeenCalledWith({
        where: { id: 'menu-1' },
      });
    });

    it('should throw NotFoundException when menu not found', async () => {
      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(null);

      await expect(service.delete('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when menu has children', async () => {
      const existingMenu = {
        id: 'menu-1',
        key: 'test-menu',
        children: [{ id: 'child-1' }],
      };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(existingMenu);

      await expect(service.delete('menu-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reorder', () => {
    it('should reorder menu items', async () => {
      const reorderDto = {
        items: [
          { id: 'menu-1', order: 2 },
          { id: 'menu-2', order: 1 },
        ],
      };

      const mockMenus = [
        { id: 'menu-1', key: 'menu-1' },
        { id: 'menu-2', key: 'menu-2' },
      ];

      mockPrismaService.dashboardMenu.findMany.mockResolvedValue(mockMenus);
      mockPrismaService.$transaction.mockResolvedValue([]);

      await service.reorder(reorderDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when menu IDs not found', async () => {
      const reorderDto = {
        items: [
          { id: 'menu-1', order: 1 },
          { id: 'invalid-id', order: 2 },
        ],
      };

      mockPrismaService.dashboardMenu.findMany.mockResolvedValue([
        { id: 'menu-1' },
      ]);

      await expect(service.reorder(reorderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle menu active status', async () => {
      const existingMenu = {
        id: 'menu-1',
        key: 'test-menu',
        isActive: true,
      };

      const toggledMenu = { ...existingMenu, isActive: false };

      mockPrismaService.dashboardMenu.findUnique.mockResolvedValue(existingMenu);
      mockPrismaService.dashboardMenu.update.mockResolvedValue(toggledMenu);

      const result = await service.toggleActive('menu-1');

      expect(result.isActive).toBe(false);
    });
  });
});
