# Blog Error Handling & Loading States

This document describes the error handling and loading state implementation for the blog system.

## Overview

The blog system implements comprehensive error handling and loading states to provide a smooth user experience even when things go wrong. This includes:

- **Error Boundaries**: Catch and handle runtime errors gracefully
- **Not Found Pages**: Custom 404 pages for missing blog posts
- **Loading States**: Skeleton loaders while content is being fetched
- **API Error Handling**: User-friendly messages for API failures

## Error Boundaries

### Blog Listing Error (`/blog/error.tsx`)

Catches errors that occur on the blog listing page.

**Features:**
- Displays user-friendly error message
- Shows error details in development
- Provides "Try Again" button to retry
- Navigation back to home page
- Error logging to console

**Usage:**
```typescript
// Automatically catches errors in /blog page and child components
// No manual implementation needed
```

### Blog Post Error (`/blog/[slug]/error.tsx`)

Catches errors that occur when loading a specific blog post.

**Features:**
- Displays user-friendly error message
- Shows error details and error ID
- Provides "Try Again" button to retry
- Navigation back to blog listing
- Navigation to home page
- Error logging to console

**Usage:**
```typescript
// Automatically catches errors in /blog/[slug] page
// No manual implementation needed
```

### Blog Management Error (`/dashboard/blog/error.tsx`)

Catches errors in the blog management dashboard.

**Features:**
- Displays user-friendly error message
- Shows error details and error ID
- Provides "Try Again" button to retry
- Navigation back to dashboard
- Error logging to console

**Usage:**
```typescript
// Automatically catches errors in /dashboard/blog page
// No manual implementation needed
```

### Blog Editor Error (`/dashboard/blog/[id]/edit/error.tsx`)

Catches errors in the blog editor.

**Features:**
- Displays user-friendly error message
- Shows error details and error ID
- Provides "Try Again" button to retry
- Navigation back to blog management
- Error logging to console

**Usage:**
```typescript
// Automatically catches errors in blog editor
// No manual implementation needed
```

## Not Found Pages

### Blog Post Not Found (`/blog/[slug]/not-found.tsx`)

Displayed when a blog post with the requested slug doesn't exist.

**Features:**
- Clear "Post Not Found" message
- Explanation of possible reasons
- Navigation back to blog listing
- Navigation to home page
- Accessible design with proper ARIA labels

**Usage:**
```typescript
// In blog post page
import { notFound } from 'next/navigation';

const post = await fetchBlogPost(slug);
if (!post) {
  notFound(); // Triggers not-found.tsx
}
```

## Loading States

### Blog Listing Loading (`/blog/loading.tsx`)

Displayed while blog posts are being fetched.

**Features:**
- Skeleton loaders for blog cards
- Skeleton loaders for filters
- Skeleton loaders for pagination
- Matches actual blog list layout
- Responsive grid layout

**Usage:**
```typescript
// Automatically shown while /blog page is loading
// No manual implementation needed
```

### Blog Post Loading (`/blog/[slug]/loading.tsx`)

Displayed while a blog post is being fetched.

**Features:**
- Skeleton loaders matching blog post layout
- Featured image placeholder
- Content structure preview
- Breadcrumb skeleton
- Metadata skeleton
- Responsive design

**Usage:**
```typescript
// Automatically shown while /blog/[slug] page is loading
// No manual implementation needed
```

### Blog Management Loading (`/dashboard/blog/loading.tsx`)

Displayed while blog management data is being fetched.

**Features:**
- Skeleton loaders for page header
- Skeleton loaders for blog post table
- Skeleton loaders for filters
- Skeleton loaders for pagination
- Matches actual blog management layout

**Usage:**
```typescript
// Automatically shown while /dashboard/blog page is loading
// No manual implementation needed
```

### Blog Editor Loading (`/dashboard/blog/[id]/edit/loading.tsx`)

Displayed while blog post data is being fetched for editing.

**Features:**
- Skeleton loaders for all form fields
- Matches actual blog editor layout
- Shows structure of the form

