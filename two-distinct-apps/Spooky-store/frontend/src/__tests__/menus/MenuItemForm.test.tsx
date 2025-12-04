/**
 * MenuItemForm Component Tests
 * Tests Requirements: 7.3, 7.4, 7.8, 2.5, 2.6, 12.1, 12.2
 * 
 * Tests menu item form validation and functionality
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockPermissions = [
  { id: 'perm-1', key: 'ecommerce:read', name: 'Read E-commerce' },
  { id: 'perm-2', key: 'products:read', name: 'Read Products' },
];

const mockRoles = [
  { id: 'role-1', name: 'Admin' },
  { id: 'role-2', name: 'Manager' },
];

const mockParentMenus = [
  { id: 'menu-1', label: 'E-Commerce', key: 'ecommerce' },
  { id: 'menu-2', label: 'Settings', key: 'settings' },
];

const mockExistingMenu = {
  id: 'menu-edit',
  key: 'products',
  label: 'Products',
  icon: 'Package',
  route: '/dashboard/ecommerce/products',
  order: 1,
  parentId: 'menu-1',
  pageType: 'HARDCODED',
  pageIdentifier: null,
  componentPath: '/app/dashboard/ecommerce/products/page',
  isActive: true,
  requiredPermissions: ['products:read'],
  requiredRoles: [],
  featureFlag: null,
  description: 'Manage products',
  badge: '12',
};

const setupMockFetch = () => {
  global.fetch = vi.fn((url) => {
    const urlStr = url.toString();

    if (urlStr.includes('/api/permissions')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPermissions),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    if (urlStr.includes('/api/roles')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRoles),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    if (urlStr.includes('/api/dashboard-menus')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockParentMenus),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    }

    return Promise.reject(new Error('Not found'));
  });
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('MenuItemForm - Form Fields', () => {
  beforeEach(() => {
    setupMockFetch();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render all required input fields', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/key/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/icon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/route/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/order/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/page type/i)).toBeInTheDocument();
  });

  it('should populate form with existing menu data in edit mode', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm 
          menu={mockExistingMenu} 
          onSubmit={onSubmit} 
          onCancel={onCancel} 
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('products')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Products')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/dashboard/ecommerce/products')).toBeInTheDocument();
  });

  it('should show pageIdentifier field when WIDGET_BASED is selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/page type/i)).toBeInTheDocument();
    });

    // Select WIDGET_BASED
    const pageTypeSelect = screen.getByLabelText(/page type/i);
    await user.click(pageTypeSelect);
    
    const widgetOption = await screen.findByText('WIDGET_BASED');
    await user.click(widgetOption);

    // Should show pageIdentifier field
    await waitFor(() => {
      expect(screen.getByLabelText(/page identifier/i)).toBeInTheDocument();
    });
  });

  it('should show componentPath field when HARDCODED is selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/page type/i)).toBeInTheDocument();
    });

    // Select HARDCODED
    const pageTypeSelect = screen.getByLabelText(/page type/i);
    await user.click(pageTypeSelect);
    
    const hardcodedOption = await screen.findByText('HARDCODED');
    await user.click(hardcodedOption);

    // Should show componentPath field
    await waitFor(() => {
      expect(screen.getByLabelText(/component path/i)).toBeInTheDocument();
    });
  });

  it('should render icon picker with preview', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/icon/i)).toBeInTheDocument();
    });

    // Icon picker should be present
    const iconInput = screen.getByLabelText(/icon/i);
    expect(iconInput).toBeInTheDocument();
  });

  it('should render permission multi-select', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/permissions/i)).toBeInTheDocument();
    });
  });

  it('should render role multi-select', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/roles/i)).toBeInTheDocument();
    });
  });

  it('should render parent menu selector', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/parent menu/i)).toBeInTheDocument();
    });
  });
});

describe('MenuItemForm - Validation', () => {
  beforeEach(() => {
    setupMockFetch();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should validate required fields', async () => {
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

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /save|submit/i });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should validate key format', async () => {
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

    const keyInput = screen.getByLabelText(/key/i);
    await user.type(keyInput, 'Invalid Key!');

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid|format/i)).toBeInTheDocument();
    });
  });

  it('should validate route format', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/route/i)).toBeInTheDocument();
    });

    const routeInput = screen.getByLabelText(/route/i);
    await user.type(routeInput, 'invalid-route');

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/must start with/i)).toBeInTheDocument();
    });
  });

  it('should validate order is a positive number', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/order/i)).toBeInTheDocument();
    });

    const orderInput = screen.getByLabelText(/order/i);
    await user.clear(orderInput);
    await user.type(orderInput, '-1');

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/positive|greater than/i)).toBeInTheDocument();
    });
  });

  it('should require pageIdentifier when WIDGET_BASED is selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/page type/i)).toBeInTheDocument();
    });

    // Select WIDGET_BASED
    const pageTypeSelect = screen.getByLabelText(/page type/i);
    await user.click(pageTypeSelect);
    const widgetOption = await screen.findByText('WIDGET_BASED');
    await user.click(widgetOption);

    // Try to submit without pageIdentifier
    const submitButton = screen.getByRole('button', { name: /save|submit/i });
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/page identifier.*required/i)).toBeInTheDocument();
    });
  });

  it('should require componentPath when HARDCODED is selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/page type/i)).toBeInTheDocument();
    });

    // Select HARDCODED
    const pageTypeSelect = screen.getByLabelText(/page type/i);
    await user.click(pageTypeSelect);
    const hardcodedOption = await screen.findByText('HARDCODED');
    await user.click(hardcodedOption);

    // Try to submit without componentPath
    const submitButton = screen.getByRole('button', { name: /save|submit/i });
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/component path.*required/i)).toBeInTheDocument();
    });
  });
});

describe('MenuItemForm - Form Submission', () => {
  beforeEach(() => {
    setupMockFetch();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should submit valid form data', async () => {
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

    // Fill in all required fields
    await user.type(screen.getByLabelText(/key/i), 'test-menu');
    await user.type(screen.getByLabelText(/label/i), 'Test Menu');
    await user.type(screen.getByLabelText(/icon/i), 'TestIcon');
    await user.type(screen.getByLabelText(/route/i), '/dashboard/test');
    await user.type(screen.getByLabelText(/order/i), '1');

    // Select page type
    const pageTypeSelect = screen.getByLabelText(/page type/i);
    await user.click(pageTypeSelect);
    const hardcodedOption = await screen.findByText('HARDCODED');
    await user.click(hardcodedOption);

    // Fill componentPath
    await user.type(screen.getByLabelText(/component path/i), '/app/dashboard/test/page');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save|submit/i });
    await user.click(submitButton);

    // Should call onSubmit with form data
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test-menu',
          label: 'Test Menu',
          route: '/dashboard/test',
          pageType: 'HARDCODED',
        })
      );
    });
  });

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MenuItemForm onSubmit={onSubmit} onCancel={onCancel} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
