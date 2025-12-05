# Dynamic Content Sections - Design Document

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Landing Page CMS                         │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Blog     │  │   Pages    │  │  Products  │           │
│  │  Section   │  │  Section   │  │  Section   │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │                │                │                   │
│        └────────────────┴────────────────┘                   │
│                         │                                    │
│                    API Layer                                 │
│                         │                                    │
│        ┌────────────────┼────────────────┐                  │
│        │                │                │                   │
│   ┌────▼────┐     ┌────▼────┐     ┌────▼────┐             │
│   │  Blog   │     │  Pages  │     │ Products│             │
│   │   API   │     │   API   │     │   API   │             │
│   └────┬────┘     └────┬────┘     └────┬────┘             │
│        │                │                │                   │
│   ┌────▼────┐     ┌────▼────┐     ┌────▼────┐             │
│   │BlogPost │     │Custom   │     │ Product │             │
│   │  Model  │     │  Page   │     │  Model  │             │
│   └─────────┘     └─────────┘     └─────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

### 1. Blog Posts Section

```typescript
// Component Hierarchy
BlogPostsSection
├── SectionHeader (title, subtitle)
├── BlogPostsGrid
│   ├── BlogPostCard (x N)
│   │   ├── FeaturedImage
│   │   ├── PostMeta (author, date, categories)
│   │   ├── PostTitle
│   │   ├── PostExcerpt
│   │   └── ReadMoreButton
│   └── EmptyState (if no posts)
└── ViewAllButton (optional)
```

**Data Flow**:
```
1. Component mounts
2. Fetch posts from API: GET /blog?status=PUBLISHED&limit={count}
3. Apply filters (category, tag)
4. Render cards in selected layout
5. Handle loading and error states
```

### 2. Custom Pages Section

```typescript
// Component Hierarchy
PagesSection
├── SectionHeader (title, subtitle)
├── PagesGrid
│   ├── PageCard (x N)
│   │   ├── FeaturedImage (optional)
│   │   ├── PageTitle
│   │   ├── PageExcerpt (optional)
│   │   └── ViewPageButton
│   └── EmptyState (if no pages)
└── ViewAllButton (optional)
```

**Data Flow**:
```
1. Component mounts
2. Fetch pages from API: GET /pages?status=PUBLISHED&visibility=PUBLIC&limit={count}
3. Apply filters (parent page)
4. Render cards in selected layout
5. Handle loading and error states
```

### 3. Products Section

```typescript
// Component Hierarchy
ProductsSection
├── SectionHeader (title, subtitle)
├── ProductsGrid
│   ├── ProductCard (x N)
│   │   ├── ProductImage
│   │   ├── SaleBadge (if on sale)
│   │   ├── ProductName
│   │   ├── ProductPrice
│   │   ├── ProductRating (optional)
│   │   ├── StockStatus (optional)
│   │   └── AddToCartButton
│   └── EmptyState (if no products)
└── ViewAllButton (optional)
```

**Data Flow**:
```
1. Component mounts
2. Fetch products from API: GET /products?status=ACTIVE&limit={count}
3. Apply filters (category, tag)
4. Render cards in selected layout
5. Handle loading and error states
```

## Layout Designs

### Grid Layout (Default)
```
┌─────────────────────────────────────────────────┐
│              Section Title                       │
│              Section Subtitle                    │
│                                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │      │  │      │  │      │  │      │       │
│  │ Card │  │ Card │  │ Card │  │ Card │       │
│  │      │  │      │  │      │  │      │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │      │  │      │  │      │  │      │       │
│  │ Card │  │ Card │  │ Card │  │ Card │       │
│  │      │  │      │  │      │  │      │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                  │
│           [View All Button]                     │
└─────────────────────────────────────────────────┘
```

### List Layout
```
┌─────────────────────────────────────────────────┐
│              Section Title                       │
│              Section Subtitle                    │
│                                                  │
│  ┌────┐  ┌──────────────────────────────┐      │
│  │Img │  │ Title                         │      │
│  │    │  │ Excerpt text here...          │      │
│  └────┘  │ [Read More]                   │      │
│           └──────────────────────────────┘      │
│                                                  │
│  ┌────┐  ┌──────────────────────────────┐      │
│  │Img │  │ Title                         │      │
│  │    │  │ Excerpt text here...          │      │
│  └────┘  │ [Read More]                   │      │
│           └──────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

### Carousel Layout
```
┌─────────────────────────────────────────────────┐
│              Section Title                       │
│              Section Subtitle                    │
│                                                  │
│  ◄  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ► │
│     │      │  │      │  │      │  │      │    │
│     │ Card │  │ Card │  │ Card │  │ Card │    │
│     │      │  │      │  │      │  │      │    │
│     └──────┘  └──────┘  └──────┘  └──────┘    │
│                                                  │
│              ● ● ○ ○ ○                          │
└─────────────────────────────────────────────────┘
```

## Card Designs

### Blog Post Card
```
┌─────────────────────────┐
│                         │
│    Featured Image       │
│    (16:9 aspect)        │
│                         │
├─────────────────────────┤
│ 📅 Jan 15, 2024         │
│ 👤 John Doe             │
│ 🏷️ Technology           │
├─────────────────────────┤
│ Blog Post Title Here    │
│                         │
│ Short excerpt of the    │
│ blog post content...    │
│                         │
│      [Read More →]      │
└─────────────────────────┘
```

### Page Card
```
┌─────────────────────────┐
│                         │
│    Featured Image       │
│    (16:9 aspect)        │
│    (Optional)           │
│                         │
├─────────────────────────┤
│ Page Title Here         │
│                         │
│ Brief description of    │
│ the page content...     │
│                         │
│    [Learn More →]       │
└─────────────────────────┘
```

### Product Card
```
┌─────────────────────────┐
│  🏷️ SALE                │
│                         │
│    Product Image        │
│    (1:1 aspect)         │
│                         │
├─────────────────────────┤
│ Product Name            │
│                         │
│ ⭐⭐⭐⭐⭐ (4.5)          │
│                         │
│ $49.99  ~~$79.99~~      │
│                         │
│ ✅ In Stock             │
│                         │
│   [Add to Cart]         │
└─────────────────────────┘
```

## Editor UI Design

### Blog Posts Section Editor
```
┌─────────────────────────────────────────────────┐
│ Edit Blog Posts Section                         │
├─────────────────────────────────────────────────┤
│                                                  │
│ Section Title: [Recent Blog Posts          ]    │
│ Subtitle:      [Check out our latest articles]  │
│                                                  │
│ Layout:        [Grid ▼] [3 ▼] columns          │
│ Post Count:    [6 ▼]                            │
│                                                  │
│ Filters:                                         │
│   Category:    [All Categories ▼]               │
│   Tag:         [All Tags ▼]                     │
│                                                  │
│ Display Options:                                 │
│   ☑ Show Author                                 │
│   ☑ Show Date                                   │
│   ☑ Show Categories                             │
│   ☑ Show Excerpt                                │
│                                                  │
│ CTA Button:                                      │
│   Text:        [View All Posts             ]    │
│   Link:        [/blog                      ]    │
│                                                  │
│              [Cancel]  [Save Changes]           │
└─────────────────────────────────────────────────┘
```

## API Integration

### Blog Posts API
```typescript
// Endpoint: GET /blog
// Query Params:
//   - status: PUBLISHED
//   - limit: number
//   - category: string (optional)
//   - tag: string (optional)

