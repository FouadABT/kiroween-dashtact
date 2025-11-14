import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { BlogManagement } from '@/components/blog';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = generatePageMetadata('/dashboard/blog');

/**
 * Blog Management Page
 * 
 * Dashboard page for managing blog posts with CRUD operations.
 * Requires blog:read permission to access.
 * 
 * Features:
 * - List all blog posts (drafts and published)
 * - Create new blog posts
 * - Edit existing blog posts
 * - Delete blog posts
 * - Publish/unpublish blog posts
 * - Filter by status, category, and tags
 * - Search blog posts
 */
export default function BlogManagementPage() {
  return (
    <PermissionGuard permission="blog:read">
      <div className="space-y-6">
        <PageHeader
          title="Blog Management"
          description="Create and manage blog posts"
        />
        <BlogManagement />
      </div>
    </PermissionGuard>
  );
}
