import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductEditor } from '@/components/products/ProductEditor';

export const metadata: Metadata = generatePageMetadata('/dashboard/ecommerce/products/new');

export default function NewProductPage() {
  return (
    <PermissionGuard permission="products:write">
      <div className="space-y-6">
        <PageHeader
          title="Create Product"
          description="Add a new product to your catalog"
        />
        <ProductEditor mode="create" />
      </div>
    </PermissionGuard>
  );
}
