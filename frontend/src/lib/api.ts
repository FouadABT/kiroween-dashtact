/**
 * API Client Configuration
 * 
 * Centralized API client for communicating with the NestJS backend.
 * Handles authentication, error handling, automatic token refresh, and type-safe requests.
 */

import { 
  UserRole,
  UserProfile, 
  CreateUserData, 
  UpdateUserData, 
  LoginCredentials, 
  RegisterUserData, 
  AuthResponse, 
  UsersListResponse, 
  UserQueryParams 
} from '@/types/user';
import { TokenRefreshResponse } from '@/types/auth';
import { authConfig } from '@/config/auth.config';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * API Error class for handling backend errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Authentication Error class for auth-specific errors
 */
export class AuthError extends ApiError {
  constructor(
    message: string,
    statusCode: number,
    public code?: string,
    response?: unknown
  ) {
    super(message, statusCode, response);
    this.name = 'AuthError';
  }
}

/**
 * Rate Limit Error class for rate limiting errors
 */
export class RateLimitError extends ApiError {
  constructor(
    message: string,
    public retryAfter?: number,
    response?: unknown
  ) {
    super(message, 429, response);
    this.name = 'RateLimitError';
  }
}

/**
 * Base API client class with common HTTP methods
 */
export class ApiClient {
  private static baseURL = API_BASE_URL;
  private static accessToken: string | null = null;
  private static isRefreshing = false;
  private static refreshPromise: Promise<boolean> | null = null;
  private static failedQueue: Array<{
    resolve: (value: boolean) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  /**
   * Set access token for subsequent requests
   * @param token Access token or null to clear
   */
  static setAccessToken(token: string | null): void {
    this.accessToken = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem(authConfig.storage.accessTokenKey, token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem(authConfig.storage.accessTokenKey);
    }
  }

  /**
   * Get current access token
   * @returns Current access token or null
   */
  static getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(authConfig.storage.accessTokenKey);
    }
    return this.accessToken;
  }

  /**
   * Clear all authentication tokens
   */
  static clearTokens(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(authConfig.storage.accessTokenKey);
      // Refresh token is cleared via httpOnly cookie by backend
    }
  }

  /**
   * Get default headers for API requests
   */
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Process failed queue after token refresh
   * @param error Error if refresh failed
   */
  private static processQueue(error: Error | null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(true);
      }
    });
    this.failedQueue = [];
  }

  /**
   * Attempt to refresh the access token
   * @returns Promise that resolves to true if refresh succeeded
   */
  private static async attemptTokenRefresh(): Promise<boolean> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        // Get refresh token from localStorage
        const refreshToken = typeof window !== 'undefined' 
          ? localStorage.getItem('refreshToken') 
          : null;
        
        if (!refreshToken) {
          throw new AuthError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
        }

        const response = await fetch(`${this.baseURL}${authConfig.endpoints.refresh}`, {
          method: 'POST',
          credentials: 'include', // Include httpOnly cookie with refresh token
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new AuthError('Token refresh failed', response.status, 'REFRESH_FAILED');
        }

        const data: TokenRefreshResponse = await response.json();
        this.setAccessToken(data.accessToken);
        
        // Note: Backend does not rotate refresh tokens
        // The existing refresh token in localStorage remains valid
        
        this.processQueue(null);
        return true;
      } catch (error) {
        this.processQueue(error as Error);
        this.clearTokens();
        
        // Clear refresh token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refreshToken');
        }
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = authConfig.redirects.unauthorized;
        }
        
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Handle API response and errors with automatic token refresh
   */
  private static async handleResponse<T>(
    response: Response,
    originalRequest?: () => Promise<Response>
  ): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && originalRequest) {
      if (this.isRefreshing) {
        // Wait for the current refresh to complete
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry the original request with new token
          return originalRequest().then((retryResponse) =>
            this.handleResponse<T>(retryResponse)
          );
        });
      }

      // Attempt to refresh the token
      const refreshed = await this.attemptTokenRefresh();
      
      if (refreshed && originalRequest) {
        // Retry the original request with new token
        const retryResponse = await originalRequest();
        return this.handleResponse<T>(retryResponse);
      }

      throw new AuthError(
        data?.message || 'Authentication required',
        401,
        'UNAUTHORIZED',
        data
      );
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new AuthError(
        data?.message || 'Access forbidden',
        403,
        'FORBIDDEN',
        data
      );
    }

    // Handle 429 Rate Limit
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(
        data?.message || 'Too many requests',
        retryAfter ? parseInt(retryAfter, 10) : undefined,
        data
      );
    }

    // Handle other errors
    if (!response.ok) {
      throw new ApiError(
        data?.message || data || 'API request failed',
        response.status,
        data
      );
    }

    return data;
  }

  /**
   * Generic GET request with automatic token refresh
   */
  static async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const makeRequest = () =>
      fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for refresh token
      });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  /**
   * Generic POST request with automatic token refresh
   */
  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const makeRequest = () =>
      fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for refresh token
        body: data ? JSON.stringify(data) : undefined,
      });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  /**
   * Generic PUT request with automatic token refresh
   */
  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const makeRequest = () =>
      fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for refresh token
        body: data ? JSON.stringify(data) : undefined,
      });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  /**
   * Generic PATCH request with automatic token refresh
   */
  static async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const makeRequest = () =>
      fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for refresh token
        body: data ? JSON.stringify(data) : undefined,
      });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  /**
   * Generic DELETE request with automatic token refresh
   */
  static async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    const makeRequest = () =>
      fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for refresh token
        body: data ? JSON.stringify(data) : undefined,
      });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }
}

/**
 * User API endpoints
 */
