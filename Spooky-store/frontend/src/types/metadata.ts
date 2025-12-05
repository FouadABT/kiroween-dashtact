/**
 * Page Metadata System - Type Definitions
 * 
 * Comprehensive TypeScript interfaces for page metadata, SEO optimization,
 * and breadcrumb navigation.
 */

/**
 * Open Graph image configuration
 */
export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

/**
 * Open Graph metadata for social media sharing
 */
export interface OpenGraphMetadata {
  title?: string;
  description?: string;
  type?: 'website' | 'article' | 'profile';
  url?: string;
  siteName?: string;
  images?: OpenGraphImage[];
  locale?: string;
}

/**
 * Twitter Card metadata
 */
export interface TwitterMetadata {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  images?: string[];
}

/**
 * Robots meta tag directives
 */
export interface RobotsMetadata {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxVideoPreview?: number;
}

/**
 * Breadcrumb configuration for a route
 */
export interface BreadcrumbConfig {
  label: string;
  dynamic?: boolean;  // If true, label will be resolved at runtime
  hidden?: boolean;   // Hide this breadcrumb item
}

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Complete page metadata configuration
 */
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: OpenGraphMetadata;
  twitter?: TwitterMetadata;
  robots?: RobotsMetadata;
  structuredData?: Record<string, unknown>;
  breadcrumb?: BreadcrumbConfig;
  [key: string]: unknown;  // Extensible for custom fields
}

/**
 * Route metadata with hierarchical structure
 */
export interface RouteMetadata {
  path: string;
  metadata: PageMetadata;
  children?: RouteMetadata[];
}

/**
 * Metadata context value for client-side updates
 */
export interface MetadataContextValue {
  metadata: PageMetadata | null;
  dynamicValues: Record<string, string>;
  updateMetadata: (metadata: Partial<PageMetadata>) => void;
  setDynamicValues: (values: Record<string, string>) => void;
  resetMetadata: () => void;
}
