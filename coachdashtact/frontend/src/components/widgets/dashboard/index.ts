/**
 * Dashboard Widgets
 * Export all dashboard widget components
 */

// System Widgets (Super Admin)
export { SystemHealthCard } from './SystemHealthCard';
export { CronJobsStatus } from './CronJobsStatus';
export { EmailDeliveryStats } from './EmailDeliveryStats';
export { SecurityAlerts } from './SecurityAlerts';

// Business Widgets (Admin & Manager)
export { RevenueCard } from './RevenueCard';
export { OrdersCard } from './OrdersCard';
export { CustomersCard } from './CustomersCard';
export { InventoryAlertsCard } from './InventoryAlertsCard';

// Chart Widgets (Analytics)
export { RevenueChart } from './RevenueChart';
export { SalesByCategoryChart } from './SalesByCategoryChart';
export { OrderStatusChart } from './OrderStatusChart';
export { TopProductsChart } from './TopProductsChart';
