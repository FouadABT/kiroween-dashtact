# Authentication Components

This directory contains all authentication-related components for the application.

## Components

### AuthGuard

Protects routes by checking authentication status. Redirects unauthenticated users to login page and stores the intended destination for post-login redirect.

**Usage:**
```tsx
import { AuthGuard } from '@/components/auth';

// Basic usage
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// With custom redirect
<AuthGuard redirectTo="/custom-login">
  <ProtectedContent />
</AuthGuard>

// With custom loading fallback
<AuthGuard fallback={<CustomLoader />}>
  <ProtectedContent />
</AuthGuard>
```

**Props:**
- `children`: Content to render if authenticated
- `fallback?`: Optional loading component
- `redirectTo?`: Custom login page URL

### PermissionGuard

Protects content by checking user permissions. Supports single or multiple permissions with AND/OR logic.

**Usage:**
```tsx
import { PermissionGuard } from '@/components/auth';

// Single permission
<PermissionGuard permission="users:write">
  <CreateUserButton />
</PermissionGuard>

// Multiple permissions (ANY)
<PermissionGuard permission={["users:write", "users:admin"]}>
  <EditUserForm />
</PermissionGuard>

// Multiple permissions (ALL)
<PermissionGuard 
  permission={["users:write", "settings:admin"]} 
  requireAll={true}
>
  <AdvancedSettings />
</PermissionGuard>

// Custom fallback
<PermissionGuard 
  permission="users:delete"
  fallback={<CustomAccessDenied />}
>
  <DeleteButton />
</PermissionGuard>

// Hide content (no fallback)
<PermissionGuard permission="admin:panel" fallback={null}>
  <AdminLink />
</PermissionGuard>
```

**Props:**
- `children`: Content to render if permission check passes
- `permission`: Single permission string or array of permissions
- `requireAll?`: If true, user must have ALL permissions (default: false)
- `fallback?`: Component to show when access denied (default: access denied message)

### RoleGuard

Protects content by checking user role. Supports single or multiple roles (OR logic).

**Usage:**
```tsx
import { RoleGuard } from '@/components/auth';

// Single role
<RoleGuard role="Admin">
  <AdminPanel />
</RoleGuard>

// Multiple roles (ANY)
<RoleGuard role={["Admin", "Manager"]}>
  <ManagementTools />
</RoleGuard>

// Custom fallback
<RoleGuard 
  role="Super Admin"
  fallback={<CustomAccessDenied />}
>
  <SuperAdminSettings />
</RoleGuard>

// Hide content (no fallback)
<RoleGuard role="Admin" fallback={null}>
  <AdminOnlyButton />
</RoleGuard>
```

**Props:**
- `children`: Content to render if role check passes
- `role`: Single role string or array of roles
- `fallback?`: Component to show when access denied (default: access denied message)

### RouteGuard (Legacy)

Basic route protection component. Consider using `AuthGuard` for new implementations.

**Usage:**
```tsx
import { RouteGuard } from '@/components/auth';

<RouteGuard requireAuth={true}>
  <ProtectedPage />
</RouteGuard>
```

### LoginForm

Pre-built login form component with validation and error handling.

**Usage:**
```tsx
import { LoginForm } from '@/components/auth';

<LoginForm onSuccess={() => router.push('/dashboard')} />
```

### SignupForm

Pre-built registration form component with validation and password strength indicator.

**Usage:**
```tsx
import { SignupForm } from '@/components/auth';

<SignupForm onSuccess={() => router.push('/dashboard')} />
```

### AuthLayout

Layout wrapper for authentication pages (login, signup, etc.).

**Usage:**
```tsx
import { AuthLayout } from '@/components/auth';

<AuthLayout title="Sign In">
  <LoginForm />
</AuthLayout>
```

### AccessDenied

Component for displaying access denied messages. Can be used inline or to redirect to the dedicated 403 page.

