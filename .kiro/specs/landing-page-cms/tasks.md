# Implementation Plan

## Overview

This implementation plan breaks down the Landing Page CMS feature into discrete, manageable tasks. Each task builds incrementally on previous work, following the pattern established in your dashboard starter kit.

**Note**: The Prisma sync hook will automatically handle backend sync, test generation, and type updates when you modify the schema in Task 1.

## Tasks

- [x] 1. Database Schema and Models

- [x] 1.1 Create Prisma schema for landing page and custom pages models

  - Add LandingPageContent model with flexible JSON sections array and global settings
  - Add CustomPage model with full metadata, hierarchy support, and SEO fields
  - Add PageRedirect model for automatic 301 redirects when slugs change
  - Add PageStatus enum (DRAFT, PUBLISHED, ARCHIVED)
  - Add PageVisibility enum (PUBLIC, PRIVATE)
  - Add indexes for performance (slug, status, visibility, parentPageId, showInNavigation+displayOrder, publishedAt)
  - Add foreign key relationships (CustomPage self-reference for hierarchy, PageRedirect to CustomPage)
  - Ensure all field names follow snake_case convention with @map annotations
  - **Note**: After saving schema.prisma, the Prisma sync hook will automatically:
    - Generate migration
    - Regenerate Prisma client
    - Update seed.ts
    - Create backend DTOs and services
    - Create frontend TypeScript types
    - Update API client
    - Generate comprehensive tests (unit + controller + E2E)
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 11.1, 11.2_

- [x] 2. Backend - Landing Page Module






- [x] 2.1 Create landing page module structure


  - Create backend/src/landing/landing.module.ts
  - Create backend/src/landing/landing.service.ts
  - Create backend/src/landing/landing.controller.ts
  - Register module in app.module.ts
  - _Requirements: 1.1, 1.5, 11.1_

- [x] 2.2 Implement landing page service methods


  - getContent() - Fetch active landing page content with caching
  - updateContent(dto) - Update landing page sections and settings
  - resetToDefaults() - Reset to default landing page configuration
  - validateSection(section) - Validate section data based on type
  - validateCtaLink(link, linkType) - Validate CTA button links
  - Cache management with 5-minute TTL
  - _Requirements: 1.5, 1.6, 11.2, 11.6, 13.1, 13.2_


- [x] 2.3 Create landing page DTOs

  - UpdateLandingContentDto - Sections array and global settings
  - SectionDto - Base section with id, type, enabled, order, data
  - GlobalSettingsDto - Theme, layout, SEO settings
  - Section-specific data DTOs (Hero, Features, Footer, CTA, Testimonials, Stats, Content)
  - Shared DTOs (CtaButtonDto, FeatureCardDto, TestimonialDto, StatDto, NavLinkDto, SocialLinkDto)
  - Validation decorators for all fields
  - _Requirements: 1.2, 1.3, 1.4, 1.8, 9.1, 9.2, 9.3, 9.4_


- [x] 2.4 Implement landing page controller endpoints


  - GET /landing - Get landing page content (public)
  - GET /landing/admin - Get landing page content (admin with landing:read)
  - PATCH /landing - Update landing page content (requires landing:write)
  - POST /landing/reset - Reset to defaults (requires landing:write)
  - POST /landing/section-image - Upload section images (requires landing:write)
  - Apply JWT auth guard and permissions guard
  - _Requirements: 1.5, 1.6, 7.1, 7.2, 12.1, 12.2, 12.3, 12.4_

- [x] 2.5 Write landing page service tests








  - Test getContent with caching
  - Test updateContent with cache invalidation
  - Test resetToDefaults
  - Test section validation
  - Test CTA link validation
  - _Requirements: 1.5, 1.6, 13.1, 13.2_

- [x] 2.6 Write landing page E2E tests






  - Test GET /landing (public access)
  - Test PATCH /landing (admin only)
  - Test permission checks
  - Test section validation
  - Test image upload
  - _Requirements: 1.5, 1.6, 7.1, 7.2, 12.1_

