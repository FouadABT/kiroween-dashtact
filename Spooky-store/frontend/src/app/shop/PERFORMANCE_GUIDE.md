# E-Commerce Storefront Performance Guide

## Overview

This guide documents the performance optimizations implemented for the e-commerce storefront to achieve fast page loads, smooth interactions, and excellent Core Web Vitals scores.

## Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Additional Metrics
- **TTFB (Time to First Byte):** < 600ms
- **FCP (First Contentful Paint):** < 1.8s
- **TTI (Time to Interactive):** < 3.8s
- **Lighthouse Performance Score:** 90+

## Implemented Optimizations

### 1. Incremental Static Regeneration (ISR)

All storefront pages use ISR with 5-minute revalidation for optimal caching:

```typescript
// In page.tsx
export const revalidate = 300; // 5 minutes (300 seconds)
```

**How It Works:**
1. First request generates static HTML
2. Subsequent requests serve cached HTML (instant)
3. After 5 minutes, next request triggers regeneration
4. New static HTML cached for next 5 minutes

**Benefits:**
- Near-instant page loads (served from cache)
- Fresh content (revalidated every 5 minutes)
- Reduced server load (fewer API calls)
- Better user experience (no loading spinners)

**Pages Using ISR:**
- `/shop` - Product catalog
- `/shop/[slug]` - Product details
- `/shop/category/[category]` - Category pages

### 2. Image Optimization

All product images use Next.js Image component with automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={800}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={false} // Only true for above-the-fold images
  loading="lazy" // Lazy load below-the-fold images
  quality={85} // Balance between quality and file size
/>
```

**Automatic Optimizations:**
- **Format Conversion:** Automatically serves WebP/AVIF for supported browsers
- **Responsive Images:** Generates multiple sizes with srcset
- **Lazy Loading:** Defers loading of below-the-fold images
- **Blur Placeholder:** Shows blur-up effect while loading
- **Size Optimization:** Compresses images without quality loss

**Best Practices:**
- Always specify `width` and `height` to prevent layout shift
- Use `priority={true}` only for hero/above-the-fold images
- Set appropriate `sizes` for responsive layouts
- Use descriptive `alt` text for accessibility
- Keep quality at 75-85 for optimal balance

**Image Guidelines:**
- Product thumbnails: 400x400px
- Product detail images: 800x800px
- Category banners: 1200x400px
- Hero images: 1920x600px
- Maximum file size: 500KB (before optimization)

### 3. Code Splitting

Next.js automatically splits code by route and component:

**Route-Based Splitting:**
```
/shop → shop.js (only shop page code)
/shop/[slug] → [slug].js (only product detail code)
/cart → cart.js (only cart code)
```

**Component-Based Splitting:**
```tsx
// Dynamic import for heavy components
const ProductGallery = dynamic(() => import('@/components/storefront/ProductGallery'), {
  loading: () => <ProductGallerySkeleton />,
  ssr: false, // Disable SSR if not needed
});
```

**Benefits:**
- Smaller initial bundle size
- Faster page loads
- Better caching (unchanged chunks stay cached)
- Improved Time to Interactive (TTI)

### 4. Lazy Loading

Below-the-fold content is lazy loaded to improve initial page load:

**Lazy Loaded Components:**
- Related products section
- Product reviews
- Additional product information
- Product recommendations
- Footer content

**Implementation:**
```tsx
import dynamic from 'next/dynamic';

const RelatedProducts = dynamic(
  () => import('@/components/storefront/RelatedProducts'),
  {
    loading: () => <RelatedProductsSkeleton />,
    ssr: false,
  }
);
```

**Benefits:**
- Faster initial page load
- Reduced JavaScript bundle size
- Better First Contentful Paint (FCP)
- Improved Lighthouse score

### 5. Caching Strategy

Multi-layer caching for optimal performance:

#### Browser Caching
```typescript
// Next.js automatically sets cache headers
// Static assets: Cache-Control: public, max-age=31536000, immutable
// API responses: Cache-Control: public, s-maxage=300, stale-while-revalidate
```

#### ISR Caching
```typescript
// Page-level caching with revalidation
export const revalidate = 300; // 5 minutes

