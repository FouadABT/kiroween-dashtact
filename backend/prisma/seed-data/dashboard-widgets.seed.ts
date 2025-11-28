/**
 * Dashboard Widgets Seed Data
 * 
 * Defines widget definitions for the role-based dashboard system.
 * These widgets are specifically designed for displaying dashboard metrics,
 * analytics, and quick actions based on user roles.
 * 
 * Widget Categories:
 * - system: System health and monitoring widgets (Super Admin)
 * - business: Business metrics and analytics widgets (Admin, Manager)
 * - chart: Data visualization widgets (All roles)
 * - table: Data table widgets (All roles)
 * - personal: Personal user data widgets (User)
 * - action: Quick action and alert widgets (All roles)
 */

export const dashboardWidgetDefinitions = [
  // ============================================================================
  // System Widgets (Super Admin)
  // ============================================================================
  
  {
    key: 'system-health-card',
    name: 'System Health Card',
    description: 'Displays system health metrics including cron job success rate, email delivery rate, and system uptime. For Super Admin only.',
    component: 'SystemHealthCard',
    category: 'system',
    icon: 'Activity',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Card title',
          default: 'System Health',
        },
        refreshInterval: {
          type: 'number',
          description: 'Auto-refresh interval in seconds',
          default: 60,
        },
      },
    },
    dataRequirements: {
      permissions: ['system:*'],
      endpoints: ['/dashboard/system-health'],
      dependencies: [],
    },
    useCases: [
      'Monitor system health metrics',
      'Track cron job execution',
      'Monitor email delivery rates',
      'System uptime monitoring',
    ],
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
    category: 'system',
    icon: 'Clock',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Cron Jobs Status',
        },
        limit: {
          type: 'number',
          description: 'Number of executions to display',
          default: 10,
        },
      },
    },
    dataRequirements: {
      permissions: ['system:*'],
      endpoints: ['/dashboard/system-health'],
      dependencies: [],
    },
    useCases: [
      'Monitor cron job executions',
      'Track scheduled task failures',
      'System automation monitoring',
    ],
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
    category: 'system',
    icon: 'Mail',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Email Delivery',
        },
        period: {
          type: 'string',
          description: 'Time period',
          default: '24h',
        },
      },
    },
    dataRequirements: {
      permissions: ['system:*'],
      endpoints: ['/dashboard/system-health'],
      dependencies: [],
    },
    useCases: [
      'Monitor email delivery rates',
      'Track email failures',
      'Email system health monitoring',
    ],
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
    category: 'system',
    icon: 'Shield',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Security Alerts',
        },
        limit: {
          type: 'number',
          description: 'Number of alerts to display',
          default: 5,
        },
      },
    },
    dataRequirements: {
      permissions: ['system:*'],
      endpoints: ['/dashboard/alerts'],
      dependencies: [],
    },
    useCases: [
      'Monitor security events',
      'Track failed login attempts',
      'Security threat detection',
    ],
    examples: [],
    tags: ['system', 'security', 'alerts', 'super-admin'],
    isSystemWidget: true,
    isActive: true,
  },
  
  // ============================================================================
  // Business Widgets (Admin, Manager)
  // ============================================================================
  
  {
    key: 'revenue-card',
    name: 'Revenue Card',
    description: 'Displays revenue today with formatted currency, percentage change from yesterday with trend arrow, and revenue this month as secondary metric.',
    component: 'RevenueCard',
    category: 'business',
    icon: 'DollarSign',
    defaultGridSpan: 3,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Card title',
          default: 'Revenue',
        },
        showTrend: {
          type: 'boolean',
          description: 'Show trend indicator',
          default: true,
        },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: [
      'Track daily revenue',
      'Monitor revenue trends',
      'Financial dashboard overview',
    ],
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
    category: 'business',
    icon: 'ShoppingCart',
    defaultGridSpan: 3,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Card title',
          default: 'Orders',
        },
        showBreakdown: {
          type: 'boolean',
          description: 'Show status breakdown',
          default: true,
        },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: [
      'Monitor order volume',
      'Track order status distribution',
      'Operations dashboard',
    ],
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
    category: 'business',
    icon: 'Users',
    defaultGridSpan: 3,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Card title',
          default: 'Customers',
        },
        showTrend: {
          type: 'boolean',
          description: 'Show trend indicator',
          default: true,
        },
      },
    },
    dataRequirements: {
      permissions: ['customers:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: [
      'Track customer growth',
      'Monitor new registrations',
      'CRM dashboard',
    ],
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
    category: 'business',
    icon: 'AlertTriangle',
    defaultGridSpan: 3,
    minGridSpan: 3,
    maxGridSpan: 6,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Card title',
          default: 'Inventory Alerts',
        },
        linkToInventory: {
          type: 'boolean',
          description: 'Show link to inventory page',
          default: true,
        },
      },
    },
    dataRequirements: {
      permissions: ['inventory:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: [
      'Monitor inventory levels',
      'Prevent stockouts',
      'Inventory management alerts',
    ],
    examples: [],
    tags: ['business', 'inventory', 'alerts', 'warehouse'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // ============================================================================
  // Chart Widgets (Analytics)
  // ============================================================================
  
  {
    key: 'revenue-chart',
    name: 'Revenue Chart',
    description: 'Line chart displaying revenue over time for the last 30 days. Includes tooltip with date and revenue amount. Responsive height.',
    component: 'RevenueChart',
    category: 'chart',
    icon: 'LineChart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Chart title',
          default: 'Revenue Trend',
        },
        period: {
          type: 'string',
          description: 'Time period',
          default: '30d',
        },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/revenue'],
      dependencies: ['recharts'],
    },
    useCases: [
      'Visualize revenue trends',
      'Track revenue performance',
      'Financial analytics',
    ],
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
    category: 'chart',
    icon: 'PieChart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Chart title',
          default: 'Sales by Category',
        },
        period: {
          type: 'string',
          description: 'Time period',
          default: '30d',
        },
      },
    },
    dataRequirements: {
      permissions: ['orders:read', 'products:read'],
      endpoints: ['/dashboard/sales'],
      dependencies: ['recharts'],
    },
    useCases: [
      'Analyze sales distribution',
      'Category performance analysis',
      'Product mix insights',
    ],
    examples: [],
    tags: ['chart', 'sales', 'category', 'analytics'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'order-status-chart',
    name: 'Order Status Chart',
    description: 'Bar chart displaying orders by status. Shows status on x-axis, count on y-axis with color-coded bars matching status badges.',
    component: 'OrderStatusChart',
    category: 'chart',
    icon: 'BarChart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Chart title',
          default: 'Orders by Status',
        },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/stats'],
      dependencies: ['recharts'],
    },
    useCases: [
      'Monitor order pipeline',
      'Track fulfillment status',
      'Operations analytics',
    ],
    examples: [],
    tags: ['chart', 'orders', 'status', 'analytics'],
    isSystemWidget: false,
    isActive: true,
  },
  
  {
    key: 'top-products-chart',
    name: 'Top Products Chart',
    description: 'Horizontal bar chart displaying top 10 selling products. Shows product name on y-axis, quantity sold on x-axis with tooltips.',
    component: 'TopProductsChart',
    category: 'chart',
    icon: 'TrendingUp',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Chart title',
          default: 'Top Selling Products',
        },
        limit: {
          type: 'number',
          description: 'Number of products to display',
          default: 10,
        },
      },
    },
    dataRequirements: {
      permissions: ['products:read', 'orders:read'],
      endpoints: ['/dashboard/sales'],
      dependencies: ['recharts'],
    },
    useCases: [
      'Identify best sellers',
      'Product performance analysis',
      'Inventory planning',
    ],
    examples: [],
    tags: ['chart', 'products', 'sales', 'analytics'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // ============================================================================
  // Table Widgets (Data Display)
  // ============================================================================
  
  {
    key: 'recent-orders-table',
    name: 'Recent Orders Table',
    description: 'Table displaying last 10 orders with columns: Order ID, Customer, Status, Total, Date. Color-coded status badges with horizontal scroll on mobile.',
    component: 'RecentOrdersTable',
    category: 'table',
    icon: 'Table',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Table title',
          default: 'Recent Orders',
        },
        limit: {
          type: 'number',
          description: 'Number of orders to display',
          default: 10,
        },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/dashboard/recent-activity'],
      dependencies: [],
    },
    useCases: [
      'Monitor recent orders',
      'Quick access to order details',
      'Order management dashboard',
    ],
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
    category: 'table',
    icon: 'AlertCircle',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Table title',
          default: 'Low Stock Products',
        },
      },
    },
    dataRequirements: {
      permissions: ['inventory:read'],
      endpoints: ['/dashboard/inventory'],
      dependencies: [],
    },
    useCases: [
      'Monitor low stock items',
      'Inventory reordering',
      'Warehouse management',
    ],
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
    category: 'table',
    icon: 'Users',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Table title',
          default: 'Recent Customers',
        },
        limit: {
          type: 'number',
          description: 'Number of customers to display',
          default: 10,
        },
      },
    },
    dataRequirements: {
      permissions: ['customers:read'],
      endpoints: ['/dashboard/recent-activity'],
      dependencies: [],
    },
    useCases: [
      'Monitor new customers',
      'Customer acquisition tracking',
      'CRM dashboard',
    ],
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
    category: 'table',
    icon: 'FileText',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Table title',
          default: 'Recent Blog Posts',
        },
        limit: {
          type: 'number',
          description: 'Number of posts to display',
          default: 10,
        },
      },
    },
    dataRequirements: {
      permissions: ['blog:read'],
      endpoints: ['/dashboard/content'],
      dependencies: [],
    },
    useCases: [
      'Monitor blog activity',
      'Content management',
      'Editorial dashboard',
    ],
    examples: [],
    tags: ['table', 'blog', 'content', 'recent'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // ============================================================================
  // Personal Widgets (User Role)
  // ============================================================================
  
  {
    key: 'personal-stats-card',
    name: 'Personal Stats Card',
    description: 'Displays unread notifications count, unread messages count, and file uploads count in a 3-column grid with icons and hover effects.',
    component: 'PersonalStatsCard',
    category: 'personal',
    icon: 'User',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Card title',
          default: 'My Stats',
        },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/dashboard/stats'],
      dependencies: [],
    },
    useCases: [
      'Personal dashboard overview',
      'User activity summary',
      'Quick stats at a glance',
    ],
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
    category: 'personal',
    icon: 'Bell',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Recent Notifications',
        },
        limit: {
          type: 'number',
          description: 'Number of notifications to display',
          default: 10,
        },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/dashboard/recent-activity'],
      dependencies: [],
    },
    useCases: [
      'View recent notifications',
      'Stay updated on activity',
      'Personal dashboard',
    ],
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
    category: 'personal',
    icon: 'MessageSquare',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Recent Messages',
        },
        limit: {
          type: 'number',
          description: 'Number of messages to display',
          default: 10,
        },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/dashboard/recent-activity'],
      dependencies: [],
    },
    useCases: [
      'View recent messages',
      'Quick message access',
      'Communication dashboard',
    ],
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
    category: 'personal',
    icon: 'UserCircle',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Card title',
          default: 'My Profile',
        },
        showCompletion: {
          type: 'boolean',
          description: 'Show profile completion',
          default: true,
        },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/profile'],
      dependencies: [],
    },
    useCases: [
      'Profile overview',
      'Quick profile access',
      'Profile completion tracking',
    ],
    examples: [],
    tags: ['personal', 'profile', 'user', 'account'],
    isSystemWidget: false,
    isActive: true,
  },
  
  // ============================================================================
  // Action Widgets (Quick Actions & Alerts)
  // ============================================================================
  
  {
    key: 'quick-actions-grid',
    name: 'Quick Actions Grid',
    description: 'Grid of role-specific action buttons. Responsive layout (2 columns mobile, 3 tablet, 4 desktop) with icons and labels for common tasks.',
    component: 'QuickActionsGrid',
    category: 'action',
    icon: 'Zap',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Quick Actions',
        },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: [],
      dependencies: [],
    },
    useCases: [
      'Quick access to common tasks',
      'Role-specific actions',
      'Productivity shortcuts',
    ],
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
    category: 'action',
    icon: 'AlertCircle',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: 'Alerts',
        },
        showDismissed: {
          type: 'boolean',
          description: 'Show dismissed alerts',
          default: false,
        },
      },
    },
    dataRequirements: {
      permissions: [],
      endpoints: ['/dashboard/alerts'],
      dependencies: [],
    },
    useCases: [
      'Display important alerts',
      'Action required notifications',
      'System warnings',
    ],
    examples: [],
    tags: ['action', 'alerts', 'notifications', 'warnings'],
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
    key: 'today-agenda',
    name: "Today's Agenda",
    description: 'Displays hourly breakdown of current day (6 AM - 11 PM) with events in time slots. Highlights current time with animated indicator. Shows "No events today" message when empty. Includes "Add Event" button.',
    component: 'TodayAgendaWidget',
    category: 'calendar',
    icon: 'CalendarClock',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 8,
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Widget title',
          default: "Today's Agenda",
        },
      },
    },
    dataRequirements: {
      permissions: ['calendar:read'],
      endpoints: ['/calendar/events'],
      dependencies: ['date-fns'],
    },
    useCases: [
      'View today schedule',
      'Track current day events',
      'Time management',
      'Daily planning',
    ],
    examples: [],
    tags: ['calendar', 'today', 'agenda', 'schedule', 'timeline', 'hourly'],
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


