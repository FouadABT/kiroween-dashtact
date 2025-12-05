/**
 * useRequirePermission Hook
 * 
 * Hook that redirects to forbidden page if the user lacks required permissions.
 * Use this in pages that require specific permissions.
 * 
 * @example
 * ```tsx
 * function AdminPage() {
 *   const { hasAccess, isLoading } = useRequirePermission('users:write');
 *   
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *   
 *   return <div>Admin Content</div>;
 * }
 * 
 * // Multiple permissions (any)
 * const { hasAccess } = useRequirePermission(['users:write', 'users:delete']);
 * 
 * // Multiple permissions (all required)
 * const { hasAccess } = useRequirePermission(['users:write', 'users:delete'], true);
 * ```
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authConfig } from '@/config/auth.config';

/**
 * Hook return type
 */
interface UseRequirePermissionReturn {
  /** Whether user has the required permission(s) */
  hasAccess: boolean;
  /** Whether authentication/permission check is loading */
  isLoading: boolean;
}

/**
 * Require specific permission(s) for the current page
 * Redirects to forbidden page if permission is missing
 * 
 * @param permission - Permission string or array of permissions to check
 * @param requireAll - If true, user must have all permissions. If false, any permission is sufficient (default: false)
 * @param redirectTo - Path to redirect to if permission denied (default: from config)
 * @returns Object with hasAccess and isLoading flags
 */
export function useRequirePermission(
  permission: string | string[],
  requireAll: boolean = false,
  redirectTo: string = authConfig.redirects.forbidden
): UseRequirePermissionReturn {
  const { 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission, 
    isLoading: authLoading,
    isAuthenticated 
  } = useAuth();
  const router = useRouter();

  // Calculate if user has access
  const hasAccess = useMemo(() => {
    if (authLoading || !isAuthenticated) return false;

    if (Array.isArray(permission)) {
      return requireAll 
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission);
    }
    
    return hasPermission(permission);
  }, [
    permission, 
    requireAll, 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission, 
    authLoading,
    isAuthenticated
  ]);

  // Redirect if no access
  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasAccess) {
      router.push(redirectTo);
    }
  }, [hasAccess, authLoading, isAuthenticated, redirectTo, router]);

  return {
    hasAccess,
    isLoading: authLoading,
  };
}

export default useRequirePermission;
