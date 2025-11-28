'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Visibility } from '@/types/media';
import { Edit, Copy, Download, Trash2, FileText, Image as ImageIcon, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MediaPreviewModalProps {
  upload: Upload | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (upload: Upload) => void;
  onCopyUrl?: (url: string) => void;
  onDownload?: (upload: Upload) => void;
  onDelete?: (upload: Upload) => void;
}

export function MediaPreviewModal({
  upload,
  open,
  onOpenChange,
  onEdit,
  onCopyUrl,
  onDownload,
  onDelete,
}: MediaPreviewModalProps) {
  const [imageError, setImageError] = useState(false);

  if (!upload) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getVisibilityColor = (visibility: Visibility): string => {
    switch (visibility) {
      case Visibility.PUBLIC:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case Visibility.PRIVATE:
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case Visibility.ROLE_BASED:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const isImage = upload.type === 'IMAGE' || upload.type === 'AVATAR' || upload.type === 'EDITOR_IMAGE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{upload.title || upload.originalName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {isImage && !imageError ? (
              <img
                src={upload.url}
                alt={upload.altText || upload.originalName}
                className="max-w-full max-h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                {upload.type === 'DOCUMENT' ? (
                  <FileText className="h-24 w-24" />
                ) : (
                  <ImageIcon className="h-24 w-24" />
                )}
                <span className="text-lg font-medium">{upload.mimeType}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Filename</p>
              <p className="text-sm text-foreground">{upload.originalName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
              <Badge variant="outline">{upload.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Size</p>
              <p className="text-sm text-foreground">{formatFileSize(upload.size)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">MIME Type</p>
              <p className="text-sm text-foreground">{upload.mimeType}</p>
            </div>
            {upload.width && upload.height && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Dimensions</p>
                <p className="text-sm text-foreground">
                  {upload.width} × {upload.height}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Visibility</p>
              <Badge variant="outline" className={cn('text-xs', getVisibilityColor(upload.visibility))}>
                {upload.visibility}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Uploaded By</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={upload.uploadedBy.avatar} />
                <AvatarFallback>
                  {upload.uploadedBy.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{upload.uploadedBy.name}</p>
                <p className="text-xs text-muted-foreground">{upload.uploadedBy.email}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Uploaded</p>
            <p className="text-sm text-foreground">
              {formatDistanceToNow(new Date(upload.createdAt), { addSuffix: true })}
            </p>
          </div>

          {upload.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground">{upload.description}</p>
            </div>
          )}

          {upload.altText && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Alt Text</p>
              <p className="text-sm text-foreground">{upload.altText}</p>
            </div>
          )}

          {upload.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {upload.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {upload.usageCount > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Usage</p>
              <p className="text-sm text-foreground">
                Used in {upload.usageCount} {upload.usageCount === 1 ? 'place' : 'places'}
              </p>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button onClick={() => onEdit?.(upload)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Metadata
            </Button>
            <Button variant="outline" onClick={() => onCopyUrl?.(upload.url)} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy URL
            </Button>
            <Button variant="outline" onClick={() => onDownload?.(upload)} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.(upload);
                onOpenChange(false);
              }}
              className="gap-2 ml-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
