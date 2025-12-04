# Page Metadata System - Migration Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [Static Pages Migration](#static-pages-migration)
5. [Dynamic Pages Migration](#dynamic-pages-migration)
6. [Layout Migration](#layout-migration)
7. [Component Integration](#component-integration)
8. [Testing Your Migration](#testing-your-migration)
9. [Common Migration Scenarios](#common-migration-scenarios)
10. [Rollback Instructions](#rollback-instructions)

## Overview

This guide helps you migrate existing Next.js pages to use the Page Metadata System. The migration adds:

- Centralized metadata configuration
- Automatic breadcrumb navigation
- SEO optimization (Open Graph, Twitter Cards)
- Dynamic metadata updates
- Structured data for search engines

### Migration Effort

- **Simple static page**: 5-10 minutes
- **Dynamic page with data**: 15-20 minutes
- **Complex page with multiple data sources**: 30-45 minutes

### Breaking Changes

⚠️ **None** - This system is additive and doesn't break existing functionality.

## Prerequisites

Before starting the migration:

1. ✅ Ensure you're using Next.js 14+ with App Router
2. ✅ Verify `MetadataProvider` is in your root layout (see [Layout Migration](#layout-migration))
3. ✅ Install required dependencies (should already be installed):
   ```bash
   npm install lucide-react
   ```

## Migration Steps

### Step 1: Add Metadata Configuration

Add your page's metadata to `frontend/src/lib/metadata-config.ts`:

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  // ... existing config
  
  // Add your page
  '/your-route': {
    title: 'Your Page Title',
    description: 'Your page description',
    keywords: ['keyword1', 'keyword2'],
    breadcrumb: { label: 'Your Page' }
  }
};
```

### Step 2: Update Page Component

Choose the appropriate migration path based on your page type:

- **Static Page**: See [Static Pages Migration](#static-pages-migration)
- **Dynamic Page**: See [Dynamic Pages Migration](#dynamic-pages-migration)

### Step 3: Add Breadcrumbs

Replace your existing page header with `PageHeader` component:

```typescript
import { PageHeader } from '@/components/layout/PageHeader';

export default function YourPage() {
  return (
    <div>
      <PageHeader
        title="Your Page Title"
        description="Your page description"
      />
      {/* Rest of your page */}
    </div>
  );
}
```

### Step 4: Test

1. Navigate to your page
2. Check browser tab title
3. Verify breadcrumbs appear
4. Inspect HTML for meta tags
5. Test social sharing with [Facebook Debugger](https://developers.facebook.com/tools/debug/)

## Static Pages Migration

### Before: Basic Static Page

```typescript
// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <p>Manage your application settings</p>
      {/* Page content */}
    </div>
  );
}
```

### After: With Metadata System

```typescript
// app/dashboard/settings/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';

// Add metadata export
export const metadata: Metadata = generatePageMetadata('/dashboard/settings');

export default function SettingsPage() {
  return (
    <div>
      {/* Replace header with PageHeader */}
      <PageHeader
        title="Settings"
        description="Manage your application settings"
      />
      {/* Page content */}
    </div>
  );
}
```

### Configuration

Add to `metadata-config.ts`:

```typescript
'/dashboard/settings': {
  title: 'Settings',
  description: 'Manage your application settings',
  keywords: ['settings', 'configuration', 'preferences'],
  breadcrumb: { label: 'Settings' },
  robots: {
    index: false,  // Don't index settings pages
    follow: false
  }
}
```

## Dynamic Pages Migration

### Before: Dynamic Page with Data

```typescript
// app/dashboard/users/[id]/page.tsx
interface Props {
  params: { id: string };
}

async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

export default async function UserDetailPage({ params }: Props) {
  const user = await fetchUser(params.id);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {/* User details */}
    </div>
  );
}
```

### After: With Metadata System

```typescript
// app/dashboard/users/[id]/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';

interface Props {
  params: { id: string };
}

async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

// Add generateMetadata function
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await fetchUser(params.id);
  
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
      {/* Add PageHeader */}
      <PageHeader
        title={user.name}
        description={user.email}
      />
      {/* User details */}
    </div>
  );
}
```

### Configuration

Add to `metadata-config.ts`:

```typescript
'/dashboard/users/:id': {
  title: 'User: {userName}',
  description: 'View and edit details for {userName}',
  keywords: ['user', 'profile', 'management'],
  breadcrumb: { label: '{userName}', dynamic: true },
  openGraph: {
    title: '{userName} | User Profile',
    description: 'View profile for {userName}',
    type: 'profile'
  }
}
```

## Layout Migration

### Step 1: Verify MetadataProvider

Ensure `MetadataProvider` wraps your app in `app/layout.tsx`:

```typescript
// app/layout.tsx
import { MetadataProvider } from '@/contexts/MetadataContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <MetadataProvider>
              {children}
            </MetadataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 2: Add Default Metadata

Add default metadata to root layout:

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'My Application',
    template: '%s | My Application'
  },
  description: 'Default application description',
  keywords: ['app', 'dashboard', 'management'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'My Application',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'My Application'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@myapp'
  }
};
```

## Component Integration

### Migrating Custom Headers

#### Before: Custom Header Component

```typescript
function CustomHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default function MyPage() {
  return (
    <div>
      <CustomHeader title="My Page" subtitle="Page description" />
      {/* Content */}
    </div>
  );
}
```

#### After: Using PageHeader

```typescript
import { PageHeader } from '@/components/layout/PageHeader';

