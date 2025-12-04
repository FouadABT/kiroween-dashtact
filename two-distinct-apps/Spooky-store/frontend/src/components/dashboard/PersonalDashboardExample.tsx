'use client';

/**
 * Personal Dashboard Example
 * 
 * Example implementation showing how to use personal widgets for User role
 * This demonstrates the layout and usage of:
 * - PersonalStatsCard
 * - NotificationsFeed
 * - MessagesFeed
 * - ProfileSummaryCard
 */

import { DashboardDataProvider } from '@/contexts/DashboardDataContext';
import { PersonalStatsCard } from '@/components/widgets/dashboard/PersonalStatsCard';
import { NotificationsFeed } from '@/components/widgets/dashboard/NotificationsFeed';
import { MessagesFeed } from '@/components/widgets/dashboard/MessagesFeed';
import { ProfileSummaryCard } from '@/components/widgets/dashboard/ProfileSummaryCard';

/**
 * Personal Dashboard Example Component
 */
export function PersonalDashboardExample() {
  return (
    <DashboardDataProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your account.
          </p>
        </div>

        {/* Personal Stats - Full Width */}
        <div className="w-full">
          <PersonalStatsCard />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <NotificationsFeed />
            <MessagesFeed />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ProfileSummaryCard />
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
 * ```tsx
 * import { PersonalDashboardExample } from '@/components/dashboard/PersonalDashboardExample';
 * 
 * export default function DashboardPage() {
 *   return <PersonalDashboardExample />;
 * }
 * ```
 * 
 * Or use individual widgets in your custom layout:
 * 
 * ```tsx
 * import { DashboardDataProvider } from '@/contexts/DashboardDataContext';
 * import { PersonalStatsCard } from '@/components/widgets/dashboard/PersonalStatsCard';
 * import { NotificationsFeed } from '@/components/widgets/dashboard/NotificationsFeed';
 * 
 * export default function CustomDashboard() {
 *   return (
 *     <DashboardDataProvider>
 *       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 *         <PersonalStatsCard />
 *         <NotificationsFeed />
 *       </div>
 *     </DashboardDataProvider>
 *   );
 * }
 * ```
 */
