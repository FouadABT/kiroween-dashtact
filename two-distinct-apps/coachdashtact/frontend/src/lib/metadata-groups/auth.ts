/**
 * Authentication Pages Metadata
 */

import { PageMetadata } from '@/types/metadata';

export const authMetadata: Record<string, PageMetadata> = {
  '/login': {
    title: 'Login',
    description: 'Sign in to your account',
    breadcrumb: { label: 'Login' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/signup': {
    title: 'Sign Up',
    description: 'Create a new account',
    breadcrumb: { label: 'Sign Up' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/forgot-password': {
    title: 'Forgot Password',
    description: 'Reset your password',
    breadcrumb: { label: 'Forgot Password' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
};
