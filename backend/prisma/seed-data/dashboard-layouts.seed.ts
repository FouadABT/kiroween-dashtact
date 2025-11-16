/**
 * Dashboard Layouts Seed Data
 * 
 * Creates default dashboard layouts for common pages.
 * These layouts serve as starting points for users.
 */

import { PrismaClient } from '@prisma/client';
import {
  ANALYTICS_DASHBOARD_TEMPLATE,
  MANAGEMENT_OVERVIEW_TEMPLATE,
  MONITORING_CONSOLE_TEMPLATE,
} from '../../src/dashboard-layouts/templates/template-registry';

const prisma = new PrismaClient();

/**
 * Default layout configurations for specific pages
 */
export const DEFAULT_LAYOUTS = [
  {
    pageId: 'main-dashboard',
    template: MANAGEMENT_OVERVIEW_TEMPLATE,
    name: 'Default Overview Layout',
    description: 'Default layout for the dashboard overview page',
  },
  {
    pageId: 'analytics-dashboard',
    template: ANALYTICS_DASHBOARD_TEMPLATE,
    name: 'Default Analytics Layout',
    description: 'Default layout for the analytics dashboard page',
  },
  {
    pageId: 'ecommerce-dashboard',
    template: ANALYTICS_DASHBOARD_TEMPLATE,
    name: 'Default E-commerce Layout',
    description: 'Default layout for the e-commerce dashboard page',
  },
];

/**
 * Demo layouts showcasing different use cases and widget combinations
 */
export const DEMO_LAYOUTS = [
  {
    pageId: 'demo-content-management',
    template: {
      id: 'content-management-demo',
      name: 'Content Management Demo',
      description: 'Showcase layout for content management workflows',
      category: 'demo',
      widgets: [
        {
          widgetKey: 'stats-grid',
          position: 0,
          gridSpan: 12,
          config: {
            stats: [
              { title: 'Total Pages', value: 156, icon: 'FileText' },
              { title: 'Published', value: 142, icon: 'CheckCircle' },
              { title: 'Drafts', value: 14, icon: 'Edit' },
              { title: 'Views Today', value: 2847, icon: 'Eye' },
            ],
            columns: 4,
          },
        },
        {
          widgetKey: 'activity-feed',
          position: 1,
          gridSpan: 6,
          config: {
            title: 'Recent Activity',
            activities: [],
            maxItems: 8,
            groupByDate: true,
          },
        },
        {
          widgetKey: 'chart-widget',
          position: 2,
          gridSpan: 6,
          config: {
            type: 'line',
            title: 'Page Views Trend',
            data: [],
            config: {
              xAxisKey: 'date',
              dataKeys: ['views'],
              showLegend: true,
            },
          },
        },
        {
          widgetKey: 'data-table',
          position: 3,
          gridSpan: 12,
          config: {
            title: 'Recent Pages',
            data: [],
            searchable: true,
            pagination: true,
          },
        },
      ],
    },
    name: 'Content Management Demo',
    description: 'Comprehensive layout showcasing content management widgets',
  },
  {
    pageId: 'demo-analytics-advanced',
    template: {
      id: 'analytics-advanced-demo',
      name: 'Advanced Analytics Demo',
      description: 'Advanced analytics layout with multiple chart types',
      category: 'demo',
      widgets: [
        {
          widgetKey: 'stats-card',
          position: 0,
          gridSpan: 3,
          config: {
            title: 'Total Revenue',
            value: '$125,430',
            icon: 'DollarSign',
            trend: { value: 12.5, direction: 'up', period: 'vs last month' },
            color: 'primary',
          },
        },
        {
          widgetKey: 'stats-card',
          position: 1,
          gridSpan: 3,
          config: {
            title: 'Active Users',
            value: '8,234',
            icon: 'Users',
            trend: { value: 8.2, direction: 'up', period: 'vs last month' },
            color: 'secondary',
          },
        },
        {
          widgetKey: 'stats-card',
          position: 2,
          gridSpan: 3,
          config: {
            title: 'Conversion Rate',
            value: '3.24%',
            icon: 'TrendingUp',
            trend: { value: 0.5, direction: 'up', period: 'vs last month' },
            color: 'success',
          },
        },
        {
          widgetKey: 'stats-card',
          position: 3,
          gridSpan: 3,
          config: {
            title: 'Bounce Rate',
            value: '42.3%',
            icon: 'TrendingDown',
            trend: { value: 2.1, direction: 'down', period: 'vs last month' },
            color: 'destructive',
          },
        },
        {
          widgetKey: 'chart-widget',
          position: 4,
          gridSpan: 8,
          config: {
            type: 'line',
            title: 'Revenue & Users Trend',
            data: [],
            config: {
              xAxisKey: 'month',
              dataKeys: ['revenue', 'users'],
              showLegend: true,
            },
          },
        },
        {
          widgetKey: 'chart-widget',
          position: 5,
          gridSpan: 4,
          config: {
            type: 'pie',
            title: 'Traffic Sources',
            data: [],
            config: {
              dataKeys: ['value'],
              showLegend: true,
            },
          },
        },
        {
          widgetKey: 'chart-widget',
          position: 6,
          gridSpan: 6,
          config: {
            type: 'bar',
            title: 'Sales by Category',
            data: [],
            config: {
              xAxisKey: 'category',
              dataKeys: ['sales'],
              showLegend: false,
            },
          },
        },
        {
          widgetKey: 'chart-widget',
          position: 7,
          gridSpan: 6,
          config: {
            type: 'area',
            title: 'User Growth',
            data: [],
            config: {
              xAxisKey: 'month',
              dataKeys: ['users'],
              showLegend: false,
            },
          },
        },
      ],
    },
    name: 'Advanced Analytics Demo',
    description: 'Comprehensive analytics layout with multiple visualization types',
  },
  {
    pageId: 'demo-monitoring',
    template: MONITORING_CONSOLE_TEMPLATE,
    name: 'System Monitoring Demo',
    description: 'Real-time monitoring dashboard with system metrics',
  },
];