interface BlogPostResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  publishedAt: string;
  createdAt: string;
}
```

### Custom Pages API
```typescript
// Endpoint: GET /pages
// Query Params:
//   - status: PUBLISHED
//   - visibility: PUBLIC
//   - limit: number
//   - parentId: string (optional)

interface CustomPageResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  publishedAt: string | null;
}
```

### Products API
```typescript
// Endpoint: GET /products or GET /shop
// Query Params:
//   - status: ACTIVE
//   - limit: number
//   - category: string (optional)
//   - tag: string (optional)

interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  createdAt: string;
}
```

## State Management

### Loading States
```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface SectionState {
  data: BlogPost[] | CustomPage[] | Product[];
  loading: LoadingState;
  error: string | null;
}
```

### Error Handling
```typescript
// Error States
- Network Error: "Unable to load content. Please try again."
- No Data: "No {posts|pages|products} available yet."
- API Error: "Something went wrong. Please refresh the page."
```

## Responsive Behavior

### Breakpoints
- **Mobile** (< 640px): 1 column
- **Tablet** (640px - 1024px): 2 columns
- **Desktop** (> 1024px): 3-4 columns (configurable)

### Mobile Optimizations
- Stack cards vertically
- Reduce image sizes
- Simplify card content
- Touch-friendly buttons
- Swipe for carousel

## Performance Optimizations

### Caching Strategy
```typescript
// Cache API responses for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

// Use SWR or React Query for data fetching
const { data, error, isLoading } = useSWR(
  `/blog?status=PUBLISHED&limit=${postCount}`,
  fetcher,
  { revalidateOnFocus: false, dedupingInterval: CACHE_TTL }
);
```

### Image Optimization
```typescript
// Use Next.js Image component
<Image
  src={post.featuredImage}
  alt={post.title}
  width={600}
  height={400}
  loading="lazy"
  placeholder="blur"
/>
```

### Code Splitting
```typescript
// Lazy load section components
const BlogPostsSection = lazy(() => import('./sections/BlogPostsSection'));
const PagesSection = lazy(() => import('./sections/PagesSection'));
const ProductsSection = lazy(() => import('./sections/ProductsSection'));
```

## Accessibility Features

### Semantic HTML
```html
<section aria-labelledby="blog-posts-title">
  <h2 id="blog-posts-title">Recent Blog Posts</h2>
  <div role="list">
    <article role="listitem">
      <img alt="Blog post featured image" />
      <h3>Post Title</h3>
      <p>Excerpt...</p>
      <a href="/blog/post-slug" aria-label="Read more about Post Title">
        Read More
      </a>
    </article>
  </div>
</section>
```

### Keyboard Navigation
- Tab through cards
- Enter to open card
- Arrow keys for carousel
- Escape to close modals

### Screen Reader Support
- Descriptive alt text for images
- ARIA labels for buttons
- Live regions for loading states
- Semantic heading hierarchy

## Testing Strategy

### Unit Tests
- Test card rendering
- Test data fetching
- Test filtering logic
- Test layout switching

### Integration Tests
- Test API integration
- Test error handling
- Test loading states
- Test empty states

### E2E Tests
- Test full user flow
- Test section configuration
- Test content display
- Test navigation

## Migration Plan

### Phase 1: Foundation
- Add type definitions
- Create base components
- Set up API integration

### Phase 2: Implementation
- Build section components
- Build section editors
- Add to section dropdown

### Phase 3: Polish
- Add loading states
- Add error handling
- Add empty states
- Optimize performance

### Phase 4: Testing
- Write unit tests
- Write integration tests
- Write E2E tests
- Fix bugs

## Success Criteria

✅ All three sections render correctly
✅ API integration works seamlessly
✅ Editors are intuitive and easy to use
✅ Responsive on all devices
✅ Accessible to all users
✅ Performance meets requirements
✅ Tests pass with 80%+ coverage
