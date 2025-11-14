'use client';

import { useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helpers';

interface ImageUploadButtonProps {
  editor: Editor;
  disabled?: boolean;
  uploadFn: (file: File) => Promise<string>;
}

export function ImageUploadButton({ editor, disabled, uploadFn }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload PNG, JPG, WebP, GIF, or SVG images only.',
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      showErrorToast('Invalid file', validation.error);
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadFn(file);
      
      // Insert image into editor at cursor position
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      
      showSuccessToast('Image uploaded', 'Image has been inserted successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      showErrorToast(
        'Upload failed',
        error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleButtonClick}
              onKeyDown={handleKeyDown}
              disabled={disabled || isUploading}
              aria-label="Insert Image"
              className="h-8 w-8 p-0"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );
}
