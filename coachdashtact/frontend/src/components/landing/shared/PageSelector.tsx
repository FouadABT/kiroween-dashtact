/**
 * Page Selector Component
 * 
 * Dropdown to select published pages for CTA buttons and footer nav links.
 * Shows page hierarchy in dropdown.
 */

'use client';

import { useState, useEffect } from 'react';
import { PagesApi } from '@/lib/api';
import { CustomPage } from '@/types/pages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface PageSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PageSelector({
  value,
  onChange,
  placeholder = 'Select a page',
  disabled = false,
}: PageSelectorProps) {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPages() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await PagesApi.getAllPublic({
          status: 'PUBLISHED' as any,
          visibility: 'PUBLIC' as any,
          sortBy: 'displayOrder',
          sortOrder: 'asc',
        });
        
        setPages(response.data);
      } catch (err) {
        console.error('Failed to fetch pages:', err);
        setError('Failed to load pages');
        setPages([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPages();
  }, []);

  // Build page hierarchy display
  const getPageLabel = (page: CustomPage): string => {
    // If page has a parent, show hierarchy
    if (page.parentPageId) {
      const parent = pages.find(p => p.id === page.parentPageId);
      if (parent) {
        return `${parent.title} > ${page.title}`;
      }
    }
    return page.title;
  };

  // Group pages by hierarchy
  const topLevelPages = pages.filter(p => !p.parentPageId);
  const childPages = pages.filter(p => p.parentPageId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-background">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading pages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 border border-destructive rounded-md bg-destructive/10">
        <span className="text-sm text-destructive">{error}</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {pages.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No published pages available
          </div>
        ) : (
          <>
            {/* Top-level pages */}
            {topLevelPages.map((page) => (
              <SelectItem key={page.id} value={page.slug}>
                {page.title}
              </SelectItem>
            ))}
            
            {/* Child pages with hierarchy */}
            {childPages.length > 0 && topLevelPages.length > 0 && (
              <div className="border-t border-border my-1" />
            )}
            
            {childPages.map((page) => (
              <SelectItem key={page.id} value={page.slug}>
                <span className="pl-4">{getPageLabel(page)}</span>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
