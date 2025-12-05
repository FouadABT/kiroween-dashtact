/**
 * SEO Features Usage Examples
 * 
 * This file demonstrates how to use the SEO optimization features
 * in the Page Metadata System.
 */

import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { generateCanonicalUrl, shouldHaveCanonical } from '@/lib/metadata-helpers';

// ============================================================================
// Example 1: Static Page with Full SEO
// ============================================================================

/**
 * Static page with comprehensive SEO metadata
 * 
 * This example shows a static page with:
 * - Title and description
 * - Open Graph metadata
 * - Twitter Card metadata
 * - Canonical URL
 * - Robots directives
 */
export const analyticsMetadata: Metadata = generatePageMetadata('/dashboard/analytics');

function AnalyticsPageExample() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <p>View detailed analytics and insights</p>
    </div>
  );
}

// ============================================================================
// Example 2: Dynamic Page with Template Resolution
// ============================================================================

/**
 * Dynamic page with user-specific metadata
 * 
 * This example shows how to:
 * - Fetch data for metadata
 * - Resolve template strings
 * - Generate dynamic OG metadata
 */
interface UserPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  // Fetch user data
  const user = await fetchUser(params.id);
  
  // Generate metadata with dynamic values
  return generatePageMetadata('/dashboard/users/:id', {
    userName: user.name,
    userId: params.id,
  });
}

async function UserPageExample({ params }: UserPageProps) {
  const user = await fetchUser(params.id);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>User profile for {user.name}</p>
    </div>
  );
}

// ============================================================================
// Example 3: Private Page (No Index)
// ============================================================================

/**
 * Private page that should not be indexed
 * 
 * This example shows a page with:
 * - noindex robots directive
 * - No canonical URL
 * - Basic metadata only
 */
export const loginMetadata: Metadata = generatePageMetadata('/login');

export function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <p>Sign in to your account</p>
    </div>
  );
}

// ============================================================================
// Example 4: Custom Canonical URL
// ============================================================================

/**
 * Page with custom canonical URL
 * 
 * Useful for:
 * - Consolidating duplicate content
 * - Pointing to preferred URL version
 * - Handling URL parameters
 */
export const customCanonicalMetadata: Metadata = {
  ...generatePageMetadata('/dashboard/users'),
  alternates: {
    canonical: 'https://yourdomain.com/users', // Custom canonical
  },
};

// ============================================================================
// Example 5: Programmatic Canonical URL Generation
// ============================================================================

/**
 * Generate canonical URL programmatically
 */
export function exampleCanonicalGeneration() {
  // Generate canonical URL for current page
  const canonical = generateCanonicalUrl('/dashboard/users/123');
  console.log(canonical); // 'https://yourdomain.com/dashboard/users/123'
  
  // Check if page should have canonical URL
  const shouldInclude = shouldHaveCanonical('/dashboard/users');
  console.log(shouldInclude); // true
  
  const shouldNotInclude = shouldHaveCanonical('/login');
  console.log(shouldNotInclude); // false
  
  return { canonical, shouldInclude, shouldNotInclude };
}

// ============================================================================
// Example 6: Custom Open Graph Image
// ============================================================================

/**
 * Page with custom Open Graph image
 * 
 * Override default OG image for specific pages
 */
export const customOGMetadata: Metadata = {
  ...generatePageMetadata('/dashboard/analytics'),
  openGraph: {
    images: [
      {
        url: '/og-analytics.png',
        width: 1200,
        height: 630,
        alt: 'Analytics Dashboard Preview',
      },
    ],
  },
};

// ============================================================================
// Example 7: Article-Type Open Graph
// ============================================================================

/**
 * Blog post or article with article-type OG metadata
 * 
 * Use for content pages that should appear as articles
 */
