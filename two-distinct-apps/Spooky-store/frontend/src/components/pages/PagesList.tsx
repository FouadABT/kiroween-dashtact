'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List as ListIcon } from 'lucide-react';
import { PageCard } from './PageCard';
import { PageFilters } from './PageFilters';
import { PageSearch } from './PageSearch';
import { BulkActions } from './BulkActions';
import { PageHierarchyView } from './PageHierarchyView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { PagesApi } from '@/lib/api';
import { PageStatus } from '@/types/pages';
import type { CustomPage, PageQueryDto } from '@/types/pages';

export function PagesList() {
  const router = useRouter();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'hierarchy'>('grid');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<PageQueryDto>({
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    // Don't include search in initial state
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const fetchingRef = useRef(false);

  useEffect(() => {
    console.log('[PagesList] useEffect triggered');
    console.log('[PagesList] fetchingRef.current:', fetchingRef.current);
    console.log('[PagesList] filters:', JSON.stringify(filters));
    
    if (fetchingRef.current) {
      console.log('[PagesList] Already fetching, skipping');
      return;
    }

    const fetchPages = async () => {
      fetchingRef.current = true;
      console.log('[PagesList] ===== MAKING API CALL =====');
      console.log('[PagesList] API params:', filters);
      
      try {
        setIsLoading(true);
        const response = await PagesApi.getAll(filters);
        console.log('[PagesList] API response received:', response.data.length, 'pages');
        
        setPages(response.data);
        setTotalCount(response.total);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to fetch pages:', error);
        toast.error('Failed to load pages. Please try again.');
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
        console.log('[PagesList] Fetch complete, reset fetchingRef');
      }
    };

    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.visibility,
    filters.parentPageId,
    filters.showInNavigation,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const response = await PagesApi.getAll(filters);
      
      setPages(response.data);
      setTotalCount(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      toast.error('Failed to load pages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<PageQueryDto>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    setSelectedPages(new Set());
  };

  const handleSearchChange = (search: string) => {
    console.log('[PagesList] handleSearchChange called with:', search);
    console.log('[PagesList] Current filters before update:', filters);
    setFilters((prev) => {
      const newFilters = { ...prev, search, page: 1 };
      console.log('[PagesList] New filters after update:', newFilters);
      return newFilters;
    });
    setSelectedPages(new Set());
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setSelectedPages(new Set());
  };

  const handleSelectPage = (pageId: string, selected: boolean) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(pageId);
      } else {
        newSet.delete(pageId);
      }
      return newSet;
    });
  };



  const refreshPages = () => {
    fetchPages();
  };

  const handleDelete = async (pageId: string) => {
    try {
      await PagesApi.delete(pageId);
      toast.success('Page deleted successfully');
      refreshPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast.error('Failed to delete page. Please try again.');
    }
  };

  const handlePublish = async (pageId: string) => {
    try {
      await PagesApi.publish(pageId);
      toast.success('Page published successfully');
      refreshPages();
    } catch (error) {
      console.error('Failed to publish page:', error);
      toast.error('Failed to publish page. Please try again.');
    }
  };

  const handleUnpublish = async (pageId: string) => {
    try {
      await PagesApi.unpublish(pageId);
      toast.success('Page unpublished successfully');
      refreshPages();
    } catch (error) {
      console.error('Failed to unpublish page:', error);
      toast.error('Failed to unpublish page. Please try again.');
    }
  };

  const handleDuplicate = async (pageId: string) => {
    try {
      const page = pages.find((p) => p.id === pageId);
      if (!page) return;

      const duplicatedPage = {
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy-${Date.now()}`,
        content: page.content,
        excerpt: page.excerpt || undefined,
        featuredImage: page.featuredImage || undefined,
        metaTitle: page.metaTitle || undefined,
        metaDescription: page.metaDescription || undefined,
        status: PageStatus.DRAFT,
        visibility: page.visibility,
        parentPageId: page.parentPageId || undefined,
        displayOrder: page.displayOrder,
      };

      await PagesApi.create(duplicatedPage);
      toast.success('Page duplicated successfully');
      refreshPages();
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      toast.error('Failed to duplicate page. Please try again.');
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    try {
      const pageIds = Array.from(selectedPages);
      
      if (action === 'delete') {
        await Promise.all(pageIds.map((id) => PagesApi.delete(id)));
        toast.success(`${pageIds.length} page(s) deleted successfully`);
      } else if (action === 'publish') {
        await Promise.all(pageIds.map((id) => PagesApi.publish(id)));
        toast.success(`${pageIds.length} page(s) published successfully`);
      } else if (action === 'unpublish') {
        await Promise.all(pageIds.map((id) => PagesApi.unpublish(id)));
        toast.success(`${pageIds.length} page(s) unpublished successfully`);
      }
      
      setSelectedPages(new Set());
      refreshPages();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      toast.error('Failed to perform bulk action. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pages</h2>
          <p className="text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'page' : 'pages'} total
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/pages/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageSearch onSearchChange={handleSearchChange} />
        <div className="flex items-center gap-2">
          <PageFilters filters={filters} onFilterChange={handleFilterChange} />
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPages.size > 0 && (
        <BulkActions
          selectedCount={selectedPages.size}
          onPublish={() => handleBulkAction('publish')}
          onUnpublish={() => handleBulkAction('unpublish')}
          onDelete={() => handleBulkAction('delete')}
          onClear={() => setSelectedPages(new Set())}
        />
      )}

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list' | 'hierarchy')}>
        <TabsList className="hidden">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-0">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pages found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/dashboard/pages/new')}
              >
                Create your first page
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  selected={selectedPages.has(page.id)}
                  onSelect={(selected) => handleSelectPage(page.id, selected)}
                  onEdit={() => router.push(`/dashboard/pages/${page.id}/edit`)}
                  onDelete={() => handleDelete(page.id)}
                  onPublish={() => handlePublish(page.id)}
                  onUnpublish={() => handleUnpublish(page.id)}
                  onDuplicate={() => handleDuplicate(page.id)}
                  onView={() => window.open(`/${page.slug}`, '_blank')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pages found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  viewMode="list"
                  selected={selectedPages.has(page.id)}
                  onSelect={(selected) => handleSelectPage(page.id, selected)}
                  onEdit={() => router.push(`/dashboard/pages/${page.id}/edit`)}
                  onDelete={() => handleDelete(page.id)}
                  onPublish={() => handlePublish(page.id)}
                  onUnpublish={() => handleUnpublish(page.id)}
                  onDuplicate={() => handleDuplicate(page.id)}
                  onView={() => window.open(`/${page.slug}`, '_blank')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-0">
          <PageHierarchyView
            pages={pages}
            onRefresh={fetchPages}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => handlePageChange((filters.page || 1) - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === totalPages}
            onClick={() => handlePageChange((filters.page || 1) + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
