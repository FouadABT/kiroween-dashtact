import { Injectable, Logger } from '@nestjs/common';
import { WidgetRegistryService } from '../widgets/widget-registry.service';
import { DashboardLayoutsService } from '../dashboard-layouts/dashboard-layouts.service';
import { CapabilitiesResponseDto } from './dto/capabilities-response.dto';

@Injectable()
export class CapabilitiesService {
  private readonly logger = new Logger(CapabilitiesService.name);
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly widgetRegistryService: WidgetRegistryService,
    private readonly dashboardLayoutsService: DashboardLayoutsService,
  ) {}

  /**
   * Get comprehensive system capabilities for AI agent discovery
   */
  async getCapabilities(user: any): Promise<CapabilitiesResponseDto> {
    const cacheKey = `capabilities:${user.id}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      this.logger.debug(`Returning cached capabilities for user ${user.id}`);
      return cached;
    }

    this.logger.log(`Generating capabilities for user ${user.id}`);

    // Get all widgets and filter by user permissions
    const allWidgets = await this.widgetRegistryService.findAll({ isActive: true });
    const widgets = this.widgetRegistryService.filterByPermissions(allWidgets, user);

    // Get widget categories
    const categories = await this.widgetRegistryService.getCategories();

    // Get layout templates
    const templates = await this.dashboardLayoutsService.getTemplates();

    // Build capabilities response
    const capabilities: CapabilitiesResponseDto = {
      system: {
        name: 'Dashboard Customization System',
        version: '1.0.0',
        description:
          'AI-optimized dashboard customization system with widget-based layouts, ' +
          'dynamic navigation, and comprehensive permission management.',
        features: [
          'Widget-based dashboard composition',
          'Drag-and-drop layout editor',
          'Pre-built layout templates',
          'Permission-based widget filtering',
          'Real-time layout updates',
          'Responsive grid system (12-column)',
          'Widget configuration schemas',
          'Natural language widget search',
        ],
        capabilities: [
          'Discover available widgets programmatically',
          'Create custom dashboard layouts',
          'Apply pre-built templates',
          'Search widgets by intent',
          'Validate layout configurations',
          'Filter widgets by user permissions',
          'Clone and customize layouts',
        ],
      },

      user: {
        id: user.id,
        email: user.email,
        role: user.roleName,
        permissions: user.permissions || [],
        hasWidgetAccess: user.permissions?.includes('widgets:read') || user.permissions?.includes('*:*'),
        hasLayoutAccess: user.permissions?.includes('layouts:read') || user.permissions?.includes('*:*'),
        canCreateWidgets: user.permissions?.includes('widgets:write') || user.permissions?.includes('*:*'),
        canCreateLayouts: user.permissions?.includes('layouts:write') || user.permissions?.includes('*:*'),
      },

      widgets: {
        total: widgets.length,
        available: widgets.length,
        categories: categories.map((category) => ({
          name: category,
          count: widgets.filter((w) => w.category === category).length,
          widgets: widgets
            .filter((w) => w.category === category)
            .map((w) => ({
              key: w.key,
              name: w.name,
              description: w.description,
              icon: w.icon,
              useCases: w.useCases,
              tags: w.tags,
            })),
        })),
        byCategory: categories.reduce((acc, category) => {
          acc[category] = widgets.filter((w) => w.category === category).length;
          return acc;
        }, {} as Record<string, number>),
        list: widgets.map((widget) => ({
          key: widget.key,
          name: widget.name,
          description: widget.description,
          category: widget.category,
          icon: widget.icon,
          gridSpan: {
            default: widget.defaultGridSpan,
            min: widget.minGridSpan,
            max: widget.maxGridSpan,
          },
          useCases: widget.useCases,
          tags: widget.tags,
          examples: widget.examples,
          configSchema: widget.configSchema,
          dataRequirements: widget.dataRequirements,
        })),
      },

      layouts: {
        templates: templates.map((template) => ({
          key: template.key,
          name: template.name,
          description: template.description,
          category: template.category,
          useCases: template.useCases,
          widgetCount: template.widgets.length,
          widgets: template.widgets.map((w: any) => w.widgetKey),
          preview: template.preview,
        })),
        gridSystem: {
          columns: 12,
          breakpoints: {
            mobile: { columns: 1, minWidth: 0 },
            tablet: { columns: 2, minWidth: 768 },
            desktop: { columns: 12, minWidth: 1024 },
          },
          constraints: {
            minGridSpan: 1,
            maxGridSpan: 12,
            defaultGridSpan: 6,
          },
        },
      },

      navigation: {
        structure: 'hierarchical',
        maxDepth: 3,
        features: [
          'Permission-based filtering',
          'Dynamic badge support',
          'Nested children',
          'Icon customization',
          'Collapsible groups',
        ],
      },

      api: {
        baseUrl: '/api',
        endpoints: {
          widgets: {
            list: 'GET /widgets/registry',
            get: 'GET /widgets/registry/:key',
            search: 'GET /widgets/registry/search?query=:term',
            categories: 'GET /widgets/registry/categories',
            create: 'POST /widgets/registry (admin)',
            update: 'PATCH /widgets/registry/:key (admin)',
            delete: 'DELETE /widgets/registry/:key (admin)',
          },
          layouts: {
            list: 'GET /dashboard-layouts',
            get: 'GET /dashboard-layouts/:pageId',
            create: 'POST /dashboard-layouts',
            update: 'PATCH /dashboard-layouts/:id',
            delete: 'DELETE /dashboard-layouts/:id',
            clone: 'POST /dashboard-layouts/:id/clone',
            reset: 'POST /dashboard-layouts/reset',
            templates: 'GET /dashboard-layouts/templates/list',
            applyTemplate: 'POST /dashboard-layouts/templates/:key/apply',
            addWidget: 'POST /dashboard-layouts/:id/widgets',
            removeWidget: 'DELETE /dashboard-layouts/:layoutId/widgets/:widgetId',
            reorder: 'PATCH /dashboard-layouts/:id/widgets/reorder',
            validate: 'POST /dashboard-layouts/validate/:id',
          },
          capabilities: {
            get: 'GET /capabilities',
          },
        },
        documentation: '/api/docs',
      },

      featureFlags: {
        widgetCustomization: true,
        layoutTemplates: true,
        dragAndDrop: true,
        naturalLanguageSearch: true,
        layoutValidation: true,
        permissionFiltering: true,
        realTimeUpdates: true,
      },

      metadata: {
        generatedAt: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + this.CACHE_TTL).toISOString(),
        cacheTTL: this.CACHE_TTL / 1000, // in seconds
        version: '1.0.0',
      },

      aiGuidance: {
        quickStart: [
          '1. Call GET /capabilities to understand available widgets and permissions',
          '2. Search widgets by intent: GET /widgets/registry/search?query=show revenue',
          '3. Get widget details: GET /widgets/registry/:key',
          '4. Create layout: POST /dashboard-layouts with pageId and widgets',
          '5. Or apply template: POST /dashboard-layouts/templates/:key/apply',
        ],
        commonPatterns: {
          discoverWidgets: {
            description: 'Find widgets by natural language query',
            endpoint: 'GET /widgets/registry/search?query=:term',
            example: 'GET /widgets/registry/search?query=show revenue over time',
          },
          createLayout: {
            description: 'Create a custom dashboard layout',
            endpoint: 'POST /dashboard-layouts',
            example: {
              pageId: 'overview',
              name: 'My Dashboard',
              scope: 'user',
            },
          },
          addWidget: {
            description: 'Add a widget to an existing layout',
            endpoint: 'POST /dashboard-layouts/:id/widgets',
            example: {
              widgetKey: 'revenue-chart',
              gridSpan: 6,
              config: { chartType: 'line', period: '30d' },
            },
          },
          applyTemplate: {
            description: 'Quickly set up a dashboard from a template',
            endpoint: 'POST /dashboard-layouts/templates/:key/apply',
            example: {
              pageId: 'analytics',
              name: 'Analytics Dashboard',
            },
          },
        },
        bestPractices: [
          'Always check user permissions before creating layouts',
          'Use widget search to find appropriate widgets for user needs',
          'Validate layouts before saving to catch configuration errors',
          'Respect grid constraints (1-12 columns)',
          'Use templates as starting points for common use cases',
          'Filter widgets by category to narrow search results',
          'Check widget dataRequirements for necessary permissions',
        ],
        troubleshooting: {
          widgetNotVisible: 'Check if user has required permissions in widget.dataRequirements',
          layoutInvalid: 'Call POST /dashboard-layouts/validate/:id to see specific errors',
          gridOverflow: 'Ensure widget gridSpan values sum to ≤12 per row',
          templateNotFound: 'List available templates with GET /dashboard-layouts/templates/list',
        },
      },
    };

    this.setCache(cacheKey, capabilities);
    return capabilities;
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
}
