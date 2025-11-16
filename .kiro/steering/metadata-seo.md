---
inclusion: fileMatch
fileMatchPattern: '{frontend/src/lib/metadata-*.ts,frontend/src/app/**/page.tsx,frontend/src/components/navigation/Breadcrumb.tsx,frontend/src/lib/breadcrumb-helpers.ts,frontend/src/lib/sitemap-helpers.ts}'
---

# Page Metadata & SEO System - Global Guidelines

## Overview

This project implements a comprehensive, production-ready Page Metadata and SEO system with dynamic breadcrumb navigation, structured data, and complete social media optimization. The system provides centralized metadata management, automatic SEO tag generation, and extensible configuration for all pages.

## System Architecture

### Stack
- **Frontend**: Next.js 14 App Router + Metadata API
- **Metadata Management**: Centralized configuration with template support
- **SEO**: Open Graph, Twitter Cards, structured data (JSON-LD)
- **Navigation**: Dynamic breadcrumb generation with accessibility
- **Performance**: Memoization, caching, and minimal re-renders

### Key Components

**Configuration** (`frontend/src/lib/`):
- `metadata-config.ts` - Centralized metadata for all routes
- `metadata-helpers.ts` - Metadata generation and template resolution
- `breadcrumb-helpers.ts` - Breadcrumb generation utilities
- `structured-data-helpers.ts` - JSON-LD structured data generators
- `sitemap-helpers.ts` - Dynamic sitemap generation

**Context** (`frontend/src/contexts/`):
- `MetadataContext.tsx` - Client-side metadata updates and dynamic values

**Components** (`frontend/src/components/`):
- `navigation/Breadcrumb.tsx` - Accessible breadcrumb navigation
- `layout/PageHeader.tsx` - Page header with breadcrumbs and actions

**Types** (`frontend/src/types/`):
- `metadata.ts` - TypeScript interfaces for type safety

## Quick Reference

### Adding Metadata to a Page

**Static Page**:
```typescript
// frontend/src/app/dashboard/users/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';

export const metadata: Metadata = generatePageMetadata('/dashboard/users');

export default function UsersPage() {
  return <div>Content</div>;
}
```

**Dynamic Page**:
```typescript
// frontend/src/app/dashboard/users/[id]/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';

export async function generateMetadata({ params }): Promise<Metadata> {
  const user = await fetchUser(params.id);
  
  return generatePageMetadata('/dashboard/users/:id', {
    userName: user.name,
    userId: params.id,
  });
}
```

**Client-Side Update**:
```typescript
'use client';
import { useMetadata } from '@/contexts/MetadataContext';

function MyComponent() {
  const { updateMetadata, setDynamicValues } = useMetadata();
  
  useEffect(() => {
    updateMetadata({
      title: 'New Title',
      description: 'Updated description'
    });
    
    setDynamicValues({ userName: 'John Doe' });
  }, []);
}
```

### Adding Breadcrumbs

**Automatic Breadcrumbs**:
```typescript
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

<Breadcrumb />  // Auto-generates from pathname
```

**With Dynamic Values**:
```typescript
<Breadcrumb dynamicValues={{ userName: 'John Doe' }} />
```

**Custom Breadcrumbs**:
```typescript
<Breadcrumb 
  customItems={[
    { label: 'Home', href: '/' },
    { label: 'Users', href: '/dashboard/users' }
  ]}
/>
```

## Metadata Configuration

### Route Configuration Format