**Usage:**
```typescript
// Automatically shown while blog editor is loading
// No manual implementation needed
```

## API Error Handling

### BlogList Component

The `BlogList` component includes comprehensive error handling for API failures.

**Features:**
- Catches fetch errors
- Displays user-friendly error message
- Shows error details
- Provides "Try Again" button
- Maintains loading state during retry

**Example:**
```typescript
try {
  const response = await fetch(`${apiUrl}/blog?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  const result = await response.json();
  setData(result);
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```

**Error Display:**
```typescript
if (error) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="flex justify-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertIcon />
        </div>
      </div>
      <div>
        <h3>Failed to Load Blog Posts</h3>
        <p>{error}</p>
      </div>
      <Button onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}
```

## Best Practices

### 1. Always Handle Errors

Every API call should be wrapped in try-catch:

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Request failed');
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error:', error);
  throw error; // Re-throw to be caught by error boundary
}
```

### 2. Provide User-Friendly Messages

Don't show technical error messages to users:

```typescript
// ❌ Bad
<p>{error.stack}</p>

// ✅ Good
<p>We encountered an error while loading the blog posts. Please try again.</p>
```

### 3. Log Errors for Debugging

Always log errors to console in development:

```typescript
useEffect(() => {
  console.error('Blog error:', error);
}, [error]);
```

### 4. Provide Recovery Options

Always give users a way to recover:

```typescript
<Button onClick={reset}>Try Again</Button>
<Button asChild>
  <Link href="/blog">Back to Blog</Link>
</Button>
```

### 5. Use Loading States

Show loading states while fetching data:

```typescript
if (isLoading) {
  return <LoadingSpinner />;
}
```

### 6. Handle Not Found Cases

Check if data exists before rendering:

```typescript
const post = await fetchBlogPost(slug);
if (!post) {
  notFound(); // Triggers not-found.tsx
}
```

## Testing Error Handling

### Test Error Boundaries

1. Throw an error in a component:
```typescript
throw new Error('Test error');
```

2. Verify error boundary catches it
3. Verify error message is displayed
4. Verify "Try Again" button works

### Test Not Found Pages

1. Navigate to non-existent blog post:
```
/blog/non-existent-slug
```

2. Verify not-found page is displayed
3. Verify navigation links work

### Test Loading States

1. Add artificial delay to API calls:
```typescript
await new Promise(resolve => setTimeout(resolve, 2000));
```

2. Verify loading state is displayed
3. Verify skeleton loaders match layout

### Test API Error Handling

1. Simulate API failure:
```typescript
// In development, stop backend server
```

2. Verify error message is displayed
3. Verify "Try Again" button works
4. Verify error is logged to console

## Accessibility

All error and loading states follow accessibility best practices:

- **Semantic HTML**: Use proper heading hierarchy
- **ARIA Labels**: Add descriptive labels for screen readers
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Management**: Focus is properly managed after errors
- **Color Contrast**: Error messages meet WCAG AA standards
- **Screen Reader Announcements**: Errors are announced to screen readers

## Error Monitoring

In production, consider integrating error monitoring:

```typescript
// Example with Sentry
import * as Sentry from '@sentry/nextjs';

useEffect(() => {
  if (error) {
    Sentry.captureException(error, {
      tags: {
        component: 'BlogList',
        page: '/blog',
      },
    });
  }
}, [error]);
```

## Troubleshooting

### Error Boundary Not Catching Errors

**Problem**: Error boundary doesn't catch the error

**Solution**: 
- Error boundaries only catch errors in child components
- Errors in event handlers need try-catch
- Async errors need try-catch

### Loading State Not Showing

**Problem**: Loading state doesn't appear

**Solution**:
- Ensure loading.tsx is in correct directory
- Check if page is using Suspense
- Verify data fetching is async

### Not Found Page Not Showing

**Problem**: Not found page doesn't appear

**Solution**:
- Ensure you're calling `notFound()` from next/navigation
- Check if not-found.tsx is in correct directory
- Verify the route structure

## Resources

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js Not Found](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
