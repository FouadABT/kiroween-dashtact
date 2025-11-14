# Landing Page CMS - Design Document

## Overview

The Landing Page CMS feature adds a comprehensive content management system for landing pages and custom pages. It enables administrators to customize the existing landing page through a structured editor and create flexible custom pages accessible via clean URLs. The system integrates seamlessly with existing blog, theme, metadata, and permission systems.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
├─────────────────────────────────────────────────────────────┤
│  Landing Page Editor    │    Pages Dashboard                │
│  /dashboard/settings/   │    /dashboard/pages               │
│  landing-page           │    /dashboard/pages/new           │
│                         │    /dashboard/pages/[id]/edit     │
├─────────────────────────────────────────────────────────────┤
│  Public Pages           │    Components                     │
│  /{slug}                │    - PageEditor                   │
│  /{parent}/{child}      │    - LandingPageEditor            │
│                         │    - PageList                     │
│                         │    - SlugInput                    │
└─────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                     Backend (NestJS)                         │
├─────────────────────────────────────────────────────────────┤
│  Landing Module         │    Pages Module                   │
│  - LandingService       │    - PagesService                 │
│  - LandingController    │    - PagesController              │
│                         │    - SlugService                  │
│                         │    - RedirectService              │
├─────────────────────────────────────────────────────────────┤
│                     Database (PostgreSQL + Prisma)           │
│  - LandingPageContent   │    - CustomPage                   │
│  - PageRedirect         │                                   │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### LandingPageContent Model

Stores all editable content for the landing page with flexible section management.

```prisma
model LandingPageContent {
  id              String   @id @default(cuid())
  
  // Sections stored as flexible JSON array
  // Allows adding, removing, reordering sections dynamically
  sections        Json     @map("sections")  // Array of section objects
  
  // Global Settings
  settings        Json     @map("settings")  // { theme, layout, spacing, etc. }
  
  // Metadata
  version         Int      @default(1)
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  publishedAt     DateTime? @map("published_at")
  
  @@map("landing_page_content")
}
```

**Sections JSON Structure:**

Each section in the `sections` array follows this structure:

```typescript
{
  id: string;              // Unique section ID (e.g., "hero-1", "features-1")
  type: string;            // Section type (e.g., "hero", "features", "footer", "cta", "testimonials")
  enabled: boolean;        // Whether section is visible
  order: number;           // Display order
  data: object;            // Section-specific data
}
```

**Built-in Section Types:**

1. **Hero Section:**
```typescript
{
  id: "hero-1",
  type: "hero",
  enabled: true,
  order: 1,
  data: {
    headline: string;
    subheadline: string;
    primaryCta: { text: string; link: string; linkType: 'url' | 'page' };
    secondaryCta?: { text: string; link: string; linkType: 'url' | 'page' };
    backgroundImage?: string;
    backgroundType: 'image' | 'gradient' | 'solid';
    backgroundColor?: string;
    textAlignment: 'left' | 'center' | 'right';
    height: 'small' | 'medium' | 'large' | 'full';
  }
}
```

2. **Features Section:**
```typescript
{
  id: "features-1",
  type: "features",
  enabled: true,
  order: 2,
  data: {
    title: string;
    subtitle?: string;
    layout: 'grid' | 'list' | 'carousel';
    columns: 2 | 3 | 4;
    features: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
      order: number;
    }>;
  }
}
```

3. **Footer Section:**
```typescript
{
  id: "footer-1",
  type: "footer",
  enabled: true,
  order: 99,
  data: {
    companyName: string;
    description: string;
    navLinks: Array<{
      label: string;
      url: string;
      linkType: 'url' | 'page';
      order: number;
    }>;
    socialLinks: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
    copyright: string;
    showNewsletter: boolean;
    newsletterTitle?: string;
    newsletterDescription?: string;
  }
}
```

4. **CTA Section (Call-to-Action):**
```typescript
{
  id: "cta-1",
  type: "cta",
  enabled: true,
  order: 3,
  data: {
    title: string;
    description: string;
    primaryCta: { text: string; link: string; linkType: 'url' | 'page' };
    secondaryCta?: { text: string; link: string; linkType: 'url' | 'page' };
    backgroundColor: string;
    textColor: string;
    alignment: 'left' | 'center' | 'right';
  }
}
```

5. **Testimonials Section:**
```typescript
{
  id: "testimonials-1",
  type: "testimonials",
  enabled: true,
  order: 4,
  data: {
    title: string;
    subtitle?: string;
    layout: 'grid' | 'carousel';
    testimonials: Array<{
      id: string;
      quote: string;
      author: string;
      role: string;
      company?: string;
      avatar?: string;
      order: number;
    }>;
  }
}
```

6. **Stats Section:**
```typescript
{
  id: "stats-1",
  type: "stats",
  enabled: true,
  order: 5,
  data: {
    title?: string;
    layout: 'horizontal' | 'grid';
    stats: Array<{
      id: string;
      value: string;
      label: string;
      icon?: string;
      order: number;
    }>;
  }
}
```

7. **Content Section (Rich Text):**
```typescript
{
  id: "content-1",
  type: "content",
  enabled: true,
  order: 6,
  data: {
    title?: string;
    content: string;  // Markdown or HTML
    layout: 'single' | 'two-column';
    image?: string;
    imagePosition: 'left' | 'right' | 'top' | 'bottom';
  }
}
```

**Global Settings JSON Structure:**

```typescript
{
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  layout: {
    maxWidth: 'full' | 'container' | 'narrow';
    spacing: 'compact' | 'normal' | 'relaxed';
  };
  seo: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
  };
}
```

### CustomPage Model

Stores custom pages with full metadata and hierarchy support.

