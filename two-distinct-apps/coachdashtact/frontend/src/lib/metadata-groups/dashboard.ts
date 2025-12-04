/**
 * Dashboard Pages Metadata
 */

import { PageMetadata } from '@/types/metadata';

export const dashboardMetadata: Record<string, PageMetadata> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Your personal dashboard overview',
    keywords: ['dashboard', 'overview', 'analytics'],
    breadcrumb: { label: 'Dashboard' },
    openGraph: {
      title: 'Dashboard Overview',
      description: 'Access your personal dashboard with real-time analytics and insights',
      type: 'website',
    },
    twitter: {
      title: 'Dashboard Overview',
      description: 'Access your personal dashboard with real-time analytics and insights',
    },
  },

  '/dashboard/analytics': {
    title: 'Analytics',
    description: 'View detailed analytics and insights',
    keywords: ['analytics', 'insights', 'metrics', 'reports'],
    breadcrumb: { label: 'Analytics' },
    openGraph: {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights for data-driven decisions',
      type: 'website',
    },
    twitter: {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights for data-driven decisions',
    },
  },

  '/dashboard/data': {
    title: 'Data Management',
    description: 'Manage your data and records',
    keywords: ['data', 'management', 'records'],
    breadcrumb: { label: 'Data' },
  },

  '/dashboard/permissions': {
    title: 'Permissions',
    description: 'Manage roles and permissions',
    keywords: ['permissions', 'roles', 'access control'],
    breadcrumb: { label: 'Permissions' },
  },

  '/dashboard/design-system': {
    title: 'Design System',
    description: 'Explore the design system and components',
    keywords: ['design system', 'components', 'ui', 'ux'],
    breadcrumb: { label: 'Design System' },
  },
};
