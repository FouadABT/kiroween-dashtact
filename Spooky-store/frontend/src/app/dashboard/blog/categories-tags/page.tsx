import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryManagement } from '@/components/blog/CategoryManagement';
import { TagManagement } from '@/components/blog/TagManagement';

/**
 * Blog Categories and Tags Management Page
 * 
 * Page for managing blog categories and tags.
 * Requires blog:write permission.
 */

export const metadata: Metadata = generatePageMetadata('/dashboard/blog/categories-tags');

export default function CategoriesTagsPage() {
  return (
    <PermissionGuard permission="blog:write">
      <div className="space-y-6">
        <PageHeader
          title="Categories & Tags"
          description="Manage blog post categories and tags"
        />

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="tags">
            <TagManagement />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
