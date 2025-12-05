import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { generateArticleStructuredData } from '@/lib/structured-data-helpers';
import { BlogPost as BlogPostComponent } from '@/components/blog/BlogPost';
import { featuresConfig } from '@/config/features.config';
import { BlogPost } from '@/types/blog';

/**
 * Individual Blog Post Page
 * 
 * Dynamic page that displays a single blog post by slug.
 * Accessible at /blog/[slug] route.
 * 
 * Features:
 * - Full blog post content with markdown rendering
 * - Featured image display
 * - Author information
 * - Publish date
 * - Categories and tags
 * - SEO optimized with dynamic metadata
 * - Structured data (JSON-LD) for articles
 */

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Enable ISR with 5 minute revalidation
export const revalidate = 300; // 5 minutes

/**
 * Fetch blog post data from API
 */
async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${apiUrl}/blog/${slug}`;
    
    console.log('[Blog Post Fetch] Attempting to fetch:', url);
    console.log('[Blog Post Fetch] API URL:', apiUrl);
    console.log('[Blog Post Fetch] Slug:', slug);
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    console.log('[Blog Post Fetch] Response status:', response.status);
    console.log('[Blog Post Fetch] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Blog Post Fetch] Error response:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('[Blog Post Fetch] Success! Post ID:', data.id);
    console.log('[Blog Post Fetch] Post title:', data.title);
    
    return data;
  } catch (error) {
    console.error('[Blog Post Fetch] Exception:', error);
    if (error instanceof Error) {
      console.error('[Blog Post Fetch] Error message:', error.message);
      console.error('[Blog Post Fetch] Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Generate dynamic metadata for the blog post
 */
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  // Next.js 16: params is now a Promise and must be awaited
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The blog post you are looking for does not exist',
    };
  }

  // Prepare dynamic values for metadata template
  const dynamicValues = {
    postTitle: post.title,
    postExcerpt: post.excerpt || post.title,
    postImage: post.featuredImage || '/og-blog.svg',
  };

  return generatePageMetadata('/blog/:slug', dynamicValues);
}

/**
 * Blog Post Page Component
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Check if blog feature is enabled
  if (!featuresConfig.blog.enabled) {
    notFound();
  }

  // Next.js 16: params is now a Promise and must be awaited
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Generate structured data for the article
  const structuredData = generateArticleStructuredData({
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.featuredImage || undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      name: post.author?.name || post.authorName || 'Anonymous',
    },
    publisher: {
      name: 'Dashboard Starter Kit',
      logo: {
        url: '/logo.png',
        width: 600,
        height: 60,
      },
    },
  });

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-background">
        <BlogPostComponent post={post} />
      </div>
    </>
  );
}
