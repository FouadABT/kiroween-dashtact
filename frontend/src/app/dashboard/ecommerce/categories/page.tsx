import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PageHeader } from '@/components/layout/PageHeader';
import CategoriesPageClient from './CategoriesPageClient';

export const metadata: Metadata = generatePageMetadata('/dashboard/ecommerce/categories');

export default function CategoriesPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'E-Commerce', href: '/dashboard/ecommerce' },
    { label: 'Categories', href: '/dashboard/ecommerce/categories' },
  ];

  return (
    <div>
      <PageHeader
        title="Product Categories"
        description="Manage product categories"
        breadcrumbProps={{
          customItems: breadcrumbs,
        }}
      />
      <CategoriesPageClient />
    </div>
  );
}
