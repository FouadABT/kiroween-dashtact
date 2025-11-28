'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { BlogPostsSectionData } from '@/types/landing-page';

interface BlogPostsSectionEditorProps {
  data: BlogPostsSectionData;
  onSave: (data: BlogPostsSectionData) => void;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export function BlogPostsSectionEditor({
  data,
  onSave,
  onClose,
}: BlogPostsSectionEditorProps) {
  const [formData, setFormData] = useState<BlogPostsSectionData>(data);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoadingCategories(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/categories`);
        if (response.ok) {
          const result = await response.json();
          setCategories(Array.isArray(result) ? result : result.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  // Fetch tags
  useEffect(() => {
    async function fetchTags() {
      try {
        setIsLoadingTags(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/tags`);
        if (response.ok) {
          const result = await response.json();
          setTags(Array.isArray(result) ? result : result.data || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoadingTags(false);
      }
    }

    fetchTags();
  }, []);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Section Title (Optional)</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Recent Blog Posts"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle (Optional)</Label>
          <Textarea
            id="subtitle"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Check out our latest articles"
            rows={2}
          />
        </div>

        {/* Layout and Columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={formData.layout}
              onValueChange={(value: 'grid' | 'list' | 'carousel') =>
                setFormData({ ...formData, layout: value })
              }
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="columns">Columns (Grid Layout)</Label>
            <Select
              value={formData.columns.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, columns: parseInt(value) as 2 | 3 | 4 })
              }
            >
              <SelectTrigger id="columns">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Post Count */}
        <div className="space-y-2">
          <Label htmlFor="postCount">Number of Posts</Label>
          <Select
            value={formData.postCount.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, postCount: parseInt(value) as 3 | 6 | 9 | 12 })
            }
          >
            <SelectTrigger id="postCount">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Posts</SelectItem>
              <SelectItem value="6">6 Posts</SelectItem>
              <SelectItem value="9">9 Posts</SelectItem>
              <SelectItem value="12">12 Posts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-sm">Filters</h4>
          
          <div className="space-y-2">
            <Label htmlFor="filterByCategory">Filter by Category</Label>
            <Select
              value={formData.filterByCategory || 'all'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  filterByCategory: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="filterByCategory">
                <SelectValue placeholder={isLoadingCategories ? 'Loading...' : 'All Categories'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filterByTag">Filter by Tag</Label>
            <Select
              value={formData.filterByTag || 'all'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  filterByTag: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="filterByTag">
                <SelectValue placeholder={isLoadingTags ? 'Loading...' : 'All Tags'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-sm">Display Options</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showAuthor" className="cursor-pointer">
              Show Author
            </Label>
            <Switch
              id="showAuthor"
              checked={formData.showAuthor}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showAuthor: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showDate" className="cursor-pointer">
              Show Date
            </Label>
            <Switch
              id="showDate"
              checked={formData.showDate}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showDate: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showCategories" className="cursor-pointer">
              Show Categories
            </Label>
            <Switch
              id="showCategories"
              checked={formData.showCategories}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showCategories: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showExcerpt" className="cursor-pointer">
              Show Excerpt
            </Label>
            <Switch
              id="showExcerpt"
              checked={formData.showExcerpt}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showExcerpt: checked })
              }
            />
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-sm">Call to Action</h4>
          
          <div className="space-y-2">
            <Label htmlFor="ctaText">Button Text</Label>
            <Input
              id="ctaText"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              placeholder="View All Posts"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaLink">Button Link</Label>
            <Input
              id="ctaLink"
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              placeholder="/blog"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
