/**
 * Structured Data Helpers
 * 
 * Utilities for generating JSON-LD structured data for SEO optimization.
 * Structured data helps search engines understand page content and enables
 * rich search results (rich snippets, knowledge panels, etc.).
 * 
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

/**
 * Base interface for all structured data types
 */
interface StructuredDataBase {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

/**
 * Breadcrumb item for structured data
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Article structured data properties
 */
export interface ArticleData {
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: {
      url: string;
      width?: number;
      height?: number;
    };
  };
}

/**
 * Profile (Person) structured data properties
 */
export interface ProfileData {
  name: string;
  email?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: {
    name: string;
    url?: string;
  };
  url?: string;
  sameAs?: string[]; // Social media profiles
}

/**
 * Organization structured data properties
 */
export interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[]; // Social media profiles
}

/**
 * Generate generic structured data (JSON-LD)
 * 
 * Base function for creating any type of structured data.
 * 
 * @param type - Schema.org type (e.g., 'Article', 'Person', 'Organization')
 * @param data - Data object with properties for the type
 * @returns Structured data object ready for JSON-LD script tag
 * 
 * @example
 * const structuredData = generateStructuredData('WebSite', {
 *   name: 'My Website',
 *   url: 'https://example.com'
 * });
 */
export function generateStructuredData(
  type: string,
  data: Record<string, unknown>
): StructuredDataBase {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
}

/**
 * Generate breadcrumb structured data (JSON-LD)
 * 
 * Creates BreadcrumbList structured data for search engines.
 * Helps search engines understand site hierarchy and display breadcrumbs in search results.
 * 
 * @param breadcrumbs - Array of breadcrumb items with label and href
 * @returns BreadcrumbList structured data
 * 
 * @example
 * const breadcrumbs = [
 *   { label: 'Home', href: '/' },
 *   { label: 'Users', href: '/dashboard/users' },
 *   { label: 'John Doe', href: '/dashboard/users/123' }
 * ];
 * const structuredData = generateBreadcrumbStructuredData(breadcrumbs);
 * 
 * // Usage in Next.js page:
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
 * />
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: BreadcrumbItem[]
): StructuredDataBase {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return generateStructuredData('BreadcrumbList', {
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  });
}

/**
 * Generate article structured data (JSON-LD)
 * 
 * Creates Article structured data for blog posts, news articles, etc.
 * Enables rich snippets in search results with article metadata.
 * 
 * @param data - Article properties
 * @returns Article structured data
 * 
 * @example
 * const articleData = generateArticleStructuredData({
 *   headline: 'How to Build a Dashboard',
 *   description: 'A comprehensive guide to building dashboards',
 *   image: 'https://example.com/article-image.jpg',
 *   datePublished: '2024-01-15',
 *   dateModified: '2024-01-20',
 *   author: {
 *     name: 'John Doe',
 *     url: 'https://example.com/authors/john-doe'
 *   },
 *   publisher: {
 *     name: 'Dashboard Co',
 *     logo: {
 *       url: 'https://example.com/logo.png',
 *       width: 600,
 *       height: 60
 *     }
 *   }
 * });
 */
export function generateArticleStructuredData(data: ArticleData): StructuredDataBase {
  const structuredData: StructuredDataBase = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
  };

  // Add optional fields if provided
  if (data.description) {
    structuredData.description = data.description;
  }

  if (data.image) {
    structuredData.image = Array.isArray(data.image) ? data.image : [data.image];
  }

  if (data.datePublished) {
    structuredData.datePublished = data.datePublished;
  }

  if (data.dateModified) {
    structuredData.dateModified = data.dateModified;
  }

  if (data.author) {
    structuredData.author = {
      '@type': 'Person',
      name: data.author.name,
      ...(data.author.url && { url: data.author.url }),
    };
  }

  if (data.publisher) {
    structuredData.publisher = {
      '@type': 'Organization',
      name: data.publisher.name,
      ...(data.publisher.logo && {
        logo: {
          '@type': 'ImageObject',
          url: data.publisher.logo.url,
          ...(data.publisher.logo.width && { width: data.publisher.logo.width }),
          ...(data.publisher.logo.height && { height: data.publisher.logo.height }),
        },
      }),
    };
  }

  return structuredData;
}

