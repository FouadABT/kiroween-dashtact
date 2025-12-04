import { ApiClient } from '../api';
import type {
  Upload,
  GetUploadsQuery,
  GetUploadsResponse,
  UpdateUploadDto,
  Visibility,
} from '@/types/media';

export const mediaApi = {
  getUploads: async (query: GetUploadsQuery = {}): Promise<GetUploadsResponse> => {
    return ApiClient.get<GetUploadsResponse>('/uploads', query as Record<string, unknown>);
  },

  getUpload: async (id: string): Promise<Upload> => {
    return ApiClient.get<Upload>(`/uploads/${id}`);
  },

  uploadFile: async (file: File, metadata?: Partial<UpdateUploadDto>): Promise<Upload> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, JSON.stringify(value));
        }
      });
    }

    const token = ApiClient.getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  updateUpload: async (id: string, dto: UpdateUploadDto): Promise<Upload> => {
    return ApiClient.patch<Upload>(`/uploads/${id}`, dto);
  },

  deleteUpload: async (id: string): Promise<void> => {
    return ApiClient.delete<void>(`/uploads/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<{ deleted: number }> => {
    return ApiClient.post<{ deleted: number }>('/uploads/bulk-delete', { ids });
  },

  bulkUpdateVisibility: async (
    ids: string[],
    visibility: Visibility,
    allowedRoles?: string[],
  ): Promise<{ updated: number }> => {
    return ApiClient.patch<{ updated: number }>('/uploads/bulk-visibility', {
      ids,
      visibility,
      allowedRoles,
    });
  },
};
