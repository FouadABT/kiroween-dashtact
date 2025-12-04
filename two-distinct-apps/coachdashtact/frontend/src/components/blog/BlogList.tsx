'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogCard } from './BlogCard';
import { BlogPagination } from './BlogPagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BlogPost, BlogPostListResponse, BlogCategory, BlogTag } from '@/types/blog';
import { featuresConfig } from '@/config/features.config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * Blog List Component
 * 
 * Displays a list of blog posts with pagination and filtering.
 * Fetches published posts from the API and renders them in a grid layout.
 * 
 * Features:
 * - Filter by category
 * - Filter by tag
 * - Pagination
 * - Responsive grid layout
 * 
 * @param page - Current page number (1-indexed)
 */

interface BlogListProps {
  page: number;
}

export function BlogList({ page }: BlogListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<BlogPostListResponse | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get filter values from URL
  const categoryFilter = searchParams.get('category') || '';
  const tagFilter = searchParams.get('tag') || '';

  /**
   * Fetch categories and tags
   */
  useEffect(() => {
    async function fetchFilters() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        if (featuresConfig.blog.enableCategories) {
          const categoriesResponse = await fetch(`${apiUrl}/blog/categories/all`);
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData);
          }
        }

        if (featuresConfig.blog.enableTags) {
          const tagsResponse = await fetch(`${apiUrl}/blog/tags/all`);
          if (tagsResponse.ok) {
            const tagsData = await tagsResponse.json();
            setTags(tagsData);
          }
        }
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    }

    fetchFilters();
  }, []);

  /**
   * Fetch blog posts
   */
  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const limit = featuresConfig.blog.postsPerPage;
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (categoryFilter) {
          params.append('category', categoryFilter);
        }

        if (tagFilter) {
          params.append('tag', tagFilter);
        }

        const response = await fetch(`${apiUrl}/blog?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [page, categoryFilter, tagFilter]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (type: 'category' | 'tag', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    
    // Reset to page 1 when filter changes
    params.delete('page');
    
    router.push(`/blog?${params.toString()}`);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    router.push('/blog');
  };

  const hasActiveFilters = categoryFilter || tagFilter;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg
              className="h-12 w-12 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Failed to Load Blog Posts</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      {(featuresConfig.blog.enableCategories || featuresConfig.blog.enableTags) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Category Filter */}
          {featuresConfig.blog.enableCategories && categories.length > 0 && (
            <div className="w-full sm:w-auto">
              <Select
                value={categoryFilter}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name} ({category._count?.posts || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tag Filter */}
          {featuresConfig.blog.enableTags && tags.length > 0 && (
            <div className="w-full sm:w-auto">
              <Select
                value={tagFilter}
                onValueChange={(value) => handleFilterChange('tag', value)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tags</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.slug}>
                      {tag.name} ({tag._count?.posts || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {categoryFilter && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Category: {categories.find(c => c.slug === categoryFilter)?.name || categoryFilter}
            </div>
          )}
          {tagFilter && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Tag: {tags.find(t => t.slug === tagFilter)?.name || tagFilter}
            </div>
          )}
        </div>
      )}

      {/* Blog Posts Grid */}
      {!data || data.posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? 'No blog posts found matching your filters'
              : 'No blog posts found'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post, index) => (
              <BlogCard 
                key={post.id} 
                post={post} 
                priority={index < 3} // Priority load first 3 images
              />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <BlogPagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          )}
        </>
      )}
    </div>
  );
}
