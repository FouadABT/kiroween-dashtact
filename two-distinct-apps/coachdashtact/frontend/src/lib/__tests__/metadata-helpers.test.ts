/**
 * Metadata Helpers Unit Tests
 * 
 * Tests for metadata generation, template resolution, and helper functions.
 * 
 * Requirements tested:
 * - 1.1: Centralized metadata configuration
 * - 1.3: Dynamic metadata values based on route parameters
 * - 4.3: Template strings with placeholders for dynamic values
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generatePageMetadata,
  getMetadataForPath,
  resolveMetadataTemplate,
  extractDynamicValues,
  findMatchingPattern,
} from '../metadata-helpers';
import { defaultMetadata } from '../metadata-config';
import { PageMetadata } from '@/types/metadata';

describe('Metadata Helpers Unit Tests', () => {
  // Store original env
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set test environment
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  afterEach(() => {
    // Restore original env
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  describe('generatePageMetadata', () => {
    it('should generate metadata for static page', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.title).toBe('Dashboard');
      expect(metadata.description).toBe('Your personal dashboard overview');
      expect(metadata.keywords).toContain('dashboard');
      expect(metadata.keywords).toContain('overview');
    });

    it('should include Open Graph metadata', () => {
      const metadata = generatePageMetadata('/dashboard/users');

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe('User Management');
      expect(metadata.openGraph?.description).toBe('Manage users and permissions');
      expect(metadata.openGraph?.url).toBe('https://example.com/dashboard/users');
    });

    it('should include Twitter Card metadata', () => {
      const metadata = generatePageMetadata('/dashboard/analytics');

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.title).toBe('Analytics');
      expect(metadata.twitter?.description).toBe('View detailed analytics and insights');
    });

    it('should include robots directives', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.robots).toBeDefined();
      // Robots can be string or object in Next.js
      if (metadata.robots && typeof metadata.robots === 'object') {
        expect(metadata.robots.index).toBe(true);
        expect(metadata.robots.follow).toBe(true);
      }
    });

    it('should set noindex for auth pages', () => {
      const metadata = generatePageMetadata('/login');

      expect(metadata.robots).toBeDefined();
      if (metadata.robots && typeof metadata.robots === 'object') {
        expect(metadata.robots.index).toBe(false);
        expect(metadata.robots.follow).toBe(false);
      }
    });

    it('should include canonical URL', () => {
      const metadata = generatePageMetadata('/dashboard/settings');

      expect(metadata.alternates?.canonical).toBe('https://example.com/dashboard/settings');
    });

    it('should resolve dynamic values in templates', () => {
      const metadata = generatePageMetadata('/dashboard/users/123', {
        userName: 'John Doe',
        userId: '123',
      });

      expect(metadata.title).toBe('User: John Doe');
      expect(metadata.description).toBe('View and edit user details');
    });

    it('should use default metadata for unknown routes', () => {
      const metadata = generatePageMetadata('/unknown/route');

      expect(metadata.title).toBe(defaultMetadata.title);
      expect(metadata.description).toBe(defaultMetadata.description);
    });

    it('should merge default and route-specific metadata', () => {
      const metadata = generatePageMetadata('/dashboard/users');

      // Should have route-specific title
      expect(metadata.title).toBe('User Management');
      
      // Should have default Open Graph images
      expect(metadata.openGraph?.images).toBeDefined();
    });
  });

  describe('getMetadataForPath', () => {
    it('should return exact match for static routes', () => {
      const metadata = getMetadataForPath('/dashboard');

      expect(metadata.title).toBe('Dashboard');
      expect(metadata.breadcrumb?.label).toBe('Dashboard');
    });

    it('should return pattern match for dynamic routes', () => {
      const metadata = getMetadataForPath('/dashboard/users/123');

      expect(metadata.title).toBe('User: {userName}');
      expect(metadata.breadcrumb?.label).toBe('{userName}');
      expect(metadata.breadcrumb?.dynamic).toBe(true);
    });

    it('should return default metadata for unknown routes', () => {
      const metadata = getMetadataForPath('/unknown/route');

      expect(metadata.title).toBe(defaultMetadata.title);
      expect(metadata.description).toBe(defaultMetadata.description);
    });

    it('should merge default and route-specific metadata', () => {
      const metadata = getMetadataForPath('/dashboard/analytics');

      // Route-specific
      expect(metadata.title).toBe('Analytics');
      
      // From defaults
      expect(metadata.openGraph?.siteName).toBe(defaultMetadata.openGraph?.siteName);
      expect(metadata.robots?.index).toBe(true);
    });
  });

  describe('resolveMetadataTemplate', () => {
    it('should resolve title template', () => {
      const metadata: PageMetadata = {
        title: 'User: {userName}',
        description: 'Test description',
      };

      const resolved = resolveMetadataTemplate(metadata, { userName: 'John Doe' });

      expect(resolved.title).toBe('User: John Doe');
    });

    it('should resolve description template', () => {
      const metadata: PageMetadata = {
        title: 'Test',
        description: 'Profile for {userName}',
      };

      const resolved = resolveMetadataTemplate(metadata, { userName: 'Jane Smith' });

      expect(resolved.description).toBe('Profile for Jane Smith');
    });

    it('should resolve breadcrumb label template', () => {
      const metadata: PageMetadata = {
        title: 'Test',
        description: 'Test',
        breadcrumb: {
          label: '{userName}',
          dynamic: true,
        },
      };

      const resolved = resolveMetadataTemplate(metadata, { userName: 'Alice' });

      expect(resolved.breadcrumb?.label).toBe('Alice');
    });

    it('should resolve Open Graph title template', () => {
      const metadata: PageMetadata = {
        title: 'Test',
        description: 'Test',
        openGraph: {
          title: 'OG: {userName}',
          description: 'Test OG',
        },
      };

      const resolved = resolveMetadataTemplate(metadata, { userName: 'Bob' });

      expect(resolved.openGraph?.title).toBe('OG: Bob');
    });

    it('should resolve Twitter title template', () => {
      const metadata: PageMetadata = {
        title: 'Test',
        description: 'Test',
        twitter: {
          title: 'Twitter: {userName}',
          description: 'Test Twitter',
        },
      };

      const resolved = resolveMetadataTemplate(metadata, { userName: 'Charlie' });

      expect(resolved.twitter?.title).toBe('Twitter: Charlie');
    });

    it('should preserve placeholders when values not provided', () => {
      const metadata: PageMetadata = {
        title: 'User: {userName}',
        description: 'Test',
      };

      const resolved = resolveMetadataTemplate(metadata, {});

      expect(resolved.title).toBe('User: {userName}');
    });

    it('should handle multiple placeholders', () => {
      const metadata: PageMetadata = {
        title: '{userName} - {pageType}',
        description: 'Test',
      };

      const resolved = resolveMetadataTemplate(metadata, {
        userName: 'John',
        pageType: 'Profile',
      });

      expect(resolved.title).toBe('John - Profile');
    });

    it('should return unchanged metadata when no values provided', () => {
      const metadata: PageMetadata = {
        title: 'Static Title',
        description: 'Static Description',
      };

      const resolved = resolveMetadataTemplate(metadata);

      expect(resolved.title).toBe('Static Title');
      expect(resolved.description).toBe('Static Description');
    });
  });

  describe('extractDynamicValues', () => {
    it('should extract single parameter', () => {
      const values = extractDynamicValues('/dashboard/users/123', '/dashboard/users/:id');

      expect(values).toEqual({ id: '123' });
    });

    it('should extract multiple parameters', () => {
      const values = extractDynamicValues(
        '/dashboard/users/123/posts/456',
        '/dashboard/users/:userId/posts/:postId'
      );

      expect(values).toEqual({ userId: '123', postId: '456' });
    });

    it('should return empty object for non-matching paths', () => {
      const values = extractDynamicValues('/dashboard/users', '/dashboard/users/:id');

      expect(values).toEqual({});
    });

    it('should return empty object for static routes', () => {
      const values = extractDynamicValues('/dashboard', '/dashboard');

      expect(values).toEqual({});
    });

    it('should handle complex patterns', () => {
      const values = extractDynamicValues(
        '/dashboard/users/123/edit',
        '/dashboard/users/:id/edit'
      );

      expect(values).toEqual({ id: '123' });
    });
  });

  describe('findMatchingPattern', () => {
    it('should return exact match for static routes', () => {
      const pattern = findMatchingPattern('/dashboard');

      expect(pattern).toBe('/dashboard');
    });

    it('should return pattern for dynamic routes', () => {
      const pattern = findMatchingPattern('/dashboard/users/123');

      expect(pattern).toBe('/dashboard/users/:id');
    });

    it('should return null for unknown routes', () => {
      const pattern = findMatchingPattern('/unknown/route');

      expect(pattern).toBeNull();
    });

    it('should match nested dynamic routes', () => {
      const pattern = findMatchingPattern('/dashboard/users/123/edit');

      expect(pattern).toBe('/dashboard/users/:id/edit');
    });

    it('should prefer exact matches over patterns', () => {
      const pattern = findMatchingPattern('/dashboard/users');

      expect(pattern).toBe('/dashboard/users');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pathname', () => {
      const metadata = getMetadataForPath('');

      expect(metadata).toBeDefined();
      expect(metadata.title).toBe(defaultMetadata.title);
    });

    it('should handle pathname with trailing slash', () => {
      const metadata = getMetadataForPath('/dashboard/');

      // Should still match /dashboard
      expect(metadata.title).toBeDefined();
    });

    it('should handle special characters in dynamic values', () => {
      const metadata: PageMetadata = {
        title: 'User: {userName}',
        description: 'Test',
      };

      const resolved = resolveMetadataTemplate(metadata, {
        userName: "O'Brien & Co.",
      });

      expect(resolved.title).toBe("User: O'Brien & Co.");
    });

    it('should handle undefined dynamic values gracefully', () => {
      const metadata: PageMetadata = {
        title: 'User: {userName}',
        description: 'Test',
      };

      const resolved = resolveMetadataTemplate(metadata, {
        userName: undefined as unknown as string,
      });

      expect(resolved.title).toBe('User: {userName}');
    });
  });
});
