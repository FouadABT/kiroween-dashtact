'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/image-proxy';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Copy,
  FileText,
  Calendar,
  Globe,
  Lock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CustomPage } from '@/types/pages';
import { cn } from '@/lib/utils';

interface PageCardProps {
  page: CustomPage;
  viewMode?: 'grid' | 'list';
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onDuplicate?: () => void;
  onView?: () => void;
}

export function PageCard({
  page,
  viewMode = 'grid',
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onDuplicate,
  onView,
}: PageCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'DRAFT':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'ARCHIVED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'PUBLIC' ? (
      <Globe className="h-3 w-3" />
    ) : (
      <Lock className="h-3 w-3" />
    );
  };

  if (viewMode === 'list') {
    return (
      <>
        <Card className={cn('transition-colors', selected && 'ring-2 ring-primary')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                aria-label={`Select ${page.title}`}
              />

              {/* Featured Image */}
              {page.featuredImage && (
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={getImageUrl(page.featuredImage)}
                    alt={page.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{page.title}</h3>
                  <Badge variant="outline" className={getStatusColor(page.status)}>
                    {page.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getVisibilityIcon(page.visibility)}
                    <span>{page.visibility}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">/{page.slug}</p>
                {page.excerpt && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {page.excerpt}
                  </p>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {page.status === 'PUBLISHED' && (
                      <DropdownMenuItem onClick={onView}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Page
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {page.status === 'PUBLISHED' ? (
                      <DropdownMenuItem onClick={onUnpublish}>
                        <FileText className="mr-2 h-4 w-4" />
                        Unpublish
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={onPublish}>
                        <FileText className="mr-2 h-4 w-4" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Page</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{page.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete?.();
                  setShowDeleteDialog(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Card className={cn('transition-colors', selected && 'ring-2 ring-primary')}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                aria-label={`Select ${page.title}`}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{page.title}</h3>
                <p className="text-sm text-muted-foreground truncate">/{page.slug}</p>
              </div>
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {page.status === 'PUBLISHED' && (
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Page
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {page.status === 'PUBLISHED' ? (
                  <DropdownMenuItem onClick={onUnpublish}>
                    <FileText className="mr-2 h-4 w-4" />
                    Unpublish
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={onPublish}>
                    <FileText className="mr-2 h-4 w-4" />
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {page.featuredImage && (
            <div className="w-full h-40 rounded overflow-hidden mb-3">
              <img
                src={getImageUrl(page.featuredImage)}
                alt={page.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {page.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">{page.excerpt}</p>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(page.status)}>
              {page.status}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getVisibilityIcon(page.visibility)}
              <span>{page.visibility}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}</span>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{page.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
