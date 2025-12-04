'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { mediaApi } from '@/lib/api/media';
import { Upload, GetUploadsQuery, UpdateUploadDto, Visibility } from '@/types/media';
import {
  MediaLibraryHeader,
  MediaFilters,
  MediaGrid,
  MediaList,
  MediaPreviewModal,
  MediaEditModal,
  MediaUploadArea,
  BulkActionBar,
} from './components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MediaLibraryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewUpload, setPreviewUpload] = useState<Upload | null>(null);
  const [editUpload, setEditUpload] = useState<Upload | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<GetUploadsQuery>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadUploads();
  }, [filters]);

  const loadUploads = async () => {
    setIsLoading(true);
    try {
      const response = await mediaApi.getUploads(filters);
      setUploads(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load uploads:', error);
      toast.error('Failed to load media files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const result = await mediaApi.uploadFile(file);
      toast.success('File uploaded successfully');
      return { url: result.url };
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      throw error;
    }
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    loadUploads();
  };

  const handleEdit = async (id: string, data: UpdateUploadDto) => {
    try {
      await mediaApi.updateUpload(id, data);
      toast.success('File updated successfully');
      loadUploads();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update file');
      throw error;
    }
  };

  const handleDelete = async (upload: Upload) => {
    try {
      await mediaApi.deleteUpload(upload.id);
      toast.success('File deleted successfully');
      loadUploads();
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(upload.id);
        return next;
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('URL copied to clipboard');
  };

  const handleDownload = (upload: Upload) => {
    const link = document.createElement('a');
    link.href = upload.url;
    link.download = upload.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(uploads.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const result = await mediaApi.bulkDelete(ids);
      toast.success(`${result.deleted} files deleted successfully`);
      setSelectedIds(new Set());
      loadUploads();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error('Failed to delete files');
    }
  };

  const handleBulkVisibilityUpdate = async (visibility: Visibility) => {
    try {
      const ids = Array.from(selectedIds);
      const result = await mediaApi.bulkUpdateVisibility(ids, visibility);
      toast.success(`${result.updated} files updated successfully`);
      setSelectedIds(new Set());
      loadUploads();
    } catch (error) {
      console.error('Bulk visibility update failed:', error);
      toast.error('Failed to update files');
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const totalPages = Math.ceil(total / (filters.limit || 20));
  const currentPage = filters.page || 1;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <MediaLibraryHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUploadClick={() => setShowUploadModal(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <MediaFilters filters={filters} onFiltersChange={setFilters} />
        </aside>

        <main className="lg:col-span-3 space-y-4">
          <BulkActionBar
            selectedCount={selectedIds.size}
            totalCount={uploads.length}
            allSelected={selectedIds.size === uploads.length && uploads.length > 0}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkDelete={handleBulkDelete}
            onBulkVisibilityUpdate={handleBulkVisibilityUpdate}
          />

          {isLoading ? (
            <div className="space-y-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <MediaGrid
              uploads={uploads}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onPreview={setPreviewUpload}
              onEdit={setEditUpload}
              onCopyUrl={handleCopyUrl}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ) : (
            <MediaList
              uploads={uploads}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onPreview={setPreviewUpload}
              onEdit={setEditUpload}
              onCopyUrl={handleCopyUrl}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * (filters.limit || 20) + 1} to{' '}
                {Math.min(currentPage * (filters.limit || 20), total)} of {total} files
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <MediaPreviewModal
        upload={previewUpload}
        open={!!previewUpload}
        onOpenChange={(open) => !open && setPreviewUpload(null)}
        onEdit={setEditUpload}
        onCopyUrl={handleCopyUrl}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      <MediaEditModal
        upload={editUpload}
        open={!!editUpload}
        onOpenChange={(open) => !open && setEditUpload(null)}
        onSave={handleEdit}
      />

      <MediaUploadArea
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUpload={handleUpload}
        onComplete={handleUploadComplete}
      />
    </div>
  );
}