export class UserApi {
  /**
   * User login
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return ApiClient.post<AuthResponse>('/auth/login', credentials);
  }

  /**
   * User registration
   */
  static async register(userData: RegisterUserData): Promise<AuthResponse> {
    return ApiClient.post<AuthResponse>('/auth/register', userData);
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfile> {
    return ApiClient.get<UserProfile>('/auth/profile');
  }

  /**
   * Update current user profile
   */
  static async updateProfile(userData: Partial<UpdateUserData>): Promise<UserProfile> {
    return ApiClient.patch<UserProfile>('/auth/profile', userData);
  }

  /**
   * Logout (if backend handles token invalidation)
   */
  static async logout(): Promise<void> {
    return ApiClient.post<void>('/auth/logout');
  }

  /**
   * Get all users (admin only)
   */
  static async getUsers(params?: UserQueryParams): Promise<UsersListResponse> {
    return ApiClient.get<UsersListResponse>('/users', params);
  }

  /**
   * Get user by ID (admin only)
   */
  static async getUserById(id: string): Promise<UserProfile> {
    return ApiClient.get<UserProfile>(`/users/${id}`);
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(userData: CreateUserData): Promise<UserProfile> {
    return ApiClient.post<UserProfile>('/users', userData);
  }

  /**
   * Update user (admin only)
   */
  static async updateUser(id: string, userData: Partial<UpdateUserData>): Promise<UserProfile> {
    return ApiClient.patch<UserProfile>(`/users/${id}`, userData);
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(id: string): Promise<void> {
    return ApiClient.delete<void>(`/users/${id}`);
  }

  /**
   * Activate/deactivate user (admin only)
   */
  static async toggleUserStatus(id: string, isActive: boolean): Promise<UserProfile> {
    return ApiClient.patch<UserProfile>(`/users/${id}/status`, { isActive });
  }

  /**
   * Get all available roles
   */
  static async getRoles(): Promise<UserRole[]> {
    const response = await ApiClient.get<{ data: UserRole[] }>('/users/roles');
    return response.data;
  }
}

/**
 * Permission API endpoints
 */
export class PermissionApi {
  /**
   * Get all permissions
   */
  static async getAll(params?: import('@/types/permission').PermissionQueryParams): Promise<import('@/types/permission').Permission[]> {
    return ApiClient.get<import('@/types/permission').Permission[]>('/permissions', params);
  }

  /**
   * Get permission by ID
   */
  static async getById(id: string): Promise<import('@/types/permission').Permission> {
    return ApiClient.get<import('@/types/permission').Permission>(`/permissions/${id}`);
  }

  /**
   * Create new permission (admin only)
   */
  static async create(data: import('@/types/permission').CreatePermissionData): Promise<import('@/types/permission').Permission> {
    return ApiClient.post<import('@/types/permission').Permission>('/permissions', data);
  }

  /**
   * Update permission (admin only)
   */
  static async update(id: string, data: Partial<import('@/types/permission').UpdatePermissionData>): Promise<import('@/types/permission').Permission> {
    return ApiClient.patch<import('@/types/permission').Permission>(`/permissions/${id}`, data);
  }

  /**
   * Delete permission (admin only)
   */
  static async delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/permissions/${id}`);
  }

  /**
   * Assign permission to role (admin only)
   */
  static async assignToRole(roleId: string, permissionId: string): Promise<{ message: string }> {
    return ApiClient.post<{ message: string }>('/permissions/assign', {
      roleId,
      permissionId,
    });
  }

  /**
   * Remove permission from role (admin only)
   */
  static async removeFromRole(roleId: string, permissionId: string): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>('/permissions/assign', {
      roleId,
      permissionId,
    });
  }

  /**
   * Get all permissions for a role
   */
  static async getRolePermissions(roleId: string): Promise<import('@/types/permission').Permission[]> {
    return ApiClient.get<import('@/types/permission').Permission[]>(`/permissions/role/${roleId}`);
  }

  /**
   * Check if user has a specific permission
   */
  static async checkUserPermission(userId: string, permission: string): Promise<import('@/types/permission').PermissionCheckResponse> {
    return ApiClient.get<import('@/types/permission').PermissionCheckResponse>(`/permissions/user/${userId}/check/${permission}`);
  }
}

/**
 * Upload API endpoints
 */
export class UploadApi {
  /**
   * Upload a file
   * @param file File to upload
   * @param data Upload metadata (type and optional description)
   * @param onProgress Optional progress callback
   * @returns Upload response with file details
   */
  static async uploadFile(
    file: File,
    data: import('@/types/upload').UploadFileData,
    onProgress?: (progress: import('@/types/upload').UploadProgress) => void
  ): Promise<import('@/types/upload').UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', data.type);
    if (data.description) {
      formData.append('description', data.description);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress({
              percent: Math.round((event.loaded / event.total) * 100),
              loaded: event.loaded,
              total: event.total,
            });
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new ApiError('Invalid response format', xhr.status));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new ApiError(error.message || 'Upload failed', xhr.status, error));
          } catch {
            reject(new ApiError('Upload failed', xhr.status));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new ApiError('Network error during upload', 0));
      });

      xhr.addEventListener('abort', () => {
        reject(new ApiError('Upload cancelled', 0));
      });

      // Send request
      const token = ApiClient.getAccessToken();
      xhr.open('POST', `${API_BASE_URL}/uploads`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  /**
   * Upload multiple files
   * @param files Array of files to upload
   * @param type Type of files (all must be same type)
   * @param onProgress Optional progress callback for each file
   * @returns Array of upload responses
   */
  static async uploadMultipleFiles(
    files: File[],
    type: 'image' | 'document',
    onProgress?: (fileIndex: number, progress: import('@/types/upload').UploadProgress) => void
  ): Promise<import('@/types/upload').UploadResponse[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadFile(
        file,
        { type },
        onProgress ? (progress) => onProgress(index, progress) : undefined
      )
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Validate file before upload
   * @param file File to validate
   * @param type Expected file type
   * @returns Validation result with error message if invalid
   */
  static validateFile(
    file: File,
    type: 'image' | 'document'
  ): { valid: boolean; error?: string } {
    const configs: Record<'image' | 'document', import('@/types/upload').UploadConfig> = {
      image: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        uploadDir: 'uploads/images',
      },
      document: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        uploadDir: 'uploads/documents',
      },
    };

    const config = configs[type];

    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum of ${config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Check MIME type
    if (!config.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Get upload configuration for a file type
   * @param type File type
   * @returns Upload configuration
   */
  static getConfig(type: 'image' | 'document'): import('@/types/upload').UploadConfig {
    const configs: Record<'image' | 'document', import('@/types/upload').UploadConfig> = {
      image: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        uploadDir: 'uploads/images',
      },
      document: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        uploadDir: 'uploads/documents',
      },
    };

    return configs[type];
  }
}

/**
 * Settings API endpoints
 */
export class SettingsApi {
  /**
   * Get all settings
   */
  static async getAll(): Promise<import('@/types/settings').Settings[]> {
    return ApiClient.get<import('@/types/settings').Settings[]>('/settings');
  }

  /**
   * Get settings by ID
   */
  static async getById(id: string): Promise<import('@/types/settings').Settings> {
    return ApiClient.get<import('@/types/settings').Settings>(`/settings/${id}`);
  }

  /**
   * Get global settings
   */
  static async getGlobal(): Promise<import('@/types/settings').Settings> {
    return ApiClient.get<import('@/types/settings').Settings>('/settings/global');
  }

  /**
   * Get settings by user ID
   */
  static async getByUserId(userId: string): Promise<import('@/types/settings').Settings> {
    return ApiClient.get<import('@/types/settings').Settings>(`/settings/user/${userId}`);
  }

  /**
   * Create new settings
   */
  static async create(data: import('@/types/settings').CreateSettingsDto): Promise<import('@/types/settings').Settings> {
    return ApiClient.post<import('@/types/settings').Settings>('/settings', data);
  }

  /**
   * Update settings
   */
  static async update(id: string, data: import('@/types/settings').UpdateSettingsDto): Promise<import('@/types/settings').Settings> {
    return ApiClient.patch<import('@/types/settings').Settings>(`/settings/${id}`, data);
  }

  /**
   * Delete settings
   */
  static async delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/settings/${id}`);
  }
}

/**
 * Utility functions for API client
 */
export const apiUtils = {
  /**
   * Initialize API client with stored auth token
   */
  initializeAuth() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(authConfig.storage.accessTokenKey);
      if (token) {
        ApiClient.setAccessToken(token);
      }
    }
  },

  /**
   * Store access token and set it in API client
   * @param token Access token to store
   */
  setAccessToken(token: string) {
    ApiClient.setAccessToken(token);
  },

  /**
   * Get current access token
   * @returns Current access token or null
   */
  getAccessToken(): string | null {
    return ApiClient.getAccessToken();
  },

  /**
   * Clear all authentication tokens
   */
  clearTokens() {
    ApiClient.clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Check if user is authenticated
   * @returns true if access token exists
   */
  isAuthenticated(): boolean {
    return !!ApiClient.getAccessToken();
  },

  /**
   * Manually trigger token refresh
   * @returns Promise that resolves to true if refresh succeeded
   */
  async refreshToken(): Promise<boolean> {
    try {
      // Get refresh token from localStorage
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('refreshToken') 
        : null;
      
      if (!refreshToken) {
        throw new AuthError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
      }

      const response = await fetch(`${API_BASE_URL}${authConfig.endpoints.refresh}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new AuthError('Token refresh failed', response.status, 'REFRESH_FAILED');
      }

      const data: TokenRefreshResponse = await response.json();
      ApiClient.setAccessToken(data.accessToken);
      
      // Store new refresh token if provided
      if (data.refreshToken && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return true;
    } catch (error) {
      ApiClient.clearTokens();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
      }
      return false;
    }
  },

  /**
   * Check if an error is an authentication error
   * @param error Error to check
   * @returns true if error is an AuthError
   */
  isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  },

  /**
   * Check if an error is a rate limit error
   * @param error Error to check
   * @returns true if error is a RateLimitError
   */
  isRateLimitError(error: unknown): error is RateLimitError {
    return error instanceof RateLimitError;
  },

  /**
   * Check if an error is a forbidden error (403)
   * @param error Error to check
   * @returns true if error is a 403 forbidden error
   */
  isForbiddenError(error: unknown): boolean {
    return error instanceof AuthError && error.statusCode === 403;
  },

  /**
   * Check if an error is an unauthorized error (401)
   * @param error Error to check
   * @returns true if error is a 401 unauthorized error
   */
  isUnauthorizedError(error: unknown): boolean {
    return error instanceof AuthError && error.statusCode === 401;
  },

  /**
   * Get user-friendly error message from API error
   * @param error Error object
   * @returns User-friendly error message
   */
  getErrorMessage(error: unknown): string {
    if (error instanceof RateLimitError) {
      return error.retryAfter
        ? `Too many requests. Please try again in ${error.retryAfter} seconds.`
        : 'Too many requests. Please try again later.';
    }

    if (error instanceof AuthError) {
      if (error.statusCode === 401) {
        return 'Your session has expired. Please log in again.';
      }
      if (error.statusCode === 403) {
        return 'You do not have permission to perform this action.';
      }
      return error.message;
    }

    if (error instanceof ApiError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  },
};

// Initialize auth on module load
if (typeof window !== 'undefined') {
  apiUtils.initializeAuth();
}

/**
 * Notification API endpoints
 */
export class NotificationApi {
  /**
   * Get all notifications with filters
   * @param params Query parameters for filtering notifications
   * @returns Paginated list of notifications with metadata
   */
  static async getAll(params?: import('@/types/notification').NotificationQueryParams): Promise<import('@/types/notification').NotificationsListResponse> {
    return ApiClient.get<import('@/types/notification').NotificationsListResponse>('/notifications', params as Record<string, unknown>);
  }

  /**
   * Get a single notification by ID
   * @param id Notification ID
   * @returns Single notification object
   */
  static async getById(id: string): Promise<import('@/types/notification').Notification> {
    return ApiClient.get<import('@/types/notification').Notification>(`/notifications/${id}`);
  }

  /**
   * Create a new notification (admin only)
   * @param data Notification creation data
   * @returns Created notification object
   */
  static async create(data: import('@/types/notification').CreateNotificationData): Promise<import('@/types/notification').Notification> {
    return ApiClient.post<import('@/types/notification').Notification>('/notifications', data);
  }

  /**
   * Create a demo notification for testing
   * @returns Created demo notification object
   */
  static async createDemo(): Promise<import('@/types/notification').Notification> {
    return ApiClient.post<import('@/types/notification').Notification>('/notifications/demo', {});
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Updated notification object
   */
  static async markAsRead(id: string): Promise<import('@/types/notification').Notification> {
    return ApiClient.patch<import('@/types/notification').Notification>(`/notifications/${id}/read`, {});
  }

  /**
   * Mark all notifications as read
   * @returns Count of notifications marked as read
   */
  static async markAllAsRead(): Promise<{ count: number }> {
    return ApiClient.patch<{ count: number }>('/notifications/read-all', {});
  }

  /**
   * Delete a notification
   * @param id Notification ID
   * @returns Success message
   */
  static async delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/notifications/${id}`);
  }

  /**
   * Clear all notifications for the current user
   * @returns Count of notifications cleared
   */
  static async clearAll(): Promise<{ count: number }> {
    return ApiClient.delete<{ count: number }>('/notifications/clear-all');
  }

  /**
   * Get unread notification count
   * @returns Unread notification count
   */
  static async getUnreadCount(): Promise<{ count: number }> {
    return ApiClient.get<{ count: number }>('/notifications/unread-count');
  }
}

/**
 * Notification Preference API endpoints
 */
export class NotificationPreferenceApi {
  /**
   * Get all notification preferences for the current user
   * @returns Array of notification preferences
   */
  static async getPreferences(): Promise<import('@/types/notification').NotificationPreference[]> {
    return ApiClient.get<import('@/types/notification').NotificationPreference[]>('/notifications/preferences');
  }

  /**
   * Get preference for a specific category
   * @param category Notification category
   * @returns Notification preference for the category
   */
  static async getPreference(category: import('@/types/notification').NotificationCategory): Promise<import('@/types/notification').NotificationPreference> {
    return ApiClient.get<import('@/types/notification').NotificationPreference>(`/notifications/preferences/${category}`);
  }

  /**
   * Update preference for a specific category
   * @param category Notification category
   * @param data Preference update data
   * @returns Updated notification preference
   */
  static async updatePreference(
    category: import('@/types/notification').NotificationCategory,
    data: import('@/types/notification').UpdateNotificationPreferenceData
  ): Promise<import('@/types/notification').NotificationPreference> {
    return ApiClient.patch<import('@/types/notification').NotificationPreference>(
      `/notifications/preferences/${category}`,
      data
    );
  }

  /**
   * Set Do Not Disturb settings
   * @param data DND settings data
   * @returns Updated notification preferences
   */
  static async setDND(data: import('@/types/notification').DNDSettingsData): Promise<import('@/types/notification').NotificationPreference[]> {
    return ApiClient.patch<import('@/types/notification').NotificationPreference[]>(
      '/notifications/preferences/dnd',
      data
    );
  }

  /**
   * Reset all preferences to defaults
   * @returns Default notification preferences
   */
  static async resetToDefaults(): Promise<import('@/types/notification').NotificationPreference[]> {
    return ApiClient.post<import('@/types/notification').NotificationPreference[]>(
      '/notifications/preferences/reset',
      {}
    );
  }
}

/**
 * Notification Template API endpoints (admin only)
 */
export class NotificationTemplateApi {
  /**
   * Get all notification templates
   * @param params Optional filter parameters
   * @returns Array of notification templates
   */
  static async getAll(params?: import('@/types/notification').TemplateFiltersParams): Promise<import('@/types/notification').NotificationTemplate[]> {
    return ApiClient.get<import('@/types/notification').NotificationTemplate[]>(
      '/notifications/templates',
      params as Record<string, unknown>
    );
  }

  /**
   * Get template by unique key
   * @param key Template key
   * @returns Notification template
   */
  static async getByKey(key: string): Promise<import('@/types/notification').NotificationTemplate> {
    return ApiClient.get<import('@/types/notification').NotificationTemplate>(`/notifications/templates/${key}`);
  }

  /**
   * Create a new notification template (admin only)
   * @param data Template creation data
   * @returns Created notification template
   */
  static async create(data: import('@/types/notification').CreateNotificationTemplateData): Promise<import('@/types/notification').NotificationTemplate> {
    return ApiClient.post<import('@/types/notification').NotificationTemplate>('/notifications/templates', data);
  }

  /**
   * Update an existing notification template (admin only)
   * @param id Template ID
   * @param data Template update data
   * @returns Updated notification template
   */
  static async update(
    id: string,
    data: import('@/types/notification').UpdateNotificationTemplateData
  ): Promise<import('@/types/notification').NotificationTemplate> {
    return ApiClient.patch<import('@/types/notification').NotificationTemplate>(
      `/notifications/templates/${id}`,
      data
    );
  }

  /**
   * Delete a notification template (admin only)
   * @param id Template ID
   * @returns Success message
   */
  static async delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/notifications/templates/${id}`);
  }

  /**
   * Test template rendering with variables
   * @param key Template key
   * @param data Variables for rendering
   * @returns Rendered template with title and message
   */
  static async testRender(
    key: string,
    data: import('@/types/notification').RenderTemplateData
  ): Promise<import('@/types/notification').RenderedTemplate> {
    return ApiClient.post<import('@/types/notification').RenderedTemplate>(
      `/notifications/templates/${key}/test`,
      data
    );
  }
}

/**
 * Pages API endpoints
 */
export class PagesApi {
  /**
   * Get all published pages (public)
   * @param params Query parameters for filtering pages
   * @returns Paginated list of published pages
   */
  static async getAllPublic(params?: import('@/types/pages').PageQueryDto): Promise<import('@/types/pages').PaginatedPagesResponse> {
    return ApiClient.get<import('@/types/pages').PaginatedPagesResponse>('/pages', params as Record<string, unknown>);
  }

  /**
   * Get page by slug (public)
   * @param slug Page slug
   * @returns Page with children
   */
  static async getBySlug(slug: string): Promise<import('@/types/pages').CustomPage> {
    return ApiClient.get<import('@/types/pages').CustomPage>(`/pages/slug/${slug}`);
  }

  /**
   * Get page hierarchy for navigation (public)
   * @returns Hierarchical tree of pages
   */
  static async getHierarchy(): Promise<import('@/types/pages').PageHierarchyNode[]> {
    return ApiClient.get<import('@/types/pages').PageHierarchyNode[]>('/pages/hierarchy');
  }

  /**
   * Get all pages with filters (admin)
   * Requires pages:read permission
   * @param params Query parameters for filtering pages
   * @returns Paginated list of all pages
   */
  static async getAll(params?: import('@/types/pages').PageQueryDto): Promise<import('@/types/pages').PaginatedPagesResponse> {
    return ApiClient.get<import('@/types/pages').PaginatedPagesResponse>('/pages/admin', params as Record<string, unknown>);
  }

  /**
   * Get page by ID (admin)
   * Requires pages:read permission
   * @param id Page ID
   * @returns Page with relations
   */
  static async getById(id: string): Promise<import('@/types/pages').CustomPage> {
    return ApiClient.get<import('@/types/pages').CustomPage>(`/pages/admin/${id}`);
  }

  /**
   * Create new page
   * Requires pages:write permission
   * @param data Page creation data
   * @returns Created page
   */
  static async create(data: import('@/types/pages').CreatePageDto): Promise<import('@/types/pages').CustomPage> {
    return ApiClient.post<import('@/types/pages').CustomPage>('/pages', data);
  }

  /**
   * Update page
   * Requires pages:write permission
   * @param id Page ID
   * @param data Page update data
   * @returns Updated page
   */
  static async update(id: string, data: import('@/types/pages').UpdatePageDto): Promise<import('@/types/pages').CustomPage> {
    return ApiClient.patch<import('@/types/pages').CustomPage>(`/pages/${id}`, data);
  }

  /**
   * Delete page
   * Requires pages:delete permission
   * @param id Page ID
   * @returns Success message
   */
  static async delete(id: string): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>(`/pages/${id}`);
  }

  /**
   * Publish page
   * Requires pages:publish permission
   * @param id Page ID
   * @returns Published page
   */
  static async publish(id: string): Promise<import('@/types/pages').CustomPage> {
    return ApiClient.patch<import('@/types/pages').CustomPage>(`/pages/${id}/publish`, {});
  }

  /**
   * Unpublish page
   * Requires pages:publish permission
   * @param id Page ID
   * @returns Unpublished page
   */
  static async unpublish(id: string): Promise<import('@/types/pages').CustomPage> {
    return ApiClient.patch<import('@/types/pages').CustomPage>(`/pages/${id}/unpublish`, {});
  }

  /**
   * Reorder pages
   * Requires pages:write permission
   * @param data Array of page order updates
   * @returns Success message
   */
  static async reorder(data: import('@/types/pages').ReorderPagesDto): Promise<{ message: string }> {
    return ApiClient.post<{ message: string }>('/pages/reorder', data);
  }

  /**
   * Validate slug availability
   * Requires pages:write permission
   * @param data Slug validation data
   * @returns Validation result
   */
  static async validateSlug(data: import('@/types/pages').ValidateSlugDto): Promise<import('@/types/pages').ValidateSlugResponse> {
    return ApiClient.post<import('@/types/pages').ValidateSlugResponse>('/pages/validate-slug', data);
  }

  /**
   * Upload featured image
   * Requires pages:write permission
   * @param file Image file to upload
   * @param onProgress Optional progress callback
   * @returns Upload response with file details
   */
  static async uploadFeaturedImage(
    file: File,
    onProgress?: (progress: import('@/types/upload').UploadProgress) => void
  ): Promise<import('@/types/upload').UploadResponse> {
    return UploadApi.uploadFile(file, { type: 'image' }, onProgress);
  }
}

/**
 * Profile API endpoints
 */
export class ProfileApi {
  /**
   * Get current user profile
   * @returns User profile with all fields
   */
  static async getProfile(): Promise<import('@/types/profile').ProfileResponse> {
    return ApiClient.get<import('@/types/profile').ProfileResponse>('/profile');
  }

  /**
   * Update profile information
   * @param data Profile update data
   * @returns Updated profile
   */
  static async updateProfile(data: import('@/types/profile').UpdateProfileData): Promise<import('@/types/profile').ProfileResponse> {
    return ApiClient.patch<import('@/types/profile').ProfileResponse>('/profile', data);
  }

  /**
   * Upload profile avatar
   * @param file Image file to upload
   * @param onProgress Optional progress callback
   * @returns Avatar upload response
   */
  static async uploadAvatar(
    file: File,
    onProgress?: (progress: import('@/types/upload').UploadProgress) => void
  ): Promise<import('@/types/profile').AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress({
              percent: Math.round((event.loaded / event.total) * 100),
              loaded: event.loaded,
              total: event.total,
            });
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new ApiError('Invalid response format', xhr.status));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new ApiError(error.message || 'Upload failed', xhr.status, error));
          } catch {
            reject(new ApiError('Upload failed', xhr.status));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new ApiError('Network error during upload', 0));
      });

      xhr.addEventListener('abort', () => {
        reject(new ApiError('Upload cancelled', 0));
      });

      // Send request
      const token = ApiClient.getAccessToken();
      xhr.open('POST', `${API_BASE_URL}/profile/avatar`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  /**
   * Delete profile avatar
   * @returns Success message
   */
  static async deleteAvatar(): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>('/profile/avatar');
  }

  /**
   * Change password
   * @param data Password change data
   * @returns Success message
   */
  static async changePassword(data: import('@/types/profile').ChangePasswordData): Promise<{ message: string }> {
    return ApiClient.post<{ message: string }>('/profile/password', data);
  }
}

/**
 * Landing Page API endpoints
 */
export class LandingApi {
  /**
   * Get landing page content (public)
   * @returns Landing page content
   */
  static async getContent(): Promise<import('@/types/landing-page').LandingPageContent> {
    return ApiClient.get<import('@/types/landing-page').LandingPageContent>('/landing');
  }

  /**
   * Get landing page content (admin)
   * Requires landing:read permission
   * @returns Landing page content with full details
   */
  static async getContentAdmin(): Promise<import('@/types/landing-page').LandingPageContent> {
    return ApiClient.get<import('@/types/landing-page').LandingPageContent>('/landing/admin');
  }

  /**
   * Update landing page content
   * Requires landing:write permission
   * @param data Landing page update data
   * @returns Updated landing page content
   */
  static async updateContent(data: import('@/types/landing-page').UpdateLandingPageContentDto): Promise<import('@/types/landing-page').LandingPageContent> {
    return ApiClient.patch<import('@/types/landing-page').LandingPageContent>('/landing', data);
  }

  /**
   * Reset landing page to defaults
   * Requires landing:write permission
   * @returns Default landing page content
   */
  static async resetToDefaults(): Promise<import('@/types/landing-page').LandingPageContent> {
    return ApiClient.post<import('@/types/landing-page').LandingPageContent>('/landing/reset', {});
  }

  /**
   * Upload section image
   * Requires landing:write permission
   * @param file Image file to upload
   * @param onProgress Optional progress callback
   * @returns Upload response with file details
   */
  static async uploadSectionImage(
    file: File,
    onProgress?: (progress: import('@/types/upload').UploadProgress) => void
  ): Promise<import('@/types/upload').UploadResponse> {
    return UploadApi.uploadFile(file, { type: 'image' }, onProgress);
  }
}

/**
 * E-Commerce API endpoints
 */

/**
 * Products API endpoints
 */
export class ProductsApi {
  /**
   * Get all products with filters
   * @param params Query parameters for filtering products
   * @returns Paginated list of products
   */
  static async getAll(params?: import('@/types/ecommerce').ProductQueryDto): Promise<import('@/types/ecommerce').ProductListResponse> {
    return ApiClient.get<import('@/types/ecommerce').ProductListResponse>('/products', params as Record<string, unknown>);
  }

  /**
   * Get product by ID
   * @param id Product ID
   * @returns Product with relations
   */
  static async getById(id: string): Promise<import('@/types/ecommerce').Product> {
    return ApiClient.get<import('@/types/ecommerce').Product>(`/products/${id}`);
  }

  /**
   * Get product by slug
   * @param slug Product slug
   * @returns Product with relations
   */
  static async getBySlug(slug: string): Promise<import('@/types/ecommerce').Product> {
    return ApiClient.get<import('@/types/ecommerce').Product>(`/products/slug/${slug}`);
  }

  /**
   * Create new product
   * Requires products:write permission
   * @param data Product creation data
   * @returns Created product
   */
  static async create(data: import('@/types/ecommerce').CreateProductDto): Promise<import('@/types/ecommerce').Product> {
    return ApiClient.post<import('@/types/ecommerce').Product>('/products', data);
  }

  /**
   * Update product
   * Requires products:write permission
   * @param id Product ID
   * @param data Product update data
   * @returns Updated product
   */
  static async update(id: string, data: import('@/types/ecommerce').UpdateProductDto): Promise<import('@/types/ecommerce').Product> {
    return ApiClient.patch<import('@/types/ecommerce').Product>(`/products/${id}`, data);
  }

  /**
   * Delete product
   * Requires products:delete permission
   * @param id Product ID
   * @returns Success message
   */
  static async delete(id: string): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>(`/products/${id}`);
  }

  /**
   * Publish product
   * Requires products:publish permission
   * @param id Product ID
   * @returns Published product
   */
  static async publish(id: string): Promise<import('@/types/ecommerce').Product> {
    return ApiClient.patch<import('@/types/ecommerce').Product>(`/products/${id}/publish`, {});
  }

  /**
   * Unpublish product
   * Requires products:publish permission
   * @param id Product ID
   * @returns Unpublished product
   */
  static async unpublish(id: string): Promise<import('@/types/ecommerce').Product> {
    return ApiClient.patch<import('@/types/ecommerce').Product>(`/products/${id}/unpublish`, {});
  }

  /**
   * Add variant to product
   * Requires products:write permission
   * @param productId Product ID
   * @param data Variant creation data
   * @returns Created variant
   */
  static async addVariant(productId: string, data: Omit<import('@/types/ecommerce').CreateProductVariantDto, 'productId'>): Promise<import('@/types/ecommerce').ProductVariant> {
    return ApiClient.post<import('@/types/ecommerce').ProductVariant>(`/products/${productId}/variants`, data);
  }

  /**
   * Update product variant
   * Requires products:write permission
   * @param variantId Variant ID
   * @param data Variant update data
   * @returns Updated variant
   */
  static async updateVariant(variantId: string, data: import('@/types/ecommerce').UpdateProductVariantDto): Promise<import('@/types/ecommerce').ProductVariant> {
    return ApiClient.patch<import('@/types/ecommerce').ProductVariant>(`/products/variants/${variantId}`, data);
  }

  /**
   * Delete product variant
   * Requires products:delete permission
   * @param variantId Variant ID
   * @returns Success message
   */
  static async deleteVariant(variantId: string): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>(`/products/variants/${variantId}`);
  }

  /**
   * Bulk update product status
   * Requires products:write permission
   * @param ids Array of product IDs
   * @param status New status
   * @returns Success message with count
   */
  static async bulkUpdateStatus(ids: string[], status: import('@/types/ecommerce').ProductStatus): Promise<{ message: string; count: number }> {
    return ApiClient.post<{ message: string; count: number }>('/products/bulk-status', { ids, status });
  }

  /**
   * Upload product image
   * Requires products:write permission
   * @param file Image file to upload
   * @param onProgress Optional progress callback
   * @returns Upload response with file details
   */
  static async uploadImage(
    file: File,
    onProgress?: (progress: import('@/types/upload').UploadProgress) => void
  ): Promise<import('@/types/upload').UploadResponse> {
    return UploadApi.uploadFile(file, { type: 'image' }, onProgress);
  }
}

/**
 * Customers API endpoints
 */
export class CustomersApi {
  /**
   * Get all customers with filters
   * @param params Query parameters for filtering customers
   * @returns Paginated list of customers
   */
  static async getAll(params?: import('@/types/ecommerce').CustomerQueryDto): Promise<import('@/types/ecommerce').CustomerListResponse> {
    return ApiClient.get<import('@/types/ecommerce').CustomerListResponse>('/customers', params as Record<string, unknown>);
  }

  /**
   * Get customer by ID
   * @param id Customer ID
   * @returns Customer with orders
   */
  static async getById(id: string): Promise<import('@/types/ecommerce').Customer> {
    return ApiClient.get<import('@/types/ecommerce').Customer>(`/customers/${id}`);
  }

  /**
   * Create new customer
   * Requires customers:write permission
   * @param data Customer creation data
   * @returns Created customer
   */
  static async create(data: import('@/types/ecommerce').CreateCustomerDto): Promise<import('@/types/ecommerce').Customer> {
    return ApiClient.post<import('@/types/ecommerce').Customer>('/customers', data);
  }

  /**
   * Update customer
   * Requires customers:write permission
   * @param id Customer ID
   * @param data Customer update data
   * @returns Updated customer
   */
  static async update(id: string, data: import('@/types/ecommerce').UpdateCustomerDto): Promise<import('@/types/ecommerce').Customer> {
    return ApiClient.patch<import('@/types/ecommerce').Customer>(`/customers/${id}`, data);
  }

  /**
   * Delete customer
   * Requires customers:delete permission
   * @param id Customer ID
   * @returns Success message
   */
  static async delete(id: string): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>(`/customers/${id}`);
  }

  /**
   * Generate portal token for customer
   * Requires customers:write permission
   * @param id Customer ID
   * @returns Customer with new portal token
   */
  static async generatePortalToken(id: string): Promise<import('@/types/ecommerce').Customer> {
    return ApiClient.post<import('@/types/ecommerce').Customer>(`/customers/${id}/portal-token`, {});
  }

  /**
   * Get customer by portal token (public endpoint)
   * @param token Portal token
   * @returns Customer with orders
   */
  static async getByPortalToken(token: string): Promise<import('@/types/ecommerce').Customer> {
    return ApiClient.get<import('@/types/ecommerce').Customer>(`/customers/portal/${token}`);
  }

  /**
   * Get customer order history
   * Requires customers:read permission
   * @param id Customer ID
   * @returns Array of customer orders
   */
  static async getOrderHistory(id: string): Promise<import('@/types/ecommerce').Order[]> {
    return ApiClient.get<import('@/types/ecommerce').Order[]>(`/customers/${id}/orders`);
  }

  /**
   * Get customer statistics
   * Requires customers:read permission
   * @param id Customer ID
   * @returns Customer statistics including lifetime value and order count
   */
  static async getStatistics(id: string): Promise<{
    totalOrders: number;
    lifetimeValue: string;
    averageOrderValue: string;
    lastOrderDate?: string;
  }> {
    return ApiClient.get<{
      totalOrders: number;
      lifetimeValue: string;
      averageOrderValue: string;
      lastOrderDate?: string;
    }>(`/customers/${id}/statistics`);
  }
}

// Convenience exports for customer management
export const getCustomers = CustomersApi.getAll;
export const getCustomer = CustomersApi.getById;
export const createCustomer = CustomersApi.create;
export const updateCustomer = CustomersApi.update;
export const deleteCustomer = CustomersApi.delete;
export const generateCustomerPortalToken = CustomersApi.generatePortalToken;
export const getCustomerByPortalToken = CustomersApi.getByPortalToken;
export const getCustomerOrderHistory = CustomersApi.getOrderHistory;
export const getCustomerStatistics = CustomersApi.getStatistics;

/**
 * Orders API endpoints
 */
export class OrdersApi {
  /**
   * Get all orders with filters
   * @param params Query parameters for filtering orders
   * @returns Paginated list of orders
   */
  static async getAll(params?: import('@/types/ecommerce').OrderQueryDto): Promise<import('@/types/ecommerce').OrderListResponse> {
    return ApiClient.get<import('@/types/ecommerce').OrderListResponse>('/orders', params as Record<string, unknown>);
  }

  /**
   * Get order by ID
   * @param id Order ID
   * @returns Order with items and customer
   */
  static async getById(id: string): Promise<import('@/types/ecommerce').Order> {
    return ApiClient.get<import('@/types/ecommerce').Order>(`/orders/${id}`);
  }

  /**
   * Get order by order number
   * @param orderNumber Order number
   * @returns Order with items and customer
   */
  static async getByOrderNumber(orderNumber: string): Promise<import('@/types/ecommerce').Order> {
    return ApiClient.get<import('@/types/ecommerce').Order>(`/orders/number/${orderNumber}`);
  }

  /**
   * Create new order
   * Requires orders:write permission
   * @param data Order creation data
   * @returns Created order
   */
  static async create(data: import('@/types/ecommerce').CreateOrderDto): Promise<import('@/types/ecommerce').Order> {
    return ApiClient.post<import('@/types/ecommerce').Order>('/orders', data);
  }

  /**
   * Update order
   * Requires orders:write permission
   * @param id Order ID
   * @param data Order update data
   * @returns Updated order
   */
  static async update(id: string, data: import('@/types/ecommerce').UpdateOrderDto): Promise<import('@/types/ecommerce').Order> {
    return ApiClient.patch<import('@/types/ecommerce').Order>(`/orders/${id}`, data);
  }

  /**
   * Update order status
   * Requires orders:write permission
   * @param id Order ID
   * @param status New order status
   * @param notes Optional notes about the status change
   * @returns Updated order
   */
  static async updateStatus(id: string, status: import('@/types/ecommerce').OrderStatus, notes?: string): Promise<import('@/types/ecommerce').Order> {
    return ApiClient.patch<import('@/types/ecommerce').Order>(`/orders/${id}/status`, { status, notes });
  }

  /**
   * Cancel order
   * Requires orders:write permission
   * @param id Order ID
   * @param reason Optional cancellation reason
   * @returns Cancelled order
   */
  static async cancel(id: string, reason?: string): Promise<import('@/types/ecommerce').Order> {
    return ApiClient.post<import('@/types/ecommerce').Order>(`/orders/${id}/cancel`, { reason });
  }

  /**
   * Add note to order
   * Requires orders:write permission
   * @param id Order ID
   * @param note Note text
   * @returns Updated order
   */
  static async addNote(id: string, note: string): Promise<import('@/types/ecommerce').Order> {
    return ApiClient.post<import('@/types/ecommerce').Order>(`/orders/${id}/notes`, { note });
  }

  /**
   * Get order status history
   * Requires orders:read permission
   * @param id Order ID
   * @returns Array of status history entries
   */
  static async getStatusHistory(id: string): Promise<import('@/types/ecommerce').OrderStatusHistory[]> {
    return ApiClient.get<import('@/types/ecommerce').OrderStatusHistory[]>(`/orders/${id}/history`);
  }
}

// Convenience exports for order management
export const getOrders = OrdersApi.getAll;
export const getOrder = OrdersApi.getById;
export const getOrderByNumber = OrdersApi.getByOrderNumber;
export const createOrder = OrdersApi.create;
export const updateOrder = OrdersApi.update;
export const updateOrderStatus = OrdersApi.updateStatus;
export const cancelOrder = OrdersApi.cancel;
export const addOrderNote = OrdersApi.addNote;
export const getOrderStatusHistory = OrdersApi.getStatusHistory;

/**
 * Inventory API endpoints
 */
export class InventoryApi {
  /**
   * Get inventory by product variant ID
   * @param productVariantId Product variant ID
   * @returns Inventory details
   */
  static async getByVariantId(productVariantId: string): Promise<import('@/types/ecommerce').Inventory> {
    return ApiClient.get<import('@/types/ecommerce').Inventory>(`/inventory/variant/${productVariantId}`);
  }

  /**
   * Update inventory
   * Requires inventory:write permission
   * @param id Inventory ID
   * @param data Inventory update data
   * @returns Updated inventory
   */
  static async update(id: string, data: import('@/types/ecommerce').UpdateInventoryDto): Promise<import('@/types/ecommerce').Inventory> {
    return ApiClient.patch<import('@/types/ecommerce').Inventory>(`/inventory/${id}`, data);
  }

  /**
   * Adjust inventory quantity
   * Requires inventory:write permission
   * @param data Inventory adjustment data with productVariantId
   * @returns Updated inventory record
   */
  static async adjust(data: import('@/types/ecommerce').AdjustInventoryDto): Promise<import('@/types/ecommerce').Inventory> {
    return ApiClient.post<import('@/types/ecommerce').Inventory>('/inventory/adjust', data);
  }

  /**
   * Get adjustment history for an inventory record
   * Requires inventory:read permission
   * @param inventoryId Inventory ID
   * @returns Array of inventory adjustments
   */
  static async getAdjustmentHistory(inventoryId: string): Promise<import('@/types/ecommerce').InventoryAdjustment[]> {
    return ApiClient.get<import('@/types/ecommerce').InventoryAdjustment[]>(`/inventory/${inventoryId}/history`);
  }

  /**
   * Get all inventory records with filtering and pagination
   * Requires inventory:read permission
   * @param query Query parameters for filtering
   * @returns Paginated inventory list
   */
  static async getAll(query?: import('@/types/ecommerce').InventoryQueryDto): Promise<import('@/types/ecommerce').PaginatedResponse<import('@/types/ecommerce').Inventory>> {
    return ApiClient.get<import('@/types/ecommerce').PaginatedResponse<import('@/types/ecommerce').Inventory>>('/inventory', query as Record<string, unknown>);
  }

  /**
   * Get items with low stock
   * Requires inventory:read permission
   * @returns Array of low stock inventory items
   */
  static async getLowStockItems(): Promise<import('@/types/ecommerce').Inventory[]> {
    return ApiClient.get<import('@/types/ecommerce').Inventory[]>('/inventory/low-stock');
  }

  /**
   * Reserve stock for an order
   * Requires inventory:write permission
   * @param data Reserve stock data
   * @returns Updated inventory
   */
  static async reserveStock(data: import('@/types/ecommerce').ReserveStockDto): Promise<import('@/types/ecommerce').Inventory> {
    return ApiClient.post<import('@/types/ecommerce').Inventory>('/inventory/reserve', data);
  }

  /**
   * Release reserved stock (e.g., order cancellation)
   * Requires inventory:write permission
   * @param data Release stock data
   * @returns Updated inventory
   */
  static async releaseStock(data: import('@/types/ecommerce').ReleaseStockDto): Promise<import('@/types/ecommerce').Inventory> {
    return ApiClient.post<import('@/types/ecommerce').Inventory>('/inventory/release', data);
  }

  /**
   * Check stock availability for a variant
   * Requires inventory:read permission
   * @param variantId Product variant ID
   * @param quantity Quantity to check
   * @returns Availability status
   */
  static async checkAvailability(variantId: string, quantity: number): Promise<{ available: boolean; currentStock: number }> {
    return ApiClient.get<{ available: boolean; currentStock: number }>(`/inventory/check/${variantId}/${quantity}`);
  }
}

// Convenience exports for product management
export const getProducts = ProductsApi.getAll;
export const getProduct = ProductsApi.getById;
export const getProductBySlug = ProductsApi.getBySlug;
export const createProduct = ProductsApi.create;
export const updateProduct = ProductsApi.update;
export const deleteProduct = ProductsApi.delete;
export const publishProduct = ProductsApi.publish;
export const unpublishProduct = ProductsApi.unpublish;
export const addProductVariant = ProductsApi.addVariant;
export const updateProductVariant = (productId: string, variantId: string, data: import('@/types/ecommerce').UpdateProductVariantDto) => {
  // The API expects just the variantId, not productId
  return ProductsApi.updateVariant(variantId, data);
};
export const deleteProductVariant = (productId: string, variantId: string) => {
  // The API expects just the variantId, not productId
  return ProductsApi.deleteVariant(variantId);
};
export const bulkUpdateProductStatus = ProductsApi.bulkUpdateStatus;

/**
 * E-Commerce Settings API endpoints
 */
export class EcommerceSettingsApi {
  /**
   * Get global e-commerce settings
   * @returns Global e-commerce settings
   */
  static async getGlobal(): Promise<import('@/types/ecommerce').EcommerceSettings> {
    return ApiClient.get<import('@/types/ecommerce').EcommerceSettings>('/ecommerce-settings/global');
  }

  /**
   * Get e-commerce settings by user ID
   * Requires ecommerce:read permission
   * @param userId User ID
   * @returns User-specific e-commerce settings
   */
  static async getByUserId(userId: string): Promise<import('@/types/ecommerce').EcommerceSettings> {
    return ApiClient.get<import('@/types/ecommerce').EcommerceSettings>(`/ecommerce-settings/user/${userId}`);
  }

  /**
   * Get e-commerce settings by ID
   * Requires ecommerce:read permission
   * @param id Settings ID
   * @returns E-commerce settings
   */
  static async getById(id: string): Promise<import('@/types/ecommerce').EcommerceSettings> {
    return ApiClient.get<import('@/types/ecommerce').EcommerceSettings>(`/ecommerce-settings/${id}`);
  }

  /**
   * Create e-commerce settings
   * Requires ecommerce:write permission
   * @param data Settings data
   * @returns Created settings
   */
  static async create(data: import('@/types/ecommerce').CreateEcommerceSettingsDto): Promise<import('@/types/ecommerce').EcommerceSettings> {
    return ApiClient.post<import('@/types/ecommerce').EcommerceSettings>('/ecommerce-settings', data);
  }

  /**
   * Update e-commerce settings
   * Requires ecommerce:write permission
   * @param id Settings ID
   * @param data Updated settings data
   * @returns Updated settings
   */
  static async update(id: string, data: import('@/types/ecommerce').UpdateEcommerceSettingsDto): Promise<import('@/types/ecommerce').EcommerceSettings> {
    return ApiClient.patch<import('@/types/ecommerce').EcommerceSettings>(`/ecommerce-settings/${id}`, data);
  }

  /**
   * Delete e-commerce settings (reset to defaults)
   * Requires ecommerce:write permission
   * @param id Settings ID
   */
  static async delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/ecommerce-settings/${id}`);
  }
}