/**
 * Default Widget Instances by Role
 * 
 * Defines default widget layouts for each user role.
 * These are created as global layouts that users can customize.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Super Admin Default Layout
 * Focus: System monitoring, business metrics, and comprehensive overview
 */
export const SUPER_ADMIN_WIDGETS = [
  // Row 1: System Health & Key Metrics
  { widgetKey: 'system-health-card', position: 0, gridSpan: 6, gridRow: 1 },
  { widgetKey: 'revenue-card', position: 1, gridSpan: 3, gridRow: 1 },
  { widgetKey: 'orders-card', position: 2, gridSpan: 3, gridRow: 1 },
  
  // Row 2: System Monitoring
  { widgetKey: 'cron-jobs-status', position: 3, gridSpan: 6, gridRow: 2 },
  { widgetKey: 'email-delivery-stats', position: 4, gridSpan: 6, gridRow: 2 },
  
  // Row 3: Analytics & Activity
  { widgetKey: 'revenue-chart', position: 5, gridSpan: 8, gridRow: 3 },
  { widgetKey: 'customers-card', position: 6, gridSpan: 4, gridRow: 3 },
  
  // Row 4: Data Tables
  { widgetKey: 'recent-orders-table', position: 7, gridSpan: 6, gridRow: 4 },
  { widgetKey: 'security-alerts', position: 8, gridSpan: 6, gridRow: 4 },
  
  // Row 5: Quick Actions
  { widgetKey: 'quick-actions-grid', position: 9, gridSpan: 12, gridRow: 5 },
];

