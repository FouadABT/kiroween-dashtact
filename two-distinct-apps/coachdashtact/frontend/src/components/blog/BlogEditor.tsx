'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { BlogPost, PostStatus, BlogCategory, BlogTag, CreateBlogPostDto, UpdateBlogPostDto } from '@/types/blog';
import { BlogContentEditor } from '@/components/blog/BlogContentEditor';
import { SlugInput } from '@/components/blog/SlugInput';
import { BlogImageUpload } from '@/components/blog/BlogImageUpload';
import { featuresConfig } from '@/config/features.config';
import { Save, Eye } from 'lucide-react';
import { generateExcerpt } from '@/lib/excerpt-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BlogEditorProps {
  post?: BlogPost;
  mode?: 'create' | 'edit';
}

/**
 * BlogEditor Component
 * 
 * Form component for creating and editing blog posts.
 * 
 * Features:
 * - Title, excerpt, and content inputs
 * - Featured image upload integration
 * - Optional author fields (name, email) based on NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR
 * - Category and tag selection (conditional on feature flags)
 * - Save draft and publish buttons
 * - Auto-save draft functionality (future enhancement)
 * - Form validation
 * 
 * @param post - Existing blog post to edit (optional)
 * @param mode - Editor mode ('create' or 'edit')
 */
