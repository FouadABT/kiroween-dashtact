import { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Create Blog Post - Blog Management',
  description: 'Create a new blog post',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Create Blog Post Page
 * 
 * Page for creating a new blog post.
 * Requires blog:write permission to access.
 */
export default function CreateBlogPostPage() {
  return (
    <PermissionGuard permission="blog:write">
      <div className="space-y-6">
        <PageHeader
          title="Create Blog Post"
          description="Write and publish a new blog post"
        />
        <div className="max-w-4xl">
          <BlogEditor mode="create" />
        </div>
      </div>
    </PermissionGuard>
  );
}
