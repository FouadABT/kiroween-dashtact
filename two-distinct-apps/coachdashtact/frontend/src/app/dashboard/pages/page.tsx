import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { PagesList } from '@/components/pages/PagesList';

export const metadata: Metadata = generatePageMetadata('/dashboard/pages');

export default function PagesPage() {
  return (
    <PermissionGuard permission="pages:read">
      <div className="space-y-6">
        <PageHeader
          title="Pages"
          description="Manage custom pages and content"
        />
        <PagesList />
      </div>
    </PermissionGuard>
  );
}
