'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, Visibility } from '@/types/media';
import { Eye, Edit, Copy, Download, Trash2, MoreVertical, FileText, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  upload: Upload;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onPreview?: (upload: Upload) => void;
  onEdit?: (upload: Upload) => void;
  onCopyUrl?: (url: string) => void;
  onDownload?: (upload: Upload) => void;
  onDelete?: (upload: Upload) => void;
}

export function MediaCard({
  upload,
  isSelected = false,
  onSelect,
  onPreview,
  onEdit,
  onCopyUrl,
  onDownload,
  onDelete,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);

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
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow">
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(upload.id, checked as boolean)}
            className="bg-background border-2"
          />
        </div>
      )}

      <div
        className="aspect-square bg-muted flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => onPreview?.(upload)}
      >
        {isImage && !imageError ? (
          <img
            src={upload.url}
            alt={upload.altText || upload.originalName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            {upload.type === 'DOCUMENT' ? (
              <FileText className="h-12 w-12" />
            ) : (
              <ImageIcon className="h-12 w-12" />
            )}
            <span className="text-xs font-medium">{upload.mimeType.split('/')[1]?.toUpperCase()}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview?.(upload);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(upload);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyUrl?.(upload.url);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy URL</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm font-medium text-foreground truncate">
                {upload.title || upload.originalName}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{upload.title || upload.originalName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(upload.size)}</span>
          <span>{formatDistanceToNow(new Date(upload.createdAt), { addSuffix: true })}</span>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn('text-xs', getVisibilityColor(upload.visibility))}>
            {upload.visibility}
          </Badge>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview?.(upload)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(upload)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopyUrl?.(upload.url)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload?.(upload)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(upload)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
