# Configuration Guide

## Overview

The landing page and blog system are optional features that can be independently enabled or disabled. This guide explains how to configure these features for your specific use case.

## Use Cases

### Internal Dashboard Only
**Configuration:**
```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

**Behavior:**
- Root route (/) redirects to /dashboard or /login
- No public-facing pages
- Blog management hidden from navigation
- Ideal for internal admin panels

### Dashboard with Landing Page
**Configuration:**
```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=false
```

**Behavior:**
- Root route (/) shows landing page
- Landing page has signup/login CTAs
- No blog functionality
- Ideal for SaaS products with marketing site

### Dashboard with Blog (No Landing)
**Configuration:**
```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Behavior:**
- Root route (/) redirects to /dashboard or /login
- Blog accessible at /blog (public)
- Blog management in dashboard
- Ideal for content-focused applications

### Full Public Site (Landing + Blog)
**Configuration:**
```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Behavior:**
- Root route (/) shows landing page
- Blog accessible at /blog
- Blog management in dashboard
- Ideal for complete public-facing applications

## Routing System

The system uses Next.js middleware for intelligent route handling based on feature flags. This provides:

- **Automatic redirects** when features are disabled
- **Authentication-aware routing** for the root path
- **404 handling** for disabled blog routes
- **Type-safe** route configuration

### How It Works

1. **Middleware checks** feature flags from environment variables
2. **Root route (/)** redirects to dashboard/login if landing page is disabled
3. **Blog routes (/blog/*)** return 404 if blog is disabled
4. **No code changes needed** - just update environment variables

### Middleware Configuration

The middleware is automatically configured in `frontend/src/middleware.ts` and handles:
- Feature flag validation
- Authentication state checking
- Smart redirects based on user state
- 404 responses for disabled features

## Configuration Files

### Environment Variables

**Location:** `frontend/.env.local`

```env
# Feature Flags
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true

# Blog Settings
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

### Features Configuration

**Location:** `frontend/src/config/features.config.ts`

```typescript
export const featuresConfig = {
  landingPage: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true',
  },
  blog: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
    postsPerPage: Number(process.env.NEXT_PUBLIC_BLOG_POSTS_PER_PAGE) || 10,
    enableCategories: process.env.NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES !== 'false',
    enableTags: process.env.NEXT_PUBLIC_BLOG_ENABLE_TAGS !== 'false',
    requireAuthor: process.env.NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR === 'true',
  },
};
```

## Customizing the Landing Page

### Hero Section

**Location:** `frontend/src/components/landing/Hero.tsx`

```typescript
export function Hero() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Customize headline */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Your Custom Headline Here
          </h1>
          
          {/* Customize description */}
          <p className="text-xl text-muted-foreground mb-8">
            Your custom description here
          </p>
          
          {/* Customize CTA buttons */}
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Features Section

**Location:** `frontend/src/components/landing/Features.tsx`

```typescript
const features = [
  {
    icon: Shield,
    title: 'Your Feature Title',
    description: 'Your feature description',
  },
  // Add more features...
];
```

### Footer

**Location:** `frontend/src/components/landing/Footer.tsx`

```typescript
export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        {/* Customize footer content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company info */}
          <div>
            <h3 className="font-bold mb-4">Your Company</h3>
            <p className="text-muted-foreground">
              Your company description
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="font-bold mb-4">Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          
          {/* Social */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            {/* Social links */}
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

## Blog Configuration

### Posts Per Page

Control pagination in `features.config.ts`:

```typescript
blog: {
  postsPerPage: 10, // Change this value
}
```

### Categories and Tags

Enable/disable in `features.config.ts`:

```typescript
blog: {
  enableCategories: true,  // Set to false to disable
  enableTags: true,        // Set to false to disable
}
```

### Blog Permissions

**Location:** `backend/prisma/seed-data/auth.seed.ts`

Assign blog permissions to roles:

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
MANAGER: {
  permissions: [
    // ... existing permissions
    'blog:read',
    'blog:write',
  ],
},
```

## Navigation Integration

The blog link automatically appears in the dashboard navigation when enabled:

**Location:** `frontend/src/contexts/NavigationContext.tsx`

```typescript
const navigationItems = [
  // ... existing items
  ...(featuresConfig.blog.enabled ? [{
    title: "Blog",
    href: "/dashboard/blog",
    icon: FileText,
    permission: "blog:read",
  }] : []),
];
```

## SEO Configuration

### Landing Page Metadata

**Location:** `frontend/src/lib/metadata-config.ts`

```typescript
'/': {
  title: 'Your Site Title',
  description: 'Your site description',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    title: 'Your OG Title',
    description: 'Your OG description',
    images: [{ url: '/og-landing.png' }],
  },
}
```

### Blog Metadata

```typescript
'/blog': {
  title: 'Blog - Your Site',
  description: 'Read our latest articles',
}
```

## Database Setup

### Initial Migration

After enabling blog for the first time:

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
```

### Adding Blog Permissions

If blog permissions aren't in your database:

```bash
cd backend
npm run prisma:seed
```

Or manually add via SQL:

```sql
INSERT INTO permissions (name, resource, action, description)
VALUES 
  ('blog:read', 'blog', 'read', 'View blog posts'),
  ('blog:write', 'blog', 'write', 'Create and edit blog posts'),
  ('blog:delete', 'blog', 'delete', 'Delete blog posts'),
  ('blog:publish', 'blog', 'publish', 'Publish blog posts');
```

## Deployment Considerations

### Environment Variables

Set in your deployment platform:

```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
```

### Build-Time Configuration

Features are configured at build time. After changing environment variables:

```bash
cd frontend
npm run build
```

### Database Migrations

Ensure migrations run before deployment:

```bash
cd backend
npm run prisma:migrate deploy
```

## Troubleshooting

### Landing Page Not Showing

**Check:**
1. `NEXT_PUBLIC_ENABLE_LANDING=true` in `.env.local`
2. Restart dev server after changing env vars
3. Clear Next.js cache: `rm -rf frontend/.next`

### Blog Not Appearing in Navigation

**Check:**
1. `NEXT_PUBLIC_ENABLE_BLOG=true` in `.env.local`
2. User has `blog:read` permission
3. Restart dev server

### Blog Posts Not Saving

**Check:**
1. Database migration completed
2. User has `blog:write` permission
3. Backend server running
4. Check browser console for errors

### SEO Metadata Not Updating

**Check:**
1. Metadata config includes route
2. `generatePageMetadata()` called in page
3. Clear browser cache
4. Check page source (View Source)

## Best Practices

### Landing Page
- Keep hero headline concise (under 10 words)
- Use high-quality images
- Optimize images for web (WebP format)
- Test on mobile devices
- A/B test CTA buttons

### Blog
- Write SEO-friendly titles (50-60 characters)
- Include meta descriptions (150-160 characters)
- Use featured images (1200x630px for OG)
- Organize with categories and tags
- Publish consistently

### Performance
- Enable ISR for blog pages
- Optimize images with Next.js Image
- Use pagination for large blogs
- Cache API responses
- Monitor Core Web Vitals

## Examples

### Minimal Configuration (Internal Dashboard)

```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

**Result:** Pure dashboard application, no public pages.

### Marketing Site Configuration

```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Result:** Full public site with landing page and blog.

### Content Platform Configuration

```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Result:** Blog-focused application with dashboard management.

## Support

For more information:
- Review `design.md` for technical details
- Check `requirements.md` for feature specifications
- See `tasks.md` for implementation steps
- Ask Kiro for help with specific issues
