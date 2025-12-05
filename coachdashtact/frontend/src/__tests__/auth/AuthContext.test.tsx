/**
 * AuthContext Unit Tests
 * 
 * Tests for the authentication context including:
 * - Login functionality
 * - Logout functionality
 * - Registration
 * - Token refresh
 * - Permission checking
 * - State management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { authConfig } from '@/config/auth.config';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock user data
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: {
    id: 'role-1',
    name: 'User',
    description: 'Standard user',
    rolePermissions: [
      {
        id: 'rp-1',
        roleId: 'role-1',
        permissionId: 'perm-1',
        permission: {
          id: 'perm-1',
          name: 'users:read',
          resource: 'users',
          action: 'read',
          description: 'View users',
        },
      },
      {
        id: 'rp-2',
        roleId: 'role-1',
        permissionId: 'perm-2',
        permission: {
          id: 'perm-2',
          name: 'profile:write',
          resource: 'profile',
          action: 'write',
          description: 'Edit own profile',
        },
      },
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAdminUser = {
  ...mockUser,
  id: 'admin-1',
  email: 'admin@example.com',
  role: {
    id: 'role-admin',
    name: 'Admin',
    description: 'Administrator',
    rolePermissions: [
      {
        id: 'rp-admin',
        roleId: 'role-admin',
        permissionId: 'perm-admin',
        permission: {
          id: 'perm-admin',
          name: '*:*',
          resource: '*',
          action: '*',
          description: 'All permissions',
        },
      },
    ],
  },
};

// Mock access token (valid for 15 minutes)
const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzEwNzIwMDAsImV4cCI6OTk5OTk5OTk5OX0.test';

// Wrapper component for tests
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with unauthenticated state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should restore auth state from stored token', async () => {
      // Store token in localStorage
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);

      // Mock profile fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle expired token on initialization', async () => {
      // Store expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzEwNzIwMDAsImV4cCI6MTczMTA3MjAwMH0.test';
      localStorage.setItem(authConfig.storage.accessTokenKey, expiredToken);

      // Mock refresh token call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Token expired' }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Login', () => {
    it('should login successfully and update state', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: mockAccessToken,
          user: mockUser,
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(localStorage.getItem(authConfig.storage.accessTokenKey)).toBe(mockAccessToken);
    });

    it('should handle login failure', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login(credentials);
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should set loading state during login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      mockFetch.mockReturnValueOnce(loginPromise as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.login(credentials);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveLogin!({
          ok: true,
          json: async () => ({
            accessToken: mockAccessToken,
            user: mockUser,
          }),
        });
        await loginPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout and clear state', async () => {
      // Setup authenticated state
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock logout call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out' }),
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem(authConfig.storage.accessTokenKey)).toBeNull();
    });

    it('should clear state even if logout API call fails', async () => {
      // Setup authenticated state
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock logout call failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem(authConfig.storage.accessTokenKey)).toBeNull();
    });
  });

  describe('Registration', () => {
    it('should register successfully and update state', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: mockAccessToken,
          user: { ...mockUser, ...registerData },
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register(registerData);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe(registerData.email);
    });

    it('should handle registration failure', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.register(registerData);
        })
      ).rejects.toThrow('Email already exists');

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      // Setup authenticated state
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const newToken = 'new-access-token';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: newToken }),
      });

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(localStorage.getItem(authConfig.storage.accessTokenKey)).toBe(newToken);
    });

    it('should logout on refresh failure', async () => {
      // Setup authenticated state
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Refresh failed' }),
      });

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Permission Checking', () => {
    it('should check single permission correctly', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('users:write')).toBe(false);
      expect(result.current.hasPermission('profile:write')).toBe(true);
    });

    it('should handle super admin permission (*:*)', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAdminUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('users:write')).toBe(true);
      expect(result.current.hasPermission('anything:anything')).toBe(true);
    });

    it('should check any permission correctly', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.hasAnyPermission(['users:read', 'users:write'])).toBe(true);
      expect(result.current.hasAnyPermission(['users:write', 'users:delete'])).toBe(false);
    });

    it('should check all permissions correctly', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.hasAllPermissions(['users:read', 'profile:write'])).toBe(true);
      expect(result.current.hasAllPermissions(['users:read', 'users:write'])).toBe(false);
    });

    it('should return false for permissions when not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasPermission('users:read')).toBe(false);
      expect(result.current.hasAnyPermission(['users:read'])).toBe(false);
      expect(result.current.hasAllPermissions(['users:read'])).toBe(false);
    });
  });

  describe('Role Checking', () => {
    it('should check role correctly', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.hasRole('User')).toBe(true);
      expect(result.current.hasRole('Admin')).toBe(false);
    });

    it('should return false for role when not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasRole('User')).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should get current user', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.getUser()).toEqual(mockUser);
    });

    it('should get user permissions', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const permissions = result.current.getPermissions();
      expect(permissions).toContain('users:read');
      expect(permissions).toContain('profile:write');
      expect(permissions).toHaveLength(2);
    });

    it('should return empty array for permissions when not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.getPermissions()).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});