- [x] 3. Backend - Custom Pages Module






- [x] 3.1 Create pages module structure


  - Create backend/src/pages/pages.module.ts
  - Create backend/src/pages/pages.service.ts
  - Create backend/src/pages/pages.controller.ts
  - Create backend/src/pages/slug.service.ts
  - Create backend/src/pages/redirect.service.ts
  - Register module in app.module.ts
  - _Requirements: 2.1, 3.1, 4.1, 5.1_

- [x] 3.2 Implement slug service

  - generateSlug(title) - Generate URL-friendly slug from title
  - isSlugAvailable(slug, excludeId) - Check slug uniqueness
  - suggestSlug(baseSlug) - Suggest alternative slug if conflict
  - isSystemRoute(slug) - Check for conflicts with system routes
  - validateSlugFormat(slug) - Validate slug format
  - _Requirements: 3.2, 3.3, 3.4, 5.2, 5.3, 9.3_

- [x] 3.3 Implement redirect service

  - createRedirect(fromSlug, toPageId) - Create 301 redirect
  - resolveRedirect(slug) - Resolve redirect to target page
  - deleteRedirectsForPage(pageId) - Clean up redirects when page deleted
  - _Requirements: 5.1, 5.4, 5.5_

- [x] 3.4 Implement pages service methods

  - findAll(filters) - List pages with filtering and pagination
  - findBySlug(slug, includeChildren) - Get page by slug with hierarchy
  - findById(id) - Get page by ID
  - create(dto) - Create new page with slug validation
  - update(id, dto) - Update page with slug change handling
  - delete(id) - Delete page with child page handling
  - publish(id) - Publish page and update publishedAt
  - unpublish(id) - Unpublish page
  - reorder(updates) - Update display order for multiple pages
  - getHierarchy() - Get page hierarchy tree for navigation
  - validateSlug(slug, excludeId) - Validate slug availability
  - Cache management with 5-minute TTL
  - _Requirements: 2.1-2.8, 3.1-3.12, 5.1, 5.5, 13.1, 13.3, 13.5_

- [x] 3.5 Create pages DTOs

  - CreatePageDto - All page fields with validation
  - UpdatePageDto - All fields optional
  - PageQueryDto - Filtering, pagination, search, sorting
  - ValidateSlugDto - Slug validation request
  - ReorderPagesDto - Array of {id, order} updates
  - Validation decorators for all fields
  - _Requirements: 3.1-3.12, 9.1-9.7_

- [x] 3.6 Implement pages controller endpoints

  - GET /pages - List published pages (public)
  - GET /pages/slug/:slug - Get page by slug (public)
  - GET /pages/hierarchy - Get page hierarchy (public)
  - GET /pages/admin - List all pages with filters (requires pages:read)
  - GET /pages/admin/:id - Get page by ID (requires pages:read)
  - POST /pages - Create page (requires pages:write)
  - PATCH /pages/:id - Update page (requires pages:write)
  - DELETE /pages/:id - Delete page (requires pages:delete)
  - PATCH /pages/:id/publish - Publish page (requires pages:publish)
  - PATCH /pages/:id/unpublish - Unpublish page (requires pages:publish)
  - POST /pages/reorder - Reorder pages (requires pages:write)
  - POST /pages/validate-slug - Validate slug (requires pages:write)
  - POST /pages/featured-image - Upload featured image (requires pages:write)
  - Apply JWT auth guard and permissions guard
  - _Requirements: 2.1-2.8, 3.1-3.12, 4.1-4.5, 7.3-7.7, 12.1-12.4_

- [x] 3.7 Write pages service tests






  - Test CRUD operations
  - Test slug generation and validation
  - Test hierarchy management
  - Test publish/unpublish workflow
  - Test caching
  - Test redirect creation on slug change
  - _Requirements: 2.1-2.8, 3.2-3.4, 5.1, 13.1, 13.3_

