'use client';

import React from 'react';
import { QuickActionsGrid } from '@/components/widgets/dashboard/QuickActionsGrid';
import { AlertsPanel } from '@/components/widgets/dashboard/AlertsPanel';
import { DashboardDataProvider } from '@/contexts/DashboardDataContext';

/**
 * Action Widgets Example Component
 * 
 * Demonstrates the QuickActionsGrid and AlertsPanel widgets.
 * These widgets provide quick access to common actions and display important alerts.
 * 
 * Features:
 * - QuickActionsGrid: Role-specific action buttons
 * - AlertsPanel: Color-coded alerts with dismiss and action buttons
 */
export function ActionWidgetsExample() {
  return (
    <DashboardDataProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Action Widgets</h2>
          <p className="text-muted-foreground mb-6">
            Quick actions and alerts for your dashboard
          </p>
        </div>

        {/* Quick Actions Grid */}
        <QuickActionsGrid />

        {/* Alerts Panel */}
        <AlertsPanel />
      </div>
    </DashboardDataProvider>
  );
}
