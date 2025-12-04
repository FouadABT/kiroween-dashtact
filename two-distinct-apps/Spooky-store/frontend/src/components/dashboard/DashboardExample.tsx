'use client';

/**
 * Dashboard Example Component
 * Demonstrates how to use the DashboardDataContext
 */

import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

/**
 * Example widget component showing how to consume dashboard data
 */
export function DashboardExample() {
  const { stats, recentActivity, alerts, loading, error, refresh } = useDashboardData();

  // Loading state
  if (loading) {
    return (
      <Card className="bg-card text-card-foreground">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-card text-card-foreground border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error.message}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Data display
  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <Card className="bg-card text-card-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dashboard Stats</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Revenue Today</p>
              <p className="text-2xl font-bold">
                ${stats?.revenueToday.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold">{stats?.ordersTotal || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customers</p>
              <p className="text-2xl font-bold">{stats?.customersTotal || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{stats?.lowStockCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.slice(0, 5).map((activity) => (
                <li key={activity.id} className="text-sm">
                  <span className="font-medium">{activity.type}:</span>{' '}
                  {activity.description}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li 
                  key={alert.id} 
                  className={`p-3 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                    alert.severity === 'error' ? 'bg-destructive/10 text-destructive' :
                    alert.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500' :
                    'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                  }`}
                >
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs mt-1">{alert.message}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