```prisma
model CustomPage {
  id              String      @id @default(cuid())
  
  // Basic Info
  title           String
  slug            String      @unique
  content         String      @db.Text
  excerpt         String?
  
  // Media
  featuredImage   String?     @map("featured_image")
  
  // Status and Visibility
  status          PageStatus  @default(DRAFT)
  visibility      PageVisibility @default(PUBLIC)
  
  // Hierarchy
  parentPageId    String?     @map("parent_page_id")
  parentPage      CustomPage? @relation("PageHierarchy", fields: [parentPageId], references: [id], onDelete: SetNull)
  childPages      CustomPage[] @relation("PageHierarchy")
  
  // Navigation
  showInNavigation Boolean    @default(false) @map("show_in_navigation")
  displayOrder    Int         @default(0) @map("display_order")
  
  // SEO
  metaTitle       String?     @map("meta_title")
  metaDescription String?     @map("meta_description")
  metaKeywords    String?     @map("meta_keywords")
  
  // Customization
  customCssClass  String?     @map("custom_css_class")
  templateKey     String?     @default("default") @map("template_key")
  
  // Timestamps
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  publishedAt     DateTime?   @map("published_at")
  
  // Relations
  redirectsFrom   PageRedirect[] @relation("RedirectTo")
  
  @@index([slug])
  @@index([status])
  @@index([visibility])
  @@index([parentPageId])
  @@index([showInNavigation, displayOrder])
  @@index([publishedAt])
  @@map("custom_pages")
}
```


### PageRedirect Model

Stores URL redirects when page slugs change.

```prisma
model PageRedirect {
  id          String     @id @default(cuid())
  fromSlug    String     @unique @map("from_slug")
  toPageId    String     @map("to_page_id")
  toPage      CustomPage @relation("RedirectTo", fields: [toPageId], references: [id], onDelete: Cascade)
  redirectType Int       @default(301) @map("redirect_type") // 301 or 302
  createdAt   DateTime   @default(now()) @map("created_at")
  
  @@index([fromSlug])
  @@index([toPageId])
  @@map("page_redirects")
}
```

### Enums

```prisma
enum PageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum PageVisibility {
  PUBLIC      // Accessible to everyone
  PRIVATE     // Requires authentication
}
```

### JSON Field Structures

#### heroPrimaryCta / heroSecondaryCta
```typescript
{
  text: string;           // Button text
  link: string;           // URL or page ID
  linkType: 'url' | 'page'; // External URL or internal page
}
```

#### features (Array)
```typescript
[
  {
    icon: string;         // Icon name or SVG path
    title: string;        // Feature title
    description: string;  // Feature description
    order: number;        // Display order
  }
]
```

#### footerNavLinks (Array)
```typescript
[
  {
    label: string;        // Link text
    url: string;          // URL or page ID
    linkType: 'url' | 'page';
    order: number;        // Display order
  }
]
```

#### footerSocialLinks (Array)
```typescript
[
  {
    platform: string;     // 'twitter', 'facebook', 'linkedin', etc.
    url: string;          // Social media URL
    icon: string;         // Icon name
  }
]
```

## Backend Implementation

### Landing Module

#### LandingService

**Responsibilities:**
- Fetch landing page content
- Update landing page content
- Validate landing page data
- Handle image uploads for hero background
- Cache management

**Key Methods:**
```typescript
class LandingService {
  async getContent(): Promise<LandingPageContent>
  async updateContent(dto: UpdateLandingContentDto): Promise<LandingPageContent>
  async resetToDefaults(): Promise<LandingPageContent>
  async validateCtaLink(link: string, linkType: string): Promise<boolean>
  async uploadHeroImage(file: Express.Multer.File): Promise<string>
}
```

#### LandingController

**Endpoints:**
```typescript
GET    /landing                    // Get landing page content (public)
GET    /landing/admin              // Get landing page content (admin)
PATCH  /landing                    // Update landing page content
POST   /landing/reset              // Reset to defaults
POST   /landing/hero-image         // Upload hero background image
```

**Permissions:**
- GET /landing: Public (no auth)
- GET /landing/admin: `landing:read`
- PATCH /landing: `landing:write`
- POST /landing/reset: `landing:write`
- POST /landing/hero-image: `landing:write`

### Pages Module

#### PagesService

**Responsibilities:**
- CRUD operations for custom pages
- Slug generation and validation
- Page hierarchy management
- Draft/publish workflow
- Cache management

**Key Methods:**
```typescript
class PagesService {
  async findAll(filters: PageQueryDto): Promise<PaginatedResponse<CustomPage>>
  async findBySlug(slug: string, includeChildren?: boolean): Promise<CustomPage>
  async findById(id: string): Promise<CustomPage>
  async create(dto: CreatePageDto): Promise<CustomPage>
  async update(id: string, dto: UpdatePageDto): Promise<CustomPage>
  async delete(id: string): Promise<void>
  async publish(id: string): Promise<CustomPage>
  async unpublish(id: string): Promise<CustomPage>
  async reorder(updates: Array<{id: string, order: number}>): Promise<void>
  async getHierarchy(): Promise<PageHierarchyNode[]>
  async validateSlug(slug: string, excludeId?: string): Promise<boolean>
}
```

#### SlugService

**Responsibilities:**
- Generate slugs from titles
- Validate slug uniqueness
- Check for conflicts with system routes
- Suggest alternative slugs

**Key Methods:**
```typescript
class SlugService {
  generateSlug(title: string): string
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean>
  async suggestSlug(baseSlug: string): Promise<string>
  isSystemRoute(slug: string): boolean
  validateSlugFormat(slug: string): boolean
}
```

#### RedirectService

**Responsibilities:**
- Create redirects when slugs change
- Resolve redirects for incoming requests
- Clean up old redirects

**Key Methods:**
```typescript
class RedirectService {
  async createRedirect(fromSlug: string, toPageId: string): Promise<PageRedirect>
  async resolveRedirect(slug: string): Promise<CustomPage | null>
  async deleteRedirectsForPage(pageId: string): Promise<void>
}
```

#### PagesController

**Endpoints:**
```typescript
// Public endpoints
GET    /pages                      // List published pages
GET    /pages/slug/:slug           // Get page by slug (public)
GET    /pages/hierarchy            // Get page hierarchy (for navigation)

// Admin endpoints
GET    /pages/admin                // List all pages (with filters)
GET    /pages/admin/:id            // Get page by ID
POST   /pages                      // Create page
PATCH  /pages/:id                  // Update page
DELETE /pages/:id                  // Delete page
PATCH  /pages/:id/publish          // Publish page
PATCH  /pages/:id/unpublish        // Unpublish page
POST   /pages/reorder              // Reorder pages
POST   /pages/validate-slug        // Validate slug availability
POST   /pages/featured-image       // Upload featured image
```

