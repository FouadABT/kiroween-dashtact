"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Debug component to display current user permissions
 * Add this to any page to see what permissions the current user has
 */
export function PermissionsDebug() {
  const { user, isAuthenticated, getPermissions } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">🔒 Not Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to see permissions</p>
        </CardContent>
      </Card>
    );
  }

  const permissions = getPermissions();

  return (
    <Card className="border-blue-500">
      <CardHeader>
        <CardTitle className="text-blue-600">🔍 Permissions Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">User Info:</h3>
          <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name || 'N/A'}</p>
            <p><strong>Role:</strong> {user.role?.name || 'N/A'}</p>
            <p><strong>Role ID:</strong> {user.roleId || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Permissions ({permissions.length}):</h3>
          {permissions.length === 0 ? (
            <div className="bg-red-100 p-3 rounded text-sm text-red-800">
              ⚠️ No permissions found! You may need to log out and log back in.
            </div>
          ) : (
            <div className="bg-green-100 p-3 rounded text-sm space-y-1">
              {permissions.map((permission, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <code className="text-xs">{permission}</code>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Permission Checks:</h3>
          <div className="space-y-2 text-sm">
            <PermissionCheck permission="users:read" label="Can view users" />
            <PermissionCheck permission="users:write" label="Can create/edit users" />
            <PermissionCheck permission="users:delete" label="Can delete users" />
            <PermissionCheck permission="settings:read" label="Can view settings" />
            <PermissionCheck permission="settings:write" label="Can edit settings" />
            <PermissionCheck permission="permissions:read" label="Can view permissions" />
          </div>
        </div>

        <div className="bg-yellow-100 p-3 rounded text-sm">
          <p className="font-semibold mb-1">💡 Tip:</p>
          <p>If your permissions don't match your role, log out and log back in to refresh your session.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PermissionCheck({ permission, label }: { permission: string; label: string }) {
  const { hasPermission } = useAuth();
  const has = hasPermission(permission);

  return (
    <div className={`flex items-center gap-2 p-2 rounded ${has ? 'bg-green-50' : 'bg-red-50'}`}>
      <span className={has ? 'text-green-600' : 'text-red-600'}>
        {has ? '✓' : '✗'}
      </span>
      <span className={has ? 'text-green-800' : 'text-red-800'}>
        {label}
      </span>
      <code className="ml-auto text-xs text-gray-600">{permission}</code>
    </div>
  );
}
