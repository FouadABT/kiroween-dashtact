'use client';

/**
 * Table Widgets Example
 * Demonstrates how to use the table widgets in a dashboard layout
 */

import { DashboardDataProvider } from '@/contexts/DashboardDataContext';
import { RecentOrdersTable } from '@/components/widgets/dashboard/RecentOrdersTable';
import { LowStockTable } from '@/components/widgets/dashboard/LowStockTable';
import { RecentCustomersTable } from '@/components/widgets/dashboard/RecentCustomersTable';
import { RecentPostsTable } from '@/components/widgets/dashboard/RecentPostsTable';

/**
 * Table Widgets Example Component
 * 
 * Usage:
 * - Wrap in DashboardDataProvider for shared data context
 * - RecentOrdersTable: Shows last 10 orders from activity feed
 * - LowStockTable: Shows products with low inventory (fetches own data)
 * - RecentCustomersTable: Shows last 10 customers from activity feed
 * - RecentPostsTable: Shows recent blog posts (fetches own data)
 */
export function TableWidgetsExample() {
  return (
    <DashboardDataProvider>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Table Widgets Example</h1>
        
        {/* Grid layout for table widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders - Uses activity feed from context */}
          <RecentOrdersTable />
          
          {/* Low Stock Products - Fetches inventory data independently */}
          <LowStockTable />
          
          {/* Recent Customers - Uses activity feed from context */}
          <RecentCustomersTable />
          
          {/* Recent Blog Posts - Fetches content metrics independently */}
          <RecentPostsTable />
        </div>
      </div>
    </DashboardDataProvider>
  );
}

/**
 * Role-Based Usage:
 * 
 * Admin Dashboard:
 * - RecentOrdersTable ✓
 * - LowStockTable ✓
 * - RecentCustomersTable ✓
 * - RecentPostsTable ✓
 * 
 * Manager Dashboard:
 * - RecentOrdersTable ✓
 * - LowStockTable ✓
 * - RecentCustomersTable ✓
 * - RecentPostsTable ✗ (Admin only)
 * 
 * User Dashboard:
 * - None of these widgets (personal widgets instead)
 */
