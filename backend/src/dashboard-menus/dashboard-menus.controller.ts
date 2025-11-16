import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardMenusService } from './dashboard-menus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';

@ApiTags('dashboard-menus')
@Controller('dashboard-menus')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DashboardMenusController {
  constructor(private readonly dashboardMenusService: DashboardMenusService) {}

  /**
   * Get user-specific menus (filtered by role, permissions, feature flags)
   * GET /api/dashboard-menus/user-menus
   */
  @Get('user-menus')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({
    summary: 'Get user-specific menu items',
    description:
      'Returns filtered and hierarchical menu structure for the authenticated user based on their roles, permissions, and feature flags.',
  })
  @ApiResponse({ status: 200, description: 'Returns user-specific menus' })
  async getUserMenus(@CurrentUser() user: any) {
    return this.dashboardMenusService.findUserMenus(user.id);
  }

  /**
   * Get all menus (super admin only)
   * GET /api/dashboard-menus
   */
  @Get()
  @Permissions('menus:view')
  @ApiOperation({
    summary: 'Get all menu items',
    description: 'Returns all menu items including inactive ones. Super admin only.',
  })
  @ApiResponse({ status: 200, description: 'Returns all menus' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super admin only' })
  async findAll() {
    return this.dashboardMenusService.findAll();
  }

  /**
   * Get menu configuration for a specific route
   * GET /api/dashboard-menus/route?route=/path
   */
  @Get('route')
  @ApiOperation({
    summary: 'Get menu configuration by route',
    description: 'Returns page configuration for a specific route path.',
  })
  @ApiResponse({ status: 200, description: 'Returns page configuration' })
  @ApiResponse({ status: 404, description: 'Menu not found for route' })
  async getByRoute(@Query('route') route: string) {
    return this.dashboardMenusService.findByRoute(route);
  }

  /**
   * Get menu item by ID
   * GET /api/dashboard-menus/:id
   */
  @Get(':id')
  @Permissions('menus:view')
  @ApiOperation({
    summary: 'Get menu item by ID',
    description: 'Returns a single menu item. Super admin only.',
  })
  @ApiResponse({ status: 200, description: 'Returns menu item' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super admin only' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async findOne(@Param('id') id: string) {
    return this.dashboardMenusService.findOne(id);
  }

  /**
   * Create new menu item
   * POST /api/dashboard-menus
   */
  @Post()
  @Permissions('menus:create')
  @ApiOperation({
    summary: 'Create new menu item',
    description: 'Create a new menu item. Super admin only.',
  })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super admin only' })
  @ApiResponse({ status: 409, description: 'Menu key already exists' })
  async create(@Body() dto: CreateMenuDto) {
    return this.dashboardMenusService.create(dto);
  }

  /**
   * Reorder menu items
   * PATCH /api/dashboard-menus/reorder
   * Note: This route must come before /:id routes to avoid conflicts
   */
  @Patch('reorder')
  @Permissions('menus:update')
  @ApiOperation({
    summary: 'Reorder menu items',
    description: 'Update order values for multiple menu items. Super admin only.',
  })
  @ApiResponse({ status: 200, description: 'Menus reordered successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super admin only' })
  @ApiResponse({ status: 404, description: 'One or more menu IDs not found' })
  async reorder(@Body() dto: ReorderMenuDto) {
    return this.dashboardMenusService.reorder(dto);
  }

  /**
   * Toggle menu active status
   * PATCH /api/dashboard-menus/:id/toggle
   * Note: This route must come before /:id route to avoid conflicts
   */
  @Patch(':id/toggle')
  @Permissions('menus:update')
  @ApiOperation({
    summary: 'Toggle menu active status',
    description: 'Toggle the isActive status of a menu item. Super admin only.',
  })
  @ApiResponse({ status: 200, description: 'Menu status toggled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super admin only' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async toggleActive(@Param('id') id: string) {
    return this.dashboardMenusService.toggleActive(id);
  }

  /**
   * Update menu item
   * PATCH /api/dashboard-menus/:id
   */
  @Patch(':id')
  @Permissions('menus:update')
  @ApiOperation({
    summary: 'Update menu item',
    description: 'Update an existing menu item. Super admin only.',
  })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super admin only' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.dashboardMenusService.update(id, dto);
  }

  /**
   * Delete menu item
   * DELETE /api/dashboard-menus/:id
   */
  @Delete(':id')
  @Permissions('menus:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete menu item',
    description: 'Delete a menu item. Cannot delete if it has children. Super admin only.',
  })
  @ApiResponse({ status: 204, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete menu with children' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super admin only' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async delete(@Param('id') id: string) {
    await this.dashboardMenusService.delete(id);
  }
}
