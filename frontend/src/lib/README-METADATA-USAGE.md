# Page Metadata System - Usage Guide

## Table of Contents

1. [Overview](#overview)
2. [Metadata Configuration](#metadata-configuration)
3. [Static Page Metadata](#static-page-metadata)
4. [Dynamic Page Metadata](#dynamic-page-metadata)
5. [Breadcrumb Navigation](#breadcrumb-navigation)
6. [Client-Side Metadata Updates](#client-side-metadata-updates)
7. [SEO Optimization](#seo-optimization)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

## Overview

The Page Metadata System provides a centralized way to manage page titles, descriptions, breadcrumbs, and SEO metadata across your Next.js application. It integrates with Next.js 14's Metadata API and provides both server-side and client-side capabilities.

### Key Features

- **Centralized Configuration**: Single source of truth for all page metadata
- **Dynamic Values**: Template strings with runtime value substitution
- **Breadcrumb Navigation**: Automatic hierarchical navigation
- **SEO Optimization**: Open Graph, Twitter Cards, structured data
- **Type-Safe**: Full TypeScript support
- **Performance**: Memoization and caching built-in

## Metadata Configuration

### Basic Configuration Format

Metadata is configured in `frontend/src/lib/metadata-config.ts`:

```typescript
import { PageMetadata } from '@/types/metadata';

export const metadataConfig: Record<string, PageMetadata> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Your personal dashboard',
    keywords: ['dashboard', 'overview', 'analytics'],
    breadcrumb: { label: 'Dashboard' }
  },
  '/dashboard/users': {
    title: 'User Management',
    description: 'Manage users and permissions',
    keywords: ['users', 'management', 'admin'],
    breadcrumb: { label: 'Users' }
  }
};
```

### Configuration with Template Strings

Use `{variableName}` syntax for dynamic values:

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  '/dashboard/users/:id': {
    title: 'User: {userName}',
    description: 'View and edit details for {userName}',
    breadcrumb: { label: '{userName}', dynamic: true }
  },
  '/dashboard/posts/:id': {
    title: '{postTitle} | Blog',
    description: '{postExcerpt}',
    breadcrumb: { label: '{postTitle}', dynamic: true }
  }
};
```

### Full Metadata Options

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  '/blog/:slug': {
    // Basic metadata
    title: '{postTitle}',
    description: '{postExcerpt}',
    keywords: ['blog', 'article', '{category}'],
    
    // Open Graph for social sharing
    openGraph: {
      title: '{postTitle}',
      description: '{postExcerpt}',
      type: 'article',
      images: [{
        url: '{postImage}',
        width: 1200,
        height: 630,
        alt: '{postTitle}'
      }]
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: '{postTitle}',
      description: '{postExcerpt}',
      images: ['{postImage}']
    },
    
    // SEO directives
    robots: {
      index: true,
      follow: true
    },
    
    // Breadcrumb configuration
    breadcrumb: {
      label: '{postTitle}',
      dynamic: true
    }
  }
};
```

## Static Page Metadata

### Using generatePageMetadata Helper

For static pages with no dynamic data:

```typescript
// app/dashboard/settings/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';

export const metadata: Metadata = generatePageMetadata('/dashboard/settings');

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      {/* Page content */}
    </div>
  );
}
```

### Manual Metadata Definition

You can also define metadata manually:

```typescript
// app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about our company',
  openGraph: {
    title: 'About Us',
    description: 'Learn more about our company',
    type: 'website'
  }
};

export default function AboutPage() {
  return <div>About content</div>;
}
```

## Dynamic Page Metadata

### Using generateMetadata Function

For pages with dynamic data (e.g., user profiles, blog posts):

```typescript
// app/dashboard/users/[id]/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch user data
  const user = await fetchUser(params.id);
  
  // Generate metadata with dynamic values
  return generatePageMetadata('/dashboard/users/:id', {
    userName: user.name,
    userId: params.id,
    userEmail: user.email
  });
}

export default async function UserDetailPage({ params }: Props) {
  const user = await fetchUser(params.id);
  
  return (
    <div>
      <h1>{user.name}</h1>
      {/* Page content */}
    </div>
  );
}
```

### Complex Dynamic Metadata

For more complex scenarios:

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { generateStructuredData } from '@/lib/structured-data-helpers';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  
  const metadata = generatePageMetadata('/blog/:slug', {
    postTitle: post.title,
    postExcerpt: post.excerpt,
    postImage: post.coverImage,
    category: post.category,
    author: post.author.name
  });
  
  // Add structured data for rich search results
  const structuredData = generateStructuredData('Article', {
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name
    }
  });
  
  return {
    ...metadata,
    other: {
      'application/ld+json': JSON.stringify(structuredData)
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await fetchPost(params.slug);
  return <article>{/* Post content */}</article>;
}
```

## Breadcrumb Navigation

### Basic Breadcrumb Usage

The `Breadcrumb` component automatically generates breadcrumbs from the current path:

```typescript
// app/dashboard/users/page.tsx
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

export default function UsersPage() {
  return (
    <div>
      <Breadcrumb />
      <h1>User Management</h1>
      {/* Page content */}
    </div>
  );
}
```

This automatically generates: `Home > Dashboard > Users`

### Breadcrumb with PageHeader

Use the `PageHeader` component for a complete page header with breadcrumbs:

```typescript
// app/dashboard/users/page.tsx
import { PageHeader } from '@/components/layout/PageHeader';

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

### Custom Breadcrumb Items

Override automatic breadcrumbs with custom items:

```typescript
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

export default function CustomPage() {
  const customBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptops', href: '/products/electronics/laptops' }
  ];
  
  return (
    <div>
      <Breadcrumb customItems={customBreadcrumbs} />
      {/* Page content */}
    </div>
  );
}
```

### Breadcrumb Customization

```typescript
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { ChevronRight, Slash } from 'lucide-react';

export default function CustomizedBreadcrumb() {
  return (
    <Breadcrumb
      showHome={true}
      separator={<Slash className="h-4 w-4" />}
      className="mb-6"
    />
  );
}
```

### Dynamic Breadcrumb Labels

For pages with dynamic data, breadcrumb labels update automatically:

```typescript
// app/dashboard/users/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';
import { PageHeader } from '@/components/layout/PageHeader';

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { setDynamicValues } = useMetadata();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function loadUser() {
      const userData = await fetchUser(params.id);
      setUser(userData);
      
      // Update breadcrumb labels
      setDynamicValues({
        userName: userData.name,
        userId: params.id
      });
    }
    
    loadUser();
  }, [params.id, setDynamicValues]);
  
  return (
    <div>
      <PageHeader
        title={user?.name || 'Loading...'}
        description={`User ID: ${params.id}`}
      />
      {/* Page content */}
    </div>
  );
}
```

## Client-Side Metadata Updates

### Using MetadataContext

For client-side metadata updates (e.g., after data loads):

```typescript
'use client';

import { useEffect } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';

export default function DynamicPage() {
  const { updateMetadata, setDynamicValues } = useMetadata();
  
  useEffect(() => {
    async function loadData() {
      const data = await fetchData();
      
      // Update page title and description
      updateMetadata({
        title: `${data.title} | My App`,
        description: data.description
      });
      
      // Update breadcrumb labels
      setDynamicValues({
        itemName: data.title,
        itemId: data.id
      });
    }
    
    loadData();
  }, [updateMetadata, setDynamicValues]);
  
  return <div>{/* Page content */}</div>;
}
```

### Updating Multiple Metadata Fields

```typescript
'use client';

import { useMetadata } from '@/contexts/MetadataContext';

export default function ProductPage({ productId }: { productId: string }) {
  const { updateMetadata } = useMetadata();
  
  useEffect(() => {
    async function loadProduct() {
      const product = await fetchProduct(productId);
      
      updateMetadata({
        title: product.name,
        description: product.description,
        openGraph: {
          title: product.name,
          description: product.description,
          images: [{
            url: product.image,
            width: 1200,
            height: 630,
            alt: product.name
          }]
        },
        twitter: {
          card: 'summary_large_image',
          title: product.name,
          description: product.description,
          images: [product.image]
        }
      });
    }
    
    loadProduct();
  }, [productId, updateMetadata]);
  
  return <div>{/* Product content */}</div>;
}
```

### Resetting Metadata

```typescript
'use client';

import { useEffect } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';

export default function TemporaryPage() {
  const { updateMetadata, resetMetadata } = useMetadata();
  
  useEffect(() => {
    // Set temporary metadata
    updateMetadata({
      title: 'Temporary Page',
      description: 'This is a temporary page'
    });
    
    // Reset on unmount
    return () => {
      resetMetadata();
    };
  }, [updateMetadata, resetMetadata]);
  
  return <div>{/* Page content */}</div>;
}
```

## SEO Optimization

### Open Graph Tags

Configure Open Graph for social media sharing:

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  '/products/:id': {
    title: '{productName}',
    description: '{productDescription}',
    openGraph: {
      title: '{productName}',
      description: '{productDescription}',
      type: 'website',
      url: 'https://example.com/products/{productId}',
      siteName: 'My Store',
      images: [{
        url: '{productImage}',
        width: 1200,
        height: 630,
        alt: '{productName}'
      }],
      locale: 'en_US'
    }
  }
};
```

### Twitter Cards

Configure Twitter Card metadata:

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  '/blog/:slug': {
    title: '{postTitle}',
    description: '{postExcerpt}',
    twitter: {
      card: 'summary_large_image',
      site: '@mysite',
      creator: '@{authorTwitter}',
      title: '{postTitle}',
      description: '{postExcerpt}',
      images: ['{postImage}']
    }
  }
};
```

### Structured Data (JSON-LD)

Add structured data for rich search results:

```typescript
import { generateStructuredData } from '@/lib/structured-data-helpers';

// Article structured data
const articleData = generateStructuredData('Article', {
  headline: 'My Article Title',
  description: 'Article description',
  image: 'https://example.com/image.jpg',
  datePublished: '2024-01-01',
  dateModified: '2024-01-15',
  author: {
    '@type': 'Person',
    name: 'John Doe'
  }
});

// Breadcrumb structured data
import { generateBreadcrumbStructuredData } from '@/lib/structured-data-helpers';

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Laptops', href: '/products/laptops' }
];

const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbs);

// Add to page metadata
export const metadata: Metadata = {
  // ... other metadata
  other: {
    'application/ld+json': JSON.stringify(articleData)
  }
};
```

### Robots Meta Tags

Control search engine indexing:

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  '/admin': {
    title: 'Admin Panel',
    description: 'Administrative dashboard',
    robots: {
      index: false,  // Don't index this page
      follow: false  // Don't follow links
    }
  },
  '/blog/:slug': {
    title: '{postTitle}',
    description: '{postExcerpt}',
    robots: {
      index: true,
      follow: true,
      maxSnippet: 160,
      maxImagePreview: 'large'
    }
  }
};
```

## Common Patterns

### Pattern 1: Dashboard Page with Actions

```typescript
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage users and permissions"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />
      {/* Page content */}
    </div>
  );
}
```

### Pattern 2: Detail Page with Dynamic Data

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';
import { PageHeader } from '@/components/layout/PageHeader';

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { updateMetadata, setDynamicValues } = useMetadata();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function loadUser() {
      const userData = await fetchUser(params.id);
      setUser(userData);
      
      updateMetadata({
        title: `${userData.name} | Users`,
        description: `View and edit details for ${userData.name}`
      });
      
      setDynamicValues({
        userName: userData.name,
        userId: params.id
      });
    }
    
    loadUser();
  }, [params.id, updateMetadata, setDynamicValues]);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <PageHeader
        title={user.name}
        description={user.email}
      />
      {/* User details */}
    </div>
  );
}
```

### Pattern 3: List Page with Filters

```typescript
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

export default function ProductsPage() {
  return (
    <div>
      <Breadcrumb className="mb-4" />
      
      <PageHeader
        title="Products"
        description="Browse our product catalog"
        breadcrumbProps={{ showHome: false }} // Hide home since we show breadcrumb above
      />
      
      {/* Filters and product grid */}
    </div>
  );
}
```

### Pattern 4: Multi-Step Form

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const { updateMetadata } = useMetadata();
  
  useEffect(() => {
    const stepTitles = {
      1: 'Personal Information',
      2: 'Contact Details',
      3: 'Review & Submit'
    };
    
    updateMetadata({
      title: `${stepTitles[step]} | Registration`,
      description: `Step ${step} of 3`
    });
  }, [step, updateMetadata]);
  
  return (
    <div>
      <h1>Step {step}: {/* Step title */}</h1>
      {/* Form content */}
    </div>
  );
}
```

## Troubleshooting

### Metadata Not Updating

**Problem**: Page title doesn't change when navigating

**Solution**: Ensure `MetadataProvider` wraps your app in `layout.tsx`:

```typescript
// app/layout.tsx
import { MetadataProvider } from '@/contexts/MetadataContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MetadataProvider>
          {children}
        </MetadataProvider>
      </body>
    </html>
  );
}
```

### Breadcrumbs Not Showing

**Problem**: Breadcrumbs don't appear on the page

**Solution**: Check that breadcrumb configuration exists in `metadata-config.ts`:

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  '/your-route': {
    title: 'Your Page',
    description: 'Description',
    breadcrumb: { label: 'Your Page' }  // Add this
  }
};
```

