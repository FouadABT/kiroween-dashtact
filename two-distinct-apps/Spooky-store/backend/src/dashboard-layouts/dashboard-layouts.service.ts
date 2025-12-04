import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLayoutDto } from './dto/create-layout.dto';
import { UpdateLayoutDto } from './dto/update-layout.dto';
import { AddWidgetDto } from './dto/add-widget.dto';
import { UpdateLayoutWidgetDto } from './dto/update-widget.dto';
import { ReorderWidgetsDto } from './dto/reorder-widgets.dto';
import { LayoutFiltersDto } from './dto/layout-filters.dto';
import { LayoutResponseDto } from './dto/layout-response.dto';

@Injectable()
export class DashboardLayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all layouts with optional filtering
   */
  async findAll(filters?: LayoutFiltersDto): Promise<LayoutResponseDto[]> {
    const where: any = {};

    if (filters?.pageId) {
      where.pageId = filters.pageId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.scope) {
      where.scope = filters.scope;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isDefault !== undefined) {
      where.isDefault = filters.isDefault;
    }

    const layouts = await this.prisma.dashboardLayout.findMany({
      where,
      include: {
        widgetInstances: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return layouts as LayoutResponseDto[];
  }

  /**
   * Find layout by page ID with user-specific override logic
   * User layout takes precedence over global layout
   */
  async findByPageId(pageId: string, userId?: string): Promise<LayoutResponseDto> {
    // First try to find user-specific layout
    if (userId) {
      const userLayout = await this.prisma.dashboardLayout.findFirst({
        where: {
          pageId,
          userId,
          isActive: true,
        },
        include: {
          widgetInstances: {
            where: { isVisible: true },
            orderBy: { position: 'asc' },
          },
        },
      });

      if (userLayout) {
        return userLayout as LayoutResponseDto;
      }
    }

    // Fall back to global layout
    const globalLayout = await this.prisma.dashboardLayout.findFirst({
      where: {
        pageId,
        userId: null,
        scope: 'global',
        isActive: true,
      },
      include: {
        widgetInstances: {
          where: { isVisible: true },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { isDefault: 'desc' },
    });

    if (!globalLayout) {
      throw new NotFoundException(`No layout found for page: ${pageId}`);
    }

    return globalLayout as LayoutResponseDto;
  }

  /**
   * Create a new layout
   */
  async create(dto: CreateLayoutDto): Promise<LayoutResponseDto> {
    // Check for existing layout with same pageId and userId
    const existing = await this.prisma.dashboardLayout.findFirst({
      where: {
        pageId: dto.pageId,
        userId: dto.userId || null,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Layout already exists for page ${dto.pageId} and user ${dto.userId || 'global'}`
      );
    }

    const layout = await this.prisma.dashboardLayout.create({
      data: {
        pageId: dto.pageId,
        userId: dto.userId,
        scope: dto.scope || 'global',
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        isDefault: dto.isDefault ?? false,
      },
      include: {
        widgetInstances: true,
      },
    });

    return layout as LayoutResponseDto;
  }

  /**
   * Update an existing layout
   */
  async update(id: string, dto: UpdateLayoutDto): Promise<LayoutResponseDto> {
    const existing = await this.prisma.dashboardLayout.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Layout with ID ${id} not found`);
    }

    const layout = await this.prisma.dashboardLayout.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        scope: dto.scope,
        isActive: dto.isActive,
        isDefault: dto.isDefault,
      },
      include: {
        widgetInstances: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return layout as LayoutResponseDto;
  }

  /**
   * Remove a layout (cascade deletes widget instances)
   */
  async remove(id: string): Promise<void> {
    const existing = await this.prisma.dashboardLayout.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Layout with ID ${id} not found`);
    }

    await this.prisma.dashboardLayout.delete({
      where: { id },
    });
  }

  /**
   * Clone a layout with a new name
   */
  async clone(id: string, name: string): Promise<LayoutResponseDto> {
    const original = await this.prisma.dashboardLayout.findUnique({
      where: { id },
      include: {
        widgetInstances: true,
      },
    });

    if (!original) {
      throw new NotFoundException(`Layout with ID ${id} not found`);
    }

    // Create new layout
    const cloned = await this.prisma.dashboardLayout.create({
      data: {
        pageId: original.pageId,
        userId: original.userId,
        scope: original.scope,
        name,
        description: original.description,
        isActive: true,
        isDefault: false,
        widgetInstances: {
          create: original.widgetInstances.map((widget) => ({
            widgetDefinition: {
              connect: { key: widget.widgetKey },
            },
            position: widget.position,
            gridSpan: widget.gridSpan,
            gridRow: widget.gridRow,
            config: widget.config as any,
            isVisible: widget.isVisible,
          })),
        },
      },
      include: {
        widgetInstances: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return cloned as LayoutResponseDto;
  }

  /**
   * Reset to default layout for a page
   */
  async resetToDefault(pageId: string, userId?: string): Promise<LayoutResponseDto> {
    // Delete user-specific layout if it exists
    if (userId) {
      await this.prisma.dashboardLayout.deleteMany({
        where: {
          pageId,
          userId,
        },
      });
    }

    // Return the default global layout
    return this.findByPageId(pageId, userId);
  }

  /**
   * Get pre-built layout templates
   */
  async getTemplates(): Promise<any[]> {
    const { LAYOUT_TEMPLATES } = await import('./templates/index.js');
    return LAYOUT_TEMPLATES;
  }

  /**
   * Get template by key
   */
  async getTemplateByKey(key: string): Promise<any> {
    const { getTemplateByKey } = await import('./templates/index.js');
    return getTemplateByKey(key);
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<any[]> {
    const { getTemplatesByCategory } = await import('./templates/index.js');
    return getTemplatesByCategory(category);
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string): Promise<any[]> {
    const { searchTemplates } = await import('./templates/index.js');
    return searchTemplates(query);
  }

  /**
   * Apply a template to create a new layout
   */
  async applyTemplate(
    templateKey: string,
    pageId: string,
    userId?: string,
    name?: string
  ): Promise<LayoutResponseDto> {
    const template = await this.getTemplateByKey(templateKey);
    
    if (!template) {
      throw new NotFoundException(`Template with key ${templateKey} not found`);
    }

    // Create layout from template
    const layout = await this.create({
      pageId,
      userId,
      scope: userId ? 'user' : 'global',
      name: name || template.name,
      description: template.description,
      isActive: true,
      isDefault: false,
    });

    // Add widgets from template
    for (const widgetConfig of template.widgets) {
      await this.addWidget(layout.id, {
        widgetKey: widgetConfig.widgetKey,
        position: widgetConfig.position,
        gridSpan: widgetConfig.gridSpan,
        gridRow: widgetConfig.gridRow,
        config: widgetConfig.config,
        isVisible: widgetConfig.isVisible ?? true,
      });
    }

    // Return the complete layout with widgets
    return this.findByPageId(pageId, userId);
  }

  /**
   * Add a widget to a layout
   */
  async addWidget(layoutId: string, dto: AddWidgetDto): Promise<any> {
    const layout = await this.prisma.dashboardLayout.findUnique({
      where: { id: layoutId },
      include: { widgetInstances: true },
    });

    if (!layout) {
      throw new NotFoundException(`Layout with ID ${layoutId} not found`);
    }

    // Validate widget exists in registry
    const widgetDefinition = await this.prisma.widgetDefinition.findUnique({
      where: { key: dto.widgetKey },
    });

    if (!widgetDefinition) {
      throw new NotFoundException(`Widget with key ${dto.widgetKey} not found`);
    }

    // Determine position if not provided
    const position = dto.position ?? layout.widgetInstances.length;

    // Create widget instance
    const widget = await this.prisma.widgetInstance.create({
      data: {
        layout: {
          connect: { id: layoutId },
        },
        widgetDefinition: {
          connect: { key: dto.widgetKey },
        },
        position,
        gridSpan: dto.gridSpan ?? widgetDefinition.defaultGridSpan,
        gridRow: dto.gridRow,
        config: dto.config ?? {},
        isVisible: dto.isVisible ?? true,
      },
    });

    return widget;
  }

  /**
   * Update a widget in a layout
   */
  async updateWidget(layoutId: string, widgetId: string, dto: UpdateLayoutWidgetDto): Promise<any> {
    const widget = await this.prisma.widgetInstance.findUnique({
      where: { id: widgetId },
      include: { widgetDefinition: true },
    });

    if (!widget || widget.layoutId !== layoutId) {
      throw new NotFoundException(`Widget with ID ${widgetId} not found in layout ${layoutId}`);
    }

    // Validate gridSpan against widget definition constraints
    if (dto.gridSpan !== undefined) {
      if (dto.gridSpan < 1 || dto.gridSpan > 12) {
        throw new BadRequestException('gridSpan must be between 1 and 12');
      }

      if (dto.gridSpan < widget.widgetDefinition.minGridSpan) {
        throw new BadRequestException(
          `gridSpan ${dto.gridSpan} is below minimum ${widget.widgetDefinition.minGridSpan} for this widget`
        );
      }

      if (dto.gridSpan > widget.widgetDefinition.maxGridSpan) {
        throw new BadRequestException(
          `gridSpan ${dto.gridSpan} exceeds maximum ${widget.widgetDefinition.maxGridSpan} for this widget`
        );
      }
    }

    // Update widget
    const updated = await this.prisma.widgetInstance.update({
      where: { id: widgetId },
      data: {
        position: dto.position,
        gridSpan: dto.gridSpan,
        gridRow: dto.gridRow,
        config: dto.config,
        isVisible: dto.isVisible,
      },
      include: { widgetDefinition: true },
    });

    return updated;
  }

  /**
   * Remove a widget from a layout
   */
  async removeWidget(layoutId: string, widgetId: string): Promise<void> {
    const widget = await this.prisma.widgetInstance.findUnique({
      where: { id: widgetId },
    });

    if (!widget || widget.layoutId !== layoutId) {
      throw new NotFoundException(`Widget with ID ${widgetId} not found in layout ${layoutId}`);
    }

    await this.prisma.widgetInstance.delete({
      where: { id: widgetId },
    });
  }

  /**
   * Reorder widgets in a layout
   */
  async reorderWidgets(layoutId: string, dto: ReorderWidgetsDto): Promise<LayoutResponseDto> {
    console.log('🔄 [SERVICE] Reorder widgets called:', {
      layoutId,
      updatesCount: dto.updates.length,
      updates: dto.updates.map(u => ({
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

    const layout = await this.prisma.dashboardLayout.findUnique({
      where: { id: layoutId },
      include: { widgetInstances: true },
    });

    if (!layout) {
      console.error('❌ [SERVICE] Layout not found:', layoutId);
      throw new NotFoundException(`Layout with ID ${layoutId} not found`);
    }

    console.log('✅ [SERVICE] Layout found:', {
      layoutId: layout.id,
      widgetCount: layout.widgetInstances.length,
      widgetIds: layout.widgetInstances.map(w => w.id)
    });

    // Validate widget IDs exist in layout
    const layoutWidgetIds = new Set(layout.widgetInstances.map(w => w.id));
    const invalidWidgetIds = dto.updates
      .map(u => u.id)
      .filter(id => !layoutWidgetIds.has(id));

    if (invalidWidgetIds.length > 0) {
      console.error('❌ [SERVICE] Invalid widget IDs:', invalidWidgetIds);
      throw new NotFoundException(
        `Widget IDs not found in layout: ${invalidWidgetIds.join(', ')}`
      );
    }

    // Update positions in a transaction
    console.log('🔄 [SERVICE] Starting transaction...');
    try {
      await this.prisma.$transaction(
        dto.updates.map((widget) => {
          const updateData = { 
            position: widget.position,
            gridRow: widget.gridRow !== undefined ? widget.gridRow : undefined,
          };
          console.log(`  📝 Updating widget ${widget.id}:`, updateData);
          
          return this.prisma.widgetInstance.update({
            where: { id: widget.id },
            data: updateData,
          });
        })
      );
      console.log('✅ [SERVICE] Transaction completed successfully');
    } catch (error) {
      console.error('❌ [SERVICE] Transaction failed:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }

    // Return updated layout
    console.log('🔄 [SERVICE] Fetching updated layout...');
    const result = await this.findByPageId(layout.pageId, layout.userId || undefined);
    console.log('✅ [SERVICE] Reorder complete');
    return result;
  }

  /**
   * Validate layout configuration with suggestions
   */
  async validateLayout(layoutId: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    complementaryWidgets: any[];
    optimizations: string[];
  }> {
    const layout = await this.prisma.dashboardLayout.findUnique({
      where: { id: layoutId },
      include: {
        widgetInstances: {
          include: {
            widgetDefinition: true,
          },
        },
      },
    });

    if (!layout) {
      throw new NotFoundException(`Layout with ID ${layoutId} not found`);
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const optimizations: string[] = [];

    // Validate grid spans
    for (const widget of layout.widgetInstances) {
      if (widget.gridSpan > 12) {
        errors.push(
          `Widget "${widget.widgetDefinition.name}" (${widget.id}) has gridSpan ${widget.gridSpan} which exceeds maximum of 12`,
        );
      }
      if (widget.gridSpan < 1) {
        errors.push(
          `Widget "${widget.widgetDefinition.name}" (${widget.id}) has gridSpan ${widget.gridSpan} which is below minimum of 1`,
        );
      }

      // Check against widget's min/max constraints
      if (widget.gridSpan < widget.widgetDefinition.minGridSpan) {
        warnings.push(
          `Widget "${widget.widgetDefinition.name}" has gridSpan ${widget.gridSpan} below recommended minimum of ${widget.widgetDefinition.minGridSpan}`,
        );
      }
      if (widget.gridSpan > widget.widgetDefinition.maxGridSpan) {
        warnings.push(
          `Widget "${widget.widgetDefinition.name}" has gridSpan ${widget.gridSpan} above recommended maximum of ${widget.widgetDefinition.maxGridSpan}`,
        );
      }
    }

    // Check for duplicate positions
    const positions = layout.widgetInstances.map((w) => w.position);
    const duplicates = positions.filter((pos, index) => positions.indexOf(pos) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate positions found: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Check row layout (widgets in same row shouldn't exceed 12 columns)
    const rowMap = new Map<number, number>();
    layout.widgetInstances.forEach((widget) => {
      const row = widget.gridRow || 0;
      const currentSpan = rowMap.get(row) || 0;
      rowMap.set(row, currentSpan + widget.gridSpan);
    });

    rowMap.forEach((totalSpan, row) => {
      if (totalSpan > 12) {
        warnings.push(
          `Row ${row} has total gridSpan of ${totalSpan} which exceeds 12 columns. Consider adjusting widget sizes or moving to new row.`,
        );
      }
    });

    // Validate widget configurations against schemas
    for (const widget of layout.widgetInstances) {
      const schema = widget.widgetDefinition.configSchema as any;
      const config = widget.config as any;

      if (schema && schema.required) {
        const missingFields = schema.required.filter(
          (field: string) => !(field in config),
        );
        if (missingFields.length > 0) {
          errors.push(
            `Widget "${widget.widgetDefinition.name}" is missing required configuration fields: ${missingFields.join(', ')}`,
          );
        }
      }
    }

    // Generate suggestions
    if (layout.widgetInstances.length === 0) {
      suggestions.push('Layout is empty. Add widgets to get started.');
      suggestions.push('Try applying a template for quick setup.');
    } else if (layout.widgetInstances.length < 3) {
      suggestions.push('Consider adding more widgets to make better use of dashboard space.');
    }

    // Check for common widget combinations
    const widgetKeys = layout.widgetInstances.map((w) => w.widgetDefinition.key);
    const hasChart = widgetKeys.some((key) => key.includes('chart'));
    const hasFilter = widgetKeys.some((key) => key.includes('filter') || key.includes('date'));

    if (hasChart && !hasFilter) {
      suggestions.push(
        'You have chart widgets. Consider adding a date-picker or filter widget for better data exploration.',
      );
    }

    // Get complementary widgets
    const complementaryWidgets = await this.getComplementaryWidgets(layout.widgetInstances);

    // Generate optimizations
    const avgGridSpan =
      layout.widgetInstances.reduce((sum, w) => sum + w.gridSpan, 0) /
      layout.widgetInstances.length;

    if (avgGridSpan < 4) {
      optimizations.push(
        'Many widgets are small. Consider increasing widget sizes for better visibility.',
      );
    }

    if (layout.widgetInstances.length > 12) {
      optimizations.push(
        'Layout has many widgets. Consider splitting into multiple pages for better performance.',
      );
    }

    // Check for widgets with similar purposes
    const categories = layout.widgetInstances.map((w) => w.widgetDefinition.category);
    const categoryCount = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count > 5) {
        optimizations.push(
          `You have ${count} ${category} widgets. Consider grouping related widgets or creating separate dashboards.`,
        );
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      complementaryWidgets,
      optimizations,
    };
  }

  /**
   * Get complementary widgets based on current layout
   */
  private async getComplementaryWidgets(widgetInstances: any[]): Promise<any[]> {
    const currentWidgetKeys = widgetInstances.map((w) => w.widgetDefinition.key);
    const currentCategories = widgetInstances.map((w) => w.widgetDefinition.category);

    // Define complementary widget relationships
    const complementaryMap: Record<string, string[]> = {
      'revenue-chart': ['date-picker', 'stats-card', 'data-table'],
      'stats-card': ['chart-widget', 'progress-widget'],
      'data-table': ['filter-widget', 'search-widget', 'export-button'],
      'chart-widget': ['date-picker', 'filter-widget', 'legend-widget'],
      'user-list': ['user-stats', 'activity-feed'],
      'activity-feed': ['notification-widget', 'timeline-widget'],
    };

    const suggestions: string[] = [];

    // Find complementary widgets for existing widgets
    currentWidgetKeys.forEach((key) => {
      const complements = complementaryMap[key];
      if (complements) {
        complements.forEach((complement) => {
          if (!currentWidgetKeys.includes(complement) && !suggestions.includes(complement)) {
            suggestions.push(complement);
          }
        });
      }
    });

    // Suggest widgets from underrepresented categories
    const allCategories = ['analytics', 'ecommerce', 'users', 'content', 'system'];
    const missingCategories = allCategories.filter(
      (cat) => !currentCategories.includes(cat),
    );

    // Get widgets from missing categories
    const complementaryWidgets = await this.prisma.widgetDefinition.findMany({
      where: {
        OR: [
          { key: { in: suggestions } },
          { category: { in: missingCategories.slice(0, 2) } },
        ],
        isActive: true,
      },
      take: 5,
    });

    return complementaryWidgets.map((widget) => ({
      key: widget.key,
      name: widget.name,
      description: widget.description,
      category: widget.category,
      icon: widget.icon,
      reason: suggestions.includes(widget.key)
        ? `Works well with ${currentWidgetKeys.find((k) => complementaryMap[k]?.includes(widget.key))}`
        : `Adds ${widget.category} functionality to your dashboard`,
    }));
  }
}