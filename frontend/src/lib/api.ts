/**
 * API Client Configuration
 * 
 * Centralized API client for communicating with the NestJS backend.
 * Handles authentication, error handling, and type-safe requests.
 */

import { 
  User, 
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
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base API client class with common HTTP methods
 */
export class ApiClient {
  private static baseURL = API_BASE_URL;
  private static authToken: string | null = null;

  /**
   * Set authentication token for subsequent requests
   */
  static setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get default headers for API requests
   */
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Handle API response and errors
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

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
   * Generic GET request
   */
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Generic POST request
   */
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Generic PUT request
   */
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Generic PATCH request
   */
  static async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Generic DELETE request
   */
  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
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
 * Utility functions for API client
 */
export const apiUtils = {
  /**
   * Initialize API client with stored auth token
   */
  initializeAuth() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        ApiClient.setAuthToken(token);
      }
    }
  },

  /**
   * Store auth token and set it in API client
   */
  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    ApiClient.setAuthToken(token);
  },

  /**
   * Clear auth token
   */
  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    ApiClient.setAuthToken(null);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  }
};

// Initialize auth on module load
if (typeof window !== 'undefined') {
  apiUtils.initializeAuth();
}