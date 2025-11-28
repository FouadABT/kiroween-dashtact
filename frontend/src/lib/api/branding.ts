/**
 * Branding API Client
 * 
 * API client for branding management operations.
 * Handles brand settings, logo uploads, and favicon management.
 */

import { ApiClient } from '@/lib/api';
import type { BrandSettings, UpdateBrandSettingsDto, FileUploadResponse } from '@/types/branding';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Branding API endpoints
 */
export class BrandingApi {
  /**
   * Get current brand settings (public endpoint)
   * @returns Current brand settings
   */
  static async getBrandSettings(): Promise<BrandSettings> {
    return ApiClient.get<BrandSettings>('/branding');
  }

  /**
   * Update brand settings (admin only)
   * @param data Brand settings to update
   * @returns Updated brand settings
   */
  static async updateBrandSettings(data: UpdateBrandSettingsDto): Promise<BrandSettings> {
    return ApiClient.put<BrandSettings>('/branding', data);
  }

  /**
   * Upload logo (light mode) (admin only)
   * @param file Logo file to upload
   * @returns Upload response with URL
   */
  static async uploadLogo(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = ApiClient.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/branding/logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload logo');
    }

    return response.json();
  }

  /**
   * Upload logo (dark mode) (admin only)
   * @param file Dark mode logo file to upload
   * @returns Upload response with URL
   */
  static async uploadLogoDark(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = ApiClient.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/branding/logo-dark`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload dark logo');
    }

    return response.json();
  }

  /**
   * Upload favicon (admin only)
   * @param file Favicon file to upload
   * @returns Upload response with URL
   */
  static async uploadFavicon(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = ApiClient.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/branding/favicon`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload favicon');
    }

    return response.json();
  }

  /**
   * Reset branding to default values (admin only)
   * @returns Default brand settings
   */
  static async resetBranding(): Promise<BrandSettings> {
    return ApiClient.post<BrandSettings>('/branding/reset');
  }
}