**Permissions:**
- GET /pages: Public (no auth)
- GET /pages/slug/:slug: Public (no auth)
- GET /pages/hierarchy: Public (no auth)
- GET /pages/admin: `pages:read`
- GET /pages/admin/:id: `pages:read`
- POST /pages: `pages:write`
- PATCH /pages/:id: `pages:write`
- DELETE /pages/:id: `pages:delete`
- PATCH /pages/:id/publish: `pages:publish`
- PATCH /pages/:id/unpublish: `pages:publish`
- POST /pages/reorder: `pages:write`
- POST /pages/validate-slug: `pages:write`
- POST /pages/featured-image: `pages:write`
```


### DTOs (Data Transfer Objects)

#### Landing Page DTOs

```typescript
// UpdateLandingContentDto
class UpdateLandingContentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];
  
  @IsObject()
  @ValidateNested()
  @Type(() => GlobalSettingsDto)
  settings?: GlobalSettingsDto;
}

// SectionDto (base for all section types)
class SectionDto {
  @IsString() @IsNotEmpty()
  id: string;
  
  @IsEnum(['hero', 'features', 'footer', 'cta', 'testimonials', 'stats', 'content'])
  type: string;
  
  @IsBoolean()
  enabled: boolean;
  
  @IsNumber()
  order: number;
  
  @IsObject()
  data: any; // Validated based on type
}

// Global Settings DTO
class GlobalSettingsDto {
  @IsObject() @IsOptional()
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  
  @IsObject() @IsOptional()
  layout?: {
    maxWidth?: 'full' | 'container' | 'narrow';
    spacing?: 'compact' | 'normal' | 'relaxed';
  };
  
  @IsObject() @IsOptional()
  seo?: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
  };
}

// Section-specific data DTOs

// Hero Section Data
class HeroSectionDataDto {
  @IsString() @IsNotEmpty()
  headline: string;
  
  @IsString() @IsNotEmpty()
  subheadline: string;
  
  @ValidateNested()
  @Type(() => CtaButtonDto)
  primaryCta: CtaButtonDto;
  
  @ValidateNested() @IsOptional()
  @Type(() => CtaButtonDto)
  secondaryCta?: CtaButtonDto;
  
  @IsString() @IsOptional()
  backgroundImage?: string;
  
  @IsEnum(['image', 'gradient', 'solid'])
  backgroundType: string;
  
  @IsString() @IsOptional()
  backgroundColor?: string;
  
  @IsEnum(['left', 'center', 'right'])
  textAlignment: string;
  
  @IsEnum(['small', 'medium', 'large', 'full'])
  height: string;
}

// Features Section Data
class FeaturesSectionDataDto {
  @IsString() @IsNotEmpty()
  title: string;
  
  @IsString() @IsOptional()
  subtitle?: string;
  
  @IsEnum(['grid', 'list', 'carousel'])
  layout: string;
  
  @IsNumber() @Min(2) @Max(4)
  columns: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureCardDto)
  features: FeatureCardDto[];
}

// CTA Section Data
class CtaSectionDataDto {
  @IsString() @IsNotEmpty()
  title: string;
  
  @IsString() @IsNotEmpty()
  description: string;
  
  @ValidateNested()
  @Type(() => CtaButtonDto)
  primaryCta: CtaButtonDto;
  
  @ValidateNested() @IsOptional()
  @Type(() => CtaButtonDto)
  secondaryCta?: CtaButtonDto;
  
  @IsString()
  backgroundColor: string;
  
  @IsString()
  textColor: string;
  
  @IsEnum(['left', 'center', 'right'])
  alignment: string;
}

// Testimonials Section Data
class TestimonialsSectionDataDto {
  @IsString() @IsNotEmpty()
  title: string;
  
  @IsString() @IsOptional()
  subtitle?: string;
  
  @IsEnum(['grid', 'carousel'])
  layout: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialDto)
  testimonials: TestimonialDto[];
}

// Stats Section Data
class StatsSectionDataDto {
  @IsString() @IsOptional()
  title?: string;
  
  @IsEnum(['horizontal', 'grid'])
  layout: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatDto)
  stats: StatDto[];
}

// Content Section Data
class ContentSectionDataDto {
  @IsString() @IsOptional()
  title?: string;
  
  @IsString() @IsNotEmpty()
  content: string;
  
  @IsEnum(['single', 'two-column'])
  layout: string;
  
  @IsString() @IsOptional()
  image?: string;
  
  @IsEnum(['left', 'right', 'top', 'bottom']) @IsOptional()
  imagePosition?: string;
}

// Footer Section Data
class FooterSectionDataDto {
  @IsString() @IsNotEmpty()
  companyName: string;
  
  @IsString() @IsNotEmpty()
  description: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavLinkDto)
  navLinks: NavLinkDto[];
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks: SocialLinkDto[];
  
  @IsString() @IsNotEmpty()
  copyright: string;
  
  @IsBoolean()
  showNewsletter: boolean;
  
  @IsString() @IsOptional()
  newsletterTitle?: string;
  
  @IsString() @IsOptional()
  newsletterDescription?: string;
}

// Shared DTOs

class CtaButtonDto {
  @IsString() @IsNotEmpty()
  text: string;
  
  @IsString() @IsNotEmpty()
  link: string;
  
  @IsEnum(['url', 'page'])
  linkType: 'url' | 'page';
}

class FeatureCardDto {
  @IsString() @IsNotEmpty()
  id: string;
  
  @IsString() @IsNotEmpty()
  icon: string;
  
  @IsString() @IsNotEmpty() @MaxLength(100)
  title: string;
  
  @IsString() @IsNotEmpty() @MaxLength(500)
  description: string;
  
  @IsNumber()
  order: number;
}

class TestimonialDto {
  @IsString() @IsNotEmpty()
  id: string;
  
