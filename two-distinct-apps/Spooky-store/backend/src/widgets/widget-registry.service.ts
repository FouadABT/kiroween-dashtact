import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { WidgetFiltersDto } from './dto/widget-filters.dto';
import { WidgetSearchDto } from './dto/widget-search.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WidgetRegistryService {
  private readonly logger = new Logger(WidgetRegistryService.name);
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all widgets with optional filtering
   */
  async findAll(filters?: WidgetFiltersDto) {
    const cacheKey = `findAll:${JSON.stringify(filters || {})}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached widget list');
      return cached;
    }

    const where: Prisma.WidgetDefinitionWhereInput = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
      ];
    }

    const widgets = await this.prisma.widgetDefinition.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    this.setCache(cacheKey, widgets);
    return widgets;
  }

  /**
   * Find widget by key
   */
  async findByKey(key: string) {
    const cacheKey = `findByKey:${key}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached widget: ${key}`);
      return cached;
    }

    const widget = await this.prisma.widgetDefinition.findUnique({
      where: { key },
    });

    if (!widget) {
      throw new NotFoundException(`Widget with key "${key}" not found`);
    }

    this.setCache(cacheKey, widget);
    return widget;
  }

  /**
   * Create a new widget
   */
  async create(dto: CreateWidgetDto) {
    // Validate JSON schema
    this.validateConfigSchema(dto.configSchema);

    // Check if key already exists
    const existing = await this.prisma.widgetDefinition.findUnique({
      where: { key: dto.key },
    });

    if (existing) {
      throw new BadRequestException(
        `Widget with key "${dto.key}" already exists`,
      );
    }

    const widget = await this.prisma.widgetDefinition.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        component: dto.component,
        category: dto.category,
        icon: dto.icon,
        defaultGridSpan: dto.defaultGridSpan ?? 6,
        minGridSpan: dto.minGridSpan ?? 3,
        maxGridSpan: dto.maxGridSpan ?? 12,
        configSchema: dto.configSchema,
        dataRequirements: dto.dataRequirements,
        useCases: dto.useCases ?? [],
        examples: dto.examples ?? [],
        tags: dto.tags ?? [],
        isActive: dto.isActive ?? true,
        isSystemWidget: dto.isSystemWidget ?? false,
      },
    });

    this.clearCache();
    this.logger.log(`Created widget: ${widget.key}`);
    return widget;
  }

  /**
   * Update a widget
   */
  async update(key: string, dto: UpdateWidgetDto) {
    // Verify widget exists
    await this.findByKey(key);

    // Validate JSON schema if provided
    if (dto.configSchema) {
      this.validateConfigSchema(dto.configSchema);
    }

    const widget = await this.prisma.widgetDefinition.update({
      where: { key },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.component && { component: dto.component }),
        ...(dto.category && { category: dto.category }),
        ...(dto.icon && { icon: dto.icon }),
        ...(dto.defaultGridSpan !== undefined && {
          defaultGridSpan: dto.defaultGridSpan,
        }),
        ...(dto.minGridSpan !== undefined && {
          minGridSpan: dto.minGridSpan,
        }),
        ...(dto.maxGridSpan !== undefined && {
          maxGridSpan: dto.maxGridSpan,
        }),
        ...(dto.configSchema && { configSchema: dto.configSchema }),
        ...(dto.dataRequirements && {
          dataRequirements: dto.dataRequirements,
        }),
        ...(dto.useCases && { useCases: dto.useCases }),
        ...(dto.examples && { examples: dto.examples }),
        ...(dto.tags && { tags: dto.tags }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isSystemWidget !== undefined && {
          isSystemWidget: dto.isSystemWidget,
        }),
      },
    });

    this.clearCache();
    this.logger.log(`Updated widget: ${key}`);
    return widget;
  }

  /**
   * Remove a widget (soft delete)
   */
  async remove(key: string) {
    // Verify widget exists
    await this.findByKey(key);

    const widget = await this.prisma.widgetDefinition.update({
      where: { key },
      data: { isActive: false },
    });

    this.clearCache();
    this.logger.log(`Soft deleted widget: ${key}`);
    return widget;
  }

  /**
   * Search widgets by intent (natural language with enhanced matching)
   */
  async searchByIntent(dto: WidgetSearchDto) {
    const {
      query,
      limit = 10,
      includeScores = true,
      includeSuggestions = true,
      includeExamples = true,
    } = dto;

    // Get all active widgets
    const widgets = await this.findAll({ isActive: true });

    // Enhanced relevance scoring with intent matching
    const scored = widgets.map((widget) => {
      let score = 0;
      const lowerQuery = query.toLowerCase();
      const queryWords = lowerQuery.split(/\s+/);
      const matchDetails: string[] = [];

      // Exact name match (highest weight)
      if (widget.name.toLowerCase() === lowerQuery) {
        score += 20;
        matchDetails.push('Exact name match');
      } else if (widget.name.toLowerCase().includes(lowerQuery)) {
        score += 10;
        matchDetails.push('Name contains query');
      }

      // Check individual words in name
      queryWords.forEach((word) => {
        if (word.length > 2 && widget.name.toLowerCase().includes(word)) {
          score += 3;
        }
      });

      // Description matching
      if (widget.description.toLowerCase().includes(lowerQuery)) {
        score += 7;
        matchDetails.push('Description match');
      }

      // Check individual words in description
      queryWords.forEach((word) => {
        if (word.length > 2 && widget.description.toLowerCase().includes(word)) {
          score += 2;
        }
      });

      // Tags matching (high weight for exact matches)
      const matchingTags = widget.tags.filter((tag) => {
        const tagLower = tag.toLowerCase();
        if (tagLower === lowerQuery) {
          score += 8;
          return true;
        }
        if (tagLower.includes(lowerQuery)) {
          score += 4;
          return true;
        }
        return queryWords.some((word) => word.length > 2 && tagLower.includes(word));
      });
      if (matchingTags.length > 0) {
        matchDetails.push(`Matched tags: ${matchingTags.join(', ')}`);
      }

      // Use cases matching (intent-based)
      const matchingUseCases = widget.useCases.filter((useCase) => {
        const useCaseLower = useCase.toLowerCase();
        if (useCaseLower.includes(lowerQuery)) {
          score += 6;
          return true;
        }
        return queryWords.some((word) => word.length > 2 && useCaseLower.includes(word));
      });
      if (matchingUseCases.length > 0) {
        matchDetails.push(`Matched use cases: ${matchingUseCases.join(', ')}`);
      }

      // Category matching
      if (widget.category.toLowerCase().includes(lowerQuery)) {
        score += 2;
        matchDetails.push('Category match');
      }

      // Intent-based keyword matching
      const intentKeywords = this.extractIntentKeywords(lowerQuery);
      intentKeywords.forEach((keyword) => {
        if (
          widget.name.toLowerCase().includes(keyword) ||
          widget.description.toLowerCase().includes(keyword) ||
          widget.tags.some((tag) => tag.toLowerCase().includes(keyword)) ||
          widget.useCases.some((uc) => uc.toLowerCase().includes(keyword))
        ) {
          score += 1;
        }
      });

      // Generate usage suggestions
      const suggestions = includeSuggestions
        ? this.generateUsageSuggestions(widget, query, matchingUseCases)
        : [];

      // Calculate relevance percentage
      const maxPossibleScore = 50; // Approximate max score
      const relevance = Math.min(100, Math.round((score / maxPossibleScore) * 100));

      return {
        widget,
        score,
        relevance,
        matchDetails,
        suggestions,
        examples: includeExamples ? widget.examples : undefined,
      };
    });

    // Filter and sort by score
    const results = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (!includeScores) {
      return results.map((item) => item.widget);
    }

    return results;
  }

  /**
   * Extract intent keywords from natural language query
   */
  private extractIntentKeywords(query: string): string[] {
    const intentMap: Record<string, string[]> = {
      show: ['display', 'view', 'visualize', 'chart', 'graph'],
      revenue: ['sales', 'income', 'earnings', 'profit'],
      time: ['timeline', 'period', 'date', 'temporal', 'trend'],
      user: ['customer', 'account', 'profile', 'member'],
      data: ['information', 'stats', 'statistics', 'metrics'],
      list: ['table', 'grid', 'items', 'records'],
      create: ['add', 'new', 'make', 'generate'],
      edit: ['update', 'modify', 'change'],
      analytics: ['analysis', 'insights', 'reports', 'metrics'],
      performance: ['speed', 'efficiency', 'optimization'],
    };

    const keywords: string[] = [];
    const words = query.toLowerCase().split(/\s+/);

    words.forEach((word) => {
      if (intentMap[word]) {
        keywords.push(...intentMap[word]);
      }
    });

    return keywords;
  }

  /**
   * Generate usage suggestions based on widget and query
   */
  private generateUsageSuggestions(
    widget: any,
    query: string,
    matchingUseCases: string[],
  ): string[] {
    const suggestions: string[] = [];

    // Add matched use cases as suggestions
    if (matchingUseCases.length > 0) {
      suggestions.push(...matchingUseCases.slice(0, 2));
    }

    // Add general suggestions based on widget category
    const categorySuggestions: Record<string, string[]> = {
      analytics: [
        'Use for dashboard analytics and reporting',
        'Ideal for visualizing trends and patterns',
      ],
      ecommerce: [
        'Perfect for e-commerce dashboards',
        'Track sales and customer metrics',
      ],
      users: [
        'Manage user data and permissions',
        'Display user activity and engagement',
      ],
      content: [
        'Organize and display content',
        'Manage content creation workflows',
      ],
      system: [
        'Monitor system health and status',
        'Display system-wide information',
      ],
    };

    const catSuggestions = categorySuggestions[widget.category];
    if (catSuggestions && suggestions.length < 3) {
      suggestions.push(...catSuggestions.slice(0, 3 - suggestions.length));
    }

    // Add configuration suggestions if widget has examples
    if (widget.examples && widget.examples.length > 0 && suggestions.length < 3) {
      suggestions.push(
        `Try example configuration: ${widget.examples[0].name || 'Default'}`,
      );
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Get unique categories
   */
  async getCategories() {
    const cacheKey = 'categories';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const widgets = await this.prisma.widgetDefinition.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    const categories = widgets.map((w) => w.category);
    this.setCache(cacheKey, categories);
    return categories;
  }

  /**
   * Filter widgets by user permissions
   */
  filterByPermissions(widgets: any[], user: any) {
    if (!user || !user.permissions) {
      return widgets;
    }

    const userPermissions = new Set(user.permissions);

    // Super admin sees all
    if (userPermissions.has('*:*')) {
      return widgets;
    }

    return widgets.filter((widget) => {
      const requirements = widget.dataRequirements;

      // No permission requirements - visible to all
      if (!requirements?.permissions || requirements.permissions.length === 0) {
        return true;
      }

      // Check if user has all required permissions
      return requirements.permissions.every((permission: string) =>
        userPermissions.has(permission),
      );
    });
  }

  /**
   * Filter widgets by page identifier
   * Returns widgets that are available for a specific page based on menu configuration
   * 
   * @param widgets - Array of widgets to filter
   * @param pageIdentifier - Page identifier to check against menu configuration
   * @returns Filtered array of widgets
   */
  async filterByPageIdentifier(widgets: any[], pageIdentifier: string) {
    // Find menu with matching pageIdentifier
    const menu = await this.prisma.dashboardMenu.findFirst({
      where: {
        pageIdentifier,
        isActive: true,
      },
    });

    // If no menu found or no widget restrictions, return all widgets
    if (!menu || !menu.availableWidgets || menu.availableWidgets.length === 0) {
      return widgets;
    }

    // Filter widgets by availableWidgets list
    const availableWidgetKeys = new Set(menu.availableWidgets);
    return widgets.filter((widget) => availableWidgetKeys.has(widget.key));
  }

  /**
   * Validate JSON schema structure
   */
  private validateConfigSchema(schema: any) {
    if (!schema || typeof schema !== 'object') {
      throw new BadRequestException('configSchema must be a valid object');
    }

    // Basic JSON Schema validation
    if (!schema.type) {
      throw new BadRequestException('configSchema must have a "type" property');
    }

    if (schema.type === 'object' && !schema.properties) {
      throw new BadRequestException(
        'configSchema with type "object" must have "properties"',
      );
    }
  }

  /**
   * Cache helpers
   */
  private getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache() {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }
}
