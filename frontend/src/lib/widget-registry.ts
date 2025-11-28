/**
 * Widget Registry
 * 
 * Central registry mapping widget keys to React components.
 * Supports lazy loading for performance optimization.
 * Organized by category for UI grouping.
 * 
 * @see WIDGET_SYSTEM_GUIDE.md for complete documentation on adding widgets
 */

import { lazy, ComponentType } from 'react';

/**
 * Widget registry entry with component and metadata
 */
export interface WidgetRegistryEntry {
  /** React component (can be lazy-loaded) */
  component: ComponentType<any>;
  /** Default props for the widget */
  defaultProps?: Record<string, any>;
  /** Prop type definitions for validation */
  propTypes?: Record<string, any>;
  /** Widget category for organization */
  category: string;
  /** Whether component is lazy-loaded */
  lazy?: boolean;
}

/**
 * Widget registry mapping keys to components
 * 
 * This is the central registry for all dashboard widgets.
 * Add your custom widgets here following the pattern below.
 * 
 * @see WIDGET_SYSTEM_GUIDE.md for detailed documentation
 */
export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
  // ============================================================================
  // Demo Widgets - Examples of how to register widgets
  // ============================================================================
  
  /**
   * StatsCard - Display a single metric with optional icon and trend
   * 
   * @example
   * ```tsx
   * <StatsCard
   *   title="Total Users"
   *   value={1234}
   *   icon={Users}
   *   trend={{ value: 12, direction: 'up' }}
   * />
   * ```
   */
  'stats-card': {
    component: lazy(() => import('@/components/widgets/core/StatsCard').then(m => ({ default: m.StatsCard }))),
    defaultProps: {
      title: 'Metric',
      value: 0,
    },
    category: 'core',
    lazy: true,
  },
  
  /**
   * ActivityFeed - Display a timeline of activities
   * 
   * @example
   * ```tsx
   * <ActivityFeed
   *   activities={[
   *     { id: '1', title: 'User logged in', timestamp: new Date() }
   *   ]}
   *   groupByDate={true}
   * />
   * ```
   */
  'activity-feed': {
    component: lazy(() => import('@/components/widgets/core/ActivityFeed').then(m => ({ default: m.ActivityFeed }))),
    defaultProps: {
      activities: [],
      groupByDate: false,
      maxItems: 10,
      showMoreButton: true,
    },
    category: 'core',
    lazy: true,
  },
  
  // ============================================================================
  // Add Your Custom Widgets Below
  // ============================================================================
  
  // E-commerce Recent Orders Widget
  'recent-orders': {
    component: lazy(() => import('@/components/widgets/ecommerce/RecentOrders').then(m => ({ default: m.RecentOrders }))),
    defaultProps: {
      title: 'Recent Orders',
      limit: 5,
      loading: false,
      error: undefined,
      permission: 'orders:read',
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  // E-commerce Recent Customers Widget
  'recent-customers': {
    component: lazy(() => import('@/components/widgets/ecommerce/RecentCustomers').then(m => ({ default: m.RecentCustomers }))),
    defaultProps: {
      title: 'Recent Customers',
      limit: 5,
      loading: false,
      error: undefined,
      permission: 'customers:read',
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  // E-commerce Low Stock Products Widget
  'low-stock-products': {
    component: lazy(() => import('@/components/widgets/ecommerce/LowStockProducts').then(m => ({ default: m.LowStockProducts }))),
    defaultProps: {
      title: 'Low Stock Alert',
      limit: 5,
      threshold: 10,
      loading: false,
      error: undefined,
      permission: 'inventory:read',
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  // E-commerce Revenue Stats Widget
  'revenue-stats': {
    component: lazy(() => import('@/components/widgets/ecommerce/RevenueStats').then(m => ({ default: m.RevenueStats }))),
    defaultProps: {
      title: 'Revenue Overview',
      period: '30d',
      loading: false,
      error: undefined,
      permission: 'orders:read',
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  // E-commerce Top Products Widget
  'top-products': {
    component: lazy(() => import('@/components/widgets/ecommerce/TopProducts').then(m => ({ default: m.TopProducts }))),
    defaultProps: {
      title: 'Top Selling Products',
      limit: 5,
      period: '30d',
      loading: false,
      error: undefined,
      permission: 'products:read',
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  // E-commerce Order Status Chart Widget
  'order-status-chart': {
    component: lazy(() => import('@/components/widgets/ecommerce/OrderStatusChart').then(m => ({ default: m.OrderStatusChart }))),
    defaultProps: {
      title: 'Order Status Distribution',
      period: '30d',
      loading: false,
      error: undefined,
      permission: 'orders:read',
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  // E-commerce Quick Stats Widget
  'quick-stats': {
    component: lazy(() => import('@/components/widgets/ecommerce/QuickStats').then(m => ({ default: m.QuickStats }))),
    defaultProps: {
      title: 'Quick Stats',
      period: '30d',
      loading: false,
      error: undefined,
      permission: 'orders:read',
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  // ============================================================================
  // Dashboard Widgets - Role-Based Dashboard System
  // ============================================================================
  
  // System Widgets (Super Admin)
  'system-health-card': {
    component: lazy(() => import('@/components/widgets/dashboard/SystemHealthCard').then(m => ({ default: m.SystemHealthCard }))),
    defaultProps: {
      title: 'System Health',
      refreshInterval: 60,
    },
    category: 'core',
    lazy: true,
  },
  
  'cron-jobs-status': {
    component: lazy(() => import('@/components/widgets/dashboard/CronJobsStatus').then(m => ({ default: m.CronJobsStatus }))),
    defaultProps: {
      title: 'Cron Jobs Status',
      limit: 10,
    },
    category: 'core',
    lazy: true,
  },
  
  'email-delivery-stats': {
    component: lazy(() => import('@/components/widgets/dashboard/EmailDeliveryStats').then(m => ({ default: m.EmailDeliveryStats }))),
    defaultProps: {
      title: 'Email Delivery',
      period: '24h',
    },
    category: 'core',
    lazy: true,
  },
  
  'security-alerts': {
    component: lazy(() => import('@/components/widgets/dashboard/SecurityAlerts').then(m => ({ default: m.SecurityAlerts }))),
    defaultProps: {
      title: 'Security Alerts',
      limit: 5,
    },
    category: 'core',
    lazy: true,
  },
  
  // Business Widgets (Admin, Manager)
  'revenue-card': {
    component: lazy(() => import('@/components/widgets/dashboard/RevenueCard').then(m => ({ default: m.RevenueCard }))),
    defaultProps: {
      title: 'Revenue',
      showTrend: true,
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  'orders-card': {
    component: lazy(() => import('@/components/widgets/dashboard/OrdersCard').then(m => ({ default: m.OrdersCard }))),
    defaultProps: {
      title: 'Orders',
      showBreakdown: true,
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  'customers-card': {
    component: lazy(() => import('@/components/widgets/dashboard/CustomersCard').then(m => ({ default: m.CustomersCard }))),
    defaultProps: {
      title: 'Customers',
      showTrend: true,
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  'inventory-alerts-card': {
    component: lazy(() => import('@/components/widgets/dashboard/InventoryAlertsCard').then(m => ({ default: m.InventoryAlertsCard }))),
    defaultProps: {
      title: 'Inventory Alerts',
      linkToInventory: true,
    },
    category: 'ecommerce',
    lazy: true,
  },
  
  // Chart Widgets (Analytics)
  'revenue-chart': {
    component: lazy(() => import('@/components/widgets/dashboard/RevenueChart').then(m => ({ default: m.RevenueChart }))),
    defaultProps: {
      title: 'Revenue Trend',
      period: '30d',
    },
    category: 'analytics',
    lazy: true,
  },
  
  'sales-by-category-chart': {
    component: lazy(() => import('@/components/widgets/dashboard/SalesByCategoryChart').then(m => ({ default: m.SalesByCategoryChart }))),
    defaultProps: {
      title: 'Sales by Category',
      period: '30d',
    },
    category: 'analytics',
    lazy: true,
  },
  
  'top-products-chart': {
    component: lazy(() => import('@/components/widgets/dashboard/TopProductsChart').then(m => ({ default: m.TopProductsChart }))),
    defaultProps: {
      title: 'Top Selling Products',
      limit: 10,
    },
    category: 'analytics',
    lazy: true,
  },
  
  // Table Widgets (Data Display)
  'recent-orders-table': {
    component: lazy(() => import('@/components/widgets/dashboard/RecentOrdersTable').then(m => ({ default: m.RecentOrdersTable }))),
    defaultProps: {
      title: 'Recent Orders',
      limit: 10,
    },
    category: 'data-display',
    lazy: true,
  },
  
  'low-stock-table': {
    component: lazy(() => import('@/components/widgets/dashboard/LowStockTable').then(m => ({ default: m.LowStockTable }))),
    defaultProps: {
      title: 'Low Stock Products',
    },
    category: 'data-display',
    lazy: true,
  },
  
  'recent-customers-table': {
    component: lazy(() => import('@/components/widgets/dashboard/RecentCustomersTable').then(m => ({ default: m.RecentCustomersTable }))),
    defaultProps: {
      title: 'Recent Customers',
      limit: 10,
    },
    category: 'data-display',
    lazy: true,
  },
  
  'recent-posts-table': {
    component: lazy(() => import('@/components/widgets/dashboard/RecentPostsTable').then(m => ({ default: m.RecentPostsTable }))),
    defaultProps: {
      title: 'Recent Blog Posts',
      limit: 10,
    },
    category: 'data-display',
    lazy: true,
  },
  
  // Personal Widgets (User Role)
  'personal-stats-card': {
    component: lazy(() => import('@/components/widgets/dashboard/PersonalStatsCard').then(m => ({ default: m.PersonalStatsCard }))),
    defaultProps: {
      title: 'My Stats',
    },
    category: 'core',
    lazy: true,
  },
  
  'notifications-feed': {
    component: lazy(() => import('@/components/widgets/dashboard/NotificationsFeed').then(m => ({ default: m.NotificationsFeed }))),
    defaultProps: {
      title: 'Recent Notifications',
      limit: 10,
    },
    category: 'data-display',
    lazy: true,
  },
  
  'messages-feed': {
    component: lazy(() => import('@/components/widgets/dashboard/MessagesFeed').then(m => ({ default: m.MessagesFeed }))),
    defaultProps: {
      title: 'Recent Messages',
      limit: 10,
    },
    category: 'data-display',
    lazy: true,
  },
  
  'profile-summary-card': {
    component: lazy(() => import('@/components/widgets/dashboard/ProfileSummaryCard').then(m => ({ default: m.ProfileSummaryCard }))),
    defaultProps: {
      title: 'My Profile',
      showCompletion: true,
    },
    category: 'core',
    lazy: true,
  },
  
  // Action Widgets (Quick Actions & Alerts)
  'quick-actions-grid': {
    component: lazy(() => import('@/components/widgets/dashboard/QuickActionsGrid').then(m => ({ default: m.QuickActionsGrid }))),
    defaultProps: {
      title: 'Quick Actions',
    },
    category: 'interactive',
    lazy: true,
  },
  
  'alerts-panel': {
    component: lazy(() => import('@/components/widgets/dashboard/AlertsPanel').then(m => ({ default: m.AlertsPanel }))),
    defaultProps: {
      title: 'Alerts',
      showDismissed: false,
    },
    category: 'interactive',
    lazy: true,
  },
  
  // ============================================================================
  // Calendar Widgets
  // ============================================================================
  
  'mini-calendar': {
    component: lazy(() => import('@/components/widgets/calendar/MiniCalendarWidget').then(m => ({ default: m.MiniCalendarWidget }))),
    defaultProps: {
      title: 'Calendar',
    },
    category: 'calendar',
    lazy: true,
  },
  
  'upcoming-events': {
    component: lazy(() => import('@/components/widgets/calendar/UpcomingEventsWidget').then(m => ({ default: m.UpcomingEventsWidget }))),
    defaultProps: {
      title: 'Upcoming Events',
      limit: 10,
      showOnlyMyEvents: false,
    },
    category: 'calendar',
    lazy: true,
  },
  
  'today-agenda': {
    component: lazy(() => import('@/components/widgets/calendar/TodayAgendaWidget').then(m => ({ default: m.TodayAgendaWidget }))),
    defaultProps: {
      title: "Today's Agenda",
    },
    category: 'calendar',
    lazy: true,
  },
  
  'team-schedule': {
    component: lazy(() => import('@/components/widgets/calendar/TeamScheduleWidget').then(m => ({ default: m.TeamScheduleWidget }))),
    defaultProps: {
      title: 'Team Schedule',
      defaultUserIds: [],
      maxUsers: 5,
    },
    category: 'calendar',
    lazy: true,
  },
};


/**
 * Get widget component by key
 * @param key - Widget key
 * @returns Component or null if not found
 */
export function getWidgetComponent(key: string): ComponentType<any> | null {
  const entry = widgetRegistry[key];
  return entry?.component || null;
}

/**
 * Get all widget keys for a specific category
 * @param category - Widget category
 * @returns Array of widget keys
 */
export function getWidgetsByCategory(category: string): string[] {
  return Object.entries(widgetRegistry)
    .filter(([_, entry]) => entry.category === category)
    .map(([key]) => key);
}

/**
 * Get widget metadata (default props, category, etc.)
 * @param key - Widget key
 * @returns Widget metadata or null if not found
 */
export function getWidgetMetadata(key: string): Omit<WidgetRegistryEntry, 'component'> | null {
  const entry = widgetRegistry[key];
  if (!entry) return null;
  
  const { component, ...metadata } = entry;
  return metadata;
}

/**
 * Get all available widget categories
 * @returns Array of unique categories
 */
export function getWidgetCategories(): string[] {
  const categories = new Set<string>();
  Object.values(widgetRegistry).forEach(entry => {
    categories.add(entry.category);
  });
  return Array.from(categories).sort();
}

/**
 * Check if a widget key exists in the registry
 * @param key - Widget key
 * @returns True if widget exists
 */
export function hasWidget(key: string): boolean {
  return key in widgetRegistry;
}

/**
 * Get all registered widget keys
 * @returns Array of all widget keys
 */
export function getAllWidgetKeys(): string[] {
  return Object.keys(widgetRegistry);
}

/**
 * Get widgets by multiple categories
 * @param categories - Array of category names
 * @returns Array of widget keys
 */
export function getWidgetsByCategories(categories: string[]): string[] {
  return Object.entries(widgetRegistry)
    .filter(([_, entry]) => categories.includes(entry.category))
    .map(([key]) => key);
}
