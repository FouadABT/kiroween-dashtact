/**
 * Integration Tests: Breadcrumb Navigation
 * 
 * Tests Requirements: 2.1, 2.2, 2.4
 * 
 * This test suite validates that breadcrumb navigation works correctly
 * across all pages, including:
 * - Breadcrumb display on all pages
 * - Breadcrumb navigation functionality
 * - Dynamic breadcrumb labels
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetadataProvider } from '@/contexts/MetadataContext';
import { generateBreadcrumbs } from '@/lib/breadcrumb-helpers';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/dashboard/users');

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: unknown) => (
    <a href={href} {...props} onClick={(e) => {
      e.preventDefault();
      mockPush(href);
    }}>
      {children}
    </a>
  ),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MetadataProvider>
      {children}
    </MetadataProvider>
  );
}

describe('Breadcrumb Navigation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard/users');
  });

  describe('Requirement 2.1: Breadcrumb Display on All Pages', () => {
    it('should display breadcrumbs on dashboard home page', () => {
      mockPathname.mockReturnValue('/dashboard');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(nav).toBeInTheDocument();
      
      // Should show Dashboard as current page
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should display breadcrumbs on analytics page', () => {
      mockPathname.mockReturnValue('/dashboard/analytics');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should display breadcrumbs on users page', () => {
      mockPathname.mockReturnValue('/dashboard/users');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should display breadcrumbs on settings page', () => {
      mockPathname.mockReturnValue('/dashboard/settings');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should display breadcrumbs on theme settings page', () => {
      mockPathname.mockReturnValue('/dashboard/settings/theme');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('should display breadcrumbs on user detail page', () => {
      mockPathname.mockReturnValue('/dashboard/users/123');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('{userName}')).toBeInTheDocument();
    });

    it('should display breadcrumbs on user edit page', () => {
      mockPathname.mockReturnValue('/dashboard/users/456/edit');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('{userName}')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should display breadcrumbs with home icon', () => {
      mockPathname.mockReturnValue('/dashboard/users');
      
      render(
        <TestWrapper>
          <Breadcrumb showHome={true} />
        </TestWrapper>
      );

      const homeLink = screen.getByLabelText('Home');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should display breadcrumbs in PageHeader component', () => {
      mockPathname.mockReturnValue('/dashboard/users');
      
      render(
        <TestWrapper>
          <PageHeader
            title="User Management"
            description="Manage users and permissions"
          />
        </TestWrapper>
      );

      // Breadcrumbs should be present in PageHeader
      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(nav).toBeInTheDocument();
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should display hierarchical path from home to current page', () => {
      mockPathname.mockReturnValue('/dashboard/settings/theme');
      
      render(
        <TestWrapper>
          <Breadcrumb showHome={false} />
        </TestWrapper>
      );

      const nav = screen.getByRole('navigation');
      const list = within(nav).getByRole('list');
      const items = within(list).getAllByRole('listitem');

      // Should have 3 breadcrumb items: Dashboard, Settings, Theme (without home icon)
      // Note: This includes separator items, so we filter for items with text content
      const breadcrumbItems = items.filter(item => {
        const text = item.textContent;
        return text && text.trim() !== '' && !item.hasAttribute('aria-hidden');
      });
      
      expect(breadcrumbItems.length).toBeGreaterThanOrEqual(3);
      
      // Verify the breadcrumb labels are present
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });
  });

  describe('Requirement 2.2: Breadcrumb Navigation Functionality', () => {
    it('should navigate to parent page when clicking breadcrumb link', async () => {
      const user = userEvent.setup();
      mockPathname.mockReturnValue('/dashboard/users/123');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const usersLink = screen.getByRole('link', { name: 'Users' });
      await user.click(usersLink);

      expect(mockPush).toHaveBeenCalledWith('/dashboard/users');
    });

    it('should navigate to dashboard when clicking dashboard breadcrumb', async () => {
      const user = userEvent.setup();
      mockPathname.mockReturnValue('/dashboard/settings/theme');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      await user.click(dashboardLink);

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to home when clicking home icon', async () => {
      const user = userEvent.setup();
      mockPathname.mockReturnValue('/dashboard/users');
      
      render(
        <TestWrapper>
          <Breadcrumb showHome={true} />
        </TestWrapper>
      );

      const homeLink = screen.getByLabelText('Home');
      await user.click(homeLink);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should navigate to intermediate page in deep hierarchy', async () => {
      const user = userEvent.setup();
      mockPathname.mockReturnValue('/dashboard/settings/theme');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const settingsLink = screen.getByRole('link', { name: 'Settings' });
      await user.click(settingsLink);

      expect(mockPush).toHaveBeenCalledWith('/dashboard/settings');
    });

    it('should not navigate when clicking current page breadcrumb', async () => {
      const user = userEvent.setup();
      mockPathname.mockReturnValue('/dashboard/users');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const currentPage = screen.getByText('Users');
      
      // Current page should not be a link
      expect(currentPage.tagName).toBe('SPAN');
      expect(currentPage).not.toHaveAttribute('href');
      
      // Clicking should not trigger navigation
      await user.click(currentPage);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should highlight current page as non-clickable', () => {
      mockPathname.mockReturnValue('/dashboard/settings/theme');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const currentPage = screen.getByText('Theme');
      
      // Should be a span, not a link
      expect(currentPage.tagName).toBe('SPAN');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
      expect(currentPage).toHaveClass('font-medium');
    });

    it('should render all non-current items as clickable links', () => {
      mockPathname.mockReturnValue('/dashboard/settings/theme');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      const settingsLink = screen.getByRole('link', { name: 'Settings' });
      const currentPage = screen.getByText('Theme');

      expect(dashboardLink.tagName).toBe('A');
      expect(settingsLink.tagName).toBe('A');
      expect(currentPage.tagName).toBe('SPAN');
    });

    it('should maintain correct href attributes for all links', () => {
      mockPathname.mockReturnValue('/dashboard/users/123/edit');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      const usersLink = screen.getByRole('link', { name: 'Users' });
      const userIdLink = screen.getByRole('link', { name: '{userName}' });

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(usersLink).toHaveAttribute('href', '/dashboard/users');
      expect(userIdLink).toHaveAttribute('href', '/dashboard/users/123');
    });
  });

  describe('Requirement 2.4: Dynamic Breadcrumb Labels', () => {
    it('should display dynamic user name in breadcrumb', () => {
      mockPathname.mockReturnValue('/dashboard/users/123');
      
      render(
        <TestWrapper>
          <Breadcrumb dynamicValues={{ userName: 'John Doe', userId: '123' }} />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('123')).not.toBeInTheDocument();
    });

    it('should display dynamic user name in edit page breadcrumb', () => {
      mockPathname.mockReturnValue('/dashboard/users/456/edit');
      
      render(
        <TestWrapper>
          <Breadcrumb dynamicValues={{ userName: 'Jane Smith', userId: '456' }} />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should update breadcrumb labels when dynamic values change', () => {
      mockPathname.mockReturnValue('/dashboard/users/789');
      
      const { rerender } = render(
        <TestWrapper>
          <Breadcrumb dynamicValues={{ userName: 'Alice Johnson', userId: '789' }} />
        </TestWrapper>
      );

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

      // Update dynamic values
      rerender(
        <TestWrapper>
          <Breadcrumb dynamicValues={{ userName: 'Bob Wilson', userId: '789' }} />
        </TestWrapper>
      );

      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should handle special characters in dynamic labels', () => {
      mockPathname.mockReturnValue('/dashboard/users/999');
      
      render(
        <TestWrapper>
          <Breadcrumb dynamicValues={{ userName: "O'Brien & Co.", userId: '999' }} />
        </TestWrapper>
      );

      expect(screen.getByText("O'Brien & Co.")).toBeInTheDocument();
    });

    it('should fall back to placeholder when dynamic label not provided', () => {
      mockPathname.mockReturnValue('/dashboard/users/123');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      // Should show placeholder when userName not provided
      expect(screen.getByText('{userName}')).toBeInTheDocument();
    });

    it('should support multiple dynamic values in breadcrumb path', () => {
      mockPathname.mockReturnValue('/dashboard/users/123/posts/456');
      
      render(
        <TestWrapper>
          <Breadcrumb 
            dynamicValues={{ 
              userName: 'John Doe', 
              userId: '123',
              postTitle: 'My Post',
              postId: '456'
            }} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Posts')).toBeInTheDocument();
      // The last segment will show the ID since we don't have metadata config for posts route
      expect(screen.getByText('456')).toBeInTheDocument();
    });

    it('should preserve static labels when dynamic values provided', () => {
      mockPathname.mockReturnValue('/dashboard/users/123');
      
      render(
        <TestWrapper>
          <Breadcrumb dynamicValues={{ userName: 'John Doe', userId: '123' }} />
        </TestWrapper>
      );

      // Static labels should remain unchanged
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      
      // Only dynamic label should change
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Breadcrumb Helper Function Integration', () => {
    it('should generate correct breadcrumbs for dashboard routes', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard');
      
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0]).toEqual({
        label: 'Dashboard',
        href: '/dashboard',
      });
    });

    it('should generate correct breadcrumbs for nested routes', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard/settings/theme');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0]).toEqual({
        label: 'Dashboard',
        href: '/dashboard',
      });
      expect(breadcrumbs[1]).toEqual({
        label: 'Settings',
        href: '/dashboard/settings',
      });
      expect(breadcrumbs[2]).toEqual({
        label: 'Theme',
        href: '/dashboard/settings/theme',
      });
    });

    it('should generate breadcrumbs with dynamic values', () => {
      const breadcrumbs = generateBreadcrumbs(
        '/dashboard/users/123',
        { userName: 'John Doe', userId: '123' }
      );
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({
        label: 'John Doe',
        href: '/dashboard/users/123',
      });
    });

    it('should handle routes without metadata configuration', () => {
      const breadcrumbs = generateBreadcrumbs('/unknown/route');
      
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].label).toBe('Unknown');
      expect(breadcrumbs[1].label).toBe('Route');
    });
  });

  describe('PageHeader Integration', () => {
    it('should display breadcrumbs in PageHeader', () => {
      mockPathname.mockReturnValue('/dashboard/users');
      
      render(
        <TestWrapper>
          <PageHeader
            title="User Management"
            description="Manage users and permissions"
          />
        </TestWrapper>
      );

      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(nav).toBeInTheDocument();
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should support custom breadcrumb props in PageHeader', () => {
      mockPathname.mockReturnValue('/dashboard/users');
      
      render(
        <TestWrapper>
          <PageHeader
            title="User Management"
            breadcrumbProps={{
              showHome: false,
              separator: ' / ',
            }}
          />
        </TestWrapper>
      );

      const homeLink = screen.queryByLabelText('Home');
      expect(homeLink).not.toBeInTheDocument();
      
      const nav = screen.getByRole('navigation');
      expect(nav.textContent).toContain('/');
    });

    it('should pass dynamic values to breadcrumbs in PageHeader', () => {
      mockPathname.mockReturnValue('/dashboard/users/123');
      
      render(
        <TestWrapper>
          <PageHeader
            title="John Doe"
            breadcrumbProps={{
              dynamicValues: { userName: 'John Doe', userId: '123' },
            }}
          />
        </TestWrapper>
      );

      // Check that breadcrumb contains the dynamic value (there will be multiple "John Doe" - one in breadcrumb, one in title)
      const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(within(breadcrumbNav).getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty pathname', () => {
      mockPathname.mockReturnValue('');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      // Should not crash, may show no breadcrumbs or home only
      const nav = screen.queryByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should handle pathname with trailing slash', () => {
      mockPathname.mockReturnValue('/dashboard/users/');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should handle very deep nesting', () => {
      mockPathname.mockReturnValue('/dashboard/level1/level2/level3/level4');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Should display all levels
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Level1')).toBeInTheDocument();
      expect(screen.getByText('Level2')).toBeInTheDocument();
      expect(screen.getByText('Level3')).toBeInTheDocument();
      expect(screen.getByText('Level4')).toBeInTheDocument();
    });

    it('should handle undefined dynamic values gracefully', () => {
      mockPathname.mockReturnValue('/dashboard/users/123');
      
      render(
        <TestWrapper>
          <Breadcrumb dynamicValues={{ userName: undefined as unknown as string }} />
        </TestWrapper>
      );

      // Should fall back to placeholder when value is undefined
      expect(screen.getByText('{userName}')).toBeInTheDocument();
    });

    it('should handle null pathname', () => {
      mockPathname.mockReturnValue(null as unknown as string);
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      // Should not crash
      const nav = screen.queryByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Accessibility in Navigation Context', () => {
    it('should maintain accessibility when navigating', async () => {
      const user = userEvent.setup();
      mockPathname.mockReturnValue('/dashboard/settings/theme');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const settingsLink = screen.getByRole('link', { name: 'Settings' });
      
      // Should have proper ARIA attributes
      expect(settingsLink).toHaveAttribute('href', '/dashboard/settings');
      
      // Should be keyboard accessible
      settingsLink.focus();
      expect(settingsLink).toHaveFocus();
      
      // Should navigate on click
      await user.click(settingsLink);
      expect(mockPush).toHaveBeenCalledWith('/dashboard/settings');
    });

    it('should support keyboard navigation through breadcrumbs', async () => {
      const user = userEvent.setup();
      mockPathname.mockReturnValue('/dashboard/settings/theme');
      
      render(
        <TestWrapper>
          <Breadcrumb showHome={false} />
        </TestWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      const settingsLink = screen.getByRole('link', { name: 'Settings' });
      
      // Tab through links (without home icon, dashboard is first)
      await user.tab();
      expect(dashboardLink).toHaveFocus();
      
      await user.tab();
      expect(settingsLink).toHaveFocus();
    });

    it('should announce current page to screen readers', () => {
      mockPathname.mockReturnValue('/dashboard/users');
      
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const currentPage = screen.getByText('Users');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });
  });
});