  @IsString() @IsNotEmpty()
  quote: string;
  
  @IsString() @IsNotEmpty()
  author: string;
  
  @IsString() @IsNotEmpty()
  role: string;
  
  @IsString() @IsOptional()
  company?: string;
  
  @IsString() @IsOptional()
  avatar?: string;
  
  @IsNumber()
  order: number;
}

class StatDto {
  @IsString() @IsNotEmpty()
  id: string;
  
  @IsString() @IsNotEmpty()
  value: string;
  
  @IsString() @IsNotEmpty()
  label: string;
  
  @IsString() @IsOptional()
  icon?: string;
  
  @IsNumber()
  order: number;
}

class NavLinkDto {
  @IsString() @IsNotEmpty()
  label: string;
  
  @IsString() @IsNotEmpty()
  url: string;
  
  @IsEnum(['url', 'page'])
  linkType: 'url' | 'page';
  
  @IsNumber()
  order: number;
}

class SocialLinkDto {
  @IsString() @IsNotEmpty()
  platform: string;
  
  @IsString() @IsUrl()
  url: string;
  
  @IsString()
  icon: string;
}
```

#### Custom Pages DTOs

```typescript
// CreatePageDto
class CreatePageDto {
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(200)
  title: string;
  
  @IsString() @IsNotEmpty() @Matches(/^[a-z0-9-]+$/)
  slug: string;
  
  @IsString() @IsNotEmpty()
  content: string;
  
  @IsString() @IsOptional() @MaxLength(500)
  excerpt?: string;
  
  @IsString() @IsOptional()
  featuredImage?: string;
  
  @IsEnum(PageStatus) @IsOptional()
  status?: PageStatus;
  
  @IsEnum(PageVisibility) @IsOptional()
  visibility?: PageVisibility;
  
  @IsString() @IsOptional()
  parentPageId?: string;
  
  @IsBoolean() @IsOptional()
  showInNavigation?: boolean;
  
  @IsNumber() @IsOptional()
  displayOrder?: number;
  
  @IsString() @IsOptional() @MaxLength(200)
  metaTitle?: string;
  
  @IsString() @IsOptional() @MaxLength(500)
  metaDescription?: string;
  
  @IsString() @IsOptional()
  metaKeywords?: string;
  
  @IsString() @IsOptional() @Matches(/^[a-zA-Z0-9-_]+$/)
  customCssClass?: string;
  
  @IsString() @IsOptional()
  templateKey?: string;
}

// UpdatePageDto
class UpdatePageDto {
  // Same fields as CreatePageDto but all optional
}

// PageQueryDto
class PageQueryDto {
  @IsOptional() @IsEnum(PageStatus)
  status?: PageStatus;
  
  @IsOptional() @IsEnum(PageVisibility)
  visibility?: PageVisibility;
  
  @IsOptional() @IsString()
  parentPageId?: string;
  
  @IsOptional() @IsBoolean()
  showInNavigation?: boolean;
  
  @IsOptional() @IsNumber()
  page?: number;
  
  @IsOptional() @IsNumber() @Max(50)
  limit?: number;
  
  @IsOptional() @IsString()
  search?: string;
  
  @IsOptional() @IsEnum(['title', 'createdAt', 'updatedAt', 'displayOrder'])
  sortBy?: string;
  
  @IsOptional() @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

// ValidateSlugDto
class ValidateSlugDto {
  @IsString() @IsNotEmpty() @Matches(/^[a-z0-9-]+$/)
  slug: string;
  
  @IsString() @IsOptional()
  excludeId?: string;
}
```

## Frontend Implementation

### Landing Page Editor

**Location:** `frontend/src/app/dashboard/settings/landing-page/page.tsx`

**Main Components:**
- `LandingPageEditor` - Main editor with section management
- `SectionList` - List of all sections with drag-and-drop reordering
- `SectionEditor` - Dynamic editor based on section type
- `SectionLibrary` - Add new sections from library
- `PreviewPanel` - Real-time preview of landing page
- `GlobalSettingsEditor` - Edit global settings (SEO, theme, layout)

**Section-Specific Editors:**
- `HeroSectionEditor` - Edit hero section
- `FeaturesSectionEditor` - Edit features section with add/remove/reorder cards
- `FooterSectionEditor` - Edit footer section
- `CtaSectionEditor` - Edit CTA section
- `TestimonialsSectionEditor` - Edit testimonials section
- `StatsSectionEditor` - Edit stats section
- `ContentSectionEditor` - Edit rich content section

**Shared Components:**
- `CtaButtonEditor` - Edit CTA buttons with page selector dropdown
- `FeatureCardEditor` - Edit individual feature cards
- `TestimonialEditor` - Edit individual testimonials
- `StatEditor` - Edit individual stats
- `ImageUploadField` - Upload images with preview
- `IconPicker` - Select icons for features/stats
- `ColorPicker` - Select colors for backgrounds/text
- `LayoutSelector` - Select layout options

**Features:**
1. **Section Management:**
   - Add new sections from library (hero, features, footer, CTA, testimonials, stats, content)
   - Remove sections (with confirmation)
   - Enable/disable sections (hide without deleting)
   - Drag-and-drop reordering of sections
   - Duplicate sections

2. **Section Editing:**
   - Form-based editing with validation
   - Section-specific fields based on type
   - Real-time preview updates
   - Collapsible section editors
   - Validation errors displayed inline

3. **Content Management:**
   - Rich text editor for content sections
   - Image upload with preview
   - Icon picker for features/stats
   - Color picker for backgrounds/text
   - Page selector dropdown for CTA links
   - Drag-and-drop reordering for items within sections

4. **Preview & Publishing:**
   - Split-screen preview panel (desktop/mobile toggle)
   - Real-time preview updates as you edit
   - Save as draft or publish immediately
   - Preview in new tab before publishing
   - Reset to defaults option

5. **Global Settings:**
   - SEO metadata (title, description, keywords, OG image)
   - Theme overrides (colors, fonts)
   - Layout settings (max width, spacing)

**Editor Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Landing Page Editor                    [Preview] [Publish]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │  Sections           │  │  Preview Panel                 │ │
│  │                     │  │                                │ │
│  │  [+ Add Section]    │  │  ┌─────────────────────────┐  │ │
│  │                     │  │  │                         │  │ │
│  │  ☰ Hero Section     │  │  │  [Hero Preview]         │  │ │
│  │    [Edit] [Delete]  │  │  │                         │  │ │
│  │                     │  │  └─────────────────────────┘  │ │
│  │  ☰ Features         │  │                                │ │
│  │    [Edit] [Delete]  │  │  ┌─────────────────────────┐  │ │
│  │                     │  │  │  [Features Preview]     │  │ │
│  │  ☰ CTA Section      │  │  └─────────────────────────┘  │ │
│  │    [Edit] [Delete]  │  │                                │ │
│  │                     │  │  [Desktop] [Mobile]            │ │
│  │  ☰ Footer           │  │                                │ │
│  │    [Edit] [Delete]  │  └───────────────────────────────┘ │
│  │                     │                                     │
│  │  [Global Settings]  │                                     │
│  └─────────────────────┘                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Section Library Modal:**

When clicking "[+ Add Section]", show a modal with available section types:

```
┌─────────────────────────────────────────────────────────────┐
│  Add Section                                          [Close] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  [Icon]  │  │  [Icon]  │  │  [Icon]  │  │  [Icon]  │    │
│  │   Hero   │  │ Features │  │   CTA    │  │  Footer  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  [Icon]  │  │  [Icon]  │  │  [Icon]  │                   │
│  │Testimon. │  │  Stats   │  │ Content  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Section Editor Example (Features Section):**

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Features Section                            [Collapse] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Section Title:                                               │
│  [Our Amazing Features                                    ]   │
│                                                               │
│  Subtitle (optional):                                         │
│  [Everything you need to succeed                          ]   │
│                                                               │
│  Layout:  ○ Grid  ○ List  ○ Carousel                         │
│  Columns: ○ 2     ● 3     ○ 4                                │
│                                                               │
│  Features:                                    [+ Add Feature] │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ☰ Feature 1                        [Edit] [Delete]      │ │
│  │   Icon: Zap  Title: Fast Performance                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ☰ Feature 2                        [Edit] [Delete]      │ │
│  │   Icon: Shield  Title: Secure by Default               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Save Section]  [Cancel]                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Pages Dashboard

