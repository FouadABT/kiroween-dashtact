import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ProductEditor } from '@/components/products/ProductEditor';
import { getProduct } from '@/lib/api';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const product = await getProduct(id);
    return {
      title: `Edit ${product.name} | E-Commerce`,
      description: `Edit product: ${product.name}`,
    };
  } catch {
    return {
      title: 'Edit Product | E-Commerce',
      description: 'Edit product',
    };
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  
  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    notFound();
  }

  return (
    <PermissionGuard permission="products:write">
      <div className="container mx-auto py-6">
        <ProductEditor mode="edit" product={product} />
      </div>
    </PermissionGuard>
  );
}
