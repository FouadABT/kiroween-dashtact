/**
 * Notification API Client Tests
 * 
 * Tests for the NotificationApi class methods to ensure
 * proper API integration and type safety.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationApi } from '../api';
import { 
  NotificationCategory, 
  NotificationPriority,
  NotificationChannel,
  CreateNotificationData,
  NotificationQueryParams,
} from '@/types/notification';

// Mock fetch globally
global.fetch = vi.fn();

describe('NotificationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockReset();
  });

  describe('getAll', () => {
    it('should fetch all notifications without params', async () => {
      const mockResponse = {
        notifications: [],
        total: 0,
        unreadCount: 0,
        page: 1,
        limit: 10,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await NotificationApi.getAll();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch notifications with query params', async () => {
      const params: NotificationQueryParams = {
        category: NotificationCategory.SYSTEM,
        isRead: false,
        page: 2,
        limit: 20,
      };

      const mockResponse = {
        notifications: [],
        total: 0,
        unreadCount: 0,
        page: 2,
        limit: 20,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await NotificationApi.getAll(params);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch a single notification by ID', async () => {
      const notificationId = 'notif_123';
      const mockNotification = {
        id: notificationId,
        userId: 'user_123',
        title: 'Test Notification',
        message: 'Test message',
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.NORMAL,
        channel: NotificationChannel.IN_APP,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotification,
      });

      const result = await NotificationApi.getById(notificationId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/notifications/${notificationId}`),
        expect.any(Object)
      );
      expect(result).toEqual(mockNotification);
    });

    it('should handle 404 error for non-existent notification', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Notification not found' }),
      });

      await expect(NotificationApi.getById('invalid_id')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const createData: CreateNotificationData = {
        userId: 'user_123',
        title: 'New Notification',
        message: 'This is a test notification',
        category: NotificationCategory.USER_ACTION,
        priority: NotificationPriority.HIGH,
      };

      const mockCreatedNotification = {
        id: 'notif_new',
        ...createData,
        channel: NotificationChannel.IN_APP,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedNotification,
      });

      const result = await NotificationApi.create(createData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData),
        })
      );
      expect(result).toEqual(mockCreatedNotification);
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        userId: 'user_123',
        title: '', // Invalid: empty title
        message: 'Test',
        category: NotificationCategory.SYSTEM,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Validation failed' }),
      });

      await expect(NotificationApi.create(invalidData as CreateNotificationData)).rejects.toThrow();
    });
  });

  describe('createDemo', () => {
    it('should create a demo notification', async () => {
      const mockDemoNotification = {
        id: 'notif_demo',
        userId: 'user_123',
        title: 'Demo Notification',
        message: 'This is a test notification created at 10:30:45 AM',
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.NORMAL,
        channel: NotificationChannel.IN_APP,
        isRead: false,
        actionUrl: '/dashboard/notifications',
        actionLabel: 'View All',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDemoNotification,
      });

      const result = await NotificationApi.createDemo();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/demo'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({}),
        })
      );
      expect(result).toEqual(mockDemoNotification);
      expect(result.title).toBe('Demo Notification');
      expect(result.category).toBe(NotificationCategory.SYSTEM);
    });

    it('should handle errors when creating demo notification', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Insufficient permissions' }),
      });

      await expect(NotificationApi.createDemo()).rejects.toThrow();
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notificationId = 'notif_123';
      const mockUpdatedNotification = {
        id: notificationId,
        userId: 'user_123',
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.NORMAL,
        channel: NotificationChannel.IN_APP,
        isRead: true,
        readAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedNotification,
      });

      const result = await NotificationApi.markAsRead(notificationId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/notifications/${notificationId}/read`),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockResponse = { count: 5 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await NotificationApi.markAllAsRead();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/read-all'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
      expect(result.count).toBe(5);
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      const notificationId = 'notif_123';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      });

      await NotificationApi.delete(notificationId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/notifications/${notificationId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle 404 error when deleting non-existent notification', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Notification not found' }),
      });

      await expect(NotificationApi.delete('invalid_id')).rejects.toThrow();
    });
  });

  describe('clearAll', () => {
    it('should clear all notifications', async () => {
      const mockResponse = { count: 10 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await NotificationApi.clearAll();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/clear-all'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result.count).toBe(10);
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread notification count', async () => {
      const mockResponse = { count: 3 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await NotificationApi.getUnreadCount();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/unread-count'),
        expect.any(Object)
      );
      expect(result.count).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(NotificationApi.getAll()).rejects.toThrow('Network error');
    });

    it('should handle 401 unauthorized errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(NotificationApi.getAll()).rejects.toThrow();
    });

    it('should handle 403 forbidden errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      });

      await expect(NotificationApi.create({} as CreateNotificationData)).rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      await expect(NotificationApi.getAll()).rejects.toThrow();
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct parameter types', () => {
      // TypeScript compilation will catch these errors
      // This test documents expected types
      
      const validParams: NotificationQueryParams = {
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.HIGH,
        isRead: true,
        page: 1,
        limit: 10,
      };

      expect(validParams).toBeDefined();
    });

    it('should enforce correct create data types', () => {
      const validCreateData: CreateNotificationData = {
        userId: 'user_123',
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.NORMAL,
      };

      expect(validCreateData).toBeDefined();
    });
  });
});