**Location:** `frontend/src/app/dashboard/pages/page.tsx`

**Components:**
- `PagesList` - List all pages with filters
- `PageCard` - Individual page card with actions
- `PageFilters` - Filter by status, visibility
- `BulkActions` - Bulk publish, unpublish, delete
- `PageHierarchyView` - Tree view of page hierarchy

**Features:**
- Sortable table with columns: title, slug, status, visibility, updated
- Search by title or slug
- Filter by status (all, draft, published, archived)
- Filter by visibility (all, public, private)
- Bulk actions for multiple pages
- Hierarchical view showing parent-child relationships
- Pagination with 20 items per page

### Page Editor

**Location:** `frontend/src/app/dashboard/pages/[id]/edit/page.tsx`

**Components:**
- `PageEditor` - Main editor component
- `PageBasicInfo` - Title, slug, excerpt
- `ContentEditor` - Markdown or WYSIWYG editor
- `PageMetadata` - SEO fields
- `PageSettings` - Status, visibility, navigation, hierarchy
- `FeaturedImageUpload` - Upload featured image
- `SlugInput` - Auto-generate and validate slug
- `PagePreview` - Preview page before publishing

**Features:**
- Auto-save to draft every 30 seconds
- Real-time slug generation from title
- Slug validation with conflict detection
- Parent page selector (excludes current page and children)
- Show in navigation checkbox
- Display order input
- Custom CSS class input
- Template selector (if multiple templates)
- Preview button (opens in new tab)
- Save as draft or publish buttons

### Public Page Rendering

**Location:** `frontend/src/app/[...slug]/page.tsx`

**Dynamic Route Handling:**
```typescript
// Handles both:
// - /{slug} (top-level pages)
// - /{parent}/{child} (nested pages)

export async function generateStaticParams() {
  // Generate static paths for all published pages
}

export async function generateMetadata({ params }): Promise<Metadata> {
  // Generate SEO metadata from page data
}

export default async function CustomPageRoute({ params }) {
  // Fetch page by slug
  // Check redirects
  // Render page with theme
}
```

**Components:**
- `CustomPageLayout` - Page wrapper with breadcrumbs
- `PageContent` - Render markdown/HTML content
- `PageHeader` - Page title and featured image
- `PageFooter` - Related pages or navigation

### TypeScript Interfaces

```typescript
// frontend/src/types/landing.ts
export interface LandingPageContent {
  id: string;
  sections: Section[];
  settings: GlobalSettings;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Section {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  data: SectionData;
}

export type SectionType = 
  | 'hero' 
  | 'features' 
  | 'footer' 
  | 'cta' 
  | 'testimonials' 
  | 'stats' 
  | 'content';

export type SectionData = 
  | HeroSectionData
  | FeaturesSectionData
  | FooterSectionData
  | CtaSectionData
  | TestimonialsSectionData
  | StatsSectionData
  | ContentSectionData;

export interface GlobalSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  layout?: {
    maxWidth?: 'full' | 'container' | 'narrow';
    spacing?: 'compact' | 'normal' | 'relaxed';
  };
  seo?: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
  };
}

// Section Data Interfaces

export interface HeroSectionData {
  headline: string;
  subheadline: string;
  primaryCta: CtaButton;
  secondaryCta?: CtaButton;
  backgroundImage?: string;
  backgroundType: 'image' | 'gradient' | 'solid';
  backgroundColor?: string;
  textAlignment: 'left' | 'center' | 'right';
  height: 'small' | 'medium' | 'large' | 'full';
}

export interface FeaturesSectionData {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'list' | 'carousel';
  columns: 2 | 3 | 4;
  features: FeatureCard[];
}

export interface FooterSectionData {
  companyName: string;
  description: string;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
  copyright: string;
  showNewsletter: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
}

export interface CtaSectionData {
  title: string;
  description: string;
  primaryCta: CtaButton;
  secondaryCta?: CtaButton;
  backgroundColor: string;
  textColor: string;
  alignment: 'left' | 'center' | 'right';
}

export interface TestimonialsSectionData {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'carousel';
  testimonials: Testimonial[];
}

export interface StatsSectionData {
  title?: string;
  layout: 'horizontal' | 'grid';
  stats: Stat[];
}

export interface ContentSectionData {
  title?: string;
  content: string;
  layout: 'single' | 'two-column';
  image?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
}

// Shared Interfaces

export interface CtaButton {
  text: string;
  link: string;
  linkType: 'url' | 'page';
}

export interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  order: number;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
  icon?: string;
  order: number;
}

export interface NavLink {
  label: string;
  url: string;
  linkType: 'url' | 'page';
  order: number;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// frontend/src/types/page.ts
export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: PageStatus;
  visibility: PageVisibility;
  parentPageId?: string;
  parentPage?: CustomPage;
  childPages?: CustomPage[];
  showInNavigation: boolean;
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  customCssClass?: string;
  templateKey?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PageVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface PageHierarchyNode {
  id: string;
  title: string;
  slug: string;
  children: PageHierarchyNode[];
}
```


