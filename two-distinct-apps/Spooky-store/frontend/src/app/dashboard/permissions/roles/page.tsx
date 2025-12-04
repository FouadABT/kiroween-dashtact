'use client';

import { useState, useEffect, useMemo } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Permission } from '@/types/permission';
import { UserRole } from '@/types/user';
import { PermissionApi, UserApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Shield, Users, Search, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Role Permissions Editor Page
 * 
 * Allows admins to view and edit permissions assigned to roles.
 * Requires 'permissions:write' permission to access.
 */
export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch roles and permissions on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load role permissions when role is selected
  useEffect(() => {
    if (selectedRoleId) {
      loadRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesData, permissionsData] = await Promise.all([
        UserApi.getRoles(),
        PermissionApi.getAll(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      
      // Auto-select first role if available
      if (rolesData.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rolesData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: string) => {
    try {
      setError(null);
      const data = await PermissionApi.getRolePermissions(roleId);
      setRolePermissions(data);
      setPendingChanges(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load role permissions');
    }
  };

  // Check if a permission is assigned to the current role
  const isPermissionAssigned = (permissionId: string): boolean => {
    return rolePermissions.some((p) => p.id === permissionId);
  };

  // Toggle permission assignment (optimistic update)
  const togglePermission = (permission: Permission) => {
    const isAssigned = isPermissionAssigned(permission.id);
    
    // Update local state optimistically
    if (isAssigned) {
      setRolePermissions((prev) => prev.filter((p) => p.id !== permission.id));
    } else {
      setRolePermissions((prev) => [...prev, permission]);
    }

    // Track pending change
    setPendingChanges((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permission.id)) {
        newSet.delete(permission.id);
      } else {
        newSet.add(permission.id);
      }
      return newSet;
    });

    // Clear any previous messages
    setSuccess(null);
    setError(null);
  };

  // Save all pending changes
  const saveChanges = async () => {
    if (!selectedRoleId || pendingChanges.size === 0) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Get the original permissions for comparison
      const originalPermissions = await PermissionApi.getRolePermissions(selectedRoleId);
      const originalIds = new Set(originalPermissions.map((p) => p.id));
      const currentIds = new Set(rolePermissions.map((p) => p.id));

      // Determine which permissions to add and remove
      const toAdd: string[] = [];
      const toRemove: string[] = [];

      for (const permId of pendingChanges) {
        if (currentIds.has(permId) && !originalIds.has(permId)) {
          toAdd.push(permId);
        } else if (!currentIds.has(permId) && originalIds.has(permId)) {
          toRemove.push(permId);
        }
      }

      // Execute changes
      const promises: Promise<unknown>[] = [];
      
      for (const permId of toAdd) {
        promises.push(PermissionApi.assignToRole(selectedRoleId, permId));
      }
      
      for (const permId of toRemove) {
        promises.push(PermissionApi.removeFromRole(selectedRoleId, permId));
      }

      await Promise.all(promises);

      // Clear pending changes
      setPendingChanges(new Set());
      setSuccess(`Successfully updated permissions for ${selectedRole?.name}`);
      
      // Reload to ensure consistency
      await loadRolePermissions(selectedRoleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      // Reload to revert optimistic updates
      await loadRolePermissions(selectedRoleId);
    } finally {
      setSaving(false);
    }
  };

  // Discard pending changes
  const discardChanges = async () => {
    if (selectedRoleId) {
      await loadRolePermissions(selectedRoleId);
      setSuccess(null);
      setError(null);
    }
  };

  // Get selected role object
  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId);
  }, [roles, selectedRoleId]);

  // Filter permissions by search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery) return permissions;
    
    const query = searchQuery.toLowerCase();
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.resource.toLowerCase().includes(query) ||
        p.action.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [permissions, searchQuery]);

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    
    filteredPermissions.forEach((permission) => {
      if (!groups[permission.resource]) {
        groups[permission.resource] = [];
      }
      groups[permission.resource].push(permission);
    });

    return groups;
  }, [filteredPermissions]);

  // Get badge color based on action
  const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (action) {
      case 'read':
        return 'secondary';
      case 'write':
        return 'default';
      case 'delete':
        return 'destructive';
      case 'admin':
      case '*':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <PermissionGuard permission="permissions:write">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Role Permissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage permissions assigned to each role
            </p>
          </div>
        </div>

        {/* Role Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Role</CardTitle>
            <CardDescription>
              Choose a role to view and edit its permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <span>{role.name}</span>
                          {role.isSystemRole && (
                            <Badge variant="outline" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedRole && (
                  <div className="text-sm text-muted-foreground">
                    {selectedRole.description || 'No description available'}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Permissions Editor */}
        {selectedRoleId && (
          <>
            {/* Search and Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1 relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={discardChanges}
                      variant="outline"
                      disabled={pendingChanges.size === 0 || saving}
                      className="flex-1 sm:flex-none"
                    >
                      Discard
                    </Button>
                    <Button
                      onClick={saveChanges}
                      disabled={pendingChanges.size === 0 || saving}
                      className="flex-1 sm:flex-none"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : `Save Changes (${pendingChanges.size})`}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {rolePermissions.length} of {permissions.length} permissions assigned
                  {pendingChanges.size > 0 && (
                    <span className="text-orange-600 dark:text-orange-400 ml-2">
                      • {pendingChanges.size} unsaved change{pendingChanges.size !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions List */}
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <Card key={resource}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {resource}
                    </CardTitle>
                    <CardDescription>
                      {perms.length} permission{perms.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {perms.map((permission) => {
                        const isAssigned = isPermissionAssigned(permission.id);
                        const isPending = pendingChanges.has(permission.id);

                        return (
                          <div
                            key={permission.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                              isPending
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                                : 'border-border hover:bg-accent'
                            }`}
                          >
                            <Checkbox
                              id={permission.id}
                              checked={isAssigned}
                              onCheckedChange={() => togglePermission(permission)}
                              className="mt-1"
                            />
                            <label
                              htmlFor={permission.id}
                              className="flex-1 cursor-pointer space-y-1"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-medium">
                                  {permission.name}
                                </span>
                                <Badge variant={getActionBadgeVariant(permission.action)}>
                                  {permission.action}
                                </Badge>
                                {isPending && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              {permission.description && (
                                <p className="text-sm text-muted-foreground">
                                  {permission.description}
                                </p>
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {Object.keys(groupedPermissions).length === 0 && (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {searchQuery
                          ? 'No permissions match your search'
                          : 'No permissions available'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
