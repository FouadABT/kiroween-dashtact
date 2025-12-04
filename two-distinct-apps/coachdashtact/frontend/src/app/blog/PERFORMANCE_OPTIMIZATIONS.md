# Blog System Performance Optimizations

This document describes the performance optimizations implemented for the blog system.

## Overview

The blog system has been optimized for maximum performance using multiple strategies:
- Incremental Static Regeneration (ISR)
- API response caching
- Cursor-based pagination
- Image optimization
- Link prefetching

## 1. Incremental Static Regeneration (ISR)

### What is ISR?

ISR allows you to create or update static pages after you've built your site. This means pages are generated on-demand and cached for subsequent requests.

### Implementation

**Blog Listing Page** (`/blog`):
```typescript
export const revalidate = 300; // 5 minutes
```

**Blog Post Page** (`/blog/[slug]`):
```typescript
export const revalidate = 300; // 5 minutes
```

### Benefits

- **Fast Initial Load**: Pages are served as static HTML
- **Fresh Content**: Pages are regenerated every 5 minutes
- **Reduced Server Load**: Most requests are served from cache
- **Better SEO**: Search engines see fully rendered HTML

### Configuration

Adjust the revalidation time based on your needs:
- `60` - 1 minute (frequent updates)
- `300` - 5 minutes (default, balanced)
- `3600` - 1 hour (infrequent updates)
- `false` - Never revalidate (fully static)

## 2. API Response Caching

### Backend Caching

The backend implements HTTP caching headers for public endpoints:

**Blog Posts** (`GET /blog`):
```typescript
@Header('Cache-Control', 'public, max-age=300, s-maxage=300')
```
- Browser cache: 5 minutes
- CDN cache: 5 minutes
- Cached per query parameters

**Single Post** (`GET /blog/:slug`):
```typescript
@Header('Cache-Control', 'public, max-age=300, s-maxage=300')
```
- Browser cache: 5 minutes
- CDN cache: 5 minutes
- Cached per slug

**Categories** (`GET /blog/categories/all`):
```typescript
@Header('Cache-Control', 'public, max-age=600, s-maxage=600')
```
- Browser cache: 10 minutes
- CDN cache: 10 minutes
- Categories change infrequently

**Tags** (`GET /blog/tags/all`):
```typescript
@Header('Cache-Control', 'public, max-age=600, s-maxage=600')
```
- Browser cache: 10 minutes
- CDN cache: 10 minutes
- Tags change infrequently

### Cache Headers Explained

**Cache-Control Directives**:
- `public`: Response can be cached by any cache (browser, CDN, proxy)
- `max-age=300`: Browser caches for 300 seconds (5 minutes)
- `s-maxage=300`: Shared caches (CDN) cache for 300 seconds

### Cache Invalidation

HTTP cache is automatically invalidated when:
- TTL expires (max-age/s-maxage)
- User performs hard refresh (Ctrl+Shift+R)
- Cache-Control headers change

**Note**: When you create, update, or delete a blog post, cached responses will still be served until TTL expires. For immediate updates, consider:
1. Using shorter TTL values
2. Implementing cache purging via CDN API
3. Adding versioning to API responses

## 3. Cursor-Based Pagination

### What is Cursor-Based Pagination?

Instead of using page numbers (offset-based), cursor-based pagination uses a unique identifier (cursor) to fetch the next set of results. This is more efficient for large datasets.

### Implementation

**Query Parameter**:
```typescript
GET /blog?cursor=cuid123&limit=10
```

**Response**:
```json
{
  "posts": [...],
  "pagination": {
    "limit": 10,
    "hasNextPage": true,
    "nextCursor": "cuid456"
  }
}
```

### Benefits

- **Consistent Performance**: Query time doesn't increase with page number
- **No Skipped/Duplicate Items**: Works correctly with real-time data changes
- **Better for Infinite Scroll**: Natural fit for "load more" patterns

### When to Use

- **Cursor-based**: Large datasets, infinite scroll, real-time data
- **Offset-based**: Small datasets, traditional pagination, page numbers needed

### Current Implementation

The blog system supports **both** pagination methods:
- Default: Offset-based (page numbers)
- Optional: Cursor-based (pass `cursor` parameter)

## 4. Image Optimization

### Next.js Image Component

All blog images use the Next.js `Image` component for automatic optimization:

**Features**:
- Automatic format conversion (WebP, AVIF)
- Responsive images with `srcset`
- Lazy loading by default
- Blur placeholder support
- Size optimization

### Implementation

**BlogCard Component**:
```typescript
<Image
  src={post.featuredImage}
  alt={post.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={index < 3} // Priority load first 3 images
  quality={85}
/>
```

### Priority Loading

The first 3 images on the blog listing page are loaded with `priority={true}`:
- Prevents Largest Contentful Paint (LCP) issues
- Improves perceived performance
- Better Core Web Vitals scores

### Image Sizing

