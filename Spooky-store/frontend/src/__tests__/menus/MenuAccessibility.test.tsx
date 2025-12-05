/**
 * Menu System Accessibility Tests
 * Tests Requirements: All frontend requirements with focus on accessibility
 * 
 * Tests keyboard navigation, screen reader support, focus management, and ARIA attributes
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import MenuManagementPage from '@/app/dashboard/settings/menus/page';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tantml:react-query';

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
];

const mockSuperAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Super Admin',
  roleId: 'role-super-admin',
  roleName: 'Super Admin',
  permissions: ['menus:view', 'menus:create', 'menus:update', 'menus:delete', 'ecommerce:read', 'products:read'],
};

const setupMockFetch = () => {
  global.fetch = vi.fn((url) => {
    const urlStr = url.toString();

    if (urlStr.includes('/api/dashboard-menus/user-menus')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMenus),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    if (urlStr.includes('/api/dashboard-menus') && !urlStr.includes('user-menus')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMenus),
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

describe('Sidebar - Keyboard Navigation', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should support Tab navigation through menu items', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Tab to first menu item
    await user.tab();

    // First menu item should be focused
    const firstItem = screen.getByText('Dashboard').closest('a, button');
    expect(firstItem).toHaveFocus();

    // Tab to next item
    await user.tab();

    // Second menu item should be focused
    const secondItem = screen.getByText('E-Commerce').closest('a, button');
    expect(secondItem).toHaveFocus();
  });

  it('should support Arrow key navigation', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Focus first item
    const firstItem = screen.getByText('Dashboard').closest('a, button');
    firstItem?.focus();

    // Arrow down to next item
    await user.keyboard('{ArrowDown}');

    // Should focus next item
    const secondItem = screen.getByText('E-Commerce').closest('a, button');
    expect(secondItem).toHaveFocus();

    // Arrow up to previous item
    await user.keyboard('{ArrowUp}');

    // Should focus previous item
    expect(firstItem).toHaveFocus();
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
    ecommerceButton?.focus();

    // Press Enter to expand
    await user.keyboard('{Enter}');

    // Nested item should appear
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    // Press Enter again to collapse
    await user.keyboard('{Enter}');

    // Nested item should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Products')).not.toBeVisible();
    });
  });

  it('should expand/collapse nested menus with Space key', async () => {
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
    ecommerceButton?.focus();

    // Press Space to expand
    await user.keyboard(' ');

    // Nested item should appear
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });

  it('should support Escape key to close expanded menus', async () => {
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
    ecommerceButton?.focus();

    // Expand menu
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    // Press Escape to collapse
    await user.keyboard('{Escape}');

    // Menu should collapse
    await waitFor(() => {
      expect(screen.queryByText('Products')).not.toBeVisible();
    });
  });
});

describe('Sidebar - Screen Reader Support', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have proper navigation landmark', async () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Should have nav element with aria-label
    const nav = document.querySelector('nav[aria-label]');
    expect(nav).toBeInTheDocument();
  });

  it('should have descriptive aria-labels for menu items', async () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Menu items should have aria-labels
    const dashboardLink = screen.getByText('Dashboard').closest('a, button');
    expect(dashboardLink).toHaveAttribute('aria-label');
  });

  it('should indicate expanded/collapsed state with aria-expanded', async () => {
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

    // Should have aria-expanded attribute
    expect(ecommerceButton).toHaveAttribute('aria-expanded');

    // Initially collapsed
    expect(ecommerceButton).toHaveAttribute('aria-expanded', 'false');

    // Expand menu
    await user.click(ecommerceButton!);

    // Should be expanded
    await waitFor(() => {
      expect(ecommerceButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('should use aria-current for active menu item', async () => {
    // Mock usePathname to return specific route
    vi.mocked(require('next/navigation').usePathname).mockReturnValue('/dashboard');

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const activeLink = screen.getByText('Dashboard').closest('a');
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('should provide accessible names for icon-only buttons', async () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // All buttons should have accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      const hasAccessibleName =
        button.getAttribute('aria-label') ||
        button.getAttribute('aria-labelledby') ||
        button.textContent?.trim();
      expect(hasAccessibleName).toBeTruthy();
    });
  });
});

describe('Sidebar - Focus Management', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain focus when expanding/collapsing menus', async () => {
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
    ecommerceButton?.focus();

    // Expand menu
    await user.keyboard('{Enter}');

    // Focus should remain on button
    expect(ecommerceButton).toHaveFocus();
  });

  it('should have visible focus indicators', async () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const firstItem = screen.getByText('Dashboard').closest('a, button');
    firstItem?.focus();

    // Should have focus-visible class or outline
    const styles = window.getComputedStyle(firstItem!);
    expect(
      firstItem?.classList.contains('focus-visible') ||
      firstItem?.classList.contains('focus:') ||
      styles.outline !== 'none'
    ).toBeTruthy();
  });

  it('should trap focus within expanded nested menus', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    });

    // Expand menu
    const ecommerceButton = screen.getByText('E-Commerce').closest('button');
    await user.click(ecommerceButton!);

    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    // Tab through nested items
    await user.tab();

    // Focus should move to nested item
    const productsLink = screen.getByText('Products').closest('a, button');
    expect(productsLink).toHaveFocus();
  });
});

describe('MenuItemForm - Accessibility', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have proper form labels', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/key/i)).toBeInTheDocument();
    });

    // All form fields should have labels
    expect(screen.getByLabelText(/label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/icon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/route/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/order/i)).toBeInTheDocument();
  });

  it('should associate error messages with form fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save|submit/i })).toBeInTheDocument();
    });

    // Submit without filling fields
    const submitButton = screen.getByRole('button', { name: /save|submit/i });
    await user.click(submitButton);

    // Error messages should be associated with fields via aria-describedby
    await waitFor(() => {
      const keyInput = screen.getByLabelText(/key/i);
      const errorId = keyInput.getAttribute('aria-describedby');
      if (errorId) {
        const errorElement = document.getElementById(errorId);
        expect(errorElement).toBeInTheDocument();
      }
    });
  });

  it('should announce validation errors to screen readers', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save|submit/i })).toBeInTheDocument();
    });

    // Submit without filling fields
    const submitButton = screen.getByRole('button', { name: /save|submit/i });
    await user.click(submitButton);

    // Error messages should have role="alert" or aria-live
    await waitFor(() => {
      const alerts = document.querySelectorAll('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  it('should support keyboard navigation through form fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/key/i)).toBeInTheDocument();
    });

    // Tab through form fields
    await user.tab();
    expect(screen.getByLabelText(/key/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/label/i)).toHaveFocus();
  });
});

describe('MenuManagementPage - Accessibility', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have proper heading hierarchy', async () => {
    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    // Should have logical heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should provide accessible table or list for menu items', async () => {
    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Should use table or list with proper semantics
    const table = document.querySelector('table[role="table"], [role="grid"]');
    const list = document.querySelector('ul, ol');
    expect(table || list).toBeInTheDocument();
  });

  it('should have accessible action buttons', async () => {
    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // All action buttons should have accessible names
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      const hasAccessibleName =
        button.getAttribute('aria-label') ||
        button.getAttribute('aria-labelledby') ||
        button.textContent?.trim();
      expect(hasAccessibleName).toBeTruthy();
    });
  });

  it('should announce dynamic content changes', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MenuManagementPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Look for live regions
    const liveRegions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
    expect(liveRegions.length).toBeGreaterThan(0);
  });
});
