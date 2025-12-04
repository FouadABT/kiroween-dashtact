'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X, File, FileImage, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BaseWidgetProps } from '../types/widget.types';

/**
 * Uploaded file info
 */
export interface UploadedFile {
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

/**
 * FileUpload Props
 */
export interface FileUploadProps extends BaseWidgetProps {
  /** Accepted file types (e.g., "image/*", ".pdf") */
  accept?: string | string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allow multiple files */
  multiple?: boolean;
  /** Upload handler - should return uploaded file URLs */
  onUpload: (files: File[]) => Promise<string[]>;
  /** Change handler with uploaded file info */
  onChange?: (files: UploadedFile[]) => void;
  /** Maximum number of files */
  maxFiles?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Show file list */
  showFileList?: boolean;
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file icon
 */
function getFileIcon(file: File) {
  if (file.type.startsWith('image/')) {
    return <FileImage className="h-8 w-8 text-blue-500" />;
  }
  if (file.type.includes('pdf') || file.type.includes('document')) {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  return <File className="h-8 w-8 text-gray-500" />;
}

/**
 * FileUpload Component
 * 
 * File upload with:
 * - react-dropzone for drag-and-drop
 * - File type validation using accept prop
 * - File size validation using maxSize prop
 * - Upload progress display
 * - File list with remove buttons
 * - Backend POST /api/uploads endpoint integration
 * 
 * Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5, 13.4
 * 
 * @example
 * ```tsx
 * <FileUpload
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   multiple
 *   onUpload={async (files) => {
 *     // Upload to backend
 *     const formData = new FormData();
 *     files.forEach(file => formData.append('files', file));
 *     const response = await fetch('/api/uploads', {
 *       method: 'POST',
 *       body: formData,
 *     });
 *     const data = await response.json();
 *     return data.urls;
 *   }}
 * />
 * ```
 */
export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  onUpload,
  onChange,
  maxFiles,
  disabled = false,
  showFileList = true,
  loading = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      const rejectionErrors = rejectedFiles.map((rejection) => {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          return `${rejection.file.name}: File is too large (max ${formatFileSize(maxSize)})`;
        }
        if (error.code === 'file-invalid-type') {
          return `${rejection.file.name}: Invalid file type`;
        }
        return `${rejection.file.name}: ${error.message}`;
      });

      if (rejectionErrors.length > 0) {
        setErrors(rejectionErrors);
        return;
      }

      // Check max files limit
      if (maxFiles && files.length + acceptedFiles.length > maxFiles) {
        setErrors([`Maximum ${maxFiles} files allowed`]);
        return;
      }

      setErrors([]);

      // Add files to state with initial progress
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Start upload
      setIsUploading(true);

      try {
        // Simulate progress (in real implementation, use XMLHttpRequest or similar for real progress)
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              newFiles.some((nf) => nf.file === f.file) && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 200);

        // Call upload handler
        const urls = await onUpload(acceptedFiles);

        clearInterval(progressInterval);

        // Update files with URLs and complete progress
        setFiles((prev) =>
          prev.map((f) => {
            const fileIndex = newFiles.findIndex((nf) => nf.file === f.file);
            if (fileIndex !== -1) {
              return {
                ...f,
                progress: 100,
                url: urls[fileIndex],
              };
            }
            return f;
          })
        );

        // Call onChange with updated files
        const updatedFiles = files.map((f) => {
          const fileIndex = newFiles.findIndex((nf) => nf.file === f.file);
          if (fileIndex !== -1) {
            return {
              ...f,
              progress: 100,
              url: urls[fileIndex],
            };
          }
          return f;
        });
        onChange?.(updatedFiles);
      } catch (error) {
        // Handle upload error
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.file === f.file)
              ? { ...f, error: errorMessage, progress: 0 }
              : f
          )
        );
        setErrors([errorMessage]);
      } finally {
        setIsUploading(false);
      }
    },
    [files, maxFiles, maxSize, onUpload, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: typeof accept === 'string' ? { [accept]: [] } : accept ? Object.fromEntries(accept.map(a => [a, []])) : undefined,
    maxSize,
    multiple,
    disabled: disabled || loading || isUploading,
  });

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const isDisabled = disabled || loading || isUploading;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          !isDragActive && 'border-border hover:border-primary/50',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop files here'
                : isUploading
                ? 'Uploading...'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept && `Accepted: ${Array.isArray(accept) ? accept.join(', ') : accept}`}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
              {maxFiles && ` • Max files: ${maxFiles}`}
            </p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Files ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border border-border rounded-lg"
              >
                {getFileIcon(uploadedFile.file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.progress > 0 && uploadedFile.progress < 100 && (
                    <Progress value={uploadedFile.progress} className="mt-2 h-1" />
                  )}
                  {uploadedFile.error && (
                    <p className="text-xs text-destructive mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>
                {uploadedFile.progress === 100 && (
                  <div className="text-xs text-green-600 font-medium">
                    ✓ Uploaded
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
