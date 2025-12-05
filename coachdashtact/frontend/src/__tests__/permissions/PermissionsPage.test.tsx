/**
 * Permissions Page Unit Tests
 * 
 * Tests for the permissions management UI including:
 * - Permissions list display
 * - Search and filtering
 * - Loading and error states
 * - Permission guard integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import PermissionsPage from '@/app/dashboard/permissions/page';
import { AuthProvider } from '@/contexts/AuthContext';
import { Permission } from '@/types/permission';

// Mock the API
vi.mock('@/lib/api', () => ({
  PermissionApi: {
    getAll: vi.fn(),
  },
}));

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
    },
  },
}));

// Import mocked API
import { PermissionApi } from '@/lib/api';

// Mock permissions data
const mockPermissions: Permission[] = [
  {
    id: 'perm-1',
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'View users',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'perm-2',
    name: 'users:write',
    resource: 'users',
    action: 'write',
    description: 'Create and edit users',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'perm-3',
    name: 'users:delete',
    resource: 'users',
    action: 'delete',
    description: 'Delete users',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'perm-4',
    name: 'settings:read',
    resource: 'settings',
    action: 'read',
    description: 'View settings',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'perm-5',
    name: 'settings:write',
    resource: 'settings',
    action: 'write',
    description: 'Modify settings',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'perm-6',
    name: '*:*',
    resource: '*',
    action: '*',
    description: 'All permissions',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock user with permissions:read permission
const mockUser = {
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
        permissionId: 'perm-read',
        permission: {
          id: 'perm-read',
          name: 'permissions:read',
          resource: 'permissions',
          action: 'read',
          description: 'View permissions',
        },
      },
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock access token
const mockAccessToken = 'mock-access-token';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Wrapper component with AuthProvider
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('PermissionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Setup authenticated user with permissions:read
    localStorage.setItem('accessToken', mockAccessToken);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Permissions List Display', () => {
    it('should display all permissions in a table', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // Check that all permissions are displayed
      expect(screen.getByText('users:read')).toBeInTheDocument();
      expect(screen.getByText('users:write')).toBeInTheDocument();
      expect(screen.getByText('users:delete')).toBeInTheDocument();
      expect(screen.getByText('settings:read')).toBeInTheDocument();
      expect(screen.getByText('settings:write')).toBeInTheDocument();
      expect(screen.getByText('*:*')).toBeInTheDocument();
    });

    it('should display permission details correctly', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // Check permission name
      expect(screen.getByText('users:read')).toBeInTheDocument();
      
      // Check resource badge
      const resourceBadges = screen.getAllByText('users');
      expect(resourceBadges.length).toBeGreaterThan(0);
      
      // Check action badge
      const readBadges = screen.getAllByText('read');
      expect(readBadges.length).toBeGreaterThan(0);
      
      // Check description
      expect(screen.getByText('View users')).toBeInTheDocument();
    });

    it('should display correct badge variants for different actions', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // All action types should be present
      expect(screen.getAllByText('read').length).toBeGreaterThan(0);
      expect(screen.getAllByText('write').length).toBeGreaterThan(0);
      expect(screen.getAllByText('delete').length).toBeGreaterThan(0);
      expect(screen.getAllByText('*').length).toBeGreaterThan(0);
    });

    it('should display results count', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Showing 6 of 6 permissions/i)).toBeInTheDocument();
      });
    });

    it('should display loading state while fetching permissions', async () => {
      let resolvePermissions: (value: Permission[]) => void;
      const permissionsPromise = new Promise<Permission[]>((resolve) => {
        resolvePermissions = resolve;
      });
      vi.mocked(PermissionApi.getAll).mockReturnValue(permissionsPromise);

      render(<PermissionsPage />, { wrapper });

      // Should show loading spinner
      await waitFor(() => {
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePermissions!(mockPermissions);

      // Loading should disappear
      await waitFor(() => {
        expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
      });
    });

    it('should display error state when fetch fails', async () => {
      const errorMessage = 'Failed to load permissions';
      vi.mocked(PermissionApi.getAll).mockRejectedValue(new Error(errorMessage));

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should retry loading permissions when retry button is clicked', async () => {
      const user = userEvent.setup();
      
      // First call fails
      vi.mocked(PermissionApi.getAll).mockRejectedValueOnce(new Error('Network error'));

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Second call succeeds
      vi.mocked(PermissionApi.getAll).mockResolvedValueOnce(mockPermissions);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });
    });

    it('should display empty state when no permissions exist', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue([]);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/no permissions found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter permissions by search query', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // Search for "users"
      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      await user.type(searchInput, 'users');

      // Should show only user permissions
      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
        expect(screen.getByText('users:write')).toBeInTheDocument();
        expect(screen.getByText('users:delete')).toBeInTheDocument();
        expect(screen.queryByText('settings:read')).not.toBeInTheDocument();
      });

      // Results count should update
      expect(screen.getByText(/Showing 3 of 6 permissions/i)).toBeInTheDocument();
    });

    it('should search by permission name', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      await user.type(searchInput, 'users:write');

      await waitFor(() => {
        expect(screen.getByText('users:write')).toBeInTheDocument();
        expect(screen.queryByText('users:read')).not.toBeInTheDocument();
      });
    });

    it('should search by description', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      await user.type(searchInput, 'View users');

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
        expect(screen.queryByText('users:write')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when search has no results', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/no permissions match your filters/i)).toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      await user.type(searchInput, 'USERS');

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
        expect(screen.getByText('users:write')).toBeInTheDocument();
      });
    });
  });

  describe('Resource Filter', () => {
    it('should filter permissions by resource', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // Open resource filter dropdown
      const filterTrigger = screen.getByRole('combobox');
      await user.click(filterTrigger);

      // Select "users" resource
      const usersOption = await screen.findByRole('option', { name: 'users' });
      await user.click(usersOption);

      // Should show only user permissions
      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
        expect(screen.getByText('users:write')).toBeInTheDocument();
        expect(screen.getByText('users:delete')).toBeInTheDocument();
        expect(screen.queryByText('settings:read')).not.toBeInTheDocument();
      });

      // Results count should update
      expect(screen.getByText(/Showing 3 of 6 permissions/i)).toBeInTheDocument();
    });

    it('should combine search and resource filter', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // Apply resource filter
      const filterTrigger = screen.getByRole('combobox');
      await user.click(filterTrigger);
      const usersOption = await screen.findByRole('option', { name: 'users' });
      await user.click(usersOption);

      // Apply search
      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      await user.type(searchInput, 'write');

      // Should show only users:write
      await waitFor(() => {
        expect(screen.getByText('users:write')).toBeInTheDocument();
        expect(screen.queryByText('users:read')).not.toBeInTheDocument();
        expect(screen.queryByText('settings:write')).not.toBeInTheDocument();
      });
    });

    it('should show all resources in filter dropdown', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      const filterTrigger = screen.getByRole('combobox');
      await user.click(filterTrigger);

      // Should show all unique resources
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'All Resources' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'users' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'settings' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '*' })).toBeInTheDocument();
      });
    });
  });

  describe('Clear Filters', () => {
    it('should show clear filters button when filters are active', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // Initially no clear button
      expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

      // Add search query
      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      await user.type(searchInput, 'users');

      // Clear button should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // Apply search
      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      await user.type(searchInput, 'users');

      // Apply resource filter
      const filterTrigger = screen.getByRole('combobox');
      await user.click(filterTrigger);
      const usersOption = await screen.findByRole('option', { name: 'users' });
      await user.click(usersOption);

      // Click clear filters
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      // All permissions should be visible again
      await waitFor(() => {
        expect(screen.getByText(/Showing 6 of 6 permissions/i)).toBeInTheDocument();
      });

      // Search input should be cleared
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Permission Guard Integration', () => {
    it('should not render page without permissions:read permission', async () => {
      // User without permissions:read
      const userWithoutPermission = {
        ...mockUser,
        role: {
          ...mockUser.role,
          rolePermissions: [],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => userWithoutPermission,
      });

      render(<PermissionsPage />, { wrapper });

      // Wait for auth to load
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Page content should not be visible
      await waitFor(() => {
        expect(screen.queryByText('Permissions')).not.toBeInTheDocument();
      });
    });

    it('should render page with permissions:read permission', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      // Page should render
      await waitFor(() => {
        expect(screen.getByText('Permissions')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /permissions/i, level: 1 })).toBeInTheDocument();
      });
    });

    it('should have accessible table structure', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      // Check for table headers
      expect(screen.getByRole('columnheader', { name: /permission name/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /resource/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /action/i })).toBeInTheDocument();
    });

    it('should have accessible search input', async () => {
      vi.mocked(PermissionApi.getAll).mockResolvedValue(mockPermissions);

      render(<PermissionsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('users:read')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search permissions/i);
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });
});
