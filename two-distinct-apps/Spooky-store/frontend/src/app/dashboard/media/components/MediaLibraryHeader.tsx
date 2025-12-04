'use client';

import { Button } from '@/components/ui/button';
import { Upload, Grid3x3, List } from 'lucide-react';

interface MediaLibraryHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onUploadClick: () => void;
}

export function MediaLibraryHeader({
  viewMode,
  onViewModeChange,
  onUploadClick,
}: MediaLibraryHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your uploaded files and media
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-8 px-3"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-8 px-3"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onUploadClick} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </div>
    </div>
  );
}
