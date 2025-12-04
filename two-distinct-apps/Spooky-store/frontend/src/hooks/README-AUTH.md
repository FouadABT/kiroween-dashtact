# Authentication Hooks

This directory contains custom React hooks for authentication and authorization in the application.

## Available Hooks

### `useAuth()`

The main authentication hook that provides access to the authentication context.

```tsx
import { useAuth } from '@/hooks';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole 
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user?.name}!</div>;
}
```

**Returns:**
- `user`: Current user profile or null
- `isAuthenticated`: Boolean indicating if user is logged in
- `isLoading`: Boolean indicating if auth state is loading
- `login(credentials)`: Function to log in
- `register(data)`: Function to register new user
- `logout()`: Function to log out
- `refreshToken()`: Function to manually refresh access token
- `hasPermission(permission)`: Check if user has a permission
- `hasRole(role)`: Check if user has a role
- `hasAnyPermission(permissions)`: Check if user has any of the permissions
- `hasAllPermissions(permissions)`: Check if user has all permissions
- `getUser()`: Get current user
- `getPermissions()`: Get user's permissions array

---

### `usePermission(permission)`

Simplified hook for checking a single permission.

```tsx
import { usePermission } from '@/hooks';

function EditUserButton() {
  const canEditUsers = usePermission('users:write');

  if (!canEditUsers) return null;

  return <button>Edit User</button>;
}
```

**Parameters:**
- `permission` (string): Permission to check (e.g., 'users:write')

**Returns:**
- Boolean indicating if user has the permission

---

### `useRole(role)`

Hook for checking if the current user has a specific role.

```tsx
import { useRole } from '@/hooks';

function AdminPanel() {
  const isAdmin = useRole('Admin');
  const isAdminOrManager = useRole(['Admin', 'Manager']);

  if (!isAdmin) return null;

  return <div>Admin Panel</div>;
}
```

**Parameters:**
- `role` (string | string[]): Role name or array of role names

**Returns:**
- Boolean indicating if user has the role (or any of the roles if array)

---

### `useRequireAuth(redirectTo?)`

Hook that redirects to login if the user is not authenticated. Use this in pages that require authentication.

```tsx
import { useRequireAuth } from '@/hooks';

function ProtectedPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <div>Protected Content</div>;
}
```

**Parameters:**
- `redirectTo` (string, optional): Path to redirect to if not authenticated (default: '/login')

**Returns:**
- `isLoading`: Boolean indicating if auth check is in progress
- `isAuthenticated`: Boolean indicating if user is authenticated

**Features:**
- Automatically redirects unauthenticated users to login
- Stores intended destination for post-login redirect
- Shows loading state during auth check

---

### `useRequirePermission(permission, requireAll?, redirectTo?)`

Hook that redirects to forbidden page if the user lacks required permissions.

```tsx
import { useRequirePermission } from '@/hooks';

function AdminPage() {
  const { hasAccess, isLoading } = useRequirePermission('users:write');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <div>Admin Content</div>;
}

// Multiple permissions (any)
function EditorPage() {
  const { hasAccess } = useRequirePermission(['posts:write', 'pages:write']);
  // User needs either posts:write OR pages:write
}

// Multiple permissions (all required)
function SuperAdminPage() {
  const { hasAccess } = useRequirePermission(
    ['users:write', 'users:delete'], 
    true // requireAll
  );
  // User needs both users:write AND users:delete
}
```

**Parameters:**
- `permission` (string | string[]): Permission(s) to check
- `requireAll` (boolean, optional): If true, user must have all permissions. If false, any permission is sufficient (default: false)
- `redirectTo` (string, optional): Path to redirect to if permission denied (default: '/403')

**Returns:**
- `hasAccess`: Boolean indicating if user has required permission(s)
- `isLoading`: Boolean indicating if permission check is in progress

**Features:**
- Automatically redirects users without permission to forbidden page
- Supports single or multiple permissions
- Configurable logic (any vs all permissions)

---

## Usage Examples

### Basic Authentication Check

```tsx
import { useAuth } from '@/hooks';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

### Protected Page

```tsx
import { useRequireAuth } from '@/hooks';

function DashboardPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Protected content */}
    </div>
  );
}
```

### Permission-Based UI

```tsx
import { usePermission } from '@/hooks';

function UserList() {
  const canCreate = usePermission('users:write');
  const canDelete = usePermission('users:delete');

  return (
    <div>
      <h1>Users</h1>
      {canCreate && <button>Create User</button>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name}
            {canDelete && <button>Delete</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Role-Based Access

```tsx
import { useRole } from '@/hooks';

function Sidebar() {
  const isAdmin = useRole('Admin');
  const isManager = useRole('Manager');

  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      {(isAdmin || isManager) && (
        <a href="/users">User Management</a>
      )}
      {isAdmin && (
        <a href="/settings">System Settings</a>
      )}
    </nav>
  );
}
```

### Complex Permission Logic

```tsx
import { useAuth } from '@/hooks';

function ContentEditor() {
  const { hasAnyPermission, hasAllPermissions } = useAuth();

  // User can edit if they have any of these permissions
  const canEdit = hasAnyPermission(['posts:write', 'pages:write']);

  // User can publish if they have all of these permissions
  const canPublish = hasAllPermissions(['posts:write', 'posts:publish']);

  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canPublish && <button>Publish</button>}
    </div>
  );
}
```

## Permission Format

Permissions follow the format: `{resource}:{action}`

**Examples:**
- `users:read` - Can view users
- `users:write` - Can create/edit users
- `users:delete` - Can delete users
- `users:*` - All user operations
- `*:*` - Super admin (all permissions)

## Best Practices

1. **Use the right hook for the job:**
   - `useAuth()` for general auth state and methods
   - `usePermission()` for simple permission checks
   - `useRole()` for role-based logic
   - `useRequireAuth()` for page-level authentication
   - `useRequirePermission()` for page-level authorization

2. **Handle loading states:**
   ```tsx
   const { isLoading, isAuthenticated } = useAuth();
   
   if (isLoading) return <LoadingSpinner />;
   if (!isAuthenticated) return <LoginPrompt />;
   ```

3. **Combine hooks when needed:**
   ```tsx
   function AdminUserPage() {
     useRequireAuth(); // Ensure authenticated
     const { hasAccess } = useRequirePermission('users:write'); // Check permission
     
     // Component logic
   }
   ```

4. **Use permission guards for UI elements:**
   ```tsx
   const canDelete = usePermission('users:delete');
   
   return (
     <div>
       {canDelete && <DeleteButton />}
     </div>
   );
   ```

5. **Store intended destination:**
   The `useRequireAuth` hook automatically stores the current path in sessionStorage, so users are redirected back after login.

## Related Components

- `AuthGuard` - Component wrapper for route protection
- `PermissionGuard` - Component wrapper for permission-based rendering
- `RoleGuard` - Component wrapper for role-based rendering

See the components documentation for more details on guard components.