## Integration with Existing Systems

### Permission System Integration

**New Permissions:**
```typescript
// backend/prisma/seed-data/auth.seed.ts
export const LANDING_PAGE_PERMISSIONS = [
  {
    name: 'landing:read',
    resource: 'landing',
    action: 'read',
    description: 'View landing page content in admin'
  },
  {
    name: 'landing:write',
    resource: 'landing',
    action: 'write',
    description: 'Edit landing page content'
  },
];

export const CUSTOM_PAGES_PERMISSIONS = [
  {
    name: 'pages:read',
    resource: 'pages',
    action: 'read',
    description: 'View custom pages in admin'
  },
  {
    name: 'pages:write',
    resource: 'pages',
    action: 'write',
    description: 'Create and edit custom pages'
  },
  {
    name: 'pages:delete',
    resource: 'pages',
    action: 'delete',
    description: 'Delete custom pages'
  },
  {
    name: 'pages:publish',
    resource: 'pages',
    action: 'publish',
    description: 'Publish and unpublish custom pages'
  },
];

// Assign to roles
export const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    permissions: ['*:*'],
  },
  ADMIN: {
    permissions: [
      // ... existing permissions
      'landing:read',
      'landing:write',
      'pages:read',
      'pages:write',
      'pages:delete',
      'pages:publish',
    ],
  },
  MANAGER: {
    permissions: [
      // ... existing permissions
      'landing:read',
      'pages:read',
      'pages:write',
    ],
  },
};
```

### Metadata System Integration

**Metadata Configuration:**
```typescript
// frontend/src/lib/metadata-config.ts
export const metadataConfig: Record<string, PageMetadata> = {
  // ... existing routes
  
  '/dashboard/settings/landing-page': {
    title: 'Landing Page Editor',
    description: 'Customize your landing page content',
    breadcrumb: { label: 'Landing Page' },
    robots: { index: false, follow: true },
  },
  
  '/dashboard/pages': {
    title: 'Pages Management',
    description: 'Manage custom pages',
    breadcrumb: { label: 'Pages' },
    robots: { index: false, follow: true },
  },
  
  '/dashboard/pages/new': {
    title: 'Create New Page',
    description: 'Create a new custom page',
    breadcrumb: { label: 'New Page' },
    robots: { index: false, follow: true },
  },
  
  '/dashboard/pages/:id/edit': {
    title: 'Edit Page: {pageTitle}',
    description: 'Edit custom page',
    breadcrumb: { label: '{pageTitle}', dynamic: true },
    robots: { index: false, follow: true },
  },
  
  // Dynamic custom pages
  '/:slug': {
    title: '{pageTitle}',
    description: '{pageDescription}',
    breadcrumb: { label: '{pageTitle}', dynamic: true },
    openGraph: {
      title: '{pageTitle}',
      description: '{pageDescription}',
      images: [{ url: '{pageImage}' }],
      type: 'website',
    },
    twitter: {
      title: '{pageTitle}',
      description: '{pageDescription}',
      images: ['{pageImage}'],
    },
  },
};
```

**Structured Data:**
```typescript
// Generate breadcrumb structured data for nested pages
import { generateBreadcrumbStructuredData } from '@/lib/structured-data-helpers';

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Company', href: '/company' },
  { label: 'About', href: '/company/about' },
];

const structuredData = generateBreadcrumbStructuredData(breadcrumbs);
```

### Navigation System Integration

**Update NavigationContext:**
```typescript
// frontend/src/contexts/NavigationContext.tsx
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  
  useEffect(() => {
    // Fetch pages with showInNavigation = true
    async function fetchNavigationPages() {
      const response = await fetch('/api/pages?showInNavigation=true&status=PUBLISHED');
      const data = await response.json();
      setCustomPages(data.pages);
    }
    fetchNavigationPages();
  }, []);
  
  // Add custom pages to navigation items
  const navigationItems = [
    // ... existing items
    ...customPages.map(page => ({
      title: page.title,
      href: `/${page.slug}`,
      icon: FileText,
      permission: undefined, // Public pages
    })),
  ];
}
```

### Upload Service Integration

**Use Existing Upload Service:**
```typescript
// backend/src/landing/landing.controller.ts
@Post('hero-image')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('landing:write')
@UseInterceptors(FileInterceptor('file'))
async uploadHeroImage(@UploadedFile() file: Express.Multer.File) {
  return this.uploadsService.uploadFile(file, 'landing');
}

// backend/src/pages/pages.controller.ts
@Post('featured-image')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('pages:write')
@UseInterceptors(FileInterceptor('file'))
async uploadFeaturedImage(@UploadedFile() file: Express.Multer.File) {
  return this.uploadsService.uploadFile(file, 'pages');
}
```

### Theme System Integration

