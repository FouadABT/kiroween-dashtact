/**
 * Integration Tests: SEO Metadata
 * 
 * Tests Requirements: 3.2, 3.3, 3.4, 3.5
 * 
 * This test suite validates SEO metadata including:
 * - Open Graph tags for social media sharing
 * - Twitter Card tags for Twitter sharing
 * - Structured data (JSON-LD) for rich search results
 * - Canonical URLs to prevent duplicate content
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generatePageMetadata, generateCanonicalUrl, shouldHaveCanonical } from '@/lib/metadata-helpers';
import {
  generateBreadcrumbStructuredData,
  generateArticleStructuredData,
  generateProfileStructuredData,
  generateOrganizationStructuredData,
  generateWebSiteStructuredData,
  structuredDataToJson,
  combineStructuredData,
} from '@/lib/structured-data-helpers';
import type { BreadcrumbItem } from '@/lib/structured-data-helpers';

describe('SEO Metadata Integration Tests', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  describe('Requirement 3.2: Open Graph Tags', () => {
    it('should include Open Graph title for dashboard page', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe('Dashboard Overview');
      expect(typeof metadata.openGraph?.title).toBe('string');
    });

    it('should include Open Graph description for dashboard page', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.openGraph?.description).toBe(
        'Access your personal dashboard with real-time analytics and insights'
      );
    });

    it('should include Open Graph type for website pages', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.openGraph?.type).toBe('website');
    });

    it('should include Open Graph URL for pages', () => {
      const metadata = generatePageMetadata('/dashboard/analytics');

      expect(metadata.openGraph?.url).toBe('https://example.com/dashboard/analytics');
    });

    it('should include Open Graph site name', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.openGraph?.siteName).toBeDefined();
      expect(typeof metadata.openGraph?.siteName).toBe('string');
    });

    it('should include Open Graph images with proper structure', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.openGraph?.images).toBeDefined();
      expect(Array.isArray(metadata.openGraph?.images)).toBe(true);
      
      if (metadata.openGraph?.images && metadata.openGraph.images.length > 0) {
        const image = metadata.openGraph.images[0];
        expect(image).toHaveProperty('url');
        
        if (typeof image === 'object' && image !== null && 'url' in image) {
          expect(typeof image.url).toBe('string');
        }
      }
    });

    it('should include Open Graph locale', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.openGraph?.locale).toBeDefined();
      expect(typeof metadata.openGraph?.locale).toBe('string');
    });

    it('should resolve dynamic values in Open Graph title', () => {
      const metadata = generatePageMetadata('/dashboard/users/123', {
        userName: 'John Doe',
        userId: '123',
      });

      expect(metadata.openGraph?.title).toBe('User Profile: John Doe');
    });

    it('should resolve dynamic values in Open Graph description', () => {
      const metadata = generatePageMetadata('/dashboard/users/123', {
        userName: 'Jane Smith',
        userId: '123',
      });

      expect(metadata.openGraph?.description).toBe(
        'View and manage user profile for Jane Smith'
      );
    });

    it('should fallback to page title if Open Graph title not specified', () => {
      const metadata = generatePageMetadata('/dashboard/settings');

      expect(metadata.openGraph?.title).toBe(metadata.title);
    });

    it('should fallback to page description if Open Graph description not specified', () => {
      const metadata = generatePageMetadata('/dashboard/data');

      expect(metadata.openGraph?.description).toBe(metadata.description);
    });
  });

  describe('Requirement 3.3: Twitter Card Tags', () => {
    it('should include Twitter card type', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    it('should include Twitter site handle', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.twitter?.site).toBeDefined();
      expect(typeof metadata.twitter?.site).toBe('string');
    });

    it('should include Twitter creator handle if configured', () => {
      const metadata = generatePageMetadata('/dashboard');

      // Twitter creator is optional, but if present should be a string
      if (metadata.twitter?.creator) {
        expect(typeof metadata.twitter.creator).toBe('string');
      }
      
      // Verify the field exists in the metadata structure (even if undefined)
      expect(metadata.twitter).toHaveProperty('creator');
    });

    it('should include Twitter title for analytics page', () => {
      const metadata = generatePageMetadata('/dashboard/analytics');

      expect(metadata.twitter?.title).toBe('Analytics Dashboard');
    });

    it('should include Twitter description for analytics page', () => {
      const metadata = generatePageMetadata('/dashboard/analytics');

      expect(metadata.twitter?.description).toBe(
        'Comprehensive analytics and insights for data-driven decisions'
      );
    });

    it('should include Twitter images', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.twitter?.images).toBeDefined();
    });

    it('should resolve dynamic values in Twitter title', () => {
      const metadata = generatePageMetadata('/dashboard/users/456', {
        userName: 'Alice Johnson',
        userId: '456',
      });

      expect(metadata.twitter?.title).toBe('User Profile: Alice Johnson');
    });

    it('should resolve dynamic values in Twitter description', () => {
      const metadata = generatePageMetadata('/dashboard/users/789', {
        userName: 'Bob Wilson',
        userId: '789',
      });

      expect(metadata.twitter?.description).toBe(
        'View and manage user profile for Bob Wilson'
      );
    });

    it('should fallback to page title if Twitter title not specified', () => {
      const metadata = generatePageMetadata('/dashboard/settings');

      expect(metadata.twitter?.title).toBe(metadata.title);
    });

    it('should fallback to page description if Twitter description not specified', () => {
      const metadata = generatePageMetadata('/dashboard/data');

      expect(metadata.twitter?.description).toBe(metadata.description);
    });

    it('should support different Twitter card types', () => {
      const metadata = generatePageMetadata('/dashboard/settings/theme');

      expect(metadata.twitter?.card).toBeDefined();
      expect(['summary', 'summary_large_image', 'app', 'player']).toContain(
        metadata.twitter?.card
      );
    });
  });

  describe('Requirement 3.4: Canonical URLs', () => {
    it('should generate canonical URL for dashboard page', () => {
      const canonical = generateCanonicalUrl('/dashboard');

      expect(canonical).toBe('https://example.com/dashboard');
    });

    it('should generate canonical URL for nested pages', () => {
      const canonical = generateCanonicalUrl('/dashboard/users');

      expect(canonical).toBe('https://example.com/dashboard/users');
    });

    it('should generate canonical URL for dynamic routes', () => {
      const canonical = generateCanonicalUrl('/dashboard/users/123');

      expect(canonical).toBe('https://example.com/dashboard/users/123');
    });

    it('should remove query parameters from canonical URL', () => {
      const canonical = generateCanonicalUrl('/dashboard/users?page=2&sort=name');

      expect(canonical).toBe('https://example.com/dashboard/users');
      expect(canonical).not.toContain('?');
    });

    it('should remove hash fragments from canonical URL', () => {
      const canonical = generateCanonicalUrl('/dashboard/settings#theme');

      expect(canonical).toBe('https://example.com/dashboard/settings');
      expect(canonical).not.toContain('#');
    });

    it('should handle pathname without leading slash', () => {
      const canonical = generateCanonicalUrl('dashboard/analytics');

      expect(canonical).toBe('https://example.com/dashboard/analytics');
    });

    it('should use custom base URL when provided', () => {
      const canonical = generateCanonicalUrl('/dashboard', 'https://custom.com');

      expect(canonical).toBe('https://custom.com/dashboard');
    });

    it('should remove trailing slash from base URL', () => {
      const canonical = generateCanonicalUrl('/dashboard', 'https://example.com/');

      expect(canonical).toBe('https://example.com/dashboard');
    });

    it('should include canonical URL in metadata for public pages', () => {
      const metadata = generatePageMetadata('/dashboard');

      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe('https://example.com/dashboard');
    });

    it('should not include canonical URL for auth pages', () => {
      const shouldHave = shouldHaveCanonical('/login');

      expect(shouldHave).toBe(false);
    });

    it('should not include canonical URL for error pages', () => {
      const shouldHave403 = shouldHaveCanonical('/403');
      const shouldHave404 = shouldHaveCanonical('/404');
      const shouldHave500 = shouldHaveCanonical('/500');

      expect(shouldHave403).toBe(false);
      expect(shouldHave404).toBe(false);
      expect(shouldHave500).toBe(false);
    });

    it('should not include canonical URL for noindex pages', () => {
      const metadata = generatePageMetadata('/login');

      expect(metadata.robots?.index).toBe(false);
      expect(metadata.alternates?.canonical).toBeUndefined();
    });

    it('should include canonical URL for deeply nested pages', () => {
      const canonical = generateCanonicalUrl('/dashboard/settings/theme/colors');

      expect(canonical).toBe('https://example.com/dashboard/settings/theme/colors');
    });
  });

  describe('Requirement 3.5: Structured Data (JSON-LD)', () => {
    describe('Breadcrumb Structured Data', () => {
      it('should generate breadcrumb structured data', () => {
        const breadcrumbs: BreadcrumbItem[] = [
          { label: 'Home', href: '/' },
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/dashboard/users' },
        ];

        const structuredData = generateBreadcrumbStructuredData(breadcrumbs);

        expect(structuredData['@context']).toBe('https://schema.org');
        expect(structuredData['@type']).toBe('BreadcrumbList');
        expect(structuredData.itemListElement).toBeDefined();
        expect(Array.isArray(structuredData.itemListElement)).toBe(true);
      });

      it('should include correct position for each breadcrumb item', () => {
        const breadcrumbs: BreadcrumbItem[] = [
          { label: 'Home', href: '/' },
          { label: 'Users', href: '/dashboard/users' },
        ];

        const structuredData = generateBreadcrumbStructuredData(breadcrumbs);
        const items = structuredData.itemListElement as Array<{
          '@type': string;
          position: number;
          name: string;
          item: string;
        }>;

        expect(items[0].position).toBe(1);
        expect(items[1].position).toBe(2);
      });

      it('should include correct name and URL for breadcrumb items', () => {
        const breadcrumbs: BreadcrumbItem[] = [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Analytics', href: '/dashboard/analytics' },
        ];

        const structuredData = generateBreadcrumbStructuredData(breadcrumbs);
        const items = structuredData.itemListElement as Array<{
          '@type': string;
          position: number;
          name: string;
          item: string;
        }>;

        expect(items[0].name).toBe('Dashboard');
        expect(items[0].item).toBe('https://example.com/dashboard');
        expect(items[1].name).toBe('Analytics');
        expect(items[1].item).toBe('https://example.com/dashboard/analytics');
      });

      it('should convert structured data to JSON string', () => {
        const breadcrumbs: BreadcrumbItem[] = [
          { label: 'Home', href: '/' },
        ];

        const structuredData = generateBreadcrumbStructuredData(breadcrumbs);
        const json = structuredDataToJson(structuredData);

        expect(typeof json).toBe('string');
        expect(() => JSON.parse(json)).not.toThrow();
      });
    });

    describe('Article Structured Data', () => {
      it('should generate article structured data', () => {
        const articleData = generateArticleStructuredData({
          headline: 'How to Build a Dashboard',
          description: 'A comprehensive guide',
          datePublished: '2024-01-15',
        });

        expect(articleData['@context']).toBe('https://schema.org');
        expect(articleData['@type']).toBe('Article');
        expect(articleData.headline).toBe('How to Build a Dashboard');
      });

      it('should include article author information', () => {
        const articleData = generateArticleStructuredData({
          headline: 'Test Article',
          author: {
            name: 'John Doe',
            url: 'https://example.com/authors/john',
          },
        });

        expect(articleData.author).toBeDefined();
        const author = articleData.author as { '@type': string; name: string; url: string };
        expect(author['@type']).toBe('Person');
        expect(author.name).toBe('John Doe');
        expect(author.url).toBe('https://example.com/authors/john');
      });

      it('should include article publisher information', () => {
        const articleData = generateArticleStructuredData({
          headline: 'Test Article',
          publisher: {
            name: 'Dashboard Co',
            logo: {
              url: 'https://example.com/logo.png',
              width: 600,
              height: 60,
            },
          },
        });

        expect(articleData.publisher).toBeDefined();
        const publisher = articleData.publisher as {
          '@type': string;
          name: string;
          logo: { '@type': string; url: string; width: number; height: number };
        };
        expect(publisher['@type']).toBe('Organization');
        expect(publisher.name).toBe('Dashboard Co');
        expect(publisher.logo['@type']).toBe('ImageObject');
      });

      it('should include article dates', () => {
        const articleData = generateArticleStructuredData({
          headline: 'Test Article',
          datePublished: '2024-01-15',
          dateModified: '2024-01-20',
        });

        expect(articleData.datePublished).toBe('2024-01-15');
        expect(articleData.dateModified).toBe('2024-01-20');
      });

      it('should handle article images as array', () => {
        const articleData = generateArticleStructuredData({
          headline: 'Test Article',
          image: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        });

        expect(Array.isArray(articleData.image)).toBe(true);
        const images = articleData.image as string[];
        expect(images).toHaveLength(2);
      });

      it('should convert single image to array', () => {
        const articleData = generateArticleStructuredData({
          headline: 'Test Article',
          image: 'https://example.com/image.jpg',
        });

        expect(Array.isArray(articleData.image)).toBe(true);
        const images = articleData.image as string[];
        expect(images).toHaveLength(1);
      });
    });

    describe('Profile Structured Data', () => {
      it('should generate profile structured data', () => {
        const profileData = generateProfileStructuredData({
          name: 'John Doe',
          email: 'john@example.com',
        });

        expect(profileData['@context']).toBe('https://schema.org');
        expect(profileData['@type']).toBe('Person');
        expect(profileData.name).toBe('John Doe');
        expect(profileData.email).toBe('john@example.com');
      });

      it('should include profile job title and organization', () => {
        const profileData = generateProfileStructuredData({
          name: 'Jane Smith',
          jobTitle: 'Software Engineer',
          worksFor: {
            name: 'Tech Company',
            url: 'https://techcompany.com',
          },
        });

        expect(profileData.jobTitle).toBe('Software Engineer');
        expect(profileData.worksFor).toBeDefined();
        const worksFor = profileData.worksFor as { '@type': string; name: string; url: string };
        expect(worksFor['@type']).toBe('Organization');
        expect(worksFor.name).toBe('Tech Company');
      });

      it('should include profile social media links', () => {
        const profileData = generateProfileStructuredData({
          name: 'Alice Johnson',
          sameAs: [
            'https://twitter.com/alice',
            'https://linkedin.com/in/alice',
          ],
        });

        expect(Array.isArray(profileData.sameAs)).toBe(true);
        const sameAs = profileData.sameAs as string[];
        expect(sameAs).toHaveLength(2);
      });

      it('should include profile image and URL', () => {
        const profileData = generateProfileStructuredData({
          name: 'Bob Wilson',
          image: 'https://example.com/bob.jpg',
          url: 'https://example.com/users/bob',
        });

        expect(profileData.image).toBe('https://example.com/bob.jpg');
        expect(profileData.url).toBe('https://example.com/users/bob');
      });
    });

    describe('Organization Structured Data', () => {
      it('should generate organization structured data', () => {
        const orgData = generateOrganizationStructuredData({
          name: 'Dashboard Company',
          url: 'https://example.com',
        });

        expect(orgData['@context']).toBe('https://schema.org');
        expect(orgData['@type']).toBe('Organization');
        expect(orgData.name).toBe('Dashboard Company');
        expect(orgData.url).toBe('https://example.com');
      });

      it('should include organization logo and description', () => {
        const orgData = generateOrganizationStructuredData({
          name: 'Dashboard Co',
          url: 'https://example.com',
          logo: 'https://example.com/logo.png',
          description: 'Leading dashboard solutions',
        });

        expect(orgData.logo).toBe('https://example.com/logo.png');
        expect(orgData.description).toBe('Leading dashboard solutions');
      });

      it('should include organization contact information', () => {
        const orgData = generateOrganizationStructuredData({
          name: 'Dashboard Co',
          url: 'https://example.com',
          contactPoint: {
            telephone: '+1-555-0123',
            contactType: 'customer service',
            email: 'support@example.com',
          },
        });

        expect(orgData.contactPoint).toBeDefined();
        const contact = orgData.contactPoint as {
          '@type': string;
          telephone: string;
          contactType: string;
          email: string;
        };
        expect(contact['@type']).toBe('ContactPoint');
        expect(contact.telephone).toBe('+1-555-0123');
      });

      it('should include organization social media links', () => {
        const orgData = generateOrganizationStructuredData({
          name: 'Dashboard Co',
          url: 'https://example.com',
          sameAs: [
            'https://twitter.com/dashboardco',
            'https://linkedin.com/company/dashboardco',
          ],
        });

        expect(Array.isArray(orgData.sameAs)).toBe(true);
        const sameAs = orgData.sameAs as string[];
        expect(sameAs).toHaveLength(2);
      });
    });

    describe('WebSite Structured Data', () => {
      it('should generate website structured data', () => {
        const websiteData = generateWebSiteStructuredData(
          'Dashboard App',
          'https://example.com'
        );

        expect(websiteData['@context']).toBe('https://schema.org');
        expect(websiteData['@type']).toBe('WebSite');
        expect(websiteData.name).toBe('Dashboard App');
        expect(websiteData.url).toBe('https://example.com');
      });

      it('should include search action when search URL provided', () => {
        const websiteData = generateWebSiteStructuredData(
          'Dashboard App',
          'https://example.com',
          'https://example.com/search?q={search_term_string}'
        );

        expect(websiteData.potentialAction).toBeDefined();
        const action = websiteData.potentialAction as {
          '@type': string;
          target: { '@type': string; urlTemplate: string };
          'query-input': string;
        };
        expect(action['@type']).toBe('SearchAction');
        expect(action.target.urlTemplate).toContain('{search_term_string}');
      });

      it('should not include search action when search URL not provided', () => {
        const websiteData = generateWebSiteStructuredData(
          'Dashboard App',
          'https://example.com'
        );

        expect(websiteData.potentialAction).toBeUndefined();
      });
    });

    describe('Combined Structured Data', () => {
      it('should combine multiple structured data objects', () => {
        const breadcrumbs = generateBreadcrumbStructuredData([
          { label: 'Home', href: '/' },
        ]);
        const website = generateWebSiteStructuredData(
          'Dashboard App',
          'https://example.com'
        );

        const combined = combineStructuredData([breadcrumbs, website]);

        expect(Array.isArray(combined)).toBe(true);
        expect(combined).toHaveLength(2);
        expect(combined[0]['@type']).toBe('BreadcrumbList');
        expect(combined[1]['@type']).toBe('WebSite');
      });

      it('should convert combined structured data to JSON', () => {
        const breadcrumbs = generateBreadcrumbStructuredData([
          { label: 'Home', href: '/' },
        ]);
        const article = generateArticleStructuredData({
          headline: 'Test Article',
        });

        const combined = combineStructuredData([breadcrumbs, article]);
        const json = JSON.stringify(combined);

        expect(typeof json).toBe('string');
        expect(() => JSON.parse(json)).not.toThrow();
      });
    });
  });

  describe('SEO Metadata Integration', () => {
    it('should include all SEO metadata for public pages', () => {
      const metadata = generatePageMetadata('/dashboard');

      // Open Graph
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.openGraph?.description).toBeDefined();
      expect(metadata.openGraph?.type).toBeDefined();
      expect(metadata.openGraph?.url).toBeDefined();

      // Twitter
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBeDefined();
      expect(metadata.twitter?.title).toBeDefined();
      expect(metadata.twitter?.description).toBeDefined();

      // Canonical
      expect(metadata.alternates?.canonical).toBeDefined();

      // Robots
      expect(metadata.robots).toBeDefined();
      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
    });

    it('should restrict SEO metadata for auth pages', () => {
      const metadata = generatePageMetadata('/login');

      // Should have noindex
      expect(metadata.robots?.index).toBe(false);
      expect(metadata.robots?.follow).toBe(false);

      // Should not have canonical
      expect(metadata.alternates?.canonical).toBeUndefined();

      // Should still have Open Graph and Twitter for sharing
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
    });

    it('should include proper robots directives for different page types', () => {
      const publicPage = generatePageMetadata('/dashboard');
      const authPage = generatePageMetadata('/login');
      const editPage = generatePageMetadata('/dashboard/users/123/edit');

      expect(publicPage.robots?.index).toBe(true);
      expect(authPage.robots?.index).toBe(false);
      expect(editPage.robots?.index).toBe(false);
    });
  });
});
