# Dynamic Content Sections - Requirements

## Overview
Add three new dynamic section types to the Landing Page CMS that integrate with existing dashboard systems: Blog Posts, Custom Pages, and E-commerce Products. These sections will automatically fetch and display content from the respective APIs.

## Business Goals
- **Content Integration**: Seamlessly display blog posts, pages, and products on the landing page
- **Dynamic Updates**: Automatically show latest content without manual updates
- **Unified Experience**: Consistent design language across all content types
- **Marketing Power**: Showcase blog content, custom pages, and products to drive engagement

## User Stories

### As a Content Manager
- I want to add a "Recent Blog Posts" section to showcase our latest articles
- I want to display custom pages as featured content cards
- I want to highlight products on the landing page to drive sales
- I want to configure how many items to display and their layout
- I want to filter content by category, tags, or status

### As a Site Visitor
- I want to see the latest blog posts on the homepage
- I want to discover custom pages and content
- I want to browse featured products without leaving the landing page
- I want a consistent, beautiful experience across all content types

## Functional Requirements

### 1. Blog Posts Section
**Purpose**: Display recent blog posts from the blog system

**Features**:
- Fetch published blog posts from `/api/blog` endpoint
- Display post title, excerpt, featured image, author, date
- Support multiple layouts: grid, list, carousel
- Filter by category or tag
- Configurable post count (3, 6, 9, 12)
- "Read More" links to individual blog posts
- Show/hide author, date, categories, tags
- Empty state when no posts available

**Data Source**: 
- API: `GET /blog?status=PUBLISHED&limit={count}`
- Model: `BlogPost` from Prisma schema

### 2. Custom Pages Section
**Purpose**: Display custom pages as featured content

**Features**:
- Fetch published custom pages from `/api/pages` endpoint
- Display page title, excerpt, featured image
- Support multiple layouts: grid, cards, list
- Filter by parent page or visibility
- Configurable page count (3, 6, 9, 12)
- Links to individual pages
- Show/hide excerpts, images
- Empty state when no pages available

**Data Source**:
- API: `GET /pages?status=PUBLISHED&visibility=PUBLIC&limit={count}`
- Model: `CustomPage` from Prisma schema

### 3. Products Section
**Purpose**: Display e-commerce products

**Features**:
- Fetch products from `/api/products` or `/shop` endpoint
- Display product name, price, image, rating
- Support multiple layouts: grid, carousel, featured
- Filter by category or tag
- Configurable product count (3, 6, 9, 12)
- "View Product" or "Add to Cart" buttons
- Show/hide price, rating, stock status
- Sale badge for discounted products
- Empty state when no products available

**Data Source**:
- API: `GET /products?status=ACTIVE&limit={count}`
- Model: `Product` from Prisma schema

## Technical Requirements

### Frontend

**Type Definitions** (`frontend/src/types/landing-page.ts`):
```typescript
// Blog Posts Section
export interface BlogPostsSectionData {
  title?: string;
  subtitle?: string;
  layout: 'grid' | 'list' | 'carousel';
  columns: 2 | 3 | 4;
  postCount: 3 | 6 | 9 | 12;
  filterByCategory?: string;
  filterByTag?: string;
  showAuthor: boolean;
  showDate: boolean;
  showCategories: boolean;
  showExcerpt: boolean;
  ctaText: string;
  ctaLink: string;
}

// Custom Pages Section
export interface PagesSectionData {
  title?: string;
  subtitle?: string;
  layout: 'grid' | 'cards' | 'list';
  columns: 2 | 3 | 4;
  pageCount: 3 | 6 | 9 | 12;
  filterByParent?: string;
  showExcerpt: boolean;
  showImage: boolean;
  ctaText: string;
}

// Products Section
export interface ProductsSectionData {
  title?: string;
  subtitle?: string;
  layout: 'grid' | 'carousel' | 'featured';
  columns: 2 | 3 | 4;
  productCount: 3 | 6 | 9 | 12;
  filterByCategory?: string;
  filterByTag?: string;
  showPrice: boolean;
  showRating: boolean;
  showStock: boolean;
  ctaText: string;
}
```

