'use client';

/**
 * PageHeader Component
 * 
 * A comprehensive page header component that combines breadcrumb navigation,
 * page title, description, and action buttons. Provides consistent page
 * structure across the application with theme-aware styling.
 * 
 * Features:
 * - Breadcrumb navigation integration
 * - Title and description display
 * - Actions slot for page-level buttons
 * - Theme-aware styling
 * - Responsive design
 * - Accessibility support
 */

import React from 'react';
import { Breadcrumb, BreadcrumbProps } from '@/components/navigation/Breadcrumb';

export interface PageHeaderProps {
  /**
   * Page title to display
   */
  title: string;

  /**
   * Optional page description/subtitle
   */
  description?: string;

  /**
   * Props to pass to the Breadcrumb component
   * Set to false to hide breadcrumbs entirely
   */
  breadcrumbProps?: BreadcrumbProps | false;

  /**
   * Action buttons or elements to display in the header
   * Typically used for primary page actions like "Add", "Edit", etc.
   */
  actions?: React.ReactNode;

  /**
   * Additional CSS classes for the header container
   */
  className?: string;

  /**
   * Whether to show a divider line below the header
   * @default true
   */
  showDivider?: boolean;

  /**
   * Size variant for the title
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg';
}

/**
 * PageHeader Component
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <PageHeader
 *   title="User Management"
 *   description="Manage users and permissions"
 * />
 * 
 * // With actions
 * <PageHeader
 *   title="Users"
 *   description="Manage system users"
 *   actions={
 *     <Button>
 *       <Plus className="h-4 w-4 mr-2" />
 *       Add User
 *     </Button>
 *   }
 * />
 * 
 * // With custom breadcrumbs
 * <PageHeader
 *   title="Edit User"
 *   breadcrumbProps={{
 *     customItems: [
 *       { label: 'Dashboard', href: '/dashboard' },
 *       { label: 'Users', href: '/dashboard/users' },
 *       { label: 'John Doe', href: '/dashboard/users/123' },
 *       { label: 'Edit', href: '/dashboard/users/123/edit' }
 *     ]
 *   }}
 * />
 * 
 * // Without breadcrumbs
 * <PageHeader
 *   title="Dashboard"
 *   breadcrumbProps={false}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  breadcrumbProps,
  actions,
  className = '',
  showDivider = true,
  size = 'default',
}: PageHeaderProps) {
  // Determine title size classes
  const titleSizeClasses = {
    sm: 'text-2xl',
    default: 'text-3xl',
    lg: 'text-4xl',
  };

  const titleClass = titleSizeClasses[size] || titleSizeClasses.default;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumb Navigation */}
      {breadcrumbProps !== false && (
        <Breadcrumb {...(breadcrumbProps || {})} />
      )}

      {/* Page Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Title and Description */}
        <div className="space-y-1 flex-1 min-w-0">
          <h1 className={`${titleClass} font-bold tracking-tight text-foreground`}>
            {title}
          </h1>
          {description && (
            <p className="text-base text-muted-foreground max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Divider */}
      {showDivider && (
        <div className="border-b border-border" />
      )}
    </div>
  );
}

/**
 * Compact PageHeader variant for mobile or constrained spaces
 */
export function PageHeaderCompact({
  title,
  description,
  actions,
  className = '',
}: Omit<PageHeaderProps, 'breadcrumbProps' | 'showDivider' | 'size'>) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * PageHeader with loading state
 */
export function PageHeaderSkeleton({
  showBreadcrumb = true,
  showDescription = true,
  showActions = true,
  className = '',
}: {
  showBreadcrumb?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {/* Breadcrumb skeleton */}
      {showBreadcrumb && (
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      )}

      {/* Title and actions skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-8 w-64 bg-muted rounded" />
          {showDescription && (
            <div className="h-5 w-96 bg-muted rounded" />
          )}
        </div>
        {showActions && (
          <div className="h-10 w-32 bg-muted rounded" />
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-border" />
    </div>
  );
}
