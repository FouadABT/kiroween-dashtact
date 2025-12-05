# SEO Optimization Guide

This guide covers the SEO features implemented in the Page Metadata System.

## Overview

The application includes comprehensive SEO optimizations:

- **Open Graph metadata** for social media sharing
- **Twitter Card metadata** for Twitter-specific previews
- **Canonical URLs** to prevent duplicate content
- **Robots meta tags** for search engine directives
- **Dynamic sitemap** generation
- **robots.txt** configuration

## Open Graph Metadata

Open Graph tags control how pages appear when shared on social media platforms (Facebook, LinkedIn, etc.).

### Configuration

Open Graph metadata is configured in `metadata-config.ts`:

```typescript
openGraph: {
  title: 'Page Title',
  description: 'Page description for social sharing',
  type: 'website', // or 'article', 'profile'
  images: [
    {
      url: '/og-image.svg',
      width: 1200,
      height: 630,
      alt: 'Image description',
      type: 'image/svg+xml',
    },
  ],
  locale: 'en_US',
  siteName: 'Dashboard Application',
}
```

### Default OG Image

A default Open Graph image is provided at `/og-image.svg`:
- Dimensions: 1200x630 pixels (recommended by Facebook)
- Format: SVG (scalable and small file size)
- Includes: Application branding, description, and feature highlights

### Custom OG Images

To add custom OG images for specific pages:

```typescript
'/dashboard/analytics': {
  title: 'Analytics',
  openGraph: {
    images: [
      {
        url: '/og-analytics.png',
        width: 1200,
        height: 630,
        alt: 'Analytics Dashboard Preview',
      },
    ],
  },
}
```

### Dynamic OG Metadata

For dynamic pages with user-generated content:

```typescript
export async function generateMetadata({ params }) {
  const user = await fetchUser(params.id);
  
  return generatePageMetadata('/dashboard/users/:id', {
    userName: user.name,
  });
}
```

The template `{userName}` in the OG title/description will be replaced with the actual user name.

## Twitter Card Metadata

Twitter Cards provide rich previews when links are shared on Twitter.

### Card Types

- `summary`: Small card with thumbnail
- `summary_large_image`: Large card with prominent image (default)
- `app`: Mobile app card
- `player`: Video/audio player card

### Configuration

```typescript
twitter: {
  card: 'summary_large_image',
  site: '@dashboard',
  creator: '@username',
  title: 'Page Title',
  description: 'Page description for Twitter',
  images: ['/og-image.svg'],
}
```

### Testing Twitter Cards

