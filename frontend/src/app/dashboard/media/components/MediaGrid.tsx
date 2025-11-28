'use client';

import { Upload } from '@/types/media';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  uploads: Upload[];
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onPreview?: (upload: Upload) => void;
  onEdit?: (upload: Upload) => void;
  onCopyUrl?: (url: string) => void;
  onDownload?: (upload: Upload) => void;
  onDelete?: (upload: Upload) => void;
}

export function MediaGrid({
  uploads,
  selectedIds = new Set(),
  onSelect,
  onPreview,
  onEdit,
  onCopyUrl,
  onDownload,
  onDelete,
}: MediaGridProps) {
  if (uploads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No files found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload files or adjust your filters to see results
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {uploads.map((upload) => (
        <MediaCard
          key={upload.id}
          upload={upload}
          isSelected={selectedIds.has(upload.id)}
          onSelect={onSelect}
          onPreview={onPreview}
          onEdit={onEdit}
          onCopyUrl={onCopyUrl}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
