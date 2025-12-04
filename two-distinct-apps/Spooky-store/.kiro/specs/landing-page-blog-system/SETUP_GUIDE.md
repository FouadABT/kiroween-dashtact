# Landing Page & Blog System - Setup Guide

## Quick Start

This guide will help you set up the landing page and blog system in your dashboard application.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- PostgreSQL database running
- Backend and frontend servers set up
- Basic understanding of Next.js and NestJS

## Installation Steps

### Step 1: Enable Features

Edit your frontend environment file:

**File:** `frontend/.env.local`

```env
# Enable landing page
NEXT_PUBLIC_ENABLE_LANDING=true

# Enable blog system
NEXT_PUBLIC_ENABLE_BLOG=true

# Blog configuration (optional)
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

### Step 2: Run Database Migrations

The blog system requires database tables. Run the migration:

```bash
cd backend
npm run prisma:migrate
```

This creates the following tables:
- `blog_posts` - Blog post content and metadata
- `blog_categories` - Post categories
- `blog_tags` - Post tags

### Step 3: Add Blog Permissions

Seed the database with blog permissions:

```bash
cd backend
npm run prisma:seed
```

This adds the following permissions:
- `blog:read` - View blog posts in dashboard
- `blog:write` - Create and edit blog posts
- `blog:delete` - Delete blog posts
- `blog:publish` - Publish/unpublish blog posts

### Step 4: Generate Prisma Client

Generate the updated Prisma client:

```bash
cd backend
npm run prisma:generate
```

### Step 5: Restart Servers

Restart both backend and frontend servers to apply changes:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 6: Verify Installation

1. **Landing Page**: Visit `http://localhost:3000/` - you should see the landing page
2. **Blog**: Visit `http://localhost:3000/blog` - you should see the blog listing
3. **Dashboard**: Login and check if "Blog" appears in the navigation

## Configuration Options

### Landing Page Only

If you only want the landing page without the blog:

```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=false
```

### Blog Only

If you only want the blog without the landing page:

```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=true
```

### Internal Dashboard Only

If you don't want any public pages:

```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

## Assigning Blog Permissions

### Via Database Seed

Edit `backend/prisma/seed-data/auth.seed.ts`:

```typescript
export const DEFAULT_ROLES = {
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
};
```

Then reseed:

```bash
cd backend
npm run prisma:seed
```

### Via SQL

Alternatively, assign permissions directly:

```sql
-- Get role and permission IDs
SELECT id, name FROM user_roles;
SELECT id, name FROM permissions WHERE name LIKE 'blog:%';

-- Assign permissions to role
INSERT INTO role_permissions (role_id, permission_id)
VALUES 
  ('admin-role-id', 'blog-read-permission-id'),
  ('admin-role-id', 'blog-write-permission-id'),
  ('admin-role-id', 'blog-delete-permission-id'),
  ('admin-role-id', 'blog-publish-permission-id');
```

## Creating Your First Blog Post

### Via Dashboard

1. Login to your dashboard
2. Navigate to "Blog" in the sidebar
3. Click "Create Post"
4. Fill in the form:
   - **Title**: Your post title (slug auto-generated)
   - **Excerpt**: Short summary (optional, auto-generated if empty)
   - **Content**: Full post content in markdown
   - **Featured Image**: Upload an image (optional)
   - **Categories**: Select categories (if enabled)
   - **Tags**: Add tags (if enabled)
5. Click "Save Draft" or "Publish"

### Via API

```bash
curl -X POST http://localhost:3001/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is my first blog post!",
    "excerpt": "A short summary",
    "status": "PUBLISHED"
  }'
```

## Customizing the Landing Page

### Hero Section

Edit `frontend/src/components/landing/Hero.tsx`:

```typescript
<h1 className="text-4xl lg:text-6xl font-bold mb-6">
  Your Custom Headline
</h1>
<p className="text-xl text-muted-foreground mb-8">
  Your custom description
</p>
```

### Features Section

Edit `frontend/src/components/landing/Features.tsx`:

```typescript
const features = [
  {
    icon: YourIcon,
    title: 'Your Feature',
    description: 'Your description',
  },
  // Add more features...
];
```

### Footer

Edit `frontend/src/components/landing/Footer.tsx` to customize:
- Company information
- Navigation links
- Social media links
- Copyright notice

## SEO Configuration

### Landing Page SEO

Edit `frontend/src/lib/metadata-config.ts`:

```typescript
'/': {
  title: 'Your Site Title - Your Tagline',
  description: 'Your site description (150-160 characters)',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  openGraph: {
    title: 'Your OG Title',
    description: 'Your OG description',
    images: [{ url: '/og-landing.png', width: 1200, height: 630 }],
  },
}
```

### Blog SEO

Blog posts automatically get SEO metadata from:
- Post title → Page title
- Post excerpt → Meta description
- Featured image → OG image
- Publish date → Article metadata

## Troubleshooting

### Landing Page Not Showing

**Problem**: Visiting `/` redirects to `/dashboard` or `/login`

**Solution**:
1. Check `NEXT_PUBLIC_ENABLE_LANDING=true` in `.env.local`
2. Restart frontend server: `npm run dev`
3. Clear Next.js cache: `rm -rf .next`

### Blog Not in Navigation

**Problem**: "Blog" link doesn't appear in dashboard sidebar

**Solution**:
1. Check `NEXT_PUBLIC_ENABLE_BLOG=true` in `.env.local`
2. Verify user has `blog:read` permission
3. Restart frontend server

### Database Migration Fails

**Problem**: `npm run prisma:migrate` fails

**Solution**:
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `backend/.env`
3. Check database connection: `npx prisma db pull`
4. Review migration error message

### Blog Posts Not Saving

**Problem**: Creating/editing posts fails

**Solution**:
1. Check backend server is running on port 3001
2. Verify user has `blog:write` permission
3. Check browser console for errors
4. Review backend logs for validation errors

### Permission Denied

**Problem**: "You don't have permission to access this resource"

**Solution**:
1. Verify user has required permission (`blog:read`, `blog:write`, etc.)
2. Check role permissions in database
3. User must logout and login again after permission changes

## Next Steps

After setup:

1. **Customize Landing Page**: Edit components in `frontend/src/components/landing/`
2. **Create Content**: Start creating blog posts
3. **Configure SEO**: Update metadata in `metadata-config.ts`
4. **Add Categories**: Create categories for organizing posts
5. **Test Features**: Verify all functionality works as expected

## Additional Resources

- **Configuration Guide**: `CONFIGURATION_GUIDE.md` - Detailed configuration options
- **Environment Variables**: `ENVIRONMENT_VARIABLES.md` - Complete reference
- **Blog Management**: `BLOG_MANAGEMENT_GUIDE.md` - How to manage blog posts
- **Customization**: `CUSTOMIZATION_GUIDE.md` - Customizing appearance and behavior
- **API Reference**: `API_REFERENCE.md` - Backend API endpoints

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the design document: `design.md`
3. Check requirements: `requirements.md`
4. Ask Kiro for help with specific problems

## Quick Reference

```bash
# Enable features
# Edit frontend/.env.local:
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true

# Run migrations
cd backend
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed

# Restart servers
cd backend && npm run start:dev
cd frontend && npm run dev

# Verify
# Visit http://localhost:3000/
# Visit http://localhost:3000/blog
# Login and check dashboard navigation
```