**File**: `frontend/src/lib/metadata-config.ts`

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  '/dashboard/users': {
    title: 'User Management',
    description: 'Manage users and permissions',
    keywords: ['users', 'management', 'admin'],
    breadcrumb: { label: 'Users' },
    openGraph: {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      type: 'website',
    },
    twitter: {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
    },
    robots: {
      index: true,
      follow: true,
    },
  },
  
  // Dynamic route with template strings
  '/dashboard/users/:id': {
    title: 'User: {userName}',
    description: 'View and edit user details',
    breadcrumb: { label: '{userName}', dynamic: true },
    openGraph: {
      title: 'User Profile: {userName}',
      type: 'profile',
    },
  },
};
```

### Template Strings

Use `{variableName}` syntax for dynamic values:
- `{userName}` - User name
- `{userId}` - User ID
- `{postTitle}` - Post title
- Any custom variable you define

**Resolution**:
```typescript
generatePageMetadata('/dashboard/users/:id', {
  userName: 'John Doe',
  userId: '123'
});
// Result: title = "User: John Doe"
```

### Default Metadata

All pages inherit from `defaultMetadata`:
```typescript
export const defaultMetadata: PageMetadata = {
  title: 'Dashboard Application',
  description: 'Professional dashboard application',
  keywords: ['dashboard', 'admin', 'management'],
  openGraph: {
    type: 'website',
    siteName: 'Dashboard Application',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

## SEO Features

### Open Graph (Social Media Sharing)

**Configuration**:
```typescript
openGraph: {
  title: 'Page Title',
  description: 'Description for social sharing',
  type: 'website',  // or 'article', 'profile'
  images: [
    {
      url: '/og-image.svg',
      width: 1200,
      height: 630,
      alt: 'Image description',
    },
  ],
  locale: 'en_US',
  siteName: 'Dashboard Application',
}
```

**Image Requirements**:
- Dimensions: 1200x630 pixels (Facebook recommended)
- Format: PNG, JPG, or SVG
- Size: Under 8MB
- Absolute URL in production

**Testing**: Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

### Twitter Cards

**Configuration**:
```typescript
twitter: {
  card: 'summary_large_image',  // or 'summary', 'app', 'player'
  site: '@dashboard',
  creator: '@username',
  title: 'Page Title',
  description: 'Description for Twitter',
  images: ['/og-image.svg'],
}
```

**Testing**: Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Canonical URLs

**Automatic Generation**:
```typescript
// Automatically generated for all pages
canonical: 'https://yourdomain.com/dashboard/users'
```

**Custom Canonical**:
```typescript
'/dashboard/users': {
  canonical: 'https://yourdomain.com/users',
}
```

**Excluded Pages**:
- Authentication pages (login, signup)
- Error pages (403, 404, 500)
- Pages with `robots.index = false`

### Robots Meta Tags

**Public Page** (allow indexing):
```typescript
robots: {
  index: true,
  follow: true,
  maxImagePreview: 'large',
  maxSnippet: 160,
}
```

**Private Page** (prevent indexing):
```typescript
robots: {
  index: false,
  follow: false,
  noarchive: true,
  nosnippet: true,
}
```

**Settings Page** (no index, but follow links):
```typescript
robots: {
  index: false,
  follow: true,
  noarchive: true,
}
```

### Structured Data (JSON-LD)

**Breadcrumb Structured Data**:
```typescript
import { generateBreadcrumbStructuredData } from '@/lib/structured-data-helpers';

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Users', href: '/dashboard/users' }
];

const structuredData = generateBreadcrumbStructuredData(breadcrumbs);

// In page:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
```

**Article Structured Data**:
```typescript
import { generateArticleStructuredData } from '@/lib/structured-data-helpers';

const articleData = generateArticleStructuredData({
  headline: 'Article Title',
  description: 'Article description',
  image: 'https://example.com/image.jpg',
  datePublished: '2024-01-15',
  author: { name: 'John Doe' },
});
```

**Profile Structured Data**:
```typescript
import { generateProfileStructuredData } from '@/lib/structured-data-helpers';

const profileData = generateProfileStructuredData({
  name: 'John Doe',
  email: 'john@example.com',
  jobTitle: 'Software Engineer',
  url: 'https://example.com/users/john',
});
```

**Organization Structured Data**:
```typescript
import { generateOrganizationStructuredData } from '@/lib/structured-data-helpers';

const orgData = generateOrganizationStructuredData({
  name: 'Dashboard Company',
  url: 'https://example.com',
  logo: 'https://example.com/logo.png',
});
```

## Breadcrumb Navigation

### Automatic Generation

Breadcrumbs are automatically generated from the pathname:
- `/dashboard/users` → Home > Dashboard > Users
- `/dashboard/users/123` → Home > Dashboard > Users > {userName}

### Configuration

**Static Label**:
```typescript
'/dashboard/users': {
  breadcrumb: { label: 'Users' }
}
```

**Dynamic Label**:
```typescript
'/dashboard/users/:id': {
  breadcrumb: { label: '{userName}', dynamic: true }
}
```

**Hidden Breadcrumb**:
```typescript
'/dashboard/internal': {
  breadcrumb: { label: 'Internal', hidden: true }
}
```

### Component Usage

**Basic**:
```typescript
<Breadcrumb />
```

**With Dynamic Values**:
```typescript
<Breadcrumb dynamicValues={{ userName: 'John Doe' }} />
```

**Without Home Icon**:
```typescript
<Breadcrumb showHome={false} />
```

**Custom Separator**:
```typescript
<Breadcrumb separator={<span>/</span>} />
```

**Max Items (Truncation)**:
```typescript
<Breadcrumb maxItems={3} />
// Shows: Home > ... > Current
```

**Compact Mobile Version**:
```typescript
import { BreadcrumbCompact } from '@/components/navigation/Breadcrumb';

<BreadcrumbCompact dynamicValues={{ userName: 'John' }} />
// Shows: < Parent > Current
```

### Accessibility

**ARIA Labels**:
- `aria-label="Breadcrumb"` on nav element
- `aria-current="page"` on current item

**Keyboard Navigation**:
- Tab through breadcrumb links
- Enter/Space to activate links
- Focus indicators visible

**Screen Reader Support**:
- Semantic HTML (`<nav>`, `<ol>`, `<li>`)
- Proper link text
- Current page announced

## Client-Side Metadata Updates

### MetadataContext

**Provider Setup** (already configured in `layout.tsx`):
```typescript
import { MetadataProvider } from '@/contexts/MetadataContext';

<MetadataProvider>
  <App />
</MetadataProvider>
```

**Using the Hook**:
```typescript
import { useMetadata } from '@/contexts/MetadataContext';

function MyComponent() {
  const {
    metadata,           // Current metadata
    dynamicValues,      // Current dynamic values
    updateMetadata,     // Update metadata
    setDynamicValues,   // Set dynamic values
    resetMetadata,      // Reset to initial state
  } = useMetadata();
  
  useEffect(() => {
    // Update page title and description
    updateMetadata({
      title: 'New Page Title',
      description: 'Updated description',
    });
    
    // Update breadcrumb labels
    setDynamicValues({
      userName: 'John Doe',
      userId: '123',
    });
  }, []);
}
```

**What Gets Updated**:
- Document title (`<title>`)
- Meta description
- Meta keywords
- Canonical URL
- Open Graph tags
- Twitter Card tags
- Robots meta tag
- Structured data (JSON-LD)

**Debouncing**: Updates are debounced by 150ms to prevent excessive DOM updates.

## Common Tasks

### Adding a New Page with Metadata

1. **Add to metadata config**:
```typescript
// frontend/src/lib/metadata-config.ts
'/dashboard/new-page': {
  title: 'New Page',
  description: 'Description of new page',
  keywords: ['keyword1', 'keyword2'],
  breadcrumb: { label: 'New Page' },
}
```

2. **Create page with metadata**:
```typescript
// frontend/src/app/dashboard/new-page/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = generatePageMetadata('/dashboard/new-page');

export default function NewPage() {
  return (
    <div>
      <PageHeader
        title="New Page"
        description="Description of new page"
      />
      {/* Content */}
    </div>
  );
}
```

### Adding a Dynamic Page

1. **Add pattern to config**:
```typescript
'/dashboard/posts/:id': {
  title: 'Post: {postTitle}',
  description: 'View post details',
  breadcrumb: { label: '{postTitle}', dynamic: true },
}
```

2. **Create page with generateMetadata**:
```typescript
// frontend/src/app/dashboard/posts/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchPost(params.id);
  
  return generatePageMetadata('/dashboard/posts/:id', {
    postTitle: post.title,
    postId: params.id,
  });
}

export default async function PostPage({ params }) {
  const post = await fetchPost(params.id);
  
  return (
    <div>
      <PageHeader title={post.title} />
      {/* Content */}
    </div>
  );
}
```

### Updating Metadata Dynamically

```typescript
'use client';

function EditPostPage({ params }) {
  const { updateMetadata, setDynamicValues } = useMetadata();
  const [post, setPost] = useState(null);
  
  useEffect(() => {
    async function loadPost() {
      const data = await fetchPost(params.id);
      setPost(data);
      
      // Update metadata
      updateMetadata({
        title: `Edit ${data.title}`,
        description: `Edit post: ${data.title}`,
      });
      
      // Update breadcrumbs
      setDynamicValues({
        postTitle: data.title,
        postId: params.id,
      });
    }
    
    loadPost();
  }, [params.id]);
}
```

### Adding Custom OG Image

1. **Create image** (1200x630 pixels)
2. **Add to public folder**: `/public/og-analytics.png`
3. **Configure in metadata**:
```typescript
'/dashboard/analytics': {
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
}
```

### Preventing Page Indexing

```typescript
'/dashboard/settings': {
  robots: {
    index: false,
    follow: true,
    noarchive: true,
  },
}
```

## Performance Optimization

### Caching

**Metadata Cache**:
- Path-based metadata cached in `pathMetadataCache`
- Template resolution cached in `templateCache`
- Breadcrumb generation cached in `breadcrumbCache`

**Cache Invalidation**:
```typescript
import { clearMetadataCache } from '@/lib/metadata-helpers';
import { clearBreadcrumbCache } from '@/lib/breadcrumb-helpers';

clearMetadataCache();
clearBreadcrumbCache();
```

### Memoization

**Breadcrumb Component**:
```typescript
export const Breadcrumb = React.memo(function Breadcrumb(props) {
  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(pathname, dynamicValues);
  }, [pathname, dynamicValues]);
});
```

**Metadata Resolution**:
- `getMetadataForPath()` - Memoized
- `resolveMetadataTemplate()` - Memoized
- `generateBreadcrumbs()` - Memoized

### Bundle Optimization

**Lazy Loading** (optional):
```typescript
// Split large metadata configs
const metadataConfig = {
  get '/dashboard/users'() {
    return import('./metadata/users').then(m => m.usersMetadata);
  },
};
```

## Sitemap Generation

### Automatic Sitemap

**Route**: `/sitemap.xml`

**How It Works**:
1. Extracts routes from `metadata-config.ts`
2. Excludes dynamic routes (`:param`)
3. Excludes noindex pages
4. Assigns change frequency and priority
5. Generates XML sitemap

**Change Frequencies**:
- Home: `daily`, priority 1.0
- Dashboard: `daily`, priority 0.9
- Analytics: `daily`, priority 0.8
- User management: `weekly`, priority 0.7
- Other pages: `weekly`, priority 0.6

**Submission**:
- Google Search Console: https://search.google.com/search-console
- Bing Webmaster Tools: https://www.bing.com/webmasters

### robots.txt

**Location**: `/public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /login
Disallow: /signup
Disallow: /dashboard/settings
Sitemap: https://yourdomain.com/sitemap.xml
```

**Update for Production**: Replace `yourdomain.com` with actual domain.

## Testing & Validation

### SEO Testing Tools

1. **Google Search Console**: Monitor indexing and search performance
2. **Bing Webmaster Tools**: Monitor Bing indexing
3. **Facebook Sharing Debugger**: Test Open Graph tags
4. **Twitter Card Validator**: Test Twitter Cards
5. **Lighthouse**: Audit SEO score (target: 90+)
6. **Schema.org Validator**: Test structured data

### Manual Testing

**View Page Source**:
```bash
# Check meta tags in HTML
curl https://yourdomain.com/dashboard | grep '<meta'
```

**Test Social Sharing**:
1. Share URL on Facebook/Twitter
2. Verify preview shows correct title, description, image

**Test Breadcrumbs**:
1. Navigate to nested pages
2. Verify breadcrumb path is correct
3. Test breadcrumb navigation

**Test Sitemap**:
```bash
curl https://yourdomain.com/sitemap.xml
```

### Lighthouse Audit

```bash
npx lighthouse https://yourdomain.com --only-categories=seo
```

**Target Scores**:
- SEO: 90+
- Accessibility: 90+
- Best Practices: 90+

## Troubleshooting

### Metadata Not Updating

**Cause**: Cache or server-side rendering issue

**Solution**:
1. Clear browser cache
2. Check if page is server-rendered (view source)
3. Verify `generatePageMetadata()` is called
4. Check for errors in browser console

### Breadcrumbs Not Showing

**Cause**: Missing configuration or hidden breadcrumb

**Solution**:
1. Check `metadataConfig` has entry for route
2. Verify `breadcrumb.hidden` is not `true`
3. Check pathname matches route pattern
4. Verify `Breadcrumb` component is rendered

### OG Image Not Displaying

**Cause**: Image URL or dimensions issue

**Solution**:
1. Verify image URL is absolute in production
2. Check image dimensions (1200x630)
3. Clear Facebook cache: https://developers.facebook.com/tools/debug/
4. Verify image is publicly accessible

### Dynamic Values Not Resolving

**Cause**: Template variables not provided

**Solution**:
1. Check `dynamicValues` passed to `generatePageMetadata()`
2. Verify variable names match template `{variableName}`
3. Check `setDynamicValues()` called in client component
4. Look for warnings in console

### Page Not in Sitemap

**Cause**: Route excluded or noindex

**Solution**:
1. Check route doesn't contain `:param`
2. Verify `robots.index` is not `false`
3. Check route is in `metadataConfig`
4. Rebuild sitemap (restart dev server)

## Production Checklist

Before deploying:

- [ ] Set `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Update `robots.txt` with production domain
- [ ] Update sitemap URL in `robots.txt`
- [ ] Create custom OG images for key pages
- [ ] Test all meta tags in production
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Test social sharing on Facebook/Twitter
- [ ] Run Lighthouse SEO audit
- [ ] Verify canonical URLs are absolute
- [ ] Check all pages have unique titles/descriptions

## Environment Variables

```env
# frontend/.env.production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Dashboard Application
NEXT_PUBLIC_DEFAULT_OG_IMAGE=/og-image.svg
```

## Resources

- **Spec Files**: `.kiro/specs/page-metadata-system/`
- **Requirements**: `.kiro/specs/page-metadata-system/requirements.md`
- **Design Doc**: `.kiro/specs/page-metadata-system/design.md`
- **Tasks**: `.kiro/specs/page-metadata-system/tasks.md`
- **SEO Guide**: `frontend/src/lib/README-SEO.md`
- **Metadata Usage**: `frontend/src/lib/README-METADATA-USAGE.md`

## Quick Command Reference

### Add Metadata to Page
```typescript
export const metadata = generatePageMetadata('/path');
```

### Add Dynamic Metadata
```typescript
export async function generateMetadata({ params }) {
  return generatePageMetadata('/path/:id', { key: value });
}
```

### Add Breadcrumbs
```typescript
<Breadcrumb />
```

### Update Metadata Client-Side
```typescript
const { updateMetadata } = useMetadata();
updateMetadata({ title: 'New Title' });
```

### Add Structured Data
```typescript
const data = generateBreadcrumbStructuredData(breadcrumbs);
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
```

### Clear Cache
```typescript
clearMetadataCache();
clearBreadcrumbCache();
```