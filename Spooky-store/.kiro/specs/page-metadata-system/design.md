# Page Metadata and Breadcrumb Navigation System - Design Document

## Overview

This design document outlines a comprehensive, production-ready Page Metadata and Breadcrumb Navigation System for the Next.js 14 frontend application. The system provides centralized metadata management, dynamic breadcrumb navigation, SEO optimization, and extensible metadata schema for future requirements.

### Key Features

- **Centralized Metadata Configuration**: Single source of truth for all page metadata
- **Dynamic Breadcrumb Navigation**: Hierarchical navigation with dynamic labels
- **SEO Optimization**: Complete meta tags, Open Graph, Twitter Cards, structured data
- **Next.js 14 Integration**: Leverages App Router Metadata API
- **Type-Safe**: Full TypeScript support with interfaces and validation
- **Extensible**: Easy to add custom metadata fields
- **Accessible**: WCAG AA compliant breadcrumbs with ARIA labels
- **Performance Optimized**: Memoization, caching, and minimal re-renders

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│                    (Server Components)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─► Static Metadata (layout.tsx, page.tsx)
                     │   - Uses Next.js Metadata API
                     │   - Server-side generation
                     │
                     └─► Dynamic Metadata (generateMetadata)
                         - Route parameters
                         - Data fetching
                         
┌─────────────────────────────────────────────────────────────┐
│                  Metadata Configuration                      │
│                  (lib/metadata-config.ts)                    │
│  - Route definitions                                         │
│  - Default metadata                                          │
│  - Template strings                                          │
│  - Breadcrumb paths                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─► MetadataContext (Client-side)
                     │   - Runtime updates
                     │   - Dynamic values
                     │
                     └─► Breadcrumb Component
                         - Path generation
                         - Dynamic labels
                         
┌─────────────────────────────────────────────────────────────┐
│                    Helper Functions                          │
│  - generatePageMetadata()                                    │
│  - generateBreadcrumbs()                                     │
│  - generateStructuredData()                                  │
│  - resolveMetadataTemplate()                                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Static Pages**: Next.js reads metadata from `layout.tsx` or `page.tsx` → Generates HTML meta tags
2. **Dynamic Pages**: `generateMetadata()` fetches data → Resolves templates → Returns metadata object
3. **Client Updates**: Component loads data → Calls `updateMetadata()` → MetadataContext updates document
4. **Breadcrumbs**: Route changes → `generateBreadcrumbs()` computes path → Component renders

## Components and Interfaces

### 1. Metadata Configuration

**File**: `frontend/src/lib/metadata-config.ts`

```typescript
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: 'website' | 'article' | 'profile';
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    title?: string;
    description?: string;
    images?: string[];
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  structuredData?: Record<string, any>;
  breadcrumb?: BreadcrumbConfig;
  [key: string]: any; // Extensible for custom fields
}

export interface BreadcrumbConfig {
  label: string;
  dynamic?: boolean; // If true, label will be resolved at runtime
  hidden?: boolean; // Hide this breadcrumb item
}

export interface RouteMetadata {
  path: string;
  metadata: PageMetadata;
  children?: RouteMetadata[];
}

// Centralized configuration
export const metadataConfig: Record<string, PageMetadata> = {
  '/': {
    title: 'Home',
    description: 'Welcome to our application',
    breadcrumb: { label: 'Home' }
  },
  '/dashboard': {
    title: 'Dashboard',
    description: 'Your personal dashboard',
    breadcrumb: { label: 'Dashboard' }
  },
  '/dashboard/users': {
    title: 'User Management',
    description: 'Manage users and permissions',
    keywords: ['users', 'management', 'admin'],
    breadcrumb: { label: 'Users' }
  },
  '/dashboard/users/:id': {
    title: 'User: {userName}', // Template string
    description: 'View and edit user details',
    breadcrumb: { label: '{userName}', dynamic: true }
  },
  // ... more routes
};

// Default metadata for fallback
export const defaultMetadata: PageMetadata = {
  title: 'Dashboard Application',
  description: 'Professional dashboard application',
  keywords: ['dashboard', 'admin', 'management'],
  openGraph: {
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image'
  },
  robots: {
    index: true,
    follow: true
  }
};
```

### 2. Metadata Helper Functions

**File**: `frontend/src/lib/metadata-helpers.ts`

