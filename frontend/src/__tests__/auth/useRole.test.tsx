/**
 * useRole Hook Unit Tests
 * 
 * Tests for the useRole convenience hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { authConfig } from '@/config/auth.config';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock user
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: {
    id: 'role-1',
    name: 'Manager',
    description: 'Manager role',
    rolePermissions: [],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzEwNzIwMDAsImV4cCI6OTk5OTk5OTk5OX0.test';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should return true for role user has', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useRole('Manager'), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false for role user does not have', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useRole('Admin'), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return false when not authenticated', () => {
    const { result } = renderHook(() => useRole('Manager'), { wrapper });

    expect(result.current).toBe(false);
  });

  it('should handle array of roles (any match)', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useRole(['Admin', 'Manager', 'User']), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false when none of the roles match', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useRole(['Admin', 'User']), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should update when role parameter changes', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result, rerender } = renderHook(
      ({ role }) => useRole(role),
      {
        wrapper,
        initialProps: { role: 'Manager' },
      }
    );

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    rerender({ role: 'Admin' });

    expect(result.current).toBe(false);
  });
});