- [x] 3.8 Write slug service tests






  - Test slug generation from title
  - Test slug format validation
  - Test slug availability check
  - Test system route conflict detection
  - Test slug suggestion


  - _Requirements: 3.2-3.4, 5.2, 5.3, 9.3_

- [x]* 3.9 Write redirect service tests




  - Test redirect creation

  - Test redirect resolution
  - Test redirect cleanup
  - _Requirements: 5.1, 5.4, 5.5_


- [x]* 3.10 Write pages E2E tests




  - Test public endpoints
  - Test admin endpoints with permission checks
  - Test page creation with slug validation
  - Test page update with slug change and redirect
  - Test page deletion with child page handling
  - Test publish/unpublish workflow
  - Test hierarchy management
  - Test slug conflict prevention
  - Test system route conflict prevention
  - Test circular parent reference prevention
  - _Requirements: 2.1-2.8, 3.1-3.12, 4.1-4.5, 5.1-5.5, 7.3-7.7_

- [x] 4. Permissions and Seed Data





- [x] 4.1 Add permissions to seed data

  - Add landing:read permission
  - Add landing:write permission
  - Add pages:read permission
  - Add pages:write permission
  - Add pages:delete permission
  - Add pages:publish permission
  - Assign to appropriate roles (Super Admin, Admin, Manager)
  - _Requirements: 7.1-7.7_

- [x] 4.2 Create seed script for default landing page content

  - Create default hero section with placeholder content
  - Create default features section with 3-4 features
  - Create default footer section with company info
  - Create default CTA section
  - Create default global settings
  - _Requirements: 11.1_

- [x] 4.3 Run database migration and seed


  - Generate Prisma migration
  - Apply migration to database
  - Run seed script to create default data
  - Verify permissions are created
  - Verify default landing page content is created
  - _Requirements: 7.1-7.7, 11.1_


- [x] 5. Frontend - Landing Page Editor






- [x] 5.1 Create landing page editor page


  - Create frontend/src/app/dashboard/settings/landing-page/page.tsx
  - Add metadata for SEO and breadcrumbs
  - Apply permission guard (landing:read)
  - _Requirements: 1.1, 7.1_

- [x] 5.2 Create main editor components


  - LandingPageEditor - Main editor with section list and preview
  - SectionList - List of sections with drag-and-drop reordering
  - SectionLibrary - Modal to add new sections
  - PreviewPanel - Live preview with desktop/mobile toggle
  - GlobalSettingsEditor - Edit SEO, theme, layout settings
  - _Requirements: 1.1-1.4, 14.2_

- [x] 5.3 Create section-specific editors


  - HeroSectionEditor - Edit hero section with background options
  - FeaturesSectionEditor - Edit features with add/remove/reorder
  - FooterSectionEditor - Edit footer with nav/social links
  - CtaSectionEditor - Edit CTA section with colors
  - TestimonialsSectionEditor - Edit testimonials with add/remove/reorder
  - StatsSectionEditor - Edit stats with add/remove/reorder
  - ContentSectionEditor - Edit rich content with image
  - _Requirements: 1.2-1.4_

- [x] 5.4 Create shared editor components


  - CtaButtonEditor - Edit CTA buttons with page selector dropdown
  - FeatureCardEditor - Edit individual feature cards
  - TestimonialEditor - Edit individual testimonials
  - StatEditor - Edit individual stats
  - ImageUploadField - Upload images with preview
  - IconPicker - Select icons for features/stats
  - ColorPicker - Select colors for backgrounds/text
  - LayoutSelector - Select layout options
  - _Requirements: 1.2-1.4, 1.7, 1.8, 12.1-12.4_

- [x] 5.5 Implement section management features

  - Add section from library
  - Remove section with confirmation
  - Enable/disable section toggle
  - Drag-and-drop section reordering
  - Duplicate section
  - Collapsible section editors
  - _Requirements: 1.2-1.4_

