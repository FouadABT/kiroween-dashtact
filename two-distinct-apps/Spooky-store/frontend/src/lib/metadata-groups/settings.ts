/**
 * Settings Pages Metadata
 */

import { PageMetadata } from '@/types/metadata';

export const settingsMetadata: Record<string, PageMetadata> = {
  '/dashboard/settings': {
    title: 'Settings',
    description: 'Configure your application settings',
    keywords: ['settings', 'configuration', 'preferences'],
    breadcrumb: { label: 'Settings' },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/dashboard/settings/theme': {
    title: 'Theme Settings',
    description: 'Customize your theme and appearance',
    keywords: ['theme', 'appearance', 'colors', 'design'],
    breadcrumb: { label: 'Theme' },
    openGraph: {
      title: 'Theme Customization',
      description: 'Customize colors, typography, and appearance settings',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Theme Customization',
      description: 'Customize colors, typography, and appearance settings',
    },
  },

  '/dashboard/settings/profile': {
    title: 'Profile Settings',
    description: 'Manage your profile information',
    keywords: ['profile', 'settings', 'account'],
    breadcrumb: { label: 'Profile' },
  },

  '/dashboard/settings/security': {
    title: 'Security Settings',
    description: 'Manage your security and authentication settings',
    keywords: ['security', 'password', 'authentication'],
    breadcrumb: { label: 'Security' },
  },

  '/dashboard/settings/notifications': {
    title: 'Notification Settings',
    description: 'Configure your notification preferences',
    keywords: ['notifications', 'alerts', 'preferences'],
    breadcrumb: { label: 'Notifications' },
  },
};
