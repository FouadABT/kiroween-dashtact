import { Metadata } from 'next';
import { ShopSearchPageClient } from './ShopSearchPageClient';
import { generatePageMetadata } from '@/lib/metadata-helpers';

interface ShopSearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopSearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';

  if (query) {
    return generatePageMetadata('/shop/search', {
      searchQuery: query,
    });
  }

  return generatePageMetadata('/shop/search');
}

export default async function ShopSearchPage({ searchParams }: ShopSearchPageProps) {
  const params = await searchParams;

  return (
    <ShopSearchPageClient
      initialSearchParams={params}
    />
  );
}
