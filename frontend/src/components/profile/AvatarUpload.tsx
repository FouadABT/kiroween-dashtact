/**
 * Avatar Upload Component
 * 
 * Handles avatar image upload with drag-and-drop, preview, and validation
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAvatarUpload, useAvatarDelete } from '@/hooks/useProfile';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userName: string;
}

export function AvatarUpload({ currentAvatarUrl, userName }: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cacheKey, setCacheKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useAvatarUpload();
  const deleteMutation = useAvatarDelete();

  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Update cache key when avatar URL changes
  useEffect(() => {
    console.log('[AvatarUpload] Avatar URL changed:', currentAvatarUrl);
    setCacheKey(Date.now());
  }, [currentAvatarUrl]);

  // Get user initials for fallback
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be JPEG, PNG, WebP, or GIF' };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadMutation.mutate(
        {
          file,
          onProgress: (progress) => {
            setUploadProgress(progress.percent);
          },
        },
        {
          onSuccess: () => {
            setPreviewUrl(null);
            setUploadProgress(0);
          },
          onError: () => {
            setPreviewUrl(null);
            setUploadProgress(0);
          },
        }
      );
    },
    [uploadMutation]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle click to upload
  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle delete avatar
  const handleDelete = useCallback(() => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  }, [deleteMutation]);

  // Force re-render when avatar URL changes by adding a cache-busting timestamp
  const displayUrl = previewUrl || (currentAvatarUrl ? `${currentAvatarUrl}?t=${cacheKey}` : null);

  console.log('[AvatarUpload] Rendering with:', {
    currentAvatarUrl,
    previewUrl,
    displayUrl,
    cacheKey,
    isUploading,
  });

  return (
    <div className="space-y-4">
      {/* Avatar Display */}
      <div
        className={cn(
          'relative group cursor-pointer',
          isDragging && 'ring-2 ring-primary ring-offset-2'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <Avatar className="h-32 w-32 mx-auto">
          <AvatarImage 
            src={displayUrl || undefined} 
            alt={userName}
            key={`${currentAvatarUrl}-${cacheKey}`} // Force re-render when URL or cache key changes
          />
          <AvatarFallback className="text-2xl">{getInitials(userName)}</AvatarFallback>
        </Avatar>

        {/* Upload Overlay */}
        {!isUploading && !isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="h-8 w-8 text-white" />
          </div>
        )}

        {/* Loading Overlay */}
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleClickUpload}
          disabled={isUploading || isDeleting}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Photo
        </Button>

        {currentAvatarUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isUploading || isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Helper Text */}
      <p className="text-xs text-center text-muted-foreground">
        JPEG, PNG, WebP, or GIF. Max 5MB.
      </p>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
