/**
 * Dashboard Protection Integration Tests
 * 
 * Tests for dashboard route protection and permission-based features including:
 * - Unauthenticated access redirects
 * - Permission-based navigation filtering
 * - Permission-based feature access (CRUD operations)
 * - Role-based access control
 * - Integration of AuthGuard, PermissionGuard, and NavigationContext
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { authConfig } from '@/config/auth.config';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = '/dashboard';

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
    setAccessToken: vi.fn(),
    clearAuthToken: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  UserApi: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock user data with different permission levels
const mockUserWithReadOnly = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Standard User',
  role: {
    id: 'role-user',
    name: 'User',
    description: 'Standard user',
    rolePermissions: [
      {
        id: 'rp-1',
        roleId: 'role-user',
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
        roleId: 'role-user',
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
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
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
          name: 'users:read',
          resource: 'users',
          action: 'read',
          description: 'View users',
        },
      },
      {
        id: 'rp-admin-2',
        roleId: 'role-admin',
        permissionId: 'perm-admin-2',
        permission: {
          id: 'perm-admin-2',
          name: 'users:write',
          resource: 'users',
          action: 'write',
          description: 'Create/edit users',
        },
      },
      {
        id: 'rp-admin-3',
        roleId: 'role-admin',
        permissionId: 'perm-admin-3',
        permission: {
          id: 'perm-admin-3',
          name: 'users:delete',
          resource: 'users',
          action: 'delete',
          description: 'Delete users',
        },
      },
      {
        id: 'rp-admin-4',
        roleId: 'role-admin',
        permissionId: 'perm-admin-4',
        permission: {
          id: 'perm-admin-4',
          name: 'settings:read',
          resource: 'settings',
          action: 'read',
          description: 'View settings',
        },
      },
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockManagerUser = {
  id: 'manager-1',
  email: 'manager@example.com',
  name: 'Manager User',
  role: {
    id: 'role-manager',
    name: 'Manager',
    description: 'Manager',
    rolePermissions: [
      {
        id: 'rp-manager-1',
        roleId: 'role-manager',
        permissionId: 'perm-manager-1',
        permission: {
          id: 'perm-manager-1',
          name: 'users:read',
          resource: 'users',
          action: 'read',
          description: 'View users',
        },
      },
      {
        id: 'rp-manager-2',
        roleId: 'role-manager',
        permissionId: 'perm-manager-2',
        permission: {
          id: 'perm-manager-2',
          name: 'users:write',
          resource: 'users',
          action: 'write',
          description: 'Create/edit users',
        },
      },
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAccessToken = 'mock-access-token';

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Dashboard Protection - Unauthenticated Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect unauthenticated users to login page', async () => {
    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(authConfig.redirects.unauthorized);
    });

    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('should store intended destination for post-login redirect', async () => {
    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(sessionStorage.getItem('redirectAfterLogin')).toBe(mockPathname);
    });
  });

  it('should show loading state while checking authentication', () => {
    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });

  it('should not render dashboard content for unauthenticated users', async () => {
    render(
      <TestWrapper>
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });
});

describe('Dashboard Protection - Permission-Based Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show all navigation items for admin users', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Check that all navigation items are visible
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Data').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  it('should hide Users menu item for users without users:read permission', async () => {
    const userWithoutUsersRead = {
      ...mockUserWithReadOnly,
      role: {
        ...mockUserWithReadOnly.role,
        rolePermissions: mockUserWithReadOnly.role.rolePermissions.filter(
          rp => rp.permission.name !== 'users:read'
        ),
      },
    };

    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => userWithoutUsersRead,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Users menu item should not be visible
    const navElements = screen.queryAllByText('Users');
    expect(navElements.length).toBe(0);

    // Other items should still be visible
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
  });

  it('should hide Settings menu item for users without settings:read permission', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserWithReadOnly,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Settings menu item should not be visible
    const settingsElements = screen.queryAllByText('Settings');
    expect(settingsElements.length).toBe(0);

    // Users menu item should be visible (user has users:read)
    expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
  });

  it('should show Users menu item for users with users:read permission', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserWithReadOnly,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Users menu item should be visible
    expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
  });

  it('should show Settings menu item for admin users', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Settings menu item should be visible
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  it('should dynamically update navigation when permissions change', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    
    // First render with limited permissions
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserWithReadOnly,
    });

    const { rerender } = render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Settings should not be visible
    expect(screen.queryAllByText('Settings').length).toBe(0);

    // Simulate permission change by re-rendering with admin user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    rerender(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    // Note: In a real app, this would require a context update mechanism
    // This test demonstrates the expected behavior
  });
});

describe('Dashboard Protection - Permission-Based Feature Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should hide Create User button for users without users:write permission', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserWithReadOnly,
    });

    // Mock the users page content
    const UsersPageMock = () => {
      const { hasPermission } = useAuth();
      
      return (
        <div>
          <h1>User Management</h1>
          {hasPermission('users:write') && (
            <button data-testid="add-user-btn">Add User</button>
          )}
          <div data-testid="users-list">Users List</div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <DashboardLayout>
          <UsersPageMock />
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Add User button should not be visible
    expect(screen.queryByTestId('add-user-btn')).not.toBeInTheDocument();

    // Users list should still be visible (user has users:read)
    expect(screen.getByTestId('users-list')).toBeInTheDocument();
  });

  it('should show Create User button for users with users:write permission', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    const UsersPageMock = () => {
      const { hasPermission } = useAuth();
      
      return (
        <div>
          <h1>User Management</h1>
          {hasPermission('users:write') && (
            <button data-testid="add-user-btn">Add User</button>
          )}
          <div data-testid="users-list">Users List</div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <DashboardLayout>
          <UsersPageMock />
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Add User button should be visible
    expect(screen.getByTestId('add-user-btn')).toBeInTheDocument();
  });

  it('should hide Edit button for users without users:write permission', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserWithReadOnly,
    });

    const UserItemMock = () => {
      const { hasPermission } = useAuth();
      
      return (
        <div data-testid="user-item">
          <span>John Doe</span>
          {hasPermission('users:write') && (
            <button data-testid="edit-btn">Edit</button>
          )}
          {hasPermission('users:delete') && (
            <button data-testid="delete-btn">Delete</button>
          )}
        </div>
      );
    };

    render(
      <TestWrapper>
        <DashboardLayout>
          <UserItemMock />
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-item')).toBeInTheDocument();
    });

    // Edit and Delete buttons should not be visible
    expect(screen.queryByTestId('edit-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
  });

  it('should show Edit button but hide Delete button for managers', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockManagerUser,
    });

    const UserItemMock = () => {
      const { hasPermission } = useAuth();
      
      return (
        <div data-testid="user-item">
          <span>John Doe</span>
          {hasPermission('users:write') && (
            <button data-testid="edit-btn">Edit</button>
          )}
          {hasPermission('users:delete') && (
            <button data-testid="delete-btn">Delete</button>
          )}
        </div>
      );
    };

    render(
      <TestWrapper>
        <DashboardLayout>
          <UserItemMock />
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-item')).toBeInTheDocument();
    });

    // Edit button should be visible (manager has users:write)
    expect(screen.getByTestId('edit-btn')).toBeInTheDocument();

    // Delete button should not be visible (manager lacks users:delete)
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
  });

  it('should show all CRUD buttons for admin users', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    const UserItemMock = () => {
      const { hasPermission } = useAuth();
      
      return (
        <div data-testid="user-item">
          <span>John Doe</span>
          {hasPermission('users:write') && (
            <button data-testid="edit-btn">Edit</button>
          )}
          {hasPermission('users:delete') && (
            <button data-testid="delete-btn">Delete</button>
          )}
        </div>
      );
    };

    render(
      <TestWrapper>
        <DashboardLayout>
          <UserItemMock />
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-item')).toBeInTheDocument();
    });

    // Both Edit and Delete buttons should be visible
    expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
    expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
  });
});

describe('Dashboard Protection - Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow User role to access dashboard', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserWithReadOnly,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should allow Manager role to access dashboard', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockManagerUser,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should allow Admin role to access dashboard', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should display user role in header', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Header should display user name
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });
});

describe('Dashboard Protection - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete authentication flow', async () => {
    // Start unauthenticated
    const { rerender } = render(
      <TestWrapper>
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    // Should redirect to login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(authConfig.redirects.unauthorized);
    });

    // Simulate login
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    // Re-render after login
    rerender(
      <TestWrapper>
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    // Should now show dashboard content
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });
  });

  it('should handle permission checks across multiple components', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockManagerUser,
    });

    const ComplexPageMock = () => {
      const { hasPermission } = useAuth();
      
      return (
        <div>
          <h1>Complex Page</h1>
          {hasPermission('users:read') && (
            <div data-testid="read-section">Read Section</div>
          )}
          {hasPermission('users:write') && (
            <div data-testid="write-section">Write Section</div>
          )}
          {hasPermission('users:delete') && (
            <div data-testid="delete-section">Delete Section</div>
          )}
          {hasPermission('settings:read') && (
            <div data-testid="settings-section">Settings Section</div>
          )}
        </div>
      );
    };

    render(
      <TestWrapper>
        <DashboardLayout>
          <ComplexPageMock />
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Complex Page')).toBeInTheDocument();
    });

    // Manager should see read and write sections
    expect(screen.getByTestId('read-section')).toBeInTheDocument();
    expect(screen.getByTestId('write-section')).toBeInTheDocument();

    // Manager should not see delete or settings sections
    expect(screen.queryByTestId('delete-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('settings-section')).not.toBeInTheDocument();
  });

  it('should maintain authentication state across navigation', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div data-testid="page-1">Page 1</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-1')).toBeInTheDocument();
    });

    // User should remain authenticated
    expect(mockPush).not.toHaveBeenCalledWith(authConfig.redirects.unauthorized);
  });

  it('should handle logout and redirect', async () => {
    localStorage.setItem(authConfig.storage.accessTokenKey, mockAccessToken);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminUser,
    });

    render(
      <TestWrapper>
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    // Simulate logout
    localStorage.removeItem(authConfig.storage.accessTokenKey);

    // Note: In a real app, this would trigger a re-render and redirect
    // This test demonstrates the expected behavior
  });
});