**Usage:**
```tsx
import { AccessDenied, redirectToAccessDenied } from '@/components/auth';

// Inline usage (shows message in place)
<AccessDenied 
  permission="users:write" 
  resource="user management" 
/>

// Redirect to 403 page with context
<AccessDenied 
  permission="users:write" 
  resource="user management"
  redirect={true}
/>

// Programmatic redirect (in event handlers)
function handleUnauthorizedAction() {
  redirectToAccessDenied({
    permission: 'users:delete',
    resource: 'user account'
  });
}
```

**Props:**
- `permission?`: Permission that was required but missing
- `role?`: Role that was required but missing
- `resource?`: Resource that was being accessed
- `redirect?`: Whether to redirect to 403 page (default: false)

**403 Page:**

The application includes a dedicated 403 Access Denied page at `/403` that:
- Displays a friendly error message
- Shows required permissions/roles (via URL params)
- Provides helpful suggestions for next steps
- Includes links back to dashboard and profile
- Supports query parameters: `permission`, `role`, `resource`

Example URL: `/403?permission=users:write&resource=user%20management`

### Loading Components

#### AuthLoadingSpinner

Specialized loading spinner for authentication operations with optional messages and fullscreen mode.

**Usage:**
```tsx
import { AuthLoadingSpinner, AuthLoadingDots, AuthLoadingOverlay } from '@/components/auth';

// Basic spinner
<AuthLoadingSpinner message="Logging in..." />

// Fullscreen mode
<AuthLoadingSpinner message="Authenticating..." fullscreen={true} />

// Inline dots (for buttons)
<button disabled>
  <AuthLoadingDots /> Processing...
</button>

// Overlay (blocks interaction)
{isLoading && <AuthLoadingOverlay message="Verifying credentials..." />}
```

#### PageLoadingState

Full-page loading state for route transitions with optional skeleton screens.

**Usage:**
```tsx
import { 
  PageLoadingState, 
  PageLoadingSkeleton,
  InlineLoadingState,
  ButtonLoadingState 
} from '@/components/auth';

// Full page loading
<PageLoadingState message="Loading dashboard..." />

// Skeleton loading
<PageLoadingState showSkeleton={true} />

// Inline loading (within components)
{isLoadingData ? (
  <InlineLoadingState message="Loading data..." />
) : (
  <DataTable data={data} />
)}

// Button loading state
<button disabled={isLoading}>
  {isLoading ? (
    <ButtonLoadingState text="Logging in..." />
  ) : (
    "Login"
  )}
</button>
```

### Error Components

#### AuthErrorMessage

Displays authentication-related error messages with severity levels and dismissible options.

**Usage:**
```tsx
import { 
  AuthErrorMessage, 
  AuthErrorBanner,
  PermissionDeniedMessage,
  FormErrorMessage,
  ErrorList 
} from '@/components/auth';

// Basic error
<AuthErrorMessage 
  message="Invalid email or password" 
  severity="error"
/>

// Dismissible warning
<AuthErrorMessage 
  message="Session expired. Please log in again."
  severity="warning"
  dismissible={true}
  onDismiss={() => setError(null)}
/>

// Full-width banner
<AuthErrorBanner 
  message="Your session has expired. Please log in again."
  onDismiss={() => router.push('/login')}
/>

// Permission denied
<PermissionDeniedMessage 
  permission="users:write"
  resource="user management"
/>

// Form field error
<FormErrorMessage message="Email is required" />

// Multiple errors
<ErrorList 
  errors={[
    "Password must be at least 8 characters",
    "Password must contain an uppercase letter"
  ]}
/>
```

**Props:**
- `message`: Error message to display
- `severity?`: "error" | "warning" | "info" (default: "error")
- `dismissible?`: Whether error can be dismissed
- `onDismiss?`: Callback when dismissed
- `errorCode?`: Optional error code for debugging
- `variant?`: "inline" | "banner"

