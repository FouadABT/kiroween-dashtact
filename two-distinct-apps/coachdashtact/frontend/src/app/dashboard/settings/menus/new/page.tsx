'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import type { BreadcrumbItem } from '@/lib/breadcrumb-helpers';
import { toast } from 'sonner';
import { MenuApi } from '@/lib/api';
import type { CreateMenuDto } from '@/types/menu';

export default function NewMenuPage() {
  const router = useRouter();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Menu Management', href: '/dashboard/settings/menus' },
    { label: 'New Menu', href: '/dashboard/settings/menus/new' },
  ];

  const handleSubmit = async (data: CreateMenuDto) => {
    try {
      await MenuApi.createMenu(data);
      toast.success('Menu created successfully');
      router.push('/dashboard/settings/menus');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create menu';
      toast.error(message);
      throw err;
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/settings/menus');
  };

  return (
    <RoleGuard role="Super Admin">
      <div className="space-y-6">
        <PageHeader
          title="Create New Menu"
          description="Add a new menu item to the dashboard navigation"
          breadcrumbProps={{ customItems: breadcrumbs }}
        />

        <MenuItemForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </RoleGuard>
  );
}
