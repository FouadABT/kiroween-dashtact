# Blog Slug Generation and Validation System

## Overview

The blog system includes a comprehensive slug generation and validation system that ensures all blog posts have unique, SEO-friendly URLs. The system provides both automatic slug generation and manual customization with real-time validation.

## Features

### 1. Automatic Slug Generation

Slugs are automatically generated from post titles using the following rules:

- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters (keep only letters, numbers, and hyphens)
- Remove consecutive hyphens
- Remove leading and trailing hyphens
- Trim whitespace

**Example:**
```typescript
"The Ultimate Guide to Next.js 14!" → "the-ultimate-guide-to-nextjs-14"
"Hello! World? #2024" → "hello-world-2024"
```

### 2. Uniqueness Enforcement

The system ensures all slugs are unique by:

- Checking database for existing slugs
- Appending numbers to duplicates (e.g., `post-1`, `post-2`)
- Excluding current post when editing (allows keeping same slug)

### 3. Real-Time Validation

The frontend provides real-time slug validation with:

- Format validation (client-side)
- Availability checking (server-side)
- Conflict suggestions
- Live URL preview

### 4. Conflict Resolution

When a slug conflict is detected:

- User is notified with clear error message
- System provides 3 alternative suggestions
- User can click to apply suggestion
- User can manually edit to resolve conflict

## Backend Implementation

### Service Methods

#### `generateSlug(title: string): string`

Generates a URL-friendly slug from a title.

```typescript
const slug = this.blogService.generateSlug('My Blog Post');
// Returns: 'my-blog-post'
```

#### `ensureUniqueSlug(slug: string, excludeId?: string): Promise<string>`

Ensures a slug is unique by appending numbers if necessary.

```typescript
const uniqueSlug = await this.blogService.ensureUniqueSlug('my-post', 'post-123');
// Returns: 'my-post' if available, or 'my-post-1', 'my-post-2', etc.
```

#### `validateSlug(slug: string, excludeId?: string): Promise<ValidationResult>`

Validates slug availability and provides suggestions.

```typescript
const result = await this.blogService.validateSlug('my-post');
// Returns:
// {
//   available: false,
//   slug: 'my-post',
//   message: 'Slug "my-post" is already in use by "My Post"',
//   existingPost: { id: '...', title: 'My Post', status: 'PUBLISHED' },
//   suggestions: ['my-post-1', 'my-post-2', 'my-post-3']
// }
```

### API Endpoints

#### `GET /blog/validate-slug/:slug`

Validates if a slug is available.

**Query Parameters:**
- `excludeId` (optional): Post ID to exclude from validation (for editing)

**Response:**
```json
{
  "available": true,
  "slug": "my-post",
  "message": "Slug is available"
}
```

**Requires:** `blog:write` permission

#### `POST /blog/generate-slug`

Generates a unique slug from a title.

**Request Body:**
```json
{
  "title": "My Blog Post",
  "excludeId": "post-123" // optional
}
```

**Response:**
```json
{
  "slug": "my-blog-post",
  "isUnique": true
}
```

**Requires:** `blog:write` permission

### Conflict Handling

#### On Create

When creating a post, if no slug is provided:
1. Generate slug from title
2. Ensure uniqueness by appending numbers if needed
3. Create post with unique slug

```typescript
// User creates post with title "My Post"
// Slug "my-post" already exists
// System automatically creates with slug "my-post-1"
```

#### On Update

When updating a post with a new slug:
1. Check if slug is different from current
2. Validate slug is not used by another post
3. Throw `ConflictException` if taken
4. Update post if available

```typescript
// User tries to change slug to "existing-slug"
// System throws: "Slug 'existing-slug' is already in use by 'Existing Post'"
```

## Frontend Implementation

### SlugInput Component

The `SlugInput` component provides an enhanced slug input with:

- Auto-generation button
- Real-time format validation
- Debounced availability checking
- Visual status indicators
- Conflict suggestions
- Live URL preview

**Usage:**
```tsx
<SlugInput
  value={slug}
  onChange={setSlug}
  title={postTitle}
  postId={post?.id}
  disabled={loading}
/>
```

**Features:**

1. **Format Validation** (Client-side)
   - Checks slug format before API call
   - Shows errors for invalid format
   - Validates length, characters, and structure

2. **Availability Checking** (Server-side)
   - Debounced API calls (500ms)
   - Shows loading spinner during validation
   - Displays availability status with icons

3. **Visual Feedback**
   - ✓ Green check for available slug
   - ✗ Red X for format errors
   - ⚠ Alert icon for taken slug
   - ⏳ Spinner for validating

4. **Conflict Resolution**
   - Shows error message with existing post title
   - Provides 3 clickable suggestions
   - User can apply suggestion with one click

5. **URL Preview**
   - Shows full URL path
   - Updates in real-time
   - Link to preview in new tab

### Utility Functions

#### `generateSlug(title: string): string`

Client-side slug generation (matches backend logic).

```typescript
import { generateSlug } from '@/lib/slug-utils';

const slug = generateSlug('My Blog Post');
// Returns: 'my-blog-post'
```

