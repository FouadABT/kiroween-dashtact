# Blog Module

## Overview

The Blog Module provides a complete blog management system with public and protected endpoints. It supports creating, reading, updating, and deleting blog posts with proper permission-based access control.

## Features

- ✅ Automatic slug generation from titles
- ✅ Unique slug enforcement with auto-incrementing
- ✅ Public endpoints for published posts
- ✅ Protected admin endpoints with permission guards
- ✅ Pagination support
- ✅ Filtering by status, category, tag, and search
- ✅ Sorting by date, title, etc.
- ✅ Draft and published post status
- ✅ Category and tag support
- ✅ SEO metadata fields

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get Published Posts
```
GET /blog
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10, max: 50)
  - category: string (filter by category slug)
  - tag: string (filter by tag slug)
  - search: string (search in title, content, excerpt)
  - sortBy: 'publishedAt' | 'createdAt' | 'updatedAt' | 'title'
  - sortOrder: 'asc' | 'desc'

Response:
{
  posts: BlogPost[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

#### Get Post by Slug
```
GET /blog/:slug
Response: BlogPost (only if published)
```

#### Get All Categories
```
GET /blog/categories/all
Response: BlogCategory[] (with post count)
```

#### Get All Tags
```
GET /blog/tags/all
Response: BlogTag[] (with post count)
```

### Protected Endpoints (Requires Authentication + Permissions)

#### Get All Posts (Admin)
```
GET /blog/admin/posts
Requires: blog:read permission
Query Parameters: Same as public endpoint
Response: Same as public endpoint (includes drafts)
```

#### Get Post by ID (Admin)
```
GET /blog/admin/:id
Requires: blog:read permission
Response: BlogPost
```

#### Create Post
```
POST /blog
Requires: blog:write permission
Body: CreateBlogPostDto
Response: BlogPost
```

#### Update Post
```
PATCH /blog/:id
Requires: blog:write permission
Body: UpdateBlogPostDto
Response: BlogPost
```

#### Publish Post
```
PATCH /blog/:id/publish
Requires: blog:publish permission
Response: BlogPost (with status=PUBLISHED and publishedAt set)
```

#### Unpublish Post
```
PATCH /blog/:id/unpublish
Requires: blog:publish permission
Response: BlogPost (with status=DRAFT)
```

#### Delete Post
```
DELETE /blog/:id
Requires: blog:delete permission
Response: BlogPost (deleted post)
```

## DTOs

### CreateBlogPostDto
```typescript
{
  title: string;              // Required, max 200 chars
  slug?: string;              // Optional, auto-generated from title if not provided
  excerpt?: string;           // Optional, max 500 chars
  content: string;            // Required
  featuredImage?: string;     // Optional, URL to image
  status?: PostStatus;        // Optional, default: DRAFT
  authorName?: string;        // Optional
  authorEmail?: string;       // Optional
  metaTitle?: string;         // Optional, max 200 chars
  metaDescription?: string;   // Optional, max 500 chars
  categoryIds?: string[];     // Optional, array of category IDs
  tagIds?: string[];          // Optional, array of tag IDs
}
```

### UpdateBlogPostDto
Same as CreateBlogPostDto but all fields are optional.

### BlogQueryDto
```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 10, max: 50
  status?: PostStatus;        // Filter by status
  category?: string;          // Filter by category slug
  tag?: string;               // Filter by tag slug
  search?: string;            // Search in title, content, excerpt
  fromDate?: string;          // Filter by date (ISO string)
  toDate?: string;            // Filter by date (ISO string)
  sortBy?: string;            // Default: 'publishedAt'
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
}
```

## Service Methods

### Public Methods

#### `findPublished(query: BlogQueryDto)`
Returns paginated list of published posts.

#### `findBySlug(slug: string)`
Returns a single published post by slug. Throws NotFoundException if not found or not published.

#### `findAllCategories()`
Returns all categories with post count.

#### `findAllTags()`
Returns all tags with post count.

### Admin Methods

#### `findAll(query: BlogQueryDto)`
Returns paginated list of all posts (including drafts).

#### `findOne(id: string)`
Returns a single post by ID. Throws NotFoundException if not found.

#### `create(dto: CreateBlogPostDto, userId?: string)`
Creates a new blog post. Auto-generates slug if not provided. Ensures slug uniqueness.

#### `update(id: string, dto: UpdateBlogPostDto)`
Updates an existing post. Validates slug uniqueness if changed.

#### `publish(id: string)`
Publishes a post (sets status to PUBLISHED and publishedAt to current date).

#### `unpublish(id: string)`
Unpublishes a post (sets status to DRAFT).

#### `remove(id: string)`
Deletes a post permanently.

### Utility Methods

#### `generateSlug(title: string): string`
Generates a URL-friendly slug from a title:
- Converts to lowercase
- Removes special characters
- Replaces spaces with hyphens
- Removes leading/trailing hyphens

Example: "My First Blog Post!" → "my-first-blog-post"

#### `ensureUniqueSlug(slug: string, excludeId?: string): Promise<string>`
Ensures slug is unique by appending a number if necessary:
- "my-post" → "my-post" (if unique)
- "my-post" → "my-post-1" (if exists)
- "my-post" → "my-post-2" (if my-post-1 exists)

## Permissions

The blog module uses the following permissions:

- `blog:read` - View blog posts in dashboard
- `blog:write` - Create and edit blog posts
- `blog:delete` - Delete blog posts
- `blog:publish` - Publish/unpublish blog posts

These permissions should be added to the seed data and assigned to appropriate roles.

## Usage Examples

### Creating a Blog Post

```typescript
// With auto-generated slug
const post = await blogService.create({
  title: 'My First Post',
  content: 'This is the content...',
  excerpt: 'A short excerpt',
  status: PostStatus.DRAFT,
}, userId);
// Slug will be: "my-first-post"

// With custom slug
const post = await blogService.create({
  title: 'My First Post',
  slug: 'custom-slug',
  content: 'This is the content...',
}, userId);
// Slug will be: "custom-slug"
```

### Publishing a Post

```typescript
const publishedPost = await blogService.publish(postId);
// Sets status to PUBLISHED and publishedAt to current date
```

### Querying Posts

```typescript
// Get published posts with pagination
const result = await blogService.findPublished({
  page: 1,
  limit: 10,
  sortBy: 'publishedAt',
  sortOrder: 'desc',
});

// Search posts
const result = await blogService.findPublished({
  search: 'nextjs',
  page: 1,
  limit: 10,
});

// Filter by category
const result = await blogService.findPublished({
  category: 'tutorials',
  page: 1,
  limit: 10,
});
```

### Getting a Post by Slug

```typescript
try {
  const post = await blogService.findBySlug('my-first-post');
  // Returns post if published
} catch (error) {
  // Throws NotFoundException if not found or not published
}
```

## Error Handling

The service throws the following exceptions:

- `NotFoundException` - When a post is not found or not published (for public access)
- `ConflictException` - When a slug already exists

## Integration with Frontend

The blog module is designed to work with the frontend blog pages:

- Public blog listing: `/blog`
- Individual blog post: `/blog/[slug]`
- Blog management: `/dashboard/blog`

## Next Steps

After implementing the blog module:

1. ✅ Task 3.1: Create blog module structure and service (COMPLETE)
2. ⏭️ Task 3.2: Implement blog CRUD operations (Already implemented in service)
3. ⏭️ Task 3.3: Add blog API endpoints with permissions (Already implemented in controller)

The blog module is now ready for use. The database schema needs to be updated with BlogCategory and BlogTag models, and migrations need to be run.
