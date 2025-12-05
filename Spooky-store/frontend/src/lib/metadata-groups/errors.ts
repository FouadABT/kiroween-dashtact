/**
 * Error Pages Metadata
 */

import { PageMetadata } from '@/types/metadata';

export const errorsMetadata: Record<string, PageMetadata> = {
  '/403': {
    title: 'Access Denied',
    description: 'You do not have permission to access this page',
    breadcrumb: { label: 'Access Denied' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/404': {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist',
    breadcrumb: { label: 'Not Found' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/500': {
    title: 'Server Error',
    description: 'An unexpected error occurred',
    breadcrumb: { label: 'Error' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
};