- [x] 5.6 Implement save and publish functionality

  - Save changes with validation
  - Real-time preview updates
  - Reset to defaults with confirmation
  - Success/error toast notifications
  - Loading states during save
  - _Requirements: 1.5, 1.6, 9.1-9.6_

- [x] 5.7 Write landing page editor tests





  - Test section management (add, remove, reorder, enable/disable)
  - Test section editors (hero, features, footer, CTA, testimonials, stats, content)
  - Test image upload
  - Test CTA button page selector
  - Test save and reset functionality
  - Test validation
  - _Requirements: 1.1-1.8_

- [x] 6. Frontend - Pages Management Dashboard






- [x] 6.1 Create pages dashboard page

  - Create frontend/src/app/dashboard/pages/page.tsx
  - Add metadata for SEO and breadcrumbs
  - Apply permission guard (pages:read)
  - _Requirements: 2.1, 7.3_


- [x] 6.2 Create pages list components


  - PagesList - Main list component with table/grid view
  - PageCard - Individual page card with actions
  - PageFilters - Filter by status, visibility, parent
  - PageSearch - Search by title or slug
  - BulkActions - Bulk publish, unpublish, delete
  - PageHierarchyView - Tree view of page hierarchy
  - _Requirements: 2.1-2.4, 2.7_


- [ ] 6.3 Implement filtering and search
  - Filter by status (all, draft, published, archived)
  - Filter by visibility (all, public, private)
  - Filter by parent page
  - Search by title or slug
  - Sort by title, created date, updated date, display order
  - Pagination with 20 items per page
  - _Requirements: 2.3, 13.5_


- [ ] 6.4 Implement page actions
  - Create new page button (navigate to /dashboard/pages/new)
  - Edit page button (navigate to /dashboard/pages/[id]/edit)
  - Delete page with confirmation
  - Publish/unpublish toggle
  - Duplicate page
  - View page (open in new tab)

  - _Requirements: 2.2, 2.4-2.6_

- [ ] 6.5 Implement bulk actions
  - Select multiple pages with checkboxes
  - Bulk publish selected pages
  - Bulk unpublish selected pages
  - Bulk delete with confirmation

  - Select all / deselect all
  - _Requirements: 2.4_

- [ ] 6.6 Implement page hierarchy view
  - Tree view showing parent-child relationships
  - Expand/collapse nodes
  - Drag-and-drop to change parent
  - Visual indicators for hierarchy depth
  - _Requirements: 2.7, 2.8_

- [x] 6.7 Write pages dashboard tests







  - Test pages list rendering
  - Test filtering and search
  - Test sorting and pagination
  - Test page actions (edit, delete, publish, unpublish)
  - Test bulk actions
  - Test hierarchy view
  - _Requirements: 2.1-2.8_

- [x] 7. Frontend - Page Editor






- [x] 7.1 Create page editor pages


  - Create frontend/src/app/dashboard/pages/new/page.tsx for new pages
  - Create frontend/src/app/dashboard/pages/[id]/edit/page.tsx for editing
  - Add metadata for SEO and breadcrumbs
  - Apply permission guard (pages:write)
  - _Requirements: 2.5, 3.1, 7.4_

- [x] 7.2 Create page editor components


  - PageEditor - Main editor component
  - PageBasicInfo - Title, slug, excerpt fields
  - ContentEditor - Markdown or WYSIWYG editor
  - PageMetadata - SEO fields (meta title, description, keywords)
  - PageSettings - Status, visibility, navigation, hierarchy
  - FeaturedImageUpload - Upload featured image with preview
  - SlugInput - Auto-generate and validate slug
  - PagePreview - Preview page before publishing
  - _Requirements: 3.1-3.12_

- [x] 7.3 Implement slug management


  - Auto-generate slug from title in real-time
  - Allow manual slug editing
  - Validate slug format (lowercase, alphanumeric, hyphens only)
  - Check slug availability with API
  - Display error for duplicate slug
  - Suggest alternative slug if conflict
  - Display error for system route conflict
  - _Requirements: 3.2-3.4, 5.2, 5.3, 9.3_