/**
 * Cart API endpoints
 */
export class CartApi {
  /**
   * Get cart (supports both guest and authenticated users)
   * @param sessionId Session ID for guest users
   * @returns Cart with items
   */
  static async getCart(sessionId?: string): Promise<import('@/types/ecommerce').Cart> {
    const params = sessionId ? { sessionId } : undefined;
    return ApiClient.get<import('@/types/ecommerce').Cart>('/cart', params);
  }

  /**
   * Add item to cart
   * @param data Add to cart data
   * @returns Updated cart
   */
  static async addToCart(data: import('@/types/ecommerce').AddToCartDto): Promise<import('@/types/ecommerce').Cart> {
    return ApiClient.post<import('@/types/ecommerce').Cart>('/cart/items', data);
  }

  /**
   * Update cart item quantity
   * @param itemId Cart item ID
   * @param data Update data
   * @returns Updated cart
   */
  static async updateCartItem(
    itemId: string,
    data: import('@/types/ecommerce').UpdateCartItemDto
  ): Promise<import('@/types/ecommerce').Cart> {
    return ApiClient.patch<import('@/types/ecommerce').Cart>(`/cart/items/${itemId}`, data);
  }

  /**
   * Remove item from cart
   * @param itemId Cart item ID
   * @returns Updated cart
   */
  static async removeCartItem(itemId: string): Promise<import('@/types/ecommerce').Cart> {
    return ApiClient.delete<import('@/types/ecommerce').Cart>(`/cart/items/${itemId}`);
  }

