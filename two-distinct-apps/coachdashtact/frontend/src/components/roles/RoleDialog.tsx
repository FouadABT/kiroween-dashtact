'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types/user';
import { Permission } from '@/types/permission';
import { PermissionApi, ApiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: UserRole | null;
  permissions: Permission[];
  onSaved: () => void;
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onSaved,
}: RoleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name);
        setDescription(role.description || '');
        loadRolePermissions(role.id);
      } else {
        setName('');
        setDescription('');
        setSelectedPermissions(new Set());
      }
    }
  }, [open, role]);

  const loadRolePermissions = async (roleId: string) => {
    try {
      setLoadingPermissions(true);
      const rolePermissions = await PermissionApi.getRolePermissions(roleId);
      setSelectedPermissions(new Set(rolePermissions.map((p) => p.id)));
    } catch (error) {
      toast.error('Failed to load role permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      setLoading(true);

      let roleId: string;

      if (role) {
        // Update existing role
        const updated = await ApiClient.patch<UserRole>(`/users/roles/${role.id}`, {
          name: name.trim(),
          description: description.trim() || null,
        });
        roleId = updated.id;
      } else {
        // Create new role
        const created = await ApiClient.post<UserRole>('/users/roles', {
          name: name.trim(),
          description: description.trim() || null,
          isActive: true,
        });
        roleId = created.id;
      }

      // Update permissions
      await updateRolePermissions(roleId);

      toast.success(`Role ${role ? 'updated' : 'created'} successfully`);

      onSaved();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${role ? 'update' : 'create'} role`);
    } finally {
      setLoading(false);
    }
  };

  const updateRolePermissions = async (roleId: string) => {
    // Get current permissions
    const currentPermissions = await PermissionApi.getRolePermissions(roleId);
    const currentIds = new Set(currentPermissions.map((p) => p.id));

    // Determine which permissions to add and remove
    const toAdd = Array.from(selectedPermissions).filter((id) => !currentIds.has(id));
    const toRemove = Array.from(currentIds).filter((id) => !selectedPermissions.has(id));

    // Add new permissions
    for (const permissionId of toAdd) {
      await PermissionApi.assignToRole(roleId, permissionId);
    }

    // Remove old permissions
    for (const permissionId of toRemove) {
      await PermissionApi.removeFromRole(roleId, permissionId);
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogDescription>
            {role
              ? 'Update role details and permissions'
              : 'Create a new role and assign permissions'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Role Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Content Manager"
                disabled={role?.isSystemRole}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role's purpose and responsibilities"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Permissions ({selectedPermissions.size} selected)</Label>
              {loadingPermissions && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-semibold">
                        {resource}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {perms.filter((p) => selectedPermissions.has(p.id)).length} / {perms.length}
                      </span>
                    </div>
                    <div className="grid gap-2 pl-4">
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-2"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.has(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <div className="grid gap-1 leading-none">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permission.name}
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {permission.action}
                              </Badge>
                            </label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
