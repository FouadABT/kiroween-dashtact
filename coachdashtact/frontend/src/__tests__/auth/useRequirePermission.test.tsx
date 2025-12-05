/**
 * useRequirePermission Hook Unit Tests
 * 
 * Tests for the useRequirePermission hook that handles permission-based access control
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRequirePermission } from '@/hooks/useRequirePermission';
import { authConfig } from '@/config/auth.config';

// Mock Next.js router
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock user with permissions
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

const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzEwNzIwMDAsImV4cCI6OTk5OTk5OTk5OX0.test';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useRequirePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should not redirect when user has required permission', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useRequirePermission('users:read'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to forbidden when user lacks permission', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useRequirePermission('users:delete'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(false);
    expect(mockPush).toHaveBeenCalledWith(authConfig.redirects.forbidden);
  });

  it('should handle array of permissions with requireAll=false (any)', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(
      () => useRequirePermission(['users:read', 'users:write'], false),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle array of permissions with requireAll=true (all)', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(
      () => useRequirePermission(['users:read', 'profile:write'], true),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect when requireAll=true and user lacks one permission', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(
      () => useRequirePermission(['users:read', 'users:write'], true),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(false);
    expect(mockPush).toHaveBeenCalledWith(authConfig.redirects.forbidden);
  });

  it('should use custom redirect path', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const customRedirect = '/custom-forbidden';
    const { result } = renderHook(
      () => useRequirePermission('users:delete', false, customRedirect),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPush).toHaveBeenCalledWith(customRedirect);
  });

  it('should return loading state correctly', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    
    let resolveProfile: (value: any) => void;
    const profilePromise = new Promise((resolve) => {
      resolveProfile = resolve;
    });

    mockFetch.mockReturnValueOnce(profilePromise as any);

    const { result } = renderHook(() => useRequirePermission('users:read'), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasAccess).toBe(false);

    // Resolve profile
    resolveProfile!({
      ok: true,
      json: async () => mockUser,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(true);
  });

  it('should not redirect while loading', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    
    let resolveProfile: (value: any) => void;
    const profilePromise = new Promise((resolve) => {
      resolveProfile = resolve;
    });

    mockFetch.mockReturnValueOnce(profilePromise as any);

    renderHook(() => useRequirePermission('users:read'), { wrapper });

    // Should not redirect while loading
    expect(mockPush).not.toHaveBeenCalled();

    // Resolve profile
    resolveProfile!({
      ok: true,
      json: async () => mockUser,
    });

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('should not redirect when not authenticated', async () => {
    const { result } = renderHook(() => useRequirePermission('users:read'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not redirect to forbidden when not authenticated
    // (useRequireAuth should handle authentication redirect)
    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.hasAccess).toBe(false);
  });

  it('should update when permission parameter changes', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result, rerender } = renderHook(
      ({ permission }) => useRequirePermission(permission),
      {
        wrapper,
        initialProps: { permission: 'users:read' },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAccess).toBe(true);

    rerender({ permission: 'users:delete' });

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(false);
    });
  });
});
