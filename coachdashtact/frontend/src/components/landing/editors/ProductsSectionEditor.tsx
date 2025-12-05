'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ProductsSectionData } from '@/types/landing-page';

interface ProductsSectionEditorProps {
  data: ProductsSectionData;
  onSave: (data: ProductsSectionData) => void;
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
}

export function ProductsSectionEditor({
  data,
  onSave,
  onClose,
}: ProductsSectionEditorProps) {
  const [formData, setFormData] = useState<ProductsSectionData>(data);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoadingCategories(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`);
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/tags`);
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
            placeholder="Featured Products"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle (Optional)</Label>
          <Textarea
            id="subtitle"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Discover our best-selling products"
            rows={2}
          />
        </div>

        {/* Layout and Columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={formData.layout}
              onValueChange={(value: 'grid' | 'carousel' | 'featured') =>
                setFormData({ ...formData, layout: value })
              }
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
                <SelectItem value="featured">Featured (Large First)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="columns">Columns (Grid/Featured)</Label>
            <Select
              value={(formData.columns || 3).toString()}
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

        {/* Product Count */}
        <div className="space-y-2">
          <Label htmlFor="productCount">Number of Products</Label>
          <Select
            value={(formData.productCount || 6).toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, productCount: parseInt(value) as 3 | 6 | 9 | 12 })
            }
          >
            <SelectTrigger id="productCount">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Products</SelectItem>
              <SelectItem value="6">6 Products</SelectItem>
              <SelectItem value="9">9 Products</SelectItem>
              <SelectItem value="12">12 Products</SelectItem>
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
            <Label htmlFor="showPrice" className="cursor-pointer">
              Show Price
            </Label>
            <Switch
              id="showPrice"
              checked={formData.showPrice}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showPrice: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showRating" className="cursor-pointer">
              Show Rating
            </Label>
            <Switch
              id="showRating"
              checked={formData.showRating}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showRating: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showStock" className="cursor-pointer">
              Show Stock Status
            </Label>
            <Switch
              id="showStock"
              checked={formData.showStock}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showStock: checked })
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
              placeholder="Add to Cart"
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