**Sizes Attribute**:
```typescript
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

This tells the browser:
- Mobile (≤768px): Use 100% viewport width
- Tablet (≤1200px): Use 50% viewport width
- Desktop (>1200px): Use 33% viewport width

### Quality Setting

```typescript
quality={85}
```

- Default: 75
- Recommended: 75-85
- Higher quality = larger file size

### Best Practices

1. **Use Appropriate Dimensions**: Upload images at 2x the display size
2. **Optimize Before Upload**: Use tools like ImageOptim, TinyPNG
3. **Use Modern Formats**: WebP or AVIF when possible
4. **Set Explicit Dimensions**: Prevents layout shift

## 5. Link Prefetching

### What is Prefetching?

Next.js automatically prefetches linked pages when they appear in the viewport. We enhance this with manual prefetching for pagination.

### Implementation

**BlogPagination Component**:
```typescript
useEffect(() => {
  if (hasNext) {
    router.prefetch(`/blog?page=${currentPage + 1}`);
  }
  if (hasPrevious) {
    router.prefetch(`/blog?page=${currentPage - 1}`);
  }
}, [currentPage, hasNext, hasPrevious, router]);
```

### Benefits

- **Instant Navigation**: Next/previous pages load instantly
- **Better UX**: No loading spinner when navigating
- **Reduced Perceived Latency**: Pages feel faster

### Automatic Prefetching

Next.js automatically prefetches:
- All `<Link>` components in the viewport
- On hover (desktop)
- On touch start (mobile)

## Performance Metrics

### Target Metrics

**Lighthouse Scores**:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

**Core Web Vitals**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Measuring Performance

**Lighthouse**:
```bash
npx lighthouse https://yourdomain.com/blog --view
```

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to "Performance" tab
3. Click "Record" and interact with the page
4. Analyze the timeline

**Real User Monitoring (RUM)**:
- Use tools like Vercel Analytics, Google Analytics
- Monitor Core Web Vitals in production

## Optimization Checklist

### Frontend

- [x] Enable ISR for blog pages
- [x] Use Next.js Image component
- [x] Implement priority loading for above-the-fold images
- [x] Add link prefetching for pagination
- [x] Optimize image sizes attribute
- [ ] Add blur placeholders for images
- [ ] Implement infinite scroll (optional)
- [ ] Add service worker for offline support (optional)

### Backend

- [x] Enable API response caching
- [x] Implement cursor-based pagination
- [ ] Add database query optimization (indexes)
- [ ] Implement CDN for static assets
- [ ] Add compression (gzip/brotli)
- [ ] Implement rate limiting

### Database

- [ ] Add indexes on frequently queried fields:
  - `slug` (already unique index)
  - `status`
  - `publishedAt`
  - `createdAt`
- [ ] Optimize query patterns
- [ ] Consider read replicas for high traffic

## Advanced Optimizations

### 1. Blur Placeholders

Add blur placeholders for better perceived performance:

```typescript
<Image
  src={post.featuredImage}
  alt={post.title}
  fill
  placeholder="blur"
  blurDataURL={post.blurDataURL}
/>
```

Generate blur data URLs at upload time using libraries like `plaiceholder` or `sharp`.

### 2. Infinite Scroll

Replace pagination with infinite scroll for better mobile UX:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['blog-posts'],
  queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### 3. Service Worker

Add offline support with a service worker:

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... other config
});
```

### 4. CDN Integration

Serve static assets from a CDN:

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.yourdomain.com'],
  },
  assetPrefix: 'https://cdn.yourdomain.com',
};
```

### 5. Database Indexes

Add indexes for better query performance:

```sql
-- Already exists (unique)
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Add these for better performance
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_blog_posts_status_published 
  ON blog_posts(status, published_at DESC);
```

## Monitoring

### Performance Monitoring

**Vercel Analytics** (if using Vercel):
- Automatic Core Web Vitals tracking
- Real user monitoring
- Performance insights

**Google Analytics**:
```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Error Monitoring

**Sentry**:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## Troubleshooting

### ISR Not Working

**Symptoms**: Pages not updating after 5 minutes

**Solutions**:
1. Check `revalidate` is set correctly
2. Verify API is returning fresh data
3. Clear Next.js cache: `rm -rf .next`
4. Check server logs for errors

### Images Not Optimizing

**Symptoms**: Large image file sizes, slow loading

**Solutions**:
1. Verify `next/image` is being used
2. Check `sizes` attribute is set correctly
3. Ensure images are from allowed domains
4. Check Next.js image optimization is enabled

### Cache Not Working

**Symptoms**: API responses not cached

**Solutions**:
1. Verify `CacheModule` is imported
2. Check `@UseInterceptors(CacheInterceptor)` is applied
3. Verify cache TTL is set
4. Check server logs for cache hits/misses

### Slow Pagination

**Symptoms**: Pagination gets slower with higher page numbers

**Solutions**:
1. Switch to cursor-based pagination
2. Add database indexes
3. Reduce page size
4. Implement virtual scrolling

## Resources

- [Next.js ISR Documentation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [NestJS Caching](https://docs.nestjs.com/techniques/caching)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
