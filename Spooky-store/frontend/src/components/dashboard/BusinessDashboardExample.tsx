'use client';

/**
 * Business Dashboard Example
 * Demonstrates how to use business widgets for Admin and Manager roles
 */

import { DashboardDataProvider } from '@/contexts/DashboardDataContext';
import {
  RevenueCard,
  OrdersCard,
  CustomersCard,
  InventoryAlertsCard,
} from '@/components/widgets/dashboard';

/**
 * Example dashboard layout for Admin/Manager roles
 * Shows how to arrange business widgets in a responsive grid
 */
export function BusinessDashboardExample() {
  return (
    <DashboardDataProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your business metrics and performance
            </p>
          </div>
        </div>

        {/* Key Metrics Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RevenueCard />
          <OrdersCard />
          <CustomersCard />
          <InventoryAlertsCard />
        </div>

        {/* Additional sections can be added here */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart widgets would go here */}
          <div className="bg-card text-card-foreground border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Chart</h3>
            <p className="text-sm text-muted-foreground">
              Revenue chart widget will be implemented in task 16
            </p>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
            <p className="text-sm text-muted-foreground">
              Sales chart widget will be implemented in task 16
            </p>
          </div>
        </div>

        {/* Table widgets section */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card text-card-foreground border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <p className="text-sm text-muted-foreground">
              Recent orders table widget will be implemented in task 17
            </p>
          </div>
        </div>
      </div>
    </DashboardDataProvider>
  );
}

/**
 * Usage Example:
 * 
 * In your dashboard page (e.g., app/dashboard/page.tsx):
 * 
 * import { BusinessDashboardExample } from '@/components/dashboard/BusinessDashboardExample';
 * 
 * export default function DashboardPage() {
 *   return <BusinessDashboardExample />;
 * }
 */