export function BlogEditor({ post, mode = 'create' }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featuredImage: post?.featuredImage || '',
    status: post?.status || PostStatus.DRAFT,
    authorName: post?.authorName || '',
    authorEmail: post?.authorEmail || '',
    metaTitle: post?.metaTitle || '',
    metaDescription: post?.metaDescription || '',
    categoryIds: post?.categories?.map(c => c.id) || [],
    tagIds: post?.tags?.map(t => t.id) || [],
  });

  // Show author fields based on config
  const [showAuthorFields, setShowAuthorFields] = useState(
    featuresConfig.blog.requireAuthor || !!post?.authorName
  );

  // Auto-save state
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  /**
   * Fetch categories and tags
   */
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        if (featuresConfig.blog.enableCategories) {
          const categoriesResponse = await fetch(`${API_BASE_URL}/blog/categories/all`);
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData);
          }
        }

        if (featuresConfig.blog.enableTags) {
          const tagsResponse = await fetch(`${API_BASE_URL}/blog/tags/all`);
          if (tagsResponse.ok) {
            const tagsData = await tagsResponse.json();
            setTags(tagsData);
          }
        }
      } catch (error) {
        console.error('Error fetching categories and tags:', error);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  /**
   * Auto-save draft functionality
   * Saves draft every 30 seconds if content has changed
   */
  useEffect(() => {
    // Only auto-save for existing posts in edit mode
    if (mode !== 'edit' || !post) return;

    const autoSaveInterval = setInterval(async () => {
      // Check if content has changed
      const hasChanges = 
        formData.title !== post.title ||
        formData.content !== post.content ||
        formData.excerpt !== post.excerpt;

      if (hasChanges && formData.title && formData.content) {
        try {
          setAutoSaving(true);
          
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`${API_BASE_URL}/blog/${post.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: formData.title,
              content: formData.content,
              excerpt: formData.excerpt,
              status: PostStatus.DRAFT, // Always save as draft for auto-save
            }),
          });

          if (response.ok) {
            setLastSaved(new Date());
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [mode, post, formData.title, formData.content, formData.excerpt]);

  /**
   * Handle form field changes
   */
  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (publishNow: boolean = false) => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    if (featuresConfig.blog.requireAuthor && !formData.authorName.trim()) {
      toast.error('Author name is required');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('accessToken');
      const endpoint = mode === 'edit' && post 
        ? `${API_BASE_URL}/blog/${post.id}` 
        : `${API_BASE_URL}/blog`;
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      // Prepare data
      const data: CreateBlogPostDto | UpdateBlogPostDto = {
        title: formData.title,
        slug: formData.slug || undefined,
        excerpt: formData.excerpt || undefined,
        content: formData.content,
        featuredImage: formData.featuredImage || undefined,
        status: publishNow ? PostStatus.PUBLISHED : formData.status,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
      };

      // Add author fields if shown (only for create mode)
      if (showAuthorFields && mode === 'create') {
        // Type assertion needed as DTO doesn't include author fields
        const createData = data as CreateBlogPostDto & { authorName?: string; authorEmail?: string };
        createData.authorName = formData.authorName || undefined;
        createData.authorEmail = formData.authorEmail || undefined;
      }

      // Add categories and tags if enabled
      if (featuresConfig.blog.enableCategories && formData.categoryIds.length > 0) {
        data.categoryIds = formData.categoryIds;
      }

      if (featuresConfig.blog.enableTags && formData.tagIds.length > 0) {
        data.tagIds = formData.tagIds;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save blog post');
      }

      await response.json();

      toast.success(`Blog post ${publishNow ? 'published' : 'saved'} successfully`);

      // Redirect to blog management
      router.push('/dashboard/blog');
      router.refresh();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      {mode === 'edit' && (
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          {autoSaving ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              Saving draft...
            </span>
          ) : lastSaved ? (
            <span>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter blog post title"
          required
        />
      </div>

      {/* Slug - Enhanced with validation and preview */}
      <SlugInput
        value={formData.slug}
        onChange={(slug) => handleChange('slug', slug)}
        title={formData.title}
        postId={post?.id}
        disabled={loading}
      />

      {/* Excerpt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="excerpt">Excerpt</Label>
          {!formData.excerpt && formData.content && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const autoExcerpt = generateExcerpt(formData.content, 200);
                handleChange('excerpt', autoExcerpt);
              }}
            >
              Generate from content
            </Button>
          )}
        </div>
        <textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleChange('excerpt', e.target.value)}
          placeholder="Brief summary of the blog post (leave empty to auto-generate from content)"
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {formData.excerpt 
              ? 'Custom excerpt (will be used as-is)' 
              : 'Auto-generated from content when saved'}
          </span>
          <span>{formData.excerpt.length}/500 characters</span>
        </div>
        {!formData.excerpt && formData.content && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Preview (auto-generated):</p>
            <p className="text-sm text-muted-foreground italic">
              {generateExcerpt(formData.content, 200)}
            </p>
          </div>
        )}
      </div>

      {/* Featured Image - Enhanced with upload functionality */}
      <BlogImageUpload
        value={formData.featuredImage}
        onChange={(url) => handleChange('featuredImage', url)}
        label="Featured Image"
        disabled={loading}
      />

      {/* Author Fields Toggle */}
      {!featuresConfig.blog.requireAuthor && (
        <div className="flex items-center space-x-2">
          <Switch
            id="show-author"
            checked={showAuthorFields}
            onCheckedChange={setShowAuthorFields}
          />
          <Label htmlFor="show-author">Add author information</Label>
        </div>
      )}

      {/* Author Fields */}
      {showAuthorFields && (
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Author Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="authorName">
              Author Name {featuresConfig.blog.requireAuthor && '*'}
            </Label>
            <Input
              id="authorName"
              value={formData.authorName}
              onChange={(e) => handleChange('authorName', e.target.value)}
              placeholder="Enter author name"
              required={featuresConfig.blog.requireAuthor}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorEmail">Author Email</Label>
            <Input
              id="authorEmail"
              type="email"
              value={formData.authorEmail}
              onChange={(e) => handleChange('authorEmail', e.target.value)}
              placeholder="author@example.com"
            />
          </div>
        </div>
      )}

      {/* Categories */}
      {featuresConfig.blog.enableCategories && categories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="categories">Categories</Label>
          <Select
            value={formData.categoryIds[0] || ''}
            onValueChange={(value) => handleChange('categoryIds', value ? [value] : [])}
          >
            <SelectTrigger id="categories">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tags */}
      {featuresConfig.blog.enableTags && tags.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Select
            value={formData.tagIds[0] || ''}
            onValueChange={(value) => handleChange('tagIds', value ? [value] : [])}
          >
            <SelectTrigger id="tags">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content - Rich Text Editor with Image Upload */}
      <BlogContentEditor
        value={formData.content}
        onChange={(content) => handleChange('content', content)}
        label="Content"
        placeholder="Write your blog post content here..."
        required
      />

      {/* SEO Metadata */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-medium">SEO Metadata (Optional)</h3>
        
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => handleChange('metaTitle', e.target.value)}
            placeholder="Custom title for search engines"
            maxLength={60}
          />
          <p className="text-sm text-muted-foreground">
            {formData.metaTitle.length}/60 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            placeholder="Custom description for search engines"
            rows={3}
            maxLength={160}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-sm text-muted-foreground">
            {formData.metaDescription.length}/160 characters
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={loading}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Draft'}
        </Button>

        <Button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={loading}
        >
          <Eye className="h-4 w-4 mr-2" />
          {loading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