// On-demand revalidation (when product updated)
await revalidatePath('/shop/[slug]');
```

#### API Response Caching
```typescript
// Fetch with Next.js cache options
const response = await fetch(url, {
  next: { revalidate: 300 }, // Cache for 5 minutes
});
```

#### CDN Caching
- Static assets served from CDN
- Edge caching for faster global delivery
- Automatic cache invalidation on deploy

**Cache Durations:**
- Product catalog: 5 minutes
- Product details: 5 minutes
- Categories: 5 minutes
- Static assets: 1 year (immutable)
- API responses: 5 minutes

### 6. Database Query Optimization

Efficient database queries to reduce server response time:

**Optimizations:**
- Use database indexes on frequently queried fields
- Limit query results with pagination
- Select only needed fields (avoid SELECT *)
- Use eager loading for relations
- Implement query result caching

**Example:**
```typescript
// Optimized product query
const products = await prisma.product.findMany({
  where: { status: 'PUBLISHED' },
  select: {
    id: true,
    name: true,
    slug: true,
    basePrice: true,
    featuredImage: true,
    // Only select needed fields
  },
  take: 12, // Limit results
  skip: (page - 1) * 12, // Pagination
  orderBy: { createdAt: 'desc' },
});
```

### 7. Prefetching & Preloading

Next.js automatically prefetches links in viewport:

```tsx
import Link from 'next/link';

// Automatically prefetches on hover
<Link href="/shop/product-slug" prefetch={true}>
  View Product
</Link>
```

**Manual Preloading:**
```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

// Prefetch on component mount
useEffect(() => {
  router.prefetch('/shop/product-slug');
}, []);
```

**Benefits:**
- Instant navigation (page already loaded)
- Better perceived performance
- Improved user experience

### 8. Bundle Size Optimization

Minimize JavaScript bundle size:

**Techniques:**
- Tree shaking (remove unused code)
- Code splitting (load only what's needed)
- Dynamic imports (lazy load heavy components)
- Minimize dependencies (use lightweight alternatives)

**Bundle Analysis:**
```bash
# Analyze bundle size
npm run build
npm run analyze
```

**Target Bundle Sizes:**
- First Load JS: < 100KB
- Route JS: < 50KB per route
- Shared JS: < 150KB

### 9. Font Optimization

Optimize web fonts for faster loading:

```tsx
// In layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Use fallback font while loading
  preload: true, // Preload font
  variable: '--font-inter',
});
```

**Benefits:**
- Automatic font optimization
- Self-hosted fonts (no external requests)
- Font subsetting (only include used characters)
- Font display swap (prevent invisible text)

### 10. API Response Optimization

Optimize API responses for faster data transfer:

**Techniques:**
- Compress responses (gzip/brotli)
- Paginate large datasets
- Return only needed fields
- Use efficient data formats (JSON)
- Implement response caching

**Example:**
```typescript
// Compressed API response
app.use(compression());

// Paginated response
{
  products: [...],
  total: 100,
  page: 1,
  limit: 12,
  totalPages: 9
}
```

## Performance Monitoring

### Tools

1. **Lighthouse**
   - Run audits regularly
   - Track performance score over time
   - Identify performance bottlenecks

2. **Chrome DevTools**
   - Performance tab for profiling
   - Network tab for request analysis
   - Coverage tab for unused code

3. **Web Vitals Extension**
   - Real-time Core Web Vitals
   - Track LCP, FID, CLS
   - Identify performance issues

4. **Next.js Analytics**
   - Real User Monitoring (RUM)
   - Core Web Vitals tracking
   - Performance insights

### Metrics to Track

**Page Load Metrics:**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

**User Experience Metrics:**
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Interaction to Next Paint (INP)

**Resource Metrics:**
- JavaScript bundle size
- CSS bundle size
- Image sizes
- Total page weight
- Number of requests

## Performance Testing

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://yourdomain.com/shop \
  --only-categories=performance \
  --output=html \
  --output-path=./lighthouse-report.html

# Run mobile audit
lighthouse https://yourdomain.com/shop \
  --only-categories=performance \
  --preset=mobile \
  --output=html \
  --output-path=./lighthouse-mobile-report.html
```

