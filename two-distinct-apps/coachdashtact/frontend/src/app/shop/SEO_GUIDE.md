# E-Commerce Storefront SEO Guide

## Overview

This guide documents the SEO and performance optimizations implemented for the e-commerce storefront. All pages follow best practices for search engine optimization, structured data, and performance.

## Implemented Features

### 1. Metadata & Meta Tags

All storefront pages include comprehensive metadata:

- **Unique titles and descriptions** for each page
- **Open Graph tags** for social media sharing
- **Twitter Card tags** for Twitter sharing
- **Canonical URLs** to prevent duplicate content issues
- **Robots meta tags** to control indexing
- **Keywords** for relevant search terms

#### Pages with Metadata:
- `/shop` - Product catalog page
- `/shop/[slug]` - Individual product pages
- `/shop/category/[category]` - Category pages
- `/cart` - Shopping cart (noindex)
- `/checkout` - Checkout page (noindex)

### 2. Structured Data (JSON-LD)

Structured data helps search engines understand page content and enables rich snippets in search results.

#### Product Pages (`/shop/[slug]`)
```typescript
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": ["image1.jpg", "image2.jpg"],
  "brand": {
    "@type": "Brand",
    "name": "Your Store"
  },
  "sku": "PRODUCT-SKU",
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/shop/product-slug"
  }
}
```

**Benefits:**
- Product rich snippets in Google search results
- Price, availability, and ratings displayed in search
- Better click-through rates from search results

#### Category Pages (`/shop/category/[category]`)
```typescript
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Category Name Products",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Product Name",
        "url": "https://example.com/shop/product-slug"
      }
    }
  ]
}
```

**Benefits:**
- Helps search engines understand product collections
- Improves category page rankings
- Better organization in search results

#### Breadcrumb Navigation
All pages include breadcrumb structured data:
```typescript
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Shop",
      "item": "https://example.com/shop"
    }
  ]
}
```

**Benefits:**
- Breadcrumb display in search results
- Better site hierarchy understanding
- Improved user navigation from search

#### Website Search Action (`/shop`)
```typescript
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Shop",
  "url": "https://example.com/shop",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/shop?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

**Benefits:**
- Enables site search box in Google search results
- Direct search from Google to your site
- Improved user experience

### 3. XML Sitemap

Dynamic sitemap generation includes all storefront pages:

**Included in Sitemap:**
- `/shop` - Main shop page (priority: 0.8, daily updates)
- `/shop/[slug]` - All published products (priority: 0.8, weekly updates)
- `/shop/category/[category]` - All categories (priority: 0.7, daily updates)

**Excluded from Sitemap:**
- `/cart` - Shopping cart (noindex)
- `/checkout` - Checkout pages (noindex)
- Draft or unpublished products

**Access:** `https://yourdomain.com/sitemap.xml`

**Submission:**
1. Google Search Console: https://search.google.com/search-console
2. Bing Webmaster Tools: https://www.bing.com/webmasters

### 4. Semantic HTML

All pages use proper HTML5 semantic elements:

```html
<main>
  <article>
    <header>
      <h1>Product Name</h1>
    </header>
    <section>
      <h2>Description</h2>
      <p>Product description...</p>
    </section>
  </article>
</main>
```

**Heading Hierarchy:**
- `<h1>` - Page title (one per page)
- `<h2>` - Major sections
- `<h3>` - Subsections
- Never skip heading levels

### 5. Image Optimization

All product images use Next.js Image component:

```tsx
<Image
  src={product.image}
  alt={product.name}
  width={800}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={false} // Only true for above-the-fold images
  loading="lazy" // Lazy load below-the-fold images
/>
```

**Benefits:**
- Automatic image optimization (WebP, AVIF)
- Responsive images with srcset
- Lazy loading for better performance
- Proper sizing to prevent layout shift

**Best Practices:**
- Always include descriptive `alt` text
- Use appropriate `width` and `height`
- Set `priority={true}` for hero images only
- Use `loading="lazy"` for below-the-fold images

### 6. Performance Optimizations

#### Incremental Static Regeneration (ISR)

All storefront pages use ISR with 5-minute revalidation:

```typescript
// In page.tsx
export const revalidate = 300; // 5 minutes
```

**Benefits:**
- Fast page loads (served from cache)
- Fresh content (revalidated every 5 minutes)
- Reduced server load
- Better user experience

#### Caching Strategy

**Product Catalog:**
- Cache duration: 5 minutes
- Revalidation: On-demand and time-based
- Cache key: URL + query parameters

**Product Details:**
- Cache duration: 5 minutes
- Revalidation: On-demand and time-based
- Cache key: Product slug

**Categories:**
- Cache duration: 5 minutes
- Revalidation: On-demand and time-based
- Cache key: Category slug

#### Code Splitting

Next.js automatically splits code by route:
- Each page loads only required JavaScript
- Shared components bundled separately
- Dynamic imports for heavy components

#### Lazy Loading

Below-the-fold content is lazy loaded:
- Product images (except hero)
- Related products section
- Product reviews
- Additional product information

### 7. Mobile Optimization

All pages are fully responsive and mobile-optimized:

**Viewport Meta Tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**Responsive Images:**
- Different sizes for mobile, tablet, desktop
- Optimized for mobile networks
- Touch-friendly UI elements