#### AccessDeniedMessage

Styled access denied message with multiple variants and optional back button.

**Usage:**
```tsx
import { 
  AccessDeniedMessage, 
  InlineAccessDenied,
  FeatureLockedMessage 
} from '@/components/auth';

// Full access denied message
<AccessDeniedMessage 
  permission="users:write"
  resource="user management"
  showBackButton={true}
  backUrl="/dashboard"
/>

// Compact variant
<AccessDeniedMessage 
  role="Admin"
  resource="admin panel"
  variant="compact"
/>

// Inline version
<InlineAccessDenied 
  message="You need admin privileges to perform this action"
/>

// Feature locked (for premium features)
<FeatureLockedMessage 
  feature="Advanced Analytics"
  requiredRole="Premium"
  upgradeUrl="/upgrade"
  contactUrl="/contact"
/>
```

**Props:**
- `permission?`: Required permission
- `role?`: Required role
- `resource?`: Resource being accessed
- `showBackButton?`: Show back button (default: true)
- `backUrl?`: Back button URL (default: "/dashboard")
- `variant?`: "default" | "compact" | "card"

## Common Patterns

### Protecting a Page

```tsx
// app/dashboard/page.tsx
import { AuthGuard } from '@/components/auth';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div>Protected Dashboard Content</div>
    </AuthGuard>
  );
}
```

### Protecting a Layout

```tsx
// app/dashboard/layout.tsx
import { AuthGuard } from '@/components/auth';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="dashboard-layout">
        {children}
      </div>
    </AuthGuard>
  );
}
```

### Permission-Based UI

```tsx
import { PermissionGuard } from '@/components/auth';

function UserManagement() {
  return (
    <div>
      <h1>User Management</h1>
      
      {/* Show create button only to users with write permission */}
      <PermissionGuard permission="users:write" fallback={null}>
        <CreateUserButton />
      </PermissionGuard>
      
      {/* Show delete button only to users with delete permission */}
      <PermissionGuard permission="users:delete" fallback={null}>
        <DeleteUserButton />
      </PermissionGuard>
    </div>
  );
}
```

### Role-Based Navigation

```tsx
import { RoleGuard } from '@/components/auth';

function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      
      {/* Show admin link only to admins */}
      <RoleGuard role="Admin" fallback={null}>
        <Link href="/admin">Admin Panel</Link>
      </RoleGuard>
      
      {/* Show management link to admins and managers */}
      <RoleGuard role={["Admin", "Manager"]} fallback={null}>
        <Link href="/management">Management</Link>
      </RoleGuard>
    </nav>
  );
}
```

### Combining Guards

```tsx
import { AuthGuard, PermissionGuard } from '@/components/auth';

function AdminPage() {
  return (
    <AuthGuard>
      <PermissionGuard permission="admin:panel">
        <div>Admin Panel Content</div>
      </PermissionGuard>
    </AuthGuard>
  );
}
```

## Best Practices

1. **Use AuthGuard for pages**: Wrap entire pages or layouts with `AuthGuard` to ensure authentication.

2. **Use PermissionGuard for features**: Use `PermissionGuard` to show/hide specific features based on permissions.

3. **Use RoleGuard sparingly**: Prefer permission-based checks over role-based checks for better flexibility.

4. **Provide fallbacks**: Always consider what users should see when they don't have access. Use `fallback={null}` to hide content completely.

5. **Combine guards**: You can nest guards for complex access control scenarios.

6. **Server-side protection**: Always protect API endpoints on the backend. Frontend guards are for UX only.

## Related Hooks

- `useAuth()`: Access authentication context
- `usePermission(permission)`: Check single permission
- `useRole(role)`: Check user role
- `useRequireAuth()`: Redirect if not authenticated
- `useRequirePermission(permission)`: Redirect if permission missing

See `frontend/src/hooks/README-AUTH.md` for more details on authentication hooks.
