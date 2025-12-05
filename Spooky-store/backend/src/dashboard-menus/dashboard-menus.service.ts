import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuFilterService } from './menu-filter.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { MenuResponseDto } from './dto/menu-response.dto';

@Injectable()
export class DashboardMenusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menuFilterService: MenuFilterService,
  ) {}

  /**
   * Find user-specific menus with filtering applied
   */
  async findUserMenus(userId: string): Promise<MenuResponseDto[]> {
    // Get user with roles and permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get all active menus
    const menus = await this.prisma.dashboardMenu.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Extract user roles and permissions
    const userRoles = [user.role.name];
    const userPermissions = user.role.rolePermissions.map(
      (rp) => rp.permission.name,
    );

    // Get ecommerce settings for feature flag filtering
    const ecommerceSettings = await this.prisma.ecommerceSettings.findFirst({
      where: {
        OR: [{ scope: 'global' }, { userId }],
      },
      orderBy: { scope: 'desc' }, // User settings take precedence
    });

    // Apply filters
    let filteredMenus = this.menuFilterService.filterByRole(menus, userRoles);
    filteredMenus = this.menuFilterService.filterByPermission(
      filteredMenus,
      userPermissions,
    );
    filteredMenus = this.menuFilterService.filterByFeatureFlags(
      filteredMenus,
      ecommerceSettings,
    );

    // Sort by order
    filteredMenus = this.menuFilterService.sortByOrder(filteredMenus);

    // Build hierarchy
    const hierarchy = this.menuFilterService.buildHierarchy(filteredMenus);

    return hierarchy as MenuResponseDto[];
  }

  /**
   * Find all menus (super admin only)
   */
  async findAll(): Promise<MenuResponseDto[]> {
    const menus = await this.prisma.dashboardMenu.findMany({
      orderBy: { order: 'asc' },
    });

    return menus as MenuResponseDto[];
  }

  /**
   * Create new menu item
   */
  async create(dto: CreateMenuDto): Promise<MenuResponseDto> {
    // Check for duplicate key
    const existing = await this.prisma.dashboardMenu.findUnique({
      where: { key: dto.key },
    });

    if (existing) {
      throw new ConflictException(`Menu with key ${dto.key} already exists`);
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.dashboardMenu.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent menu with ID ${dto.parentId} not found`);
      }
    }

    // Validate page type and identifier/path combinations
    if (dto.pageType === 'WIDGET_BASED' && !dto.pageIdentifier) {
      throw new BadRequestException(
        'pageIdentifier is required for WIDGET_BASED page type',
      );
    }

    if (dto.pageType === 'HARDCODED' && !dto.componentPath) {
      throw new BadRequestException(
        'componentPath is required for HARDCODED page type',
      );
    }

    const menu = await this.prisma.dashboardMenu.create({
      data: {
        key: dto.key,
        label: dto.label,
        icon: dto.icon,
        route: dto.route,
        order: dto.order,
        parentId: dto.parentId,
        pageType: dto.pageType,
        pageIdentifier: dto.pageIdentifier,
        componentPath: dto.componentPath,
        isActive: dto.isActive ?? true,
        requiredPermissions: dto.requiredPermissions || [],
        requiredRoles: dto.requiredRoles || [],
        featureFlag: dto.featureFlag,
        description: dto.description,
        badge: dto.badge,
        availableWidgets: dto.availableWidgets || [],
      },
    });

    return menu as MenuResponseDto;
  }

  /**
   * Update existing menu item
   */
  async update(id: string, dto: UpdateMenuDto): Promise<MenuResponseDto> {
    const existing = await this.prisma.dashboardMenu.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.dashboardMenu.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent menu with ID ${dto.parentId} not found`);
      }

      // Prevent circular references
      if (dto.parentId === id) {
        throw new BadRequestException('Menu cannot be its own parent');
      }
    }

    // Validate page type and identifier/path combinations
    const pageType = dto.pageType || existing.pageType;
    const pageIdentifier = dto.pageIdentifier !== undefined ? dto.pageIdentifier : existing.pageIdentifier;
    const componentPath = dto.componentPath !== undefined ? dto.componentPath : existing.componentPath;

    if (pageType === 'WIDGET_BASED' && !pageIdentifier) {
      throw new BadRequestException(
        'pageIdentifier is required for WIDGET_BASED page type',
      );
    }

    if (pageType === 'HARDCODED' && !componentPath) {
      throw new BadRequestException(
        'componentPath is required for HARDCODED page type',
      );
    }

    const menu = await this.prisma.dashboardMenu.update({
      where: { id },
      data: {
        key: dto.key,
        label: dto.label,
        icon: dto.icon,
        route: dto.route,
        order: dto.order,
        parentId: dto.parentId,
        pageType: dto.pageType,
        pageIdentifier: dto.pageIdentifier,
        componentPath: dto.componentPath,
        isActive: dto.isActive,
        requiredPermissions: dto.requiredPermissions,
        requiredRoles: dto.requiredRoles,
        featureFlag: dto.featureFlag,
        description: dto.description,
        badge: dto.badge,
        availableWidgets: dto.availableWidgets,
      },
    });

    return menu as MenuResponseDto;
  }

  /**
   * Delete menu item
   */
  async delete(id: string): Promise<void> {
    const existing = await this.prisma.dashboardMenu.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!existing) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // Check if menu has children
    if (existing.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete menu with children. Delete children first or reassign them.',
      );
    }

    await this.prisma.dashboardMenu.delete({
      where: { id },
    });
  }

  /**
   * Reorder menu items
   */
  async reorder(dto: ReorderMenuDto): Promise<MenuResponseDto[]> {
    // Validate all menu IDs exist
    const menuIds = dto.items.map((item) => item.id);
    const menus = await this.prisma.dashboardMenu.findMany({
      where: { id: { in: menuIds } },
    });

    if (menus.length !== menuIds.length) {
      throw new NotFoundException('One or more menu IDs not found');
    }

    // Update order values in transaction
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.dashboardMenu.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    // Return updated menus
    return this.findAll();
  }

  /**
   * Toggle menu active status
   */
  async toggleActive(id: string): Promise<MenuResponseDto> {
    const existing = await this.prisma.dashboardMenu.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    const menu = await this.prisma.dashboardMenu.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return menu as MenuResponseDto;
  }

  /**
   * Find menu item by ID
   */
  async findOne(id: string): Promise<MenuResponseDto> {
    const menu = await this.prisma.dashboardMenu.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu as MenuResponseDto;
  }

  /**
   * Find menu configuration by route
   * Returns page configuration for dynamic page rendering
   */
  async findByRoute(route: string): Promise<{
    pageType: string;
    pageIdentifier?: string;
    componentPath?: string;
    requiredPermissions: string[];
    requiredRoles: string[];
  }> {
    const menu = await this.prisma.dashboardMenu.findFirst({
      where: { route, isActive: true },
    });

    if (!menu) {
      throw new NotFoundException(`Menu not found for route: ${route}`);
    }

    return {
      pageType: menu.pageType,
      pageIdentifier: menu.pageIdentifier || undefined,
      componentPath: menu.componentPath || undefined,
      requiredPermissions: menu.requiredPermissions as string[],
      requiredRoles: menu.requiredRoles as string[],
    };
  }
}
