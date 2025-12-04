# Landing Page & Blog System Spec

## Overview

This spec adds an optional landing page and blog system to the dashboard starter kit. Both features can be independently enabled/disabled via configuration, making the kit adaptable for different use cases.

## Features

### Landing Page
- Professional home page with hero section
- Features showcase
- Call-to-action buttons
- Responsive footer
- Full SEO optimization

### Blog System
- Public blog listing and individual post pages
- Dashboard management with CRUD operations
- Rich markdown editor with image support
- Categories and tags for organization
- SEO optimization with metadata and structured data
- Permission-based access control

## Configuration

Both features are **disabled by default** and can be enabled via environment variables:

```env
# frontend/.env.local
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
```

## Getting Started

To implement this feature:

1. **Review the spec files:**
   - `requirements.md` - User stories and acceptance criteria
   - `design.md` - Technical architecture and implementation details
   - `tasks.md` - Step-by-step implementation tasks
   - `PRISMA_SYNC_INTEGRATION.md` - How the Prisma sync agent hook helps

2. **Understand the Prisma Sync Agent:**
   - Your project has an automated hook that handles database sync
   - When you define the schema (Task 2), it automatically creates migrations, DTOs, types, and tests
   - This significantly reduces manual work - see `PRISMA_SYNC_INTEGRATION.md` for details

3. **Start with task 1:**
   - Open `tasks.md` in Kiro
   - Click "Start task" next to task 1
   - Follow the implementation plan sequentially
   - Task 2 is simplified - just define the schema, the hook does the rest!

4. **Key integration points:**
   - Uses existing auth/permissions system
   - Integrates with metadata/SEO system
   - Leverages existing file upload module
   - Follows dashboard design patterns
   - Prisma sync agent handles type synchronization

## Architecture

```
Configuration Layer (Feature Flags)
    ├── Landing Page (Optional)
    │   ├── Hero Section
    │   ├── Features Section
    │   └── Footer
    │
    └── Blog System (Optional)
        ├── Public Pages
        │   ├── Blog Listing (/blog)
        │   └── Blog Post (/blog/[slug])
        │
        └── Dashboard Management
            ├── Post List (/dashboard/blog)
            ├── Create/Edit Post
            └── Categories/Tags
```

## Database Schema

### BlogPost
- Core fields: title, slug, content, excerpt, status
- Media: featuredImage
- Metadata: publishedAt, author
- Organization: categories, tags
- SEO: metaTitle, metaDescription

### Permissions
- `blog:read` - View blog posts in dashboard
- `blog:write` - Create and edit posts
- `blog:delete` - Delete posts
- `blog:publish` - Publish/unpublish posts

## API Endpoints

**Public (no auth):**
- `GET /blog` - List published posts
- `GET /blog/:slug` - Get single post

**Protected (requires permissions):**
- `GET /blog/admin` - List all posts
- `POST /blog` - Create post
- `PATCH /blog/:id` - Update post
- `DELETE /blog/:id` - Delete post
- `PATCH /blog/:id/publish` - Publish post

## SEO Integration

- Automatic metadata generation for all pages
- Breadcrumb navigation
- Structured data (JSON-LD) for articles
- Sitemap integration
- Open Graph tags for social sharing

## Testing Strategy

- Backend unit tests (optional)
- Frontend component tests (optional)
- E2E integration tests
- Permission guard tests
- SEO metadata validation

## Implementation Notes

- **Modular Design**: Features can be enabled/disabled independently
- **Existing Systems**: Leverages auth, permissions, metadata, and upload systems
- **Performance**: Uses ISR, caching, and pagination
- **Accessibility**: WCAG AA compliant
- **Security**: Input sanitization, XSS prevention, permission checks

## Next Steps

1. Review requirements and design documents
2. Start implementing tasks sequentially
3. Test each feature as you build
4. Update documentation as needed

## Questions?

Refer to the detailed design document for technical specifications, or ask Kiro for help with specific implementation tasks.
