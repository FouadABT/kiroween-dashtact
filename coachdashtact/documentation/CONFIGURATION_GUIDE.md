# Landing Page & Blog System - Configuration Guide

This guide explains how to enable, disable, and configure the optional landing page and blog features in the dashboard starter kit.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Feature Flags](#feature-flags)
- [Use Cases](#use-cases)
- [Configuration Options](#configuration-options)
- [Route Behavior](#route-behavior)
- [Navigation Integration](#navigation-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The dashboard starter kit includes two optional features that can be independently enabled or disabled:

1. **Landing Page** - A public-facing home page with hero section, features, and call-to-action
2. **Blog System** - A complete blog with public pages and dashboard management

Both features are **disabled by default**, making the kit function as a pure internal dashboard.

## Quick Start

### Step 1: Configure Environment Variables

Copy the example environment file:

```bash
cd frontend
cp .env.example .env.local
```

### Step 2: Enable Features

Edit `frontend/.env.local` and set the desired feature flags:

```env
# Enable landing page
NEXT_PUBLIC_ENABLE_LANDING=true

# Enable blog
NEXT_PUBLIC_ENABLE_BLOG=true
```

### Step 3: Restart Development Server

```bash
npm run dev
```

### Step 4: Test the Configuration

- Visit `http://localhost:3000/` to see the landing page (if enabled)
- Visit `http://localhost:3000/blog` to see the blog (if enabled)
- Visit `http://localhost:3000/dashboard` to access the dashboard

## Feature Flags

### Landing Page Flag

**Environment Variable:** `NEXT_PUBLIC_ENABLE_LANDING`

**Values:**
- `true` - Landing page is shown at root route (`/`)
- `false` (default) - Root route redirects based on authentication

**When Enabled:**
- `/` shows the landing page
- Users can access `/login` and `/signup` from landing page
- Authenticated users can still access `/dashboard`

**When Disabled:**
- `/` redirects to `/dashboard` (if authenticated)
- `/` redirects to `/login` (if not authenticated)
- Application functions as internal dashboard only

### Blog Flag

**Environment Variable:** `NEXT_PUBLIC_ENABLE_BLOG`

**Values:**
- `true` - Blog routes are accessible
- `false` (default) - Blog routes return 404

**When Enabled:**
- `/blog` shows public blog listing
- `/blog/[slug]` shows individual blog posts
- `/dashboard/blog` shows blog management (requires `blog:read` permission)
- Blog navigation appears in dashboard sidebar (if user has permission)

**When Disabled:**
- All `/blog/*` routes return 404
- Blog navigation hidden from dashboard
- Blog management pages inaccessible

## Use Cases

### Use Case 1: Internal Dashboard Only

**Configuration:**
```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

**Best For:**
- Internal company dashboards
- Admin panels
- Private applications
- SaaS admin interfaces

**Behavior:**
- Root route redirects to dashboard or login
- No public pages
- All routes require authentication
- Minimal public surface area

### Use Case 2: Dashboard with Landing Page

**Configuration:**
```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=false
```

**Best For:**
- SaaS products with marketing site
- Applications with public homepage
- Products requiring user signup
- Marketing-driven applications

**Behavior:**
- Public landing page at root
- Sign up and login CTAs
- Dashboard for authenticated users
- No blog functionality

### Use Case 3: Dashboard with Blog

**Configuration:**
```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Best For:**
- Content management platforms
- Publishing platforms
- Documentation sites with admin
- Knowledge bases

**Behavior:**
- Root redirects to dashboard/login
- Public blog accessible
- Blog management in dashboard
- Content-focused application

### Use Case 4: Full Public Site

**Configuration:**
```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Best For:**
- Complete web applications
- SaaS with content marketing
- Community platforms
- Full-featured websites

**Behavior:**
- Public landing page
- Public blog
- Dashboard for authenticated users
- Blog management for authorized users
- Complete public presence

## Configuration Options

### Blog Configuration

When blog is enabled, additional configuration options are available:

#### Posts Per Page

**Variable:** `NEXT_PUBLIC_BLOG_POSTS_PER_PAGE`  
**Default:** `10`  
**Description:** Number of blog posts to display per page in the blog listing.

```env
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=15
```

#### Enable Categories

**Variable:** `NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES`  
**Default:** `true`  
**Description:** Enable category organization for blog posts.

```env
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
```

When enabled:
- Blog posts can be assigned to categories
- Category filter available in blog listing
- Category management in dashboard

#### Enable Tags

**Variable:** `NEXT_PUBLIC_BLOG_ENABLE_TAGS`  
**Default:** `true`  
**Description:** Enable tag organization for blog posts.

```env
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
```

When enabled:
- Blog posts can be tagged
- Tag filter available in blog listing
- Tag management in dashboard

#### Require Author

**Variable:** `NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR`  
**Default:** `false`  
**Description:** Make author information required for blog posts.

```env
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=true
```

When enabled:
- Author name and email required for posts
- Author information displayed on posts
- Better for multi-author blogs

When disabled:
- Author information optional
- Better for single-author or anonymous blogs
- More flexible SEO options

## Route Behavior

### Root Route (`/`)

| Landing Enabled | Authenticated | Behavior |
|----------------|---------------|----------|
| `true` | Yes | Shows landing page |
| `true` | No | Shows landing page |
| `false` | Yes | Redirects to `/dashboard` |
| `false` | No | Redirects to `/login` |

### Blog Routes (`/blog`, `/blog/[slug]`)

| Blog Enabled | Behavior |
|-------------|----------|
| `true` | Shows blog pages (public access) |
| `false` | Returns 404 Not Found |

### Blog Management (`/dashboard/blog`)

| Blog Enabled | Has Permission | Behavior |
|-------------|----------------|----------|
| `true` | Yes (`blog:read`) | Shows blog management |
| `true` | No | Shows 403 Forbidden |
| `false` | Any | Returns 404 Not Found |

## Navigation Integration

The dashboard navigation automatically adapts based on feature flags and user permissions.

### Blog Navigation

When blog is enabled and user has `blog:read` permission:

```
Dashboard
├── Dashboard
├── Analytics
├── Data
├── Users
├── Permissions
├── Widgets
├── Notifications
├── Blog          ← Appears when enabled
└── Settings
```

When blog is disabled or user lacks permission:

```
Dashboard
├── Dashboard
├── Analytics
├── Data
├── Users
├── Permissions
├── Widgets
├── Notifications
└── Settings
```

### Implementation

The navigation system uses the features configuration:

```typescript
import { featuresConfig } from '@/config/features.config';

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

## Middleware Protection

The application uses Next.js middleware to enforce feature flags at the server level:

### Root Route Protection

```typescript
// When landing is disabled
if (pathname === '/' && !landingEnabled) {
  const token = request.cookies.get('auth-token');
  return NextResponse.redirect(token ? '/dashboard' : '/login');
}
```

### Blog Route Protection

```typescript
// When blog is disabled
if (pathname.startsWith('/blog') && !blogEnabled) {
  return NextResponse.rewrite(new URL('/404', request.url));
}
```

## Permissions

Blog functionality requires specific permissions:

| Permission | Description | Required For |
|-----------|-------------|--------------|
| `blog:read` | View blog posts in dashboard | Blog management access |
| `blog:write` | Create and edit blog posts | Creating/editing posts |
| `blog:delete` | Delete blog posts | Deleting posts |
| `blog:publish` | Publish blog posts | Publishing posts |

### Assigning Permissions

Edit `backend/prisma/seed-data/auth.seed.ts`:

```typescript
ADMIN: {
  permissions: [
    // ... existing permissions
    'blog:read',
    'blog:write',
    'blog:delete',
    'blog:publish',
  ],
},
```

Then reseed the database:

```bash
cd backend
npm run prisma:seed
```

## Troubleshooting

### Feature flag not working

**Problem:** Changed environment variable but feature still disabled/enabled

**Solution:**
1. Verify the variable is in `.env.local` (not `.env`)
2. Restart the development server: `npm run dev`
3. Clear browser cache: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
4. Check for typos in variable name (must be exact)

### Landing page shows "Loading..." indefinitely

**Problem:** Landing page enabled but shows loading spinner

**Solution:**
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_ENABLE_LANDING=true` (not `True` or `TRUE`)
3. Restart development server
4. Clear Next.js cache: `rm -rf .next`

### Blog routes return 404

**Problem:** Blog enabled but routes show 404

**Solution:**
1. Verify `NEXT_PUBLIC_ENABLE_BLOG=true`
2. Check middleware configuration in `src/middleware.ts`
3. Restart development server
4. Test with: `curl http://localhost:3000/blog`

### Blog navigation not showing

**Problem:** Blog enabled but menu item not appearing

**Solution:**
1. Verify `NEXT_PUBLIC_ENABLE_BLOG=true`
2. Check user has `blog:read` permission
3. Check NavigationContext includes blog item
4. Restart development server
5. Log out and log back in (to refresh permissions)

### Root route redirects incorrectly

**Problem:** Landing enabled but root route redirects

**Solution:**
1. Check middleware matcher includes `/`
2. Verify environment variable is set correctly
3. Check for conflicting redirects in `page.tsx`
4. Clear browser cookies
5. Test in incognito/private window

## Development Workflow

### Testing Feature Combinations

1. **Test all four use cases** before deploying
2. **Test with different user roles** (Admin, Manager, User)
3. **Test authentication states** (logged in, logged out)
4. **Test route protection** (try accessing disabled features)
5. **Test navigation** (verify menu items appear/disappear)

### Making Changes

1. Update environment variables in `.env.local`
2. Restart development server
3. Test the changes
4. Update documentation if needed
5. Commit changes (excluding `.env.local`)

### Deploying

1. Set environment variables in hosting platform
2. Build the application: `npm run build`
3. Test the production build locally: `npm run start`
4. Deploy to hosting platform
5. Verify feature flags work in production

## Production Deployment

### Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

### Build Process

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm run start
```

### Verification

After deployment, verify:

- [ ] Root route behaves correctly
- [ ] Blog routes accessible (if enabled)
- [ ] Landing page shows (if enabled)
- [ ] Navigation items correct
- [ ] Permissions enforced
- [ ] Redirects work properly

## Best Practices

1. **Document your configuration** - Keep track of which features are enabled
2. **Test before deploying** - Verify all feature combinations work
3. **Use version control** - Commit `.env.example`, not `.env.local`
4. **Set production variables** - Configure hosting platform correctly
5. **Monitor after deployment** - Check logs for errors
6. **Keep features independent** - Don't create dependencies between features
7. **Update documentation** - Document any custom configurations

## Related Documentation

- [Features Configuration README](frontend/src/config/README.md)
- [Landing Page & Blog System Requirements](.kiro/specs/landing-page-blog-system/requirements.md)
- [Landing Page & Blog System Design](.kiro/specs/landing-page-blog-system/design.md)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## Support

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Related Documentation](#related-documentation)
3. Check browser console for errors
4. Check server logs for errors
5. Verify environment variables are set correctly

## Summary

The configuration system provides flexible control over optional features:

- **Simple** - Just set environment variables
- **Flexible** - Enable/disable features independently
- **Safe** - Server-side enforcement via middleware
- **Documented** - Comprehensive guides and examples
- **Tested** - Works with all feature combinations

Start with features disabled and enable them as needed for your use case.
