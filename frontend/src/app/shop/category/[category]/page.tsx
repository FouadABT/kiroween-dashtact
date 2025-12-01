import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryPageClient } from './CategoryPageClient';
import { StorefrontApi } from '@/lib/api';
import { generateBreadcrumbStructuredData, generateProductListStructuredData } from '@/lib/structured-data-helpers';
import type {
  StorefrontProductListResponseDto,
  StorefrontCategoryResponseDto,
} from '@/types/ecommerce';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    isFeatured?: string;
    inStock?: string;
    sortBy?: string;
  }>;
}

// Enable ISR with 5 minute revalidation for category pages
export const revalidate = 300;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const { category: categorySlug } = await params;
    const categories = await StorefrontApi.getCategories();
    const category = findCategoryBySlug(categories, categorySlug);

    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The requested category could not be found.',
      };
    }

    const title = `${category.name} - Shop by Category`;
    const description =
      category.description ||
      `Browse our ${category.name} collection. Find the best products in ${category.name}.`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return {
      title,
      description,
      keywords: [category.name, 'shop', 'products', 'category', 'e-commerce'],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${baseUrl}/shop/category/${category.slug}`,
        images: category.image
          ? [
              {
                url: category.image,
                width: 1200,
                height: 630,
                alt: category.name,
              },
            ]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: category.image ? [category.image] : undefined,
      },
      alternates: {
        canonical: `${baseUrl}/shop/category/${category.slug}`,
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Shop by Category',
      description: 'Browse products by category',
    };
  }
}

// Helper function to find category by slug (including nested categories)
function findCategoryBySlug(
  categories: StorefrontCategoryResponseDto[],
  slug: string
): StorefrontCategoryResponseDto | null {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    if (category.children) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) return found;
    }
  }
  return null;
}

async function getProducts(
  categorySlug: string,
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    isFeatured?: string;
    inStock?: string;
    sortBy?: string;
  }
): Promise<StorefrontProductListResponseDto> {
  try {
    const query = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 12,
      search: searchParams.search,
      minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      isFeatured: searchParams.isFeatured === 'true' ? true : undefined,
      inStock: searchParams.inStock === 'true' ? true : undefined,
      sortBy: searchParams.sortBy as any,
    };

    return await StorefrontApi.getProductsByCategory(categorySlug, query);
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Fetch data on the server
  const [productsData, categories] = await Promise.all([
    getProducts(categorySlug, resolvedSearchParams),
    getCategories(),
  ]);

  // Find the current category
  const category = findCategoryBySlug(categories, categorySlug);

  // If category not found, show 404
  if (!category) {
    notFound();
  }

  // Generate breadcrumb structured data for SEO
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: category.name, href: `/shop/category/${category.slug}` },
  ];
  const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbs);

  // Generate product list structured data
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const productListData = productsData.products.length > 0
    ? generateProductListStructuredData(
        productsData.products.map(p => ({
          name: p.name,
          url: `${baseUrl}/shop/${p.slug}`,
        })),
        `${category.name} Products`
      )
    : null;

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {productListData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListData) }}
        />
      )}

      <CategoryPageClient
        category={category}
        initialProducts={productsData}
        categories={categories}
        initialSearchParams={resolvedSearchParams}
      />
    </>
  );
}
