/**
 * PageHeader Integration Demo
 * 
 * This file shows how to integrate PageHeader into existing pages
 * to replace manual header implementations.
 */

'use client';

import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

/**
 * BEFORE: Manual header implementation
 * This is how headers were typically implemented before PageHeader
 */
export function BeforePageHeaderExample() {
  return (
    <div className="space-y-6">
      {/* Manual header implementation */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions across your application.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <PermissionGuard permission="users:write" fallback={null}>
            <Button>Add User</Button>
          </PermissionGuard>
        </div>

        {/* Page content */}
        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
          </CardHeader>
          <CardContent>
            {/* User list content */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * AFTER: Using PageHeader component
 * Cleaner, more consistent, with automatic breadcrumbs
 */
export function AfterPageHeaderExample() {
  return (
    <div className="space-y-6">
      {/* PageHeader replaces manual header */}
      <PageHeader
        title="User Management"
        description="Manage users, roles, and permissions across your application"
        actions={
          <PermissionGuard permission="users:write" fallback={null}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </PermissionGuard>
        }
      />

      {/* Page content */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* User list content */}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Real-world example: Users page with PageHeader
 */
export function UsersPageWithPageHeader() {
  const handleAddUser = () => {
    console.log('Add user clicked');
  };

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  return (
    <PermissionGuard permission="users:read">
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Manage users, roles, and permissions across your application"
          actions={
            <>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <PermissionGuard permission="users:write" fallback={null}>
                <Button onClick={handleAddUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </PermissionGuard>
            </>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {/* User list content */}
            <p className="text-muted-foreground">User list goes here...</p>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

/**
 * Real-world example: User detail page with dynamic breadcrumbs
 */
export function UserDetailPageWithPageHeader() {
  const userId = '123';
  const userName = 'John Doe';

  const handleEdit = () => {
    console.log('Edit user clicked');
  };

  const handleDelete = () => {
    console.log('Delete user clicked');
  };

  return (
    <PermissionGuard permission="users:read">
      <div className="space-y-6">
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
              <PermissionGuard permission="users:write" fallback={null}>
                <Button variant="outline" onClick={handleEdit}>
                  Edit
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="users:delete" fallback={null}>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </PermissionGuard>
            </>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* User details content */}
            <div className="space-y-2">
              <p><strong>Name:</strong> {userName}</p>
              <p><strong>ID:</strong> {userId}</p>
              <p><strong>Email:</strong> john.doe@example.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

/**
 * Migration guide for existing pages
 * 
 * Step 1: Import PageHeader
 * ```tsx
 * import { PageHeader } from '@/components/layout';
 * ```
 * 
 * Step 2: Replace manual header with PageHeader
 * ```tsx
 * // Before
 * <div>
 *   <h1 className="text-3xl font-bold">Title</h1>
 *   <p className="text-muted-foreground">Description</p>
 * </div>
 * 
 * // After
 * <PageHeader
 *   title="Title"
 *   description="Description"
 * />
 * ```
 * 
 * Step 3: Move action buttons to actions prop
 * ```tsx
 * <PageHeader
 *   title="Title"
 *   actions={
 *     <Button>Action</Button>
 *   }
 * />
 * ```
 * 
 * Step 4: Add breadcrumb configuration if needed
 * ```tsx
 * <PageHeader
 *   title="Title"
 *   breadcrumbProps={{
 *     dynamicValues: { key: 'value' }
 *   }}
 * />
 * ```
 */
