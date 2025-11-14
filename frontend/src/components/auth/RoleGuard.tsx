"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Props for the RoleGuard component
 */
export interface RoleGuardProps {
  /** Content to be rendered if role check passes */
  children: ReactNode;
  /** Single role or array of roles required */
  role: string | string[];
  /** Optional fallback component to show when role check fails */
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
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Access Denied
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your role does not have access to this content.
        </p>
      </div>
    </div>
  );
}

/**
 * RoleGuard Component
 * 
 * Protects content by checking user role.
 * Supports single or multiple roles (OR logic).
 * Shows access denied fallback if user doesn't have required role.
 * 
 * @example Single role
 * ```tsx
 * <RoleGuard role="Admin">
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 * 
 * @example Multiple roles (ANY)
 * ```tsx
 * <RoleGuard role={["Admin", "Manager"]}>
 *   <ManagementTools />
 * </RoleGuard>
 * ```
 * 
 * @example Custom fallback
 * ```tsx
 * <RoleGuard 
 *   role="Super Admin"
 *   fallback={<CustomAccessDenied />}
 * >
 *   <SuperAdminSettings />
 * </RoleGuard>
 * ```
 * 
 * @example Inline fallback (hide content)
 * ```tsx
 * <RoleGuard role="Admin" fallback={null}>
 *   <AdminOnlyButton />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ 
  children, 
  role, 
  fallback 
}: RoleGuardProps) {
  const { user, hasRole, isAuthenticated } = useAuth();

  // If not authenticated, don't show anything
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role based on input type
  let hasAccess = false;

  if (Array.isArray(role)) {
    // Multiple roles - user needs ANY of them
    hasAccess = role.some(r => hasRole(r));
  } else {
    // Single role
    hasAccess = hasRole(role);
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
