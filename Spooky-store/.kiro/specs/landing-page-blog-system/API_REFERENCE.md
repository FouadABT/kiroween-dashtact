# API Reference

## Overview

Complete reference for all blog system API endpoints.

## Base URL

**Development:** `http://localhost:3001`  
**Production:** `https://api.yourdomain.com`

## Authentication

Protected endpoints require JWT authentication via Bearer token:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

Get token by logging in:

```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

## Public Endpoints

### List Published Posts

```
GET /blog
```

Returns paginated list of published blog posts.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Posts per page |
| category | string | - | Filter by category slug |
| tag | string | - | Filter by tag slug |
| search | string | - | Search in title and content |
| sortBy | string | publishedAt | Sort field |
| order | string | desc | Sort order (asc/desc) |

**Example Request:**

```bash
curl http://localhost:3001/blog?page=1&limit=10&category=technology
```

**Example Response:**

```json
{
  "posts": [
    {
      "id": "clx123abc",
      "title": "Getting Started with Next.js",
      "slug": "getting-started-with-nextjs",
      "excerpt": "Learn the basics of Next.js...",
      "content": "# Getting Started\n\n...",
      "featuredImage": "https://example.com/image.jpg",
      "status": "PUBLISHED",
      "publishedAt": "2024-01-15T10:00:00Z",
      "author": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "categories": [
        {
          "id": "cat123",
          "name": "Technology",
          "slug": "technology"
        }
      ],
      "tags": [
        {
          "id": "tag123",
          "name": "Next.js",
          "slug": "nextjs"
        }
      ],
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Get Single Post by Slug

```
GET /blog/:slug
```

Returns a single published blog post by its slug.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | Post URL slug |

**Example Request:**

```bash
curl http://localhost:3001/blog/getting-started-with-nextjs
```

**Example Response:**

```json
{
  "id": "clx123abc",
  "title": "Getting Started with Next.js",
  "slug": "getting-started-with-nextjs",
  "excerpt": "Learn the basics of Next.js...",
  "content": "# Getting Started\n\nNext.js is...",
  "featuredImage": "https://example.com/image.jpg",
  "status": "PUBLISHED",
  "publishedAt": "2024-01-15T10:00:00Z",
  "author": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "categories": [...],
  "tags": [...],
  "metaTitle": "Getting Started with Next.js - Blog",
  "metaDescription": "Learn the basics of Next.js...",
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

---

### List Categories

```
GET /blog/categories
```

Returns all blog categories.

**Example Request:**

```bash
curl http://localhost:3001/blog/categories
```

**Example Response:**

```json
[
  {
    "id": "cat123",
    "name": "Technology",
    "slug": "technology",
    "description": "Tech-related posts",
    "postCount": 15,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "cat456",
    "name": "Design",
    "slug": "design",
    "description": "Design articles",
    "postCount": 8,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### List Tags

```
GET /blog/tags
```

Returns all blog tags.

**Example Request:**

```bash
curl http://localhost:3001/blog/tags
```

**Example Response:**

```json
[
  {
    "id": "tag123",
    "name": "Next.js",
    "slug": "nextjs",
    "postCount": 12,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "tag456",
    "name": "React",
    "slug": "react",
    "postCount": 20,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

## Protected Endpoints

### List All Posts (Admin)

```
GET /blog/admin
```

Returns all blog posts including drafts. Requires `blog:read` permission.

**Query Parameters:**

Same as public list endpoint, plus:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status (DRAFT/PUBLISHED/ARCHIVED) |

**Example Request:**

```bash
curl http://localhost:3001/blog/admin?status=DRAFT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

```json
{
  "posts": [
    {
      "id": "clx789def",
      "title": "Draft Post",
      "slug": "draft-post",
      "status": "DRAFT",
      "publishedAt": null,
      ...
    }
  ],
  "pagination": {...}
}
```

---

### Create Post

```
POST /blog
```

Creates a new blog post. Requires `blog:write` permission.

**Request Body:**

```json
{
  "title": "My Blog Post",
  "content": "# Hello World\n\nThis is my post content.",
  "excerpt": "A short summary",
  "featuredImage": "https://example.com/image.jpg",
  "status": "DRAFT",
  "authorName": "John Doe",
  "authorEmail": "john@example.com",
  "categoryIds": ["cat123", "cat456"],
  "tagIds": ["tag123", "tag456"],
  "metaTitle": "Custom SEO Title",
  "metaDescription": "Custom SEO description"
}
```

**Required Fields:**
- `title` (string, 1-200 chars)
- `content` (string, min 1 char)

**Optional Fields:**
- `excerpt` (string, max 500 chars) - Auto-generated if empty
- `featuredImage` (string, valid URL)
- `status` (enum: DRAFT/PUBLISHED) - Default: DRAFT
- `authorName` (string, max 100 chars)
- `authorEmail` (string, valid email)
- `categoryIds` (array of strings)
- `tagIds` (array of strings)
- `metaTitle` (string, max 200 chars)
- `metaDescription` (string, max 500 chars)

**Example Request:**

```bash
curl -X POST http://localhost:3001/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "# Hello\n\nThis is my first post!",
    "status": "DRAFT"
  }'
```

**Example Response:**

```json
{
  "id": "clx123abc",
  "title": "My First Post",
  "slug": "my-first-post",
  "content": "# Hello\n\nThis is my first post!",
  "excerpt": "Hello This is my first post!",
  "status": "DRAFT",
  "publishedAt": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Validation Error
{
  "statusCode": 400,
  "message": ["title must be shorter than or equal to 200 characters"],
  "error": "Bad Request"
}

// 403 Forbidden - Missing Permission
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}

// 409 Conflict - Slug Already Exists
{
  "statusCode": 409,
  "message": "Post with this slug already exists",
  "error": "Conflict"
}
```

---

### Get Post by ID (Admin)

```
GET /blog/admin/:id
```

Returns a single post by ID (including drafts). Requires `blog:read` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Post ID |

**Example Request:**

```bash
curl http://localhost:3001/blog/admin/clx123abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

Same as public get post response, but includes drafts.

---

### Update Post

```
PATCH /blog/:id
```

Updates an existing blog post. Requires `blog:write` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Post ID |

**Request Body:**

All fields are optional. Only include fields you want to update.

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "excerpt": "Updated excerpt",
  "featuredImage": "https://example.com/new-image.jpg",
  "categoryIds": ["cat123"],
  "tagIds": ["tag123", "tag456"]
}
```

**Example Request:**

```bash
curl -X PATCH http://localhost:3001/blog/clx123abc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

**Example Response:**

```json
{
  "id": "clx123abc",
  "title": "Updated Title",
  "content": "Updated content",
  "updatedAt": "2024-01-15T11:00:00Z",
  ...
}
```

---

### Delete Post

```
DELETE /blog/:id
```

Permanently deletes a blog post. Requires `blog:delete` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Post ID |

**Example Request:**

```bash
curl -X DELETE http://localhost:3001/blog/clx123abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

```json
{
  "message": "Post deleted successfully",
  "id": "clx123abc"
}
```

**Warning:** This action is permanent and cannot be undone.

---

### Publish Post

```
PATCH /blog/:id/publish
```

Publishes a draft post. Requires `blog:publish` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Post ID |

**Example Request:**

```bash
curl -X PATCH http://localhost:3001/blog/clx123abc/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

```json
{
  "id": "clx123abc",
  "status": "PUBLISHED",
  "publishedAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

---

### Unpublish Post

```
PATCH /blog/:id/unpublish
```

Unpublishes a published post (changes status to DRAFT). Requires `blog:publish` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Post ID |

**Example Request:**

```bash
curl -X PATCH http://localhost:3001/blog/clx123abc/unpublish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

```json
{
  "id": "clx123abc",
  "status": "DRAFT",
  "publishedAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T13:00:00Z"
}
```

---

### Create Category

```
POST /blog/categories
```

Creates a new blog category. Requires `blog:write` permission.

**Request Body:**

```json
{
  "name": "Technology",
  "description": "Tech-related posts"
}
```

**Required Fields:**
- `name` (string, 1-100 chars, unique)

**Optional Fields:**
- `description` (string, max 500 chars)

**Example Request:**

```bash
curl -X POST http://localhost:3001/blog/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Technology",
    "description": "Tech-related posts"
  }'
```

**Example Response:**

```json
{
  "id": "cat123",
  "name": "Technology",
  "slug": "technology",
  "description": "Tech-related posts",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Update Category

```
PATCH /blog/categories/:id
```

Updates a blog category. Requires `blog:write` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Category ID |

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Example Request:**

```bash
curl -X PATCH http://localhost:3001/blog/categories/cat123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Technology"
  }'
```

---

### Delete Category

```
DELETE /blog/categories/:id
```

Deletes a blog category. Requires `blog:delete` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Category ID |

**Example Request:**

```bash
curl -X DELETE http://localhost:3001/blog/categories/cat123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note:** Posts in this category will not be deleted, just unlinked.

---

### Create Tag

```
POST /blog/tags
```

Creates a new blog tag. Requires `blog:write` permission.

**Request Body:**

```json
{
  "name": "Next.js"
}
```

**Required Fields:**
- `name` (string, 1-50 chars, unique)

**Example Request:**

```bash
curl -X POST http://localhost:3001/blog/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Next.js"
  }'
```

**Example Response:**

```json
{
  "id": "tag123",
  "name": "Next.js",
  "slug": "nextjs",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Update Tag

```
PATCH /blog/tags/:id
```

Updates a blog tag. Requires `blog:write` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Tag ID |

**Request Body:**

```json
{
  "name": "Updated Tag Name"
}
```

---

### Delete Tag

```
DELETE /blog/tags/:id
```

Deletes a blog tag. Requires `blog:delete` permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Tag ID |

**Example Request:**

```bash
curl -X DELETE http://localhost:3001/blog/tags/tag123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Error type"
}
```

### Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Missing permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

**Limits:**
- Public endpoints: 100 requests per 15 minutes per IP
- Protected endpoints: 1000 requests per 15 minutes per user

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642262400
```

**Error Response:**
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

---

## Pagination

### Page-Based Pagination

```
GET /blog?page=2&limit=10
```

**Response:**
```json
{
  "posts": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Cursor-Based Pagination

```
GET /blog?cursor=clx123abc&limit=10
```

**Response:**
```json
{
  "posts": [...],
  "pagination": {
    "cursor": "clx123abc",
    "nextCursor": "clx456def",
    "hasMore": true
  }
}
```

---

## Filtering and Sorting

### Filter by Category

```
GET /blog?category=technology
```

### Filter by Tag

```
GET /blog?tag=nextjs
```

### Filter by Status (Admin)

```
GET /blog/admin?status=DRAFT
```

### Search

```
GET /blog?search=next.js
```

### Sort

```
GET /blog?sortBy=title&order=asc
GET /blog?sortBy=publishedAt&order=desc
```

**Available Sort Fields:**
- `title`
- `publishedAt`
- `createdAt`
- `updatedAt`

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Fetch published posts
async function fetchPosts(page = 1) {
  const response = await fetch(
    `http://localhost:3001/blog?page=${page}&limit=10`
  );
  const data = await response.json();
  return data;
}

// Create post
async function createPost(token: string, post: CreatePostDto) {
  const response = await fetch('http://localhost:3001/blog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create post');
  }
  
  return response.json();
}

// Publish post
async function publishPost(token: string, postId: string) {
  const response = await fetch(
    `http://localhost:3001/blog/${postId}/publish`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  return response.json();
}
```

### Python

```python
import requests

# Fetch published posts
def fetch_posts(page=1):
    response = requests.get(
        f'http://localhost:3001/blog?page={page}&limit=10'
    )
    return response.json()

# Create post
def create_post(token, post_data):
    response = requests.post(
        'http://localhost:3001/blog',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        },
        json=post_data
    )
    response.raise_for_status()
    return response.json()
```

### cURL

```bash
# List posts
curl http://localhost:3001/blog?page=1&limit=10

# Get single post
curl http://localhost:3001/blog/my-post-slug

# Create post
curl -X POST http://localhost:3001/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"My Post","content":"Content here"}'

# Update post
curl -X PATCH http://localhost:3001/blog/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Updated Title"}'

# Delete post
curl -X DELETE http://localhost:3001/blog/POST_ID \
  -H "Authorization: Bearer TOKEN"

# Publish post
curl -X PATCH http://localhost:3001/blog/POST_ID/publish \
  -H "Authorization: Bearer TOKEN"
```

---

## Webhooks (Future)

Webhook support is planned for future releases:

- `post.created`
- `post.updated`
- `post.published`
- `post.deleted`

---

## Additional Resources

- **Setup Guide**: `SETUP_GUIDE.md`
- **Blog Management**: `BLOG_MANAGEMENT_GUIDE.md`
- **Configuration**: `CONFIGURATION_GUIDE.md`
- **Environment Variables**: `ENVIRONMENT_VARIABLES.md`
