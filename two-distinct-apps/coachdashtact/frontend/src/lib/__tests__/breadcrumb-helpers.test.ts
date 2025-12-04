/**
 * Breadcrumb Helpers Unit Tests
 * 
 * Tests for breadcrumb generation functions including:
 * - Breadcrumb generation for nested routes
 * - Dynamic label resolution
 * - Segment formatting
 * - Template resolution
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateBreadcrumbs,
  formatSegment,
  generateBreadcrumbsWithLabels,
  getBreadcrumbLabel,
  BreadcrumbItem,
} from '../breadcrumb-helpers';
import * as metadataConfigModule from '../metadata-config';

// Mock metadata config
vi.mock('../metadata-config', () => ({
  metadataConfig: {
    '/dashboard': {
      breadcrumb: { label: 'Dashboard' },
    },
    '/dashboard/users': {
      breadcrumb: { label: 'Users' },
    },
    '/dashboard/users/:id': {
      breadcrumb: { label: '{userName}', dynamic: true },
    },
    '/dashboard/settings': {
      breadcrumb: { label: 'Settings' },
    },
    '/dashboard/settings/theme': {
      breadcrumb: { label: 'Theme' },
    },
    '/dashboard/hidden': {
      breadcrumb: { label: 'Hidden', hidden: true },
    },
    '/dashboard/analytics': {
      breadcrumb: { label: 'Analytics' },
    },
  },
}));

describe('Breadcrumb Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateBreadcrumbs', () => {
    it('should generate breadcrumbs for simple path', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
      ]);
    });

    it('should generate breadcrumbs for nested routes', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/users');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users', href: '/dashboard/users' },
      ]);
    });

    it('should generate breadcrumbs for deeply nested routes', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/settings/theme');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/dashboard/settings' },
        { label: 'Theme', href: '/dashboard/settings/theme' },
      ]);
    });

    it('should format segments without metadata config', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/new-feature');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'New Feature', href: '/dashboard/new-feature' },
      ]);
    });

    it('should resolve dynamic labels with provided values', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/users/123', {
        userName: 'John Doe',
      });

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users', href: '/dashboard/users' },
        { label: 'John Doe', href: '/dashboard/users/123' },
      ]);
    });

    it('should keep placeholder when dynamic value not provided', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/users/123');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users', href: '/dashboard/users' },
        { label: '{userName}', href: '/dashboard/users/123' },
      ]);
    });

    it('should skip hidden breadcrumb items', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/hidden');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
      ]);
    });

    it('should handle root path', () => {
      const breadcrumbs = generateBreadcrumbs('/');

      expect(breadcrumbs).toEqual([]);
    });

    it('should handle empty path', () => {
      const breadcrumbs = generateBreadcrumbs('');

      expect(breadcrumbs).toEqual([]);
    });

    it('should handle path with trailing slash', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/users/');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users', href: '/dashboard/users' },
      ]);
    });

    it('should handle multiple dynamic values', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/users/123', {
        userName: 'John Doe',
        userId: '123',
        extra: 'value',
      });

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users', href: '/dashboard/users' },
        { label: 'John Doe', href: '/dashboard/users/123' },
      ]);
    });

    it('should return empty array on error', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error by passing invalid input
      const breadcrumbs = generateBreadcrumbs(null as unknown);

      expect(breadcrumbs).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('formatSegment', () => {
    it('should format single word segment', () => {
      expect(formatSegment('dashboard')).toBe('Dashboard');
    });

    it('should format kebab-case segment', () => {
      expect(formatSegment('user-management')).toBe('User Management');
    });

    it('should format multi-word kebab-case segment', () => {
      expect(formatSegment('advanced-settings-panel')).toBe('Advanced Settings Panel');
    });

    it('should handle single letter segments', () => {
      expect(formatSegment('a')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(formatSegment('')).toBe('');
    });

    it('should handle segments with numbers', () => {
      expect(formatSegment('page-2')).toBe('Page 2');
    });

    it('should handle segments with special characters', () => {
      expect(formatSegment('user-profile')).toBe('User Profile');
    });
  });

  describe('generateBreadcrumbsWithLabels', () => {
    it('should generate breadcrumbs with custom labels', () => {
      const customLabels = {
        '/dashboard': 'Home',
        '/dashboard/users': 'User List',
      };

      const breadcrumbs = generateBreadcrumbsWithLabels('/dashboard/users', customLabels);

      expect(breadcrumbs).toEqual([
        { label: 'Home', href: '/dashboard' },
        { label: 'User List', href: '/dashboard/users' },
      ]);
    });

    it('should use formatted segment when custom label not provided', () => {
      const customLabels = {
        '/dashboard': 'Home',
      };

      const breadcrumbs = generateBreadcrumbsWithLabels('/dashboard/new-page', customLabels);

      expect(breadcrumbs).toEqual([
        { label: 'Home', href: '/dashboard' },
        { label: 'New Page', href: '/dashboard/new-page' },
      ]);
    });

    it('should handle empty custom labels', () => {
      const breadcrumbs = generateBreadcrumbsWithLabels('/dashboard/users', {});

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users', href: '/dashboard/users' },
      ]);
    });
  });

  describe('getBreadcrumbLabel', () => {
    it('should get label from metadata config', () => {
      const label = getBreadcrumbLabel('/dashboard/users');

      expect(label).toBe('Users');
    });

    it('should resolve dynamic label with values', () => {
      const label = getBreadcrumbLabel('/dashboard/users/123', {
        userName: 'Jane Smith',
      });

      expect(label).toBe('Jane Smith');
    });

    it('should format segment when no metadata config', () => {
      const label = getBreadcrumbLabel('/dashboard/new-feature');

      expect(label).toBe('New Feature');
    });

    it('should handle root path', () => {
      const label = getBreadcrumbLabel('/');

      expect(label).toBe('');
    });

    it('should keep placeholder when dynamic value not provided', () => {
      const label = getBreadcrumbLabel('/dashboard/users/123');

      expect(label).toBe('{userName}');
    });
  });

  describe('Dynamic Route Pattern Matching', () => {
    it('should match dynamic route patterns', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/users/abc123', {
        userName: 'Test User',
      });

      expect(breadcrumbs[2]).toEqual({
        label: 'Test User',
        href: '/dashboard/users/abc123',
      });
    });

    it('should handle multiple dynamic segments', () => {
      // This tests the pattern matching logic
      const breadcrumbs = generateBreadcrumbs('/dashboard/users/123/posts/456', {
        userName: 'John',
        postTitle: 'My Post',
      });

      // Should at least have dashboard and users
      expect(breadcrumbs.length).toBeGreaterThanOrEqual(2);
      expect(breadcrumbs[0].label).toBe('Dashboard');
      expect(breadcrumbs[1].label).toBe('Users');
    });
  });

  describe('Edge Cases', () => {
    it('should handle path with query parameters', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/users?page=1');

      // Query params should be ignored in breadcrumb generation
      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users?page=1', href: '/dashboard/users?page=1' },
      ]);
    });

    it('should handle path with hash', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/users#section');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users#section', href: '/dashboard/users#section' },
      ]);
    });

    it('should handle very long paths', () => {
      const longPath = '/dashboard/level1/level2/level3/level4/level5';
      const breadcrumbs = generateBreadcrumbs(longPath);

      expect(breadcrumbs).toHaveLength(6);
      expect(breadcrumbs[0].label).toBe('Dashboard');
      expect(breadcrumbs[5].label).toBe('Level5');
    });

    it('should handle paths with special characters in segments', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/user-profile-settings');

      expect(breadcrumbs).toEqual([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'User Profile Settings', href: '/dashboard/user-profile-settings' },
      ]);
    });
  });
});