/**
 * Helper function to create a layout from configuration
 */
async function createLayoutFromConfig(layoutConfig: any, isDemo = false) {
  // Check if layout already exists
  const existing = await prisma.dashboardLayout.findFirst({
    where: {
      pageId: layoutConfig.pageId,
      userId: null,
      scope: 'global',
    },
  });

  if (existing) {
    console.log(`⏭️  Layout already exists for page: ${layoutConfig.pageId}`);
    return;
  }

  // Create the layout
  const layout = await prisma.dashboardLayout.create({
    data: {
      pageId: layoutConfig.pageId,
      userId: null,
      scope: 'global',
      name: layoutConfig.name,
      description: layoutConfig.description,
      isActive: true,
      isDefault: !isDemo,
    },
  });

  console.log(`✅ Created ${isDemo ? 'demo ' : ''}layout for page: ${layoutConfig.pageId}`);

  // Add widgets from template
  for (const widgetConfig of layoutConfig.template.widgets) {
    // Check if widget definition exists
    const widgetDefinition = await prisma.widgetDefinition.findUnique({
      where: { key: widgetConfig.widgetKey },
    });

    if (!widgetDefinition) {
      console.log(`⚠️  Widget definition not found: ${widgetConfig.widgetKey}, skipping...`);
      continue;
    }

    await prisma.widgetInstance.create({
      data: {
        layoutId: layout.id,
        widgetKey: widgetConfig.widgetKey,
        position: widgetConfig.position,
        gridSpan: widgetConfig.gridSpan,
        gridRow: widgetConfig.gridRow,
        config: widgetConfig.config || {},
        isVisible: widgetConfig.isVisible ?? true,
      },
    });

    console.log(`  ✅ Added widget: ${widgetConfig.widgetKey}`);
  }
}

/**
 * Seed default dashboard layouts
 */
export async function seedDashboardLayouts() {
  console.log('Creating default dashboard layouts...');

  for (const layoutConfig of DEFAULT_LAYOUTS) {
    await createLayoutFromConfig(layoutConfig, false);
  }

  console.log('✅ Default dashboard layouts seeding complete');
}

/**
 * Seed demo dashboard layouts
 */
export async function seedDemoLayouts() {
  console.log('Creating demo dashboard layouts...');

  for (const layoutConfig of DEMO_LAYOUTS) {
    await createLayoutFromConfig(layoutConfig, true);
  }

  console.log('✅ Demo dashboard layouts seeding complete');
}

/**
 * Clean up dashboard layouts (for testing)
 */
export async function cleanupDashboardLayouts() {
  console.log('Cleaning up dashboard layouts...');
  
  await prisma.widgetInstance.deleteMany({});
  await prisma.dashboardLayout.deleteMany({});
  
  console.log('✅ Dashboard layouts cleanup complete');
}