/**
 * Admin Default Layout
 * Focus: Business operations, content management, and analytics
 */
export const ADMIN_WIDGETS = [
  // Row 1: Key Business Metrics
  { widgetKey: 'revenue-card', position: 0, gridSpan: 3, gridRow: 1 },
  { widgetKey: 'orders-card', position: 1, gridSpan: 3, gridRow: 1 },
  { widgetKey: 'customers-card', position: 2, gridSpan: 3, gridRow: 1 },
  { widgetKey: 'inventory-alerts-card', position: 3, gridSpan: 3, gridRow: 1 },
  
  // Row 2: Analytics Charts
  { widgetKey: 'revenue-chart', position: 4, gridSpan: 6, gridRow: 2 },
  { widgetKey: 'sales-by-category-chart', position: 5, gridSpan: 6, gridRow: 2 },
  
  // Row 3: Data Tables
  { widgetKey: 'recent-orders-table', position: 6, gridSpan: 6, gridRow: 3 },
  { widgetKey: 'low-stock-table', position: 7, gridSpan: 6, gridRow: 3 },
  
  // Row 4: Content & Actions
  { widgetKey: 'recent-posts-table', position: 8, gridSpan: 6, gridRow: 4 },
  { widgetKey: 'quick-actions-grid', position: 9, gridSpan: 6, gridRow: 4 },
];