/**
 * Generate profile (Person) structured data (JSON-LD)
 * 
 * Creates Person structured data for user profiles, author pages, etc.
 * Helps search engines understand person information and display rich results.
 * 
 * @param data - Profile properties
 * @returns Person structured data
 * 
 * @example
 * const profileData = generateProfileStructuredData({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   image: 'https://example.com/john-avatar.jpg',
 *   jobTitle: 'Software Engineer',
 *   worksFor: {
 *     name: 'Tech Company',
 *     url: 'https://techcompany.com'
 *   },
 *   url: 'https://example.com/users/john-doe',
 *   sameAs: [
 *     'https://twitter.com/johndoe',
 *     'https://linkedin.com/in/johndoe'
 *   ]
 * });
 */
export function generateProfileStructuredData(data: ProfileData): StructuredDataBase {
  const structuredData: StructuredDataBase = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
  };

  // Add optional fields if provided
  if (data.email) {
    structuredData.email = data.email;
  }

  if (data.image) {
    structuredData.image = data.image;
  }

  if (data.jobTitle) {
    structuredData.jobTitle = data.jobTitle;
  }

  if (data.worksFor) {
    structuredData.worksFor = {
      '@type': 'Organization',
      name: data.worksFor.name,
      ...(data.worksFor.url && { url: data.worksFor.url }),
    };
  }

  if (data.url) {
    structuredData.url = data.url;
  }

  if (data.sameAs && data.sameAs.length > 0) {
    structuredData.sameAs = data.sameAs;
  }

  return structuredData;
}

/**
 * Generate organization structured data (JSON-LD)
 * 
 * Creates Organization structured data for company/organization pages.
 * Helps search engines understand organization information.
 * 
 * @param data - Organization properties
 * @returns Organization structured data
 * 
 * @example
 * const orgData = generateOrganizationStructuredData({
 *   name: 'Dashboard Company',
 *   url: 'https://example.com',
 *   logo: 'https://example.com/logo.png',
 *   description: 'Leading dashboard solutions provider',
 *   contactPoint: {
 *     telephone: '+1-555-0123',
 *     contactType: 'customer service',
 *     email: 'support@example.com'
 *   },
 *   sameAs: [
 *     'https://twitter.com/dashboardco',
 *     'https://linkedin.com/company/dashboardco'
 *   ]
 * });
 */
export function generateOrganizationStructuredData(
  data: OrganizationData
): StructuredDataBase {
  const structuredData: StructuredDataBase = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
  };

  // Add optional fields if provided
  if (data.logo) {
    structuredData.logo = data.logo;
  }

  if (data.description) {
    structuredData.description = data.description;
  }

  if (data.contactPoint) {
    structuredData.contactPoint = {
      '@type': 'ContactPoint',
      ...(data.contactPoint.telephone && { telephone: data.contactPoint.telephone }),
      ...(data.contactPoint.contactType && { contactType: data.contactPoint.contactType }),
      ...(data.contactPoint.email && { email: data.contactPoint.email }),
    };
  }

  if (data.sameAs && data.sameAs.length > 0) {
    structuredData.sameAs = data.sameAs;
  }

  return structuredData;
}

/**
 * Generate WebSite structured data (JSON-LD)
 * 
 * Creates WebSite structured data with search action for site-wide search.
 * Enables search box in Google search results.
 * 
 * @param siteName - Name of the website
 * @param siteUrl - URL of the website
 * @param searchUrl - URL template for search (use {search_term_string} as placeholder)
 * @returns WebSite structured data
 * 
 * @example
 * const websiteData = generateWebSiteStructuredData(
 *   'Dashboard App',
 *   'https://example.com',
 *   'https://example.com/search?q={search_term_string}'
 * );
 */
export function generateWebSiteStructuredData(
  siteName: string,
  siteUrl: string,
  searchUrl?: string
): StructuredDataBase {
  const structuredData: StructuredDataBase = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  };

  // Add search action if search URL is provided
  if (searchUrl) {
    structuredData.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return structuredData;
}

/**
 * Convert structured data to JSON string for script tag
 * 
 * Helper function to prepare structured data for rendering in a Next.js page.
 * Returns a JSON string ready to be used in a script tag.
 * 
 * @param structuredData - Structured data object
 * @returns JSON string
 * 
 * @example
 * // In a Next.js page component:
 * export default function Page() {
 *   const breadcrumbs = [
 *     { label: 'Home', href: '/' },
 *     { label: 'Users', href: '/users' }
 *   ];
 *   const structuredData = generateBreadcrumbStructuredData(breadcrumbs);
 *   
 *   return (
 *     <>
 *       <script
 *         type="application/ld+json"
 *         dangerouslySetInnerHTML={{ __html: structuredDataToJson(structuredData) }}
 *       />
 *       <div>Page content...</div>
 *     </>
 *   );
 * }
 */
