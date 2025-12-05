# Customization Guide

## Overview

This guide explains how to customize the landing page and blog system to match your brand and requirements.

## Table of Contents

- [Landing Page Customization](#landing-page-customization)
- [Blog Appearance](#blog-appearance)
- [Styling and Theming](#styling-and-theming)
- [Component Customization](#component-customization)
- [SEO Customization](#seo-customization)
- [Advanced Customization](#advanced-customization)

## Landing Page Customization

### Hero Section

**Location:** `frontend/src/components/landing/Hero.tsx`

#### Headline and Description

```typescript
export function Hero() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Customize headline */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Your Custom Headline Here
          </h1>
          
          {/* Customize description */}
          <p className="text-xl text-muted-foreground mb-8">
            Your custom description that explains what your
            application does and why users should sign up.
          </p>
          
          {/* Customize CTA buttons */}
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### Background and Styling

Add background gradient:
```typescript
<section className="relative py-20 lg:py-32 bg-gradient-to-b from-background to-muted/50">
```

Add background image:
```typescript
<section 
  className="relative py-20 lg:py-32"
  style={{
    backgroundImage: 'url(/hero-bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* Add overlay */}
  <div className="absolute inset-0 bg-background/80" />
  
  {/* Content with relative positioning */}
  <div className="relative container mx-auto px-4">
    {/* ... */}
  </div>
</section>
```

#### Adding Hero Image

```typescript
<div className="max-w-5xl mx-auto">
  <div className="grid lg:grid-cols-2 gap-12 items-center">
    {/* Text content */}
    <div>
      <h1>Your Headline</h1>
      <p>Your description</p>
      <div className="flex gap-4">
        {/* Buttons */}
      </div>
    </div>
    
    {/* Hero image */}
    <div>
      <Image
        src="/hero-image.png"
        alt="Dashboard preview"
        width={600}
        height={400}
        className="rounded-lg shadow-2xl"
      />
    </div>
  </div>
</div>
```

### Features Section

**Location:** `frontend/src/components/landing/Features.tsx`

#### Customizing Features

```typescript
const features = [
  {
    icon: Shield,        // Change icon
    title: 'Security',   // Change title
    description: 'Enterprise-grade security with JWT authentication', // Change description
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Lightning-fast with Next.js 14 and React Server Components',
  },
  {
    icon: Palette,
    title: 'Customizable',
    description: 'Fully customizable themes and color palettes',
  },
  // Add more features...
];
```

#### Available Icons

Import from `lucide-react`:
```typescript
import {
  Shield,
  Zap,
  Palette,
  Users,
  Lock,
  Globe,
  Smartphone,
  Code,
  Database,
  Cloud,
  // ... many more
} from 'lucide-react';
```

#### Changing Layout

Grid layout (default):
```typescript
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map((feature) => (
    <FeatureCard key={feature.title} {...feature} />
  ))}
</div>
```

List layout:
```typescript
<div className="max-w-3xl mx-auto space-y-8">
  {features.map((feature) => (
    <FeatureCard key={feature.title} {...feature} horizontal />
  ))}
</div>
```

#### Customizing Feature Cards

**Location:** `frontend/src/components/landing/Features.tsx`

```typescript
function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
      {/* Icon */}
      <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      
      {/* Description */}
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
```

### Footer

**Location:** `frontend/src/components/landing/Footer.tsx`

#### Basic Customization

```typescript
export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold mb-4">Your Company</h3>
            <p className="text-sm text-muted-foreground">
              Your company description or tagline here.
            </p>
          </div>
          
          {/* Product Links */}
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/docs">Documentation</Link></li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="https://twitter.com/yourcompany" target="_blank">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com/yourcompany" target="_blank">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/yourcompany" target="_blank">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

### Navigation

**Location:** `frontend/src/components/landing/PublicNavigation.tsx`

```typescript
export function PublicNavigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="font-bold text-xl">Your Brand</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/docs">Docs</Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## Blog Appearance

### Blog Listing Page

**Location:** `frontend/src/app/blog/page.tsx`

#### Page Header

```typescript
<div className="container mx-auto px-4 py-12">
  {/* Customize header */}
  <div className="max-w-3xl mx-auto text-center mb-12">
    <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
    <p className="text-xl text-muted-foreground">
      Insights, tutorials, and updates from our team
    </p>
  </div>
  
  <BlogList posts={posts} currentPage={page} />
</div>
```

### Blog Card

**Location:** `frontend/src/components/blog/BlogCard.tsx`

```typescript
export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`}>
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        
        {/* Content */}
        <div>
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex gap-2 mb-2">
              {post.categories.map((category) => (
                <Badge key={category.id} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          
          {/* Excerpt */}
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            {post.author && <span>By {post.author.name}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
```

### Blog Post Page

**Location:** `frontend/src/components/blog/BlogPost.tsx`

```typescript
export function BlogPost({ post }: BlogPostProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        {/* Categories */}
        {post.categories && (
          <div className="flex gap-2 mb-4">
            {post.categories.map((category) => (
              <Badge key={category.id}>{category.name}</Badge>
            ))}
          </div>
        )}
        
        {/* Title */}
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          {post.title}
        </h1>
        
        {/* Meta */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
          {post.author && (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {post.author.name[0]}
                </AvatarFallback>
              </Avatar>
              <span>{post.author.name}</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      
      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                #{tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
```

## Styling and Theming

### Using Theme Colors

The blog system automatically uses your theme colors:

```typescript
// Primary color for links and accents
<Link className="text-primary hover:text-primary/80">

// Background colors
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-muted text-muted-foreground">

// Border colors
<div className="border border-border">
```

### Custom CSS

Add custom styles in `frontend/src/app/globals.css`:

```css
/* Blog-specific styles */
.blog-content {
  /* Custom prose styles */
}

.blog-card {
  /* Custom card styles */
}

/* Landing page styles */
.hero-section {
  /* Custom hero styles */
}
```

### Tailwind Customization

Edit `frontend/tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      // Custom colors
      colors: {
        'blog-accent': '#your-color',
      },
      
      // Custom fonts
      fontFamily: {
        'blog': ['Your Font', 'sans-serif'],
      },
      
      // Custom spacing
      spacing: {
        '128': '32rem',
      },
    },
  },
};
```

## Component Customization

### Adding New Sections

Create a new component:

**File:** `frontend/src/components/landing/Testimonials.tsx`

```typescript
export function Testimonials() {
  const testimonials = [
    {
      quote: "This dashboard is amazing!",
      author: "John Doe",
      role: "CEO, Company",
    },
    // More testimonials...
  ];
  
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Users Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="p-6 rounded-lg border bg-card">
              <p className="mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Add to landing page:

```typescript
// frontend/src/app/page.tsx
import { Testimonials } from '@/components/landing/Testimonials';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />  {/* Add here */}
      <Footer />
    </>
  );
}
```

### Customizing Markdown Rendering

**Location:** `frontend/src/components/blog/BlogPost.tsx`

```typescript
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

<ReactMarkdown
  components={{
    // Custom code blocks
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    
    // Custom headings with anchors
    h2({ children }) {
      const id = children.toString().toLowerCase().replace(/\s+/g, '-');
      return <h2 id={id}>{children}</h2>;
    },
    
    // Custom links
    a({ href, children }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  }}
>
  {post.content}
</ReactMarkdown>
```

## SEO Customization

### Landing Page Metadata

**Location:** `frontend/src/lib/metadata-config.ts`

```typescript
'/': {
  title: 'Your Company - Build Amazing Dashboards',
  description: 'Professional dashboard starter kit with authentication, theming, and everything you need to get started.',
  keywords: ['dashboard', 'saas', 'nextjs', 'react'],
  openGraph: {
    title: 'Your Company',
    description: 'Build amazing dashboards',
    type: 'website',
    images: [
      {
        url: '/og-landing.png',
        width: 1200,
        height: 630,
        alt: 'Your Company Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yourcompany',
    creator: '@yourcompany',
  },
}
```

### Blog Metadata

```typescript
'/blog': {
  title: 'Blog - Your Company',
  description: 'Insights, tutorials, and updates',
  keywords: ['blog', 'tutorials', 'guides'],
}

'/blog/:slug': {
  title: '{postTitle} - Blog',
  description: '{postExcerpt}',
  openGraph: {
    type: 'article',
    images: [{ url: '{postImage}' }],
  },
}
```

### Creating OG Images

Create custom Open Graph images:

1. Design image (1200x630px)
2. Save as `public/og-landing.png`
3. Reference in metadata config

**Tools:**
- Figma
- Canva
- OG Image Generator

## Advanced Customization

### Custom Blog Layouts

Create alternative layouts:

**File:** `frontend/src/components/blog/BlogListGrid.tsx`

```typescript
export function BlogListGrid({ posts }: BlogListGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

**File:** `frontend/src/components/blog/BlogListMasonry.tsx`

```typescript
export function BlogListMasonry({ posts }: BlogListMasonryProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
      {posts.map((post) => (
        <div key={post.id} className="break-inside-avoid mb-8">
          <BlogCard post={post} />
        </div>
      ))}
    </div>
  );
}
```

### Adding Search

**File:** `frontend/src/components/blog/BlogSearch.tsx`

```typescript
'use client';

export function BlogSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/blog?search=${encodeURIComponent(query)}`);
  };
  
  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </form>
  );
}
```

### Adding Related Posts

**File:** `frontend/src/components/blog/RelatedPosts.tsx`

```typescript
export async function RelatedPosts({ post }: RelatedPostsProps) {
  const related = await fetchRelatedPosts(post.id, post.categories);
  
  if (related.length === 0) return null;
  
  return (
    <section className="mt-12 pt-12 border-t">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {related.map((relatedPost) => (
          <BlogCard key={relatedPost.id} post={relatedPost} compact />
        ))}
      </div>
    </section>
  );
}
```

## Quick Reference

### File Locations

```
Landing Page:
- Hero: frontend/src/components/landing/Hero.tsx
- Features: frontend/src/components/landing/Features.tsx
- Footer: frontend/src/components/landing/Footer.tsx
- Navigation: frontend/src/components/landing/PublicNavigation.tsx

Blog:
- Listing: frontend/src/app/blog/page.tsx
- Post: frontend/src/app/blog/[slug]/page.tsx
- Card: frontend/src/components/blog/BlogCard.tsx
- Post Component: frontend/src/components/blog/BlogPost.tsx

Configuration:
- Metadata: frontend/src/lib/metadata-config.ts
- Features: frontend/src/config/features.config.ts
- Styles: frontend/src/app/globals.css
- Tailwind: frontend/tailwind.config.ts
```

### Common Customizations

```typescript
// Change hero headline
<h1>Your Custom Headline</h1>

// Change CTA button text
<Button>Get Started Free</Button>

// Add feature
features.push({
  icon: YourIcon,
  title: 'Your Feature',
  description: 'Description',
});

// Customize blog card
<BlogCard post={post} variant="compact" />

// Change colors
className="bg-primary text-primary-foreground"

// Custom font
className="font-blog"
```

## Additional Resources

- **Setup Guide**: `SETUP_GUIDE.md`
- **Configuration**: `CONFIGURATION_GUIDE.md`
- **Blog Management**: `BLOG_MANAGEMENT_GUIDE.md`
- **Design System**: `.kiro/steering/design-system-theming.md`
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