/**
 * Manager Default Layout
 * Focus: Operations, inventory, and order management
 */
export const MANAGER_WIDGETS = [
  // Row 1: Operational Metrics
  { widgetKey: 'orders-card', position: 0, gridSpan: 3, gridRow: 1 },
  { widgetKey: 'inventory-alerts-card', position: 1, gridSpan: 3, gridRow: 1 },
  { widgetKey: 'revenue-card', position: 2, gridSpan: 3, gridRow: 1 },
  { widgetKey: 'customers-card', position: 3, gridSpan: 3, gridRow: 1 },
  
  // Row 2: Analytics
  { widgetKey: 'top-products-chart', position: 4, gridSpan: 6, gridRow: 2 },
  { widgetKey: 'sales-by-category-chart', position: 5, gridSpan: 6, gridRow: 2 },
  
  // Row 3: Operations Tables
  { widgetKey: 'recent-orders-table', position: 6, gridSpan: 6, gridRow: 3 },
  { widgetKey: 'low-stock-table', position: 7, gridSpan: 6, gridRow: 3 },
  
  // Row 4: Quick Actions
  { widgetKey: 'quick-actions-grid', position: 8, gridSpan: 12, gridRow: 4 },
];

/**
 * User Default Layout
 * Focus: Personal information and activity
 */
