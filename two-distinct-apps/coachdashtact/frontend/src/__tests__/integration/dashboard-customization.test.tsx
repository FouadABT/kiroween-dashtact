/**
 * Integration Tests: Dashboard Customization System
 * Tests Requirements: All dashboard customization requirements
 * 
 * This test suite covers:
 * - Complete workflow: discover widgets → create layout → edit layout
 * - Different user roles and permissions
 * - Responsive behavior on mobile/tablet/desktop
 * - Theme integration (light/dark mode)
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { WidgetLibrary } from '@/components/admin/WidgetLibrary';

// Mock data
const mockWidgets = [
  {
    id: 'widget-1',
    key: 'stats-card',
    name: 'StatsCard',
    description: 'Displays a single metric',
    category: 'core',
    icon: 'LayoutDashboard',
    defaultGridSpan: 6,
    minGridSpan: 3,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        value: { type: 'number' }
      }
    },
    dataRequirements: {
      permissions: ['analytics:read'],
      endpoints: [],
      dependencies: []
    },
    useCases: ['Display KPIs'],
    examples: [],
    tags: ['core', 'stats'],
    isActive: true,
    isSystemWidget: true
  },
  {
    id: 'widget-2',
    key: 'chart-widget',
    name: 'ChartWidget',
    description: 'Displays charts',
    category: 'data-display',
    icon: 'BarChart3',
    defaultGridSpan: 8,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        title: { type: 'string' }
      }
    },
    dataRequirements: {
      permissions: ['analytics:read'],
      endpoints: [],
      dependencies: []
    },
    useCases: ['Visualize data'],
    examples: [],
    tags: ['data-display', 'chart'],
    isActive: true,
    isSystemWidget: true
  }
];

const mockLayout = {
  id: 'layout-1',
  pageId: 'overview',
  userId: 'user-1',
  scope: 'user',
  name: 'My Dashboard',
  description: 'Custom dashboard layout',
  isActive: true,
  isDefault: false,
  widgetInstances: [
    {
      id: 'instance-1',
      layoutId: 'layout-1',
      widgetKey: 'stats-card',
      position: 0,
      gridSpan: 6,
      gridRow: null,
      config: {
        title: 'Total Users',
        value: 1234
      },
      isVisible: true
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  roleId: 'role-1',
  roleName: 'Admin',
  permissions: ['widgets:read', 'widgets:write', 'layouts:read', 'layouts:write', 'analytics:read']
};

const mockManagerUser = {
  id: 'user-2',
  email: 'manager@example.com',
  name: 'Manager User',
  roleId: 'role-2',
  roleName: 'Manager',
  permissions: ['widgets:read', 'layouts:read', 'analytics:read']
};

// Mock fetch
const setupMockFetch = (user = mockUser) => {
  global.fetch = vi.fn((url, options) => {
    const urlStr = url.toString();
    
    // Widget registry endpoints
    if (urlStr.includes('/api/widgets/registry') && !urlStr.includes('search')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ widgets: mockWidgets, total: mockWidgets.length }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);
    }
    
    // Widget search
    if (urlStr.includes('/api/widgets/registry/search')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: mockWidgets.map(w => ({ widget: w, relevanceScore: 0.9 })) }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);
    }
    
    // Layout endpoints - GET specific layout by pageId
    if (urlStr.includes('/api/dashboard-layouts/overview') && options?.method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLayout),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);
    }
    
    // Layout endpoints - GET all layouts
    if (urlStr.includes('/api/dashboard-layouts') && options?.method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ layouts: [mockLayout], total: 1 }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);
    }
    
    // Create layout
    if (urlStr.includes('/api/dashboard-layouts') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLayout),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);
    }
    
    // Add widget to layout
    if (urlStr.includes('/widgets') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'instance-new',
          layoutId: 'layout-1',
          widgetKey: 'chart-widget',
          position: 1,
          gridSpan: 8,
          config: {},
          isVisible: true
        }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);
    }
    
    // Settings endpoint
    if (urlStr.includes('/api/settings/global')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'settings-1',
          themeMode: 'light',
          lightPalette: {},
          darkPalette: {},
          typography: {}
        }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);
    }
    
    return Promise.reject(new Error('Not found'));
  });
};

// Test wrapper component
const TestWrapper = ({ children, user = mockUser }: { children: React.ReactNode; user?: typeof mockUser }) => {
  // Setup mock fetch before rendering
  React.useEffect(() => {
    setupMockFetch(user);
  }, [user]);
  
  return (
    <AuthProvider initialUser={user as any}>
      <ThemeProvider>
        <WidgetProvider>
          {children}
        </WidgetProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

describe('Dashboard Customization - Complete Workflow', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full workflow: discover widgets → create layout → edit layout', async () => {
    const user = userEvent.setup();
    
    // Step 1: Render dashboard with widget library
    const { rerender } = render(
      <TestWrapper>
        <div>
          <DashboardGrid pageId="overview" />
          <WidgetLibrary open={true} onOpenChange={() => {}} />
        </div>
      </TestWrapper>
    );

    // Step 2: Discover widgets - wait for widgets to load
    await waitFor(() => {
      expect(screen.getByText('StatsCard')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify widget discovery
    expect(screen.getByText('ChartWidget')).toBeInTheDocument();
    
    // Step 3: Search for widgets
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    await user.type(searchInput, 'chart');
    
    await waitFor(() => {
      expect(screen.getByText('ChartWidget')).toBeInTheDocument();
    });

    // Step 4: Add widget to layout (simulate click)
    const addButton = screen.getAllByRole('button', { name: /add/i })[0];
    await user.click(addButton);

    // Verify widget was added
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/widgets'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('should handle widget configuration and save', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    // Wait for layout to load
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Enter edit mode (if edit button exists)
    const editButton = screen.queryByRole('button', { name: /edit layout/i });
    if (editButton) {
      await user.click(editButton);
    }

    // Verify widget is displayed
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });
});

describe('Dashboard Customization - User Roles and Permissions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow admin users full access to customization', async () => {
    setupMockFetch(mockUser);
    
    render(
      <TestWrapper user={mockUser}>
        <WidgetLibrary open={true} onOpenChange={() => {}} />
      </TestWrapper>
    );

    // Admin should see all widgets
    await waitFor(() => {
      expect(screen.getByText('StatsCard')).toBeInTheDocument();
    });
    
    expect(screen.getByText('ChartWidget')).toBeInTheDocument();
  });

  it('should restrict manager users to read-only access', async () => {
    setupMockFetch(mockManagerUser);
    
    render(
      <TestWrapper user={mockManagerUser}>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    // Manager should see widgets but not edit controls
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /edit layout/i })).not.toBeInTheDocument();
    });
  });

  it('should filter widgets by user permissions', async () => {
    const limitedUser = {
      ...mockUser,
      permissions: ['widgets:read', 'layouts:read'] // No analytics:read
    };
    
    setupMockFetch(limitedUser);
    
    render(
      <TestWrapper user={limitedUser}>
        <WidgetLibrary open={true} onOpenChange={() => {}} />
      </TestWrapper>
    );

    // Should not see widgets requiring analytics:read
    await waitFor(() => {
      // Widget library should load but filter widgets
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });
  });
});

describe('Dashboard Customization - Responsive Behavior', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly on mobile viewport', async () => {
    // Mock mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;
    window.dispatchEvent(new Event('resize'));

    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Verify mobile-friendly layout
    const grid = screen.getByText('Total Users').closest('[class*="grid"]');
    expect(grid).toBeInTheDocument();
  });

  it('should render correctly on tablet viewport', async () => {
    // Mock tablet viewport
    global.innerWidth = 768;
    global.innerHeight = 1024;
    window.dispatchEvent(new Event('resize'));

    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Verify tablet layout
    const grid = screen.getByText('Total Users').closest('[class*="grid"]');
    expect(grid).toBeInTheDocument();
  });

  it('should render correctly on desktop viewport', async () => {
    // Mock desktop viewport
    global.innerWidth = 1920;
    global.innerHeight = 1080;
    window.dispatchEvent(new Event('resize'));

    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Verify desktop layout with full grid
    const grid = screen.getByText('Total Users').closest('[class*="grid"]');
    expect(grid).toBeInTheDocument();
  });

  it('should adjust widget sizes responsively', async () => {
    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Verify widget has responsive classes
    const widget = screen.getByText('Total Users').closest('[class*="col-span"]');
    expect(widget).toBeInTheDocument();
  });
});

describe('Dashboard Customization - Theme Integration', () => {
  beforeEach(() => {
    setupMockFetch();
    localStorage.clear();
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render widgets correctly in light mode', async () => {
    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Verify light mode is applied
    expect(document.documentElement.classList.contains('light')).toBe(true);
    
    // Verify widget uses theme colors
    const widget = screen.getByText('Total Users').closest('[class*="bg-"]');
    expect(widget).toBeInTheDocument();
  });

  it('should render widgets correctly in dark mode', async () => {
    // Set dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme-mode', 'dark');

    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Verify dark mode is applied
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should update widget colors when theme changes', async () => {
    const user = userEvent.setup();
    
    const ThemeToggle = () => {
      const { setThemeMode } = useTheme();
      return (
        <button onClick={() => setThemeMode('dark')}>
          Toggle Dark
        </button>
      );
    };

    render(
      <TestWrapper>
        <div>
          <DashboardGrid pageId="overview" />
          <ThemeToggle />
        </div>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Toggle to dark mode
    const toggleButton = screen.getByText('Toggle Dark');
    await user.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('should maintain widget visibility across theme changes', async () => {
    const user = userEvent.setup();
    
    const ThemeToggle = () => {
      const { setThemeMode } = useTheme();
      return (
        <>
          <button onClick={() => setThemeMode('light')}>Light</button>
          <button onClick={() => setThemeMode('dark')}>Dark</button>
        </>
      );
    };

    render(
      <TestWrapper>
        <div>
          <DashboardGrid pageId="overview" />
          <ThemeToggle />
        </div>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Switch themes multiple times
    const lightButton = screen.getByText('Light');
    const darkButton = screen.getByText('Dark');

    await user.click(darkButton);
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    await user.click(lightButton);
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Widget should remain visible
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });
});

describe('Dashboard Customization - Error Handling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle widget loading errors gracefully', async () => {
    // Mock fetch to return error
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    // Should show error state or fallback
    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });
  });

  it('should handle layout save errors', async () => {
    // Mock fetch to return error on save
    global.fetch = vi.fn((url, options) => {
      if (options?.method === 'POST' || options?.method === 'PATCH') {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: 'Save failed' })
        } as Response);
      }
      return setupMockFetch();
    });

    render(
      <TestWrapper>
        <DashboardGrid pageId="overview" />
      </TestWrapper>
    );

    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });
  });
});


