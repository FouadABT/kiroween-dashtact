# Configuration System

This directory contains configuration files for the dashboard starter kit, including feature flags and application settings.

## Features Configuration

The `features.config.ts` file provides centralized control over optional features in the application.

### Available Features

#### 1. Landing Page

Controls whether a public landing page is shown at the root route (`/`).

**Environment Variable:** `NEXT_PUBLIC_ENABLE_LANDING`

**Values:**
- `true` - Landing page is shown at `/`
- `false` (default) - Root route redirects to `/dashboard` (authenticated) or `/login` (unauthenticated)

**Usage:**
```typescript
import { featuresConfig } from '@/config/features.config';

if (featuresConfig.landingPage.enabled) {
  // Show landing page
}
```

#### 2. Blog System

Controls whether blog functionality is available in the application.

**Environment Variable:** `NEXT_PUBLIC_ENABLE_BLOG`

**Values:**
- `true` - Blog routes are accessible
- `false` (default) - Blog routes return 404

**Additional Blog Configuration:**

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_BLOG_POSTS_PER_PAGE` | `10` | Number of posts per page |
| `NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES` | `true` | Enable category organization |
| `NEXT_PUBLIC_BLOG_ENABLE_TAGS` | `true` | Enable tag organization |
| `NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR` | `false` | Require author for posts |

**Usage:**
```typescript
import { featuresConfig } from '@/config/features.config';

if (featuresConfig.blog.enabled) {
  // Show blog features
  const postsPerPage = featuresConfig.blog.postsPerPage;
}
```

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Feature Flags
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false

# Blog Configuration (only applies when blog is enabled)
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

## Middleware Integration

The configuration system works with Next.js middleware (`src/middleware.ts`) to handle server-side route protection:

- **Root Route (`/`)**: Redirects to `/dashboard` or `/login` when landing page is disabled
- **Blog Routes (`/blog/*`)**: Returns 404 when blog is disabled

## Helper Functions

### `isFeatureEnabled(feature)`

Check if a feature is enabled.

```typescript
import { isFeatureEnabled } from '@/config/features.config';

if (isFeatureEnabled('blog')) {
  // Blog is enabled
}
```

### `getRootRedirectUrl(isAuthenticated)`

Get the redirect URL for the root route when landing page is disabled.

```typescript
import { getRootRedirectUrl } from '@/config/features.config';

const redirectUrl = getRootRedirectUrl(true); // '/dashboard'
const redirectUrl = getRootRedirectUrl(false); // '/login'
```

## Use Cases

### 1. Internal Dashboard Only

Both features disabled - application functions as a pure dashboard.

```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

**Behavior:**
- `/` → Redirects to `/dashboard` (authenticated) or `/login` (unauthenticated)
- `/blog` → 404 Not Found

### 2. Dashboard with Landing Page

Landing enabled, blog disabled - marketing site with dashboard.

```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=false
```

**Behavior:**
- `/` → Shows landing page
- `/blog` → 404 Not Found
- `/login`, `/signup` → Authentication pages
- `/dashboard` → Protected dashboard

### 3. Dashboard with Blog

Landing disabled, blog enabled - content platform.

```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Behavior:**
- `/` → Redirects to `/dashboard` or `/login`
- `/blog` → Public blog listing
- `/blog/[slug]` → Individual blog posts
- `/dashboard/blog` → Blog management (requires `blog:read` permission)

### 4. Full Public Site

Both features enabled - complete public-facing application.

```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Behavior:**
- `/` → Landing page
- `/blog` → Public blog
- `/dashboard` → Protected dashboard
- `/dashboard/blog` → Blog management

## Navigation Integration

The navigation system automatically shows/hides blog menu items based on the feature flag:

```typescript
// In NavigationContext.tsx
const navigationItems = [
  // ... other items
  ...(featuresConfig.blog.enabled ? [{
    title: "Blog",
    href: "/dashboard/blog",
    icon: FileText,
    permission: "blog:read",
  }] : []),
];
```

## Testing Feature Flags

### Development

1. Update `.env.local` with desired feature flags
2. Restart the development server: `npm run dev`
3. Test the application behavior

### Production

1. Set environment variables in your hosting platform
2. Rebuild the application: `npm run build`
3. Deploy the new build

## Best Practices

1. **Always restart the dev server** after changing environment variables
2. **Document feature dependencies** if adding new features
3. **Test all combinations** of feature flags before deploying
4. **Use TypeScript** to ensure type safety when accessing config
5. **Keep feature flags simple** - avoid complex conditional logic

## Adding New Features

To add a new feature flag:

1. **Add environment variable** to `.env.local`:
   ```env
   NEXT_PUBLIC_ENABLE_MY_FEATURE=false
   ```

2. **Update `features.config.ts`**:
   ```typescript
   export interface FeaturesConfig {
     // ... existing features
     myFeature: {
       enabled: boolean;
     };
   }

   export const featuresConfig: FeaturesConfig = {
     // ... existing features
     myFeature: {
       enabled: process.env.NEXT_PUBLIC_ENABLE_MY_FEATURE === 'true',
     },
   };
   ```

3. **Update middleware** if route protection is needed:
   ```typescript
   if (pathname.startsWith('/my-feature') && !myFeatureEnabled) {
     return NextResponse.rewrite(new URL('/404', request.url));
   }
   ```

4. **Update navigation** if menu items are needed:
   ```typescript
   ...(featuresConfig.myFeature.enabled ? [{
     title: "My Feature",
     href: "/dashboard/my-feature",
     icon: MyIcon,
   }] : []),
   ```

5. **Document the feature** in this README

## Troubleshooting

### Feature flag not working

**Problem:** Changed environment variable but feature still disabled/enabled

**Solution:**
1. Verify the variable is in `.env.local` (not `.env`)
2. Restart the development server
3. Clear browser cache
4. Check for typos in variable name

### Middleware not redirecting

**Problem:** Routes not being protected as expected

**Solution:**
1. Check middleware matcher configuration
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Test with different authentication states

### Navigation item not showing

**Problem:** Blog menu item not appearing when enabled

**Solution:**
1. Verify `NEXT_PUBLIC_ENABLE_BLOG=true`
2. Check user has `blog:read` permission
3. Restart development server
4. Clear browser cache

## Related Files

- `src/middleware.ts` - Server-side route handling
- `src/app/page.tsx` - Root page with feature flag logic
- `src/contexts/NavigationContext.tsx` - Navigation with conditional items
- `.env.local` - Environment variables
- `src/config/auth.config.ts` - Authentication configuration

## Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