- [x] 7.4 Implement parent page selector


  - Dropdown of available pages
  - Exclude current page and its children (prevent circular references)
  - Show page hierarchy in dropdown
  - Clear selection option
  - _Requirements: 3.9, 5.5_

- [x] 7.5 Implement save and publish functionality

  - Auto-save to draft every 30 seconds
  - Save as draft button
  - Publish button (requires pages:publish permission)
  - Validation before save
  - Success/error toast notifications
  - Loading states during save
  - Unsaved changes warning
  - _Requirements: 3.5, 3.6, 3.10, 3.11, 9.1-9.7_

- [x] 7.6 Implement preview functionality

  - Preview button opens page in new tab
  - Preview shows draft content
  - Preview banner indicating "Preview Mode - Draft Content"
  - Preview only accessible to authenticated users with permissions
  - _Requirements: 10.1-10.5_

- [x] 7.7 Write page editor tests





  - Test page creation
  - Test page editing
  - Test slug auto-generation
  - Test slug validation
  - Test parent page selector
  - Test featured image upload
  - Test save as draft
  - Test publish
  - Test preview
  - Test validation
  - _Requirements: 3.1-3.12, 10.1-10.5_


- [x] 8. Frontend - Public Page Rendering






- [x] 8.1 Create dynamic route for custom pages


  - Create frontend/src/app/[...slug]/page.tsx for dynamic routes
  - Handle both top-level pages (/{slug}) and nested pages (/{parent}/{child})
  - Implement generateStaticParams() for static generation
  - Implement generateMetadata() for SEO
  - _Requirements: 4.1, 4.2, 4.6, 8.1, 8.2_

- [x] 8.2 Implement page fetching and redirect handling


  - Fetch page by slug from API
  - Check for redirects if page not found
  - Handle 404 for non-existent pages
  - Handle 404 for draft pages (unless authenticated with permissions)
  - Redirect to login for private pages (unless authenticated)
  - _Requirements: 4.1-4.5, 5.1_

- [x] 8.3 Create page rendering components


  - CustomPageLayout - Page wrapper with breadcrumbs
  - PageContent - Render markdown/HTML content
  - PageHeader - Page title and featured image
  - PageFooter - Related pages or navigation
  - _Requirements: 4.1, 4.6-4.8_

- [x] 8.4 Implement SEO metadata generation


  - Generate page title from meta title or title
  - Generate description from meta description or excerpt
  - Generate Open Graph tags with featured image
  - Generate Twitter Card tags
  - Generate breadcrumb structured data (JSON-LD)
  - Include canonical URL
  - Set robots meta tag based on status and visibility
  - _Requirements: 4.6, 8.1-8.6_

- [x] 8.5 Implement breadcrumb navigation



  - Generate breadcrumbs from page hierarchy
  - Display breadcrumbs at top of page
  - Include structured data for breadcrumbs
  - _Requirements: 4.8, 8.4_

- [x] 8.6 Apply global theme styling


  - Use ThemeContext for consistent styling
  - Apply custom CSS class if provided
  - Ensure responsive design
  - _Requirements: 4.7, 14.1_

- [x] 8.7 Write public page rendering tests





  - Test page rendering for top-level pages
  - Test page rendering for nested pages
  - Test 404 for non-existent pages
  - Test 404 for draft pages (unauthenticated)
  - Test redirect to login for private pages (unauthenticated)
  - Test SEO metadata generation
  - Test breadcrumb navigation
  - Test redirect handling
  - _Requirements: 4.1-4.8, 5.1, 8.1-8.6_

- [x] 9. Frontend - Landing Page Public Rendering





- [x] 9.1 Update landing page component


  - Update frontend/src/app/page.tsx to fetch content from API
  - Render sections dynamically based on type
  - Apply global settings (theme, layout, spacing)
  - Handle loading and error states
  - _Requirements: 1.6, 11.5_

