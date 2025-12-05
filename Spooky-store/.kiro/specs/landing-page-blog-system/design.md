# Design Document

## Overview

The Landing Page and Blog System is an optional feature module for the dashboard starter kit that adds public-facing pages with full SEO optimization. The system is designed to be completely modular and can be enabled/disabled via configuration without affecting core dashboard functionality.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Layer                       │
│  (Feature flags control what's enabled)                     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│  Landing Page  │                    │   Blog System   │
│   (Optional)   │                    │   (Optional)    │
└───────┬────────┘                    └────────┬────────┘
        │                                      │
        │                              ┌───────┴────────┐
        │                              │                │
        │                      ┌───────▼──────┐ ┌──────▼──────┐
        │                      │ Public Blog  │ │   Blog      │
        │                      │   Pages      │ │ Management  │
        │                      └───────┬──────┘ └──────┬──────┘
        │                              │                │
        └──────────────────────────────┴────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
            ┌───────▼────────┐                  ┌────────▼────────┐
            │  SEO/Metadata  │                  │   Backend API   │
            │   Integration  │                  │   & Database    │
            └────────────────┘                  └─────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 App Router for routing and SSR
- React Server Components for optimal performance
- Existing metadata system for SEO
- Existing breadcrumb system for navigation
- shadcn/ui components for consistent design
- Tailwind CSS for styling

**Backend:**
- NestJS for API endpoints
- Prisma ORM for database operations
- PostgreSQL for data storage
- Existing auth/permissions system for access control

**Content Management:**
- Markdown or rich text editor (TipTap or similar)
- File upload system for images (existing upload module)
- Slug generation for SEO-friendly URLs

## Configuration System

### Environment Variables

**Location:** `frontend/.env.local` and `backend/.env`

```env
# Frontend environment variables
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false

# Backend environment variables (optional)
BLOG_ENABLE_CATEGORIES=true
BLOG_ENABLE_TAGS=true
```

### Configuration File

**Location:** `frontend/src/config/features.config.ts`

```typescript
export const featuresConfig = {
  landingPage: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true',
  },
  blog: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
    postsPerPage: Number(process.env.NEXT_PUBLIC_BLOG_POSTS_PER_PAGE) || 10,
    enableCategories: process.env.NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES !== 'false',
    enableTags: process.env.NEXT_PUBLIC_BLOG_ENABLE_TAGS !== 'false',
    requireAuthor: process.env.NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR === 'true',
  },
};
```

### Smart Route Handling

**Middleware-Based Routing** (`frontend/src/middleware.ts`):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check feature flags from environment
  const landingEnabled = process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true';
  const blogEnabled = process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true';
  
  // Root route handling
  if (pathname === '/') {
    if (!landingEnabled) {
      // Redirect to dashboard if user is authenticated, otherwise login
      const token = request.cookies.get('auth-token');
      const redirectUrl = token ? '/dashboard' : '/login';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }
  
  // Blog route handling
  if (pathname.startsWith('/blog') && !blogEnabled) {
    return NextResponse.redirect(new URL('/404', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/blog/:path*'],
};
```

**Root Page with Feature Check:**
```typescript
// frontend/src/app/page.tsx
import { featuresConfig } from '@/config/features.config';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';

export default function HomePage() {
  // This check is redundant with middleware but provides type safety
  if (!featuresConfig.landingPage.enabled) {
    redirect('/dashboard');
  }
  
  return <LandingPage />;
}
```

**Navigation Integration:**
```typescript
// frontend/src/contexts/NavigationContext.tsx
const navigationItems = [
  // ... existing items
  ...(featuresConfig.blog.enabled ? [{
    title: "Blog",
    href: "/dashboard/blog",
    icon: FileText,
    permission: "blog:read",
  }] : []),
];
```

## Database Schema

### BlogPost Model

```prisma
model BlogPost {
  id              String        @id @default(cuid())
  
  // Content
  title           String
  slug            String        @unique
  excerpt         String?
  content         String        @db.Text
  
  // Media
  featuredImage   String?       @map("featured_image")
  
  // Metadata
  status          PostStatus    @default(DRAFT)
  publishedAt     DateTime?     @map("published_at")
  
  // Author (optional for better SEO flexibility)
  authorId        String?       @map("author_id")
  authorName      String?       @map("author_name")
  authorEmail     String?       @map("author_email")
  author          User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  
  // Organization
  categories      BlogCategory[]
  tags            BlogTag[]
  
  // SEO
  metaTitle       String?       @map("meta_title")
  metaDescription String?       @map("meta_description")
  
  // Timestamps
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  
  @@index([slug])
  @@index([status])
  @@index([publishedAt])
  @@index([authorId])
  @@map("blog_posts")
}

model BlogCategory {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  description String?
  posts       BlogPost[]
  createdAt   DateTime    @default(now()) @map("created_at")
  
  @@map("blog_categories")
}

model BlogTag {
  id        String      @id @default(cuid())
  name      String      @unique
  slug      String      @unique
  posts     BlogPost[]
  createdAt DateTime    @default(now()) @map("created_at")
  
  @@map("blog_tags")
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Permissions

Add to existing permissions seed:
```typescript
{
  name: 'blog:read',
  resource: 'blog',
  action: 'read',
  description: 'View blog posts in dashboard'
},
{
  name: 'blog:write',
  resource: 'blog',
  action: 'write',
  description: 'Create and edit blog posts'
},
{
  name: 'blog:delete',
  resource: 'blog',
  action: 'delete',
  description: 'Delete blog posts'
},
{
  name: 'blog:publish',
  resource: 'blog',
  action: 'publish',
  description: 'Publish blog posts'
},
```

## Backend Implementation

### Module Structure

```
backend/src/blog/
├── blog.module.ts
├── blog.controller.ts
├── blog.service.ts
├── dto/
│   ├── create-blog-post.dto.ts
│   ├── update-blog-post.dto.ts
│   └── blog-query.dto.ts
└── entities/
    └── blog-post.entity.ts (Prisma types)
```

### API Endpoints

**Public Endpoints (no auth required):**
```typescript
GET    /blog                    // List published posts (paginated)
GET    /blog/:slug              // Get single published post by slug
GET    /blog/categories         // List all categories
GET    /blog/tags               // List all tags
```

**Protected Endpoints (requires auth + permissions):**
```typescript
GET    /blog/admin              // List all posts (drafts + published)
POST   /blog                    // Create new post (blog:write)
GET    /blog/admin/:id          // Get post by ID (blog:read)
PATCH  /blog/:id                // Update post (blog:write)
DELETE /blog/:id                // Delete post (blog:delete)
PATCH  /blog/:id/publish        // Publish post (blog:publish)
PATCH  /blog/:id/unpublish      // Unpublish post (blog:publish)
```

### Service Methods

```typescript
@Injectable()
export class BlogService {
  constructor(private prisma: PrismaClient) {}
  
  // Public methods
  async findPublished(query: BlogQueryDto) {
    return this.prisma.blogPost.findMany({
      where: { 
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() }
      },
      include: { author: true, categories: true, tags: true },
      orderBy: { publishedAt: 'desc' },
      skip: query.skip,
      take: query.limit,
    });
  }
  
  async findBySlug(slug: string) {
    return this.prisma.blogPost.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: { author: true, categories: true, tags: true },
    });
  }
  
  // Admin methods
  async create(dto: CreateBlogPostDto, authorId: string) {
    const slug = this.generateSlug(dto.title);
    return this.prisma.blogPost.create({
      data: { ...dto, slug, authorId },
    });
  }
  
  async update(id: string, dto: UpdateBlogPostDto) {
    return this.prisma.blogPost.update({
      where: { id },
      data: dto,
    });
  }
  
  async publish(id: string) {
    return this.prisma.blogPost.update({
      where: { id },
      data: { 
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
    });
  }
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
```

## Frontend Implementation

### Landing Page

**Component Structure:**
```
frontend/src/components/landing/
├── LandingPage.tsx          // Main landing page
├── Hero.tsx                 // Hero section
├── Features.tsx             // Features section
├── CallToAction.tsx         // CTA section
├── Footer.tsx               // Footer
└── Navigation.tsx           // Public navigation
```

**Hero Section:**
```typescript
export function Hero() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Build Amazing Dashboards
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A professional dashboard starter kit with authentication,
            theming, and everything you need to get started.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
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

**Features Section:**
```typescript
const features = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'JWT-based auth with role-based permissions',
  },
  {
    icon: Palette,
    title: 'Customizable Theming',
    description: 'Dark mode and custom color palettes',
  },
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Built with Next.js 14 and React Server Components',
  },
  // ... more features
];

export function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Blog Pages

**Blog Listing Page:**
```typescript
// frontend/src/app/blog/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { BlogList } from '@/components/blog/BlogList';

export const metadata: Metadata = generatePageMetadata('/blog');

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const posts = await fetchBlogPosts(page);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <BlogList posts={posts} currentPage={page} />
    </div>
  );
}
```

**Blog Post Page:**
```typescript
// frontend/src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { BlogPost } from '@/components/blog/BlogPost';
import { generateArticleStructuredData } from '@/lib/structured-data-helpers';

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchBlogPost(params.slug);
  
  return generatePageMetadata('/blog/:slug', {
    postTitle: post.title,
    postExcerpt: post.excerpt,
  });
}

export default async function BlogPostPage({ params }) {
  const post = await fetchBlogPost(params.slug);
  const structuredData = generateArticleStructuredData({
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    author: { name: post.author.name },
  });
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPost post={post} />
    </>
  );
}
```

### Blog Management Dashboard

**Blog Management Page:**
```typescript
// frontend/src/app/dashboard/blog/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { BlogManagement } from '@/components/blog/BlogManagement';

export const metadata: Metadata = generatePageMetadata('/dashboard/blog');

export default function BlogManagementPage() {
  return (
    <PermissionGuard permission="blog:read">
      <div className="space-y-6">
        <PageHeader
          title="Blog Management"
          description="Create and manage blog posts"
        />
        <BlogManagement />
      </div>
    </PermissionGuard>
  );
}
```

**Blog Editor Component:**
```typescript
// frontend/src/components/blog/BlogEditor.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownEditor } from '@/components/blog/MarkdownEditor';
import { ImageUpload } from '@/components/widgets/forms/FileUpload';

export function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featuredImage: post?.featuredImage || '',
    status: post?.status || 'DRAFT',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = post ? `/api/blog/${post.id}` : '/api/blog';
    const method = post ? 'PATCH' : 'POST';
    
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      router.push('/dashboard/blog');
      router.refresh();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      
      <Textarea
        label="Excerpt"
        value={formData.excerpt}
        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        rows={3}
      />
      
      <ImageUpload
        label="Featured Image"
        value={formData.featuredImage}
        onChange={(url) => setFormData({ ...formData, featuredImage: url })}
      />
      
      <MarkdownEditor
        label="Content"
        value={formData.content}
        onChange={(content) => setFormData({ ...formData, content })}
      />
      
      <div className="flex gap-4">
        <Button type="submit">
          {post ? 'Update' : 'Create'} Post
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

## SEO Integration

### Metadata Configuration

Add to `frontend/src/lib/metadata-config.ts`:

```typescript
export const metadataConfig: Record<string, PageMetadata> = {
  // ... existing routes
  
  '/': {
    title: 'Dashboard Starter Kit - Build Amazing Dashboards',
    description: 'A professional dashboard starter kit with authentication, theming, and everything you need to get started.',
    keywords: ['dashboard', 'starter kit', 'nextjs', 'react', 'admin panel'],
    openGraph: {
      title: 'Dashboard Starter Kit',
      description: 'Build amazing dashboards with our professional starter kit',
      type: 'website',
      images: [{ url: '/og-landing.png', width: 1200, height: 630 }],
    },
    robots: {
      index: true,
      follow: true,
    },
  },
  
  '/blog': {
    title: 'Blog - Dashboard Starter Kit',
    description: 'Read our latest articles and tutorials',
    breadcrumb: { label: 'Blog' },
    openGraph: {
      title: 'Blog',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  },
  
  '/blog/:slug': {
    title: '{postTitle} - Blog',
    description: '{postExcerpt}',
    breadcrumb: { label: '{postTitle}', dynamic: true },
    openGraph: {
      title: '{postTitle}',
      description: '{postExcerpt}',
      type: 'article',
      images: [{ url: '{postImage}' }],
    },
    robots: {
      index: true,
      follow: true,
    },
  },
  
  '/dashboard/blog': {
    title: 'Blog Management',
    description: 'Create and manage blog posts',
    breadcrumb: { label: 'Blog' },
    robots: {
      index: false,
      follow: false,
    },
  },
};
```

### Sitemap Integration

Update `frontend/src/lib/sitemap-helpers.ts`:

```typescript
export async function generateSitemap() {
  const routes = extractRoutesFromMetadata();
  const blogPosts = await fetchPublishedBlogPosts();
  
  const staticRoutes = routes.map(route => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
  
  const blogRoutes = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  
  return [...staticRoutes, ...blogRoutes];
}
```

## Error Handling

### Not Found Pages

```typescript
// frontend/src/app/blog/[slug]/not-found.tsx
export default function BlogPostNotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The blog post you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link href="/blog">Back to Blog</Link>
      </Button>
    </div>
  );
}
```

### Error Boundaries

```typescript
// frontend/src/app/blog/error.tsx
'use client';

export default function BlogError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-8">{error.message}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
```

## Testing Strategy

### Backend Tests

```typescript
// backend/src/blog/blog.service.spec.ts
describe('BlogService', () => {
  it('should create a blog post with generated slug', async () => {
    const dto = { title: 'My First Post', content: '...' };
    const result = await service.create(dto, 'user-id');
    expect(result.slug).toBe('my-first-post');
  });
  
  it('should only return published posts for public endpoint', async () => {
    const posts = await service.findPublished({});
    expect(posts.every(p => p.status === 'PUBLISHED')).toBe(true);
  });
  
  it('should require blog:write permission to create post', async () => {
    // Test permission guard
  });
});
```

### Frontend Tests

```typescript
// frontend/src/components/blog/__tests__/BlogEditor.test.tsx
describe('BlogEditor', () => {
  it('should render form fields', () => {
    render(<BlogEditor />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
  });
  
  it('should submit form data', async () => {
    const { user } = render(<BlogEditor />);
    await user.type(screen.getByLabelText('Title'), 'Test Post');
    await user.click(screen.getByText('Create Post'));
    // Assert API call
  });
});
```

## Performance Considerations

### Caching Strategy

- **Static Generation**: Landing page and blog listing use ISR (Incremental Static Regeneration)
- **Dynamic Routes**: Blog posts use dynamic rendering with caching
- **API Caching**: Blog API responses cached for 5 minutes
- **Image Optimization**: Use Next.js Image component for featured images

### Pagination

- Default: 10 posts per page
- Cursor-based pagination for better performance
- Prefetch next page for smooth navigation

## Accessibility

- Semantic HTML for all components
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader announcements for dynamic content
- Focus management in modals and forms
- Color contrast compliance (WCAG AA)

## Security

- Input sanitization for blog content
- XSS prevention in markdown rendering
- CSRF protection on forms
- Rate limiting on API endpoints
- Permission checks on all admin endpoints
- SQL injection prevention via Prisma

## Migration Path

### For Existing Installations

1. Run database migration to add blog tables
2. Add blog permissions to seed data
3. Reseed permissions
4. Set environment variables
5. Update navigation if blog enabled
6. Deploy changes

### For New Installations

- Blog system included but disabled by default
- Enable via environment variables
- Run migrations during initial setup
- Configure landing page content

## Future Enhancements

- Comments system
- Blog post search
- RSS feed generation
- Email notifications for new posts
- Multi-language support
- Blog post scheduling
- Analytics integration
- Social sharing buttons