**Apply Global Theme:**
```typescript
// frontend/src/app/[...slug]/page.tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

export default async function CustomPageRoute({ params }) {
  const page = await fetchPageBySlug(params.slug);
  
  return (
    <ThemeProvider>
      <div className={`page-container ${page.customCssClass || ''}`}>
        <PageContent page={page} />
      </div>
    </ThemeProvider>
  );
}
```

### Sitemap Integration

**Add Custom Pages to Sitemap:**
```typescript
// frontend/src/lib/sitemap-helpers.ts
export async function generateSitemap(): Promise<string> {
  // ... existing routes
  
  // Add custom pages
  const pagesResponse = await fetch(`${API_URL}/pages?status=PUBLISHED&visibility=PUBLIC`);
  const { pages } = await pagesResponse.json();
  
  const pageUrls = pages.map((page: CustomPage) => {
    const fullSlug = page.parentPage 
      ? `${page.parentPage.slug}/${page.slug}`
      : page.slug;
    
    return {
      url: `${BASE_URL}/${fullSlug}`,
      lastmod: page.updatedAt,
      changefreq: 'weekly',
      priority: 0.7,
    };
  });
  
  // ... generate XML
}
```

## Error Handling

### Backend Error Responses

```typescript
// Slug conflict
throw new ConflictException({
  message: 'Slug already exists',
  suggestedSlug: 'about-us-2',
});

// System route conflict
throw new BadRequestException({
  message: 'Slug conflicts with system route',
  conflictingRoute: '/dashboard',
});

// Parent page circular reference
throw new BadRequestException({
  message: 'Cannot set page as its own parent or descendant',
});

// Page not found
throw new NotFoundException({
  message: 'Page not found',
  pageId: id,
});

// Permission denied
throw new ForbiddenException({
  message: 'Insufficient permissions to perform this action',
  requiredPermission: 'pages:publish',
});
```

### Frontend Error Handling

```typescript
// Slug validation error
<SlugInput
  value={slug}
  onChange={setSlug}
  onValidate={async (slug) => {
    const response = await fetch('/api/pages/validate-slug', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return {
        isValid: false,
        message: error.message,
        suggestedSlug: error.suggestedSlug,
      };
    }
    
    return { isValid: true };
  }}
/>

// Page not found
// frontend/src/app/[...slug]/not-found.tsx
export default function PageNotFound() {
  return (
    <div className="container mx-auto py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link href="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  );
}
```

## Caching Strategy

### Backend Caching

```typescript
// Cache landing page content for 5 minutes
@Injectable()
export class LandingService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  async getContent(): Promise<LandingPageContent> {
    const cached = this.cache.get('landing-content');
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    const content = await this.prisma.landingPageContent.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });
    
    this.cache.set('landing-content', {
      data: content,
      timestamp: Date.now(),
    });
    
    return content;
  }
  
  async updateContent(dto: UpdateLandingContentDto): Promise<LandingPageContent> {
    const updated = await this.prisma.landingPageContent.update({...});
    
    // Invalidate cache
    this.cache.delete('landing-content');
    
    return updated;
  }
}

// Cache custom pages
@Injectable()
export class PagesService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000;
  
  async findBySlug(slug: string): Promise<CustomPage> {
    const cacheKey = `page-${slug}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    const page = await this.prisma.customPage.findUnique({
      where: { slug },
      include: { parentPage: true, childPages: true },
    });
    
    if (page && page.status === 'PUBLISHED') {
      this.cache.set(cacheKey, {
        data: page,
        timestamp: Date.now(),
      });
    }
    
    return page;
  }
  
  async update(id: string, dto: UpdatePageDto): Promise<CustomPage> {
    const page = await this.prisma.customPage.update({...});
    
    // Invalidate cache
    this.cache.delete(`page-${page.slug}`);
    
    return page;
  }
}
```

### Frontend Caching

```typescript
// Use Next.js ISR for custom pages
export const revalidate = 300; // 5 minutes

// Use SWR for admin pages
import useSWR from 'swr';

