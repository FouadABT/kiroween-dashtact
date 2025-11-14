'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CustomPage, PageStatus } from '@/types/pages';
import { Loader2, X } from 'lucide-react';

interface ParentPageSelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  excludePageId?: string;
}

interface PageHierarchyNode {
  id: string;
  title: string;
  slug: string;
  level: number;
  children: PageHierarchyNode[];
}

export function ParentPageSelector({ value, onChange, excludePageId }: ParentPageSelectorProps) {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState<PageHierarchyNode[]>([]);

  useEffect(() => {
    loadPages();
  }, [excludePageId]);

  const loadPages = async () => {
    try {
      // Fetch all pages without status filter (includes PUBLISHED, DRAFT, and ARCHIVED)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pages/admin`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load pages');
      }

      const data = await response.json();
      let availablePages = data.pages || [];

      // Exclude current page and its descendants
      if (excludePageId) {
        availablePages = filterExcludedPages(availablePages, excludePageId);
      }

      setPages(availablePages);
      setHierarchy(buildHierarchy(availablePages));
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out the current page and its descendants to prevent circular references
  const filterExcludedPages = (pages: CustomPage[], excludeId: string): CustomPage[] => {
    const excludedIds = new Set<string>([excludeId]);

    // Find all descendants of the excluded page
    const findDescendants = (parentId: string) => {
      pages.forEach(page => {
        if (page.parentPageId === parentId && !excludedIds.has(page.id)) {
          excludedIds.add(page.id);
          findDescendants(page.id);
        }
      });
    };

    findDescendants(excludeId);

    // Filter out excluded pages
    return pages.filter(page => !excludedIds.has(page.id));
  };

  // Build hierarchical structure for display
  const buildHierarchy = (pages: CustomPage[], parentId: string | null = null, level: number = 0): PageHierarchyNode[] => {
    return pages
      .filter(page => page.parentPageId === parentId)
      .map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        level,
        children: buildHierarchy(pages, page.id, level + 1),
      }));
  };

  // Flatten hierarchy for select options
  const flattenHierarchy = (nodes: PageHierarchyNode[]): PageHierarchyNode[] => {
    const result: PageHierarchyNode[] = [];
    
    const flatten = (nodes: PageHierarchyNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children.length > 0) {
          flatten(node.children);
        }
      });
    };

    flatten(nodes);
    return result;
  };

  const flatPages = flattenHierarchy(hierarchy);

  const handleClear = () => {
    onChange(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Parent Page (Optional)</Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading pages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="parentPage">Parent Page (Optional)</Label>
      <div className="flex gap-2">
        <Select value={value || 'none'} onValueChange={(val) => onChange(val === 'none' ? undefined : val)}>
          <SelectTrigger id="parentPage" className="flex-1">
            <SelectValue placeholder="Select a parent page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent (top-level page)</SelectItem>
            {flatPages.map(page => (
              <SelectItem key={page.id} value={page.id}>
                <span style={{ paddingLeft: `${page.level * 16}px` }}>
                  {page.level > 0 && '└─ '}
                  {page.title}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            title="Clear parent page"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {value
          ? 'This page will be nested under the selected parent page'
          : 'Leave empty to create a top-level page'
        }
      </p>
      {pages.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No other pages available. Create more pages to build a hierarchy.
        </p>
      )}
    </div>
  );
}
