/**
 * useRequireAuth Hook Unit Tests
 * 
 * Tests for the useRequireAuth hook that handles authentication requirements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { authConfig } from '@/config/auth.config';

// Mock Next.js router
const mockPush = vi.fn();
const mockPathname = '/dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

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
    name: 'User',
    description: 'Standard user',
    rolePermissions: [],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzEwNzIwMDAsImV4cCI6OTk5OTk5OTk5OX0.test';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useRequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should not redirect when user is authenticated', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useRequireAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', async () => {
    const { result } = renderHook(() => useRequireAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockPush).toHaveBeenCalledWith(authConfig.redirects.unauthorized);
  });

  it('should store intended destination in sessionStorage', async () => {
    const { result } = renderHook(() => useRequireAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(sessionStorage.getItem('redirectAfterLogin')).toBe(mockPathname);
  });

  it('should use custom redirect path', async () => {
    const customRedirect = '/custom-login';
    const { result } = renderHook(() => useRequireAuth(customRedirect), { wrapper });

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

    const { result } = renderHook(() => useRequireAuth(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Resolve profile
    resolveProfile!({
      ok: true,
      json: async () => mockUser,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should not redirect while loading', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    
    let resolveProfile: (value: any) => void;
    const profilePromise = new Promise((resolve) => {
      resolveProfile = resolve;
    });

    mockFetch.mockReturnValueOnce(profilePromise as any);

    renderHook(() => useRequireAuth(), { wrapper });

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
});
