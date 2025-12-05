import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { BlogList } from '@/components/blog/BlogList';
import { featuresConfig } from '@/config/features.config';
import { redirect } from 'next/navigation';

/**
 * Blog Listing Page
 * 
 * Public page that displays all published blog posts with pagination.
 * Accessible at /blog route.
 * 
 * Features:
 * - Displays published blog posts in a grid
 * - Pagination support
 * - SEO optimized with metadata
 * - Responsive design
 */

export const metadata: Metadata = generatePageMetadata('/blog');

// Enable ISR with 5 minute revalidation
export const revalidate = 300; // 5 minutes

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Check if blog feature is enabled
  if (!featuresConfig.blog.enabled) {
    redirect('/404');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-muted-foreground mt-2">
            Read our latest articles and tutorials
          </p>
        </div>
      </header>

      {/* Blog List */}
      <main className="container mx-auto px-4 py-12">
        <BlogList page={page} />
      </main>
    </div>
  );
}