  /**
   * Clear all items from cart
   * @param cartId Cart ID
   * @returns Empty cart
   */
  static async clearCart(cartId: string): Promise<import('@/types/ecommerce').Cart> {
    return ApiClient.delete<import('@/types/ecommerce').Cart>(`/cart/${cartId}`);
  }

  /**
   * Merge guest cart with user cart on login
   * @param sessionId Guest session ID
   * @returns Merged cart
   */
  static async mergeCart(sessionId: string): Promise<import('@/types/ecommerce').Cart> {
    return ApiClient.post<import('@/types/ecommerce').Cart>('/cart/merge', { sessionId });
  }

  /**
   * Validate cart inventory before checkout
   * @param sessionId Session ID for guest users
   * @param userId User ID for authenticated users (optional)
   * @returns Validation result with any errors
   */
  static async validateCart(sessionId?: string, userId?: string): Promise<import('@/types/storefront').ValidateCartResponse> {
    return ApiClient.post<import('@/types/storefront').ValidateCartResponse>('/cart/validate', { sessionId, userId });
  }

  /**
   * Get cart totals (subtotal, tax, shipping, total)
   * @param cartId Cart ID
   * @param shippingAddress Optional shipping address for tax calculation
   * @param shippingMethodId Optional shipping method for shipping cost
   * @returns Cart totals
   */
  static async getCartTotals(
    cartId: string,
    shippingAddress?: import('@/types/ecommerce').Address,
    shippingMethodId?: string
  ): Promise<import('@/types/storefront').CartTotals> {
    return ApiClient.post<import('@/types/storefront').CartTotals>('/cart/totals', {
      cartId,
      shippingAddress,
      shippingMethodId,
    });
  }
}

