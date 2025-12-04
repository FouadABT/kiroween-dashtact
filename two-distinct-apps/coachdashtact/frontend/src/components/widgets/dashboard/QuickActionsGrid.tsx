'use client';

import { useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Settings, Mail, Users, Activity, Package, FileText, ShoppingCart, Upload, Truck, BarChart3, UserPlus, UserCircle, MessageSquare, FileUp, Bell, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

export interface QuickActionsGridProps {
  title?: string;
  data?: Array<{ id: string; label: string; icon: string; url: string; description?: string }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  url: string;
  description?: string;
}

const iconMap: Record<string, LucideIcon> = {
  Settings, Mail, Users, Activity, Package, FileText, ShoppingCart, Upload, Truck, BarChart3, UserPlus, UserCircle, MessageSquare, FileUp, Bell,
};

const quickActionsByRole: Record<string, QuickAction[]> = {
  SUPER_ADMIN: [
    { id: 'manage-cron-jobs', label: 'Manage Cron Jobs', icon: Activity, url: '/dashboard/admin/cron-jobs', description: 'View and manage scheduled tasks' },
    { id: 'view-email-logs', label: 'View Email Logs', icon: Mail, url: '/dashboard/admin/email-logs', description: 'Monitor email delivery' },
    { id: 'system-settings', label: 'System Settings', icon: Settings, url: '/dashboard/admin/settings', description: 'Configure system settings' },
    { id: 'manage-users', label: 'Manage Users', icon: Users, url: '/dashboard/admin/users', description: 'User management' },
  ],
  ADMIN: [
    { id: 'create-product', label: 'Create Product', icon: Package, url: '/dashboard/ecommerce/products/new', description: 'Add new product' },
    { id: 'new-blog-post', label: 'New Blog Post', icon: FileText, url: '/dashboard/blog/posts/new', description: 'Create blog post' },
    { id: 'manage-orders', label: 'Manage Orders', icon: ShoppingCart, url: '/dashboard/ecommerce/orders', description: 'View and manage orders' },
    { id: 'upload-media', label: 'Upload Media', icon: Upload, url: '/dashboard/media', description: 'Upload files and images' },
  ],
  MANAGER: [
    { id: 'fulfill-orders', label: 'Fulfill Orders', icon: Truck, url: '/dashboard/ecommerce/orders?status=processing', description: 'Process pending orders' },
    { id: 'adjust-inventory', label: 'Adjust Inventory', icon: BarChart3, url: '/dashboard/ecommerce/inventory', description: 'Manage stock levels' },
    { id: 'add-product', label: 'Add Product', icon: Package, url: '/dashboard/ecommerce/products/new', description: 'Add new product' },
    { id: 'manage-customers', label: 'Manage Customers', icon: UserPlus, url: '/dashboard/ecommerce/customers', description: 'View customer list' },
  ],
  USER: [
    { id: 'edit-profile', label: 'Edit Profile', icon: UserCircle, url: '/dashboard/profile', description: 'Update your profile' },
    { id: 'view-messages', label: 'View Messages', icon: MessageSquare, url: '/dashboard/messages', description: 'Read your messages' },
    { id: 'upload-files', label: 'Upload Files', icon: FileUp, url: '/dashboard/media', description: 'Upload your files' },
    { id: 'view-notifications', label: 'View Notifications', icon: Bell, url: '/dashboard/notifications', description: 'Check notifications' },
  ],
};

export function QuickActionsGrid({
  title = 'Quick Actions',
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission,
}: QuickActionsGridProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [useContext] = useState(!propData);

  const actions = propData || (useContext ? quickActionsByRole[user?.role?.name || 'USER'] || quickActionsByRole.USER : []);
  const loading = propLoading || (useContext ? isLoading : false);
  const error = propError;

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="card" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={error}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (actions.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={Zap} title="No Actions" description="No quick actions available" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((action: any) => {
          const Icon = action.icon || iconMap[action.icon] || Zap;
          return (
            <Button key={action.id} variant="outline" className="h-auto flex flex-col items-center justify-center gap-2 p-4 hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => router.push(action.url)} title={action.description}>
              <Icon className="h-5 w-5" />
              <span className="text-xs md:text-sm text-center leading-tight">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </WidgetContainer>
  );
}
