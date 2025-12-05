/**
 * Blog Permission Guards Tests
 * 
 * Tests for permission-based access control on blog management pages.
 * 
 * Requirements: 4.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/dashboard/blog'),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock router
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

// Mock user with blog permissions
const mockUserWithPermissions = {
  id: 'user-1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: {
    id: 'role-1',
    name: 'Admin',
    description: 'Administrator',
    rolePermissions: [
      {
        id: 'rp-1',
        roleId: 'role-1',
        permissionId: 'perm-1',
        permission: {
          id: 'perm-1',
          name: 'blog:read',
          resource: 'blog',
          action: 'read',
          description: 'View blog posts',
        },
      },
      {
        id: 'rp-2',
        roleId: 'role-1',
        permissionId: 'perm-2',
        permission: {
          id: 'perm-2',
          name: 'blog:write',
          resource: 'blog',
          action: 'write',
          description: 'Create/edit blog posts',
        },
      },
      {
        id: 'rp-3',
        roleId: 'role-1',
        permissionId: 'perm-3',
        permission: {
          id: 'perm-3',
          name: 'blog:delete',
          resource: 'blog',
          action: 'delete',
          description: 'Delete blog posts',
        },
      },
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock user without blog permissions
const mockUserWithoutPermissions = {
  id: 'user-2',
  email: 'user@example.com',
  name: 'Regular User',
  role: {
    id: 'role-2',
    name: 'User',
    description: 'Regular user',
    rolePermissions: [
      {
        id: 'rp-4',
        roleId: 'role-2',
        permissionId: 'perm-4',
        permission: {
          id: 'perm-4',
          name: 'users:read',
          resource: 'users',
          action: 'read',
          description: 'View users',
        },
      },
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzMxMDcyMDAwLCJleHAiOjk5OTk5OTk5OTl9.test';

describe('Blog Permission Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Setup router mock
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe('Blog Management Page Access', () => {
    it('should allow access with blog:read permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="blog:read">
            <div>Blog Management Content</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Blog Management Content')).toBeInTheDocument();
      });
    });

    it('should deny access without blog:read permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithoutPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="blog:read">
            <div>Blog Management Content</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Blog Management Content')).not.toBeInTheDocument();
      });
    });

    it('should redirect to 403 page when access is denied', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithoutPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="blog:read">
            <div>Blog Management Content</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/403');
      });
    });
  });

  describe('Blog Write Permission', () => {
    it('should allow creating posts with blog:write permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="blog:write">
            <button>Create New Post</button>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create new post/i })).toBeInTheDocument();
      });
    });

    it('should hide create button without blog:write permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithoutPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="blog:write" fallback={null}>
            <button>Create New Post</button>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /create new post/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Blog Delete Permission', () => {
    it('should show delete button with blog:delete permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="blog:delete">
            <button>Delete Post</button>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete post/i })).toBeInTheDocument();
      });
    });

    it('should hide delete button without blog:delete permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithoutPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="blog:delete" fallback={null}>
            <button>Delete Post</button>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /delete post/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple Permissions', () => {
    it('should require all permissions when requireAll is true', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission={['blog:read', 'blog:write']} requireAll={true}>
            <div>Edit Blog Post</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Blog Post')).toBeInTheDocument();
      });
    });

    it('should deny access if missing one required permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      // User with only blog:read, missing blog:write
      const userWithPartialPermissions = {
        ...mockUserWithPermissions,
        role: {
          ...mockUserWithPermissions.role,
          rolePermissions: [mockUserWithPermissions.role.rolePermissions[0]], // Only blog:read
        },
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: userWithPartialPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission={['blog:read', 'blog:write']} requireAll={true}>
            <div>Edit Blog Post</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Edit Blog Post')).not.toBeInTheDocument();
      });
    });

    it('should allow access with any permission when requireAll is false', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      // User with only blog:read
      const userWithPartialPermissions = {
        ...mockUserWithPermissions,
        role: {
          ...mockUserWithPermissions.role,
          rolePermissions: [mockUserWithPermissions.role.rolePermissions[0]], // Only blog:read
        },
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: userWithPartialPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard permission={['blog:read', 'blog:write']} requireAll={false}>
            <div>View Blog Posts</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('View Blog Posts')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when access is denied', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUserWithoutPermissions, accessToken: mockAccessToken }),
      });

      render(
        <AuthProvider>
          <PermissionGuard 
            permission="blog:write" 
            fallback={<div>You need blog:write permission</div>}
          >
            <button>Create Post</button>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('You need blog:write permission')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /create post/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while checking permissions', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      let resolveFetch: ((value: Response) => void) | undefined;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      
      mockFetch.mockReturnValueOnce(fetchPromise as Promise<Response>);

      render(
        <AuthProvider>
          <PermissionGuard permission="blog:read">
            <div>Blog Management Content</div>
          </PermissionGuard>
        </AuthProvider>
      );

      // Should show loading state
      expect(screen.queryByText('Blog Management Content')).not.toBeInTheDocument();
      
      // Resolve the promise
      resolveFetch?.({
        ok: true,
        json: async () => ({ user: mockUserWithPermissions, accessToken: mockAccessToken }),
      } as Response);
    });
  });
});
