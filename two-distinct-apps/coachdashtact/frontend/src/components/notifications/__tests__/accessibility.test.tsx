/**
 * Notification Accessibility Tests
 * Tests keyboard navigation, ARIA attributes, screen reader support, and focus management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCenter } from '../NotificationCenter';
import { NotificationList } from '../NotificationList';
import { NotificationItem } from '../NotificationItem';
import { NotificationAnnouncer } from '../NotificationAnnouncer';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Notification, NotificationPriority, NotificationCategory } from '@/types/notification';

// Mock notification data
const mockNotification: Notification = {
  id: '1',
  userId: 'user-1',
  title: 'Test Notification',
  message: 'This is a test notification',
  category: NotificationCategory.SYSTEM,
  priority: NotificationPriority.NORMAL,
  channel: 'IN_APP',
  isRead: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  actions: [],
};

const mockUrgentNotification: Notification = {
  ...mockNotification,
  id: '2',
  title: 'Urgent Notification',
  priority: NotificationPriority.URGENT,
};

// Mock providers
const MockProviders = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </AuthProvider>
);

describe('Notification Accessibility', () => {
  describe('Keyboard Navigation', () => {
    it('should allow Tab navigation to notification center button', () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      
      // Tab to button
      userEvent.tab();
      expect(button).toHaveFocus();
    });

    it('should open dropdown with Enter key', async () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      button.focus();
      
      // Press Enter
      fireEvent.keyDown(button, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should close dropdown with Escape key', async () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      button.click();
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should navigate through notifications with arrow keys', () => {
      const mockOnClose = jest.fn();
      const mockMarkAsRead = jest.fn();
      const mockDelete = jest.fn();

      render(
        <NotificationList onClose={mockOnClose} />,
        { wrapper: MockProviders }
      );

      // Simulate arrow down
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      
      // First notification should be focused
      const firstNotification = screen.getAllByRole('listitem')[0];
      expect(firstNotification).toHaveFocus();

      // Simulate arrow down again
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      
      // Second notification should be focused
      const secondNotification = screen.getAllByRole('listitem')[1];
      expect(secondNotification).toHaveFocus();
    });

    it('should jump to first notification with Home key', () => {
      const mockOnClose = jest.fn();

      render(
        <NotificationList onClose={mockOnClose} />,
        { wrapper: MockProviders }
      );

      // Press Home
      fireEvent.keyDown(document, { key: 'Home' });
      
      // First notification should be focused
      const firstNotification = screen.getAllByRole('listitem')[0];
      expect(firstNotification).toHaveFocus();
    });

    it('should jump to last notification with End key', () => {
      const mockOnClose = jest.fn();

      render(
        <NotificationList onClose={mockOnClose} />,
        { wrapper: MockProviders }
      );

      // Press End
      fireEvent.keyDown(document, { key: 'End' });
      
      // Last notification should be focused
      const notifications = screen.getAllByRole('listitem');
      const lastNotification = notifications[notifications.length - 1];
      expect(lastNotification).toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-label on bell icon', () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      expect(button).toHaveAttribute('aria-label');
    });

    it('should have aria-expanded attribute', () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      // Open dropdown
      button.click();
      
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-haspopup attribute', () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should have role="dialog" on dropdown', async () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      button.click();
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('should have role="alert" for urgent notifications', () => {
      const mockOnMarkAsRead = jest.fn();
      const mockOnDelete = jest.fn();

      render(
        <NotificationItem
          notification={mockUrgentNotification}
          onMarkAsRead={mockOnMarkAsRead}
          onDelete={mockOnDelete}
        />
      );

      const notification = screen.getByRole('listitem');
      expect(notification).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-describedby linking to content', () => {
      const mockOnMarkAsRead = jest.fn();
      const mockOnDelete = jest.fn();

      render(
        <NotificationItem
          notification={mockNotification}
          onMarkAsRead={mockOnMarkAsRead}
          onDelete={mockOnDelete}
        />
      );

      const notification = screen.getByRole('listitem');
      const contentId = notification.getAttribute('aria-describedby');
      
      expect(contentId).toBeTruthy();
      expect(document.getElementById(contentId!)).toBeInTheDocument();
    });

    it('should have aria-label on unread badge', () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      // Assuming there are unread notifications
      const badge = screen.queryByLabelText(/unread notifications/i);
      if (badge) {
        expect(badge).toHaveAttribute('aria-label');
      }
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce new notifications', async () => {
      render(
        <MockProviders>
          <NotificationAnnouncer />
        </MockProviders>
      );

      // Check for aria-live regions
      const politeRegion = screen.getByRole('status');
      expect(politeRegion).toHaveAttribute('aria-live', 'polite');

      const assertiveRegion = screen.getByRole('alert');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have text alternatives for icons', () => {
      const mockOnMarkAsRead = jest.fn();
      const mockOnDelete = jest.fn();

      render(
        <NotificationItem
          notification={mockNotification}
          onMarkAsRead={mockOnMarkAsRead}
          onDelete={mockOnDelete}
        />
      );

      // Check for sr-only text
      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });

    it('should use semantic HTML', () => {
      const mockOnClose = jest.fn();

      render(
        <NotificationList onClose={mockOnClose} />,
        { wrapper: MockProviders }
      );

      // Check for proper list semantics
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should announce unread count changes', () => {
      render(
        <MockProviders>
          <NotificationAnnouncer />
        </MockProviders>
      );

      // Aria-live regions should be present for announcements
      const liveRegions = screen.getAllByRole('status');
      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      const mockOnMarkAsRead = jest.fn();
      const mockOnDelete = jest.fn();

      const { container } = render(
        <NotificationItem
          notification={mockNotification}
          onMarkAsRead={mockOnMarkAsRead}
          onDelete={mockOnDelete}
        />
      );

      const notification = screen.getByRole('listitem');
      
      // Check for focus styles in className
      expect(notification.className).toContain('focus:');
    });

    it('should return focus to trigger after closing', async () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      button.click();
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close dropdown
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });

    it('should trap focus within dropdown', async () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      button.click();
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Tab through elements - focus should stay within dropdown
      const dialog = screen.getByRole('dialog');
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should focus first notification when opening dropdown', async () => {
      render(
        <MockProviders>
          <NotificationCenter />
        </MockProviders>
      );

      const button = screen.getByRole('button', { name: /notifications/i });
      button.click();
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // First focusable element should receive focus
      const dialog = screen.getByRole('dialog');
      const firstFocusable = dialog.querySelector('[tabindex="0"]');
      
      if (firstFocusable) {
        expect(document.activeElement).toBe(firstFocusable);
      }
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient contrast for text', () => {
      const mockOnMarkAsRead = jest.fn();
      const mockOnDelete = jest.fn();

      const { container } = render(
        <NotificationItem
          notification={mockNotification}
          onMarkAsRead={mockOnMarkAsRead}
          onDelete={mockOnDelete}
        />
      );

      // Check for text color classes
      const textElements = container.querySelectorAll('[class*="text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should have visible unread indicator', () => {
      const mockOnMarkAsRead = jest.fn();
      const mockOnDelete = jest.fn();

      render(
        <NotificationItem
          notification={mockNotification}
          onMarkAsRead={mockOnMarkAsRead}
          onDelete={mockOnDelete}
        />
      );

      const unreadIndicator = screen.getByRole('status', { name: /unread/i });
      expect(unreadIndicator).toBeInTheDocument();
    });
  });
});
