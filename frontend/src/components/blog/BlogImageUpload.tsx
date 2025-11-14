'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/image-proxy';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * BlogImageUpload Props
 */
export interface BlogImageUploadProps {
  /** Current image URL */
  value?: string;
  /** Change handler with uploaded image URL */
  onChange: (url: string) => void;
  /** Label for the upload field */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * BlogImageUpload Component
 * 
 * Specialized image upload component for blog posts with:
 * - Drag-and-drop support
 * - Image preview
 * - Upload progress
 * - Image optimization recommendations
 * - Delete/replace functionality
 * - Integration with existing file upload module
 * 
 * Features:
 * - Accepts only image files (JPEG, PNG, GIF, WebP)
 * - Maximum file size: 5MB
 * - Recommended size: 1200x630 pixels (for OG images)
 * - Shows preview of uploaded image
 * - Supports deletion and replacement
 * 
 * Requirements: 5.2
 * 
 * @example
 * ```tsx
 * <BlogImageUpload
 *   value={featuredImage}
 *   onChange={(url) => setFeaturedImage(url)}
 *   label="Featured Image"
 * />
 * ```
 */
export function BlogImageUpload({
  value,
  onChange,
  label = 'Featured Image',
  disabled = false,
  className,
}: BlogImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(value || null);

  /**
   * Validate image file
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.';
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size exceeds 5MB. Please upload a smaller image.';
    }

    return null;
  };

  /**
   * Upload image to backend
   */
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    formData.append('description', 'Blog post featured image');

    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const data = await response.json();
    return `${API_BASE_URL}${data.url}`;
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = async (file: File) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to backend
      const url = await uploadImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update parent component
      onChange(url);
      setImagePreview(url);

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setError(errorMessage);
      toast.error(errorMessage);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Handle image deletion
   */
  const handleDelete = () => {
    setImagePreview(null);
    onChange('');
    setError(null);
    toast.success('Image removed');
  };

  const isDisabled = disabled || isUploading;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {label && (
        <Label>
          {label}
          <span className="text-sm text-muted-foreground ml-2">
            (Recommended: 1200x630 pixels)
          </span>
        </Label>
      )}

      {/* Upload Area or Preview */}
      {!imagePreview ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging && 'border-primary bg-primary/5',
            !isDragging && 'border-border hover:border-primary/50',
            isDisabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleInputChange}
            disabled={isDisabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="space-y-2 w-full max-w-xs">
                  <p className="text-sm font-medium">Uploading image...</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {isDragging
                      ? 'Drop image here'
                      : 'Drag & drop an image, or click to select'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, GIF, or WebP • Max 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative group">
          {/* Image Preview */}
          <div className="relative rounded-lg border border-border overflow-hidden min-h-[200px]">
            <Image
              src={getImageUrl(imagePreview)}
              alt="Featured image preview"
              width={1200}
              height={630}
              className="w-full h-auto max-h-96 object-contain bg-muted"
              unoptimized
              onError={() => {
                setError('Failed to load image preview');
                setImagePreview(null);
              }}
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/jpeg,image/png,image/gif,image/webp';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      handleFileSelect(files[0]);
                    }
                  };
                  input.click();
                }}
                disabled={isDisabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDisabled}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>

          {/* Image Info */}
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>Featured image uploaded</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Help Text */}
      <p className="text-sm text-muted-foreground">
        Upload a featured image for your blog post. This image will be displayed in blog listings
        and used for social media sharing (Open Graph). For best results, use an image with a 1200x630
        pixel resolution.
      </p>
    </div>
  );
}