/**
 * Storefront API endpoints (Public-Facing E-Commerce)
 */
export class StorefrontApi {
  /**
   * Get published products for public storefront with filtering and pagination
   * Public endpoint - no authentication required
   * @param query Query parameters for filtering products
   * @returns Paginated list of published products
   */
  static async getPublicProducts(query?: import('@/types/ecommerce').StorefrontQueryDto): Promise<import('@/types/ecommerce').StorefrontProductListResponseDto> {
    return ApiClient.get<import('@/types/ecommerce').StorefrontProductListResponseDto>('/storefront/products', query as Record<string, unknown>);
  }

  /**
   * Get product by slug for product detail page
   * Public endpoint - no authentication required
   * @param slug Product slug
   * @returns Product with variants and inventory
   */
  static async getProductBySlug(slug: string): Promise<import('@/types/ecommerce').StorefrontProductResponseDto> {
    return ApiClient.get<import('@/types/ecommerce').StorefrontProductResponseDto>(`/storefront/products/${slug}`);
  }

  /**
   * Get products by category slug
   * Public endpoint - no authentication required
   * @param categorySlug Category slug
   * @param query Additional query parameters
   * @returns Paginated list of products in category
   */
  static async getProductsByCategory(categorySlug: string, query?: import('@/types/ecommerce').StorefrontQueryDto): Promise<import('@/types/ecommerce').StorefrontProductListResponseDto> {
    return ApiClient.get<import('@/types/ecommerce').StorefrontProductListResponseDto>(`/storefront/categories/${categorySlug}/products`, query as Record<string, unknown>);
  }

