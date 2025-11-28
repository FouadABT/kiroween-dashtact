/**
 * Upload Type Definitions
 * 
 * TypeScript interfaces for file upload functionality
 * matching backend DTOs and responses.
 */

/**
 * File upload request data
 * Matches backend UploadFileDto
 * Note: type is optional as backend determines it from MIME type for security
 */
export interface UploadFileData {
  /** Type of file being uploaded (optional - backend determines from MIME type) */
  type?: 'image' | 'document';
  /** Optional description of the file */
  description?: string;
}

/**
 * File upload response
 * Matches backend UploadResponseDto
 */
export interface UploadResponse {
  /** Generated unique filename */
  filename: string;
  /** Original filename from user */
  originalName: string;
  /** MIME type of the file */
  mimetype: string;
  /** File size in bytes */
  size: number;
  /** Public URL to access the file */
  url: string;
  /** Timestamp when file was uploaded */
  uploadedAt: string; // ISO date string
}

/**
 * Upload configuration for different file types
 */
export interface UploadConfig {
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Allowed MIME types */
  allowedMimeTypes: string[];
  /** Upload directory path */
  uploadDir: string;
}

/**
 * Upload error response
 */
export interface UploadError {
  /** Error message */
  message: string;
  /** HTTP status code */
  statusCode: number;
  /** Error details */
  error?: string;
}

/**
 * File upload progress
 */
export interface UploadProgress {
  /** Percentage complete (0-100) */
  percent: number;
  /** Bytes uploaded */
  loaded: number;
  /** Total bytes */
  total: number;
}