```typescript
import { Metadata } from 'next';
import { metadataConfig, defaultMetadata, PageMetadata } from './metadata-config';

/**
 * Generate Next.js Metadata object for a route
 */
export function generatePageMetadata(
  pathname: string,
  dynamicValues?: Record<string, string>
): Metadata {
  const config = getMetadataForPath(pathname);
  const resolved = resolveMetadataTemplate(config, dynamicValues);
  
  return {
    title: resolved.title,
    description: resolved.description,
    keywords: resolved.keywords,
    openGraph: {
      title: resolved.openGraph?.title || resolved.title,
      description: resolved.openGraph?.description || resolved.description,
      type: resolved.openGraph?.type || 'website',
      images: resolved.openGraph?.images || defaultMetadata.openGraph?.images,
    },
    twitter: {
      card: resolved.twitter?.card || 'summary_large_image',
      title: resolved.twitter?.title || resolved.title,
      description: resolved.twitter?.description || resolved.description,
      images: resolved.twitter?.images,
    },
    robots: resolved.robots || defaultMetadata.robots,
  };
}

/**
 * Get metadata configuration for a path
 */
export function getMetadataForPath(pathname: string): PageMetadata {
  // Exact match
  if (metadataConfig[pathname]) {
    return { ...defaultMetadata, ...metadataConfig[pathname] };
  }
  
  // Pattern match for dynamic routes
  const pattern = Object.keys(metadataConfig).find(key => {
    const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
    return regex.test(pathname);
  });
  
  if (pattern) {
    return { ...defaultMetadata, ...metadataConfig[pattern] };
  }
  
  return defaultMetadata;
}

/**
 * Resolve template strings in metadata
 */
export function resolveMetadataTemplate(
  metadata: PageMetadata,
  values?: Record<string, string>
): PageMetadata {
  if (!values) return metadata;
  
  const resolved = { ...metadata };
  
  // Resolve title
  if (resolved.title) {
    resolved.title = resolveTemplate(resolved.title, values);
  }
  
  // Resolve description
  if (resolved.description) {
    resolved.description = resolveTemplate(resolved.description, values);
  }
  
  // Resolve breadcrumb label
  if (resolved.breadcrumb?.label) {
    resolved.breadcrumb.label = resolveTemplate(resolved.breadcrumb.label, values);
  }
  
  return resolved;
}

/**
 * Replace template placeholders with values
 */
function resolveTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] || match;
  });
}

/**
 * Generate structured data (JSON-LD)
 */
export function generateStructuredData(type: string, data: Record<string, any>) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]) {
  return generateStructuredData('BreadcrumbList', {
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${process.env.NEXT_PUBLIC_APP_URL}${item.href}`,
    })),
  });
}
```

### 3. Breadcrumb Component

**File**: `frontend/src/components/navigation/Breadcrumb.tsx`

```typescript
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbs, BreadcrumbItem } from '@/lib/breadcrumb-helpers';
import { useMetadata } from '@/contexts/MetadataContext';

export interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb = React.memo(function Breadcrumb({
  customItems,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
  className = '',
}: BreadcrumbProps) {
  const pathname = usePathname();
  const { dynamicValues } = useMetadata();
  
  const breadcrumbs = useMemo(() => {
    if (customItems) return customItems;
    return generateBreadcrumbs(pathname, dynamicValues);
  }, [pathname, dynamicValues, customItems]);
  
  if (breadcrumbs.length === 0) return null;
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {showHome && (
          <li>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
        )}
        
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <React.Fragment key={item.href}>
              {(showHome || index > 0) && (
                <li className="text-muted-foreground" aria-hidden="true">
                  {separator}
                </li>
              )}
              
              <li>
                {isLast ? (
                  <span
                    className="font-medium text-foreground"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
});
```

### 4. Breadcrumb Helper Functions

**File**: `frontend/src/lib/breadcrumb-helpers.ts`

```typescript
import { metadataConfig } from './metadata-config';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Generate breadcrumb items from pathname
 */
export function generateBreadcrumbs(
  pathname: string,
  dynamicValues?: Record<string, string>
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    
    // Get metadata for this path
    const metadata = getMetadataForSegment(currentPath, segments[i]);
    
    if (metadata?.breadcrumb?.hidden) continue;
    
    let label = metadata?.breadcrumb?.label || formatSegment(segments[i]);
    
    // Resolve dynamic labels
    if (dynamicValues && label.includes('{')) {
      label = resolveTemplate(label, dynamicValues);
    }
    
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }
  
  return breadcrumbs;
}

/**
 * Get metadata for a path segment
 */
function getMetadataForSegment(path: string, segment: string) {
  // Try exact match
  if (metadataConfig[path]) {
    return metadataConfig[path];
  }
  
  // Try pattern match
  const pattern = Object.keys(metadataConfig).find(key => {
    const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
    return regex.test(path);
  });
  
  return pattern ? metadataConfig[pattern] : null;
}

/**
 * Format segment for display
 */
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Resolve template string
 */
function resolveTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] || match;
  });
}
```

### 5. Metadata Context (Client-side)

**File**: `frontend/src/contexts/MetadataContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PageMetadata } from '@/lib/metadata-config';