export default function MyPage() {
  return (
    <div>
      <PageHeader
        title="My Page"
        description="Page description"
      />
      {/* Content */}
    </div>
  );
}
```

### Adding Action Buttons

```typescript
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';

export default function MyPage() {
  return (
    <div>
      <PageHeader
        title="My Page"
        description="Page description"
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </>
        }
      />
      {/* Content */}
    </div>
  );
}
```

### Custom Breadcrumb Styling

```typescript
import { PageHeader } from '@/components/layout/PageHeader';
import { ChevronRight } from 'lucide-react';

export default function MyPage() {
  return (
    <div>
      <PageHeader
        title="My Page"
        description="Page description"
        breadcrumbProps={{
          showHome: true,
          separator: <ChevronRight className="h-3 w-3" />,
          className: "text-sm"
        }}
      />
      {/* Content */}
    </div>
  );
}
```

## Testing Your Migration

### Manual Testing Checklist

After migrating a page, verify:

1. **Browser Tab Title**
   - [ ] Title appears correctly in browser tab
   - [ ] Title updates when navigating between pages

2. **Breadcrumbs**
   - [ ] Breadcrumbs display correct hierarchy
   - [ ] Breadcrumb links navigate correctly
   - [ ] Current page is highlighted (non-clickable)
   - [ ] Dynamic labels update with data

3. **Meta Tags**
   - [ ] Open DevTools → Elements → `<head>`
   - [ ] Verify `<title>` tag
   - [ ] Verify `<meta name="description">` tag
   - [ ] Verify Open Graph tags (`<meta property="og:*">`)
   - [ ] Verify Twitter Card tags (`<meta name="twitter:*">`)

4. **Social Sharing**
   - [ ] Test with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
   - [ ] Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [ ] Verify preview image displays
   - [ ] Verify title and description are correct

5. **Accessibility**
   - [ ] Breadcrumbs have `aria-label="Breadcrumb"`
   - [ ] Current page has `aria-current="page"`
   - [ ] Keyboard navigation works (Tab through breadcrumbs)
   - [ ] Screen reader announces breadcrumbs correctly

### Automated Testing

Add tests for your migrated pages:

```typescript
// __tests__/pages/my-page.test.tsx
import { render, screen } from '@testing-library/react';
import MyPage from '@/app/my-page/page';

describe('MyPage', () => {
  it('renders page header with title', () => {
    render(<MyPage />);
    expect(screen.getByText('My Page')).toBeInTheDocument();
  });
  
  it('renders breadcrumbs', () => {
    render(<MyPage />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });
});
```

## Common Migration Scenarios

### Scenario 1: List Page with Filters

#### Before

```typescript
export default function ProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Browse our catalog</p>
        </div>
        <Button>Add Product</Button>
      </div>
      
      <FilterPanel />
      <ProductGrid />
    </div>
  );
}
```

#### After

```typescript
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata('/products');

