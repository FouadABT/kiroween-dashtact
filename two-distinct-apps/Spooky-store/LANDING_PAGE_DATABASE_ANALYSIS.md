# Landing Page Database Analysis - Spooky Store

**Analysis Date**: December 2, 2025  
**Database**: halloweenstoredb  
**Purpose**: Complete analysis of landing page data structure and content

---

## 📊 Database Tables Overview

### 1. **landing_page_content** (Main Landing Page Data)
**Purpose**: Stores the main landing page sections and settings

**Structure**:
- `id` (text, PK) - Unique identifier
- `sections` (jsonb) - Array of page sections (hero, features, CTA, etc.)
- `settings` (jsonb) - SEO, theme, and layout settings
- `version` (integer) - Version number (default: 1)
- `is_active` (boolean) - Active status (default: true)
- `theme_mode` (text) - Theme mode: 'auto', 'light', 'dark' (default: 'auto')
- `header_config_id` (text, FK) - Links to header_configs
- `footer_config_id` (text, FK) - Links to footer_configs
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `published_at` (timestamp, nullable)

**Current Data**:
- **2 records** exist
- **Active landing page**: `default-landing`
- **8 sections** configured
- **No custom header/footer** (IDs are null)

---

### 2. **header_configs** (Dynamic Header Configuration)
**Purpose**: Stores customizable header/navigation settings

**Structure**:
- `id` (text, PK)
- `logo_light` (text, nullable) - Light theme logo URL
- `logo_dark` (text, nullable) - Dark theme logo URL
- `logo_size` (text) - Size: 'sm', 'md', 'lg' (default: 'md')
- `logo_link` (text) - Logo click destination (default: '/')
- `navigation` (jsonb) - Navigation menu items
- `ctas` (jsonb) - Call-to-action buttons
- `style` (jsonb) - Header styling options
- `mobileMenu` (jsonb) - Mobile menu configuration
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Current Data**: **0 records** (using default header)

---

### 3. **footer_configs** (Dynamic Footer Configuration)
**Purpose**: Stores customizable footer settings

**Structure**:
- `id` (text, PK)
- `layout` (text) - Layout type: 'multi-column', 'simple' (default: 'multi-column')
- `columns` (jsonb) - Footer column data
- `social` (jsonb) - Social media links
- `newsletter` (jsonb) - Newsletter signup configuration
- `copyright` (text) - Copyright text
- `legalLinks` (jsonb) - Legal page links (Privacy, Terms, etc.)
- `style` (jsonb) - Footer styling options
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Current Data**: **0 records** (using default footer)

---

### 4. **custom_pages** (Custom CMS Pages)
**Purpose**: Stores custom pages created through the CMS

**Structure**:
- `id` (text, PK)
- `title` (text) - Page title
- `slug` (text, unique) - URL slug (e.g., 'about-us')
- `content` (text) - Page content (HTML/Markdown)
- `excerpt` (text, nullable) - Short description
- `featured_image` (text, nullable) - Featured image URL
- `status` (enum) - 'DRAFT', 'PUBLISHED', 'ARCHIVED' (default: 'DRAFT')
- `visibility` (enum) - 'PUBLIC', 'PRIVATE' (default: 'PUBLIC')
- `parent_page_id` (text, FK, nullable) - Parent page for hierarchy
- `show_in_navigation` (boolean) - Show in nav menu (default: false)
- `display_order` (integer) - Order in navigation (default: 0)
- `meta_title` (text, nullable) - SEO title
- `meta_description` (text, nullable) - SEO description
- `meta_keywords` (text, nullable) - SEO keywords
- `custom_css_class` (text, nullable) - Custom CSS class
- `template_key` (text) - Template to use (default: 'default')
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `published_at` (timestamp, nullable)

**Current Data**: **0 records** (no custom pages created yet)

**Indexes**:
- Unique index on `slug`
- Indexes on `status`, `visibility`, `parent_page_id`
- Composite index on `show_in_navigation` + `display_order`

---

### 5. **page_redirects** (URL Redirects)
**Purpose**: Manages 301/302 redirects when page slugs change

**Structure**:
- `id` (text, PK)
- `from_slug` (text, unique) - Old slug to redirect from
- `to_page_id` (text, FK) - Target page ID
- `redirect_type` (integer) - HTTP status: 301 (permanent), 302 (temporary) (default: 301)
- `created_at` (timestamp)