export const USER_WIDGETS = [
  // Row 1: Personal Overview
  { widgetKey: 'personal-stats-card', position: 0, gridSpan: 6, gridRow: 1 },
  { widgetKey: 'profile-summary-card', position: 1, gridSpan: 6, gridRow: 1 },
  
  // Row 2: Activity Feeds
  { widgetKey: 'notifications-feed', position: 2, gridSpan: 6, gridRow: 2 },
  { widgetKey: 'messages-feed', position: 3, gridSpan: 6, gridRow: 2 },
  
  // Row 3: Quick Actions
  { widgetKey: 'quick-actions-grid', position: 4, gridSpan: 12, gridRow: 3 },
];

/**
 * Feature Flags interface for conditional widget creation
 */
interface FeatureFlags {
  landing: boolean;
  blog: boolean;
  ecommerce: boolean;
  calendar: boolean;
  crm: boolean;
  notifications: boolean;
  customerAccount: boolean;
}

/**
 * Seed default widget instances for each role
 */
export async function seedDefaultWidgetInstances(
  prismaClient?: any,
  featureFlags?: FeatureFlags,
) {
  const db = prismaClient || prisma;
  const flags = featureFlags || {
    landing: true,
    blog: true,
    ecommerce: true,
    calendar: true,
    crm: false,
    notifications: true,
    customerAccount: true,
  };

  console.log('Creating default widget instances by role...');

  // Get all roles
  const roles = await db.userRole.findMany({
    where: {
      name: {
        in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'],
      },
    },
  });

  const roleMap = new Map<string, any>(roles.map(role => [role.name, role]));

  // Filter widgets based on feature flags
  const filterWidgetsByFeatures = (widgets: any[]) => {
    return widgets.filter(widget => {
      // Map widget keys to features
      const widgetFeatureMap: { [key: string]: string | null } = {
        'blog-posts-card': 'blog',
        'blog-categories-card': 'blog',
        'orders-card': 'ecommerce',
        'revenue-card': 'ecommerce',
        'inventory-card': 'ecommerce',
        'products-card': 'ecommerce',
        'calendar-widget': 'calendar',
        'upcoming-events-widget': 'calendar',
        'notifications-widget': 'notifications',
      };

      const feature = widgetFeatureMap[widget.widgetKey];
      if (feature && !flags[feature as keyof FeatureFlags]) {
        console.log(`⏭️  Skipping widget: ${widget.widgetKey} (feature disabled)`);
        return false;
      }
      return true;
    });
  };

  // Define role-specific layouts
  const roleLayouts = [
    {
      role: 'SUPER_ADMIN',
      pageId: 'main-dashboard',
      name: 'Super Admin Dashboard',
      description: 'Comprehensive dashboard with system monitoring and business metrics',
      widgets: filterWidgetsByFeatures(SUPER_ADMIN_WIDGETS),
    },
    {
      role: 'ADMIN',
      pageId: 'main-dashboard',
      name: 'Admin Dashboard',
      description: 'Business operations and content management dashboard',
      widgets: filterWidgetsByFeatures(ADMIN_WIDGETS),
    },
    {
      role: 'MANAGER',
      pageId: 'main-dashboard',
      name: 'Manager Dashboard',
      description: 'Operations and inventory management dashboard',
      widgets: filterWidgetsByFeatures(MANAGER_WIDGETS),
    },
    {
      role: 'USER',
      pageId: 'main-dashboard',
      name: 'User Dashboard',
      description: 'Personal activity and information dashboard',
      widgets: filterWidgetsByFeatures(USER_WIDGETS),
    },
  ];

  // Create layouts for each role
  for (const layoutConfig of roleLayouts) {
    const role = roleMap.get(layoutConfig.role);
    if (!role) {
      console.log(`⚠️  Role not found: ${layoutConfig.role}, skipping...`);
      continue;
    }

    // Get a user with this role for user-specific layout
    const userWithRole = await db.user.findFirst({
      where: { roleId: role.id },
    });

    if (!userWithRole) {
      console.log(`⚠️  No user found with role ${layoutConfig.role}, skipping...`);
      continue;
    }

    // Check if layout already exists for this user
    const existingLayout = await db.dashboardLayout.findFirst({
      where: {
        pageId: layoutConfig.pageId,
        userId: userWithRole.id,
      },
    });

    if (existingLayout) {
      console.log(`⏭️  Layout already exists for ${layoutConfig.role} on ${layoutConfig.pageId}`);
      continue;
    }

    // Create the layout
    const layout = await db.dashboardLayout.create({
      data: {
        pageId: layoutConfig.pageId,
        userId: userWithRole.id,
        scope: 'user',
        name: layoutConfig.name,
        description: layoutConfig.description,
        isActive: true,
        isDefault: true,
      },
    });

    console.log(`✅ Created ${layoutConfig.role} layout for ${layoutConfig.pageId}`);

    // Add widgets to the layout
    for (const widgetConfig of layoutConfig.widgets) {
      // Check if widget definition exists
      const widgetDefinition = await db.widgetDefinition.findUnique({
        where: { key: widgetConfig.widgetKey },
      });

      if (!widgetDefinition) {
        console.log(`⚠️  Widget definition not found: ${widgetConfig.widgetKey}, skipping...`);
        continue;
      }

      await db.widgetInstance.create({
        data: {
          layoutId: layout.id,
          widgetKey: widgetConfig.widgetKey,
          position: widgetConfig.position,
          gridSpan: widgetConfig.gridSpan,
          gridRow: widgetConfig.gridRow,
          config: {},
          isVisible: true,
        },
      });

      console.log(`  ✅ Added widget: ${widgetConfig.widgetKey}`);
    }
  }

  console.log('✅ Default widget instances seeding complete');
}
