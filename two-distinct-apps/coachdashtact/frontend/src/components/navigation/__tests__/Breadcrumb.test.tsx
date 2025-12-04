/**
 * Breadcrumb Component Tests
 * 
 * Tests for the Breadcrumb component including:
 * - Component rendering
 * - Accessibility attributes
 * - Navigation functionality
 * - Dynamic label resolution
 * - Custom props handling
 * - Responsive behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Breadcrumb, BreadcrumbCompact } from '../Breadcrumb';
import * as breadcrumbHelpers from '@/lib/breadcrumb-helpers';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard/users'),
}));

// Mock breadcrumb helpers
vi.mock('@/lib/breadcrumb-helpers', () => ({
  generateBreadcrumbs: vi.fn(),
  BreadcrumbItem: {},
}));

const mockGenerateBreadcrumbs = vi.mocked(breadcrumbHelpers.generateBreadcrumbs);

describe('Breadcrumb Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockGenerateBreadcrumbs.mockReturnValue([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Users', href: '/dashboard/users' },
    ]);
  });

  describe('Component Rendering', () => {
    it('should render breadcrumb navigation', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should render breadcrumb items', () => {
      render(<Breadcrumb />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should render home icon when showHome is true', () => {
      render(<Breadcrumb showHome={true} />);

      const homeLink = screen.getByLabelText('Home');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should not render home icon when showHome is false', () => {
      render(<Breadcrumb showHome={false} />);

      const homeLink = screen.queryByLabelText('Home');
      expect(homeLink).not.toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Breadcrumb className="custom-class" />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-class');
    });

    it('should render custom breadcrumb items', () => {
      const customItems = [
        { label: 'Custom 1', href: '/custom1' },
        { label: 'Custom 2', href: '/custom2' },
      ];

      render(<Breadcrumb customItems={customItems} />);

      expect(screen.getByText('Custom 1')).toBeInTheDocument();
      expect(screen.getByText('Custom 2')).toBeInTheDocument();
      expect(mockGenerateBreadcrumbs).not.toHaveBeenCalled();
    });

    it('should not render when no breadcrumbs and showHome is false', () => {
      mockGenerateBreadcrumbs.mockReturnValue([]);

      const { container } = render(<Breadcrumb showHome={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have aria-label on navigation', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('should mark current page with aria-current', () => {
      render(<Breadcrumb />);

      const currentPage = screen.getByText('Users');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should not have aria-current on non-current items', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).not.toHaveAttribute('aria-current');
    });

    it('should have aria-hidden on separators', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      // Check that separators have aria-hidden attribute
      const separatorElements = nav.querySelectorAll('[aria-hidden="true"]');
      
      expect(separatorElements.length).toBeGreaterThan(0);
    });

    it('should use semantic HTML with nav and ol elements', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const list = within(nav).getByRole('list');

      expect(nav.tagName).toBe('NAV');
      expect(list.tagName).toBe('OL');
    });

    it('should have proper focus indicators on links', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toHaveClass('focus:outline-none');
      expect(dashboardLink).toHaveClass('focus:ring-2');
    });

    it('should have aria-label on home link', () => {
      render(<Breadcrumb showHome={true} />);

      const homeLink = screen.getByLabelText('Home');
      expect(homeLink).toHaveAttribute('aria-label', 'Home');
    });
  });

  describe('Navigation Functionality', () => {
    it('should render links with correct href attributes', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should render current page as span, not link', () => {
      render(<Breadcrumb />);

      const currentPage = screen.getByText('Users');
      expect(currentPage.tagName).toBe('SPAN');
      expect(currentPage).not.toHaveAttribute('href');
    });

    it('should render all non-current items as links', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/dashboard/settings' },
        { label: 'Theme', href: '/dashboard/settings/theme' },
      ]);

      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      const settingsLink = screen.getByText('Settings');
      const currentPage = screen.getByText('Theme');

      expect(dashboardLink.tagName).toBe('A');
      expect(settingsLink.tagName).toBe('A');
      expect(currentPage.tagName).toBe('SPAN');
    });
  });

  describe('Dynamic Label Resolution', () => {
    it('should pass dynamic values to generateBreadcrumbs', () => {
      const dynamicValues = { userName: 'John Doe', userId: '123' };

      render(<Breadcrumb dynamicValues={dynamicValues} />);

      expect(mockGenerateBreadcrumbs).toHaveBeenCalledWith(
        '/dashboard/users',
        dynamicValues
      );
    });

    it('should update breadcrumbs when dynamic values change', () => {
      const { rerender } = render(
        <Breadcrumb dynamicValues={{ userName: 'John' }} />
      );

      expect(mockGenerateBreadcrumbs).toHaveBeenCalledWith(
        '/dashboard/users',
        { userName: 'John' }
      );

      rerender(<Breadcrumb dynamicValues={{ userName: 'Jane' }} />);

      expect(mockGenerateBreadcrumbs).toHaveBeenCalledWith(
        '/dashboard/users',
        { userName: 'Jane' }
      );
    });

    it('should render resolved dynamic labels', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users', href: '/dashboard/users' },
        { label: 'John Doe', href: '/dashboard/users/123' },
      ]);

      render(<Breadcrumb dynamicValues={{ userName: 'John Doe' }} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Custom Separator', () => {
    it('should render default ChevronRight separator', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      // ChevronRight icons should be present
      expect(nav.innerHTML).toContain('svg');
    });

    it('should render custom separator', () => {
      render(<Breadcrumb separator={<span>→</span>} />);

      // Multiple separators will be present, so use getAllByText
      const separators = screen.getAllByText('→');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('should render custom text separator', () => {
      render(<Breadcrumb separator=" / " />);

      const nav = screen.getByRole('navigation');
      expect(nav.textContent).toContain('/');
    });
  });

  describe('Truncation with maxItems', () => {
    beforeEach(() => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Level 1', href: '/level1' },
        { label: 'Level 2', href: '/level1/level2' },
        { label: 'Level 3', href: '/level1/level2/level3' },
        { label: 'Level 4', href: '/level1/level2/level3/level4' },
        { label: 'Level 5', href: '/level1/level2/level3/level4/level5' },
      ]);
    });

    it('should not truncate when items less than maxItems', () => {
      render(<Breadcrumb maxItems={10} />);

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('Level 4')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });

    it('should truncate when items exceed maxItems', () => {
      render(<Breadcrumb maxItems={3} />);

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
      expect(screen.queryByText('Level 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Level 3')).not.toBeInTheDocument();
    });

    it('should render truncated ellipsis as non-clickable', () => {
      render(<Breadcrumb maxItems={3} />);

      const ellipsis = screen.getByText('...');
      expect(ellipsis.tagName).toBe('SPAN');
      expect(ellipsis).not.toHaveAttribute('href');
    });
  });

  describe('Memoization', () => {
    it('should memoize breadcrumb generation', () => {
      const { rerender } = render(<Breadcrumb />);

      expect(mockGenerateBreadcrumbs).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender(<Breadcrumb />);

      // Should still be called only once due to memoization
      expect(mockGenerateBreadcrumbs).toHaveBeenCalledTimes(1);
    });

    it('should regenerate breadcrumbs when pathname changes', () => {
      const { rerender } = render(<Breadcrumb />);
      const initialCallCount = mockGenerateBreadcrumbs.mock.calls.length;

      // Change dynamic values to trigger regeneration
      rerender(<Breadcrumb dynamicValues={{ test: 'value' }} />);

      expect(mockGenerateBreadcrumbs.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('Theme-Aware Styling', () => {
    it('should have theme-aware text colors', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toHaveClass('text-muted-foreground');
      expect(dashboardLink).toHaveClass('hover:text-foreground');
    });

    it('should have theme-aware current page styling', () => {
      render(<Breadcrumb />);

      const currentPage = screen.getByText('Users');
      expect(currentPage).toHaveClass('text-foreground');
      expect(currentPage).toHaveClass('font-medium');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty breadcrumbs array', () => {
      mockGenerateBreadcrumbs.mockReturnValue([]);

      render(<Breadcrumb showHome={true} />);

      // Should still render home icon
      expect(screen.getByLabelText('Home')).toBeInTheDocument();
    });

    it('should handle single breadcrumb item', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
      ]);

      render(<Breadcrumb />);

      const currentPage = screen.getByText('Dashboard');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should handle very long breadcrumb labels', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
        { 
          label: 'This is a very long breadcrumb label that might wrap', 
          href: '/dashboard/long' 
        },
      ]);

      render(<Breadcrumb />);

      expect(screen.getByText('This is a very long breadcrumb label that might wrap')).toBeInTheDocument();
    });

    it('should handle special characters in labels', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users & Groups', href: '/dashboard/users-groups' },
      ]);

      render(<Breadcrumb />);

      expect(screen.getByText('Users & Groups')).toBeInTheDocument();
    });
  });
});

describe('BreadcrumbCompact Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGenerateBreadcrumbs.mockReturnValue([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Users', href: '/dashboard/users' },
      { label: 'John Doe', href: '/dashboard/users/123' },
    ]);
  });

  describe('Component Rendering', () => {
    it('should render compact breadcrumb navigation', () => {
      render(<BreadcrumbCompact />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should render only parent and current items', () => {
      render(<BreadcrumbCompact />);

      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should render back arrow for parent navigation', () => {
      render(<BreadcrumbCompact />);

      const nav = screen.getByRole('navigation');
      // Should have rotated ChevronRight (back arrow)
      expect(nav.innerHTML).toContain('rotate-180');
    });

    it('should not render when no breadcrumbs', () => {
      mockGenerateBreadcrumbs.mockReturnValue([]);

      const { container } = render(<BreadcrumbCompact />);

      expect(container.firstChild).toBeNull();
    });

    it('should render only current item when single breadcrumb', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
      ]);

      render(<BreadcrumbCompact />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on navigation', () => {
      render(<BreadcrumbCompact />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('should mark current page with aria-current', () => {
      render(<BreadcrumbCompact />);

      const currentPage = screen.getByText('John Doe');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should use semantic HTML', () => {
      render(<BreadcrumbCompact />);

      const nav = screen.getByRole('navigation');
      const list = within(nav).getByRole('list');

      expect(nav.tagName).toBe('NAV');
      expect(list.tagName).toBe('OL');
    });
  });

  describe('Navigation', () => {
    it('should link to parent item', () => {
      render(<BreadcrumbCompact />);

      const parentLink = screen.getByText('Users');
      expect(parentLink).toHaveAttribute('href', '/dashboard/users');
    });

    it('should render current item as span', () => {
      render(<BreadcrumbCompact />);

      const currentPage = screen.getByText('John Doe');
      expect(currentPage.tagName).toBe('SPAN');
    });
  });

  describe('Dynamic Values', () => {
    it('should pass dynamic values to generateBreadcrumbs', () => {
      const dynamicValues = { userName: 'Jane Smith' };

      render(<BreadcrumbCompact dynamicValues={dynamicValues} />);

      expect(mockGenerateBreadcrumbs).toHaveBeenCalledWith(
        '/dashboard/users',
        dynamicValues
      );
    });

    it('should render custom items', () => {
      const customItems = [
        { label: 'Custom Parent', href: '/custom' },
        { label: 'Custom Current', href: '/custom/current' },
      ];

      render(<BreadcrumbCompact customItems={customItems} />);

      expect(screen.getByText('Custom Parent')).toBeInTheDocument();
      expect(screen.getByText('Custom Current')).toBeInTheDocument();
    });
  });
});