export function structuredDataToJson(structuredData: StructuredDataBase): string {
  return JSON.stringify(structuredData);
}

/**
 * Combine multiple structured data objects into an array
 * 
 * Useful when a page needs multiple types of structured data.
 * 
 * @param structuredDataArray - Array of structured data objects
 * @returns Combined structured data array
 * 
 * @example
 * const breadcrumbs = generateBreadcrumbStructuredData([...]);
 * const article = generateArticleStructuredData({...});
 * const combined = combineStructuredData([breadcrumbs, article]);
 * 
 * // Render:
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(combined) }}
 * />
 */
export function combineStructuredData(
  structuredDataArray: StructuredDataBase[]
): StructuredDataBase[] {
  return structuredDataArray;
}

/**
 * Product structured data properties
 */
export interface ProductData {
  name: string;
  description?: string;
  image?: string | string[];
  brand?: string;
  sku?: string;
  price: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued';
  url?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  offers?: {
    price: number;
    priceCurrency: string;
    availability: string;
    url?: string;
  };
}

/**
 * Generate product structured data (JSON-LD)
 * 
 * Creates Product structured data for e-commerce product pages.
 * Enables rich snippets in search results with product information, pricing, and availability.
 * 
 * @param data - Product properties
 * @returns Product structured data
 * 
 * @example
 * const productData = generateProductStructuredData({
 *   name: 'Wireless Headphones',
 *   description: 'Premium wireless headphones with noise cancellation',
 *   image: ['https://example.com/headphones-1.jpg', 'https://example.com/headphones-2.jpg'],
 *   brand: 'AudioTech',
 *   sku: 'WH-1000XM4',
 *   price: 299.99,
 *   priceCurrency: 'USD',
 *   availability: 'InStock',
 *   url: 'https://example.com/shop/wireless-headphones',
 *   aggregateRating: {
 *     ratingValue: 4.5,
 *     reviewCount: 128
 *   }
 * });
 */
export function generateProductStructuredData(data: ProductData): StructuredDataBase {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const currency = data.priceCurrency || 'USD';
  
  const structuredData: StructuredDataBase = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
  };

  // Add optional fields if provided
  if (data.description) {
    structuredData.description = data.description;
  }

  if (data.image) {
    structuredData.image = Array.isArray(data.image) ? data.image : [data.image];
  }

  if (data.brand) {
    structuredData.brand = {
      '@type': 'Brand',
      name: data.brand,
    };
  }

  if (data.sku) {
    structuredData.sku = data.sku;
  }

  // Add offers (required for product rich snippets)
  const availabilityMap: Record<string, string> = {
    InStock: 'https://schema.org/InStock',
    OutOfStock: 'https://schema.org/OutOfStock',
    PreOrder: 'https://schema.org/PreOrder',
    Discontinued: 'https://schema.org/Discontinued',
  };

  structuredData.offers = {
    '@type': 'Offer',
    price: data.price.toFixed(2),
    priceCurrency: currency,
    availability: availabilityMap[data.availability || 'InStock'],
    url: data.url || baseUrl,
  };

  // Add aggregate rating if provided
  if (data.aggregateRating) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.aggregateRating.ratingValue,
      reviewCount: data.aggregateRating.reviewCount,
    };
  }

  return structuredData;
}

/**
 * Generate product list structured data (JSON-LD)
 * 
 * Creates ItemList structured data for product category/listing pages.
 * Helps search engines understand product collections.
 * 
 * @param products - Array of products with name and url
 * @param listName - Name of the product list (e.g., "Electronics Category")
 * @returns ItemList structured data
 * 
 * @example
 * const products = [
 *   { name: 'Wireless Headphones', url: 'https://example.com/shop/wireless-headphones' },
 *   { name: 'Bluetooth Speaker', url: 'https://example.com/shop/bluetooth-speaker' }
 * ];
 * const listData = generateProductListStructuredData(products, 'Audio Equipment');
 */
export function generateProductListStructuredData(
  products: Array<{ name: string; url: string }>,
  listName: string
): StructuredDataBase {
  return generateStructuredData('ItemList', {
    name: listName,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        url: product.url,
      },
    })),
  });
}
