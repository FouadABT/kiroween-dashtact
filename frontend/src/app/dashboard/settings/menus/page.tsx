'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import type { BreadcrumbItem } from '@/lib/breadcrumb-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MenuApi } from '@/lib/api';
import { MenuItem, PageType, MenuFilters, ReorderMenuItem } from '@/types/menu';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function MenuManagementPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Menu Management', href: '/dashboard/settings/menus' },
  ];
  
  // Filters
  const [filters, setFilters] = useState<MenuFilters>({
    search: '',
    pageType: undefined,
    isActive: undefined,
  });

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    menuId: string | null;
    menuLabel: string | null;
  }>({
    open: false,
    menuId: null,
    menuLabel: null,
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load menus
  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await MenuApi.getAllMenus();
      setMenus(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load menus';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Build hierarchy from flat list
  const buildHierarchy = (items: MenuItem[]): MenuItem[] => {
    const map = new Map<string, MenuItem>();
    const roots: MenuItem[] = [];

    // First pass: create map
    items.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    items.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // Sort by order
    const sortByOrder = (items: MenuItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortByOrder(item.children);
        }
      });
    };

    sortByOrder(roots);
    return roots;
  };

  // Filter menus
  const filteredMenus = useMemo(() => {
    let filtered = [...menus];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(menu =>
        menu.label.toLowerCase().includes(searchLower) ||
        menu.key.toLowerCase().includes(searchLower) ||
        menu.route.toLowerCase().includes(searchLower)
      );
    }

    // Page type filter
    if (filters.pageType) {
      filtered = filtered.filter(menu => menu.pageType === filters.pageType);
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(menu => menu.isActive === filters.isActive);
    }

    return buildHierarchy(filtered);
  }, [menus, filters]);

  // Toggle menu expansion
  const toggleExpand = (menuId: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.menuId) return;

    try {
      await MenuApi.deleteMenu(deleteDialog.menuId);
      toast.success(`Menu "${deleteDialog.menuLabel}" deleted successfully`);
      setDeleteDialog({ open: false, menuId: null, menuLabel: null });
      loadMenus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete menu';
      toast.error(message);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (menu: MenuItem) => {
    try {
      await MenuApi.toggleMenuActive(menu.id);
      toast.success(`Menu "${menu.label}" ${menu.isActive ? 'deactivated' : 'activated'}`);
      loadMenus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle menu status';
      toast.error(message);
    }
  };

  // Flatten hierarchy for drag and drop
  const flattenMenus = (items: MenuItem[], parentId: string | null = null): MenuItem[] => {
    let result: MenuItem[] = [];
    items.forEach(item => {
      result.push({ ...item, parentId: parentId || item.parentId });
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenMenus(item.children, item.id));
      }
    });
    return result;
  };

  // Get siblings (items with same parent)
  const getSiblings = (menuId: string): MenuItem[] => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return [];
    return menus.filter(m => m.parentId === menu.parentId);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag over (for moving between parents)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeMenu = menus.find(m => m.id === active.id);
    const overMenu = menus.find(m => m.id === over.id);

    if (!activeMenu || !overMenu) return;

    // If dragging over a different parent, update optimistically
    if (activeMenu.parentId !== overMenu.parentId) {
      setMenus(prevMenus => {
        return prevMenus.map(menu => {
          if (menu.id === active.id) {
            return { ...menu, parentId: overMenu.parentId };
          }
          return menu;
        });
      });
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeMenu = menus.find(m => m.id === active.id);
    const overMenu = menus.find(m => m.id === over.id);

    if (!activeMenu || !overMenu) return;

    // Prevent dropping a parent into its own child
    const isDescendant = (parentId: string, childId: string): boolean => {
      const child = menus.find(m => m.id === childId);
      if (!child || !child.parentId) return false;
      if (child.parentId === parentId) return true;
      return isDescendant(parentId, child.parentId);
    };

    if (isDescendant(activeMenu.id, overMenu.id)) {
      toast.error('Cannot move a parent menu into its own child');
      loadMenus(); // Reset to server state
      return;
    }

    try {
      setIsReordering(true);

      // Get all siblings (including the moved item)
      const siblings = menus.filter(m => m.parentId === overMenu.parentId);
      const oldIndex = siblings.findIndex(m => m.id === active.id);
      const newIndex = siblings.findIndex(m => m.id === over.id);

      // Reorder siblings
      const reorderedSiblings = [...siblings];
      const [movedItem] = reorderedSiblings.splice(oldIndex, 1);
      reorderedSiblings.splice(newIndex, 0, movedItem);

      // Update order values
      const updates: ReorderMenuItem[] = reorderedSiblings.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      // If parent changed, also update the moved item's parent
      if (activeMenu.parentId !== overMenu.parentId) {
        // Update parent in the backend
        await MenuApi.updateMenu(activeMenu.id, {
          parentId: overMenu.parentId || undefined,
        });
      }

      // Update order values
      await MenuApi.reorderMenus(updates);

      toast.success('Menu order updated successfully');
      
      // Reload to get fresh data
      await loadMenus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder menus';
      toast.error(message);
      // Reset to server state
      await loadMenus();
    } finally {
      setIsReordering(false);
    }
  };

  // Sortable menu item component
  const SortableMenuItem = ({ menu, level = 0 }: { menu: MenuItem; level?: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: menu.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.id);

    return (
      <div ref={setNodeRef} style={style} className="space-y-2">
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
            !menu.isActive && 'opacity-60',
            isDragging && 'shadow-lg ring-2 ring-primary'
          )}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded touch-none"
            aria-label="Drag to reorder"
            disabled={isReordering}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(menu.id)}
              className="p-1 hover:bg-accent rounded"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          {/* Menu Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{menu.label}</span>
              {menu.badge && (
                <Badge variant="secondary" className="text-xs">
                  {menu.badge}
                </Badge>
              )}
              {!menu.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono">{menu.key}</span>
              <span>•</span>
              <span>{menu.route}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                {menu.pageType}
              </Badge>
              <span>•</span>
              <span>Order: {menu.order}</span>
            </div>
            {menu.description && (
              <p className="text-xs text-muted-foreground mt-1">{menu.description}</p>
            )}
            {(menu.requiredPermissions.length > 0 || menu.requiredRoles.length > 0) && (
              <div className="flex items-center gap-2 mt-2">
                {menu.requiredRoles.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Roles:</span>
                    {menu.requiredRoles.map(role => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
                {menu.requiredPermissions.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Permissions:</span>
                    {menu.requiredPermissions.slice(0, 2).map(perm => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                    {menu.requiredPermissions.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{menu.requiredPermissions.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleActive(menu)}
              title={menu.isActive ? 'Deactivate' : 'Activate'}
              disabled={isReordering}
            >
              {menu.isActive ? (
                <Power className="h-4 w-4 text-green-600" />
              ) : (
                <PowerOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/settings/menus/${menu.id}/edit`)}
              title="Edit"
              disabled={isReordering}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setDeleteDialog({
                  open: true,
                  menuId: menu.id,
                  menuLabel: menu.label,
                })
              }
              title="Delete"
              disabled={isReordering}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="space-y-2">
            <SortableContext
              items={menu.children!.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {menu.children!.map(child => (
                <SortableMenuItem key={child.id} menu={child} level={level + 1} />
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <RoleGuard role="Super Admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="Super Admin">
      <div className="space-y-6">
        <PageHeader
          title="Menu Management"
          description="Manage dashboard navigation menus"
          breadcrumbProps={{ customItems: breadcrumbs }}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter menu items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menus..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Page Type Filter */}
              <Select
                value={filters.pageType || 'all'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    pageType: value === 'all' ? undefined : (value as PageType),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Page Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={PageType.WIDGET_BASED}>Widget Based</SelectItem>
                  <SelectItem value={PageType.HARDCODED}>Hardcoded</SelectItem>
                  <SelectItem value={PageType.CUSTOM}>Custom</SelectItem>
                  <SelectItem value={PageType.EXTERNAL}>External</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={
                  filters.isActive === undefined
                    ? 'all'
                    : filters.isActive
                    ? 'active'
                    : 'inactive'
                }
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    isActive:
                      value === 'all'
                        ? undefined
                        : value === 'active'
                        ? true
                        : false,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-muted-foreground">
                {filteredMenus.length} menu{filteredMenus.length !== 1 ? 's' : ''} found
              </p>
              <Button onClick={() => router.push('/dashboard/settings/menus/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Menu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Menu List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>
                  Drag and drop to reorder menu items
                </CardDescription>
              </div>
              {isReordering && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving order...</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredMenus.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No menus found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/dashboard/settings/menus/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Menu
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredMenus.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {filteredMenus.map(menu => (
                      <SortableMenuItem key={menu.id} menu={menu} />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="p-3 rounded-lg border bg-card shadow-lg opacity-90">
                      <span className="font-medium text-sm">
                        {menus.find(m => m.id === activeId)?.label}
                      </span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog({ open, menuId: null, menuLabel: null })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteDialog.menuLabel}"? This action
                cannot be undone. Child menu items will also be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}
