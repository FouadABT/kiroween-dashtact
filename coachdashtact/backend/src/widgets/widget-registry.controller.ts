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
import { WidgetRegistryService } from './widget-registry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateWidgetDto,
  UpdateWidgetDto,
  WidgetFiltersDto,
  WidgetResponseDto,
  WidgetSearchDto,
} from './dto';

@ApiTags('widgets')
@Controller('widgets/registry')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class WidgetRegistryController {
  constructor(private readonly widgetRegistryService: WidgetRegistryService) {}

  @Get()
  @Permissions('widgets:read')
  @ApiOperation({ summary: 'Get all active widgets' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active widgets',
    type: [WidgetResponseDto],
  })
  async findAll(@Query() filters: WidgetFiltersDto, @CurrentUser() user: any) {
    const widgets = await this.widgetRegistryService.findAll(filters);

    // Filter by user permissions
    return this.widgetRegistryService.filterByPermissions(widgets, user);
  }

  @Get('categories')
  @Permissions('widgets:read')
  @ApiOperation({ summary: 'Get all widget categories' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of unique categories',
    type: [String],
  })
  async getCategories() {
    return this.widgetRegistryService.getCategories();
  }

  @Get('by-page/:pageIdentifier')
  @Permissions('widgets:read')
  @ApiOperation({ 
    summary: 'Get widgets available for a specific page',
    description: 'Returns widgets filtered by page identifier based on menu configuration. ' +
      'If no restrictions are configured for the page, returns all widgets.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns widgets available for the page',
    type: [WidgetResponseDto],
  })
  async findByPageIdentifier(
    @Param('pageIdentifier') pageIdentifier: string,
    @Query() filters: WidgetFiltersDto,
    @CurrentUser() user: any
  ) {
    // Get all widgets with filters
    const widgets = await this.widgetRegistryService.findAll(filters);

    // Filter by page identifier
    const pageFilteredWidgets = await this.widgetRegistryService.filterByPageIdentifier(
      widgets,
      pageIdentifier
    );

    // Filter by user permissions
    return this.widgetRegistryService.filterByPermissions(pageFilteredWidgets, user);
  }

  @Get('search')
  @Permissions('widgets:read')
  @ApiOperation({
    summary: 'Search widgets by natural language query',
    description:
      'Search for widgets using natural language queries. Supports intent matching, ' +
      'relevance scoring, and usage suggestions. Perfect for AI agents to discover ' +
      'appropriate widgets based on user needs.\n\n' +
      '**Examples:**\n' +
      '- "show revenue over time" → Returns chart widgets\n' +
      '- "display user statistics" → Returns stats and analytics widgets\n' +
      '- "manage customer data" → Returns data table and management widgets',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns matching widgets with relevance scores and suggestions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          widget: { $ref: '#/components/schemas/WidgetResponseDto' },
          score: { type: 'number', description: 'Relevance score (higher is better)' },
          relevance: { type: 'number', description: 'Relevance percentage (0-100)' },
          matchDetails: {
            type: 'array',
            items: { type: 'string' },
            description: 'Details about what matched',
          },
          suggestions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Usage suggestions for this widget',
          },
          examples: {
            type: 'array',
            description: 'Configuration examples',
          },
        },
      },
    },
  })
  async search(@Query() dto: WidgetSearchDto, @CurrentUser() user: any) {
    const results = await this.widgetRegistryService.searchByIntent(dto);

    // Filter by user permissions
    if (Array.isArray(results) && results.length > 0) {
      // Check if results include scores
      if (results[0].widget) {
        // Results with scores
        const filtered = results.filter((item) => {
          const allowed = this.widgetRegistryService.filterByPermissions(
            [item.widget],
            user,
          );
          return allowed.length > 0;
        });
        return filtered;
      } else {
        // Results without scores
        return this.widgetRegistryService.filterByPermissions(results, user);
      }
    }

    return results;
  }

  @Get(':key')
  @Permissions('widgets:read')
  @ApiOperation({ summary: 'Get widget by key' })
  @ApiResponse({
    status: 200,
    description: 'Returns the widget',
    type: WidgetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Widget not found' })
  async findByKey(@Param('key') key: string, @CurrentUser() user: any) {
    const widget = await this.widgetRegistryService.findByKey(key);

    // Check if user has permission to view this widget
    const allowed = this.widgetRegistryService.filterByPermissions(
      [widget],
      user,
    );

    if (allowed.length === 0) {
      // Return widget but mark as restricted
      return {
        ...widget,
        restricted: true,
        message: 'You do not have permission to use this widget',
      };
    }

    return widget;
  }

  @Post()
  @Permissions('widgets:write')
  @ApiOperation({ summary: 'Create a new widget (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Widget created successfully',
    type: WidgetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateWidgetDto) {
    return this.widgetRegistryService.create(dto);
  }

  @Patch(':key')
  @Permissions('widgets:write')
  @ApiOperation({ summary: 'Update a widget (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Widget updated successfully',
    type: WidgetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Widget not found' })
  async update(@Param('key') key: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetRegistryService.update(key, dto);
  }

  @Delete(':key')
  @Permissions('widgets:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a widget (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Widget deleted successfully',
    type: WidgetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Widget not found' })
  async remove(@Param('key') key: string) {
    return this.widgetRegistryService.remove(key);
  }
}
