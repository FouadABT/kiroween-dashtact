'use client';

import { useState, useEffect } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useMetadata } from '@/contexts/MetadataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolesManagement } from '@/components/roles/RolesManagement';
import { UsersRoleAssignment } from '@/components/roles/UsersRoleAssignment';

/**
 * RBAC Management Page
 * 
 * Comprehensive role-based access control management for super admins.
 * Includes role management, permission assignment, and user role assignment.
 */
export default function RBACPage() {
  const { updateMetadata } = useMetadata();
  const [activeTab, setActiveTab] = useState('roles');

  useEffect(() => {
    updateMetadata({
      title: 'Role Management',
      description: 'Manage roles, permissions, and user access',
      keywords: ['rbac', 'roles', 'permissions', 'access control'],
    });
  }, [updateMetadata]);

  return (
    <PermissionGuard permission="*:*">
      <div className="space-y-6">
        {/* Page Header with Breadcrumbs */}
        <PageHeader
          title="Role Management"
          description="Manage roles, assign permissions, and control user access"
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="users">User Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            <RolesManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersRoleAssignment />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