**Section Components**:
- `frontend/src/components/landing/sections/BlogPostsSection.tsx`
- `frontend/src/components/landing/sections/PagesSection.tsx`
- `frontend/src/components/landing/sections/ProductsSection.tsx`

**Section Editors**:
- `frontend/src/components/landing/editors/BlogPostsSectionEditor.tsx`
- `frontend/src/components/landing/editors/PagesSectionEditor.tsx`
- `frontend/src/components/landing/editors/ProductsSectionEditor.tsx`

### Backend

**DTOs** (`backend/src/landing/dto/`):
- `blog-posts-section-data.dto.ts`
- `pages-section-data.dto.ts`
- `products-section-data.dto.ts`

**Validation**:
- Validate layout options
- Validate count ranges
- Validate filter IDs exist
- Sanitize text inputs

### Integration Points

**Existing APIs to Use**:
1. **Blog**: `GET /blog` - Returns published blog posts
2. **Pages**: `GET /pages` - Returns custom pages
3. **Products**: `GET /products` or `GET /shop` - Returns products

**Section Type Updates**:
- Add `'blog-posts' | 'pages' | 'products'` to `SectionType` union
- Update `LandingPageSection` data union type
- Update section rendering switch statement

## Design Requirements

### Visual Design
- **Consistent Cards**: Use same card design across all three sections
- **Responsive Grid**: 1 column mobile, 2-4 columns desktop
- **Image Aspect Ratio**: 16:9 for featured images
- **Typography**: Title (text-xl), excerpt (text-sm), metadata (text-xs)
- **Hover Effects**: Subtle scale and shadow on card hover
- **Loading States**: Skeleton loaders while fetching data
- **Empty States**: Friendly message when no content available

### Layout Options
- **Grid**: Standard card grid (default)
- **List**: Horizontal cards with image on left
- **Carousel**: Horizontal scrolling cards
- **Featured**: Large first item, smaller grid for rest (products only)

### Color Scheme
- Use theme colors (primary, secondary, accent)
- Respect dark/light mode
- Consistent with existing sections

## User Experience

### Configuration Flow
1. Click "Add Section" button
2. Select section type (Blog Posts, Pages, or Products)
3. Configure options in editor:
   - Title and subtitle
   - Layout and columns
   - Item count
   - Filters (category/tag)
   - Display options (show/hide elements)
   - CTA button text
4. Preview changes
5. Save section

### Visitor Experience
1. See section on landing page
2. Browse content cards
3. Click card or CTA to view full content
4. Seamless navigation to blog post, page, or product

## Performance Requirements
- **API Caching**: Cache API responses for 5 minutes
- **Lazy Loading**: Load images lazily
- **Pagination**: Limit API requests to configured count
- **Optimized Images**: Use Next.js Image component
- **Fast Rendering**: < 100ms render time per section

## Accessibility Requirements
- **Semantic HTML**: Use `<article>`, `<section>`, `<nav>`
- **ARIA Labels**: Proper labels for all interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Descriptive alt text and labels
- **Focus Indicators**: Visible focus states

## Security Requirements
- **API Authentication**: Use existing auth for API calls
- **XSS Prevention**: Sanitize all text content
- **CSRF Protection**: Use existing CSRF tokens
- **Rate Limiting**: Respect API rate limits

## Testing Requirements
- **Unit Tests**: Test each section component
- **Integration Tests**: Test API integration
- **E2E Tests**: Test full user flow
- **Visual Tests**: Test responsive layouts
- **Accessibility Tests**: Test with screen readers

## Success Metrics
- **Adoption**: 80% of landing pages use at least one dynamic section
- **Performance**: < 2s page load time with dynamic sections
- **Engagement**: 20% increase in click-through rate to blog/products
- **Satisfaction**: 4.5+ star rating from content managers

## Future Enhancements
- **Advanced Filtering**: Multiple categories, date ranges
- **Sorting Options**: By date, popularity, rating
- **Search Integration**: Filter by search query
- **Custom Queries**: Advanced query builder
- **Analytics**: Track section performance
- **A/B Testing**: Test different layouts
- **Personalization**: Show content based on user preferences
