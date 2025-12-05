'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import type { BreadcrumbItem } from '@/lib/breadcrumb-helpers';
import { toast } from 'sonner';
import { MenuApi } from '@/lib/api';
import type { MenuItem, UpdateMenuDto } from '@/types/menu';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Menu Management', href: '/dashboard/settings/menus' },
    { label: menu?.label || 'Edit Menu', href: `/dashboard/settings/menus/${resolvedParams.id}/edit` },
  ];

  useEffect(() => {
    loadMenu();
  }, [resolvedParams.id]);

  const loadMenu = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await MenuApi.getById(resolvedParams.id);
      setMenu(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load menu';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateMenuDto) => {
    try {
      await MenuApi.updateMenu(resolvedParams.id, data);
      toast.success('Menu updated successfully');
      router.push('/dashboard/settings/menus');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update menu';
      toast.error(message);
      throw err;
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/settings/menus');
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

  if (error || !menu) {
    return (
      <RoleGuard role="Super Admin">
        <div className="space-y-6">
          <PageHeader
            title="Edit Menu"
            description="Menu not found"
            breadcrumbProps={{ customItems: breadcrumbs }}
          />
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Menu not found'}
            </AlertDescription>
          </Alert>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="Super Admin">
      <div className="space-y-6">
        <PageHeader
          title={`Edit Menu: ${menu.label}`}
          description="Update menu item configuration"
          breadcrumbProps={{ customItems: breadcrumbs }}
        />

        <MenuItemForm
          initialData={menu}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </RoleGuard>
  );
}
