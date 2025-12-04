import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopPageClient } from './ShopPageClient';
import { StorefrontApi } from '@/lib/api';
import type { StorefrontProductListResponseDto, StorefrontCategoryResponseDto } from '@/types/ecommerce';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { generateWebSiteStructuredData, generateProductListStructuredData } from '@/lib/structured-data-helpers';
import { isFeatureEnabled } from '@/config/features.config';

export const metadata: Metadata = generatePageMetadata('/shop');

// Enable ISR with 5 minute revalidation for product catalog caching
export const revalidate = 300;

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
    isFeatured?: string;
    inStock?: string;
    sortBy?: string;
  }>;
}

async function getProducts(searchParams: Awaited<ShopPageProps['searchParams']>): Promise<StorefrontProductListResponseDto> {
  try {
    const query = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 12,
      search: searchParams.search,
      categorySlug: searchParams.categorySlug,
      minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      isFeatured: searchParams.isFeatured === 'true' ? true : undefined,
      inStock: searchParams.inStock === 'true' ? true : undefined,
      sortBy: searchParams.sortBy as any,
    };

    return await StorefrontApi.getPublicProducts(query);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    };
  }
}

async function getCategories(): Promise<StorefrontCategoryResponseDto[]> {
  try {
    return await StorefrontApi.getCategories();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Check if ecommerce feature is enabled
  if (!isFeatureEnabled('ecommerce')) {
    notFound();
  }

  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;
  
  // Fetch data on the server
  const [productsData, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  // Generate structured data for the shop page
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Website structured data with search action
  const websiteData = generateWebSiteStructuredData(
    'Shop',
    `${baseUrl}/shop`,
    `${baseUrl}/shop?search={search_term_string}`
  );

  // Product list structured data
  const productListData = productsData.products.length > 0
    ? generateProductListStructuredData(
        productsData.products.map(p => ({
          name: p.name,
          url: `${baseUrl}/shop/${p.slug}`,
        })),
        'Product Catalog'
      )
    : null;

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      {productListData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListData) }}
        />
      )}
      
      {/* Client Component */}
      <ShopPageClient
        initialProducts={productsData}
        categories={categories}
        initialSearchParams={params}
      />
    </>
  );
}
