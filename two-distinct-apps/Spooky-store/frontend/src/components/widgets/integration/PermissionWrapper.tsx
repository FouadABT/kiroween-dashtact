'use client';

import React from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { AlertCircle, Lock } from 'lucide-react';

/**
 * PermissionWrapper - Enhanced permission guard with widget-specific styling
 * 
 * Wraps the existing PermissionGuard component with additional styling
 * and fallback UI options suitable for widget contexts.
 * 
 * Features:
 * - Single or multiple permission checks
 * - Require all or any permissions
 * - Custom fallback UI
 * - Widget-styled access denied message
 * - Theme-aware styling
 * 
 * @example
 * ```tsx
 * // Single permission
 * <PermissionWrapper permission="users:read">
 *   <UserList />
 * </PermissionWrapper>
 * 
 * // Multiple permissions (require all)
 * <PermissionWrapper 
 *   permission={['users:read', 'users:write']}
 *   requireAll={true}
 * >
 *   <UserEditor />
 * </PermissionWrapper>
 * 
 * // Custom fallback
 * <PermissionWrapper 
 *   permission="admin:access"
 *   fallback={<CustomAccessDenied />}
 * >
 *   <AdminPanel />
 * </PermissionWrapper>
 * ```
 */

export interface PermissionWrapperProps {
  /** Single permission or array of permissions to check */
  permission: string | string[];
  /** If true, user must have all permissions. If false, user needs any one permission */
  requireAll?: boolean;
  /** Custom fallback UI when permission check fails */
  fallback?: React.ReactNode;
  /** Children to render when permission check passes */
  children: React.ReactNode;
  /** Show styled access denied message (default: true) */
  showAccessDenied?: boolean;
  /** Custom access denied message */
  accessDeniedMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default access denied component with widget styling
 */
function DefaultAccessDenied({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-destructive/10">
        <Lock className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Access Denied
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {message || 'You do not have permission to view this content. Please contact your administrator if you believe this is an error.'}
      </p>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <AlertCircle className="w-4 h-4" />
        <span>Required permissions not met</span>
      </div>
    </div>
  );
}

export function PermissionWrapper({
  permission,
  requireAll = true,
  fallback,
  children,
  showAccessDenied = true,
  accessDeniedMessage,
  className,
}: PermissionWrapperProps) {
  // Determine the fallback UI
  const fallbackUI = fallback !== undefined 
    ? fallback 
    : showAccessDenied 
      ? <DefaultAccessDenied message={accessDeniedMessage} />
      : null;

  return (
    <div className={className}>
      <PermissionGuard
        permission={permission}
        requireAll={requireAll}
        fallback={fallbackUI}
      >
        {children}
      </PermissionGuard>
    </div>
  );
}

/**
 * Inline permission wrapper for smaller UI elements
 * Renders nothing when permission check fails (no fallback UI)
 */
export function InlinePermissionWrapper({
  permission,
  requireAll = true,
  children,
}: Omit<PermissionWrapperProps, 'fallback' | 'showAccessDenied' | 'accessDeniedMessage' | 'className'>) {
  return (
    <PermissionGuard
      permission={permission}
      requireAll={requireAll}
      fallback={null}
    >
      {children}
    </PermissionGuard>
  );
}
