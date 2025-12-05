'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { PagesApi } from '@/lib/api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-proxy';

interface FeaturedImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export function FeaturedImageUpload({ imageUrl, onImageChange }: FeaturedImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, WebP, or SVG image');
      return false;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Please upload an image smaller than 5MB');
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await PagesApi.uploadFeaturedImage(file, (progress) => {
        setUploadProgress(progress.percent);
      });

      onImageChange(response.url);

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleRemove = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Image</CardTitle>
        <CardDescription>
          Upload a featured image for your page (optional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {imageUrl ? (
            <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border bg-muted">
              <Image
                src={getImageUrl(imageUrl)}
                alt="Featured image"
                fill
                className="object-cover"
                unoptimized
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                'flex items-center justify-center aspect-video w-full max-w-md rounded-lg border-2 border-dashed bg-muted/50 transition-colors',
                isDragging && 'border-primary bg-primary/5',
                isUploading && 'opacity-50 cursor-not-allowed',
                !isUploading && 'cursor-pointer hover:border-primary/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={!isUploading ? () => fileInputRef.current?.click() : undefined}
            >
              <div className="text-center p-4">
                {isUploading ? (
                  <>
                    <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isDragging ? 'Drop image here' : 'Click or drag to upload image'}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
            />
            {imageUrl && (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Change Image
                  </>
                )}
              </Button>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Supported formats: PNG, JPG, WebP, SVG. Max size: 5MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
