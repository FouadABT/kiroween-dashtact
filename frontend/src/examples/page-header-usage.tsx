'use client';

/**
 * PageHeader Component Usage Examples
 * 
 * This file demonstrates various ways to use the PageHeader component
 * in different scenarios and page types.
 */

import { PageHeader, PageHeaderCompact, PageHeaderSkeleton } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Plus, Download, Settings, Edit, Trash2, RefreshCw } from 'lucide-react';

/**
 * Example 1: Basic Page Header
 * Simple page with title and description
 */
export function BasicPageHeaderExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to your dashboard overview"
      />
      <div className="mt-6">
        {/* Page content */}
      </div>
    </div>
  );
}

/**
 * Example 2: Page Header with Single Action
 * Common pattern for list pages with "Add" button
 */
export function PageHeaderWithActionExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Users"
        description="Manage system users and permissions"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />
      <div className="mt-6">
        {/* User list */}
      </div>
    </div>
  );
}

/**
 * Example 3: Page Header with Multiple Actions
 * Multiple action buttons for complex pages
 */
export function PageHeaderWithMultipleActionsExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Reports"
        description="View and export system reports"
        actions={
          <>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </>
        }
      />
      <div className="mt-6">
        {/* Reports content */}
      </div>
    </div>
  );
}

/**
 * Example 4: Page Header with Custom Breadcrumbs
 * Manually specified breadcrumb path
 */
export function PageHeaderWithCustomBreadcrumbsExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Edit User Profile"
        description="Update user information and settings"
        breadcrumbProps={{
          customItems: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Users', href: '/dashboard/users' },
            { label: 'John Doe', href: '/dashboard/users/123' },
            { label: 'Edit', href: '/dashboard/users/123/edit' }
          ]
        }}
        actions={
          <>
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </>
        }
      />
      <div className="mt-6">
        {/* Edit form */}
      </div>
    </div>
  );
}

/**
 * Example 5: Page Header with Dynamic Breadcrumbs
 * Breadcrumbs with dynamic values from loaded data
 */
export function PageHeaderWithDynamicBreadcrumbsExample() {
  const userName = "John Doe"; // From API or props
  const userId = "123"; // From API or props

  return (
    <div className="p-6">
      <PageHeader
        title={userName}
        description={`User ID: ${userId}`}
        breadcrumbProps={{
          dynamicValues: {
            userName: userName,
            userId: userId
          }
        }}
        actions={
          <>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        }
      />
      <div className="mt-6">
        {/* User details */}
      </div>
    </div>
  );
}

/**
 * Example 6: Page Header without Breadcrumbs
 * Top-level pages that don't need breadcrumbs
 */
export function PageHeaderWithoutBreadcrumbsExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard"
        description="Your personal dashboard overview"
        breadcrumbProps={false}
        actions={
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        }
      />
      <div className="mt-6">
        {/* Dashboard widgets */}
      </div>
    </div>
  );
}

/**
 * Example 7: Page Header without Divider
 * Seamless integration with page content
 */
export function PageHeaderWithoutDividerExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Analytics"
        description="Real-time analytics and insights"
        showDivider={false}
      />
      <div className="mt-6">
        {/* Analytics charts */}
      </div>
    </div>
  );
}

/**
 * Example 8: Small Page Header
 * Compact header for secondary pages
 */
export function SmallPageHeaderExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        description="Configure your preferences"
        size="sm"
        actions={
          <Button size="sm">Save</Button>
        }
      />
      <div className="mt-6">
        {/* Settings form */}
      </div>
    </div>
  );
}

/**
 * Example 9: Large Page Header
 * Prominent header for landing or hero pages
 */
export function LargePageHeaderExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Welcome to Dashboard"
        description="Get started with your personalized dashboard experience"
        size="lg"
        breadcrumbProps={false}
        actions={
          <Button size="lg">
            Get Started
          </Button>
        }
      />
      <div className="mt-6">
        {/* Hero content */}
      </div>
    </div>
  );
}

/**
 * Example 10: Compact Page Header
 * Mobile-optimized variant
 */
export function CompactPageHeaderExample() {
  return (
    <div className="p-4">
      <PageHeaderCompact
        title="Users"
        description="Manage system users"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
      <div className="mt-4">
        {/* Mobile content */}
      </div>
    </div>
  );
}

/**
 * Example 11: Page Header with Loading State
 * Show skeleton while data is loading
 */
export function PageHeaderLoadingExample() {
  const isLoading = true; // From loading state

  if (isLoading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton
          showBreadcrumb={true}
          showDescription={true}
          showActions={true}
        />
        <div className="mt-6">
          {/* Loading content */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Loaded Page"
        description="Content has loaded"
      />
      <div className="mt-6">
        {/* Actual content */}
      </div>
    </div>
  );
}

/**
 * Example 12: Page Header with Metadata Integration
 * Full integration with MetadataContext
 */
export function PageHeaderWithMetadataExample() {
  // This would typically be in a real page component
  /*
  import { useMetadata } from '@/contexts/MetadataContext';
  import { useEffect, useState } from 'react';

  const { setDynamicValues, updateMetadata } = useMetadata();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const userData = await fetchUser(userId);
      setUser(userData);
      
      // Update metadata
      updateMetadata({
        title: `${userData.name} - User Profile`,
        description: `View and manage ${userData.name}'s profile`
      });
      
      // Update breadcrumb labels
      setDynamicValues({
        userName: userData.name,
        userId: userId
      });
    }
    
    loadUser();
  }, [userId, updateMetadata, setDynamicValues]);
  */

  return (
    <div className="p-6">
      <PageHeader
        title="User Profile"
        description="View and manage user information"
        breadcrumbProps={{
          dynamicValues: {
            userName: "John Doe"
          }
        }}
        actions={
          <Button>Edit Profile</Button>
        }
      />
      <div className="mt-6">
        {/* User profile content */}
      </div>
    </div>
  );
}

/**
 * Example 13: Responsive Page Header
 * Adapts to different screen sizes
 */
export function ResponsivePageHeaderExample() {
  return (
    <div className="p-6">
      {/* Desktop/Tablet */}
      <div className="hidden sm:block">
        <PageHeader
          title="Responsive Page"
          description="This header adapts to screen size"
          actions={
            <>
              <Button variant="outline">Secondary</Button>
              <Button>Primary</Button>
            </>
          }
        />
      </div>

      {/* Mobile */}
      <div className="block sm:hidden">
        <PageHeaderCompact
          title="Responsive Page"
          description="This header adapts to screen size"
          actions={
            <Button size="sm">Action</Button>
          }
        />
      </div>

      <div className="mt-6">
        {/* Page content */}
      </div>
    </div>
  );
}

/**
 * Example 14: Page Header in Dashboard Layout
 * Typical usage within a dashboard page
 */
export function DashboardPageExample() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your system metrics"
        actions={
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Dashboard content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards */}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Charts */}
      </div>
    </div>
  );
}

/**
 * Example 15: Page Header with Custom Styling
 * Override default styles with custom classes
 */
export function CustomStyledPageHeaderExample() {
  return (
    <div className="p-6">
      <PageHeader
        title="Custom Styled Page"
        description="This header has custom styling"
        className="bg-accent/10 p-6 rounded-lg"
        actions={
          <Button>Action</Button>
        }
      />
      <div className="mt-6">
        {/* Page content */}
      </div>
    </div>
  );
}

