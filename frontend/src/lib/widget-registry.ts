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
