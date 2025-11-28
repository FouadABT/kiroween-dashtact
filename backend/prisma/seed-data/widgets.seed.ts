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
  // Dashboard Widgets - Role-Based Dashboard System
  // ============================================================================
  
  // System Widgets (Super Admin)
  {
    key: 'system-health-card',
    name: 'System Health Card',
    description: 'Displays system health metrics including cron job success rate, email delivery rate, and system uptime. For Super Admin only.',
    component: 'SystemHealthCard',
    category: 'core',
    icon: 'Activity',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Card title', default: 'System Health' },
        refreshInterval: { type: 'number', description: 'Auto-refresh interval in seconds', default: 60 },
      },
    },
    dataRequirements: {
      permissions: ['system:*'],
      endpoints: ['/dashboard/system-health'],
      dependencies: [],
    },
    useCases: ['Monitor system health metrics', 'Track cron job execution', 'Monitor email delivery rates', 'System uptime monitoring'],
    examples: [],
    tags: ['system', 'health', 'monitoring', 'super-admin'],
    isSystemWidget: true,
    isActive: true,
  },
  
  {
    key: 'cron-jobs-status',
    name: 'Cron Jobs Status',
    description: 'Displays recent cron job executions with status, execution time, and duration. Shows success/failure indicators.',
    component: 'CronJobsStatus',
    category: 'core',
    icon: 'Clock',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title', default: 'Cron Jobs Status' },
        limit: { type: 'number', description: 'Number of executions to display', default: 10 },
      },
    },
    dataRequirements: {
      permissions: ['system:*'],
      endpoints: ['/dashboard/system-health'],
      dependencies: [],
    },
    useCases: ['Monitor cron job executions', 'Track scheduled task failures', 'System automation monitoring'],
    examples: [],
    tags: ['system', 'cron', 'automation', 'super-admin'],
    isSystemWidget: true,
    isActive: true,
  },
  
  {
    key: 'email-delivery-stats',
    name: 'Email Delivery Stats',
    description: 'Displays email delivery statistics including sent count, delivered count, failed count, and delivery rate with trend indicators.',
    component: 'EmailDeliveryStats',
    category: 'core',
    icon: 'Mail',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title', default: 'Email Delivery' },
        period: { type: 'string', description: 'Time period', default: '24h' },
      },
    },
    dataRequirements: {
      permissions: ['system:*'],
      endpoints: ['/dashboard/system-health'],
      dependencies: [],
    },
    useCases: ['Monitor email delivery rates', 'Track email failures', 'Email system health monitoring'],
    examples: [],
    tags: ['system', 'email', 'delivery', 'super-admin'],
    isSystemWidget: true,
    isActive: true,
  },
  
  {
    key: 'security-alerts',
    name: 'Security Alerts',
    description: 'Displays security alerts including failed login attempts, suspicious activity, and security events with severity indicators.',
    component: 'SecurityAlerts',
    category: 'core',
    icon: 'Shield',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title', default: 'Security Alerts' },
        limit: { type: 'number', description: 'Number of alerts to display', default: 5 },
      },
    },
    dataRequirements: {
      permissions: ['system:*'],
      endpoints: ['/dashboard/alerts'],
      dependencies: [],
    },
    useCases: ['Monitor security events', 'Track failed login attempts', 'Security threat detection'],
    examples: [],
    tags: ['system', 'security', 'alerts', 'super-admin'],
    isSystemWidget: true,
    isActive: true,
  },
  
  // Business Widgets (Admin, Manager)
  {
    key: 'revenue-card',
    name: 'Revenue Card',
    description: 'Displays revenue today with formatted currency, percentage change from yesterday with trend arrow, and revenue this month as secondary metric.',
    component: 'RevenueCard',
    category: 'ecommerce',
    icon: 'DollarSign',
    defaultGridSpan: 3,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Card title', default: 'Revenue' },
        showTrend: { type: 'boolean', description: 'Show trend indicator', default: true },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: ['Track daily revenue', 'Monitor revenue trends', 'Financial dashboard overview'],
    examples: [],
    tags: ['business', 'revenue', 'financial', 'metrics'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'orders-card',
    name: 'Orders Card',
    description: 'Displays total orders count and orders grouped by status with color-coded badges (pending: yellow, processing: blue, completed: green, cancelled: red).',
    component: 'OrdersCard',
    category: 'ecommerce',
    icon: 'ShoppingCart',
    defaultGridSpan: 3,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Card title', default: 'Orders' },
        showBreakdown: { type: 'boolean', description: 'Show status breakdown', default: true },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: ['Monitor order volume', 'Track order status distribution', 'Operations dashboard'],
    examples: [],
    tags: ['business', 'orders', 'ecommerce', 'metrics'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'customers-card',
    name: 'Customers Card',
    description: 'Displays new customers today with count, trend compared to yesterday, and total customers as secondary metric.',
    component: 'CustomersCard',
    category: 'ecommerce',
    icon: 'Users',
    defaultGridSpan: 3,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Card title', default: 'Customers' },
        showTrend: { type: 'boolean', description: 'Show trend indicator', default: true },
      },
    },
    dataRequirements: {
      permissions: ['customers:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: ['Track customer growth', 'Monitor new registrations', 'CRM dashboard'],
    examples: [],
    tags: ['business', 'customers', 'crm', 'metrics'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'inventory-alerts-card',
    name: 'Inventory Alerts Card',
    description: 'Displays low stock products count with alert badge and out of stock products count. Uses warning colors for low stock.',
    component: 'InventoryAlertsCard',
    category: 'ecommerce',
    icon: 'AlertTriangle',
    defaultGridSpan: 3,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Card title', default: 'Inventory Alerts' },
        linkToInventory: { type: 'boolean', description: 'Show link to inventory page', default: true },
      },
    },
    dataRequirements: {
      permissions: ['inventory:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: ['Monitor inventory levels', 'Prevent stockouts', 'Inventory management alerts'],
    examples: [],
    tags: ['business', 'inventory', 'alerts', 'warehouse'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // Chart Widgets (Analytics)
  {
    key: 'revenue-chart',
    name: 'Revenue Chart',
    description: 'Line chart displaying revenue over time for the last 30 days. Includes tooltip with date and revenue amount. Responsive height.',
    component: 'RevenueChart',
    category: 'analytics',
    icon: 'LineChart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Chart title', default: 'Revenue Trend' },
        period: { type: 'string', description: 'Time period', default: '30d' },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/revenue'],
      dependencies: ['recharts'],
    },
    useCases: ['Visualize revenue trends', 'Track revenue performance', 'Financial analytics'],
    examples: [],
    tags: ['chart', 'revenue', 'analytics', 'visualization'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'sales-by-category-chart',
    name: 'Sales by Category Chart',
    description: 'Pie chart displaying sales distribution by product category. Shows category name and percentage in legend with distinct colors.',
    component: 'SalesByCategoryChart',
    category: 'analytics',
    icon: 'PieChart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Chart title', default: 'Sales by Category' },
        period: { type: 'string', description: 'Time period', default: '30d' },
      },
    },
    dataRequirements: {
      permissions: ['orders:read', 'products:read'],
      endpoints: ['/dashboard/sales'],
      dependencies: ['recharts'],
    },
    useCases: ['Analyze sales distribution', 'Category performance analysis', 'Product mix insights'],
    examples: [],
    tags: ['chart', 'sales', 'category', 'analytics'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'top-products-chart',
    name: 'Top Products Chart',
    description: 'Horizontal bar chart displaying top 10 selling products. Shows product name on y-axis, quantity sold on x-axis with tooltips.',
    component: 'TopProductsChart',
    category: 'analytics',
    icon: 'TrendingUp',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Chart title', default: 'Top Selling Products' },
        limit: { type: 'number', description: 'Number of products to display', default: 10 },
      },
    },
    dataRequirements: {
      permissions: ['products:read', 'orders:read'],
      endpoints: ['/dashboard/sales'],
      dependencies: ['recharts'],
    },
    useCases: ['Identify best sellers', 'Product performance analysis', 'Inventory planning'],
    examples: [],
    tags: ['chart', 'products', 'sales', 'analytics'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // Table Widgets (Data Display)
  {
    key: 'recent-orders-table',
    name: 'Recent Orders Table',
    description: 'Table displaying last 10 orders with columns: Order ID, Customer, Status, Total, Date. Color-coded status badges with horizontal scroll on mobile.',
    component: 'RecentOrdersTable',
    category: 'data-display',
    icon: 'Table',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Table title', default: 'Recent Orders' },
        limit: { type: 'number', description: 'Number of orders to display', default: 10 },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/recent-activity'],
      dependencies: [],
    },
    useCases: ['Monitor recent orders', 'Quick access to order details', 'Order management dashboard'],
    examples: [],
    tags: ['table', 'orders', 'recent', 'data'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'low-stock-table',
    name: 'Low Stock Table',
    description: 'Table displaying products below reorder threshold with columns: Product, SKU, Current Stock, Reorder Threshold, Price. Highlights out of stock items.',
    component: 'LowStockTable',
    category: 'data-display',
    icon: 'AlertCircle',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Table title', default: 'Low Stock Products' },
      },
    },
    dataRequirements: {
      permissions: ['inventory:read'],
      endpoints: ['/dashboard/inventory'],
      dependencies: [],
    },
    useCases: ['Monitor low stock items', 'Inventory reordering', 'Warehouse management'],
    examples: [],
    tags: ['table', 'inventory', 'stock', 'alerts'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'recent-customers-table',
    name: 'Recent Customers Table',
    description: 'Table displaying last 10 customers with columns: Name, Email, Phone, Registration Date. Formatted dates with links to customer profiles.',
    component: 'RecentCustomersTable',
    category: 'data-display',
    icon: 'Users',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Table title', default: 'Recent Customers' },
        limit: { type: 'number', description: 'Number of customers to display', default: 10 },
      },
    },
    dataRequirements: {
      permissions: ['customers:read'],
      endpoints: ['/dashboard/recent-activity'],
      dependencies: [],
    },
    useCases: ['Monitor new customers', 'Customer acquisition tracking', 'CRM dashboard'],
    examples: [],
    tags: ['table', 'customers', 'recent', 'crm'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'recent-posts-table',
    name: 'Recent Posts Table',
    description: 'Table displaying last 10 blog posts with columns: Title, Author, Status, Published Date. Color-coded status badges with links to post editor.',
    component: 'RecentPostsTable',
    category: 'data-display',
    icon: 'FileText',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Table title', default: 'Recent Blog Posts' },
        limit: { type: 'number', description: 'Number of posts to display', default: 10 },
      },
    },
    dataRequirements: {
      permissions: ['blog:read'],
      endpoints: ['/dashboard/content'],
      dependencies: [],
    },
    useCases: ['Monitor blog activity', 'Content management', 'Editorial dashboard'],
    examples: [],
    tags: ['table', 'blog', 'content', 'recent'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // Personal Widgets (User Role)
  {
    key: 'personal-stats-card',
    name: 'Personal Stats Card',
    description: 'Displays unread notifications count, unread messages count, and file uploads count in a 3-column grid with icons and hover effects.',
    component: 'PersonalStatsCard',
    category: 'core',
    icon: 'User',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Card title', default: 'My Stats' },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: ['Personal dashboard overview', 'User activity summary', 'Quick stats at a glance'],
    examples: [],
    tags: ['personal', 'user', 'stats', 'notifications'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'notifications-feed',
    name: 'Notifications Feed',
    description: 'Displays list of recent notifications (last 10) with title, message, and relative timestamp. Highlights unread notifications with bold text.',
    component: 'NotificationsFeed',
    category: 'data-display',
    icon: 'Bell',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title', default: 'Recent Notifications' },
        limit: { type: 'number', description: 'Number of notifications to display', default: 10 },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/dashboard/recent-activity'],
      dependencies: [],
    },
    useCases: ['View recent notifications', 'Stay updated on activity', 'Personal dashboard'],
    examples: [],
    tags: ['personal', 'notifications', 'feed', 'activity'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'messages-feed',
    name: 'Messages Feed',
    description: 'Displays list of recent messages (last 10) with sender name, message preview, and relative timestamp. Highlights unread messages with bold text.',
    component: 'MessagesFeed',
    category: 'data-display',
    icon: 'MessageSquare',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title', default: 'Recent Messages' },
        limit: { type: 'number', description: 'Number of messages to display', default: 10 },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/dashboard/recent-activity'],
      dependencies: [],
    },
    useCases: ['View recent messages', 'Quick message access', 'Communication dashboard'],
    examples: [],
    tags: ['personal', 'messages', 'feed', 'communication'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'profile-summary-card',
    name: 'Profile Summary Card',
    description: 'Displays user avatar, name, email, profile completion percentage with progress bar, and user role badge. Links to profile edit page.',
    component: 'ProfileSummaryCard',
    category: 'core',
    icon: 'UserCircle',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Card title', default: 'My Profile' },
        showCompletion: { type: 'boolean', description: 'Show profile completion', default: true },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/profile'],
      dependencies: [],
    },
    useCases: ['Profile overview', 'Quick profile access', 'Profile completion tracking'],
    examples: [],
    tags: ['personal', 'profile', 'user', 'account'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // Action Widgets (Quick Actions & Alerts)
  {
    key: 'quick-actions-grid',
    name: 'Quick Actions Grid',
    description: 'Grid of role-specific action buttons. Responsive layout (2 columns mobile, 3 tablet, 4 desktop) with icons and labels for common tasks.',
    component: 'QuickActionsGrid',
    category: 'interactive',
    icon: 'Zap',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title', default: 'Quick Actions' },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: [],
      dependencies: [],
    },
    useCases: ['Quick access to common tasks', 'Role-specific actions', 'Productivity shortcuts'],
    examples: [],
    tags: ['action', 'shortcuts', 'productivity', 'navigation'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'alerts-panel',
    name: 'Alerts Panel',
    description: 'Displays list of alerts with severity-based color-coded icons (info: blue, warning: yellow, error: red, critical: red). Dismissible alerts with action buttons.',
    component: 'AlertsPanel',
    category: 'interactive',
    icon: 'AlertCircle',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Widget title', default: 'Alerts' },
        showDismissed: { type: 'boolean', description: 'Show dismissed alerts', default: false },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/dashboard/alerts'],
      dependencies: [],
    },
    useCases: ['Display important alerts', 'Action required notifications', 'System warnings'],
    examples: [],
    tags: ['action', 'alerts', 'notifications', 'warnings'],
    isSystemWidget: false,
    isActive: true,
  },
  
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

  // ============================================================================
  // Calendar Widgets
  // ============================================================================

  {
    key: 'mini-calendar',
    name: 'Mini Calendar',
    description: 'Compact month view calendar with event indicators (dots). Highlights current date and shows busy days with visual distinction. Click dates to navigate to full calendar.',
    component: 'MiniCalendarWidget',
    category: 'calendar',
    icon: 'Calendar',
    defaultGridSpan: 4,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Calendar',
        },
      },
    },
    dataRequirements: {
      permissions: ['calendar:read'],
      endpoints: ['/calendar/events'],
      dependencies: [],
    },
    useCases: [
      'Quick calendar overview',
      'View events at a glance',
      'Navigate to specific dates',
      'Dashboard calendar widget',
    ],
    examples: [],
    tags: ['calendar', 'events', 'schedule', 'date-picker'],
    isSystemWidget: false,
    isActive: true,
  },

  {
    key: 'upcoming-events',
    name: 'Upcoming Events',
    description: 'Displays next 5-10 events in chronological order with event title, time, category color, and location. Supports filtering by user (show only my events). Includes "View All" link to full calendar.',
    component: 'UpcomingEventsWidget',
    category: 'calendar',
    icon: 'CalendarDays',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Upcoming Events',
        },
        limit: {
          type: 'number',
          description: 'Number of events to display',
          default: 10,
        },
        showOnlyMyEvents: {
          type: 'boolean',
          description: 'Filter to show only user events',
          default: false,
        },
      },
    },
    dataRequirements: {
      permissions: ['calendar:read'],
      endpoints: ['/calendar/events'],
      dependencies: ['date-fns'],
    },
    useCases: [
      'View upcoming schedule',
      'Track next events',
      'Event reminders',
      'Dashboard event list',
    ],
    examples: [],
    tags: ['calendar', 'events', 'upcoming', 'schedule', 'timeline'],
    isSystemWidget: false,
    isActive: true,
  },

  {
    key: 'team-schedule',
    name: 'Team Schedule',
    description: 'Displays horizontal timeline with multiple user rows showing events for selected team members. Supports selecting users to display and time range selector (today, this week). Responsive: desktop shows table, mobile stacks users vertically.',
    component: 'TeamScheduleWidget',
    category: 'calendar',
    icon: 'Users',
    defaultGridSpan: 12,
    minGridSpan: 6,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Team Schedule',
        },
        defaultUserIds: {
          type: 'array',
          description: 'Default user IDs to display',
          default: [],
        },
        maxUsers: {
          type: 'number',
          description: 'Maximum users to display',
          default: 5,
        },
      },
    },
    dataRequirements: {
      permissions: ['calendar:read', 'users:read'],
      endpoints: ['/calendar/events', '/users'],
      dependencies: ['date-fns'],
    },
    useCases: [
      'View team availability',
      'Schedule team meetings',
      'Coordinate team activities',
      'Resource planning',
    ],
    examples: [],
    tags: ['calendar', 'team', 'schedule', 'collaboration', 'timeline', 'multi-user'],
    isSystemWidget: false,
    isActive: true,
  },
];
