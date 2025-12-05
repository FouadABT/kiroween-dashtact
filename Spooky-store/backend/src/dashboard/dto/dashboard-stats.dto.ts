export class DashboardStatsDto {
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
}