  /**
   * Search products by query
   * Public endpoint - no authentication required
   * @param searchQuery Search query string
   * @param query Additional query parameters
   * @returns Paginated list of matching products
   */
  static async searchProducts(searchQuery: string, query?: import('@/types/ecommerce').StorefrontQueryDto): Promise<import('@/types/ecommerce').StorefrontProductListResponseDto> {
    return ApiClient.get<import('@/types/ecommerce').StorefrontProductListResponseDto>('/storefront/search', {
      ...query,
      search: searchQuery,
    } as Record<string, unknown>);
  }

  /**
   * Get related products based on category
   * Public endpoint - no authentication required
   * @param productId Product ID
   * @param limit Maximum number of related products to return
   * @returns Array of related products
   */
  static async getRelatedProducts(productId: string, limit: number = 6): Promise<import('@/types/ecommerce').StorefrontProductResponseDto[]> {
    return ApiClient.get<import('@/types/ecommerce').StorefrontProductResponseDto[]>(`/storefront/products/${productId}/related`, { limit } as Record<string, unknown>);
  }

  /**
   * Get all categories with product counts
   * Public endpoint - no authentication required
   * @returns Array of categories with subcategories and product counts
   */
  static async getCategories(): Promise<import('@/types/ecommerce').StorefrontCategoryResponseDto[]> {
    return ApiClient.get<import('@/types/ecommerce').StorefrontCategoryResponseDto[]>('/storefront/categories');
  }
}

