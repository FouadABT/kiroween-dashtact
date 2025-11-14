/**
 * NavigationContext Tests
 * 
 * Tests for nested navigation filtering based on user permissions
 */

import { renderHook, waitFor } from '@testing-library/react';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock API
jest.mock('@/lib/api', () => ({
  PagesApi: {
    getAllPublic: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

// Mock features config
jest.mock('@/config/features.config', () => ({
  featuresConfig: {
    blog: { enabled: false },
    ecommerce: { enabled: true },
  },
}));

describe('NavigationContext - Nested Navigation Filtering', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
  });

  it('should filter nested children based on permissions', async () => {
    // Mock user with only ecommerce:read and products:read permissions
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      roleId: 'role-1',
      roleName: 'Manager',
      permissions: ['ecommerce:read', 'products:read'],
    };

    // Mock auth context
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      hasPermission: (permission: string) => mockUser.permissions.includes(permission),
      hasRole: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    const { result } = renderHook(() => useNavigation(), { wrapper });

    await waitFor(() => {
      expect(result.current.navigationItems).toBeDefined();
    });

    // Find E-Commerce navigation item
    const ecommerceItem = result.current.navigationItems.find(
      (item) => item.title === 'E-Commerce'
    );

    expect(ecommerceItem).toBeDefined();
    expect(ecommerceItem?.children).toBeDefined();
    
    // Should only show Overview and Products (not Orders, Customers, Inventory)
    expect(ecommerceItem?.children?.length).toBe(2);
    expect(ecommerceItem?.children?.map(c => c.title)).toEqual(['Overview', 'Products']);
  });

  it('should hide parent item if all children are filtered out', async () => {
    // Mock user with no e-commerce permissions
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      roleId: 'role-1',
      roleName: 'User',
      permissions: ['users:read'],
    };

    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      hasPermission: (permission: string) => mockUser.permissions.includes(permission),
      hasRole: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    const { result } = renderHook(() => useNavigation(), { wrapper });

    await waitFor(() => {
      expect(result.current.navigationItems).toBeDefined();
    });

    // E-Commerce item should not be present
    const ecommerceItem = result.current.navigationItems.find(
      (item) => item.title === 'E-Commerce'
    );

    expect(ecommerceItem).toBeUndefined();
  });

  it('should show all children if user has all permissions', async () => {
    // Mock user with all e-commerce permissions
    const mockUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      roleId: 'role-admin',
      roleName: 'Admin',
      permissions: [
        'ecommerce:read',
        'products:read',
        'orders:read',
        'customers:read',
        'inventory:read',
      ],
    };

    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      hasPermission: (permission: string) => mockUser.permissions.includes(permission),
      hasRole: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    const { result } = renderHook(() => useNavigation(), { wrapper });

    await waitFor(() => {
      expect(result.current.navigationItems).toBeDefined();
    });

    // Find E-Commerce navigation item
    const ecommerceItem = result.current.navigationItems.find(
      (item) => item.title === 'E-Commerce'
    );

    expect(ecommerceItem).toBeDefined();
    expect(ecommerceItem?.children).toBeDefined();
    
    // Should show all 5 children
    expect(ecommerceItem?.children?.length).toBe(5);
    expect(ecommerceItem?.children?.map(c => c.title)).toEqual([
      'Overview',
      'Products',
      'Orders',
      'Customers',
      'Inventory',
    ]);
  });

  it('should handle items without children normally', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      roleId: 'role-1',
      roleName: 'User',
      permissions: ['users:read', 'settings:read'],
    };

    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      hasPermission: (permission: string) => mockUser.permissions.includes(permission),
      hasRole: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    const { result } = renderHook(() => useNavigation(), { wrapper });

    await waitFor(() => {
      expect(result.current.navigationItems).toBeDefined();
    });

    // Should show Users and Settings (no children)
    const usersItem = result.current.navigationItems.find(
      (item) => item.title === 'Users'
    );
    const settingsItem = result.current.navigationItems.find(
      (item) => item.title === 'Settings'
    );

    expect(usersItem).toBeDefined();
    expect(settingsItem).toBeDefined();
    expect(usersItem?.children).toBeUndefined();
    expect(settingsItem?.children).toBeUndefined();
  });

  it('should show items without permission requirements to all users', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      roleId: 'role-1',
      roleName: 'User',
      permissions: [], // No permissions
    };

    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      hasPermission: () => false,
      hasRole: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    const { result } = renderHook(() => useNavigation(), { wrapper });

    await waitFor(() => {
      expect(result.current.navigationItems).toBeDefined();
    });

    // Should show Dashboard, Analytics, Data (no permission required)
    const dashboardItem = result.current.navigationItems.find(
      (item) => item.title === 'Dashboard'
    );
    const analyticsItem = result.current.navigationItems.find(
      (item) => item.title === 'Analytics'
    );
    const dataItem = result.current.navigationItems.find(
      (item) => item.title === 'Data'
    );

    expect(dashboardItem).toBeDefined();
    expect(analyticsItem).toBeDefined();
    expect(dataItem).toBeDefined();
  });
});