**Current Data**: **0 records** (no redirects configured)

**Purpose**: Prevents broken links when page URLs change

---

### 6. **landing_analytics** (Landing Page Analytics)
**Purpose**: Tracks visitor interactions and events on landing pages

**Structure**:
- `id` (text, PK)
- `page_id` (text) - Landing page ID
- `event_type` (text) - Event type: 'page_view', 'cta_click', 'form_submit', etc.
- `event_data` (jsonb) - Additional event data
- `session_id` (text) - User session ID
- `user_id` (text, nullable) - User ID if authenticated
- `device_type` (text) - Device: 'desktop', 'mobile', 'tablet'
- `browser` (text) - Browser name
- `referrer` (text, nullable) - Referrer URL
- `timestamp` (timestamp)

**Current Data**: **0 records** (no analytics tracked yet)

**Indexes**:
- Composite index on `page_id` + `timestamp`
- Indexes on `event_type`, `session_id`

---

### 7. **legal_pages** (Legal Pages - Separate System)
**Purpose**: Stores legal pages (Privacy Policy, Terms of Service, etc.)

**Note**: This is a separate system from custom_pages, specifically for legal documents.

---

## 📄 Current Landing Page Content

### Active Landing Page: `default-landing`

#### **Sections** (8 total):

1. **Hero Section** (`hero-1`)
   - Headline: "Enterprise Dashboard Starter Kit"
   - Subheadline: "Production-ready admin dashboard..."
   - Primary CTA: "Start Free Trial" → /signup
   - Secondary CTA: "View Demo" → /login
   - Background: Gradient
   - Text Alignment: Center
   - Height: Large

2. **Stats Section** (`stats-1`)
   - 4 statistics displayed:
     - "50+ Pre-built Components"
     - "99.9% Uptime SLA"
     - "10x Faster Development"
     - "24/7 Support Available"
   - Layout: Horizontal
   - Background: Solid

3. **Features Section 1** (`features-1`)
   - Heading: "Everything You Need to Build Modern Dashboards"
   - 12 features in 3-column grid:
     - Advanced Security
     - User Management
     - Analytics & Reporting
     - E-Commerce Ready
     - Customizable Layouts
     - Email System
     - Messaging Platform
     - Cron Job Management
     - Content Management
     - Branding & Themes
     - Global Search
     - Performance Optimized

4. **Features Section 2** (`features-2`)
   - Heading: "Built with Modern Technology Stack"
   - 6 features in 3-column grid:
     - Next.js 14 & React
     - NestJS Backend
     - PostgreSQL & Prisma
     - Tailwind CSS & shadcn/ui
     - JWT & OAuth
     - Testing Suite

5. **Testimonials Section** (`testimonials-1`)
   - Heading: "Trusted by Development Teams Worldwide"
   - 3 testimonials in grid layout:
     - Sarah Chen (CTO, TechStart Inc)
     - Michael Rodriguez (Lead Developer)
     - Emily Watson (Senior Engineer)

6. **Content Section** (`content-1`)
   - Heading: "Why Choose Our Dashboard Starter Kit?"
   - Rich HTML content with bullet points
   - Image Position: Right
   - Background: Solid

7. **Features Section 3** (`features-3`)
   - Heading: "Key Features for Every Use Case"
   - 6 use cases in 3-column grid:
     - SaaS Applications
     - E-Commerce Platforms
     - Educational Platforms
     - Business Tools
     - Healthcare Systems
     - Analytics Platforms

8. **CTA Section** (`cta-1`)
   - Heading: "Ready to Build Your Next Project?"
   - Subheading: "Start with our production-ready dashboard..."
   - Primary CTA: "Start Free Trial" → /signup
   - Secondary CTA: "View Documentation" → /docs
   - Background: Gradient
   - Alignment: Center

#### **Settings**:

```json
{
  "seo": {
    "title": "Enterprise Dashboard Starter Kit - Next.js, NestJS, PostgreSQL",
    "description": "Production-ready admin dashboard with advanced features...",
    "keywords": [
      "dashboard", "admin panel", "starter kit", "nextjs", "nestjs",
      "postgresql", "typescript", "react", "tailwind", "saas", "enterprise"
    ]
  },
  "theme": {
    "primaryColor": "oklch(0.5 0.2 250)"
  },
  "layout": {
    "spacing": "normal",
    "maxWidth": "container"
  }
}
```

