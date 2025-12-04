# Landing Page CMS - Specification

## Overview

The Landing Page CMS feature adds a comprehensive content management system for landing pages and custom pages to the dashboard starter kit. It enables administrators to customize the existing landing page through a flexible section-based editor and create custom pages (similar to WordPress pages) accessible via clean URLs.

## Key Features

### Landing Page Editor
- **Flexible Section System**: Add, remove, reorder, and customize sections dynamically
- **7 Built-in Section Types**: Hero, Features, Footer, CTA, Testimonials, Stats, Content
- **Live Preview**: Split-screen editor with real-time preview (desktop/mobile toggle)
- **Section Management**: Enable/disable, duplicate, drag-and-drop reordering
- **Global Settings**: SEO metadata, theme overrides, layout settings
- **Page Linking**: CTA buttons can link to custom pages

### Custom Pages System
- **Full CRUD Operations**: Create, read, update, delete pages
- **Clean URLs**: Access pages via /{slug} or /{parent}/{child}
- **Page Hierarchy**: Parent-child relationships for nested pages
- **Draft/Publish Workflow**: Save as draft, preview, then publish
- **SEO Optimization**: Meta title, description, keywords, featured image
- **Slug Management**: Auto-generate from title, validate uniqueness, prevent conflicts
- **Automatic Redirects**: 301 redirects when slugs change
- **Navigation Integration**: Auto-add pages to site navigation
- **Permission-Based Access**: Granular permissions (pages:read, pages:write, pages:delete, pages:publish)

### Integration
- **Permission System**: landing:*, pages:* permissions
- **Metadata System**: SEO tags, breadcrumbs, structured data
- **Navigation System**: Auto-add pages to menus
- **Upload Service**: Hero images, featured images
- **Theme System**: Global styling consistency
- **Sitemap**: Include custom pages for SEO

## Database Schema

### LandingPageContent
- Flexible JSON sections array
- Global settings (theme, layout, SEO)
- Version control

### CustomPage
- Title, slug, content, excerpt
- Featured image
- Status (DRAFT, PUBLISHED, ARCHIVED)
- Visibility (PUBLIC, PRIVATE)
- Parent-child hierarchy
- Navigation settings (showInNavigation, displayOrder)
- SEO metadata (metaTitle, metaDescription, metaKeywords)
- Custom CSS class and template key

### PageRedirect
- Automatic 301 redirects when slugs change
- fromSlug → toPageId mapping

## Architecture

### Backend (NestJS)
- **Landing Module**: LandingService, LandingController
- **Pages Module**: PagesService, SlugService, RedirectService, PagesController
- **DTOs**: Comprehensive validation for all inputs
- **Caching**: 5-minute TTL with invalidation on updates

### Frontend (Next.js 14)
- **Landing Page Editor**: `/dashboard/settings/landing-page`
- **Pages Dashboard**: `/dashboard/pages`
- **Page Editor**: `/dashboard/pages/[id]/edit`
- **Public Pages**: `/[...slug]` (dynamic routes)
- **Components**: Section editors, page selector, slug input, image upload

## Permissions

### Landing Page
- `landing:read` - View landing page content in admin
- `landing:write` - Edit landing page content

### Custom Pages
- `pages:read` - View custom pages in admin
- `pages:write` - Create and edit custom pages
- `pages:delete` - Delete custom pages
- `pages:publish` - Publish and unpublish custom pages

## Implementation Plan

### Phase 1: Database and Backend (Tasks 1-4)
1. Create Prisma schema models
2. Implement landing page backend module
3. Implement custom pages backend module
4. Add permissions and seed data

### Phase 2: Frontend Editors (Tasks 5-7)
5. Build landing page editor with section management
6. Build pages management dashboard
7. Build page editor with slug validation

### Phase 3: Public Rendering (Tasks 8-9)
8. Implement public page rendering with SEO
9. Update landing page to render from database

### Phase 4: Integrations (Tasks 10-13)
10. Integrate with navigation system
11. Add pages to sitemap
12. Integrate with metadata system
13. Integrate with upload service

### Phase 5: Polish (Tasks 14-17)
14. Performance optimization (caching, pagination)
15. Responsive design for all components
16. Documentation (user guides, API docs)
17. Final integration testing and polish

## Timeline

- **MVP (Core Features)**: 8-12 days
- **With Optional Tests**: 12-16 days
- **Full Production Ready**: 16-20 days

## Getting Started

### For Developers

1. **Read the Requirements**: `.kiro/specs/landing-page-cms/requirements.md`
2. **Review the Design**: `.kiro/specs/landing-page-cms/design.md`
3. **Follow the Tasks**: `.kiro/specs/landing-page-cms/tasks.md`
4. **Start with Task 1**: Create database schema (Prisma sync agent will handle the rest)

### For Users

Once implemented, you can:

1. **Customize Landing Page**:
   - Navigate to `/dashboard/settings/landing-page`
   - Add, remove, or reorder sections
   - Edit section content
   - Save and publish changes

2. **Create Custom Pages**:
   - Navigate to `/dashboard/pages`
   - Click "Create Page"
   - Fill in title, content, and settings
   - Save as draft or publish immediately
   - Access page at `/{slug}`

3. **Manage Page Hierarchy**:
   - Create parent pages (e.g., "Company")
   - Create child pages (e.g., "About", "Team")
   - Access nested pages at `/{parent}/{child}`

## Technical Highlights

- **Flexible Section System**: JSON-based sections allow unlimited customization
- **Type Safety**: Comprehensive TypeScript interfaces and DTOs
- **Performance**: 5-minute caching with smart invalidation
- **SEO Optimized**: Full metadata, structured data, sitemap integration
- **Security**: Permission-based access, input validation, XSS prevention
- **Responsive**: Mobile-first design for all components
- **Accessible**: WCAG 2.1 AA compliant

## Resources

- **Requirements**: `.kiro/specs/landing-page-cms/requirements.md`
- **Design**: `.kiro/specs/landing-page-cms/design.md`
- **Tasks**: `.kiro/specs/landing-page-cms/tasks.md`
- **README**: `.kiro/specs/landing-page-cms/README.md` (this file)

## Support

For questions or issues during implementation:
1. Review the design document for architecture details
2. Check the requirements for acceptance criteria
3. Follow the tasks in sequential order
4. Leverage existing patterns from blog and notification systems

## Next Steps

1. Review and approve this specification
2. Begin with Task 1: Database Schema Implementation
3. Let the Prisma Sync Agent handle type synchronization
4. Follow tasks sequentially for best results

---

**Status**: ✅ Specification Complete - Ready for Implementation

**Last Updated**: 2025-11-12
