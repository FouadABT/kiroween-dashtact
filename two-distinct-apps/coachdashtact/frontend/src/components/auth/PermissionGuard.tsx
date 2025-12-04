"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Props for the PermissionGuard component
 */
export interface PermissionGuardProps {
  /** Content to be rendered if permission check passes */
  children: ReactNode;
  /** Single permission or array of permissions required */
  permission: string | string[];
  /** If true, user must have ALL permissions. If false, user needs ANY permission */
  requireAll?: boolean;
  /** Optional fallback component to show when permission check fails */
  fallback?: ReactNode;
}

/**
 * Default Access Denied Component
 */
function DefaultAccessDenied() {
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center p-8">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Access Denied
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You don&apos;t have permission to access this content.
        </p>
      </div>
    </div>
  );
}

/**
 * PermissionGuard Component
 * 
 * Protects content by checking user permissions.
 * Supports single or multiple permissions with AND/OR logic.
 * Shows access denied fallback if insufficient permissions.
 * 
 * @example Single permission
 * ```tsx
 * <PermissionGuard permission="users:write">
 *   <CreateUserButton />
 * </PermissionGuard>
 * ```
 * 
 * @example Multiple permissions (ANY)
 * ```tsx
 * <PermissionGuard permission={["users:write", "users:admin"]}>
 *   <EditUserForm />
 * </PermissionGuard>
 * ```
 * 
 * @example Multiple permissions (ALL)
 * ```tsx
 * <PermissionGuard 
 *   permission={["users:write", "settings:admin"]} 
 *   requireAll={true}
 * >
 *   <AdvancedSettings />
 * </PermissionGuard>
 * ```
 * 
 * @example Custom fallback
 * ```tsx
 * <PermissionGuard 
 *   permission="users:delete"
 *   fallback={<CustomAccessDenied />}
 * >
 *   <DeleteButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({ 
  children, 
  permission, 
  requireAll = false,
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isAuthenticated } = useAuth();

  // If not authenticated, don't show anything
  if (!isAuthenticated) {
    return null;
  }

  // Check permissions based on input type and logic
  let hasAccess = false;

  if (Array.isArray(permission)) {
    // Multiple permissions
    hasAccess = requireAll 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  } else {
    // Single permission
    hasAccess = hasPermission(permission);
  }

  // Show fallback if access denied
  if (!hasAccess) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return <DefaultAccessDenied />;
  }

  return <>{children}</>;
}