function PagesList() {
  const { data, error, mutate } = useSWR('/api/pages/admin', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  
  // Mutate after creating/updating/deleting
  const handleDelete = async (id: string) => {
    await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    mutate(); // Revalidate
  };
}
```


## Testing Strategy

### Backend Unit Tests

```typescript
// landing.service.spec.ts
describe('LandingService', () => {
  it('should fetch landing page content');
  it('should update landing page content');
  it('should validate CTA links');
  it('should reset to defaults');
  it('should cache content for 5 minutes');
  it('should invalidate cache on update');
});

// pages.service.spec.ts
describe('PagesService', () => {
  it('should create a new page');
  it('should update an existing page');
  it('should delete a page');
  it('should publish a page');
  it('should unpublish a page');
  it('should validate slug uniqueness');
  it('should prevent circular parent references');
  it('should reorder pages');
  it('should get page hierarchy');
});

// slug.service.spec.ts
describe('SlugService', () => {
  it('should generate slug from title');
  it('should validate slug format');
  it('should check slug availability');
  it('should suggest alternative slugs');
  it('should detect system route conflicts');
});

// redirect.service.spec.ts
describe('RedirectService', () => {
  it('should create redirect when slug changes');
  it('should resolve redirect to target page');
  it('should delete redirects for deleted page');
});
```

### Backend E2E Tests

```typescript
// landing.e2e-spec.ts
describe('Landing API (e2e)', () => {
  it('GET /landing - should return landing page content');
  it('PATCH /landing - should update landing page content (admin)');
  it('PATCH /landing - should reject without permission');
  it('POST /landing/hero-image - should upload hero image');
  it('POST /landing/reset - should reset to defaults');
});

// pages.e2e-spec.ts
describe('Pages API (e2e)', () => {
  it('GET /pages - should list published pages');
  it('GET /pages/slug/:slug - should get page by slug');
  it('GET /pages/admin - should list all pages (admin)');
  it('POST /pages - should create page (admin)');
  it('PATCH /pages/:id - should update page (admin)');
  it('DELETE /pages/:id - should delete page (admin)');
  it('PATCH /pages/:id/publish - should publish page');
  it('POST /pages/validate-slug - should validate slug');
  it('should prevent duplicate slugs');
  it('should prevent system route conflicts');
  it('should prevent circular parent references');
});
```

### Frontend Component Tests

```typescript
// LandingPageEditor.test.tsx
describe('LandingPageEditor', () => {
  it('should render all sections');
  it('should update hero section');
  it('should add/remove feature cards');
  it('should reorder feature cards');
  it('should upload hero background image');
  it('should save changes');
  it('should reset to defaults');
});

// PageEditor.test.tsx
describe('PageEditor', () => {
  it('should render page editor');
  it('should auto-generate slug from title');
  it('should validate slug uniqueness');
  it('should upload featured image');
  it('should save as draft');
  it('should publish page');
  it('should preview page');
  it('should prevent circular parent references');
});

// PagesList.test.tsx
describe('PagesList', () => {
  it('should render pages list');
  it('should filter by status');
  it('should filter by visibility');
  it('should search pages');
  it('should perform bulk actions');
  it('should display page hierarchy');
});

// SlugInput.test.tsx
describe('SlugInput', () => {
  it('should auto-generate slug from title');
  it('should validate slug format');
  it('should check slug availability');
  it('should display error for duplicate slug');
  it('should suggest alternative slug');
});
```

### Frontend Integration Tests

```typescript
// landing-page-cms.integration.test.tsx
describe('Landing Page CMS Integration', () => {
  it('should edit landing page and see changes on public page');
  it('should create custom page and access via URL');
  it('should create nested page and access via parent/child URL');
  it('should link custom page from landing page CTA');
  it('should add page to navigation and see in footer');
  it('should change slug and redirect from old URL');
});
```

## Security Considerations

### Input Validation

- All text inputs sanitized to prevent XSS
- Slug format strictly validated (lowercase, alphanumeric, hyphens only)
- Image uploads validated for type and size
- Custom CSS classes validated for safe characters only
- URL inputs validated for proper format

### Permission Checks

- All admin endpoints protected with JWT authentication
- Permission guards applied to all write operations
- Public endpoints only return published, public pages
- Draft pages only accessible to authenticated users with permissions

### SQL Injection Prevention

- Prisma ORM handles parameterized queries
- No raw SQL queries used
- All user inputs validated before database operations

### Rate Limiting

- API endpoints rate limited to prevent abuse
- Image upload endpoints have stricter rate limits
- Bulk operations limited to prevent resource exhaustion

## Performance Considerations

### Database Optimization

- Indexes on frequently queried fields (slug, status, visibility, parentPageId)
- Composite index on (showInNavigation, displayOrder) for navigation queries
- Pagination for large datasets (20 items per page)
- Cursor-based pagination for better performance

### Caching

- Landing page content cached for 5 minutes
- Custom pages cached for 5 minutes
- Cache invalidation on updates
- Next.js ISR for public pages (5-minute revalidation)

### Image Optimization

- Use Next.js Image component for automatic optimization
- Recommend WebP format for better compression
- Lazy loading for below-fold images
- Responsive images with srcset

### Bundle Size

- Code splitting for admin pages
- Lazy loading for editor components
- Tree shaking for unused code
- Minimize third-party dependencies

## Deployment Considerations

### Database Migration

```bash
# Create migration
cd backend
npx prisma migrate dev --name add_landing_page_cms

# Apply migration to production
npx prisma migrate deploy
```

### Seed Data

```typescript
// backend/prisma/seed.ts
async function seedLandingPageContent() {
  await prisma.landingPageContent.create({
    data: {
      heroHeadline: 'Welcome to Our Platform',
      heroSubheadline: 'Build amazing things with our dashboard starter kit',
      heroPrimaryCta: {
        text: 'Get Started',
        link: '/signup',
        linkType: 'url',
      },
      heroSecondaryCta: {
        text: 'Learn More',
        link: '/about',
        linkType: 'page',
      },
      featuresTitle: 'Features',
      features: [
        {
          icon: 'Zap',
          title: 'Fast Performance',
          description: 'Lightning-fast load times and smooth interactions',
          order: 1,
        },
        // ... more features
      ],
      footerCompanyName: 'Your Company',
      footerDescription: 'Building the future of web applications',
      footerNavLinks: [
        { label: 'About', url: '/about', linkType: 'page', order: 1 },
        { label: 'Contact', url: '/contact', linkType: 'page', order: 2 },
      ],
      footerSocialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/yourcompany', icon: 'Twitter' },
      ],
      footerCopyright: '© 2024 Your Company. All rights reserved.',
      isActive: true,
    },
  });
}
```

### Environment Variables

```env
# No new environment variables required
# Uses existing:
# - DATABASE_URL
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_APP_URL
```

## Future Enhancements

### Phase 2 Features (Not in MVP)

1. **Page Templates**
   - Multiple page templates (default, full-width, sidebar)
   - Template selector in page editor
   - Custom template creation

2. **Drag-and-Drop Page Builder**
   - Visual page builder with blocks
   - Pre-built content blocks
   - Custom block creation

3. **Version History**
   - Track page revisions
   - Compare versions
   - Restore previous versions

4. **Scheduled Publishing**
   - Schedule pages to publish at specific time
   - Schedule pages to unpublish

5. **Page Analytics**
   - Track page views
   - Track time on page
   - Track bounce rate

6. **A/B Testing**
   - Create page variants
   - Split traffic between variants
   - Track conversion rates

7. **Multi-language Support**
   - Translate pages to multiple languages
   - Language selector
   - Automatic language detection

8. **Advanced SEO**
   - Schema.org markup builder
   - Social media preview generator
   - SEO score calculator

9. **Collaboration Features**
   - Multiple authors
   - Comments on pages
   - Approval workflow

10. **Import/Export**
    - Export pages as JSON
    - Import pages from JSON
    - Bulk import from CSV

## Summary

The Landing Page CMS feature provides a comprehensive content management system for landing pages and custom pages. It integrates seamlessly with existing systems (permissions, metadata, theme, uploads) and follows established patterns from the blog and notification systems. The implementation prioritizes security, performance, and user experience while maintaining flexibility for future enhancements.
