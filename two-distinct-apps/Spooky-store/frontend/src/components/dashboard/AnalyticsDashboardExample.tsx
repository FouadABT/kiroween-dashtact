'use client';

/**
 * Analytics Dashboard Example
 * Demonstrates all chart widgets for the role-based dashboard
 * This is an example component showing how to use the chart widgets
 */

import { DashboardDataProvider } from '@/contexts/DashboardDataContext';
import {
  RevenueChart,
  SalesByCategoryChart,
  OrderStatusChart,
  TopProductsChart,
} from '@/components/widgets/dashboard';

/**
 * Analytics Dashboard Example Component
 */
export function AnalyticsDashboardExample() {
  return (
    <DashboardDataProvider>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Chart widgets for revenue, sales, orders, and product analytics
          </p>
        </div>

        {/* Chart Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart - Full width on mobile, half on desktop */}
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          {/* Sales by Category Chart */}
          <SalesByCategoryChart />

          {/* Order Status Chart */}
          <OrderStatusChart />

          {/* Top Products Chart - Full width */}
          <div className="lg:col-span-2">
            <TopProductsChart />
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Chart Widgets Usage
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">RevenueChart</h3>
              <p>
                Displays revenue trends over the last 30 days using a line chart.
                Shows daily revenue, total revenue, and average order value.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">SalesByCategoryChart</h3>
              <p>
                Shows sales distribution by category using a pie chart.
                Displays category names, percentages, and revenue in tooltips.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">OrderStatusChart</h3>
              <p>
                Visualizes orders by status (pending, processing, completed, cancelled)
                using a bar chart with color-coded bars.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">TopProductsChart</h3>
              <p>
                Displays top 10 products by quantity sold using a horizontal bar chart.
                Shows product names, quantities, revenue, and SKUs in tooltips.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardDataProvider>
  );
}
