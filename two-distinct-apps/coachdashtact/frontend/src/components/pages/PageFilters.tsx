'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PageStatus, PageVisibility } from '@/types/pages';
import type { PageQueryDto, CustomPage } from '@/types/pages';
import { PagesApi } from '@/lib/api';

interface PageFiltersProps {
  filters: PageQueryDto;
  onFilterChange: (filters: Partial<PageQueryDto>) => void;
}

export function PageFilters({ filters, onFilterChange }: PageFiltersProps) {
  const [parentPages, setParentPages] = useState<CustomPage[]>([]);
  const hasFetchedRef = useRef(false);

  // Fetch parent pages only once on mount
  useEffect(() => {
    console.log('[PageFilters] useEffect triggered, hasFetched:', hasFetchedRef.current);
    
    if (hasFetchedRef.current) {
      console.log('[PageFilters] Already fetched, skipping');
      return;
    }
    
    hasFetchedRef.current = true;
    console.log('[PageFilters] ===== MAKING API CALL FOR PARENT PAGES =====');
    
    const fetchParentPages = async () => {
      try {
        const response = await PagesApi.getAll({ status: PageStatus.PUBLISHED, limit: 50 });
        console.log('[PageFilters] Received', response.data.length, 'parent pages');
        setParentPages(response.data);
      } catch (error) {
        console.error('Failed to fetch parent pages:', error);
      }
    };

    fetchParentPages();
  }, []);

  // Calculate active filters count (memoized calculation, no state update)
  const activeFiltersCount = (() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.visibility) count++;
    if (filters.parentPageId) count++;
    if (filters.sortBy && filters.sortBy !== 'updatedAt') count++;
    return count;
  })();

  const handleClearFilters = () => {
    onFilterChange({
      status: undefined,
      visibility: undefined,
      parentPageId: undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFilterChange({ status: value === 'all' ? undefined : (value as PageStatus) })
            }
          >
            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="DRAFT">Draft</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="PUBLISHED">Published</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="ARCHIVED">Archived</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Filter by Visibility</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filters.visibility || 'all'}
            onValueChange={(value) =>
              onFilterChange({ visibility: value === 'all' ? undefined : (value as PageVisibility) })
            }
          >
            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="PUBLIC">Public</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="PRIVATE">Private</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Filter by Parent</DropdownMenuLabel>
          <div className="px-2 py-1.5">
            <Select
              value={filters.parentPageId || 'all'}
              onValueChange={(value) =>
                onFilterChange({ parentPageId: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pages</SelectItem>
                <SelectItem value="null">Top-level only</SelectItem>
                {parentPages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeFiltersCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleClearFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Select
        value={`${filters.sortBy || 'updatedAt'}-${filters.sortOrder || 'desc'}`}
        onValueChange={(value) => {
          const [sortBy, sortOrder] = value.split('-');
          onFilterChange({ 
            sortBy: sortBy as 'createdAt' | 'updatedAt' | 'title' | 'displayOrder', 
            sortOrder: sortOrder as 'asc' | 'desc' 
          });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
          <SelectItem value="updatedAt-asc">Oldest Updated</SelectItem>
          <SelectItem value="createdAt-desc">Recently Created</SelectItem>
          <SelectItem value="createdAt-asc">Oldest Created</SelectItem>
          <SelectItem value="title-asc">Title (A-Z)</SelectItem>
          <SelectItem value="title-desc">Title (Z-A)</SelectItem>
          <SelectItem value="displayOrder-asc">Display Order</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