### WebPageTest

1. Go to https://www.webpagetest.org/
2. Enter your URL
3. Select test location (closest to users)
4. Select device (mobile/desktop)
5. Run test
6. Analyze results

**Key Metrics:**
- First Byte Time
- Start Render
- Speed Index
- Largest Contentful Paint
- Total Blocking Time

### Real User Monitoring (RUM)

Implement RUM to track real user performance:

```tsx
// In _app.tsx or layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Troubleshooting

### Slow Page Loads

**Possible Causes:**
- Large images not optimized
- Too much JavaScript
- Slow API responses
- No caching
- Blocking resources

**Solutions:**
1. Optimize images with Next.js Image
2. Implement code splitting
3. Enable ISR caching
4. Optimize database queries
5. Use CDN for static assets

### Poor LCP Score

**Possible Causes:**
- Large hero image
- Slow server response
- Render-blocking resources
- Client-side rendering

**Solutions:**
1. Optimize hero image
2. Use `priority={true}` for hero image
3. Implement ISR
4. Preload critical resources
5. Use server-side rendering

### High CLS Score

**Possible Causes:**
- Images without dimensions
- Dynamic content insertion
- Web fonts loading
- Ads/embeds

**Solutions:**
1. Always set image width/height
2. Reserve space for dynamic content
3. Use font-display: swap
4. Avoid layout shifts

### Large Bundle Size

**Possible Causes:**
- Too many dependencies
- Unused code
- Large libraries
- No code splitting

**Solutions:**
1. Remove unused dependencies
2. Use dynamic imports
3. Implement code splitting
4. Use lightweight alternatives
5. Analyze bundle with webpack-bundle-analyzer

## Best Practices

### Development

- [ ] Use Next.js Image for all images
- [ ] Implement ISR for static pages
- [ ] Use dynamic imports for heavy components
- [ ] Optimize database queries
- [ ] Minimize dependencies
- [ ] Use TypeScript for type safety
- [ ] Follow Next.js best practices

### Testing

- [ ] Run Lighthouse audits regularly
- [ ] Test on real devices
- [ ] Test on slow networks (3G)
- [ ] Monitor Core Web Vitals
- [ ] Track performance metrics
- [ ] Set up performance budgets

### Deployment

- [ ] Enable compression (gzip/brotli)
- [ ] Configure CDN
- [ ] Set up caching headers
- [ ] Optimize build output
- [ ] Monitor production performance
- [ ] Set up alerts for performance degradation

## Performance Budget

Set performance budgets to maintain fast page loads:

```json
{
  "budgets": [
    {
      "path": "/shop",
      "timings": [
        { "metric": "interactive", "budget": 3800 },
        { "metric": "first-contentful-paint", "budget": 1800 }
      ],
      "resourceSizes": [
        { "resourceType": "script", "budget": 150 },
        { "resourceType": "image", "budget": 500 },
        { "resourceType": "total", "budget": 1000 }
      ]
    }
  ]
}
```

**Budgets:**
- Total page weight: < 1MB
- JavaScript: < 150KB
- CSS: < 50KB
- Images: < 500KB
- Fonts: < 100KB

## Resources

- **Next.js Performance:** https://nextjs.org/docs/app/building-your-application/optimizing
- **Web.dev Performance:** https://web.dev/performance/
- **Core Web Vitals:** https://web.dev/vitals/
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **WebPageTest:** https://www.webpagetest.org/

## Checklist

### Pre-Launch
- [ ] Run Lighthouse audit (score 90+)
- [ ] Test on mobile devices
- [ ] Test on slow networks
- [ ] Verify ISR working
- [ ] Check image optimization
- [ ] Verify code splitting
- [ ] Test lazy loading
- [ ] Check bundle sizes
- [ ] Verify caching headers
- [ ] Test Core Web Vitals

### Post-Launch
- [ ] Monitor Core Web Vitals
- [ ] Track Lighthouse scores
- [ ] Monitor bundle sizes
- [ ] Track API response times
- [ ] Monitor error rates
- [ ] Set up performance alerts
- [ ] Regular performance audits
- [ ] Optimize based on RUM data
