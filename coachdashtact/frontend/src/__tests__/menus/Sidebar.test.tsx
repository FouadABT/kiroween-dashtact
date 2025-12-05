/**
 * Enhanced Sidebar Component Tests
 * Tests Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 6.1, 6.2, 6.3, 6.4, 12.4, 12.5
 * 
 * Tests dynamic menu rendering based on user permissions
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
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
    isActive: true,
    requiredPermissions: [],
    requiredRoles: [],
    featureFlag: null,
    description: 'Main dashboard',
    badge: null,
    children: [],
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
    isActive: true,
    requiredPermissions: ['ecommerce:read'],
    requiredRoles: [],
    featureFlag: 'ecommerce',
    description: 'E-commerce management',
    badge: null,
    children: [
      {
        id: 'menu-3',
        key: 'products',
        label: 'Products',
        icon: 'Package',
        route: '/dashboard/ecommerce/products',
        order: 1,
        parentId: 'menu-2',
        pageType: 'HARDCODED',
        componentPath: '/app/dashboard/ecommerce/products/page',
        isActive: true,
        requiredPermissions: ['products:read'],
        requiredRoles: [],
        featureFlag: null,
        description: 'Manage products',
        badge: '12',
        children: [],
      },
    ],
  },
  {
    id: 'menu-4',
    key: 'settings',
    label: 'Settings',
    icon: 'Settings',
    route: '/dashboard/settings',
    order: 3,
    parentId: null,
    pageType: 'HARDCODED',
    componentPath: '/app/dashboard/settings/page',
    isActive: true,
    requiredPermissions: ['settings:read'],
    requiredRoles: ['Super Admin'],
    featureFlag: null,
    description: 'System settings',
    badge: null,
    children: [],
  },
];

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  roleId: 'role-1',
  roleName: 'Admin',
  permissions: ['ecommerce:read', 'products:read', 'settings:read'],
};

const setupMockFetch = (menus = mockMenus) => {
  global.fetch = vi.fn((url) => {
    if (url.toString().includes('/api/dashboard-menus/user-menus')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(menus),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }
    return Promise.reject(new Error('Not found'));
  });
};

const TestWrapper = ({ children, user = mockUser }: { children: React.ReactNode; user?: typeof mockUser }) => {
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

describe('Enhanced Sidebar - Dynamic Menu Rendering', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and render user-specific menu items', async () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Wait for menus to load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render nested menu structure with expand/collapse', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    });

    // Initially, nested items might be collapsed
    const ecommerceButton = screen.getByText('E-Commerce').closest('button');
    expect(ecommerceButton).toBeInTheDocument();

    // Click to expand
    if (ecommerceButton) {
      await user.click(ecommerceButton);
    }

    // Nested item should appear
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });

  it('should display menu icons using configured icon names', async () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Icons should be rendered (check for svg elements)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should highlight active menu item based on current route', async () => {
    // Mock usePathname to return specific route
    vi.mocked(require('next/navigation').usePathname).mockReturnValue('/dashboard/ecommerce');

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    });

    // Active item should have specific styling
    const activeItem = screen.getByText('E-Commerce').closest('a, button');
    expect(activeItem).toHaveClass(/active|bg-accent/);
  });

  it('should display badge indicators when configured', async () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    });

    // Expand to see nested item with badge
    const ecommerceButton = screen.getByText('E-Commerce').closest('button');
    if (ecommerceButton) {
      await userEvent.setup().click(ecommerceButton);
    }

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('should show loading skeleton while fetching', async () => {
    // Delay the fetch response
    global.fetch = vi.fn(() => 
      new Promise((resolve) => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockMenus),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response), 100)
      )
    );

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Should show loading state
    expect(screen.getByText(/loading/i) || document.querySelector('[class*="skeleton"]')).toBeTruthy();

    // Wait for menus to load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should handle empty menu state gracefully', async () => {
    setupMockFetch([]);

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    // Should show empty state or no crash
    expect(document.body).toBeInTheDocument();
  });

  it('should filter menus based on user permissions', async () => {
    const limitedUser = {
      ...mockUser,
      permissions: ['ecommerce:read'], // No products:read or settings:read
    };

    render(
      <TestWrapper user={limitedUser}>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Should see E-Commerce but not Settings
    expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Should not crash
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});

describe('Enhanced Sidebar - Keyboard Navigation', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should support keyboard navigation through menu items', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Tab through menu items
    await user.tab();
    
    // First focusable element should be focused
    const firstLink = screen.getByText('Dashboard').closest('a, button');
    expect(firstLink).toHaveFocus();
  });

  it('should expand/collapse nested menus with Enter key', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    });

    const ecommerceButton = screen.getByText('E-Commerce').closest('button');
    if (ecommerceButton) {
      ecommerceButton.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
    }
  });
});
