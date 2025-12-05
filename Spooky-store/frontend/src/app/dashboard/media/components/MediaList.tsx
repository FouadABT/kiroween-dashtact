'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Upload, Visibility } from '@/types/media';
import { Eye, Edit, Copy, Download, Trash2, MoreVertical, FileText, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MediaListProps {
  uploads: Upload[];
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onPreview?: (upload: Upload) => void;
  onEdit?: (upload: Upload) => void;
  onCopyUrl?: (url: string) => void;
  onDownload?: (upload: Upload) => void;
  onDelete?: (upload: Upload) => void;
  showUploadedBy?: boolean;
}

export function MediaList({
  uploads,
  selectedIds = new Set(),
  onSelect,
  onPreview,
  onEdit,
  onCopyUrl,
  onDownload,
  onDelete,
  showUploadedBy = false,
}: MediaListProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  const isImage = (upload: Upload) =>
    upload.type === 'IMAGE' || upload.type === 'AVATAR' || upload.type === 'EDITOR_IMAGE';

  if (uploads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-border rounded-lg">
        <p className="text-lg font-medium text-muted-foreground">No files found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload files or adjust your filters to see results
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelect && (
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
            )}
            <TableHead className="w-16">Preview</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            {showUploadedBy && <TableHead>Uploaded By</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.map((upload) => (
            <TableRow key={upload.id} className="group">
              {onSelect && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(upload.id)}
                    onCheckedChange={(checked) => onSelect(upload.id, checked as boolean)}
                  />
                </TableCell>
              )}
              <TableCell>
                <div
                  className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => onPreview?.(upload)}
                >
                  {isImage(upload) && !imageErrors.has(upload.id) ? (
                    <img
                      src={upload.url}
                      alt={upload.altText || upload.originalName}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(upload.id)}
                    />
                  ) : upload.type === 'DOCUMENT' ? (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="font-medium text-foreground truncate">
                    {upload.title || upload.originalName}
                  </p>
                  {upload.title && (
                    <p className="text-xs text-muted-foreground truncate">{upload.originalName}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {upload.type}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatFileSize(upload.size)}
              </TableCell>
              {showUploadedBy && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={upload.uploadedBy.avatar} />
                      <AvatarFallback className="text-xs">
                        {upload.uploadedBy.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{upload.uploadedBy.name}</span>
                  </div>
                </TableCell>
              )}
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(upload.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-xs', getVisibilityColor(upload.visibility))}>
                  {upload.visibility}
                </Badge>
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
