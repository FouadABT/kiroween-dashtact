import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageEditorClient } from './PageEditorClient';

// Fetch page data for metadata
async function fetchPage(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/admin/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching page for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  // Fetch page data to get title
  const page = await fetchPage(id);
  
  if (!page) {
    return generatePageMetadata('/dashboard/pages/:id/edit');
  }
  
  return generatePageMetadata('/dashboard/pages/:id/edit', {
    pageTitle: page.title,
  });
}

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch page data for breadcrumb
  const page = await fetchPage(id);
  
  return <PageEditorClient pageId={id} pageTitle={page?.title} />;
}
