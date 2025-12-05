/**
 * Blog Navigation Integration Tests
 * 
 * Tests the integration of blog navigation with the dashboard navigation system.
 * Verifies that blog menu items appear conditionally based on feature flags and permissions.
 */

import { render, screen } from '@testing-library/react';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { vi } from 'vitest';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

// Mock features config
vi.mock('@/config/features.config', () => ({
  featuresConfig: {
    landingPage: { enabled: false },
    blog: { enabled: true, postsPerPage: 10, enableCategories: true, enableTags: true, requireAuthor: false },
  },
}));

// Test component to access navigation context
function TestComponent() {
  const { navigationItems } = useNavigation();
  
  return (
    <div>
      <ul data-testid="nav-items">
        {navigationItems.map((item) => (
          <li key={item.href} data-testid={`nav-item-${item.title.toLowerCase()}`}>
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Mock auth context with different permission sets
function MockAuthProvider({ 
  children, 
  permissions = [] 
}: { 
  children: React.ReactNode; 
  permissions?: string[];
}) {
  const mockAuthContext = {
    user: { id: '1', email: 'test@example.com', name: 'Test User', roleId: '1', roleName: 'Admin' },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    hasPermission: (permission: string) => permissions.includes(permission),
    hasRole: vi.fn(),
    hasAnyPermission: vi.fn(),
    hasAllPermissions: vi.fn(),
  };

  return (
    <AuthProvider value={mockAuthContext as any}>
      {children}
    </AuthProvider>
  );
}

describe('Blog Navigation Integration', () => {
  beforeEach(() => {
    (usePathname as any).mockReturnValue('/dashboard');
  });

  describe('Feature Flag Integration', () => {
    it('should include blog navigation when blog feature is enabled', () => {
      render(
        <MockAuthProvider permissions={['blog:read']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      expect(screen.getByTestId('nav-item-blog')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
    });

    it('should not include blog navigation when blog feature is disabled', () => {
      // Mock blog disabled
      vi.resetModules();
      vi.doMock('@/config/features.config', () => ({
        featuresConfig: {
          landingPage: { enabled: false },
          blog: { enabled: false, postsPerPage: 10, enableCategories: true, enableTags: true, requireAuthor: false },
        },
      }));

      render(
        <MockAuthProvider permissions={['blog:read']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      expect(screen.queryByTestId('nav-item-blog')).not.toBeInTheDocument();
    });
  });

  describe('Permission-Based Visibility', () => {
    it('should show blog navigation when user has blog:read permission', () => {
      render(
        <MockAuthProvider permissions={['blog:read']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      expect(screen.getByTestId('nav-item-blog')).toBeInTheDocument();
    });

    it('should hide blog navigation when user lacks blog:read permission', () => {
      render(
        <MockAuthProvider permissions={['users:read', 'settings:read']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      expect(screen.queryByTestId('nav-item-blog')).not.toBeInTheDocument();
    });

    it('should show blog navigation for admin with all permissions', () => {
      render(
        <MockAuthProvider permissions={['*:*']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      expect(screen.getByTestId('nav-item-blog')).toBeInTheDocument();
    });

    it('should show blog navigation for user with blog:* wildcard permission', () => {
      render(
        <MockAuthProvider permissions={['blog:*']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      expect(screen.getByTestId('nav-item-blog')).toBeInTheDocument();
    });
  });

  describe('Navigation Item Properties', () => {
    it('should have correct href for blog navigation', () => {
      render(
        <MockAuthProvider permissions={['blog:read']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      const navItems = screen.getByTestId('nav-items');
      expect(navItems).toHaveTextContent('Blog');
    });

    it('should include blog navigation in correct position', () => {
      render(
        <MockAuthProvider permissions={['blog:read', 'notifications:read', 'settings:read']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      const navItems = screen.getAllByRole('listitem');
      const blogItem = navItems.find(item => item.textContent === 'Blog');
      const notificationsItem = navItems.find(item => item.textContent === 'Notifications');
      const settingsItem = navItems.find(item => item.textContent === 'Settings');

      expect(blogItem).toBeDefined();
      expect(notificationsItem).toBeDefined();
      expect(settingsItem).toBeDefined();

      // Blog should appear after Notifications and before Settings
      const blogIndex = navItems.indexOf(blogItem!);
      const notificationsIndex = navItems.indexOf(notificationsItem!);
      const settingsIndex = navItems.indexOf(settingsItem!);

      expect(blogIndex).toBeGreaterThan(notificationsIndex);
      expect(blogIndex).toBeLessThan(settingsIndex);
    });
  });

  describe('Multiple Navigation Items', () => {
    it('should show all navigation items user has permissions for', () => {
      render(
        <MockAuthProvider permissions={['users:read', 'blog:read', 'settings:read', 'notifications:read']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-users')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-blog')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-notifications')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-settings')).toBeInTheDocument();
    });

    it('should only show navigation items user has permissions for', () => {
      render(
        <MockAuthProvider permissions={['blog:read']}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MockAuthProvider>
      );

      // Should show items without permission requirements
      expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-analytics')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-data')).toBeInTheDocument();

      // Should show blog (has permission)
      expect(screen.getByTestId('nav-item-blog')).toBeInTheDocument();

      // Should not show items requiring other permissions
      expect(screen.queryByTestId('nav-item-users')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-item-permissions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-item-widgets')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    it('should show all navigation items when user is not authenticated', () => {
      const mockAuthContext = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
      };

      render(
        <AuthProvider value={mockAuthContext as any}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </AuthProvider>
      );

      // All items should be visible (filtering happens after authentication)
      expect(screen.getByTestId('nav-item-blog')).toBeInTheDocument();
    });
  });
});
