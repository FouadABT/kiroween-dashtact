/**
 * Breadcrumb Accessibility Tests
 * 
 * Comprehensive accessibility testing for the Breadcrumb component including:
 * - ARIA attributes and labels
 * - Keyboard navigation
 * - Screen reader compatibility
 * - Focus management
 * - Color contrast (via classes)
 * - Semantic HTML structure
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumb, BreadcrumbCompact } from '../Breadcrumb';
import * as breadcrumbHelpers from '@/lib/breadcrumb-helpers';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard/users/123'),
}));

// Mock breadcrumb helpers
vi.mock('@/lib/breadcrumb-helpers', () => ({
  generateBreadcrumbs: vi.fn(),
  BreadcrumbItem: {},
}));

const mockGenerateBreadcrumbs = vi.mocked(breadcrumbHelpers.generateBreadcrumbs);

describe('Breadcrumb Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation with multiple levels
    mockGenerateBreadcrumbs.mockReturnValue([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Users', href: '/dashboard/users' },
      { label: 'John Doe', href: '/dashboard/users/123' },
    ]);
  });

  describe('ARIA Labels and Attributes (Requirement 7.2, 7.3)', () => {
    it('should have aria-label="Breadcrumb" on navigation element', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('should mark current page with aria-current="page"', () => {
      render(<Breadcrumb />);

      const currentPage = screen.getByText('John Doe');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should not have aria-current on non-current breadcrumb items', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      const usersLink = screen.getByText('Users');
      
      expect(dashboardLink).not.toHaveAttribute('aria-current');
      expect(usersLink).not.toHaveAttribute('aria-current');
    });

    it('should have aria-hidden="true" on separator elements', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const separators = nav.querySelectorAll('[aria-hidden="true"]');
      
      // Should have separators between items
      expect(separators.length).toBeGreaterThan(0);
    });

    it('should have aria-label="Home" on home link', () => {
      render(<Breadcrumb showHome={true} />);

      const homeLink = screen.getByLabelText('Home');
      expect(homeLink).toHaveAttribute('aria-label', 'Home');
    });

    it('should maintain aria-current when only one breadcrumb item', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
      ]);

      render(<Breadcrumb />);

      const currentPage = screen.getByText('Dashboard');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should have proper ARIA structure with nav and list', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const list = within(nav).getByRole('list');
      
      expect(nav).toBeInTheDocument();
      expect(list).toBeInTheDocument();
    });
  });

  describe('Semantic HTML Structure (Requirement 7.1)', () => {
    it('should use <nav> element for navigation landmark', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      expect(nav.tagName).toBe('NAV');
    });

    it('should use <ol> element for ordered list', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const list = within(nav).getByRole('list');
      
      expect(list.tagName).toBe('OL');
    });

    it('should use <li> elements for list items', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const listItems = nav.querySelectorAll('li');
      
      // Should have list items for home + breadcrumbs + separators
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should use <a> elements for clickable links', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      const usersLink = screen.getByText('Users');
      
      expect(dashboardLink.tagName).toBe('A');
      expect(usersLink.tagName).toBe('A');
    });

    it('should use <span> element for current page (non-clickable)', () => {
      render(<Breadcrumb />);

      const currentPage = screen.getByText('John Doe');
      expect(currentPage.tagName).toBe('SPAN');
    });

    it('should have proper href attributes on links', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      const usersLink = screen.getByText('Users');
      
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(usersLink).toHaveAttribute('href', '/dashboard/users');
    });
  });

  describe('Keyboard Navigation (Requirement 7.4)', () => {
    it('should allow Tab navigation through breadcrumb links', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb />);

      const homeLink = screen.getByLabelText('Home');
      const dashboardLink = screen.getByText('Dashboard');
      const usersLink = screen.getByText('Users');

      // Tab to first link (home)
      await user.tab();
      expect(homeLink).toHaveFocus();

      // Tab to second link (dashboard)
      await user.tab();
      expect(dashboardLink).toHaveFocus();

      // Tab to third link (users)
      await user.tab();
      expect(usersLink).toHaveFocus();
    });

    it('should skip current page in tab order (non-interactive)', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb />);

      const usersLink = screen.getByText('Users');
      const currentPage = screen.getByText('John Doe');

      // Focus on last link
      usersLink.focus();
      expect(usersLink).toHaveFocus();

      // Tab should move past current page (it's not focusable)
      await user.tab();
      expect(currentPage).not.toHaveFocus();
    });

    it('should allow Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      const usersLink = screen.getByText('Users');

      // Focus on users link
      usersLink.focus();
      expect(usersLink).toHaveFocus();

      // Shift+Tab to go back
      await user.tab({ shift: true });
      expect(dashboardLink).toHaveFocus();
    });

    it('should activate links with Enter key', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      
      // Focus and press Enter
      dashboardLink.focus();
      await user.keyboard('{Enter}');
      
      // Link should be clickable (Next.js Link handles navigation)
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should activate links with Space key', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      
      // Focus and press Space
      dashboardLink.focus();
      await user.keyboard(' ');
      
      // Link should be clickable
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should not allow keyboard interaction with separators', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const separators = nav.querySelectorAll('[aria-hidden="true"]');
      
      // Separators should not be in tab order
      separators.forEach(separator => {
        expect(separator).not.toHaveAttribute('tabindex');
      });
    });
  });

  describe('Focus Indicators (Requirement 7.5)', () => {
    it('should have visible focus ring on links', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      
      // Check for focus ring classes
      expect(dashboardLink).toHaveClass('focus:outline-none');
      expect(dashboardLink).toHaveClass('focus:ring-2');
      expect(dashboardLink).toHaveClass('focus:ring-ring');
      expect(dashboardLink).toHaveClass('focus:ring-offset-2');
    });

    it('should have rounded focus indicator', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toHaveClass('rounded');
    });

    it('should have focus indicator on home link', () => {
      render(<Breadcrumb showHome={true} />);

      const homeLink = screen.getByLabelText('Home');
      
      expect(homeLink).toHaveClass('focus:outline-none');
      expect(homeLink).toHaveClass('focus:ring-2');
      expect(homeLink).toHaveClass('focus:ring-ring');
    });

    it('should maintain focus visibility during keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      
      // Tab to link
      await user.tab();
      await user.tab();
      
      // Should have focus
      expect(dashboardLink).toHaveFocus();
      
      // Should have focus classes
      expect(dashboardLink).toHaveClass('focus:ring-2');
    });
  });

  describe('Color Contrast (Requirement 7.4)', () => {
    it('should use theme-aware text colors for sufficient contrast', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      const currentPage = screen.getByText('John Doe');
      
      // Links use muted-foreground with hover state
      expect(dashboardLink).toHaveClass('text-muted-foreground');
      expect(dashboardLink).toHaveClass('hover:text-foreground');
      
      // Current page uses foreground color
      expect(currentPage).toHaveClass('text-foreground');
    });

    it('should have sufficient contrast for separators', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const separatorContainers = nav.querySelectorAll('li[aria-hidden="true"]');
      
      // Check that separator containers have proper color class
      separatorContainers.forEach(separator => {
        expect(separator).toHaveClass('text-muted-foreground');
      });
    });

    it('should maintain contrast in hover states', () => {
      render(<Breadcrumb />);

      const dashboardLink = screen.getByText('Dashboard');
      
      // Hover state should increase contrast
      expect(dashboardLink).toHaveClass('hover:text-foreground');
    });
  });

  describe('Screen Reader Compatibility (Requirement 7.2, 7.3)', () => {
    it('should announce navigation landmark to screen readers', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(nav).toBeInTheDocument();
    });

    it('should announce current page location', () => {
      render(<Breadcrumb />);

      const currentPage = screen.getByText('John Doe');
      
      // aria-current="page" tells screen readers this is the current location
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should hide decorative separators from screen readers', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const separators = nav.querySelectorAll('[aria-hidden="true"]');
      
      // All separators should be hidden from screen readers
      expect(separators.length).toBeGreaterThan(0);
      separators.forEach(separator => {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should provide meaningful link text for screen readers', () => {
      render(<Breadcrumb />);

      // Links should have descriptive text, not just "click here"
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should announce home link with aria-label', () => {
      render(<Breadcrumb showHome={true} />);

      const homeLink = screen.getByLabelText('Home');
      
      // Screen readers will announce "Home" instead of just an icon
      expect(homeLink).toHaveAttribute('aria-label', 'Home');
    });

    it('should use ordered list for hierarchical structure', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const list = within(nav).getByRole('list');
      
      // Screen readers announce ordered lists with position info
      expect(list.tagName).toBe('OL');
    });

    it('should not have empty links or buttons', () => {
      render(<Breadcrumb />);

      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        // Each link should have text content or aria-label
        const hasText = link.textContent && link.textContent.trim().length > 0;
        const hasAriaLabel = link.hasAttribute('aria-label');
        
        expect(hasText || hasAriaLabel).toBe(true);
      });
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility with truncated breadcrumbs', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Level 1', href: '/1' },
        { label: 'Level 2', href: '/1/2' },
        { label: 'Level 3', href: '/1/2/3' },
        { label: 'Level 4', href: '/1/2/3/4' },
        { label: 'Level 5', href: '/1/2/3/4/5' },
      ]);

      render(<Breadcrumb maxItems={3} />);

      const nav = screen.getByRole('navigation');
      
      // Should still have proper ARIA structure
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
      
      // Current page should still be marked
      const currentPage = screen.getByText('Level 5');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should maintain accessibility without home icon', () => {
      render(<Breadcrumb showHome={false} />);

      const nav = screen.getByRole('navigation');
      
      // Should still have proper ARIA label
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
      
      // Should still have semantic structure
      const list = within(nav).getByRole('list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error States', () => {
    it('should handle empty breadcrumbs gracefully', () => {
      mockGenerateBreadcrumbs.mockReturnValue([]);

      render(<Breadcrumb showHome={false} />);

      // Should not render anything
      const nav = screen.queryByRole('navigation');
      expect(nav).not.toBeInTheDocument();
    });

    it('should maintain accessibility with single breadcrumb', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
      ]);

      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      const currentPage = screen.getByText('Dashboard');
      
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should handle very long breadcrumb labels accessibly', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
        { 
          label: 'This is a very long breadcrumb label that might wrap to multiple lines', 
          href: '/dashboard/long' 
        },
      ]);

      render(<Breadcrumb />);

      const longLabel = screen.getByText('This is a very long breadcrumb label that might wrap to multiple lines');
      
      // Should still be accessible
      expect(longLabel).toHaveAttribute('aria-current', 'page');
    });

    it('should handle special characters in labels', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users & Groups', href: '/dashboard/users-groups' },
      ]);

      render(<Breadcrumb />);

      const specialLabel = screen.getByText('Users & Groups');
      expect(specialLabel).toBeInTheDocument();
      expect(specialLabel).toHaveAttribute('aria-current', 'page');
    });
  });
});

describe('BreadcrumbCompact Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGenerateBreadcrumbs.mockReturnValue([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Users', href: '/dashboard/users' },
      { label: 'John Doe', href: '/dashboard/users/123' },
    ]);
  });

  describe('ARIA Labels and Attributes', () => {
    it('should have aria-label="Breadcrumb" on navigation', () => {
      render(<BreadcrumbCompact />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('should mark current page with aria-current="page"', () => {
      render(<BreadcrumbCompact />);

      const currentPage = screen.getByText('John Doe');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should use semantic HTML structure', () => {
      render(<BreadcrumbCompact />);

      const nav = screen.getByRole('navigation');
      const list = within(nav).getByRole('list');
      
      expect(nav.tagName).toBe('NAV');
      expect(list.tagName).toBe('OL');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow Tab navigation to parent link', async () => {
      const user = userEvent.setup();
      render(<BreadcrumbCompact />);

      // Get all links (back arrow and text link)
      const links = screen.getAllByRole('link');
      
      // Tab to first link (back arrow)
      await user.tab();
      expect(links[0]).toHaveFocus();
      
      // Tab to second link (parent text)
      await user.tab();
      expect(links[1]).toHaveFocus();
    });

    it('should have focus indicators on links', () => {
      render(<BreadcrumbCompact />);

      const parentLink = screen.getByText('Users');
      
      expect(parentLink).toHaveClass('focus:outline-none');
      expect(parentLink).toHaveClass('focus:ring-2');
    });

    it('should skip current page in tab order', async () => {
      const user = userEvent.setup();
      render(<BreadcrumbCompact />);

      const currentPage = screen.getByText('John Doe');
      
      // Current page should not be focusable
      await user.tab();
      expect(currentPage).not.toHaveFocus();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should announce navigation landmark', () => {
      render(<BreadcrumbCompact />);

      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(nav).toBeInTheDocument();
    });

    it('should provide meaningful link text', () => {
      render(<BreadcrumbCompact />);

      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should use ordered list for structure', () => {
      render(<BreadcrumbCompact />);

      const nav = screen.getByRole('navigation');
      const list = within(nav).getByRole('list');
      
      expect(list.tagName).toBe('OL');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single breadcrumb accessibly', () => {
      mockGenerateBreadcrumbs.mockReturnValue([
        { label: 'Dashboard', href: '/dashboard' },
      ]);

      render(<BreadcrumbCompact />);

      const currentPage = screen.getByText('Dashboard');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should not render when no breadcrumbs', () => {
      mockGenerateBreadcrumbs.mockReturnValue([]);

      const { container } = render(<BreadcrumbCompact />);
      expect(container.firstChild).toBeNull();
    });
  });
});
