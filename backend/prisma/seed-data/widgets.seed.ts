/**
 * Widget Definitions Seed Data
 * 
 * This file defines the widgets available in the dashboard customization system.
 * Only include widgets that are actually implemented and useful for your application.
 * 
 * To add a new widget:
 * 1. Create the widget component in frontend/src/components/widgets/
 * 2. Register it in frontend/src/lib/widget-registry.ts
 * 3. Add its definition here
 * 4. Run: npm run prisma:seed
 * 
 * @see WIDGET_SYSTEM_GUIDE.md for complete documentation
 */

export const widgetDefinitions = [
  // ============================================================================
  // Demo Widgets - Examples for reference
  // ============================================================================
  
  {
    key: 'stats-card',
    name: 'Stats Card',
    description: 'Displays a single metric with optional icon, trend indicator, and color. Perfect for showing KPIs and key metrics.',
    component: 'StatsCard',
    category: 'core',
    icon: 'LayoutDashboard',
    defaultGridSpan: 3,
    minGridSpan: 2,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Card title',
        },
        value: {
          type: 'number',
          description: 'Metric value to display',
        },
        icon: {
          type: 'string',
          description: 'Lucide icon name',
        },
        trend: {
          type: 'object',
          description: 'Trend indicator data',
        },
        color: {
          type: 'string',
          description: 'Color scheme',
        },
      },
      required: ['title', 'value'],
    },
    dataRequirements: {
      permissions: ['analytics:read'],
      endpoints: [],
      dependencies: [],
    },
    useCases: [
      'Display KPIs on dashboard',
      'Show revenue metrics',
      'Track user growth',
      'Monitor conversion rates',
    ],
    examples: [
      {
        title: 'Basic usage',
        code: '```tsx\n<StatsCard title="Total Users" value={1234} />\n```',
      },
      {
        title: 'With icon and trend',
        code: '```tsx\n<StatsCard\n  title="Revenue"\n  value="$45,678"\n  icon={DollarSign}\n  trend={{ value: 12, direction: \'up\' }}\n/>\n```',
      },
    ],
    tags: ['core', 'stats', 'metrics', 'kpi'],
    isSystemWidget: true,
    isActive: true,
  },
  
  {
    key: 'activity-feed',
    name: 'ActivityFeed',
    description: 'Displays a timeline of activity items with user avatars and timestamps. Supports date grouping and pagination.',
    component: 'ActivityFeed',
    category: 'core',
    icon: 'LayoutDashboard',
    defaultGridSpan: 6,
    minGridSpan: 3,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        activities: {
          type: 'array',
          description: 'Array of activity items',
        },
        title: {
          type: 'string',
          description: 'Widget title',
        },
        description: {
          type: 'string',
          description: 'Widget description',
        },
        groupByDate: {
          type: 'boolean',
          description: 'Group activities by date',
        },
        maxItems: {
          type: 'number',
          description: 'Maximum number of items to show',
        },
        showMoreButton: {
          type: 'boolean',
          description: 'Show "show more" button',
        },
      },
      required: ['activities'],
    },
    dataRequirements: {
      permissions: [],
      endpoints: [],
      dependencies: [],
    },
    useCases: [
      'Show recent user actions',
      'Display system events',
      'Track audit logs',
      'Monitor user activity',
    ],
    examples: [
      {
        title: 'Basic usage',
        code: '```tsx\n<ActivityFeed\n  activities={[\n    {\n      id: \'1\',\n      type: \'user_created\',\n      title: \'New user registered\',\n      timestamp: new Date(),\n    },\n  ]}\n/>\n```',
      },
      {
        title: 'With date grouping',
        code: '```tsx\n<ActivityFeed\n  title="Recent Activity"\n  activities={activities}\n  groupByDate={true}\n  maxItems={5}\n/>\n```',
      },
    ],
    tags: ['core', 'activity', 'timeline', 'feed'],
    isSystemWidget: true,
    isActive: true,
  },
  
  // ============================================================================
  // Add Your Custom Widgets Below
  // ============================================================================
  
  // E-commerce Recent Customers Widget
  {
    key: 'recent-customers',
    name: 'RecentCustomers',
    description: 'Displays recently registered customers with their contact information and join date',
    component: 'RecentCustomers',
    category: 'ecommerce',
    icon: 'Users',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Recent Customers',
        },
        limit: {
          type: 'number',
          description: 'Number of customers to display',
          default: 5,
        },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['customers:read'],
      endpoints: ['/customers'],
      dependencies: [],
    },
    useCases: [
      'Monitor new customer registrations',
      'Quick access to customer profiles',
      'Track customer growth',
    ],
    examples: [
      {
        title: 'Basic usage',
        code: '```tsx\n<RecentCustomers limit={5} />\n```',
      },
      {
        title: 'Custom title',
        code: '```tsx\n<RecentCustomers title="New Customers" limit={10} />\n```',
      },
    ],
    tags: ['ecommerce', 'customers', 'crm'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // Example: E-commerce Recent Orders Widget
  // {
  //   key: 'recent-orders',
  //   name: 'RecentOrders',
  //   description: 'Displays recent orders from the e-commerce system with status and customer information',
  //   component: 'RecentOrders',
  //   category: 'ecommerce',
  //   icon: 'ShoppingCart',
  //   defaultGridSpan: 6,
  //   minGridSpan: 4,
  //   maxGridSpan: 12,
  //   configSchema: {
  //     type: 'object',
  //     properties: {
  //       limit: {
  //         type: 'number',
  //         description: 'Number of orders to display',
  //         default: 5,
  //       },
  //       showStatus: {
  //         type: 'boolean',
  //         description: 'Show order status',
  //         default: true,
  //       },
  //     },
  //   },
  //   dataRequirements: {
  //     permissions: ['orders:read'],
  //     endpoints: ['/api/orders'],
  //     dependencies: [],
  //   },
  //   useCases: [
  //     'Monitor recent customer orders',
  //     'Quick access to order details',
  //     'Track order status at a glance',
  //   ],
  //   examples: [
  //     {
  //       title: 'Basic usage',
  //       code: '```tsx\n<RecentOrders limit={5} />\n```',
  //     },
  //   ],
  //   tags: ['ecommerce', 'orders', 'sales'],
  //   isSystemWidget: false,
  //   isActive: true,
  // },

  // ============================================================================
  // E-commerce Widgets
  // ============================================================================
  
  {
    key: 'recent-orders',
    name: 'Recent Orders',
    description: 'Displays the most recent orders with status, customer information, and total amount. Provides quick access to order details.',
    component: 'RecentOrders',
    category: 'ecommerce',
    icon: 'ShoppingCart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title' },
        limit: { type: 'number', description: 'Number of orders to display' },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/orders'],
      dependencies: [],
    },
    useCases: [
      'Monitor recent order activity',
      'Quick access to new orders',
      'Track order status at a glance',
      'E-commerce dashboard overview',
    ],
    examples: [],
    tags: ['ecommerce', 'orders', 'sales', 'recent'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'low-stock-products',
    name: 'Low Stock Alert',
    description: 'Alerts for products running low on inventory. Shows stock levels with visual indicators and quick access to inventory management.',
    component: 'LowStockProducts',
    category: 'ecommerce',
    icon: 'AlertTriangle',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title' },
        limit: { type: 'number', description: 'Number of items to display' },
        threshold: { type: 'number', description: 'Low stock threshold' },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['inventory:read'],
      endpoints: ['/inventory'],
      dependencies: [],
    },
    useCases: [
      'Monitor inventory levels',
      'Prevent stockouts',
      'Inventory management alerts',
      'Warehouse dashboard',
    ],
    examples: [],
    tags: ['ecommerce', 'inventory', 'stock', 'alert', 'warehouse'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'revenue-stats',
    name: 'Revenue Overview',
    description: 'Displays revenue metrics with trend indicators, order count, and average order value. Shows performance over selected time period.',
    component: 'RevenueStats',
    category: 'ecommerce',
    icon: 'DollarSign',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title' },
        period: { type: 'string', description: 'Time period' },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/orders'],
      dependencies: [],
    },
    useCases: [
      'Track revenue performance',
      'Monitor sales trends',
      'Financial dashboard',
      'Executive overview',
    ],
    examples: [],
    tags: ['ecommerce', 'revenue', 'sales', 'analytics', 'financial'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'top-products',
    name: 'Top Selling Products',
    description: 'Shows best-selling products ranked by sales volume and revenue. Includes product images, sales count, and revenue data.',
    component: 'TopProducts',
    category: 'ecommerce',
    icon: 'TrendingUp',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title' },
        limit: { type: 'number', description: 'Number of products to display' },
        period: { type: 'string', description: 'Time period' },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['products:read'],
      endpoints: ['/products'],
      dependencies: [],
    },
    useCases: [
      'Identify best sellers',
      'Product performance analysis',
      'Inventory planning',
      'Marketing insights',
    ],
    examples: [],
    tags: ['ecommerce', 'products', 'sales', 'analytics', 'trending'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'order-status-chart',
    name: 'Order Status Distribution',
    description: 'Visual breakdown of orders by status (pending, processing, shipped, delivered, etc.). Shows percentage distribution with progress bars.',
    component: 'OrderStatusChart',
    category: 'ecommerce',
    icon: 'PieChart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title' },
        period: { type: 'string', description: 'Time period' },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/orders'],
      dependencies: [],
    },
    useCases: [
      'Monitor order fulfillment',
      'Track order pipeline',
      'Operations dashboard',
      'Fulfillment center overview',
    ],
    examples: [],
    tags: ['ecommerce', 'orders', 'status', 'analytics', 'chart'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'recent-customers',
    name: 'Recent Customers',
    description: 'Displays recently registered customers with contact information and registration date. Quick access to customer profiles.',
    component: 'RecentCustomers',
    category: 'ecommerce',
    icon: 'Users',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title' },
        limit: { type: 'number', description: 'Number of customers to display' },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['customers:read'],
      endpoints: ['/customers'],
      dependencies: [],
    },
    useCases: [
      'Monitor new customer signups',
      'Customer acquisition tracking',
      'CRM dashboard',
      'Marketing overview',
    ],
    examples: [],
    tags: ['ecommerce', 'customers', 'crm', 'recent', 'users'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'quick-stats',
    name: 'Quick Stats',
    description: 'Compact overview of key ecommerce metrics: revenue, orders, products, and customers. Perfect for dashboard at-a-glance view.',
    component: 'QuickStats',
    category: 'ecommerce',
    icon: 'LayoutGrid',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title' },
        period: { type: 'string', description: 'Time period' },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['orders:read', 'products:read', 'customers:read'],
      endpoints: ['/orders', '/products', '/customers'],
      dependencies: [],
    },
    useCases: [
      'Dashboard overview',
      'Executive summary',
      'Quick performance check',
      'KPI monitoring',
    ],
    examples: [],
    tags: ['ecommerce', 'stats', 'overview', 'kpi', 'metrics'],
    isSystemWidget: false,
    isActive: true,
  },
];