interface MetadataContextValue {
  metadata: PageMetadata | null;
  dynamicValues: Record<string, string>;
  updateMetadata: (metadata: Partial<PageMetadata>) => void;
  setDynamicValues: (values: Record<string, string>) => void;
  resetMetadata: () => void;
}

const MetadataContext = createContext<MetadataContextValue | undefined>(undefined);

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const [metadata, setMetadata] = useState<PageMetadata | null>(null);
  const [dynamicValues, setDynamicValuesState] = useState<Record<string, string>>({});
  
  const updateMetadata = useCallback((newMetadata: Partial<PageMetadata>) => {
    setMetadata(prev => ({ ...prev, ...newMetadata } as PageMetadata));
    
    // Update document title
    if (newMetadata.title) {
      document.title = newMetadata.title;
    }
    
    // Update meta description
    if (newMetadata.description) {
      updateMetaTag('description', newMetadata.description);
    }
    
    // Update Open Graph tags
    if (newMetadata.openGraph) {
      if (newMetadata.openGraph.title) {
        updateMetaTag('og:title', newMetadata.openGraph.title, 'property');
      }
      if (newMetadata.openGraph.description) {
        updateMetaTag('og:description', newMetadata.openGraph.description, 'property');
      }
    }
  }, []);
  
  const setDynamicValues = useCallback((values: Record<string, string>) => {
    setDynamicValuesState(values);
  }, []);
  
  const resetMetadata = useCallback(() => {
    setMetadata(null);
    setDynamicValuesState({});
  }, []);
  
  return (
    <MetadataContext.Provider
      value={{
        metadata,
        dynamicValues,
        updateMetadata,
        setDynamicValues,
        resetMetadata,
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
}

export function useMetadata() {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within MetadataProvider');
  }
  return context;
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}
```

### 6. Page Header Component with Breadcrumbs

**File**: `frontend/src/components/layout/PageHeader.tsx`

```typescript
'use client';

import React from 'react';
import { Breadcrumb, BreadcrumbProps } from '@/components/navigation/Breadcrumb';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbProps?: BreadcrumbProps;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbProps,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb {...breadcrumbProps} />
      
      {/* Page Title and Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Data Models

### TypeScript Interfaces

```typescript
// frontend/src/types/metadata.ts

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: OpenGraphMetadata;
  twitter?: TwitterMetadata;
  robots?: RobotsMetadata;
  structuredData?: Record<string, any>;
  breadcrumb?: BreadcrumbConfig;
  [key: string]: any;
}

export interface OpenGraphMetadata {
  title?: string;
  description?: string;
  type?: 'website' | 'article' | 'profile';
  url?: string;
  siteName?: string;
  images?: OpenGraphImage[];
  locale?: string;
}

export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface TwitterMetadata {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  images?: string[];
}

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

export interface BreadcrumbConfig {
  label: string;
  dynamic?: boolean;
  hidden?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}
```

## Integration Examples

### Example 1: Static Page with Metadata

```typescript
// frontend/src/app/dashboard/users/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = generatePageMetadata('/dashboard/users');

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage users and permissions"
      />
      {/* Page content */}
    </div>
  );
}
```

### Example 2: Dynamic Page with Data

```typescript
// frontend/src/app/dashboard/users/[id]/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await fetchUser(params.id);
  
  return generatePageMetadata('/dashboard/users/:id', {
    userName: user.name,
    userId: params.id,
  });
}

export default async function UserDetailPage({ params }: Props) {
  const user = await fetchUser(params.id);
  
  return (
    <div>
      <PageHeader
        title={user.name}
        description={`User ID: ${params.id}`}
      />
      {/* Page content */}
    </div>
  );
}
```

### Example 3: Client-side Metadata Update

```typescript
// frontend/src/app/dashboard/users/[id]/edit/page.tsx
'use client';

