/**
 * Role Permission Assignment Tests
 * 
 * Tests for role-permission assignment functionality including:
 * - Assigning permissions to roles
 * - Removing permissions from roles
 * - Getting role permissions
 * - Permission check validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PermissionApi } from '@/lib/api';
import { Permission } from '@/types/permission';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock permissions data
const mockPermissions: Permission[] = [
  {
    id: 'perm-1',
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'View users',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'perm-2',
    name: 'users:write',
    resource: 'users',
    action: 'write',
    description: 'Create and edit users',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'perm-3',
    name: 'users:delete',
    resource: 'users',
    action: 'delete',
    description: 'Delete users',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const API_BASE_URL = 'http://localhost:3001';

describe('Role Permission Assignment API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('accessToken', 'mock-token');
  });

  describe('assignToRole', () => {
    it('should assign permission to role successfully', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';
      const expectedResponse = { message: 'Permission assigned successfully' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await PermissionApi.assignToRole(roleId, permissionId);

      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/permissions/assign`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
          body: JSON.stringify({ roleId, permissionId }),
        })
      );
    });

    it('should handle assignment errors', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Permission already assigned to role' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.assignToRole(roleId, permissionId)).rejects.toThrow(
        'Permission already assigned to role'
      );
    });

    it('should handle unauthorized errors', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.assignToRole(roleId, permissionId)).rejects.toThrow();
    });

    it('should handle forbidden errors when user lacks permissions:write', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Insufficient permissions' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.assignToRole(roleId, permissionId)).rejects.toThrow(
        'Insufficient permissions'
      );
    });

    it('should handle invalid role ID', async () => {
      const roleId = 'invalid-role';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Role not found' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.assignToRole(roleId, permissionId)).rejects.toThrow(
        'Role not found'
      );
    });

    it('should handle invalid permission ID', async () => {
      const roleId = 'role-1';
      const permissionId = 'invalid-perm';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Permission not found' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.assignToRole(roleId, permissionId)).rejects.toThrow(
        'Permission not found'
      );
    });
  });

  describe('removeFromRole', () => {
    it('should remove permission from role successfully', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';
      const expectedResponse = { message: 'Permission removed successfully' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await PermissionApi.removeFromRole(roleId, permissionId);

      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/permissions/assign`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
          body: JSON.stringify({ roleId, permissionId }),
        })
      );
    });

    it('should handle removal errors', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Permission not assigned to role' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.removeFromRole(roleId, permissionId)).rejects.toThrow(
        'Permission not assigned to role'
      );
    });

    it('should handle unauthorized errors', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.removeFromRole(roleId, permissionId)).rejects.toThrow();
    });

    it('should handle forbidden errors when user lacks permissions:write', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Insufficient permissions' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.removeFromRole(roleId, permissionId)).rejects.toThrow(
        'Insufficient permissions'
      );
    });

    it('should prevent removal of system role permissions', async () => {
      const roleId = 'system-role-1';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Cannot modify system role permissions' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.removeFromRole(roleId, permissionId)).rejects.toThrow(
        'Cannot modify system role permissions'
      );
    });
  });

  describe('getRolePermissions', () => {
    it('should get all permissions for a role', async () => {
      const roleId = 'role-1';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPermissions,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await PermissionApi.getRolePermissions(roleId);

      expect(result).toEqual(mockPermissions);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/permissions/role/${roleId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('should return empty array for role with no permissions', async () => {
      const roleId = 'role-empty';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await PermissionApi.getRolePermissions(roleId);

      expect(result).toEqual([]);
    });

    it('should handle invalid role ID', async () => {
      const roleId = 'invalid-role';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Role not found' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.getRolePermissions(roleId)).rejects.toThrow('Role not found');
    });

    it('should handle unauthorized access', async () => {
      const roleId = 'role-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.getRolePermissions(roleId)).rejects.toThrow();
    });
  });

  describe('checkUserPermission', () => {
    it('should check if user has permission', async () => {
      const userId = 'user-1';
      const permission = 'users:read';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hasPermission: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await PermissionApi.checkUserPermission(userId, permission);

      expect(result).toEqual({ hasPermission: true });
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/permissions/user/${userId}/check/${permission}`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return false when user lacks permission', async () => {
      const userId = 'user-1';
      const permission = 'users:delete';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hasPermission: false }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await PermissionApi.checkUserPermission(userId, permission);

      expect(result).toEqual({ hasPermission: false });
    });

    it('should handle super admin permission (*:*)', async () => {
      const userId = 'admin-1';
      const permission = 'anything:anything';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hasPermission: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await PermissionApi.checkUserPermission(userId, permission);

      expect(result).toEqual({ hasPermission: true });
    });

    it('should handle wildcard resource permissions', async () => {
      const userId = 'user-1';
      const permission = 'users:*';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hasPermission: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await PermissionApi.checkUserPermission(userId, permission);

      expect(result).toEqual({ hasPermission: true });
    });

    it('should handle invalid user ID', async () => {
      const userId = 'invalid-user';
      const permission = 'users:read';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'User not found' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.checkUserPermission(userId, permission)).rejects.toThrow(
        'User not found'
      );
    });

    it('should handle invalid permission format', async () => {
      const userId = 'user-1';
      const permission = 'invalid-format';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid permission format' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.checkUserPermission(userId, permission)).rejects.toThrow(
        'Invalid permission format'
      );
    });
  });

  describe('Permission Assignment Workflow', () => {
    it('should complete full assignment workflow', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      // Step 1: Get current role permissions
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const initialPermissions = await PermissionApi.getRolePermissions(roleId);
      expect(initialPermissions).toEqual([]);

      // Step 2: Assign new permission
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Permission assigned successfully' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await PermissionApi.assignToRole(roleId, permissionId);

      // Step 3: Verify permission was assigned
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPermissions[0]],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const updatedPermissions = await PermissionApi.getRolePermissions(roleId);
      expect(updatedPermissions).toHaveLength(1);
      expect(updatedPermissions[0].id).toBe(permissionId);
    });

    it('should complete full removal workflow', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      // Step 1: Get current role permissions
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPermissions[0]],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const initialPermissions = await PermissionApi.getRolePermissions(roleId);
      expect(initialPermissions).toHaveLength(1);

      // Step 2: Remove permission
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Permission removed successfully' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await PermissionApi.removeFromRole(roleId, permissionId);

      // Step 3: Verify permission was removed
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const updatedPermissions = await PermissionApi.getRolePermissions(roleId);
      expect(updatedPermissions).toEqual([]);
    });

    it('should handle multiple permission assignments', async () => {
      const roleId = 'role-1';
      const permissionIds = ['perm-1', 'perm-2', 'perm-3'];

      // Assign multiple permissions
      for (const permissionId of permissionIds) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Permission assigned successfully' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        await PermissionApi.assignToRole(roleId, permissionId);
      }

      // Verify all permissions were assigned
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPermissions,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const rolePermissions = await PermissionApi.getRolePermissions(roleId);
      expect(rolePermissions).toHaveLength(3);
    });
  });

  describe('Error Recovery', () => {
    it('should handle network errors gracefully', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(PermissionApi.assignToRole(roleId, permissionId)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle timeout errors', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(PermissionApi.assignToRole(roleId, permissionId)).rejects.toThrow(
        'Request timeout'
      );
    });

    it('should handle server errors', async () => {
      const roleId = 'role-1';
      const permissionId = 'perm-1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(PermissionApi.assignToRole(roleId, permissionId)).rejects.toThrow(
        'Internal server error'
      );
    });
  });
});
