'use client';

import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadItem {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface MediaUploadAreaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => Promise<{ url: string }>;
  onComplete?: () => void;
}

export function MediaUploadArea({ open, onOpenChange, onUpload, onComplete }: MediaUploadAreaProps) {
  const [uploads, setUploads] = useState<Map<string, UploadItem>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newUploads = new Map(uploads);
      const fileArray = Array.from(files);

      fileArray.forEach((file) => {
        const id = `${file.name}-${Date.now()}-${Math.random()}`;
        newUploads.set(id, {
          file,
          progress: 0,
          status: 'pending',
        });
      });

      setUploads(newUploads);

      for (const [id, item] of newUploads.entries()) {
        if (item.status === 'pending') {
          try {
            newUploads.set(id, { ...item, status: 'uploading', progress: 0 });
            setUploads(new Map(newUploads));

            const result = await onUpload(item.file);

            newUploads.set(id, {
              ...item,
              status: 'success',
              progress: 100,
              url: result.url,
            });
            setUploads(new Map(newUploads));
          } catch (error) {
            newUploads.set(id, {
              ...item,
              status: 'error',
              progress: 0,
              error: error instanceof Error ? error.message : 'Upload failed',
            });
            setUploads(new Map(newUploads));
          }
        }
      }

      const allComplete = Array.from(newUploads.values()).every(
        (item) => item.status === 'success' || item.status === 'error'
      );

      if (allComplete) {
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    },
    [uploads, onUpload, onComplete]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (id: string) => {
    const newUploads = new Map(uploads);
    newUploads.delete(id);
    setUploads(newUploads);
  };

  const handleClose = () => {
    setUploads(new Map());
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
    }
    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  const uploadArray = Array.from(uploads.entries());
  const hasUploads = uploadArray.length > 0;
  const allComplete = uploadArray.every(
    ([, item]) => item.status === 'success' || item.status === 'error'
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            )}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-2">
              Drag and drop files here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click the button below to browse
            </p>
            <Button onClick={handleBrowseClick} variant="outline">
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
            />
          </div>

          {hasUploads && (
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Uploads</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uploadArray.map(([id, item]) => (
                  <div
                    key={id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card"
                  >
                    <div className="flex-shrink-0">{getFileIcon(item.file)}</div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </p>

                      {item.status === 'uploading' && (
                        <Progress value={item.progress} className="mt-2 h-1" />
                      )}

                      {item.status === 'error' && (
                        <p className="text-xs text-destructive mt-1">{item.error}</p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {item.status === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {item.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      {(item.status === 'pending' || item.status === 'uploading') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasUploads && allComplete && (
            <div className="flex justify-end">
              <Button onClick={handleClose}>Done</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
