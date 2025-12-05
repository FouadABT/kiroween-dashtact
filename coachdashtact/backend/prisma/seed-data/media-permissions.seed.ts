/**
 * Media Library Permissions Seed Data
 *
 * This file defines permissions for the media library system.
 *
 * Permission Naming Convention:
 * Format: media:{action}:{scope}
 *
 * Actions: view, upload, edit, delete
 * Scopes: (none for own), all (for all files)
 */

import { PermissionDefinition } from './auth.seed';

/**
 * Media library permissions
 * These will be created during database seeding
 */
export const MEDIA_PERMISSIONS: PermissionDefinition[] = [
  // View Permissions
  {
    name: 'media:view',
    resource: 'media',
    action: 'view',
    description: 'View media library and own files',
  },
  {
    name: 'media:view:all',
    resource: 'media',
    action: 'view:all',
    description: 'View all files in media library regardless of ownership',
  },

  // Upload Permission
  {
    name: 'media:upload',
    resource: 'media',
    action: 'upload',
    description: 'Upload files to media library',
  },

  // Edit Permissions
  {
    name: 'media:edit:own',
    resource: 'media',
    action: 'edit:own',
    description: 'Edit metadata of own uploaded files',
  },
  {
    name: 'media:edit:all',
    resource: 'media',
    action: 'edit:all',
    description: 'Edit metadata of any file in media library',
  },

  // Delete Permissions
  {
    name: 'media:delete:own',
    resource: 'media',
    action: 'delete:own',
    description: 'Delete own uploaded files',
  },
  {
    name: 'media:delete:all',
    resource: 'media',
    action: 'delete:all',
    description: 'Delete any file in media library',
  },
];

/**
 * Get media permissions for admin role
 */
export function getAdminMediaPermissions(): string[] {
  return [
    'media:view',
    'media:view:all',
    'media:upload',
    'media:edit:own',
    'media:edit:all',
    'media:delete:own',
    'media:delete:all',
  ];
}

/**
 * Get media permissions for regular user role
 */
export function getUserMediaPermissions(): string[] {
  return [
    'media:view',
    'media:upload',
  ];
}