- [x] 9.2 Create section rendering components


  - HeroSection - Render hero section
  - FeaturesSection - Render features section
  - FooterSection - Render footer section
  - CtaSection - Render CTA section
  - TestimonialsSection - Render testimonials section
  - StatsSection - Render stats section
  - ContentSection - Render content section
  - _Requirements: 1.2-1.4_

- [x] 9.3 Implement section rendering logic

  - Map section type to component
  - Render only enabled sections
  - Sort sections by order
  - Apply section-specific styling
  - Handle missing or invalid sections gracefully
  - _Requirements: 1.2-1.4, 1.6_

- [x] 9.4 Implement CTA link handling


  - Resolve page links to URLs
  - Handle external URLs
  - Apply proper link styling
  - _Requirements: 1.7, 6.1, 6.5_

- [x] 9.5 Write landing page rendering tests





  - Test section rendering for all types
  - Test section ordering
  - Test enabled/disabled sections
  - Test CTA link resolution
  - Test global settings application
  - _Requirements: 1.2-1.4, 1.6, 1.7, 11.5_

- [x] 10. Integration - Navigation System





- [x] 10.1 Update NavigationContext


  - Fetch pages with showInNavigation = true and status = PUBLISHED
  - Add custom pages to navigation items
  - Respect display order
  - Handle page hierarchy in navigation
  - _Requirements: 6.1-6.4_

- [x] 10.2 Update footer navigation


  - Render footer nav links from landing page content
  - Resolve page links to URLs
  - Handle external URLs
  - Apply proper link styling
  - _Requirements: 1.4, 6.1, 6.2, 6.5_

- [x] 10.3 Create page selector component


  - PageSelector - Dropdown to select published pages
  - Used in landing page editor for CTA buttons
  - Used in footer editor for nav links
  - Show page hierarchy in dropdown


  - _Requirements: 1.7, 6.5_
- [x]* 10.4 Write navigation integration tests






- [ ]* 10.4 Write navigation integration tests


  - Test custom pages in navigation
  - Test footer nav links
  - Test page selector component
  - Test page hierarchy in navigation
  - _Requirements: 6.1-6.5_


- [x] 11. Integration - Sitemap





- [x] 11.1 Update sitemap generation


  - Fetch published, public custom pages
  - Generate URLs for top-level and nested pages
  - Include last modified date
  - Set change frequency to 'weekly'
  - Set priority to 0.7
  - _Requirements: 8.3_


- [x] 11.2 Exclude draft and private pages


  - Filter out draft pages
  - Filter out private pages
  - Filter out pages with robots noindex
  - _Requirements: 8.6_

- [ ]* 11.3 Write sitemap integration tests
  - Test custom pages in sitemap
  - Test nested pages in sitemap
  - Test exclusion of draft pages
  - Test exclusion of private pages
  - _Requirements: 8.3, 8.6_

- [x] 12. Integration - Metadata System





- [x] 12.1 Add custom pages to metadata config

  - Add route pattern for /:slug (top-level pages)
  - Add route pattern for /:parent/:child (nested pages)
  - Use dynamic values for page title, description, image
  - Configure Open Graph and Twitter Card tags
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 12.2 Update metadata helpers

  - Support dynamic page metadata resolution
  - Generate metadata from page data
  - Handle featured images for OG tags
  - Generate breadcrumb structured data
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ]* 12.3 Write metadata integration tests
  - Test metadata generation for custom pages
  - Test Open Graph tags
  - Test Twitter Card tags
  - Test breadcrumb structured data
  - _Requirements: 8.1, 8.2, 8.4, 8.5_
- [x] 13. Integration - Image Upload




- [ ] 13. Integration - Image Upload


- [x] 13.1 Add upload endpoints


  - POST /landing/section-image - Upload section images
  - POST /pages/featured-image - Upload page featured images
  - Use existing UploadsService
  - Validate file type (PNG, JPG, WebP, SVG)
  - Validate file size (max 5MB)
  - _Requirements: 1.8, 12.1-12.6_