// Convenience exports for storefront
export const getStorefrontProducts = StorefrontApi.getPublicProducts;
export const getStorefrontProduct = StorefrontApi.getProductBySlug;
export const getStorefrontProductsByCategory = StorefrontApi.getProductsByCategory;
export const searchStorefrontProducts = StorefrontApi.searchProducts;
export const getRelatedStorefrontProducts = StorefrontApi.getRelatedProducts;
export const getStorefrontCategories = StorefrontApi.getCategories;

/**
 * Checkout API endpoints
 */
export class CheckoutApi {
  /**
   * Validate checkout data before order creation
   * @param data Checkout validation data
   * @returns Validation result
   */
  static async validateCheckout(data: import('@/types/storefront').ValidateCheckoutDto): Promise<import('@/types/storefront').ValidateCheckoutResponse> {
    return ApiClient.post<import('@/types/storefront').ValidateCheckoutResponse>('/checkout/validate', data);
  }

  /**
   * Calculate shipping cost for cart
   * @param data Shipping calculation data
   * @returns Shipping cost and available methods
   */
  static async calculateShipping(data: import('@/types/storefront').CalculateShippingDto): Promise<import('@/types/storefront').CalculateShippingResponse> {
    return ApiClient.post<import('@/types/storefront').CalculateShippingResponse>('/checkout/calculate-shipping', data);
  }

