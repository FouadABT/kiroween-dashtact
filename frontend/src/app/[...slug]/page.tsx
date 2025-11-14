'use client';

import { use, useEffect, useState } from 'react';
import { notFound, redirect, useRouter } from 'next/navigation';
import { CustomPageLayout } from '@/components/pages/public/CustomPageLayout';
import { PageContent } from '@/components/pages/public/PageContent';
import { PageHeader } from '@/components/pages/public/PageHeader';
import { PageFooter } from '@/components/pages/public/PageFooter';
import { CustomPage, PageStatus, PageVisibility } from '@/types/pages';
import { generateBreadcrumbStructuredData } from '@/lib/structured-data-helpers';
import { generatePageBreadcrumbs } from '@/lib/metadata-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch page by slug
async function fetchPageBySlug(slugPath: string[]): Promise<CustomPage | null> {
  try {
    const slug = slugPath.join('/');
    const response = await fetch(`${API_URL}/pages/slug/${slug}`, {
      next: { revalidate: 300 }, // ISR: 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

// Check for redirects
async function checkRedirect(slugPath: string[]): Promise<string | null> {
  try {
    const slug = slugPath.join('/');
    const response = await fetch(`${API_URL}/pages/redirect/${slug}`);

    if (response.ok) {
      const data = await response.json();
      return data.redirectTo;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Custom page route component
export default function CustomPageRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params);
  const [page, setPage] = useState<CustomPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadPage() {
      setIsLoading(true);
      
      // Check for redirects first
      const redirectTo = await checkRedirect(slug);
      if (redirectTo) {
        router.push(`/${redirectTo}`);
        return;
      }

      // Fetch page
      const fetchedPage = await fetchPageBySlug(slug);

      if (!fetchedPage) {
        setPage(null);
        setIsLoading(false);
        return;
      }

      // Handle draft pages
      if (fetchedPage.status !== PageStatus.PUBLISHED) {
        setPage(null);
        setIsLoading(false);
        return;
      }

      // Handle private pages
      if (fetchedPage.visibility === PageVisibility.PRIVATE) {
        router.push(`/login?redirect=/${slug.join('/')}`);
        return;
      }

      setPage(fetchedPage);
      setIsLoading(false);
    }

    loadPage();
  }, [slug, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 text-center">
          The page you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }
  // Generate breadcrumb structured data using helper
  const breadcrumbs = generatePageBreadcrumbs(page, slug);
  const structuredData = generateBreadcrumbStructuredData(breadcrumbs);

  return (
    <>
      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <CustomPageLayout page={page}>
        <PageHeader page={page} />
        <PageContent page={page} />
        <PageFooter page={page} />
      </CustomPageLayout>
    </>
  );
}