import { useEffect } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';
import { PageHeader } from '@/components/layout/PageHeader';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const { updateMetadata, setDynamicValues } = useMetadata();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function loadUser() {
      const userData = await fetchUser(params.id);
      setUser(userData);
      
      // Update metadata dynamically
      updateMetadata({
        title: `Edit ${userData.name}`,
        description: `Edit user profile for ${userData.name}`,
      });
      
      // Update breadcrumb labels
      setDynamicValues({
        userName: userData.name,
        userId: params.id,
      });
    }
    
    loadUser();
  }, [params.id, updateMetadata, setDynamicValues]);
  
  return (
    <div>
      <PageHeader
        title={user ? `Edit ${user.name}` : 'Edit User'}
        description="Update user information"
      />
      {/* Edit form */}
    </div>
  );
}
```

## Error Handling

### Missing Metadata

```typescript
// Fallback to default metadata
export function getMetadataForPath(pathname: string): PageMetadata {
  const metadata = metadataConfig[pathname];
  
  if (!metadata) {
    console.warn(`No metadata found for path: ${pathname}. Using defaults.`);
    return defaultMetadata;
  }
  
  return { ...defaultMetadata, ...metadata };
}
```

### Invalid Template Values

```typescript
// Preserve placeholder if value not found
function resolveTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (!values[key]) {
      console.warn(`Template value not found: ${key}`);
      return match; // Keep placeholder
    }
    return values[key];
  });
}
```

### Breadcrumb Generation Errors

```typescript
// Return empty array on error
export function generateBreadcrumbs(
  pathname: string,
  dynamicValues?: Record<string, string>
): BreadcrumbItem[] {
  try {
    // ... generation logic
  } catch (error) {
    console.error('Error generating breadcrumbs:', error);
    return [];
  }
}
```

## Testing Strategy

### Unit Tests

1. **Metadata Helpers**
   - Test `generatePageMetadata()` with various paths
   - Test template resolution with dynamic values
   - Test fallback to default metadata
   - Test structured data generation

2. **Breadcrumb Helpers**
   - Test breadcrumb generation for nested routes
   - Test dynamic label resolution
   - Test hidden breadcrumb items
   - Test segment formatting

3. **Components**
   - Test Breadcrumb component rendering
   - Test navigation links
   - Test accessibility attributes
   - Test custom separators

### Integration Tests

1. **Metadata Context**
   - Test metadata updates
   - Test dynamic value changes
   - Test document title updates
   - Test meta tag updates

2. **Page Integration**
   - Test static metadata generation
   - Test dynamic metadata with data fetching
   - Test breadcrumb display on pages
   - Test metadata inheritance

### Accessibility Tests

1. **Breadcrumb Component**
   - Test ARIA labels
   - Test keyboard navigation
   - Test screen reader announcements
   - Test color contrast

## Performance Considerations

### Memoization

```typescript
// Memoize breadcrumb generation
const breadcrumbs = useMemo(() => {
  return generateBreadcrumbs(pathname, dynamicValues);
}, [pathname, dynamicValues]);

// Memoize component
export const Breadcrumb = React.memo(function Breadcrumb(props) {
  // ...
});
```

### Lazy Loading

```typescript
// Lazy load metadata configuration
const metadataConfig = {
  get '/dashboard/users'() {
    return import('./metadata/users').then(m => m.usersMetadata);
  },
};
```

### Caching

```typescript
// Cache computed metadata
const metadataCache = new Map<string, PageMetadata>();

export function getMetadataForPath(pathname: string): PageMetadata {
  if (metadataCache.has(pathname)) {
    return metadataCache.get(pathname)!;
  }
  
  const metadata = computeMetadata(pathname);
  metadataCache.set(pathname, metadata);
  return metadata;
}
```

## Security Considerations

### XSS Prevention

```typescript
// Sanitize user-provided metadata values
import DOMPurify from 'isomorphic-dompurify';

function sanitizeMetadata(metadata: PageMetadata): PageMetadata {
  return {
    ...metadata,
    title: DOMPurify.sanitize(metadata.title),
    description: DOMPurify.sanitize(metadata.description),
  };
}
```

### Content Security Policy

```typescript
// Add CSP headers for structured data
export const metadata: Metadata = {
  // ... other metadata
  other: {
    'Content-Security-Policy': "script-src 'self' 'unsafe-inline'",
  },
};
```

## Deployment Considerations

### Environment Variables

```env
# frontend/.env.production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Your Application
NEXT_PUBLIC_DEFAULT_OG_IMAGE=/og-image.png
```

### Build Optimization

```typescript
// next.config.ts
export default {
  experimental: {
    optimizePackageImports: ['@/lib/metadata-helpers'],
  },
};
```

## Future Enhancements

1. **Multi-language Support**: Add i18n for metadata and breadcrumbs
2. **Analytics Integration**: Track breadcrumb clicks and page views
3. **A/B Testing**: Test different metadata for SEO optimization
4. **Dynamic OG Images**: Generate Open Graph images on-the-fly
5. **Metadata Presets**: Pre-configured metadata templates for common page types
6. **Validation**: Runtime validation of metadata schema
7. **Admin UI**: Visual editor for metadata configuration
