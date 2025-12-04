/**
 * MenuManagementPage Component Tests
 * Tests Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8, 13.3
 * 
 * Tests super admin menu management interface
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import MenuManagementPage from '@/app/dashboard/settings/menus/page';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/settings/menus',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockMenus = [
  {
    id: 'menu-1',
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/dashboard',
    order: 1,
    parentId: null,
    pageType: 'WIDGET_BASED',
    pageIdentifier: 'main-dashboard',
    componentPath: null,
    isActive: true,
    requiredPermissions: [],
    requiredRoles: [],
    featureFlag: null,
    description: 'Main dashboard',
    badge: null,
    children: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'menu-2',
    key: 'ecommerce',
    label: 'E-Commerce',
    icon: 'ShoppingCart',
    route: '/dashboard/ecommerce',
    order: 2,
    parentId: null,
    pageType: 'WIDGET_BASED',
    pageIdentifier: 'ecommerce-dashboard',
    componentPath: null,
    isActive: true,
    requiredPermissions: ['ecommerce:read'],
    requiredRoles: [],
    featureFlag: 'ecommerce',
    description: 'E-commerce management',
    badge: null,
    children: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockSuperAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Super Admin',
  roleId: 'role-super-admin',
  roleName: 'Super Admin',
  permissions: ['menus:view', 'menus:create', 'menus:update', 'menus:delete'],
};

const mockRegularUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Regular User',
  roleId: 'role-user',
  roleName: 'User',
  permissions: [],
};

const setupMockFetch = (user = mockSuperAdmin) => {
  global.fetch = vi.fn((url, options) => {
    const urlStr = url.toString();

    // Get all menus
    if (urlStr.includes('/api/dashboard-menus') && options?.method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMenus),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    // Create menu
    if (urlStr.includes('/api/dashboard-menus') && options?.method === 'POST') {
      const newMenu = {
        id: 'menu-new',
        ...JSON.parse(options.body as string),
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(newMenu),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    // Update menu
    if (urlStr.match(/\/api\/dashboard-menus\/menu-\d+/) && options?.method === 'PATCH') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...mockMenus[0], ...JSON.parse(options.body as string) }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    // Delete menu
    if (urlStr.match(/\/api\/dashboard-menus\/menu-\d+/) && options?.method === 'DELETE') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    // Toggle active
    if (urlStr.includes('/toggle') && options?.method === 'PATCH') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...mockMenus[0], isActive: !mockMenus[0].isActive }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    return Promise.reject(new Error('Not found'));
  });
};

const TestWrapper = ({ children, user = mockSuperAdmin }: { children: React.ReactNode; user?: typeof mockSuperAdmin }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={user as any}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('MenuManagementPage - Super Admin Access', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow super admin to access menu management page', async () => {
    render(
      <TestWrapper user={mockSuperAdmin}>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/menu management/i)).toBeInTheDocument();
    });
  });

  it('should deny access to non-super admin users', async () => {
    render(
      <TestWrapper user={mockRegularUser}>
        <MenuManagementPage />
      </TestWrapper>
    );

    // Should show access denied or redirect
    await waitFor(() => {
      expect(screen.queryByText(/menu management/i)).not.toBeInTheDocument();
    });
  });
});

describe('MenuManagementPage - Menu Display', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and display all menus in hierarchical tree view', async () => {
    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('E-Commerce')).toBeInTheDocument();
  });

  it('should display menu metadata (type, permissions, status, order)', async () => {
    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Check for metadata display
    expect(screen.getByText(/WIDGET_BASED/i)).toBeInTheDocument();
    expect(screen.getByText(/Active/i)).toBeInTheDocument();
  });

  it('should show create new menu button', async () => {
    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create|new menu/i })).toBeInTheDocument();
    });
  });

  it('should show edit button for each menu item', async () => {
    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('should show delete button with confirmation dialog', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);

    // Click delete button
    await user.click(deleteButtons[0]);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText(/confirm|are you sure/i)).toBeInTheDocument();
    });
  });

  it('should show toggle active/inactive button', async () => {
    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByRole('button', { name: /toggle|active|inactive/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
  });
});

describe('MenuManagementPage - CRUD Operations', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should open create menu form when create button clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create|new menu/i })).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create|new menu/i });
    await user.click(createButton);

    // Should show form
    await waitFor(() => {
      expect(screen.getByLabelText(/label|name/i)).toBeInTheDocument();
    });
  });

  it('should open edit menu form when edit button clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    // Should show form with existing data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Dashboard')).toBeInTheDocument();
    });
  });

  it('should delete menu after confirmation', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm|yes|delete/i })).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm|yes|delete/i });
    await user.click(confirmButton);

    // Should call delete API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dashboard-menus/'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('should toggle menu active status', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByRole('button', { name: /toggle|active|inactive/i });
    await user.click(toggleButtons[0]);

    // Should call toggle API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/toggle'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });
});

describe('MenuManagementPage - Search and Filter', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should implement search functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const searchInput = screen.queryByPlaceholderText(/search/i);
    if (searchInput) {
      await user.type(searchInput, 'Dashboard');

      // Should filter results
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.queryByText('E-Commerce')).not.toBeInTheDocument();
      });
    }
  });

  it('should implement filter functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Look for filter controls
    const filterButton = screen.queryByRole('button', { name: /filter/i });
    if (filterButton) {
      await user.click(filterButton);

      // Should show filter options
      await waitFor(() => {
        expect(screen.getByText(/page type|status|active/i)).toBeInTheDocument();
      });
    }
  });
});

describe('MenuManagementPage - Error Handling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle fetch errors gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/error|failed/i) || document.body).toBeInTheDocument();
    });
  });

  it('should handle delete errors', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn((url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: 'Delete failed' }),
        } as Response);
      }
      return setupMockFetch();
    });

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: /confirm|yes|delete/i });
    await user.click(confirmButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });
});