- [x] 13.2 Create image upload components


  - ImageUploadField - Reusable image upload with preview
  - Drag-and-drop support
  - File type and size validation
  - Progress indicator
  - Preview with remove option
  - _Requirements: 1.8, 12.1-12.4_

- [ ]* 13.3 Write image upload tests
  - Test image upload for landing page sections
  - Test image upload for page featured images
  - Test file type validation
  - Test file size validation
  - Test preview and remove
  - _Requirements: 1.8, 12.1-12.6_
-

- [x] 14. Performance and Polish






- [x] 14.1 Implement backend caching

  - Cache landing page content for 5 minutes
  - Cache custom pages for 5 minutes
  - Invalidate cache on updates
  - Cache page hierarchy for navigation
  - _Requirements: 13.1-13.4_


- [x] 14.2 Implement frontend caching

  - Use Next.js ISR for custom pages (5-minute revalidation)
  - Use SWR for admin pages
  - Implement optimistic updates
  - _Requirements: 13.1-13.4_


- [x] 14.3 Optimize database queries

  - Verify indexes are in place
  - Use cursor-based pagination for large datasets
  - Optimize hierarchy queries
  - _Requirements: 13.5_


- [x] 14.4 Ensure responsive design

  - Mobile-friendly landing page editor
  - Mobile-friendly pages dashboard
  - Mobile-friendly page editor
  - Mobile-first public pages
  - _Requirements: 14.1-14.3_

- [ ]* 14.5 Write performance tests
  - Test caching behavior
  - Test cache invalidation
  - Test pagination performance
  - Test responsive design
  - _Requirements: 13.1-13.5, 14.1-14.3_

- [x] 15. Final Integration and Testing





- [x] 15.1 Add NotificationCenter to dashboard


  - Add landing page editor link to settings menu
  - Add pages management link to main navigation
  - Ensure proper permission checks
  - Test navigation flow
  - _Requirements: 1.1, 2.1, 7.1, 7.3_

- [x] 15.2 Integration testing


  - Test complete landing page editing workflow
  - Test complete custom page creation workflow
  - Test page hierarchy and navigation
  - Test SEO metadata generation
  - Test redirects and 404 handling
  - Test permissions and access control
  - _Requirements: All_

- [x] 15.3 Cross-browser testing

  - Test in Chrome, Firefox, Safari, Edge
  - Test mobile browsers (iOS Safari, Chrome Mobile)
  - Fix any browser-specific issues
  - _Requirements: 14.1_

- [x] 15.4 Accessibility testing

  - Test keyboard navigation
  - Test screen reader compatibility
  - Test color contrast
  - Fix any accessibility issues
  - _Requirements: All_

- [x] 15.5 Final polish

  - Fix any UI/UX issues
  - Improve error messages
  - Add loading states where missing
  - Improve validation feedback
  - _Requirements: All_

## Notes

- **Prisma Sync Hook Automation**: After completing Task 1.1 (Prisma schema), the hook will automatically handle:
  - ✅ Prisma migration generation and application
  - ✅ Prisma client regeneration
  - ✅ Backend DTOs creation
  - ✅ Backend service scaffolding
  - ✅ Backend controller scaffolding
  - ✅ Frontend TypeScript types
  - ✅ API client methods
  - ✅ Comprehensive test generation
  - ✅ Seed file updates
  - ✅ Type consistency verification

- **What You Need to Implement**: Focus on business logic and UI:
  - Service methods (CRUD operations, slug management, redirects, caching)
  - Controller endpoints (route handlers, guards, permissions)
  - Frontend components (editors, dashboards, public pages)
  - Integration (navigation, sitemap, metadata, uploads)

- **Incremental Development**: Each task builds on previous work. Complete tasks in order for best results.

- **Optional Tasks (marked with *)**: Unit tests and E2E tests are optional to focus on core functionality first.

- **Estimated Timeline**: 8-12 days for MVP (excluding optional tests)
