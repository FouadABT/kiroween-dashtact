/**
 * Permission Checks UI Tests
 * 
 * Tests for permission-based UI rendering including:
 * - PermissionGuard component behavior
 * - Conditional rendering based on permissions
 * - Permission-based feature visibility
 * - Multiple permission checks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

// Mock the auth config
vi.mock('@/config/auth.config', () => ({
  authConfig: {
    storage: {
      accessTokenKey: 'accessToken',
    },
    endpoints: {
      refresh: '/auth/refresh',
    },
    redirects: {
      unauthorized: '/login',
      forbidden: '/403',
    },
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock users with different permission levels
const mockUserWithReadPermission = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Regular User',
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
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockUserWithWritePermission = {
  ...mockUserWithReadPermission,
  id: 'user-2',
  email: 'editor@example.com',
  name: 'Editor User',
  role: {
    id: 'role-2',
    name: 'Editor',
    description: 'Editor user',
    rolePermissions: [
      {
        id: 'rp-1',
        roleId: 'role-2',
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
        roleId: 'role-2',
        permissionId: 'perm-2',
        permission: {
          id: 'perm-2',
          name: 'users:write',
          resource: 'users',
          action: 'write',
          description: 'Create and edit users',
        },
      },
    ],
  },
};

const mockAdminUser = {
  ...mockUserWithReadPermission,
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
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

const mockAccessToken = 'mock-access-token';

// Wrapper component with AuthProvider
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Permission Checks UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('PermissionGuard - Single Permission', () => {
    it('should render children when user has required permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      render(
        <PermissionGuard permission="users:read">
          <div>Protected Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should not render children when user lacks required permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      render(
        <PermissionGuard permission="users:write">
          <div>Protected Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render fallback when user lacks permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      render(
        <PermissionGuard 
          permission="users:write"
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should allow super admin to access any permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAdminUser,
      });

      render(
        <PermissionGuard permission="users:delete">
          <div>Delete User Button</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Delete User Button')).toBeInTheDocument();
      });
    });
  });

  describe('PermissionGuard - Multiple Permissions', () => {
    it('should render when user has any of the required permissions (requireAll=false)', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      render(
        <PermissionGuard 
          permission={['users:read', 'users:write']}
          requireAll={false}
        >
          <div>Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('should not render when user has none of the required permissions', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      render(
        <PermissionGuard 
          permission={['users:write', 'users:delete']}
          requireAll={false}
        >
          <div>Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should render when user has all required permissions (requireAll=true)', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithWritePermission,
      });

      render(
        <PermissionGuard 
          permission={['users:read', 'users:write']}
          requireAll={true}
        >
          <div>Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('should not render when user lacks one of the required permissions (requireAll=true)', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      render(
        <PermissionGuard 
          permission={['users:read', 'users:write']}
          requireAll={true}
        >
          <div>Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Permission-Based Feature Visibility', () => {
    it('should show read-only view for users with only read permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      render(
        <div>
          <PermissionGuard permission="users:read">
            <div>User List</div>
          </PermissionGuard>
          <PermissionGuard permission="users:write">
            <button>Create User</button>
          </PermissionGuard>
          <PermissionGuard permission="users:delete">
            <button>Delete User</button>
          </PermissionGuard>
        </div>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('User List')).toBeInTheDocument();
      });

      expect(screen.queryByText('Create User')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('should show edit features for users with write permission', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithWritePermission,
      });

      render(
        <div>
          <PermissionGuard permission="users:read">
            <div>User List</div>
          </PermissionGuard>
          <PermissionGuard permission="users:write">
            <button>Create User</button>
          </PermissionGuard>
          <PermissionGuard permission="users:delete">
            <button>Delete User</button>
          </PermissionGuard>
        </div>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });

      expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('should show all features for admin users', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAdminUser,
      });

      render(
        <div>
          <PermissionGuard permission="users:read">
            <div>User List</div>
          </PermissionGuard>
          <PermissionGuard permission="users:write">
            <button>Create User</button>
          </PermissionGuard>
          <PermissionGuard permission="users:delete">
            <button>Delete User</button>
          </PermissionGuard>
        </div>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Create User')).toBeInTheDocument();
        expect(screen.getByText('Delete User')).toBeInTheDocument();
      });
    });
  });

  describe('Nested Permission Guards', () => {
    it('should handle nested permission guards correctly', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithWritePermission,
      });

      render(
        <PermissionGuard permission="users:read">
          <div>
            <div>User List</div>
            <PermissionGuard permission="users:write">
              <button>Edit User</button>
            </PermissionGuard>
            <PermissionGuard permission="users:delete">
              <button>Delete User</button>
            </PermissionGuard>
          </div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Edit User')).toBeInTheDocument();
      });

      expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('should not render nested content if parent guard fails', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      render(
        <PermissionGuard permission="users:write">
          <div>
            <div>Edit Form</div>
            <PermissionGuard permission="users:delete">
              <button>Delete User</button>
            </PermissionGuard>
          </div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.queryByText('Edit Form')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });
  });

  describe('Permission Checks with Different Resources', () => {
    it('should handle permissions for different resources independently', async () => {
      const userWithMixedPermissions = {
        ...mockUserWithReadPermission,
        role: {
          ...mockUserWithReadPermission.role,
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
                name: 'settings:write',
                resource: 'settings',
                action: 'write',
                description: 'Modify settings',
              },
            },
          ],
        },
      };

      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => userWithMixedPermissions,
      });

      render(
        <div>
          <PermissionGuard permission="users:read">
            <div>User List</div>
          </PermissionGuard>
          <PermissionGuard permission="users:write">
            <button>Create User</button>
          </PermissionGuard>
          <PermissionGuard permission="settings:write">
            <button>Edit Settings</button>
          </PermissionGuard>
        </div>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Edit Settings')).toBeInTheDocument();
      });

      expect(screen.queryByText('Create User')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should not render content while auth is loading', async () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      let resolveAuth: (value: unknown) => void;
      const authPromise = new Promise((resolve) => {
        resolveAuth = resolve;
      });
      
      mockFetch.mockReturnValue(authPromise as Promise<Response>);

      render(
        <PermissionGuard permission="users:read">
          <div>Protected Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      // Content should not be visible while loading
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

      // Resolve auth
      resolveAuth!({
        ok: true,
        json: async () => mockUserWithReadPermission,
      });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Unauthenticated Users', () => {
    it('should not render content for unauthenticated users', async () => {
      // No token in localStorage
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      render(
        <PermissionGuard permission="users:read">
          <div>Protected Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render fallback for unauthenticated users', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      render(
        <PermissionGuard 
          permission="users:read"
          fallback={<div>Please log in</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Please log in')).toBeInTheDocument();
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Complex Permission Scenarios', () => {
    it('should handle profile:write permission for own profile', async () => {
      const userWithProfilePermission = {
        ...mockUserWithReadPermission,
        role: {
          ...mockUserWithReadPermission.role,
          rolePermissions: [
            {
              id: 'rp-1',
              roleId: 'role-1',
              permissionId: 'perm-1',
              permission: {
                id: 'perm-1',
                name: 'profile:write',
                resource: 'profile',
                action: 'write',
                description: 'Edit own profile',
              },
            },
          ],
        },
      };

      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => userWithProfilePermission,
      });

      render(
        <PermissionGuard permission="profile:write">
          <button>Edit My Profile</button>
        </PermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Edit My Profile')).toBeInTheDocument();
      });
    });

    it('should handle wildcard action permissions', async () => {
      const userWithWildcardPermission = {
        ...mockUserWithReadPermission,
        role: {
          ...mockUserWithReadPermission.role,
          rolePermissions: [
            {
              id: 'rp-1',
              roleId: 'role-1',
              permissionId: 'perm-1',
              permission: {
                id: 'perm-1',
                name: 'users:*',
                resource: 'users',
                action: '*',
                description: 'All user operations',
              },
            },
          ],
        },
      };

      localStorage.setItem('accessToken', mockAccessToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => userWithWildcardPermission,
      });

      render(
        <div>
          <PermissionGuard permission="users:read">
            <div>Read</div>
          </PermissionGuard>
          <PermissionGuard permission="users:write">
            <div>Write</div>
          </PermissionGuard>
          <PermissionGuard permission="users:delete">
            <div>Delete</div>
          </PermissionGuard>
        </div>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Read')).toBeInTheDocument();
        expect(screen.getByText('Write')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    });
  });
});