**Performance:**
- Target: < 3s load time on 3G
- Lighthouse Mobile Score: 90+
- Core Web Vitals: Pass all metrics

### 8. Robots.txt

Located at `/public/robots.txt`:

```
User-agent: *
Allow: /
Allow: /shop
Allow: /shop/*
Disallow: /cart
Disallow: /checkout
Disallow: /dashboard
Disallow: /login
Disallow: /signup

Sitemap: https://yourdomain.com/sitemap.xml
```

**Update for Production:**
Replace `yourdomain.com` with your actual domain.

## Testing & Validation

### SEO Testing Tools

1. **Google Search Console**
   - Monitor indexing status
   - Check search performance
   - Identify crawl errors
   - Submit sitemap

2. **Bing Webmaster Tools**
   - Monitor Bing indexing
   - Check search performance
   - Submit sitemap

3. **Google Rich Results Test**
   - Test structured data
   - Validate product markup
   - Check for errors
   - URL: https://search.google.com/test/rich-results

4. **Schema.org Validator**
   - Validate JSON-LD markup
   - Check for warnings
   - URL: https://validator.schema.org/

5. **Lighthouse**
   - SEO audit score (target: 90+)
   - Performance score (target: 90+)
   - Accessibility score (target: 90+)
   - Best practices score (target: 90+)

### Manual Testing Checklist

- [ ] All pages have unique titles
- [ ] All pages have unique descriptions
- [ ] All images have alt text
- [ ] Heading hierarchy is correct (h1 → h2 → h3)
- [ ] Canonical URLs are set correctly
- [ ] Structured data validates without errors
- [ ] Sitemap includes all public pages
- [ ] Robots.txt allows/disallows correct pages
- [ ] Mobile-friendly test passes
- [ ] Page speed is acceptable (< 3s)
- [ ] Social sharing works correctly (OG tags)
- [ ] Breadcrumbs display correctly

### Lighthouse Audit

Run Lighthouse audit for each page type:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Audit shop page
lighthouse https://yourdomain.com/shop --only-categories=seo,performance

# Audit product page
lighthouse https://yourdomain.com/shop/product-slug --only-categories=seo,performance

# Audit category page
lighthouse https://yourdomain.com/shop/category/electronics --only-categories=seo,performance
```

**Target Scores:**
- SEO: 90+
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+

## Production Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Update `robots.txt` with production domain
- [ ] Update sitemap URL in `robots.txt`
- [ ] Configure CDN for static assets
- [ ] Enable image optimization
- [ ] Test all meta tags in production
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Test social sharing on Facebook/Twitter
- [ ] Run Lighthouse audit on production
- [ ] Verify canonical URLs are absolute
- [ ] Check all pages have unique titles/descriptions
- [ ] Configure store name in structured data
- [ ] Configure currency in structured data
- [ ] Test mobile performance on real devices

## Environment Variables

```env
# frontend/.env.production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Your Store Name
NEXT_PUBLIC_DEFAULT_OG_IMAGE=/og-shop.svg
```

## Monitoring

### Key Metrics to Track

1. **Search Console Metrics:**
   - Impressions
   - Clicks
   - Average position
   - Click-through rate (CTR)

2. **Core Web Vitals:**
   - Largest Contentful Paint (LCP) - Target: < 2.5s
   - First Input Delay (FID) - Target: < 100ms
   - Cumulative Layout Shift (CLS) - Target: < 0.1

3. **Page Speed:**
   - Time to First Byte (TTFB) - Target: < 600ms
   - First Contentful Paint (FCP) - Target: < 1.8s
   - Time to Interactive (TTI) - Target: < 3.8s

4. **Indexing:**
   - Pages indexed vs. submitted
   - Crawl errors
   - Coverage issues

### Alerts to Set Up

- Drop in indexed pages
- Increase in crawl errors
- Core Web Vitals failing
- Page speed degradation
- Structured data errors

## Troubleshooting

### Pages Not Indexed

**Possible Causes:**
- Robots.txt blocking
- Noindex meta tag
- Canonical pointing elsewhere
- Low-quality content
- Duplicate content

**Solutions:**
1. Check robots.txt
2. Verify meta robots tag
3. Check canonical URL
4. Improve content quality
5. Add unique descriptions

### Structured Data Errors

**Possible Causes:**
- Invalid JSON-LD syntax
- Missing required fields
- Incorrect data types
- Invalid URLs

**Solutions:**
1. Validate with Rich Results Test
2. Check for syntax errors
3. Ensure all required fields present
4. Use absolute URLs

### Poor Performance

**Possible Causes:**
- Large images
- Too much JavaScript
- No caching
- Slow server response

**Solutions:**
1. Optimize images (use Next.js Image)
2. Enable code splitting
3. Implement ISR caching
4. Use CDN for static assets
5. Optimize database queries

## Resources

- **Next.js SEO Guide:** https://nextjs.org/learn/seo/introduction-to-seo
- **Google Search Central:** https://developers.google.com/search
- **Schema.org Documentation:** https://schema.org/
- **Web.dev Performance:** https://web.dev/performance/
- **Core Web Vitals:** https://web.dev/vitals/

## Support

For SEO-related questions or issues:
1. Check this guide first
2. Review Next.js SEO documentation
3. Test with Google Rich Results Test
4. Run Lighthouse audit
5. Check Google Search Console for errors
