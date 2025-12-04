# Feature Flags - Quick Reference

Quick reference guide for enabling/disabling landing page and blog features.

## Enable/Disable Features

### Enable Landing Page

```env
# frontend/.env.local
NEXT_PUBLIC_ENABLE_LANDING=true
```

Then restart: `npm run dev`

### Enable Blog

```env
# frontend/.env.local
NEXT_PUBLIC_ENABLE_BLOG=true
```

Then restart: `npm run dev`

## Quick Commands

```bash
# Copy environment template
cp frontend/.env.example frontend/.env.local

# Edit environment variables
nano frontend/.env.local  # or use your editor

# Restart development server
cd frontend
npm run dev

# Build for production
npm run build

# Test production build
npm run start
```

## Feature Combinations

| Landing | Blog | Use Case |
|---------|------|----------|
| ❌ | ❌ | Internal dashboard only |
| ✅ | ❌ | Dashboard with marketing site |
| ❌ | ✅ | Dashboard with blog/content |
| ✅ | ✅ | Full public website |

## Route Behavior

### Landing Page Disabled (Default)

```
/ → /dashboard (authenticated)
/ → /login (not authenticated)
```

### Landing Page Enabled

```
/ → Landing page (all users)
```

### Blog Disabled (Default)

```
/blog → 404 Not Found
/blog/post-slug → 404 Not Found
/dashboard/blog → 404 Not Found
```

### Blog Enabled

```
/blog → Public blog listing
/blog/post-slug → Public blog post
/dashboard/blog → Blog management (requires blog:read permission)
```

## Code Usage

### Check if Feature is Enabled

```typescript
import { featuresConfig } from '@/config/features.config';

// Check landing page
if (featuresConfig.landingPage.enabled) {
  // Landing page is enabled
}

// Check blog
if (featuresConfig.blog.enabled) {
  // Blog is enabled
}

// Get blog config
const postsPerPage = featuresConfig.blog.postsPerPage;
```

### Helper Functions

```typescript
import { isFeatureEnabled, getRootRedirectUrl } from '@/config/features.config';

// Check feature
if (isFeatureEnabled('blog')) {
  // Blog is enabled
}

// Get redirect URL
const url = getRootRedirectUrl(true);  // '/dashboard'
const url = getRootRedirectUrl(false); // '/login'
```

## Blog Configuration

```env
# Number of posts per page (default: 10)
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=15

# Enable categories (default: true)
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true

# Enable tags (default: true)
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true

# Require author (default: false)
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

## Permissions

Blog requires these permissions:

```typescript
'blog:read'    // View blog management
'blog:write'   // Create/edit posts
'blog:delete'  // Delete posts
'blog:publish' // Publish posts
```

### Assign to Role

```typescript
// backend/prisma/seed-data/auth.seed.ts
ADMIN: {
  permissions: [
    'blog:read',
    'blog:write',
    'blog:delete',
    'blog:publish',
  ],
}
```

Then reseed:

```bash
cd backend
npm run prisma:seed
```

## Troubleshooting

### Feature not working?

1. Check `.env.local` (not `.env`)
2. Restart dev server
3. Clear browser cache (Ctrl+Shift+R)
4. Check for typos

### Blog navigation not showing?

1. Enable blog: `NEXT_PUBLIC_ENABLE_BLOG=true`
2. Assign permission: `blog:read`
3. Restart server
4. Log out and back in

### Root route redirecting?

1. Check: `NEXT_PUBLIC_ENABLE_LANDING=true`
2. Restart server
3. Clear cookies
4. Test in incognito

## Files Modified

- `frontend/src/config/features.config.ts` - Feature configuration
- `frontend/src/middleware.ts` - Route protection
- `frontend/src/app/page.tsx` - Root page logic
- `frontend/src/contexts/NavigationContext.tsx` - Navigation items
- `frontend/.env.local` - Environment variables

## Documentation

- [Full Configuration Guide](CONFIGURATION_GUIDE.md)
- [Features Config README](frontend/src/config/README.md)
- [Requirements](.kiro/specs/landing-page-blog-system/requirements.md)
- [Design](.kiro/specs/landing-page-blog-system/design.md)

## Testing Checklist

- [ ] Landing page shows when enabled
- [ ] Root redirects when landing disabled
- [ ] Blog routes work when enabled
- [ ] Blog routes 404 when disabled
- [ ] Blog navigation shows with permission
- [ ] Blog navigation hidden without permission
- [ ] All four use cases tested
- [ ] Production build works

## Production Deployment

1. Set environment variables in hosting platform
2. Build: `npm run build`
3. Deploy
4. Verify routes work correctly

## Quick Test

```bash
# Test landing page
curl http://localhost:3000/

# Test blog
curl http://localhost:3000/blog

# Test dashboard
curl http://localhost:3000/dashboard
```

## Environment Template

```env
# Feature Flags
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false

# Blog Config
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

---

**Need more details?** See [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)
