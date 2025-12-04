/**
 * Guard Components Usage Examples
 * 
 * This file demonstrates how to use the authentication guard components
 * in various scenarios.
 */

import { AuthGuard, PermissionGuard, RoleGuard } from '@/components/auth';

/**
 * Example 1: Basic Page Protection with AuthGuard
 * Protects an entire page from unauthenticated access
 */
export function ProtectedPage() {
  return (
    <AuthGuard>
      <div className="p-8">
        <h1>Protected Page</h1>
        <p>Only authenticated users can see this content.</p>
      </div>
    </AuthGuard>
  );
}

/**
 * Example 2: AuthGuard with Custom Loading State
 */
export function PageWithCustomLoader() {
  return (
    <AuthGuard 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-pulse text-blue-600">Loading...</div>
          </div>
        </div>
      }
    >
      <div className="p-8">
        <h1>Dashboard</h1>
      </div>
    </AuthGuard>
  );
}

/**
 * Example 3: Permission-Based Feature Access
 * Show/hide features based on user permissions
 */
export function UserManagementPage() {
  return (
    <AuthGuard>
      <div className="p-8">
        <h1>User Management</h1>
        
        {/* Only users with 'users:write' permission can see this */}
        <PermissionGuard permission="users:write" fallback={null}>
          <button className="btn-primary">Create New User</button>
        </PermissionGuard>
        
        {/* User list visible to anyone with 'users:read' */}
        <PermissionGuard permission="users:read">
          <div className="mt-4">
            <h2>User List</h2>
            {/* User list content */}
          </div>
        </PermissionGuard>
        
        {/* Delete button only for users with 'users:delete' */}
        <PermissionGuard 
          permission="users:delete"
          fallback={<p className="text-gray-500">You cannot delete users</p>}
        >
          <button className="btn-danger">Delete User</button>
        </PermissionGuard>
      </div>
    </AuthGuard>
  );
}

/**
 * Example 4: Multiple Permissions (ANY)
 * User needs at least one of the specified permissions
 */
export function EditUserForm() {
  return (
    <PermissionGuard permission={["users:write", "users:admin"]}>
      <form>
        <h2>Edit User</h2>
        {/* Form fields */}
      </form>
    </PermissionGuard>
  );
}

/**
 * Example 5: Multiple Permissions (ALL)
 * User needs all specified permissions
 */
export function AdvancedSettings() {
  return (
    <PermissionGuard 
      permission={["settings:write", "settings:admin"]}
      requireAll={true}
    >
      <div>
        <h2>Advanced Settings</h2>
        <p>Only users with both permissions can access this.</p>
      </div>
    </PermissionGuard>
  );
}

/**
 * Example 6: Role-Based Access
 * Show content only to specific roles
 */
export function AdminPanel() {
  return (
    <AuthGuard>
      <RoleGuard role="Admin">
        <div className="p-8">
          <h1>Admin Panel</h1>
          <p>Only administrators can see this panel.</p>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}

/**
 * Example 7: Multiple Roles
 * Show content to users with any of the specified roles
 */
export function ManagementTools() {
  return (
    <RoleGuard role={["Admin", "Manager"]}>
      <div className="p-8">
        <h1>Management Tools</h1>
        <p>Available to Admins and Managers.</p>
      </div>
    </RoleGuard>
  );
}

/**
 * Example 8: Conditional Navigation Items
 * Show/hide navigation items based on permissions
 */
export function Navigation() {
  return (
    <nav className="flex gap-4">
      <a href="/dashboard">Dashboard</a>
      
      {/* Show Users link only if user can read users */}
      <PermissionGuard permission="users:read" fallback={null}>
        <a href="/users">Users</a>
      </PermissionGuard>
      
      {/* Show Settings link only if user can read settings */}
      <PermissionGuard permission="settings:read" fallback={null}>
        <a href="/settings">Settings</a>
      </PermissionGuard>
      
      {/* Show Admin link only to admins */}
      <RoleGuard role="Admin" fallback={null}>
        <a href="/admin">Admin</a>
      </RoleGuard>
    </nav>
  );
}

/**
 * Example 9: Nested Guards
 * Combine multiple guards for complex access control
 */
export function SuperAdminSettings() {
  return (
    <AuthGuard>
      <RoleGuard role="Super Admin">
        <PermissionGuard permission="*:*">
          <div className="p-8">
            <h1>Super Admin Settings</h1>
            <p>Triple-protected: Auth + Role + Permission</p>
          </div>
        </PermissionGuard>
      </RoleGuard>
    </AuthGuard>
  );
}

/**
 * Example 10: Inline Permission Checks in Components
 * Use guards within component logic
 */
export function UserCard({ userId }: { userId: string }) {
  return (
    <div className="card">
      <h3>User #{userId}</h3>
      
      <div className="actions">
        {/* Edit button */}
        <PermissionGuard permission="users:write" fallback={null}>
          <button>Edit</button>
        </PermissionGuard>
        
        {/* Delete button */}
        <PermissionGuard permission="users:delete" fallback={null}>
          <button className="text-red-600">Delete</button>
        </PermissionGuard>
      </div>
    </div>
  );
}

/**
 * Example 11: Layout Protection
 * Protect an entire layout/section
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <Navigation />
        </aside>
        <main className="content">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}

/**
 * Example 12: Custom Access Denied Message
 */
function CustomAccessDenied() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-yellow-800 font-semibold mb-2">
        Upgrade Required
      </h3>
      <p className="text-yellow-700">
        This feature is only available to premium users.
      </p>
      <button className="mt-4 btn-primary">Upgrade Now</button>
    </div>
  );
}

export function PremiumFeature() {
  return (
    <PermissionGuard 
      permission="premium:access"
      fallback={<CustomAccessDenied />}
    >
      <div>
        <h2>Premium Feature</h2>
        <p>Exclusive content for premium users.</p>
      </div>
    </PermissionGuard>
  );
}
