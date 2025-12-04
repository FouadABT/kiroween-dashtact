/**
 * Integration Tests: Custom Page Metadata
 * 
 * Tests Requirements: 8.1, 8.2, 8.4, 8.5
 * 
 * This test suite validates custom page metadata integration including:
 * - Dynamic metadata generation from page data
 * - Open Graph tags with featured images
 * - Twitter Card tags
 * - Breadcrumb structured data for page hierarchy
 * - Robots directives based on page status and visibility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generatePageDynamicValues,
  generateCustomPageMetadata,
  generatePageBreadcrumbs,
} from '@/lib/metadata-helpers';
import { generateBreadcrumbStructuredData } from '@/lib/structured-data-helpers';

describe('Custom Page Metadata Integration Tests', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  describe('Requirement 8.1: Generate metadata from page data', () => {
    it('should generate dynamic values from page data', () => {
      const page = {
        title: 'About Us',
        slug: 'about',
        excerpt: 'Learn more about our company',
        metaTitle: 'About Us - Company Info',
        metaDescription: 'Discover our mission and values',
        metaKeywords: 'about, company, mission',
        featuredImage: '/images/about.jpg',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const values = generatePageDynamicValues(page);

      expect(values.pageTitle).toBe('About Us');
      expect(values.pageDescription).toBe('Learn more about our company');
      expect(values.pageMetaTitle).toBe('About Us - Company Info');
      expect(values.pageMetaDescription).toBe('Discover our mission and values');
      expect(values.pageKeywords).toBe('about, company, mission');
      expect(values.pageImage).toBe('https://example.com/images/about.jpg');
      expect(values.pageSlug).toBe('about');
    });

    it('should fallback to title when metaTitle is not provided', () => {
      const page = {
        title: 'Contact',
        slug: 'contact',
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const values = generatePageDynamicValues(page);

      expect(values.pageMetaTitle).toBe('Contact');
    });

    it('should fallback to excerpt when metaDescription is not provided', () => {
      const page = {
        title: 'Services',
        slug: 'services',
        excerpt: 'Our professional services',
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const values = generatePageDynamicValues(page);

      expect(values.pageMetaDescription).toBe('Our professional services');
    });

    it('should generate description when both metaDescription and excerpt are missing', () => {
      const page = {
        title: 'Portfolio',
        slug: 'portfolio',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const values = generatePageDynamicValues(page);

      expect(values.pageMetaDescription).toBe('Read more about Portfolio');
    });

    it('should use default OG image when featuredImage is not provided', () => {
      const page = {
        title: 'Team',
        slug: 'team',
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const values = generatePageDynamicValues(page);

      expect(values.pageImage).toBe('https://example.com/og-image.svg');
    });

    it('should convert relative image URLs to absolute URLs', () => {
      const page = {
        title: 'Blog',
        slug: 'blog',
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: '/uploads/blog-header.jpg',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const values = generatePageDynamicValues(page);

      expect(values.pageImage).toBe('https://example.com/uploads/blog-header.jpg');
    });

    it('should keep absolute image URLs unchanged', () => {
      const page = {
        title: 'News',
        slug: 'news',
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: 'https://cdn.example.com/news.jpg',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const values = generatePageDynamicValues(page);

      expect(values.pageImage).toBe('https://cdn.example.com/news.jpg');
    });
  });

  describe('Requirement 8.2: Generate Open Graph and Twitter Card tags', () => {
    it('should generate complete metadata for published public page', () => {
      const page = {
        title: 'About Us',
        slug: 'about',
        excerpt: 'Learn about our company',
        metaTitle: 'About Us - Company',
        metaDescription: 'Discover our mission',
        metaKeywords: 'about, company',
        featuredImage: '/images/about.jpg',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/about');

      expect(metadata.title).toBe('About Us');
      expect(metadata.description).toBe('Learn about our company');
    });

    it('should include Open Graph tags with featured image', () => {
      const page = {
        title: 'Services',
        slug: 'services',
        excerpt: 'Our services',
        metaTitle: 'Services - Company',
        metaDescription: 'Professional services',
        metaKeywords: null,
        featuredImage: '/images/services.jpg',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/services');

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe('Services - Company');
      expect(metadata.openGraph?.description).toBe('Professional services');
      expect(metadata.openGraph?.images).toBeDefined();
      
      if (metadata.openGraph?.images && Array.isArray(metadata.openGraph.images)) {
        const image = metadata.openGraph.images[0];
        if (typeof image === 'object' && image !== null && 'url' in image) {
          expect(image.url).toContain('/images/services.jpg');
          expect(image.width).toBe(1200);
          expect(image.height).toBe(630);
          expect(image.alt).toBe('Services');
        }
      }
    });

    it('should include Twitter Card tags', () => {
      const page = {
        title: 'Contact',
        slug: 'contact',
        excerpt: 'Get in touch',
        metaTitle: 'Contact Us',
        metaDescription: 'Contact our team',
        metaKeywords: null,
        featuredImage: '/images/contact.jpg',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/contact');

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('Contact Us');
      expect(metadata.twitter?.description).toBe('Contact our team');
      expect(metadata.twitter?.images).toBeDefined();
    });

    it('should use default OG image when no featured image', () => {
      const page = {
        title: 'Privacy Policy',
        slug: 'privacy',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/privacy');

      if (metadata.openGraph?.images && Array.isArray(metadata.openGraph.images)) {
        const image = metadata.openGraph.images[0];
        if (typeof image === 'object' && image !== null && 'url' in image) {
          expect(image.url).toContain('og-image.svg');
        }
      }
    });
  });

  describe('Requirement 8.4: Breadcrumb structured data for page hierarchy', () => {
    it('should generate breadcrumbs for top-level page', () => {
      const page = {
        title: 'About Us',
        slug: 'about',
        parentPage: null,
      };

      const breadcrumbs = generatePageBreadcrumbs(page, ['about']);

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'About Us', href: '/about' });
    });

    it('should generate breadcrumbs for nested page', () => {
      const page = {
        title: 'Our Team',
        slug: 'team',
        parentPage: {
          title: 'About Us',
          slug: 'about',
        },
      };

      const breadcrumbs = generatePageBreadcrumbs(page, ['about', 'team']);

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'About Us', href: '/about' });
      expect(breadcrumbs[2]).toEqual({ label: 'Our Team', href: '/about/team' });
    });

    it('should generate structured data from breadcrumbs', () => {
      const page = {
        title: 'Contact',
        slug: 'contact',
        parentPage: {
          title: 'Company',
          slug: 'company',
        },
      };

      const breadcrumbs = generatePageBreadcrumbs(page, ['company', 'contact']);
      const structuredData = generateBreadcrumbStructuredData(breadcrumbs);

      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('BreadcrumbList');
      expect(structuredData.itemListElement).toBeDefined();
      
      const items = structuredData.itemListElement as Array<{
        '@type': string;
        position: number;
        name: string;
        item: string;
      }>;
      
      expect(items).toHaveLength(3);
      expect(items[0].name).toBe('Home');
      expect(items[1].name).toBe('Company');
      expect(items[2].name).toBe('Contact');
    });

    it('should include correct URLs in breadcrumb structured data', () => {
      const page = {
        title: 'Services',
        slug: 'services',
        parentPage: null,
      };

      const breadcrumbs = generatePageBreadcrumbs(page, ['services']);
      const structuredData = generateBreadcrumbStructuredData(breadcrumbs);

      const items = structuredData.itemListElement as Array<{
        '@type': string;
        position: number;
        name: string;
        item: string;
      }>;

      expect(items[0].item).toBe('https://example.com/');
      expect(items[1].item).toBe('https://example.com/services');
    });
  });

  describe('Requirement 8.5: Robots directives based on page status', () => {
    it('should set index=true for published public pages', () => {
      const page = {
        title: 'About',
        slug: 'about',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/about');

      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
      expect(metadata.robots?.noarchive).toBe(false);
      expect(metadata.robots?.nosnippet).toBe(false);
    });

    it('should set index=false for draft pages', () => {
      const page = {
        title: 'Draft Page',
        slug: 'draft',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'DRAFT',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/draft');

      expect(metadata.robots?.index).toBe(false);
      expect(metadata.robots?.follow).toBe(false);
      expect(metadata.robots?.noarchive).toBe(true);
      expect(metadata.robots?.nosnippet).toBe(true);
    });

    it('should set index=false for private pages', () => {
      const page = {
        title: 'Private Page',
        slug: 'private',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PRIVATE',
      };

      const metadata = generateCustomPageMetadata(page, '/private');

      expect(metadata.robots?.index).toBe(false);
      expect(metadata.robots?.follow).toBe(false);
      expect(metadata.robots?.noarchive).toBe(true);
      expect(metadata.robots?.nosnippet).toBe(true);
    });

    it('should set index=false for archived pages', () => {
      const page = {
        title: 'Archived Page',
        slug: 'archived',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'ARCHIVED',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/archived');

      expect(metadata.robots?.index).toBe(false);
      expect(metadata.robots?.follow).toBe(false);
    });

    it('should include max-image-preview for indexed pages', () => {
      const page = {
        title: 'Public Page',
        slug: 'public',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/public');

      expect(metadata.robots?.['max-image-preview']).toBe('large');
      expect(metadata.robots?.['max-snippet']).toBe(160);
    });

    it('should not include max-image-preview for noindex pages', () => {
      const page = {
        title: 'Draft Page',
        slug: 'draft',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'DRAFT',
        visibility: 'PUBLIC',
      };

      const metadata = generateCustomPageMetadata(page, '/draft');

      expect(metadata.robots?.['max-image-preview']).toBeUndefined();
      expect(metadata.robots?.['max-snippet']).toBeUndefined();
    });
  });

  describe('Integration: Complete metadata for nested pages', () => {
    it('should generate complete metadata for nested page with all fields', () => {
      const page = {
        title: 'Our Team',
        slug: 'team',
        excerpt: 'Meet our talented team members',
        metaTitle: 'Our Team - About Us',
        metaDescription: 'Discover the people behind our success',
        metaKeywords: 'team, people, staff',
        featuredImage: '/images/team.jpg',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        parentPage: {
          title: 'About Us',
          slug: 'about',
        },
      };

      const metadata = generateCustomPageMetadata(page, '/about/team');

      // Basic metadata
      expect(metadata.title).toBe('Our Team');
      expect(metadata.description).toBe('Meet our talented team members');

      // Open Graph
      expect(metadata.openGraph?.title).toBe('Our Team - About Us');
      expect(metadata.openGraph?.description).toBe('Discover the people behind our success');
      expect(metadata.openGraph?.type).toBe('website');

      // Twitter
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('Our Team - About Us');

      // Robots
      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
    });

    it('should handle nested page with minimal data', () => {
      const page = {
        title: 'Contact',
        slug: 'contact',
        excerpt: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        featuredImage: null,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        parentPage: {
          title: 'Company',
          slug: 'company',
        },
      };

      const metadata = generateCustomPageMetadata(page, '/company/contact');

      expect(metadata.title).toBe('Contact');
      expect(metadata.description).toBe('Read more about Contact');
      expect(metadata.robots?.index).toBe(true);
    });
  });
});
