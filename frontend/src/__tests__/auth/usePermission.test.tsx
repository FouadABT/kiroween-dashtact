/**
 * usePermission Hook Unit Tests
 * 
 * Tests for the usePermission convenience hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { authConfig } from '@/config/auth.config';

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

describe('usePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should return true for permission user has', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => usePermission('users:read'), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false for permission user does not have', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => usePermission('users:delete'), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return false when not authenticated', () => {
    const { result } = renderHook(() => usePermission('users:read'), { wrapper });

    expect(result.current).toBe(false);
  });

  it('should update when permission changes', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result, rerender } = renderHook(
      ({ permission }) => usePermission(permission),
      {
        wrapper,
        initialProps: { permission: 'users:read' },
      }
    );

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    rerender({ permission: 'users:write' });

    expect(result.current).toBe(false);
  });

  it('should handle wildcard permissions', async () => {
    const adminUser = {
      ...mockUser,
      role: {
        ...mockUser.role,
        rolePermissions: [
          {
            id: 'rp-admin',
            roleId: 'role-admin',
            permissionId: 'perm-admin',
            permission: {
              id: 'perm-admin',
              name: 'users:*',
              resource: 'users',
              action: '*',
              description: 'All user permissions',
            },
          },
        ],
      },
    };

    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => adminUser,
    });

    const { result } = renderHook(() => usePermission('users:delete'), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