### Dynamic Values Not Resolving

**Problem**: Template strings like `{userName}` not being replaced

**Solution**: Ensure you're calling `setDynamicValues()`:

```typescript
const { setDynamicValues } = useMetadata();

useEffect(() => {
  setDynamicValues({
    userName: user.name,  // Must match template variable name
    userId: user.id
  });
}, [user, setDynamicValues]);
```

### SEO Tags Not Appearing

**Problem**: Open Graph or Twitter Card tags missing in HTML

**Solution**: Use `generatePageMetadata()` or ensure metadata includes OG/Twitter fields:

```typescript
export const metadata: Metadata = generatePageMetadata('/your-route', {
  // dynamic values
});

// Or manually:
export const metadata: Metadata = {
  title: 'Your Page',
  openGraph: {
    title: 'Your Page',
    // ... other OG fields
  }
};
```

### Performance Issues

**Problem**: Page feels slow when updating metadata

**Solution**: The system uses memoization and debouncing. If issues persist:

1. Check that you're not calling `updateMetadata()` in a render loop
2. Use `useMemo` for computed values
3. Debounce rapid updates:

```typescript
import { debounce } from '@/lib/debounce';

const debouncedUpdate = useMemo(
  () => debounce((values) => {
    updateMetadata(values);
  }, 300),
  [updateMetadata]
);
```

## Best Practices

1. **Always configure breadcrumbs**: Include `breadcrumb` field in metadata config
2. **Use template strings**: For dynamic pages, use `{variableName}` syntax
3. **Set dynamic values early**: Call `setDynamicValues()` as soon as data loads
4. **Include SEO metadata**: Add Open Graph and Twitter Card tags for all public pages
5. **Use PageHeader component**: Provides consistent layout with breadcrumbs
6. **Test social sharing**: Use Facebook Debugger and Twitter Card Validator
7. **Keep titles concise**: Aim for 50-60 characters for optimal display
8. **Write descriptive descriptions**: 150-160 characters for search snippets
9. **Use structured data**: Add JSON-LD for rich search results
10. **Monitor performance**: Use React DevTools to check for unnecessary re-renders

## Additional Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search/docs)
