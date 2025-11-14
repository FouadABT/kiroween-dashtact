/**
 * Layout Widgets Examples
 * 
 * Comprehensive examples demonstrating the usage of layout widgets.
 */

import React, { useState } from 'react';
import { PageHeader, EmptyState, ErrorBoundary, SkeletonLoader } from './index';
import { Button } from '@/components/ui/button';
import { Inbox, Users, FileText, AlertCircle } from 'lucide-react';

// ============================================================================
// PageHeader Examples
// ============================================================================

export function PageHeaderBasicExample() {
  return (
    <PageHeader
      title="Dashboard"
      description="Welcome to your dashboard"
    />
  );
}

export function PageHeaderWithBreadcrumbsExample() {
  return (
    <PageHeader
      title="User Management"
      description="Manage users and their permissions"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/dashboard/settings' },
        { label: 'Users' }
      ]}
    />
  );
}

export function PageHeaderWithActionsExample() {
  return (
    <PageHeader
      title="Products"
      description="Manage your product catalog"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Products' }
      ]}
      actions={
        <>
          <Button variant="outline">Export</Button>
          <Button variant="outline">Import</Button>
          <Button>Add Product</Button>
        </>
      }
    />
  );
}

export function PageHeaderCompleteExample() {
  return (
    <PageHeader
      title="Analytics"
      description="View your analytics and insights"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Analytics' }
      ]}
      actions={
        <>
          <Button variant="outline" size="sm">
            Last 7 days
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </>
      }
    />
  );
}

// ============================================================================
// EmptyState Examples
// ============================================================================

export function EmptyStateBasicExample() {
  return (
    <EmptyState
      title="No data available"
      description="There is no data to display at this time"
    />
  );
}

export function EmptyStateWithIconExample() {
  return (
    <EmptyState
      icon={Inbox}
      title="No messages"
      description="You don't have any messages yet"
    />
  );
}

export function EmptyStateWithActionExample() {
  return (
    <EmptyState
      icon={Users}
      title="No users found"
      description="Get started by adding your first user"
      action={{
        label: "Add User",
        onClick: () => console.log('Add user clicked')
      }}
    />
  );
}

export function EmptyStateSearchResultsExample() {
  return (
    <EmptyState
      icon={FileText}
      title="No results found"
      description="We couldn't find any results matching your search. Try adjusting your filters or search terms."
      action={{
        label: "Clear Filters",
        onClick: () => console.log('Clear filters'),
        variant: "outline"
      }}
    />
  );
}

// ============================================================================
// ErrorBoundary Examples
// ============================================================================

// Component that throws an error for testing
function BuggyComponent(): React.ReactElement {
  throw new Error('This is a test error!');
  return <div>This will never render</div>;
}

export function ErrorBoundaryBasicExample() {
  return (
    <ErrorBoundary>
      <div className="p-4">
        <p>This content is protected by an error boundary</p>
      </div>
    </ErrorBoundary>
  );
}

export function ErrorBoundaryWithErrorExample() {
  const [showBuggy, setShowBuggy] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowBuggy(!showBuggy)}>
        {showBuggy ? 'Hide' : 'Show'} Buggy Component
      </Button>
      
      <ErrorBoundary>
        {showBuggy ? <BuggyComponent /> : <p>No errors yet</p>}
      </ErrorBoundary>
    </div>
  );
}

export function ErrorBoundaryWithCustomFallbackExample() {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
          <h3 className="font-semibold text-destructive">Custom Error UI</h3>
          <p className="text-sm text-muted-foreground">
            This is a custom error fallback
          </p>
        </div>
      }
    >
      <div className="p-4">Protected content</div>
    </ErrorBoundary>
  );
}

export function ErrorBoundaryWithCallbackExample() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error caught:', error);
        console.error('Error info:', errorInfo);
        // Send to error tracking service
      }}
    >
      <div className="p-4">Content with error logging</div>
    </ErrorBoundary>
  );
}

// ============================================================================
// SkeletonLoader Examples
// ============================================================================

export function SkeletonLoaderTextExample() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Text Skeleton</h3>
      <SkeletonLoader variant="text" count={3} />
    </div>
  );
}

export function SkeletonLoaderCardExample() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Card Skeleton</h3>
      <SkeletonLoader variant="card" count={3} />
    </div>
  );
}

export function SkeletonLoaderTableExample() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Table Skeleton</h3>
      <SkeletonLoader variant="table" count={5} />
    </div>
  );
}

export function SkeletonLoaderChartExample() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Chart Skeleton</h3>
      <SkeletonLoader variant="chart" />
    </div>
  );
}

export function SkeletonLoaderLoadingStateExample() {
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Loading State Demo</h3>
        <Button onClick={() => setIsLoading(!isLoading)} size="sm">
          Toggle Loading
        </Button>
      </div>
      
      {isLoading ? (
        <SkeletonLoader variant="card" count={4} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6">
              <h4 className="font-semibold">Card {i + 1}</h4>
              <p className="text-sm text-muted-foreground">Content loaded</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Combined Examples
// ============================================================================

export function CompletePageLayoutExample() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasData(Math.random() > 0.5);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complete Page Example"
        description="Demonstrates all layout widgets working together"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Examples' }
        ]}
        actions={
          <Button onClick={() => setIsLoading(true)}>
            Reload
          </Button>
        }
      />

      <ErrorBoundary>
        {isLoading ? (
          <SkeletonLoader variant="card" count={4} />
        ) : hasData ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-6">
                <h4 className="font-semibold">Item {i + 1}</h4>
                <p className="text-sm text-muted-foreground">Data content</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No data available"
            description="There is no data to display. Try creating some content."
            action={{
              label: "Create Content",
              onClick: () => {
                setHasData(true);
              }
            }}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}

// ============================================================================
// Export all examples
// ============================================================================

export const layoutExamples = {
  pageHeader: {
    basic: PageHeaderBasicExample,
    withBreadcrumbs: PageHeaderWithBreadcrumbsExample,
    withActions: PageHeaderWithActionsExample,
    complete: PageHeaderCompleteExample,
  },
  emptyState: {
    basic: EmptyStateBasicExample,
    withIcon: EmptyStateWithIconExample,
    withAction: EmptyStateWithActionExample,
    searchResults: EmptyStateSearchResultsExample,
  },
  errorBoundary: {
    basic: ErrorBoundaryBasicExample,
    withError: ErrorBoundaryWithErrorExample,
    customFallback: ErrorBoundaryWithCustomFallbackExample,
    withCallback: ErrorBoundaryWithCallbackExample,
  },
  skeletonLoader: {
    text: SkeletonLoaderTextExample,
    card: SkeletonLoaderCardExample,
    table: SkeletonLoaderTableExample,
    chart: SkeletonLoaderChartExample,
    loadingState: SkeletonLoaderLoadingStateExample,
  },
  combined: {
    completePage: CompletePageLayoutExample,
  },
};
