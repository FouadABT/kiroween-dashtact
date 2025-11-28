'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Shield, Users } from 'lucide-react';
import { UserApi, PermissionApi } from '@/lib/api';
import { UserRole } from '@/types/user';
import { Permission } from '@/types/permission';
import { RoleDialog } from './RoleDialog';
import { DeleteRoleDialog } from './DeleteRoleDialog';
import { toast } from '@/hooks/use-toast';

export function RolesManagement() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        UserApi.getRoles(),
        PermissionApi.getAll(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      toast.error('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles;
    const query = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query)
    );
  }, [roles, searchQuery]);

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: UserRole) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = (role: UserRole) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleRoleSaved = () => {
    loadData();
    setIsDialogOpen(false);
    setSelectedRole(null);
  };

  const handleRoleDeleted = () => {
    loadData();
    setIsDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage roles and their permissions
              </CardDescription>
            </div>
            <Button onClick={handleCreateRole}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Roles Grid */}
          {filteredRoles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchQuery
                  ? 'No roles match your search'
                  : 'No roles found. Create your first role.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Dialog */}
      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={selectedRole}
        permissions={permissions}
        onSaved={handleRoleSaved}
      />

      {/* Delete Dialog */}
      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        role={selectedRole}
        onDeleted={handleRoleDeleted}
      />
    </>
  );
}

interface RoleCardProps {
  role: UserRole;
  onEdit: (role: UserRole) => void;
  onDelete: (role: UserRole) => void;
}

function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  const [permissionCount, setPermissionCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    loadRoleStats();
  }, [role.id]);

  const loadRoleStats = async () => {
    try {
      const permissions = await PermissionApi.getRolePermissions(role.id);
      setPermissionCount(permissions.length);
      
      // Get user count for this role
      const usersResponse = await UserApi.getUsers({ roleId: role.id });
      // Handle nested response structure
      const total = usersResponse?.data?.total || usersResponse?.total || 0;
      setUserCount(total);
    } catch (error) {
      console.error('Failed to load role stats:', error);
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{role.name}</CardTitle>
          </div>
          {role.isSystemRole && (
            <Badge variant="secondary" className="text-xs">
              System
            </Badge>
          )}
        </div>
        {role.description && (
          <CardDescription className="text-sm">
            {role.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>{permissionCount} permissions</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{userCount} users</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(role)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          {!role.isSystemRole && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(role)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