  /**
   * Calculate tax for cart
   * @param data Tax calculation data
   * @returns Tax amount and rate
   */
  static async calculateTax(data: import('@/types/storefront').CalculateTaxDto): Promise<import('@/types/storefront').CalculateTaxResponse> {
    return ApiClient.post<import('@/types/storefront').CalculateTaxResponse>('/checkout/calculate-tax', data);
  }

  /**
   * Create order from cart
   * @param data Order creation data
   * @returns Order confirmation
   */
  static async createOrder(data: import('@/types/storefront').CreateOrderFromCartDto): Promise<import('@/types/storefront').OrderConfirmation> {
    return ApiClient.post<import('@/types/storefront').OrderConfirmation>('/checkout/create-order', data);
  }

  /**
   * Get available payment methods
   * @returns Array of available payment methods
   */
  static async getPaymentMethods(): Promise<import('@/types/storefront').PaymentMethodOption[]> {
    return ApiClient.get<import('@/types/storefront').PaymentMethodOption[]>('/checkout/payment-methods');
  }

  /**
   * Get available shipping methods
   * @returns Array of available shipping methods
   */
  static async getShippingMethods(): Promise<import('@/types/storefront').ShippingMethodOption[]> {
    return ApiClient.get<import('@/types/storefront').ShippingMethodOption[]>('/checkout/shipping-methods');
  }
}

/**
 * Customer Auth API endpoints (separate from admin auth)
 */
export class CustomerAuthApi {
  /**
   * Register new customer account
   * Public endpoint
   * @param data Customer registration data
   * @returns Auth response with tokens and customer data
   */
  static async register(data: import('@/types/storefront').RegisterCustomerDto): Promise<import('@/types/storefront').CustomerAuthResponse> {
    return ApiClient.post<import('@/types/storefront').CustomerAuthResponse>('/customer-auth/register', data);
  }

  /**
   * Login customer
   * Public endpoint
   * @param data Customer login credentials
   * @returns Auth response with tokens and customer data
   */
  static async login(data: import('@/types/storefront').LoginCustomerDto): Promise<import('@/types/storefront').CustomerAuthResponse> {
    return ApiClient.post<import('@/types/storefront').CustomerAuthResponse>('/customer-auth/login', data);
  }

  /**
   * Logout customer
   * Requires customer authentication
   * @returns Success message
   */
  static async logout(): Promise<{ message: string }> {
    return ApiClient.post<{ message: string }>('/customer-auth/logout', {});
  }

  /**
   * Refresh customer access token
   * Public endpoint (requires refresh token in cookie)
   * @returns New access token
   */
  static async refreshToken(): Promise<{ accessToken: string }> {
    return ApiClient.post<{ accessToken: string }>('/customer-auth/refresh', {});
  }

  /**
   * Get customer profile
   * Requires customer authentication
   * @returns Customer account with profile data
   */
  static async getProfile(): Promise<import('@/types/storefront').CustomerAccount> {
    return ApiClient.get<import('@/types/storefront').CustomerAccount>('/customer-auth/profile');
  }

  /**
   * Update customer profile
   * Requires customer authentication
   * @param data Profile update data
   * @returns Updated customer account
   */
  static async updateProfile(data: import('@/types/storefront').UpdateCustomerProfileDto): Promise<import('@/types/storefront').CustomerAccount> {
    return ApiClient.patch<import('@/types/storefront').CustomerAccount>('/customer-auth/profile', data);
  }
}

/**
 * Customer Orders API endpoints (for customer portal)
 */
export class CustomerOrdersApi {
  /**
   * Get customer's order history
   * Requires customer authentication
   * @param params Query parameters for filtering
   * @returns Array of customer orders
   */
  static async getOrders(params?: { page?: number; limit?: number; status?: string }): Promise<{
    orders: import('@/types/storefront').CustomerOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return ApiClient.get<{
      orders: import('@/types/storefront').CustomerOrder[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/customer/orders', params as Record<string, unknown>);
  }

  /**
   * Get order details by ID
   * Requires customer authentication
   * @param orderId Order ID
   * @returns Detailed order information
   */
  static async getOrderDetails(orderId: string): Promise<import('@/types/storefront').CustomerOrderDetails> {
    return ApiClient.get<import('@/types/storefront').CustomerOrderDetails>(`/customer/orders/${orderId}`);
  }

  /**
   * Cancel order
   * Requires customer authentication
   * @param orderId Order ID
   * @param data Cancellation data
   * @returns Updated order
   */
  static async cancelOrder(orderId: string, data?: import('@/types/storefront').CancelOrderDto): Promise<import('@/types/storefront').CustomerOrderDetails> {
    return ApiClient.post<import('@/types/storefront').CustomerOrderDetails>(`/customer/orders/${orderId}/cancel`, data);
  }

  /**
   * Reorder items from previous order
   * Requires customer authentication
   * @param orderId Order ID to reorder from
   * @returns Updated cart with reordered items
   */
  static async reorder(orderId: string): Promise<import('@/types/ecommerce').Cart> {
    return ApiClient.post<import('@/types/ecommerce').Cart>(`/customer/orders/${orderId}/reorder`, {});
  }
}

/**
 * Wishlist API endpoints
 */
export class WishlistApi {
  /**
   * Get customer's wishlist
   * Requires customer authentication
   * @returns Wishlist with items
   */
  static async getWishlist(): Promise<import('@/types/storefront').Wishlist> {
    return ApiClient.get<import('@/types/storefront').Wishlist>('/wishlist');
  }

  /**
   * Add item to wishlist
   * Requires customer authentication
   * @param data Add to wishlist data
   * @returns Updated wishlist
   */
  static async addItem(data: import('@/types/storefront').AddToWishlistDto): Promise<import('@/types/storefront').Wishlist> {
    return ApiClient.post<import('@/types/storefront').Wishlist>('/wishlist/items', data);
  }

  /**
   * Remove item from wishlist
   * Requires customer authentication
   * @param itemId Wishlist item ID
   * @returns Updated wishlist
   */
  static async removeItem(itemId: string): Promise<import('@/types/storefront').Wishlist> {
    return ApiClient.delete<import('@/types/storefront').Wishlist>(`/wishlist/items/${itemId}`);
  }

  /**
   * Move wishlist item to cart
   * Requires customer authentication
   * @param itemId Wishlist item ID
   * @returns Updated cart
   */
  static async moveToCart(itemId: string): Promise<import('@/types/ecommerce').Cart> {
    return ApiClient.post<import('@/types/ecommerce').Cart>(`/wishlist/items/${itemId}/move-to-cart`, {});
  }
}

// Convenience exports for cart operations
export const getCart = CartApi.getCart;
export const addToCart = CartApi.addToCart;
export const updateCartItem = CartApi.updateCartItem;
export const removeCartItem = CartApi.removeCartItem;
export const clearCart = CartApi.clearCart;
export const mergeCart = CartApi.mergeCart;
export const validateCart = CartApi.validateCart;
export const getCartTotals = CartApi.getCartTotals;

// Convenience exports for checkout
export const validateCheckout = CheckoutApi.validateCheckout;
export const calculateShipping = CheckoutApi.calculateShipping;
export const calculateTax = CheckoutApi.calculateTax;
export const createOrderFromCart = CheckoutApi.createOrder;
export const getPaymentMethods = CheckoutApi.getPaymentMethods;
export const getShippingMethods = CheckoutApi.getShippingMethods;

// Convenience exports for customer auth
export const registerCustomer = CustomerAuthApi.register;
export const loginCustomer = CustomerAuthApi.login;
export const logoutCustomer = CustomerAuthApi.logout;
export const refreshCustomerToken = CustomerAuthApi.refreshToken;
export const getCustomerProfile = CustomerAuthApi.getProfile;
export const updateCustomerProfile = CustomerAuthApi.updateProfile;

// Convenience exports for customer orders
export const getCustomerOrders = CustomerOrdersApi.getOrders;
export const getCustomerOrderDetails = CustomerOrdersApi.getOrderDetails;
export const cancelCustomerOrder = CustomerOrdersApi.cancelOrder;
export const reorderFromOrder = CustomerOrdersApi.reorder;

// Convenience exports for wishlist
export const getWishlist = WishlistApi.getWishlist;
export const addToWishlist = WishlistApi.addItem;
export const removeFromWishlist = WishlistApi.removeItem;
export const moveWishlistItemToCart = WishlistApi.moveToCart;
