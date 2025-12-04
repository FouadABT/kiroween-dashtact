# Blog Management Guide

## Overview

This guide explains how to create, edit, publish, and manage blog posts using the dashboard interface and API.

## Table of Contents

- [Accessing Blog Management](#accessing-blog-management)
- [Creating Blog Posts](#creating-blog-posts)
- [Editing Blog Posts](#editing-blog-posts)
- [Publishing Workflow](#publishing-workflow)
- [Managing Categories and Tags](#managing-categories-and-tags)
- [Image Management](#image-management)
- [SEO Optimization](#seo-optimization)
- [API Usage](#api-usage)
- [Best Practices](#best-practices)

## Accessing Blog Management

### Dashboard Access

1. Login to your dashboard
2. Look for "Blog" in the sidebar navigation
3. Click to access the blog management page

**Requirements:**
- User must be authenticated
- User must have `blog:read` permission
- Blog feature must be enabled (`NEXT_PUBLIC_ENABLE_BLOG=true`)

### URL

Direct access: `http://localhost:3000/dashboard/blog`

## Creating Blog Posts

### Via Dashboard

1. Navigate to `/dashboard/blog`
2. Click the "Create Post" button
3. Fill in the form fields:

#### Required Fields

**Title**
- Post title (used for display and SEO)
- Automatically generates URL slug
- Example: "Getting Started with Next.js"

**Content**
- Full post content in markdown format
- Supports rich formatting (headings, lists, links, images)
- Use the markdown editor toolbar for formatting

#### Optional Fields

**Excerpt**
- Short summary of the post (150-200 characters recommended)
- If left empty, automatically generated from content
- Used in blog listing cards and meta descriptions

**Featured Image**
- Main image for the post
- Displayed in blog listing and post header
- Recommended size: 1200x630px (for social sharing)
- Formats: JPG, PNG, WebP

**Slug**
- URL-friendly version of title
- Auto-generated from title
- Can be customized for SEO
- Must be unique

**Categories** (if enabled)
- Select one or more categories
- Used for organizing and filtering posts
- Create new categories in category management

**Tags** (if enabled)
- Add relevant tags
- Used for filtering and discovery
- Create new tags in tag management

**Author Information** (if required)
- Author name
- Author email
- Optional unless `NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=true`

**Meta Title** (optional)
- Custom SEO title
- If empty, uses post title
- Recommended: 50-60 characters

**Meta Description** (optional)
- Custom SEO description
- If empty, uses excerpt
- Recommended: 150-160 characters

4. Choose action:
   - **Save Draft**: Saves post without publishing
   - **Publish**: Publishes post immediately

### Via API

```bash
curl -X POST http://localhost:3001/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Blog Post",
    "content": "# Hello World\n\nThis is my first post!",
    "excerpt": "A short summary",
    "featuredImage": "https://example.com/image.jpg",
    "status": "DRAFT"
  }'
```

**Response:**
```json
{
  "id": "clx123abc",
  "title": "My Blog Post",
  "slug": "my-blog-post",
  "content": "# Hello World\n\nThis is my first post!",
  "excerpt": "A short summary",
  "featuredImage": "https://example.com/image.jpg",
  "status": "DRAFT",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

## Editing Blog Posts

### Via Dashboard

1. Navigate to `/dashboard/blog`
2. Find the post in the list
3. Click the "Edit" button (pencil icon)
4. Modify any fields
5. Click "Update Post" to save changes

**Note:** Editing a published post doesn't unpublish it. The changes are immediately visible.

### Via API

```bash
curl -X PATCH http://localhost:3001/blog/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

## Publishing Workflow

### Post Status

Blog posts have three possible statuses:

**DRAFT**
- Not visible on public blog
- Only visible in dashboard
- Can be edited freely
- No publish date

**PUBLISHED**
- Visible on public blog at `/blog` and `/blog/[slug]`
- Has publish date
- Included in sitemap
- Indexed by search engines

**ARCHIVED**
- Not visible on public blog
- Visible in dashboard with "Archived" label
- Can be republished
- Preserves publish date

### Publishing a Draft

**Via Dashboard:**
1. Go to blog management page
2. Find the draft post
3. Click "Publish" button
4. Post is immediately published with current timestamp

**Via API:**
```bash
curl -X PATCH http://localhost:3001/blog/POST_ID/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Unpublishing a Post

**Via Dashboard:**
1. Find the published post
2. Click "Unpublish" button
3. Post status changes to DRAFT

**Via API:**
```bash
curl -X PATCH http://localhost:3001/blog/POST_ID/unpublish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Deleting a Post

**Via Dashboard:**
1. Find the post
2. Click "Delete" button (trash icon)
3. Confirm deletion in dialog
4. Post is permanently deleted

**Via API:**
```bash
curl -X DELETE http://localhost:3001/blog/POST_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Warning:** Deletion is permanent and cannot be undone.

## Managing Categories and Tags

### Accessing Category/Tag Management

Navigate to `/dashboard/blog/categories-tags`

### Creating Categories

1. Go to category management section
2. Click "Add Category"
3. Enter:
   - **Name**: Category display name
   - **Slug**: URL-friendly identifier (auto-generated)
   - **Description**: Optional description
4. Click "Create"

**Via API:**
```bash
curl -X POST http://localhost:3001/blog/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Technology",
    "description": "Tech-related posts"
  }'
```

### Creating Tags

1. Go to tag management section
2. Click "Add Tag"
3. Enter:
   - **Name**: Tag display name
   - **Slug**: URL-friendly identifier (auto-generated)
4. Click "Create"

**Via API:**
```bash
curl -X POST http://localhost:3001/blog/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Next.js"
  }'
```

### Assigning to Posts

When creating or editing a post:
1. Scroll to Categories/Tags section
2. Select from dropdown (categories)
3. Type and press Enter (tags)
4. Save post

## Image Management

### Uploading Images

**Featured Image:**
1. In blog editor, find "Featured Image" section
2. Click "Upload Image" button
3. Select image file (JPG, PNG, WebP)
4. Image is uploaded and URL is saved

**Content Images:**
1. In markdown editor, click image button
2. Upload image or enter URL
3. Add alt text for accessibility
4. Image is embedded in markdown:
   ```markdown
   ![Alt text](https://example.com/image.jpg)
   ```

### Image Optimization

**Recommended Sizes:**
- Featured images: 1200x630px (16:9 ratio)
- Content images: Max 1920px width
- Thumbnails: 400x300px

**Formats:**
- WebP: Best compression, modern browsers
- JPG: Good for photos
- PNG: Good for graphics with transparency

**Optimization Tips:**
- Compress images before upload
- Use appropriate dimensions
- Add descriptive alt text
- Use lazy loading (automatic)

### Image Storage

Images are stored using the existing file upload module:
- Location: `backend/uploads/` (development)
- Production: Configure cloud storage (S3, Cloudinary, etc.)
- Access: Via `/uploads/[filename]` endpoint

## SEO Optimization

### Title Optimization

**Best Practices:**
- Keep under 60 characters
- Include primary keyword
- Make it compelling and descriptive
- Unique for each post

**Example:**
```
Good: "10 Next.js Performance Tips for 2024"
Bad: "Next.js Tips"
```

### Meta Description

**Best Practices:**
- 150-160 characters
- Include primary keyword
- Summarize post content
- Include call-to-action

**Example:**
```
"Learn 10 proven Next.js performance optimization techniques that will make your app 50% faster. Includes code examples and benchmarks."
```

### Slug Optimization

**Best Practices:**
- Use hyphens, not underscores
- Include primary keyword
- Keep short and descriptive
- Avoid stop words (a, the, and, etc.)

**Example:**
```
Good: "nextjs-performance-tips"
Bad: "10-tips-for-improving-the-performance-of-your-nextjs-app"
```

### Content Optimization

**Best Practices:**
- Use headings (H2, H3) for structure
- Include internal links to other posts
- Add external links to authoritative sources
- Use descriptive link text
- Include images with alt text
- Write for humans, not search engines

### Structured Data

Automatically generated for each post:
- Article type
- Headline
- Description
- Author
- Publish date
- Featured image

View in page source:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Post Title",
  ...
}
</script>
```

## API Usage

### Authentication

All protected endpoints require JWT authentication:

```bash
# Get token by logging in
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Use token in subsequent requests
curl -X GET http://localhost:3001/blog/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Endpoints

**Public Endpoints (no auth):**
```bash
# List published posts
GET /blog?page=1&limit=10

# Get single post by slug
GET /blog/:slug

# List categories
GET /blog/categories

# List tags
GET /blog/tags
```

**Protected Endpoints (requires auth + permissions):**
```bash
# List all posts (including drafts)
GET /blog/admin

# Create post (requires blog:write)
POST /blog

# Get post by ID
GET /blog/admin/:id

# Update post (requires blog:write)
PATCH /blog/:id

# Delete post (requires blog:delete)
DELETE /blog/:id

# Publish post (requires blog:publish)
PATCH /blog/:id/publish

# Unpublish post (requires blog:publish)
PATCH /blog/:id/unpublish
```

### Query Parameters

**Filtering:**
```bash
# Filter by status
GET /blog/admin?status=DRAFT

# Filter by category
GET /blog?category=technology

# Filter by tag
GET /blog?tag=nextjs

# Filter by date range
GET /blog?startDate=2024-01-01&endDate=2024-12-31
```

**Sorting:**
```bash
# Sort by publish date (default)
GET /blog?sortBy=publishedAt&order=desc

# Sort by title
GET /blog?sortBy=title&order=asc

# Sort by updated date
GET /blog?sortBy=updatedAt&order=desc
```

**Pagination:**
```bash
# Page-based
GET /blog?page=2&limit=10

# Cursor-based (better performance)
GET /blog?cursor=clx123abc&limit=10
```

## Best Practices

### Content Creation

**DO:**
- ✅ Write clear, descriptive titles
- ✅ Use proper markdown formatting
- ✅ Add alt text to all images
- ✅ Include internal links
- ✅ Proofread before publishing
- ✅ Use categories and tags consistently
- ✅ Optimize images before upload
- ✅ Write compelling excerpts

**DON'T:**
- ❌ Use clickbait titles
- ❌ Publish without proofreading
- ❌ Ignore SEO best practices
- ❌ Upload huge unoptimized images
- ❌ Leave excerpt empty
- ❌ Use too many tags
- ❌ Duplicate content

### Publishing Schedule

**Recommendations:**
- Publish consistently (weekly, bi-weekly, etc.)
- Choose optimal publish times for your audience
- Use drafts to prepare content in advance
- Review and update old posts periodically

### Performance

**Tips:**
- Keep posts under 2000 words for better engagement
- Optimize all images
- Use pagination for long content
- Limit number of images per post
- Use lazy loading (automatic)

### Security

**Best Practices:**
- Only grant blog permissions to trusted users
- Review posts before publishing
- Sanitize user input (automatic)
- Use HTTPS in production
- Keep dependencies updated

## Troubleshooting

### Can't Create Posts

**Problem**: "Permission denied" error

**Solution**:
1. Verify user has `blog:write` permission
2. Check JWT token is valid
3. Ensure blog feature is enabled

### Images Not Uploading

**Problem**: Image upload fails

**Solution**:
1. Check file size (max 10MB)
2. Verify file format (JPG, PNG, WebP)
3. Check upload directory permissions
4. Review backend logs for errors

### Slug Conflicts

**Problem**: "Slug already exists" error

**Solution**:
1. Choose a different slug
2. Add date or number to make unique
3. Check existing posts for conflicts

### Posts Not Appearing

**Problem**: Published post not visible on blog

**Solution**:
1. Verify status is "PUBLISHED"
2. Check publish date is not in future
3. Clear browser cache
4. Check API response for errors

## Quick Reference

```bash
# Create draft post
POST /blog
{
  "title": "My Post",
  "content": "Content here",
  "status": "DRAFT"
}

# Publish post
PATCH /blog/:id/publish

# Update post
PATCH /blog/:id
{
  "title": "Updated Title"
}

# Delete post
DELETE /blog/:id

# List published posts
GET /blog?page=1&limit=10

# Get single post
GET /blog/:slug
```

## Additional Resources

- **Setup Guide**: `SETUP_GUIDE.md` - Initial setup instructions
- **Configuration**: `CONFIGURATION_GUIDE.md` - Feature configuration
- **Environment Variables**: `ENVIRONMENT_VARIABLES.md` - Variable reference
- **Customization**: `CUSTOMIZATION_GUIDE.md` - Customizing appearance
- **API Reference**: `API_REFERENCE.md` - Complete API documentation
