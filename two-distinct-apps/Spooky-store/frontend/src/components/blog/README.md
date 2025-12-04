# Blog Components

This directory contains all components related to the blog system.

## Components

### BlogList
Displays a paginated list of blog posts. Fetches published posts from the API and renders them in a grid layout.

**Props:**
- `page` (number): Current page number (1-indexed)

**Features:**
- Automatic data fetching
- Loading states
- Error handling
- Empty state
- Responsive grid layout

**Usage:**
```tsx
import { BlogList } from '@/components/blog/BlogList';

<BlogList page={1} />
```

### BlogCard
Displays a blog post preview card with featured image, title, excerpt, author, and publish date.

**Props:**
- `post` (BlogPost): Blog post data

**Features:**
- Featured image with Next.js Image optimization
- Category badges
- Author information
- Publish date
- Hover effects
- Responsive design

**Usage:**
```tsx
import { BlogCard } from '@/components/blog/BlogCard';

<BlogCard post={post} />
```

### BlogPost
Displays a full blog post with markdown content rendering.

**Props:**
- `post` (BlogPost): Blog post data

**Features:**
- Breadcrumb navigation
- Featured image
- Markdown content rendering with syntax highlighting
- Author information
- Categories and tags
- Back to blog navigation
- Responsive typography

**Usage:**
```tsx
import { BlogPost } from '@/components/blog/BlogPost';

<BlogPost post={post} />
```

### BlogPagination
Displays pagination controls for navigating through blog posts.

**Props:**
- `currentPage` (number): Current page number (1-indexed)
- `totalPages` (number): Total number of pages

**Features:**
- Previous/Next buttons
- Page number buttons
- Ellipsis for large page counts
- Accessible navigation
- Keyboard support

**Usage:**
```tsx
import { BlogPagination } from '@/components/blog/BlogPagination';

<BlogPagination currentPage={1} totalPages={10} />
```

## Pages

### /blog
Blog listing page that displays all published blog posts with pagination.

**Features:**
- SEO optimized metadata
- Breadcrumb navigation
- Responsive layout
- Feature flag check

### /blog/[slug]
Individual blog post page that displays a single post by slug.

**Features:**
- Dynamic metadata generation
- Structured data (JSON-LD) for articles
- Markdown content rendering
- SEO optimization
- Not found handling
- Feature flag check

## API Integration

All blog components fetch data from the backend API:

**Endpoints:**
- `GET /blog` - List published posts (paginated)
- `GET /blog/:slug` - Get single post by slug