export default function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Products"
        description="Browse our catalog"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        }
      />
      
      <FilterPanel />
      <ProductGrid />
    </div>
  );
}
```

### Scenario 2: Detail Page with Tabs

#### Before

```typescript
export default async function ProductDetailPage({ params }: Props) {
  const product = await fetchProduct(params.id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <Tabs>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="details">{/* Details */}</TabsContent>
        <TabsContent value="reviews">{/* Reviews */}</TabsContent>
      </Tabs>
    </div>
  );
}
```

#### After

```typescript
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProduct(params.id);
  
  return generatePageMetadata('/products/:id', {
    productName: product.name,
    productDescription: product.description,
    productImage: product.image,
    productId: params.id
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await fetchProduct(params.id);
  
  return (
    <div>
      <PageHeader
        title={product.name}
        description={product.shortDescription}
      />
      
      <Tabs>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="details">{/* Details */}</TabsContent>
        <TabsContent value="reviews">{/* Reviews */}</TabsContent>
      </Tabs>
    </div>
  );
}
```

### Scenario 3: Client Component with Dynamic Data

#### Before

```typescript
'use client';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetchStats().then(setStats);
  }, []);
  
  return (
    <div>
      <h1>Dashboard</h1>
      {stats && <StatsGrid stats={stats} />}
    </div>
  );
}
```

#### After

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useMetadata } from '@/contexts/MetadataContext';
import { PageHeader } from '@/components/layout/PageHeader';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const { updateMetadata } = useMetadata();
  
  useEffect(() => {
    fetchStats().then(data => {
      setStats(data);
      
      // Update metadata with dynamic data
      updateMetadata({
        title: `Dashboard - ${data.totalUsers} Users`,
        description: `Overview of your dashboard with ${data.totalUsers} users`
      });
    });
  }, [updateMetadata]);
  
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your application"
      />
      {stats && <StatsGrid stats={stats} />}
    </div>
  );
}
```

### Scenario 4: Nested Routes

#### Before

```typescript
// app/dashboard/settings/profile/page.tsx
export default function ProfileSettingsPage() {
  return (
    <div>
      <h1>Profile Settings</h1>
      {/* Content */}
    </div>
  );
}
```

#### After

```typescript
// app/dashboard/settings/profile/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = generatePageMetadata('/dashboard/settings/profile');

export default function ProfileSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Profile Settings"
        description="Manage your profile information"
      />
      {/* Content */}
    </div>
  );
}
```

#### Configuration

```typescript
// metadata-config.ts
'/dashboard': {
  title: 'Dashboard',
  breadcrumb: { label: 'Dashboard' }
},
'/dashboard/settings': {
  title: 'Settings',
  breadcrumb: { label: 'Settings' }
},
'/dashboard/settings/profile': {
  title: 'Profile Settings',
  description: 'Manage your profile information',
  breadcrumb: { label: 'Profile' }
}
```

This creates breadcrumbs: `Home > Dashboard > Settings > Profile`

## Rollback Instructions

If you need to rollback the migration:

### Step 1: Remove Metadata Exports

Remove the `metadata` export or `generateMetadata` function:

```typescript
// Remove this:
export const metadata: Metadata = generatePageMetadata('/your-route');

// Or this:
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // ...
}
```

### Step 2: Restore Original Header

Replace `PageHeader` with your original header:

```typescript
// Remove this:
import { PageHeader } from '@/components/layout/PageHeader';

<PageHeader title="..." description="..." />

// Restore this:
<h1>Your Title</h1>
<p>Your description</p>
```

### Step 3: Remove Configuration

Remove your page's entry from `metadata-config.ts`:

```typescript
// Remove this:
'/your-route': {
  title: '...',
  description: '...',
  breadcrumb: { label: '...' }
}
```

### Step 4: Test

Verify your page works as before the migration.

## Migration Checklist

Use this checklist for each page you migrate:

- [ ] Add metadata configuration to `metadata-config.ts`
- [ ] Add `metadata` export or `generateMetadata` function
- [ ] Replace header with `PageHeader` component
- [ ] Test browser tab title
- [ ] Test breadcrumb navigation
- [ ] Verify meta tags in HTML
- [ ] Test social sharing previews
- [ ] Check accessibility (ARIA labels, keyboard nav)
- [ ] Update any related tests
- [ ] Document any custom behavior

## Getting Help

If you encounter issues during migration:

1. **Check the Usage Guide**: See `README-METADATA-USAGE.md` for detailed examples
2. **Review Existing Migrations**: Look at already-migrated pages for patterns
3. **Check Console**: Look for errors or warnings in browser console
4. **Verify Configuration**: Ensure metadata config matches your route exactly
5. **Test in Isolation**: Create a minimal test page to isolate the issue

## Next Steps

After completing your migration:

1. **Optimize SEO**: Add Open Graph images, structured data
2. **Monitor Performance**: Check for any performance regressions
3. **Update Documentation**: Document any custom patterns you created
4. **Train Team**: Share migration patterns with your team
5. **Iterate**: Continuously improve metadata based on analytics

## Additional Resources

- [Usage Guide](./README-METADATA-USAGE.md) - Detailed usage documentation
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [SEO Best Practices](./README-SEO.md) - SEO optimization guide
- [Performance Guide](./README-PERFORMANCE.md) - Performance optimization tips
