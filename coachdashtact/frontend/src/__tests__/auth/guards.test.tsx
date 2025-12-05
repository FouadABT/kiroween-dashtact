/**
 * Guard Components Unit Tests
 * 
 * Tests for AuthGuard, PermissionGuard, and RoleGuard components including:
 * - AuthGuard redirects unauthenticated users
 * - PermissionGuard shows/hides content based on permissions
 * - RoleGuard shows/hides content based on roles
 * - Loading states
 * - Custom fallbacks
 * - Multiple permissions/roles
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { authConfig } from '@/config/auth.config';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = '/protected';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

// Mock API Client
vi.mock('@/lib/api', () => ({
  ApiClient: {
    setAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

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
        id: 'rp-admin-1',
        roleId: 'role-admin',
        permissionId: 'perm-admin-1',
        permission: {
          id: 'perm-admin-1',
          name: 'users:write',
          resource: 'users',
          action: 'write',
          description: 'Create/edit users',
        },
      },
      {
        id: 'rp-admin-2',
        roleId: 'role-admin',
        permissionId: 'perm-admin-2',
        permission: {
          id: 'perm-admin-2',
          name: 'users:delete',
          resource: 'users',
          action: 'delete',
          description: 'Delete users',
        },
      },
    ],
  },
};

const mockManagerUser = {
  ...mockUser,
  id: 'manager-1',
  email: 'manager@example.com',
  role: {
    id: 'role-manager',
    name: 'Manager',
    description: 'Manager',
    rolePermissions: [
      {
        id: 'rp-manager',
        roleId: 'role-manager',
        permissionId: 'perm-manager',
        permission: {
          id: 'perm-manager',
          name: 'users:read',
          resource: 'users',
          action: 'read',
          description: 'View users',
        },
      },
    ],
  },
};

const mockAccessToken = 'mock-access-token';

// Wrapper component for tests
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated User', () => {
    it('should redirect unauthenticated users to login', async () => {
      render(
        <AuthProvider>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(authConfig.redirects.unauthorized);
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should store intended destination in sessionStorage', async () => {
      render(
        <AuthProvider>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(sessionStorage.getItem('redirectAfterLogin')).toBe(mockPathname);
      });
    });

    it('should redirect to custom URL when provided', async () => {
      const customRedirect = '/custom-login';

      render(
        <AuthProvider>
          <AuthGuard redirectTo={customRedirect}>
            <div>Protected Content</div>
          </AuthGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(customRedirect);
      });
    });

    it('should show loading state while checking authentication', () => {
      render(
        <AuthProvider>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </AuthProvider>
      );

      expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    });

    it('should show custom fallback during loading', () => {
      render(
        <AuthProvider>
          <AuthGuard fallback={<div>Custom Loading...</div>}>
            <div>Protected Content</div>
          </AuthGuard>
        </AuthProvider>
      );

      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    it('should render children for authenticated users', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not redirect authenticated users', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <AuthGuard>
            <div>Protected Content</div>
          </AuthGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull();
    });
  });
});

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated User', () => {
    it('should not render content for unauthenticated users', async () => {
      render(
        <AuthProvider>
          <PermissionGuard permission="users:read">
            <div>Protected Content</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('Single Permission', () => {
    it('should show content when user has required permission', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="users:read">
            <div>User List</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('User List')).toBeInTheDocument();
      });
    });

    it('should hide content when user lacks required permission', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="users:write">
            <div>Create User</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Create User')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should show default access denied message', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard permission="users:delete">
            <div>Delete User</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      expect(screen.getByText("You don't have permission to access this content.")).toBeInTheDocument();
    });
  });

  describe('Multiple Permissions (ANY)', () => {
    it('should show content when user has any of the required permissions', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard permission={['users:read', 'users:write']}>
            <div>User Management</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });

    it('should hide content when user has none of the required permissions', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard permission={['users:write', 'users:delete']}>
            <div>Admin Panel</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Multiple Permissions (ALL)', () => {
    it('should show content when user has all required permissions', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard 
            permission={['users:read', 'profile:write']} 
            requireAll={true}
          >
            <div>Full Access</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Full Access')).toBeInTheDocument();
      });
    });

    it('should hide content when user lacks any required permission', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard 
            permission={['users:read', 'users:write']} 
            requireAll={true}
          >
            <div>Full Access</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Full Access')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should show custom fallback when permission denied', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard 
            permission="users:delete"
            fallback={<div>Custom Access Denied</div>}
          >
            <div>Delete User</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
      });

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });

    it('should hide content completely when fallback is null', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <PermissionGuard 
            permission="users:delete"
            fallback={null}
          >
            <div>Delete User</div>
          </PermissionGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });
});

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated User', () => {
    it('should not render content for unauthenticated users', async () => {
      render(
        <AuthProvider>
          <RoleGuard role="Admin">
            <div>Admin Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('Single Role', () => {
    it('should show content when user has required role', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <RoleGuard role="User">
            <div>User Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('User Content')).toBeInTheDocument();
      });
    });

    it('should hide content when user lacks required role', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <RoleGuard role="Admin">
            <div>Admin Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should show default access denied message', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <RoleGuard role="Admin">
            <div>Admin Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      expect(screen.getByText('Your role does not have access to this content.')).toBeInTheDocument();
    });
  });

  describe('Multiple Roles (ANY)', () => {
    it('should show content when user has any of the required roles', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAdminUser,
      });

      render(
        <AuthProvider>
          <RoleGuard role={['Admin', 'Manager']}>
            <div>Management Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Management Content')).toBeInTheDocument();
      });
    });

    it('should show content for Manager role', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockManagerUser,
      });

      render(
        <AuthProvider>
          <RoleGuard role={['Admin', 'Manager']}>
            <div>Management Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Management Content')).toBeInTheDocument();
      });
    });

    it('should hide content when user has none of the required roles', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <RoleGuard role={['Admin', 'Manager']}>
            <div>Management Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Management Content')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should show custom fallback when role denied', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <RoleGuard 
            role="Admin"
            fallback={<div>Custom Role Denied</div>}
          >
            <div>Admin Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Role Denied')).toBeInTheDocument();
      });

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });

    it('should hide content completely when fallback is null', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <RoleGuard 
            role="Admin"
            fallback={null}
          >
            <div>Admin Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('Role Case Sensitivity', () => {
    it('should match role exactly (case-sensitive)', async () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      render(
        <AuthProvider>
          <RoleGuard role="user">
            <div>User Content</div>
          </RoleGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('User Content')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });
});

describe('Guard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should work with nested guards (AuthGuard + PermissionGuard)', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    render(
      <AuthProvider>
        <AuthGuard>
          <PermissionGuard permission="users:read">
            <div>Protected User List</div>
          </PermissionGuard>
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected User List')).toBeInTheDocument();
    });
  });

  it('should work with nested guards (AuthGuard + RoleGuard)', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    render(
      <AuthProvider>
        <AuthGuard>
          <RoleGuard role="Admin">
            <div>Admin Dashboard</div>
          </RoleGuard>
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('should handle nested guards with insufficient permissions', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    render(
      <AuthProvider>
        <AuthGuard>
          <PermissionGuard permission="users:delete">
            <div>Delete Users</div>
          </PermissionGuard>
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Delete Users')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('should handle combined PermissionGuard and RoleGuard', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    render(
      <AuthProvider>
        <RoleGuard role="Admin">
          <PermissionGuard permission="users:write">
            <div>Admin User Management</div>
          </PermissionGuard>
        </RoleGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin User Management')).toBeInTheDocument();
    });
  });
});
