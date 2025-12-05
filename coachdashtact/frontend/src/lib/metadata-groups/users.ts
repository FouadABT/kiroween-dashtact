/**
 * User Management Pages Metadata
 */

import { PageMetadata } from '@/types/metadata';

export const usersMetadata: Record<string, PageMetadata> = {
  '/dashboard/users': {
    title: 'User Management',
    description: 'Manage users and permissions',
    keywords: ['users', 'management', 'admin', 'permissions'],
    breadcrumb: { label: 'Users' },
    openGraph: {
      title: 'User Management',
      description: 'Manage users, roles, and permissions with comprehensive admin tools',
      type: 'website',
    },
    twitter: {
      title: 'User Management',
      description: 'Manage users, roles, and permissions with comprehensive admin tools',
    },
  },

  '/dashboard/users/:id': {
    title: 'User: {userName}',
    description: 'View and edit user details',
    keywords: ['user', 'profile', 'details'],
    breadcrumb: { label: '{userName}', dynamic: true },
    openGraph: {
      title: 'User Profile: {userName}',
      description: 'View and manage user profile for {userName}',
      type: 'profile',
    },
    twitter: {
      title: 'User Profile: {userName}',
      description: 'View and manage user profile for {userName}',
    },
  },

  '/dashboard/users/:id/edit': {
    title: 'Edit User: {userName}',
    description: 'Edit user profile and settings',
    keywords: ['edit', 'user', 'profile'],
    breadcrumb: { label: 'Edit', dynamic: false },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },
};