**Configuration:**
- API URL: `process.env.NEXT_PUBLIC_API_URL` (default: http://localhost:3001)
- Posts per page: `featuresConfig.blog.postsPerPage` (default: 10)

## SEO Features

### Metadata
- Dynamic page titles and descriptions
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs
- Robots meta tags

### Structured Data
- Article structured data (JSON-LD)
- Breadcrumb structured data
- Author information
- Publisher information

### Sitemap
- Blog posts automatically included in sitemap.xml
- Dynamic generation based on published posts
- Proper lastModified dates
- Change frequency and priority settings

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui components for UI elements
- Responsive design patterns
- Dark mode support
- Accessible color contrast

## Markdown Rendering

Blog posts support rich markdown content with:
- Headings (h1-h6)
- Paragraphs
- Lists (ordered and unordered)
- Blockquotes
- Code blocks with syntax highlighting
- Inline code
- Links
- Images with Next.js Image optimization
- Tables (via remark-gfm)
- Strikethrough (via remark-gfm)
- Task lists (via remark-gfm)

## Accessibility

All components follow WCAG 2.1 AA standards:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast compliance

## Performance

Optimizations include:
- Next.js Image component for images
- ISR (Incremental Static Regeneration) for blog pages
- Lazy loading for images
- Efficient pagination
- Minimal JavaScript bundle size

## Feature Flags

The blog system can be enabled/disabled via configuration:

```env
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
```

When disabled:
- Blog routes return 404
- Blog navigation hidden
- No API calls made

## Future Enhancements

Potential improvements:
- Search functionality
- Category/tag filtering
- Related posts
- Comments system
- Social sharing buttons
- Reading time estimate
- Table of contents
- RSS feed


## Dashboard Components

### BlogManagement
Main blog management dashboard component for listing and managing all blog posts.

**Location:** `/dashboard/blog`

**Features:**
- List all blog posts (drafts and published)
- Filter by status (all, draft, published, archived)
- Search blog posts by title and content
- Create new blog post
- Edit existing blog post
- Delete blog post with confirmation dialog
- Publish/unpublish blog post
- Status indicators (badges)
- Pagination
- Responsive table layout

**Permissions:** Requires `blog:read` permission

**Usage:**
```tsx
import { BlogManagement } from '@/components/blog/BlogManagement';

<PermissionGuard permission="blog:read">
  <BlogManagement />
</PermissionGuard>
```

### BlogEditor
Form component for creating and editing blog posts with full CRUD functionality.

**Location:** `/dashboard/blog/new` and `/dashboard/blog/[id]/edit`

**Props:**
- `post` (BlogPost, optional): Existing blog post to edit
- `mode` ('create' | 'edit'): Editor mode

**Features:**
- Title input with slug generation
- Slug input with auto-generation button
- Excerpt textarea
- Featured image upload integration
- Optional author fields (name, email) based on `NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR`
- Category selection (conditional on `blog.enableCategories`)
- Tag selection (conditional on `blog.enableTags`)
- Markdown editor with formatting toolbar and preview
- SEO metadata fields (meta title, meta description)
- Save draft button
- Publish button
- Auto-save functionality (every 30 seconds for existing posts)
- Form validation
- Loading states
- Error handling

**Permissions:** Requires `blog:write` permission

**Usage:**
```tsx
// Create mode
<BlogEditor mode="create" />

// Edit mode
<BlogEditor post={existingPost} mode="edit" />
```

### MarkdownEditor
Markdown editor component with formatting toolbar and live preview.

**Props:**
- `value` (string): Current markdown content
- `onChange` (function): Callback when content changes
- `label` (string, optional): Label for the editor
- `placeholder` (string, optional): Placeholder text
- `rows` (number, optional): Number of rows for textarea
- `required` (boolean, optional): Whether the field is required

**Features:**
- Formatting toolbar with buttons for:
  - Bold, italic
  - Headings (H1, H2, H3)
  - Lists (unordered, ordered)
  - Links, images
  - Code (inline and blocks)
  - Blockquotes
- Write and Preview tabs
- Live markdown preview
- Keyboard shortcuts support
- Mobile-friendly interface
- Syntax highlighting in preview

**Usage:**
```tsx
import { MarkdownEditor } from '@/components/blog/MarkdownEditor';

const [content, setContent] = useState('');

<MarkdownEditor
  value={content}
  onChange={setContent}
  label="Content"
  placeholder="Write your content..."
  rows={15}
  required
/>
```

## Dashboard Pages

### /dashboard/blog
Blog management dashboard page.

**Features:**
- Permission guard (blog:read)
- Page header with title and description
- BlogManagement component
- Breadcrumb navigation
- SEO metadata (noindex)

### /dashboard/blog/new
Create new blog post page.

**Features:**
- Permission guard (blog:write)
- Page header
- BlogEditor in create mode
- Breadcrumb navigation
- SEO metadata (noindex)

### /dashboard/blog/[id]/edit
Edit existing blog post page.

**Features:**
- Permission guard (blog:write)
- Page header
- BlogEditor in edit mode with post data
- Client-side data fetching
- Loading state
- Error handling
- Not found handling
- Breadcrumb navigation
- SEO metadata (noindex)

## Protected API Endpoints

Dashboard components use the following protected endpoints:

**Blog Management:**
- `GET /blog/admin/posts` - List all posts (requires `blog:read`)
- `GET /blog/admin/:id` - Get post by ID (requires `blog:read`)
- `POST /blog` - Create post (requires `blog:write`)
- `PATCH /blog/:id` - Update post (requires `blog:write`)
- `DELETE /blog/:id` - Delete post (requires `blog:delete`)
- `PATCH /blog/:id/publish` - Publish post (requires `blog:publish`)
- `PATCH /blog/:id/unpublish` - Unpublish post (requires `blog:publish`)

**Categories and Tags:**
- `GET /blog/categories/all` - List all categories (public)
- `GET /blog/tags/all` - List all tags (public)

## Auto-Save Functionality

The BlogEditor includes automatic draft saving:

**How it works:**
- Saves draft every 30 seconds
- Only active for existing posts in edit mode
- Checks if content has changed before saving
- Always saves as DRAFT status to prevent accidental publishing
- Shows visual indicator during save
- Displays last saved time

**Implementation:**
```tsx
useEffect(() => {
  const autoSaveInterval = setInterval(async () => {
    if (hasChanges && formData.title && formData.content) {
      // Auto-save logic
    }
  }, 30000); // 30 seconds

  return () => clearInterval(autoSaveInterval);
}, [formData]);
```

## Form Validation

BlogEditor validates the following fields:

**Required Fields:**
- Title (must not be empty)
- Content (must not be empty)
- Author name (if `NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=true`)

**Optional Fields:**
- Slug (auto-generated if empty)
- Excerpt
- Featured image
- Author email
- Categories
- Tags
- Meta title
- Meta description

**Validation Errors:**
- Displayed as toast notifications
- Prevents form submission
- Clear error messages

## Configuration

Dashboard components respect the following feature flags:

```env
# Enable/disable blog system
NEXT_PUBLIC_ENABLE_BLOG=true

# Posts per page
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10

# Enable/disable categories
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true

# Enable/disable tags
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true

# Require author information
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

## Permissions System

Blog dashboard requires the following permissions:

- `blog:read` - View blog posts in dashboard
- `blog:write` - Create and edit blog posts
- `blog:delete` - Delete blog posts
- `blog:publish` - Publish/unpublish blog posts

**Permission Assignment:**
```typescript
// In backend/prisma/seed-data/auth.seed.ts
ADMIN: {
  permissions: [
    'blog:read',
    'blog:write',
    'blog:delete',
    'blog:publish',
  ],
},
```

## Error Handling

Dashboard components handle errors gracefully:

**API Errors:**
- Network failures
- Authentication errors (401)
- Permission errors (403)
- Not found errors (404)
- Server errors (500)

**User Feedback:**
- Toast notifications for success/error
- Loading states during operations
- Error messages with retry options
- Confirmation dialogs for destructive actions

## Responsive Design

All dashboard components are fully responsive:

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Adaptations:**
- Stacked layouts on mobile
- Horizontal layouts on desktop
- Touch-friendly buttons
- Collapsible filters
- Responsive tables

## Testing

Dashboard components should be tested for:

**Functionality:**
- CRUD operations
- Form validation
- Auto-save
- Publish/unpublish
- Delete with confirmation
- Search and filters
- Pagination

**Permissions:**
- Access control
- Permission guards
- Unauthorized access handling

**UI/UX:**
- Loading states
- Error states
- Empty states
- Responsive design
- Accessibility

## Troubleshooting

### Blog Management Not Loading
- Check if user has `blog:read` permission
- Verify backend API is running
- Check browser console for errors
- Verify authentication token is valid

### Cannot Create/Edit Posts
- Check if user has `blog:write` permission
- Verify form validation passes
- Check network tab for API errors
- Ensure required fields are filled

### Auto-Save Not Working
- Only works in edit mode
- Requires existing post
- Check browser console for errors
- Verify 30-second interval

### Categories/Tags Not Showing
- Check feature flags in `.env.local`
- Verify categories/tags exist in database
- Check API endpoints are accessible

