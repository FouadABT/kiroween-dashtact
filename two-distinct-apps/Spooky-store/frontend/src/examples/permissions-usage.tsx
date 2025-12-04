/**
 * Permissions Management UI - Usage Examples
 * 
 * This file demonstrates how to use the permissions management pages
 * and integrate permission checks in your application.
 */

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Shield, Users } from 'lucide-react';

/**
 * Example 1: Navigation Links with Permission Checks
 * 
 * Show navigation links only to users with appropriate permissions
 */
export function PermissionsNavigationExample() {
  const { hasPermission } = useAuth();

  return (
    <nav className="space-y-2">
      {/* Show permissions list link to users with read permission */}
      {hasPermission('permissions:read') && (
        <Link
          href="/dashboard/permissions"
          className="flex items-center gap-2 p-2 rounded hover:bg-accent"
        >
          <Shield className="h-4 w-4" />
          View Permissions
        </Link>
      )}

      {/* Show role editor link to users with write permission */}
      {hasPermission('permissions:write') && (
        <Link
          href="/dashboard/permissions/roles"
          className="flex items-center gap-2 p-2 rounded hover:bg-accent"
        >
          <Users className="h-4 w-4" />
          Manage Role Permissions
        </Link>
      )}
    </nav>
  );
}

/**
 * Example 2: Protected Admin Panel
 * 
 * Create an admin panel that shows different sections based on permissions
 */
export function AdminPanelExample() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      {/* User Management Section - requires users:read */}
      <PermissionGuard permission="users:read">
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <Link href="/dashboard/users">
            <Button>Manage Users</Button>
          </Link>
        </section>
      </PermissionGuard>

      {/* Permissions Management Section - requires permissions:read */}
      <PermissionGuard permission="permissions:read">
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Permissions</h2>
          <div className="space-x-2">
            <Link href="/dashboard/permissions">
              <Button variant="outline">View Permissions</Button>
            </Link>
            
            {/* Role editor only for users with write permission */}
            <PermissionGuard permission="permissions:write">
              <Link href="/dashboard/permissions/roles">
                <Button>Edit Role Permissions</Button>
              </Link>
            </PermissionGuard>
          </div>
        </section>
      </PermissionGuard>

      {/* Settings Section - requires settings:read */}
      <PermissionGuard permission="settings:read">
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <Link href="/dashboard/settings">
            <Button>Manage Settings</Button>
          </Link>
        </section>
      </PermissionGuard>
    </div>
  );
}

/**
 * Example 3: Conditional Rendering Based on Multiple Permissions
 * 
 * Show content only if user has specific combinations of permissions
 */
export function ConditionalPermissionsExample() {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  return (
    <div className="space-y-4">
      {/* Show if user has ANY of these permissions */}
      {hasAnyPermission(['permissions:read', 'permissions:write']) && (
        <div className="p-4 border rounded">
          <p>You have access to permissions management</p>
          <Link href="/dashboard/permissions">
            <Button>Go to Permissions</Button>
          </Link>
        </div>
      )}

      {/* Show if user has ALL of these permissions */}
      {hasAllPermissions(['users:read', 'permissions:write']) && (
        <div className="p-4 border rounded bg-blue-50">
          <p>You can manage both users and permissions</p>
          <div className="space-x-2 mt-2">
            <Link href="/dashboard/users">
              <Button>Manage Users</Button>
            </Link>
            <Link href="/dashboard/permissions/roles">
              <Button>Manage Permissions</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Show if user has specific permission */}
      {hasPermission('permissions:write') && (
        <div className="p-4 border rounded bg-green-50">
          <p className="font-semibold">Admin Access</p>
          <p className="text-sm text-muted-foreground">
            You have full permission management capabilities
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Permission-Based Button States
 * 
 * Enable/disable buttons based on user permissions
 */
export function PermissionButtonsExample() {
  const { hasPermission } = useAuth();

  const canRead = hasPermission('permissions:read');
  const canWrite = hasPermission('permissions:write');

  return (
    <div className="space-x-2">
      <Button
        disabled={!canRead}
        variant={canRead ? 'default' : 'outline'}
      >
        {canRead ? 'View Permissions' : 'No Read Access'}
      </Button>

      <Button
        disabled={!canWrite}
        variant={canWrite ? 'default' : 'outline'}
      >
        {canWrite ? 'Edit Permissions' : 'No Write Access'}
      </Button>
    </div>
  );
}

/**
 * Example 5: Permission Check in Component Logic
 * 
 * Use permissions to control component behavior
 */
export function PermissionLogicExample() {
  const { hasPermission, user } = useAuth();

  const handleAction = () => {
    if (!hasPermission('permissions:write')) {
      alert('You do not have permission to perform this action');
      return;
    }

    // Perform the action
    console.log('Action performed by:', user?.email);
  };

  return (
    <div>
      <Button onClick={handleAction}>
        Perform Protected Action
      </Button>
      
      {!hasPermission('permissions:write') && (
        <p className="text-sm text-muted-foreground mt-2">
          You need permissions:write to perform this action
        </p>
      )}
    </div>
  );
}

/**
 * Example 6: Role-Based Dashboard
 * 
 * Show different dashboard content based on user role
 */
export function RoleBasedDashboardExample() {
  const { user, hasPermission } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome, {user?.name || user?.email}
      </h1>
      <p className="text-muted-foreground">
        Role: {user?.role.name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Always visible */}
        <Card title="Dashboard" href="/dashboard" />

        {/* Visible to users with users:read */}
        {hasPermission('users:read') && (
          <Card title="Users" href="/dashboard/users" />
        )}

        {/* Visible to users with permissions:read */}
        {hasPermission('permissions:read') && (
          <Card title="Permissions" href="/dashboard/permissions" />
        )}

        {/* Visible to users with settings:read */}
        {hasPermission('settings:read') && (
          <Card title="Settings" href="/dashboard/settings" />
        )}

        {/* Visible to admins only */}
        {hasPermission('*:*') && (
          <Card 
            title="Admin Panel" 
            href="/dashboard/admin"
            className="border-red-500"
          />
        )}
      </div>
    </div>
  );
}

// Helper Card component for the example
function Card({ 
  title, 
  href, 
  className = '' 
}: { 
  title: string; 
  href: string; 
  className?: string;
}) {
  return (
    <Link href={href}>
      <div className={`p-6 border rounded-lg hover:bg-accent transition-colors ${className}`}>
        <h3 className="font-semibold">{title}</h3>
      </div>
    </Link>
  );
}

/**
 * Example 7: Permission Requirements Display
 * 
 * Show users what permissions they need for certain features
 */
export function PermissionRequirementsExample() {
  const { hasPermission } = useAuth();

  const features = [
    {
      name: 'View Permissions',
      permission: 'permissions:read',
      description: 'See all system permissions',
      href: '/dashboard/permissions',
    },
    {
      name: 'Edit Role Permissions',
      permission: 'permissions:write',
      description: 'Assign and remove permissions from roles',
      href: '/dashboard/permissions/roles',
    },
    {
      name: 'Manage Users',
      permission: 'users:write',
      description: 'Create, edit, and delete users',
      href: '/dashboard/users',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Feature Access</h2>
      
      {features.map((feature) => {
        const hasAccess = hasPermission(feature.permission);
        
        return (
          <div
            key={feature.name}
            className={`p-4 border rounded-lg ${
              hasAccess ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
                <p className="text-xs font-mono mt-1">
                  Required: {feature.permission}
                </p>
              </div>
              
              {hasAccess ? (
                <Link href={feature.href}>
                  <Button size="sm">Access</Button>
                </Link>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  No Access
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
