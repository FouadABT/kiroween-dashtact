/**
 * Upload API Service
 * 
 * Handles file uploads for the editor and other components
 */

import { ApiClient } from '../api';

export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

/**
 * Validate image file before upload
 * @param file File to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
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
}

/**
 * Upload an image for use in the editor
 * @param file Image file to upload
 * @returns Promise resolving to the image URL
 */
export async function uploadEditorImage(file: File): Promise<string> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);

  // Get access token
  const token = ApiClient.getAccessToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  // Send POST request
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_BASE_URL}/uploads/editor-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  // Handle errors
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = 'Failed to upload image';

    if (contentType?.includes('application/json')) {
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (response.status === 400) {
      throw new Error(errorMessage);
    } else if (response.status === 413) {
      throw new Error('File size too large. Maximum size is 5MB.');
    } else {
      throw new Error(errorMessage);
    }
  }

  // Parse response
  const data: UploadResponse = await response.json();
  return data.url;
}

/**
 * Upload a file (generic upload)
 * @param file File to upload
 * @returns Promise resolving to upload response
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);

  // Get access token
  const token = ApiClient.getAccessToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  // Send POST request
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_BASE_URL}/uploads/editor-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  // Handle errors
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = 'Failed to upload file';

    if (contentType?.includes('application/json')) {
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (response.status === 400) {
      throw new Error(errorMessage);
    } else if (response.status === 413) {
      throw new Error('File size too large. Maximum size is 5MB.');
    } else {
      throw new Error(errorMessage);
    }
  }

  // Parse and return response
  const data: UploadResponse = await response.json();
  return data;
}
