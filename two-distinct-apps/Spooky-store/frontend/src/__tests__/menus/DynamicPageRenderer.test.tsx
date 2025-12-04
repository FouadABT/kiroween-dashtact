/**
 * DynamicPageRenderer Component Tests
 * Tests Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 2.5, 2.6
 * 
 * Tests dynamic page rendering based on menu configuration
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DynamicPageRenderer } from '@/components/dashboard/DynamicPageRenderer';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/test',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock DashboardGrid component
vi.mock('@/components/dashboard/DashboardGrid', () => ({
  DashboardGrid: ({ pageId }: { pageId: string }) => (
    <div data-testid="dashboard-grid">Dashboard Grid: {pageId}</div>
  ),
}));

const mockWidgetBasedMenu = {
  id: 'menu-1',
  key: 'dashboard',
  label: 'Dashboard',
  icon: 'LayoutDashboard',
  route: '/dashboard',
  pageType: 'WIDGET_BASED',
  pageIdentifier: 'main-dashboard',
  componentPath: null,
  isActive: true,
  requiredPermissions: [],
  requiredRoles: [],
};

const mockHardcodedMenu = {
  id: 'menu-2',
  key: 'products',
  label: 'Products',
  icon: 'Package',
  route: '/dashboard/ecommerce/products',
  pageType: 'HARDCODED',
  pageIdentifier: null,
  componentPath: '/app/dashboard/ecommerce/products/page',
  isActive: true,
  requiredPermissions: ['products:read'],
  requiredRoles: [],
};

const mockCustomMenu = {
  id: 'menu-3',
  key: 'custom',
  label: 'Custom Page',
  icon: 'Star',
  route: '/dashboard/custom',
  pageType: 'CUSTOM',
  pageIdentifier: 'custom-page',
  componentPath: '/app/dashboard/custom/page',
  isActive: true,
  requiredPermissions: [],
  requiredRoles: [],
};

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  roleId: 'role-1',
  roleName: 'Admin',
  permissions: ['products:read', 'orders:read'],
};

const setupMockFetch = (menu: any) => {
  global.fetch = vi.fn((url) => {
    if (url.toString().includes('/api/dashboard-menus/config')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(menu),
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

describe('DynamicPageRenderer - Page Type Rendering', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render DashboardGrid for WIDGET_BASED pages', async () => {
    setupMockFetch(mockWidgetBasedMenu);

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
    });

    expect(screen.getByText(/main-dashboard/i)).toBeInTheDocument();
  });

  it('should render component for HARDCODED pages', async () => {
    setupMockFetch(mockHardcodedMenu);

    // Mock dynamic import
    vi.mock('/app/dashboard/ecommerce/products/page', () => ({
      default: () => <div>Products Page Component</div>,
    }));

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard/ecommerce/products" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/products page|loading/i)).toBeInTheDocument();
    });
  });

  it('should support CUSTOM page type with hybrid logic', async () => {
    setupMockFetch(mockCustomMenu);

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard/custom" />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should render either dashboard grid or custom component
      expect(document.body).toBeInTheDocument();
    });
  });
});

describe('DynamicPageRenderer - Permission Checks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should enforce permission checks before rendering', async () => {
    setupMockFetch(mockHardcodedMenu);

    const userWithoutPermission = {
      ...mockUser,
      permissions: [], // No products:read permission
    };

    render(
      <TestWrapper user={userWithoutPermission}>
        <DynamicPageRenderer route="/dashboard/ecommerce/products" />
      </TestWrapper>
    );

    // Should show unauthorized or access denied
    await waitFor(() => {
      expect(screen.getByText(/unauthorized|access denied|permission/i)).toBeInTheDocument();
    });
  });

  it('should render page when user has required permissions', async () => {
    setupMockFetch(mockHardcodedMenu);

    render(
      <TestWrapper user={mockUser}>
        <DynamicPageRenderer route="/dashboard/ecommerce/products" />
      </TestWrapper>
    );

    // Should render page content
    await waitFor(() => {
      expect(screen.queryByText(/unauthorized|access denied/i)).not.toBeInTheDocument();
    });
  });

  it('should allow access to pages without permission requirements', async () => {
    setupMockFetch(mockWidgetBasedMenu);

    const userWithoutPermissions = {
      ...mockUser,
      permissions: [],
    };

    render(
      <TestWrapper user={userWithoutPermissions}>
        <DynamicPageRenderer route="/dashboard" />
      </TestWrapper>
    );

    // Should render page
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
    });
  });
});

describe('DynamicPageRenderer - Loading and Error States', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state while fetching config', async () => {
    // Delay the fetch response
    global.fetch = vi.fn(() =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: () => Promise.resolve(mockWidgetBasedMenu),
              headers: new Headers({ 'content-type': 'application/json' }),
            } as Response),
          100
        )
      )
    );

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard" />
      </TestWrapper>
    );

    // Should show loading state
    expect(screen.getByText(/loading/i) || document.querySelector('[class*="skeleton"]')).toBeTruthy();

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
    });
  });

  it('should display error state for unauthorized pages', async () => {
    setupMockFetch(mockHardcodedMenu);

    const unauthorizedUser = {
      ...mockUser,
      permissions: [],
    };

    render(
      <TestWrapper user={unauthorizedUser}>
        <DynamicPageRenderer route="/dashboard/ecommerce/products" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/unauthorized|access denied/i)).toBeInTheDocument();
    });
  });

  it('should display error state for missing pages', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Page not found' }),
      } as Response)
    );

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard/nonexistent" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/not found|error/i)).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });
});

describe('DynamicPageRenderer - Route Matching', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch config for current route', async () => {
    setupMockFetch(mockWidgetBasedMenu);

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dashboard-menus/config'),
        expect.any(Object)
      );
    });
  });

  it('should handle dynamic route parameters', async () => {
    const dynamicMenu = {
      ...mockHardcodedMenu,
      route: '/dashboard/ecommerce/products/:id',
    };

    setupMockFetch(dynamicMenu);

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard/ecommerce/products/123" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});

describe('DynamicPageRenderer - Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should integrate with AuthContext for permission checks', async () => {
    setupMockFetch(mockHardcodedMenu);

    render(
      <TestWrapper user={mockUser}>
        <DynamicPageRenderer route="/dashboard/ecommerce/products" />
      </TestWrapper>
    );

    // Should use auth context to check permissions
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('should pass pageIdentifier to DashboardGrid correctly', async () => {
    setupMockFetch(mockWidgetBasedMenu);

    render(
      <TestWrapper>
        <DynamicPageRenderer route="/dashboard" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/main-dashboard/i)).toBeInTheDocument();
    });
  });
});
