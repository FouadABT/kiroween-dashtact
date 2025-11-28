/**
 * Dashboard Type Definitions
 * 
 * TypeScript interfaces for dashboard data structures
 */

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  // Revenue
  revenueToday: number;
  revenueThisMonth: number;
  revenueYesterday: number;
  revenueChange: number; // Percentage
  
  // Orders
  ordersTotal: number;
  ordersPending: number;
  ordersProcessing: number;
  ordersCompleted: number;
  ordersCancelled: number;
  
  // Customers
  customersTotal: number;
  customersToday: number;
  customersThisMonth: number;
  customersChange?: number; // Percentage change
  
  // Inventory
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
  
  // Content (Admin only)
  blogPostsDraft?: number;
  blogPostsPublished?: number;
  customPagesCount?: number;
  
  // System (Super Admin only)
  cronJobSuccessRate?: number;
  emailDeliveryRate?: number;
  activeUsersCount?: number;
  systemUptime?: number;
  
  // Email Stats (Super Admin only)
  emailsSent?: number;
  emailsDelivered?: number;
  emailsFailed?: number;
  deliveryRate?: number;
  
  // Personal (User only)
  notificationsUnread?: number;
  messagesUnread?: number;
  fileUploadsCount?: number;
}

/**
 * Activity Types
 */
export type ActivityType = 'order' | 'customer' | 'product' | 'blog' | 'cron' | 'email' | 'user' | 'notification' | 'message' | 'upload' | 'inventory';

/**
 * Activity Item
 */
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  entityId: string;
  entityType: string;
  metadata?: Record<string, any>;
}

/**
 * Alert Severity Levels
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Alert Item
 */
export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  dismissible: boolean;
}

/**
 * System Health Metrics (Super Admin only)
 */
export interface SystemHealth {
  cronJobSuccessRate: number;
  emailDeliveryRate: number;
  activeUsersCount: number;
  systemUptime: number;
  databaseStatus: string;
}

/**
 * Revenue Data Point
 */
export interface RevenueDailyData {
  date: string;
  revenue: number;
  orders: number;
}

/**
 * Revenue by Category
 */
export interface RevenueByCategoryData {
  category: string;
  revenue: number;
}

/**
 * Revenue Analytics Data
 */
export interface RevenueData {
  daily: RevenueDailyData[];
  averageOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
  byCategory: RevenueByCategoryData[];
}

/**
 * Top Product Data
 */
export interface TopProductData {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

/**
 * Sales by Category Data
 */
export interface SalesByCategoryData {
  category: string;
  quantity: number;
  revenue: number;
}

/**
 * Sales Analytics Data
 */
export interface SalesData {
  topProducts: TopProductData[];
  byCategory: SalesByCategoryData[];
}

/**
 * Low Stock Product
 */
export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderThreshold: number;
  price: number;
}

/**
 * Out of Stock Product
 */
export interface OutOfStockProduct {
  id: string;
  name: string;
  sku: string;
}

/**
 * Inventory Analytics Data
 */
export interface InventoryData {
  lowStock: LowStockProduct[];
  outOfStock: OutOfStockProduct[];
  totalValue: number;
}

/**
 * Content Metrics (Admin only)
 */
export interface ContentMetrics {
  blogPostsDraft: number;
  blogPostsPublished: number;
  blogPostsArchived: number;
  recentPosts: Array<{
    id: string;
    title: string;
    author: string;
    publishedAt: string;
  }>;
  customPagesCount: number;
  landingPagesCount: number;
}

/**
 * Role Count Data
 */
export interface RoleCount {
  role: string;
  count: number;
}

/**
 * User Metrics (Super Admin/Admin only)
 */
export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newRegistrationsToday: number;
  usersByRole: RoleCount[];
}

/**
 * Date Range for Analytics
 */
export interface DateRange {
  start: Date;
  end: Date;
}
