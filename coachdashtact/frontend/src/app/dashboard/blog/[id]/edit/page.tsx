'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { PageHeader } from '@/components/layout/PageHeader';
import { BlogPost } from '@/types/blog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Edit Blog Post Page
 * 
 * Page for editing an existing blog post.
 * Requires blog:write permission to access.
 */
export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/blog/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog post not found');
          } else {
            throw new Error('Failed to fetch blog post');
          }
          return;
        }

        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <PermissionGuard permission="blog:write">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  if (error || !post) {
    return (
      <PermissionGuard permission="blog:write">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error || 'Blog post not found'}</p>
          <button
            onClick={() => router.push('/dashboard/blog')}
            className="text-primary hover:underline"
          >
            Back to Blog Management
          </button>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="blog:write">
      <div className="space-y-6">
        <PageHeader
          title="Edit Blog Post"
          description="Update your blog post"
        />
        <div className="max-w-4xl">
          <BlogEditor post={post} mode="edit" />
        </div>
      </div>
    </PermissionGuard>
  );
}
