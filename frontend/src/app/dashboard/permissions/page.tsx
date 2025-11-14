'use client';

import { useState, useEffect, useMemo } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Permission } from '@/types/permission';
import { PermissionApi } from '@/lib/api';
import { useMetadata } from '@/contexts/MetadataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Shield } from 'lucide-react';

/**
 * Permissions List Page
 * 
 * Displays all permissions in a searchable and filterable table.
 * Requires 'permissions:read' permission to access.
 */
export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const { updateMetadata } = useMetadata();

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: "Permissions",
      description: "Manage roles and permissions",
      keywords: ["permissions", "roles", "access control"],
    });
  }, [updateMetadata]);

  // Fetch permissions on mount
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PermissionApi.getAll();
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  // Get unique resources for filter dropdown
  const uniqueResources = useMemo(() => {
    const resources = new Set(permissions.map((p) => p.resource));
    return Array.from(resources).sort();
  }, [permissions]);

  // Filter and search permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      // Apply resource filter
      if (resourceFilter !== 'all' && permission.resource !== resourceFilter) {
        return false;
      }

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          permission.name.toLowerCase().includes(query) ||
          permission.resource.toLowerCase().includes(query) ||
          permission.action.toLowerCase().includes(query) ||
          permission.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [permissions, searchQuery, resourceFilter]);

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
    <PermissionGuard permission="permissions:read">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Permissions
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage system permissions
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Permissions</CardTitle>
            <CardDescription>
              Search and filter permissions by resource and action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Resource Filter */}
              <div className="w-full sm:w-48">
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    {uniqueResources.map((resource) => (
                      <SelectItem key={resource} value={resource}>
                        {resource}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || resourceFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setResourceFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredPermissions.length} of {permissions.length} permissions
            </div>
          </CardContent>
        </Card>

        {/* Permissions Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadPermissions} variant="outline">
                  Retry
                </Button>
              </div>
            ) : filteredPermissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || resourceFilter !== 'all'
                    ? 'No permissions match your filters'
                    : 'No permissions found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Permission Name</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-mono text-sm">
                          {permission.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{permission.resource}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(permission.action)}>
                            {permission.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {permission.description || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {new Date(permission.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
