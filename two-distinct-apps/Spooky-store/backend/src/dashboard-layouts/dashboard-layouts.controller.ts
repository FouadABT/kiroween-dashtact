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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardLayoutsService } from './dashboard-layouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateLayoutDto } from './dto/create-layout.dto';
import { UpdateLayoutDto } from './dto/update-layout.dto';
import { AddWidgetDto } from './dto/add-widget.dto';
import { UpdateLayoutWidgetDto } from './dto/update-widget.dto';
import { ReorderWidgetsDto } from './dto/reorder-widgets.dto';
import { LayoutFiltersDto } from './dto/layout-filters.dto';

@ApiTags('layouts')
@Controller('dashboard-layouts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DashboardLayoutsController {
  constructor(private readonly dashboardLayoutsService: DashboardLayoutsService) {}

  /**
   * List layouts for current user
   * GET /api/dashboard-layouts
   */
  @Get()
  @Permissions('layouts:read')
  @ApiOperation({
    summary: 'List dashboard layouts',
    description: 'Get all layouts for the current user with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Returns list of layouts' })
  async findAll(@Query() filters: LayoutFiltersDto, @CurrentUser() user: any) {
    // If no userId filter provided, default to current user's layouts
    if (!filters.userId) {
      filters.userId = user.id;
    }

    return this.dashboardLayoutsService.findAll(filters);
  }

  /**
   * Get layout for specific page
   * GET /api/dashboard-layouts/:pageId
   */
  @Get(':pageId')
  @Permissions('layouts:read')
  @ApiOperation({
    summary: 'Get layout for specific page',
    description: 'Returns the layout for a specific page. User-specific layouts take precedence over global layouts.',
  })
  @ApiResponse({ status: 200, description: 'Returns the layout' })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  async findByPageId(@Param('pageId') pageId: string, @CurrentUser() user: any) {
    return this.dashboardLayoutsService.findByPageId(pageId, user.id);
  }

  /**
   * Create new layout
   * POST /api/dashboard-layouts
   */
  @Post()
  @Permissions('layouts:write')
  @ApiOperation({
    summary: 'Create new dashboard layout',
    description: 'Create a new layout for a specific page. Can be user-specific or global.',
  })
  @ApiResponse({ status: 201, description: 'Layout created successfully' })
  @ApiResponse({ status: 409, description: 'Layout already exists for this page and user' })
  async create(@Body() dto: CreateLayoutDto, @CurrentUser() user: any) {
    // If scope is 'user' and no userId provided, use current user
    if (dto.scope === 'user' && !dto.userId) {
      dto.userId = user.id;
    }

    return this.dashboardLayoutsService.create(dto);
  }

  /**
   * Update layout
   * PATCH /api/dashboard-layouts/:id
   */
  @Patch(':id')
  @Permissions('layouts:write')
  async update(@Param('id') id: string, @Body() dto: UpdateLayoutDto) {
    return this.dashboardLayoutsService.update(id, dto);
  }

  /**
   * Delete layout
   * DELETE /api/dashboard-layouts/:id
   */
  @Delete(':id')
  @Permissions('layouts:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.dashboardLayoutsService.remove(id);
  }

  /**
   * Clone layout
   * POST /api/dashboard-layouts/:id/clone
   */
  @Post(':id/clone')
  @Permissions('layouts:write')
  async clone(@Param('id') id: string, @Body('name') name: string) {
    return this.dashboardLayoutsService.clone(id, name);
  }

  /**
   * Reset to default layout
   * POST /api/dashboard-layouts/reset
   */
  @Post('reset')
  @Permissions('layouts:write')
  async resetToDefault(@Body('pageId') pageId: string, @CurrentUser() user: any) {
    return this.dashboardLayoutsService.resetToDefault(pageId, user.id);
  }

  /**
   * List layout templates
   * GET /api/dashboard-layouts/templates
   */
  @Get('templates/list')
  @Permissions('layouts:read')
  @ApiOperation({
    summary: 'List available layout templates',
    description: 'Get all pre-built layout templates that can be applied to create dashboards quickly.',
  })
  @ApiResponse({ status: 200, description: 'Returns list of templates' })
  async getTemplates() {
    return this.dashboardLayoutsService.getTemplates();
  }

  /**
   * Get template by key
   * GET /api/dashboard-layouts/templates/:key
   */
  @Get('templates/:key')
  @Permissions('layouts:read')
  async getTemplateByKey(@Param('key') key: string) {
    return this.dashboardLayoutsService.getTemplateByKey(key);
  }

  /**
   * Search templates
   * GET /api/dashboard-layouts/templates/search?query=:term
   */
  @Get('templates/search')
  @Permissions('layouts:read')
  async searchTemplates(@Query('query') query: string) {
    return this.dashboardLayoutsService.searchTemplates(query);
  }

  /**
   * Apply template to create layout
   * POST /api/dashboard-layouts/templates/:key/apply
   */
  @Post('templates/:key/apply')
  @Permissions('layouts:write')
  async applyTemplate(
    @Param('key') templateKey: string,
    @Body('pageId') pageId: string,
    @Body('name') name: string,
    @CurrentUser() user: any
  ) {
    return this.dashboardLayoutsService.applyTemplate(templateKey, pageId, user.id, name);
  }

  /**
   * Add widget to layout
   * POST /api/dashboard-layouts/:id/widgets
   */
  @Post(':id/widgets')
  @Permissions('layouts:write')
  @ApiOperation({
    summary: 'Add widget to layout',
    description: 'Add a new widget instance to an existing layout with configuration.',
  })
  @ApiResponse({ status: 201, description: 'Widget added successfully' })
  @ApiResponse({ status: 404, description: 'Layout or widget not found' })
  async addWidget(@Param('id') layoutId: string, @Body() dto: AddWidgetDto) {
    return this.dashboardLayoutsService.addWidget(layoutId, dto);
  }

  /**
   * Reorder widgets in layout
   * PATCH /api/dashboard-layouts/:id/widgets/reorder
   * NOTE: This route MUST come before :layoutId/widgets/:widgetId to avoid route conflicts
   */
  @Patch(':id/widgets/reorder')
  @Permissions('layouts:write')
  async reorderWidgets(@Param('id') layoutId: string, @Body() dto: ReorderWidgetsDto) {
    console.log('🔄 [REORDER] Received request:', {
      layoutId,
      dto: JSON.stringify(dto, null, 2),
      updatesCount: dto?.updates?.length,
      updates: dto?.updates?.map(u => ({
        id: u.id,
        position: u.position,
        gridRow: u.gridRow,
        types: {
          id: typeof u.id,
          position: typeof u.position,
          gridRow: typeof u.gridRow,
        }
      }))
    });
    
    try {
      const result = await this.dashboardLayoutsService.reorderWidgets(layoutId, dto);
      console.log('✅ [REORDER] Success');
      return result;
    } catch (error) {
      console.error('❌ [REORDER] Error:', {
        message: error.message,
        stack: error.stack,
        dto: JSON.stringify(dto, null, 2)
      });
      throw error;
    }
  }

  /**
   * Update widget in layout
   * PATCH /api/dashboard-layouts/:layoutId/widgets/:widgetId
   */
  @Patch(':layoutId/widgets/:widgetId')
  @Permissions('layouts:write')
  @ApiOperation({
    summary: 'Update widget in layout',
    description: 'Update widget properties like position, gridSpan, gridRow, config, or visibility.',
  })
  @ApiResponse({ status: 200, description: 'Widget updated successfully' })
  @ApiResponse({ status: 404, description: 'Layout or widget not found' })
  @ApiResponse({ status: 400, description: 'Invalid widget configuration' })
  async updateWidget(
    @Param('layoutId') layoutId: string,
    @Param('widgetId') widgetId: string,
    @Body() dto: UpdateLayoutWidgetDto
  ) {
    return this.dashboardLayoutsService.updateWidget(layoutId, widgetId, dto);
  }

  /**
   * Remove widget from layout
   * DELETE /api/dashboard-layouts/:layoutId/widgets/:widgetId
   */
  @Delete(':layoutId/widgets/:widgetId')
  @Permissions('layouts:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeWidget(@Param('layoutId') layoutId: string, @Param('widgetId') widgetId: string) {
    await this.dashboardLayoutsService.removeWidget(layoutId, widgetId);
  }

  /**
   * Validate layout configuration
   * POST /api/dashboard-layouts/validate/:id
   */
  @Post('validate/:id')
  @Permissions('layouts:read')
  @ApiOperation({
    summary: 'Validate layout configuration',
    description:
      'Validates a dashboard layout configuration and provides:\n' +
      '- **Errors**: Critical issues that must be fixed\n' +
      '- **Warnings**: Non-critical issues that should be addressed\n' +
      '- **Suggestions**: Recommendations for improving the layout\n' +
      '- **Complementary Widgets**: Widgets that work well with current layout\n' +
      '- **Optimizations**: Performance and UX improvements\n\n' +
      'Perfect for AI agents to ensure layouts are valid before saving.',
  })
  @ApiResponse({
    status: 200,
    description: 'Validation results with suggestions',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', description: 'Whether layout is valid' },
        errors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Critical errors that must be fixed',
        },
        warnings: {
          type: 'array',
          items: { type: 'string' },
          description: 'Non-critical issues',
        },
        suggestions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Recommendations for improvement',
        },
        complementaryWidgets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              icon: { type: 'string' },
              reason: { type: 'string', description: 'Why this widget is suggested' },
            },
          },
          description: 'Widgets that complement the current layout',
        },
        optimizations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Performance and UX optimization suggestions',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  async validateLayout(@Param('id') layoutId: string) {
    return this.dashboardLayoutsService.validateLayout(layoutId);
  }
}