---

## 🎯 Section Types Available

### 1. **hero** - Hero Section
- Headline, subheadline
- Primary & secondary CTAs
- Background type: solid, gradient, image
- Text alignment: left, center, right
- Height: small, medium, large

### 2. **features** - Features Grid
- Heading, subheading
- Feature cards with icon, title, description
- Layout: grid, list
- Columns: 2, 3, 4

### 3. **stats** - Statistics Display
- Stat cards with value, label, description
- Layout: horizontal, vertical, grid

### 4. **testimonials** - Customer Testimonials
- Testimonial cards with quote, author, role, avatar
- Layout: grid, carousel, list
- Columns: 1, 2, 3

### 5. **content** - Rich Content Block
- Heading
- HTML/Markdown content
- Optional image
- Image position: left, right, top, bottom
- Background type: solid, gradient

### 6. **cta** - Call-to-Action
- Heading, subheading
- Primary & secondary CTAs
- Alignment: left, center, right
- Background type: solid, gradient

### 7. **footer** - Footer Section
- Multi-column layout
- Social links
- Newsletter signup
- Legal links

---

## 🔗 Data Relationships

```
landing_page_content
├── header_config_id → header_configs (optional)
├── footer_config_id → footer_configs (optional)
└── sections (jsonb array)
    └── CTAs can link to:
        ├── External URLs (linkType: 'url')
        └── Custom Pages (linkType: 'page', link: page_id)

custom_pages
├── parent_page_id → custom_pages (self-reference)
└── slug (unique, used in URLs)

page_redirects
├── from_slug (old URL)
└── to_page_id → custom_pages

landing_analytics
├── page_id → landing_page_content
└── user_id → users (optional)
```

---

## 🎨 Customization for Spooky Store

### Recommended Changes:

1. **Update Hero Section**:
   - Change headline to: "Welcome to Spooky Store 🎃"
   - Update subheadline for Halloween theme
   - Update CTAs to point to your store pages

2. **Update Stats Section**:
   - Change stats to Halloween/store-related metrics
   - Example: "1000+ Costumes", "500+ Decorations", etc.

3. **Update Features**:
   - Replace tech features with product categories
   - Example: Costumes, Decorations, Accessories, Props

4. **Update SEO Settings**:
   - Title: "Spooky Store - Your Ultimate Halloween Destination"
   - Keywords: halloween, costumes, decorations, spooky, etc.

5. **Update Theme Color**:
   - Change from blue to Halloween orange/purple
   - Current: `oklch(0.5 0.2 250)` (blue)
   - Suggested: `oklch(0.5 0.2 24)` (orange) or `oklch(0.5 0.2 280)` (purple)

---

## 📍 Access Points

### Frontend URLs:
- **Landing Page**: http://localhost:3000/
- **Editor**: http://localhost:3000/dashboard/settings/landing-page
- **Custom Pages**: http://localhost:3000/dashboard/pages

### Backend API Endpoints:
- `GET /landing` - Get active landing page
- `GET /landing/:id` - Get specific landing page
- `PATCH /landing/:id` - Update landing page
- `POST /landing` - Create new landing page
- `GET /pages` - List custom pages
- `POST /pages` - Create custom page
- `GET /pages/slug/:slug` - Get page by slug

---

## 🔐 Permissions Required

- `landing:read` - View landing page editor
- `landing:write` - Edit landing page content
- `pages:read` - View pages dashboard
- `pages:write` - Create/edit pages
- `pages:delete` - Delete pages
- `pages:publish` - Publish/unpublish pages

---

## 📝 Summary

**Total Tables**: 7 (6 active + 1 legal_pages)

**Current State**:
- ✅ Landing page content exists (8 sections)
- ❌ No custom header/footer configured
- ❌ No custom pages created
- ❌ No redirects configured
- ❌ No analytics data collected

**Next Steps for Spooky Store**:
1. Update landing page content for Halloween theme
2. Create custom pages (About, Contact, FAQ)
3. Configure custom header with Halloween branding
4. Configure custom footer with store information
5. Update SEO settings for better search visibility