Use the [Twitter Card Validator](https://cards-dev.twitter.com/validator) to test your cards.

## Canonical URLs

Canonical URLs prevent duplicate content issues by specifying the preferred URL for a page.

### Automatic Generation

Canonical URLs are automatically generated for all pages:

```typescript
const canonicalUrl = generateCanonicalUrl('/dashboard/users');
// Result: 'https://yourdomain.com/dashboard/users'
```

### Conditional Canonical URLs

Some pages should not have canonical URLs:
- Authentication pages (login, signup)
- Error pages (403, 404, 500)
- Pages with `noindex` robots directive

The `shouldHaveCanonical()` function handles this logic automatically.

### Custom Canonical URLs

To specify a custom canonical URL:

```typescript
'/dashboard/users': {
  canonical: 'https://yourdomain.com/users',
}
```

## Robots Meta Tags

Robots meta tags control how search engines crawl and index pages.

### Directives

- `index`: Allow indexing (default: true)
- `follow`: Follow links (default: true)
- `noarchive`: Don't show cached version
- `nosnippet`: Don't show text snippet in results
- `noimageindex`: Don't index images
- `max-snippet`: Maximum snippet length
- `max-image-preview`: Maximum image preview size
- `max-video-preview`: Maximum video preview duration

### Configuration Examples

**Public page (allow indexing):**
```typescript
'/dashboard': {
  robots: {
    index: true,
    follow: true,
    maxImagePreview: 'large',
    maxSnippet: 160,
  },
}
```

**Private page (prevent indexing):**
```typescript
'/login': {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}
```

**Settings page (no index, but follow links):**
```typescript
'/dashboard/settings': {
  robots: {
    index: false,
    follow: true,
    noarchive: true,
  },
}
```

### robots.txt

A static `robots.txt` file is provided at `/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /login
Disallow: /signup
Disallow: /dashboard/settings
Sitemap: https://yourdomain.com/sitemap.xml
```

Update the sitemap URL with your actual domain in production.

## Dynamic Sitemap

The application automatically generates a sitemap at `/sitemap.xml`.

### How It Works

1. The `sitemap.ts` route handler generates the sitemap
2. Routes are extracted from `metadata-config.ts`
3. Only indexable routes are included (no dynamic routes, no noindex pages)
4. Change frequency and priority are assigned based on route type

### Sitemap Entries

```typescript
{
  url: 'https://yourdomain.com/dashboard',
  lastModified: new Date(),
  changeFrequency: 'daily',
  priority: 0.9,
}
```

### Change Frequencies

- Home page: `daily`, priority 1.0
- Dashboard: `daily`, priority 0.9
- Analytics: `daily`, priority 0.8
- User management: `weekly`, priority 0.7
- Other pages: `weekly`, priority 0.6

### Submitting Sitemap

Submit your sitemap to search engines:

**Google Search Console:**
1. Go to https://search.google.com/search-console
2. Add your property
3. Submit sitemap: `https://yourdomain.com/sitemap.xml`

**Bing Webmaster Tools:**
1. Go to https://www.bing.com/webmasters
2. Add your site
3. Submit sitemap: `https://yourdomain.com/sitemap.xml`

## SEO Best Practices

### Title Tags

- Keep titles under 60 characters
- Include primary keyword
- Make titles unique per page
- Use descriptive, compelling titles

### Meta Descriptions

- Keep descriptions under 160 characters
- Include call-to-action
- Make descriptions unique per page
- Accurately describe page content

### Open Graph Images

- Use 1200x630 pixels (Facebook recommended)
- Include text overlay for context
- Use high-quality images
- Test on multiple platforms

### Canonical URLs

- Always use absolute URLs
- Point to the preferred version
- Use consistently across pages
- Update when URLs change

### Robots Directives

- Use `noindex` for private pages
- Use `nofollow` for untrusted links
- Use `noarchive` for sensitive content
- Use `max-snippet` to control snippet length

## Testing SEO

### Tools

1. **Google Search Console**: Monitor indexing and search performance
2. **Bing Webmaster Tools**: Monitor Bing indexing
3. **Facebook Sharing Debugger**: Test Open Graph tags
4. **Twitter Card Validator**: Test Twitter Cards
5. **Lighthouse**: Audit SEO score
6. **Schema.org Validator**: Test structured data

### Manual Testing

1. **View Page Source**: Check meta tags in HTML
2. **Share on Social Media**: Verify OG/Twitter cards
3. **Google Search**: Check how pages appear in results
4. **robots.txt**: Verify at `/robots.txt`
5. **Sitemap**: Verify at `/sitemap.xml`

### Lighthouse SEO Audit

Run Lighthouse in Chrome DevTools:

```bash
# Or use CLI
npx lighthouse https://yourdomain.com --only-categories=seo
```

Target score: 90+

## Troubleshooting

### OG Image Not Showing

1. Check image URL is absolute
2. Verify image dimensions (1200x630)
3. Clear Facebook cache: https://developers.facebook.com/tools/debug/
4. Check image is publicly accessible

### Page Not Indexed

1. Check robots meta tags (should be `index: true`)
2. Verify robots.txt allows crawling
3. Submit sitemap to search engines
4. Check Google Search Console for errors

### Canonical URL Issues

1. Verify canonical URL is absolute
2. Check for redirect chains
3. Ensure canonical points to preferred version
4. Avoid canonical to noindex pages

### Sitemap Not Updating

1. Check `sitemap.ts` is deployed
2. Verify `NEXT_PUBLIC_APP_URL` is set
3. Clear CDN cache if using one
4. Resubmit sitemap to search engines

## Production Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Update robots.txt with production domain
- [ ] Create custom OG images for key pages
- [ ] Test all meta tags in production
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google Analytics (optional)
- [ ] Monitor indexing status weekly

## Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
