/**
 * Access Denied Usage Examples
 * 
 * This file demonstrates various ways to handle access denied scenarios
 * in the application using the AccessDenied component and 403 page.
 */

import { AccessDenied, redirectToAccessDenied } from '@/components/auth';
import { PermissionGuard } from '@/components/auth';
import { Button } from '@/components/ui/button';

/**
 * Example 1: Inline Access Denied Message
 * Shows an access denied message within the current page
 */
export function InlineAccessDeniedExample() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Protected Content</h2>
      
      {/* This will show an inline access denied message */}
      <AccessDenied 
        permission="users:write" 
        resource="user management" 
      />
    </div>
  );
}

/**
 * Example 2: Redirect to 403 Page
 * Automatically redirects to the dedicated 403 page with context
 */
export function RedirectAccessDeniedExample() {
  return (
    <div className="p-4">
      {/* This will redirect to /403?permission=users:delete&resource=user%20account */}
      <AccessDenied 
        permission="users:delete" 
        resource="user account"
        redirect={true}
      />
    </div>
  );
}

/**
 * Example 3: Using with PermissionGuard
 * Combine PermissionGuard with AccessDenied for custom fallback
 */
export function PermissionGuardWithAccessDeniedExample() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      
      <PermissionGuard 
        permission="users:write"
        fallback={
          <AccessDenied 
            permission="users:write" 
            resource="user creation" 
          />
        }
      >
        <div>
          <p>You have access to create users!</p>
          <Button>Create New User</Button>
        </div>
      </PermissionGuard>
    </div>
  );
}

/**
 * Example 4: Programmatic Redirect
 * Redirect to 403 page from event handlers or functions
 */
export function ProgrammaticRedirectExample() {
  const handleDeleteUser = (userId: string) => {
    // Check permission (this would normally come from useAuth)
    const hasPermission = false; // Simulated permission check
    
    if (!hasPermission) {
      // Redirect to 403 page with context
      redirectToAccessDenied({
        permission: 'users:delete',
        resource: 'user account',
      });
      return;
    }
    
    // Proceed with deletion
    console.log('Deleting user:', userId);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Actions</h2>
      <Button onClick={() => handleDeleteUser('123')}>
        Delete User
      </Button>
    </div>
  );
}

/**
 * Example 5: Role-Based Access Denied
 * Show access denied based on role requirements
 */
export function RoleBasedAccessDeniedExample() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      
      <AccessDenied 
        role="Admin" 
        resource="admin panel" 
      />
    </div>
  );
}

/**
 * Example 6: Multiple Permissions
 * Show access denied when multiple permissions are required
 */
export function MultiplePermissionsExample() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Advanced Settings</h2>
      
      <AccessDenied 
        permission="users:write, settings:admin" 
        resource="advanced settings" 
      />
    </div>
  );
}

/**
 * Example 7: API Error Handling
 * Handle 403 responses from API calls
 */
export function ApiErrorHandlingExample() {
  const handleApiCall = async () => {
    try {
      const response = await fetch('/api/protected-resource');
      
      if (response.status === 403) {
        const error = await response.json();
        
        // Redirect to 403 page with API error details
        redirectToAccessDenied({
          permission: error.requiredPermission,
          resource: error.resource,
        });
        return;
      }
      
      // Handle success
      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('API error:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Protected Resource</h2>
      <Button onClick={handleApiCall}>
        Fetch Protected Resource
      </Button>
    </div>
  );
}

/**
 * Example 8: Conditional Rendering
 * Show different content based on permissions
 */
export function ConditionalRenderingExample() {
  // This would normally come from useAuth hook
  const hasPermission = false;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      
      {hasPermission ? (
        <div>
          <p>Edit your profile</p>
          <Button>Save Changes</Button>
        </div>
      ) : (
        <AccessDenied 
          permission="profile:write" 
          resource="profile editing" 
        />
      )}
    </div>
  );
}

/**
 * Example 9: Page-Level Protection
 * Protect entire pages with redirect to 403
 */
export function PageLevelProtectionExample() {
  // This would be in a page component
  const userHasAccess = false; // Simulated permission check

  if (!userHasAccess) {
    return (
      <AccessDenied 
        permission="admin:panel" 
        resource="admin panel"
        redirect={true}
      />
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <p>Welcome to the admin panel!</p>
    </div>
  );
}

/**
 * Example 10: Custom 403 Page Link
 * Direct link to 403 page with query parameters
 */
export function Custom403LinkExample() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Navigation</h2>
      
      {/* Direct link to 403 page with context */}
      <a 
        href="/403?permission=users:admin&resource=user%20administration"
        className="text-blue-600 hover:underline"
      >
        View Access Denied Example
      </a>
    </div>
  );
}