#### `validateSlug(slug: string, excludeId?: string, token?: string): Promise<ValidationResult>`

Validates slug availability via API.

```typescript
import { validateSlug } from '@/lib/slug-utils';

const result = await validateSlug('my-post', undefined, token);
```

#### `validateSlugFormat(slug: string): { valid: boolean; errors: string[] }`

Client-side format validation.

```typescript
import { validateSlugFormat } from '@/lib/slug-utils';

const { valid, errors } = validateSlugFormat('my-post');
```

#### `formatSlugPreview(slug: string): string`

Formats slug as full URL.

```typescript
import { formatSlugPreview } from '@/lib/slug-utils';

const url = formatSlugPreview('my-post');
// Returns: 'http://localhost:3000/blog/my-post'
```

## Validation Rules

### Format Requirements

- **Minimum length:** 3 characters
- **Maximum length:** 200 characters
- **Allowed characters:** Lowercase letters, numbers, hyphens
- **Cannot start or end with hyphen**
- **Cannot contain consecutive hyphens**

### Examples

✅ **Valid Slugs:**
- `my-blog-post`
- `post-123`
- `the-ultimate-guide`

❌ **Invalid Slugs:**
- `My-Post` (uppercase)
- `my_post` (underscore)
- `-my-post` (starts with hyphen)
- `my--post` (consecutive hyphens)
- `ab` (too short)

## User Experience

### Creating a New Post

1. User enters post title
2. User clicks "Generate" button
3. System generates slug from title
4. System validates slug availability
5. If taken, system appends number automatically
6. User sees preview URL
7. User can edit slug manually if desired

### Editing an Existing Post

1. User edits post with existing slug
2. Slug field shows current slug
3. User can keep same slug (no validation needed)
4. If user changes slug, validation runs
5. If conflict, user sees error and suggestions
6. User can apply suggestion or choose different slug

### Manual Slug Entry

1. User types custom slug
2. System validates format (instant)
3. System checks availability (debounced)
4. User sees real-time feedback
5. If invalid, user sees specific errors
6. If taken, user sees suggestions

## Error Handling

### Format Errors

Shown immediately as user types:
- "Slug cannot be empty"
- "Slug must be at least 3 characters long"
- "Slug can only contain lowercase letters, numbers, and hyphens"
- "Slug cannot start or end with a hyphen"
- "Slug cannot contain consecutive hyphens"

### Availability Errors

Shown after validation completes:
- "Slug 'my-post' is already in use by 'My Post'"
- Includes existing post title and status
- Provides 3 alternative suggestions

### API Errors

Graceful fallback:
- "Unable to validate slug. Please try again."
- Falls back to client-side generation
- Allows user to proceed with warning

## Performance Optimization

### Debouncing

- Validation API calls debounced by 500ms
- Prevents excessive requests while typing
- Improves server performance

### Caching

- Format validation cached client-side
- No API calls for format errors
- Reduces server load

### Efficient Queries

- Database queries use unique index on slug
- Fast lookups for availability checking
- Minimal database impact

## Testing

### Unit Tests

**Backend:**
- `blog-slug.service.spec.ts` - Service methods
- Tests slug generation logic
- Tests uniqueness enforcement
- Tests validation logic

**Frontend:**
- `slug-utils.test.ts` - Utility functions
- Tests client-side generation
- Tests format validation
- Tests preview formatting

### E2E Tests

**Backend:**
- `blog-slug-validation.e2e-spec.ts` - API endpoints
- Tests validation endpoint
- Tests generation endpoint
- Tests conflict handling
- Tests permissions

### Manual Testing

1. Create post with common title
2. Verify slug auto-generated
3. Create another post with same title
4. Verify slug has number appended
5. Edit post and change slug
6. Verify validation works
7. Try invalid slug formats
8. Verify error messages
9. Apply suggested slug
10. Verify preview URL

## Best Practices

### For Developers

1. Always use `ensureUniqueSlug()` when creating posts
2. Validate slug format before API calls
3. Handle conflicts gracefully with suggestions
4. Provide clear error messages
5. Test edge cases (empty, special chars, duplicates)

### For Users

1. Let system auto-generate slugs when possible
2. Keep slugs short and descriptive
3. Use hyphens to separate words
4. Avoid special characters
5. Check preview URL before publishing

## Troubleshooting

### Slug Not Generating

**Problem:** Generate button doesn't work
**Solution:** Ensure title field is not empty

### Validation Not Working

**Problem:** Slug validation not running
**Solution:** Check authentication token is valid

### Suggestions Not Showing

**Problem:** No suggestions for taken slug
**Solution:** All variations may be taken, try different slug

### Preview URL Wrong

**Problem:** Preview shows wrong domain
**Solution:** Check `NEXT_PUBLIC_APP_URL` environment variable

## Future Enhancements

- [ ] Custom slug patterns (e.g., date-based)
- [ ] Slug history and redirects
- [ ] Bulk slug regeneration
- [ ] SEO score for slugs
- [ ] Reserved slug blacklist
- [ ] Slug analytics (click tracking)
