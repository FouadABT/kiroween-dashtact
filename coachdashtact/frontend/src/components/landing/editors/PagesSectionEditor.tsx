'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PagesSectionData, CustomPage } from '@/types/landing-page';

interface PagesSectionEditorProps {
  data: PagesSectionData;
  onSave: (data: PagesSectionData) => void;
  onClose: () => void;
}

export function PagesSectionEditor({
  data,
  onSave,
  onClose,
}: PagesSectionEditorProps) {
  const [formData, setFormData] = useState<PagesSectionData>(data);
  const [parentPages, setParentPages] = useState<CustomPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  // Fetch parent pages
  useEffect(() => {
    async function fetchParentPages() {
      try {
        setIsLoadingPages(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages`);
        if (response.ok) {
          const result = await response.json();
          setParentPages(Array.isArray(result) ? result : result.data || []);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setIsLoadingPages(false);
      }
    }

    fetchParentPages();
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
            placeholder="Featured Pages"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle (Optional)</Label>
          <Textarea
            id="subtitle"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Explore our content"
            rows={2}
          />
        </div>

        {/* Layout and Columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={formData.layout}
              onValueChange={(value: 'grid' | 'cards' | 'list') =>
                setFormData({ ...formData, layout: value })
              }
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="cards">Cards</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="columns">Columns (Grid/Cards Layout)</Label>
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

        {/* Page Count */}
        <div className="space-y-2">
          <Label htmlFor="pageCount">Number of Pages</Label>
          <Select
            value={formData.pageCount.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, pageCount: parseInt(value) as 3 | 6 | 9 | 12 })
            }
          >
            <SelectTrigger id="pageCount">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Pages</SelectItem>
              <SelectItem value="6">6 Pages</SelectItem>
              <SelectItem value="9">9 Pages</SelectItem>
              <SelectItem value="12">12 Pages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-sm">Filters</h4>
          
          <div className="space-y-2">
            <Label htmlFor="filterByParent">Filter by Parent Page</Label>
            <Select
              value={formData.filterByParent || 'all'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  filterByParent: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="filterByParent">
                <SelectValue placeholder={isLoadingPages ? 'Loading...' : 'All Pages'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                {parentPages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.title}
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

          <div className="flex items-center justify-between">
            <Label htmlFor="showImage" className="cursor-pointer">
              Show Featured Image
            </Label>
            <Switch
              id="showImage"
              checked={formData.showImage}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showImage: checked })
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
              placeholder="View All Pages"
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
