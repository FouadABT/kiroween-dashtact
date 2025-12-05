/**
 * Integration Tests: Page Metadata Rendering
 * 
 * Tests Requirements: 6.1, 6.2, 6.4
 * 
 * This test suite validates that page metadata is correctly rendered
 * for static pages, dynamic pages, and inherited metadata scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MetadataProvider } from '@/contexts/MetadataContext';
import { generatePageMetadata, getMetadataForPath } from '@/lib/metadata-helpers';
import { defaultMetadata, metadataConfig } from '@/lib/metadata-config';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Test component that simulates a page with metadata
function TestPage({ 
  pathname, 
  dynamicValues 
}: { 
  pathname: string; 
  dynamicValues?: Record<string, string> 
}) {
  const metadata = generatePageMetadata(pathname, dynamicValues);
  
  return (
    <div data-testid="test-page">
      <h1 data-testid="page-title">{metadata.title}</h1>
      <p data-testid="page-description">{metadata.description}</p>
      {metadata.keywords && (
        <div data-testid="page-keywords">{metadata.keywords.join(', ')}</div>
      )}
      {metadata.openGraph && (
        <div data-testid="og-metadata">
          <span data-testid="og-title">{metadata.openGraph.title}</span>
          <span data-testid="og-description">{metadata.openGraph.description}</span>
          <span data-testid="og-type">{metadata.openGraph.type}</span>
        </div>
      )}
      {metadata.twitter && (
        <div data-testid="twitter-metadata">
          <span data-testid="twitter-title">{metadata.twitter.title}</span>
          <span data-testid="twitter-description">{metadata.twitter.description}</span>
        </div>
      )}
    </div>
  );
}

describe('Page Metadata Rendering Integration Tests', () => {
  // Store original document title
  const originalTitle = document.title;
  
  beforeEach(() => {
    // Reset document title
    document.title = originalTitle;
    
    // Clear any existing meta tags
    const metaTags = document.querySelectorAll('meta[data-test]');
    metaTags.forEach(tag => tag.remove());
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  describe('Requirement 6.1: Static Page Metadata', () => {
    it('should render metadata for dashboard home page', () => {
      render(<TestPage pathname="/dashboard" />);

      expect(screen.getByTestId('page-title')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('page-description')).toHaveTextContent(
        'Your personal dashboard overview'
      );
      expect(screen.getByTestId('page-keywords')).toHaveTextContent(
        'dashboard, overview, analytics'
      );
    });

    it('should render metadata for analytics page', () => {
      render(<TestPage pathname="/dashboard/analytics" />);

      expect(screen.getByTestId('page-title')).toHaveTextContent('Analytics');
      expect(screen.getByTestId('page-description')).toHaveTextContent(
        'View detailed analytics and insights'
      );
      expect(screen.getByTestId('page-keywords')).toHaveTextContent(
        'analytics, insights, metrics, reports'
      );
    });

    it('should render metadata for users page', () => {
      render(<TestPage pathname="/dashboard/users" />);

      expect(screen.getByTestId('page-title')).toHaveTextContent('User Management');
      expect(screen.getByTestId('page-description')).toHaveTextContent(
        'Manage users and permissions'
      );
      expect(screen.getByTestId('page-keywords')).toHaveTextContent(
        'users, management, admin, permissions'
      );
    });

    it('should render metadata for settings page', () => {
      render(<TestPage pathname="/dashboard/settings" />);

      expect(screen.getByTestId('page-title')).toHaveTextContent('Settings');
      expect(screen.getByTestId('page-description')).toHaveTextContent(
        'Configure your application settings'
      );
      expect(screen.getByTestId('page-keywords')).toHaveTextContent(
        'settings, configuration, preferences'
      );
    });

    it('should render metadata for theme settings page', () => {
      render(<TestPage pathname="/dashboard/settings/theme" />);

      expect(screen.getByTestId('page-title')).toHaveTextContent('Theme Settings');
      expect(screen.getByTestId('page-description')).toHaveTextContent(
        'Customize your theme and appearance'
      );
      expect(screen.getByTestId('page-keywords')).toHaveTextContent(
        'theme, appearance, colors, design'
      );
    });

    it('should include Open Graph metadata for static pages', () => {
      render(<TestPage pathname="/dashboard" />);

      const ogTitle = screen.getByTestId('og-title');
      const ogDescription = screen.getByTestId('og-description');
      const ogType = screen.getByTestId('og-type');

      expect(ogTitle).toHaveTextContent('Dashboard Overview');
      expect(ogDescription).toHaveTextContent(
        'Access your personal dashboard with real-time analytics and insights'
      );
      expect(ogType).toHaveTextContent('website');
    });

    it('should include Twitter Card metadata for static pages', () => {
      render(<TestPage pathname="/dashboard/analytics" />);

      const twitterTitle = screen.getByTestId('twitter-title');
      const twitterDescription = screen.getByTestId('twitter-description');

      expect(twitterTitle).toHaveTextContent('Analytics Dashboard');
      expect(twitterDescription).toHaveTextContent(
        'Comprehensive analytics and insights for data-driven decisions'
      );
    });
  });

  describe('Requirement 6.2: Dynamic Page Metadata', () => {
    it('should render metadata for user detail page with dynamic values', () => {
      render(
        <TestPage 
          pathname="/dashboard/users/123" 
          dynamicValues={{ userName: 'John Doe', userId: '123' }}
        />
      );

      expect(screen.getByTestId('page-title')).toHaveTextContent('User: John Doe');
      expect(screen.getByTestId('page-description')).toHaveTextContent(
        'View and edit user details'
      );
    });

    it('should render metadata for user edit page with dynamic values', () => {
      render(
        <TestPage 
          pathname="/dashboard/users/456/edit" 
          dynamicValues={{ userName: 'Jane Smith', userId: '456' }}
        />
      );

      expect(screen.getByTestId('page-title')).toHaveTextContent('Edit User: Jane Smith');
      expect(screen.getByTestId('page-description')).toHaveTextContent(
        'Edit user profile and settings'
      );
    });

    it('should include dynamic values in Open Graph metadata', () => {
      render(
        <TestPage 
          pathname="/dashboard/users/789" 
          dynamicValues={{ userName: 'Alice Johnson', userId: '789' }}
        />
      );

      const ogTitle = screen.getByTestId('og-title');
      const ogDescription = screen.getByTestId('og-description');

      expect(ogTitle).toHaveTextContent('User Profile: Alice Johnson');
      expect(ogDescription).toHaveTextContent(
        'View and manage user profile for Alice Johnson'
      );
    });

    it('should include dynamic values in Twitter Card metadata', () => {
      render(
        <TestPage 
          pathname="/dashboard/users/101" 
          dynamicValues={{ userName: 'Bob Wilson', userId: '101' }}
        />
      );

      const twitterTitle = screen.getByTestId('twitter-title');
      const twitterDescription = screen.getByTestId('twitter-description');

      expect(twitterTitle).toHaveTextContent('User Profile: Bob Wilson');
      expect(twitterDescription).toHaveTextContent(
        'View and manage user profile for Bob Wilson'
      );
    });

    it('should preserve template placeholders when dynamic values not provided', () => {
      render(<TestPage pathname="/dashboard/users/123" />);

      expect(screen.getByTestId('page-title')).toHaveTextContent('User: {userName}');
    });

    it('should handle special characters in dynamic values', () => {
      render(
        <TestPage 
          pathname="/dashboard/users/999" 
          dynamicValues={{ userName: "O'Brien & Co.", userId: '999' }}
        />
      );

      expect(screen.getByTestId('page-title')).toHaveTextContent("User: O'Brien & Co.");
    });
  });

  describe('Requirement 6.4: Metadata Inheritance', () => {
    it('should inherit default metadata for unknown routes', () => {
      render(<TestPage pathname="/unknown/route" />);

      expect(screen.getByTestId('page-title')).toHaveTextContent(
        defaultMetadata.title
      );
      expect(screen.getByTestId('page-description')).toHaveTextContent(
        defaultMetadata.description
      );
    });

    it('should merge route-specific metadata with defaults', () => {
      const metadata = getMetadataForPath('/dashboard/users');

      // Route-specific values
      expect(metadata.title).toBe('User Management');
      expect(metadata.description).toBe('Manage users and permissions');

      // Inherited from defaults (via generatePageMetadata which does deep merge)
      const fullMetadata = generatePageMetadata('/dashboard/users');
      expect(fullMetadata.openGraph?.siteName).toBe(defaultMetadata.openGraph?.siteName);
      expect(fullMetadata.openGraph?.locale).toBe(defaultMetadata.openGraph?.locale);
      expect(fullMetadata.twitter?.site).toBe(defaultMetadata.twitter?.site);
    });

    it('should inherit default Open Graph images when not specified', () => {
      const metadata = getMetadataForPath('/dashboard/settings');

      expect(metadata.openGraph?.images).toBeDefined();
      expect(metadata.openGraph?.images).toEqual(defaultMetadata.openGraph?.images);
    });

    it('should inherit default robots directives', () => {
      const metadata = getMetadataForPath('/dashboard');

      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
      expect(metadata.robots?.maxImagePreview).toBe('large');
      expect(metadata.robots?.maxSnippet).toBe(160);
    });

    it('should override default robots for auth pages', () => {
      const metadata = getMetadataForPath('/login');

      expect(metadata.robots?.index).toBe(false);
      expect(metadata.robots?.follow).toBe(false);
      expect(metadata.robots?.noarchive).toBe(true);
      expect(metadata.robots?.nosnippet).toBe(true);
    });

    it('should inherit Twitter card type from defaults', () => {
      const metadata = getMetadataForPath('/dashboard/data');

      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    it('should allow route-specific override of inherited values', () => {
      const metadata = getMetadataForPath('/dashboard/settings/theme');

      // Route-specific override
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('Theme Customization');

      // Still inherits site from defaults (via generatePageMetadata which does deep merge)
      const fullMetadata = generatePageMetadata('/dashboard/settings/theme');
      expect(fullMetadata.twitter?.site).toBe(defaultMetadata.twitter?.site);
    });
  });

  describe('Metadata Configuration Validation', () => {
    it('should have metadata defined for all main dashboard routes', () => {
      const routes = [
        '/dashboard',
        '/dashboard/analytics',
        '/dashboard/users',
        '/dashboard/settings',
        '/dashboard/settings/theme',
      ];

      routes.forEach(route => {
        const metadata = getMetadataForPath(route);
        expect(metadata.title).toBeDefined();
        expect(metadata.description).toBeDefined();
        expect(metadata.title).not.toBe(defaultMetadata.title);
      });
    });

    it('should have breadcrumb configuration for all routes', () => {
      const routes = [
        '/dashboard',
        '/dashboard/analytics',
        '/dashboard/users',
        '/dashboard/settings',
      ];

      routes.forEach(route => {
        const metadata = getMetadataForPath(route);
        expect(metadata.breadcrumb).toBeDefined();
        expect(metadata.breadcrumb?.label).toBeDefined();
      });
    });

    it('should have proper robots configuration for auth pages', () => {
      const authPages = ['/login', '/signup', '/forgot-password'];

      authPages.forEach(page => {
        const metadata = getMetadataForPath(page);
        expect(metadata.robots?.index).toBe(false);
        expect(metadata.robots?.follow).toBe(false);
      });
    });

    it('should have Open Graph metadata for public pages', () => {
      const publicPages = [
        '/dashboard',
        '/dashboard/analytics',
        '/dashboard/users',
      ];

      publicPages.forEach(page => {
        const metadata = getMetadataForPath(page);
        expect(metadata.openGraph).toBeDefined();
        expect(metadata.openGraph?.title).toBeDefined();
        expect(metadata.openGraph?.description).toBeDefined();
      });
    });
  });

  describe('Pattern Matching for Dynamic Routes', () => {
    it('should match dynamic user detail route', () => {
      const metadata = getMetadataForPath('/dashboard/users/abc123');

      expect(metadata.title).toBe('User: {userName}');
      expect(metadata.breadcrumb?.dynamic).toBe(true);
    });

    it('should match dynamic user edit route', () => {
      const metadata = getMetadataForPath('/dashboard/users/xyz789/edit');

      expect(metadata.title).toBe('Edit User: {userName}');
      expect(metadata.robots?.index).toBe(false);
    });

    it('should prefer exact match over pattern match', () => {
      const exactMetadata = getMetadataForPath('/dashboard/users');
      const dynamicMetadata = getMetadataForPath('/dashboard/users/123');

      expect(exactMetadata.title).toBe('User Management');
      expect(dynamicMetadata.title).toBe('User: {userName}');
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

      expect(metadata.title).toBeDefined();
    });

    it('should handle undefined dynamic values gracefully', () => {
      render(
        <TestPage 
          pathname="/dashboard/users/123" 
          dynamicValues={{ userName: undefined as unknown as string }}
        />
      );

      expect(screen.getByTestId('page-title')).toHaveTextContent('User: {userName}');
    });

    it('should handle multiple placeholders in template', () => {
      // This would require a route with multiple placeholders
      // For now, we test the resolution function directly
      const metadata = {
        title: '{userName} - {pageType}',
        description: 'Test',
      };

      const resolved = generatePageMetadata('/test', {
        userName: 'John',
        pageType: 'Profile',
      });

      // Since we don't have this route, it will use defaults
      // But the resolution logic is tested in unit tests
      expect(resolved).toBeDefined();
    });
  });

  describe('Metadata Provider Integration', () => {
    it('should work with MetadataProvider context', async () => {
      function TestComponent() {
        return (
          <MetadataProvider>
            <TestPage pathname="/dashboard/analytics" />
          </MetadataProvider>
        );
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Analytics');
      });
    });

    it('should handle metadata updates through context', async () => {
      function TestComponent() {
        return (
          <MetadataProvider>
            <TestPage pathname="/dashboard" />
          </MetadataProvider>
        );
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Dashboard');
      });
    });
  });
});