export const articleMetadata: Metadata = {
  title: 'How to Use Analytics',
  description: 'A comprehensive guide to using the analytics dashboard',
  openGraph: {
    type: 'article',
    title: 'How to Use Analytics',
    description: 'A comprehensive guide to using the analytics dashboard',
    publishedTime: '2024-01-01T00:00:00Z',
    authors: ['John Doe'],
    tags: ['analytics', 'tutorial', 'guide'],
  },
};

// ============================================================================
// Example 8: Robots Directives
// ============================================================================

/**
 * Different robots configurations for different page types
 */

// Public page - allow indexing
export const publicPageMetadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': 160,
  },
};

// Private page - prevent indexing
export const privatePageMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

// Settings page - no index but follow links
export const settingsPageMetadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    noarchive: true,
  },
};

// ============================================================================
// Example 9: Twitter Card Variations
// ============================================================================

/**
 * Different Twitter Card types
 */

// Summary card (small image)
export const summaryCardMetadata: Metadata = {
  twitter: {
    card: 'summary',
    title: 'Quick Update',
    description: 'Short description for summary card',
  },
};

// Large image card (default)
export const largeImageCardMetadata: Metadata = {
  twitter: {
    card: 'summary_large_image',
    title: 'Featured Content',
    description: 'Description with large image preview',
    images: ['/twitter-large-image.png'],
  },
};

// ============================================================================
// Example 10: Complete SEO Setup
// ============================================================================

/**
 * Complete SEO setup for a landing page
 * 
 * This example includes everything:
 * - Title and description
 * - Keywords
 * - Open Graph metadata
 * - Twitter Card metadata
 * - Canonical URL
 * - Robots directives
 */
export const completeSEOMetadata: Metadata = {
  title: 'Dashboard Application - Professional Analytics Platform',
  description: 'Comprehensive dashboard application with real-time analytics, user management, and customizable themes. Built with Next.js 14 and TypeScript.',
  keywords: ['dashboard', 'analytics', 'admin', 'management', 'next.js', 'typescript'],
  
  // Open Graph
  openGraph: {
    type: 'website',
    title: 'Dashboard Application - Professional Analytics Platform',
    description: 'Comprehensive dashboard application with real-time analytics',
    url: 'https://yourdomain.com',
    siteName: 'Dashboard Application',
    images: [
      {
        url: 'https://yourdomain.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Dashboard Application Preview',
        type: 'image/svg+xml',
      },
    ],
    locale: 'en_US',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@dashboard',
    creator: '@dashboard',
    title: 'Dashboard Application - Professional Analytics Platform',
    description: 'Comprehensive dashboard application with real-time analytics',
    images: ['https://yourdomain.com/og-image.svg'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': 160,
    'max-video-preview': -1,
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://yourdomain.com',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Mock function to fetch user data
 */
async function fetchUser(id: string) {
  // In real app, fetch from API
  return {
    id,
    name: 'John Doe',
    email: 'john@example.com',
  };
}

// ============================================================================
// Testing SEO
// ============================================================================

/**
 * How to test SEO implementation:
 * 
 * 1. View Page Source:
 *    - Right-click page → "View Page Source"
 *    - Look for <meta> tags in <head>
 * 
 * 2. Facebook Sharing Debugger:
 *    - https://developers.facebook.com/tools/debug/
 *    - Enter your URL
 *    - Check OG tags
 * 
 * 3. Twitter Card Validator:
 *    - https://cards-dev.twitter.com/validator
 *    - Enter your URL
 *    - Check Twitter Card preview
 * 
 * 4. Google Search Console:
 *    - https://search.google.com/search-console
 *    - Submit sitemap
 *    - Monitor indexing
 * 
 * 5. Lighthouse SEO Audit:
 *    - Open Chrome DevTools
 *    - Go to Lighthouse tab
 *    - Run SEO audit
 *    - Target score: 90+
 * 
 * 6. robots.txt:
 *    - Visit /robots.txt
 *    - Verify rules
 * 
 * 7. Sitemap:
 *    - Visit /sitemap.xml
 *    - Verify all pages included
 */
