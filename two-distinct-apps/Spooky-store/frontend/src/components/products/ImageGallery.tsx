'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/lib/api/uploads';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  featuredImage?: string | null;
  onImagesChange: (images: string[]) => void;
  onFeaturedImageChange: (image: string | null) => void;
}

export function ImageGallery({
  images,
  featuredImage,
  onImagesChange,
  onFeaturedImageChange,
}: ImageGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const newImages = results.map((result) => result.url);
      
      onImagesChange([...images, ...newImages]);
      
      // Set first uploaded image as featured if none exists
      if (!featuredImage && newImages.length > 0) {
        onFeaturedImageChange(newImages[0]);
      }

      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    const newImages = images.filter((img) => img !== imageUrl);
    onImagesChange(newImages);
    
    // If removed image was featured, set first remaining image as featured
    if (featuredImage === imageUrl) {
      onFeaturedImageChange(newImages.length > 0 ? newImages[0] : null);
    }
  };

  const handleSetFeatured = (imageUrl: string) => {
    onFeaturedImageChange(imageUrl);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Images</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No images uploaded yet
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={featuredImage === imageUrl ? 'default' : 'secondary'}
                      onClick={() => handleSetFeatured(imageUrl)}
                      title="Set as featured image"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          featuredImage === imageUrl ? 'fill-current' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveImage(imageUrl)}
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {featuredImage === imageUrl && (
                  <div className="absolute top-1 left-1">
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {featuredImage
            ? 'Click the star icon to set a different featured image'
            : 'Click the star icon on an image to set it as featured'}
        </p>
      )}
    </div>
  );
}
