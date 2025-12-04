'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, ExternalLink, Calendar, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { RoleApi, PermissionApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { UserRole } from '@/types/user';
import type { Permission } from '@/types/permission';

const CALENDAR_PERMISSION_KEYS = [
  'calendar:create',
  'calendar:read',
  'calendar:update',
  'calendar:delete',
  'calendar:admin',
];

const PERMISSION_LABELS: Record<string, { name: string; description: string }> = {
  'calendar:create': {
    name: 'Create Events',
    description: 'Ability to create new calendar events',
  },
  'calendar:read': {
    name: 'View Events',
    description: 'Ability to view calendar events',
  },
  'calendar:update': {
    name: 'Edit Events',
    description: 'Ability to edit calendar events',
  },
  'calendar:delete': {
    name: 'Delete Events',
    description: 'Ability to delete calendar events',
  },
  'calendar:admin': {
    name: 'Calendar Admin',
    description: 'Full access to calendar settings and categories',
  },
};

interface RolePermissionMap {
  [roleId: string]: Set<string>;
}

export function CalendarPermissions() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all roles
      const rolesData = await RoleApi.getAll();
      setRoles(rolesData);

      // Fetch permissions for each role
      const permMap: RolePermissionMap = {};
      
      for (const role of rolesData) {
        const permissions = await PermissionApi.getRolePermissions(role.id);
        permMap[role.id] = new Set(permissions.map(p => p.name));
      }
      
      setRolePermissions(permMap);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      toast.error('Failed to load calendar permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionIcon = (key: string) => {
    if (key.includes('create')) return <Plus className="h-4 w-4" />;
    if (key.includes('read')) return <Eye className="h-4 w-4" />;
    if (key.includes('update')) return <Edit className="h-4 w-4" />;
    if (key.includes('delete')) return <Trash2 className="h-4 w-4" />;
    if (key.includes('admin')) return <Shield className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const hasPermission = (roleId: string, permissionKey: string): boolean => {
    return rolePermissions[roleId]?.has(permissionKey) || rolePermissions[roleId]?.has('*:*') || false;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Calendar Permissions</h2>
            <p className="text-muted-foreground text-sm">
              View which roles have access to calendar features. Manage permissions in the
              main permissions page.
            </p>
          </div>
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link href="/dashboard/permissions">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Manage Permissions</span>
              <span className="sm:hidden">Manage</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {/* Permission Descriptions */}
        <div className="mb-6 space-y-3">
          <h3 className="text-lg font-semibold">Available Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CALENDAR_PERMISSION_KEYS.map(key => (
              <div
                key={key}
                className="flex items-start gap-3 p-3 border border-border rounded-lg"
              >
                <div className="mt-0.5 text-primary">{getPermissionIcon(key)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{PERMISSION_LABELS[key].name}</div>
                  <div className="text-xs text-muted-foreground">{PERMISSION_LABELS[key].description}</div>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                    {key}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Permission Matrix</h3>
          
          {roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No calendar permissions assigned to any roles yet.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/permissions">
                  Configure Permissions
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">Role</th>
                    {CALENDAR_PERMISSION_KEYS.map(key => (
                      <th
                        key={key}
                        className="text-center p-3 font-semibold text-sm"
                      >
                        <div className="flex flex-col items-center gap-1">
                          {getPermissionIcon(key)}
                          <span className="hidden lg:inline">{PERMISSION_LABELS[key].name}</span>
                          <span className="lg:hidden">{PERMISSION_LABELS[key].name.split(' ')[0]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id} className="border-b border-border hover:bg-accent/50">
                      <td className="p-3">
                        <Badge variant="outline">{role.name}</Badge>
                      </td>
                      {CALENDAR_PERMISSION_KEYS.map(key => (
                        <td key={key} className="text-center p-3">
                          {hasPermission(role.id, key) ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-600">
                              ✓
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
                              −
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Permission Management</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Calendar permissions control access to calendar features. To modify which roles
              have which permissions, use the main permissions management page.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>calendar:create</strong> - Required to create new events
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>calendar:read</strong> - Required to view calendar and events
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>calendar:update</strong> - Required to edit events
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>calendar:delete</strong> - Required to delete events
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>calendar:admin</strong> - Full access to calendar settings and
                  categories
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
