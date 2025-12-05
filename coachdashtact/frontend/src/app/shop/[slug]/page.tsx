import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StorefrontApi } from '@/lib/api';
import { ProductDetailClient } from './ProductDetailClient';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { generateProductStructuredData, generateBreadcrumbStructuredData } from '@/lib/structured-data-helpers';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Enable ISR with 5 minute revalidation for product pages
export const revalidate = 300;

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const product = await StorefrontApi.getProductBySlug(slug);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Determine availability
    let availability: 'InStock' | 'OutOfStock' = 'InStock';
    if (product.variants && product.variants.length > 0) {
      const hasStock = product.variants.some((v: any) => v.inventory && v.inventory.available > 0);
      availability = hasStock ? 'InStock' : 'OutOfStock';
    }
    
    return {
      title: product.metaTitle || `${product.name} - Product Details`,
      description: product.metaDescription || product.shortDescription || product.description || `Buy ${product.name} online. ${product.shortDescription || ''}`,
      keywords: [product.name, 'shop', 'buy', 'product'],
      openGraph: {
        title: product.name,
        description: product.shortDescription || product.description || '',
        images: product.featuredImage ? [product.featuredImage] : product.images,
        type: 'website',
        url: `${baseUrl}/shop/${product.slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.shortDescription || product.description || '',
        images: product.featuredImage ? [product.featuredImage] : product.images,
      },
      alternates: {
        canonical: `${baseUrl}/shop/${product.slug}`,
      },
    };
  } catch (error) {
    return generatePageMetadata('/shop/:slug', { productName: slug });
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  try {
    const product = await StorefrontApi.getProductBySlug(slug);
    
    // Fetch related products
    const relatedProducts = await StorefrontApi.getRelatedProducts(product.id, 6);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Determine availability
    let availability: 'InStock' | 'OutOfStock' = 'InStock';
    if (product.variants && product.variants.length > 0) {
      const hasStock = product.variants.some((v: any) => v.inventory && v.inventory.available > 0);
      availability = hasStock ? 'InStock' : 'OutOfStock';
    }
    
    // Generate product structured data
    const productData = generateProductStructuredData({
      name: product.name,
      description: product.shortDescription || product.description || '',
      image: product.featuredImage ? [product.featuredImage, ...product.images] : product.images,
      brand: 'Your Store', // TODO: Make this configurable from settings
      price: parseFloat(product.basePrice.toString()),
      priceCurrency: 'USD', // TODO: Make this configurable from settings
      availability,
      url: `${baseUrl}/shop/${product.slug}`,
    });
    
    // Generate breadcrumb structured data
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '/shop' },
      { label: product.name, href: `/shop/${product.slug}` },
    ];
    const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbs);
    
    return (
      <>
        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        
        {/* Client Component */}
        <ProductDetailClient product={product} relatedProducts={relatedProducts} />
      </>
    );
  } catch (error) {
    notFound();
  }
}
