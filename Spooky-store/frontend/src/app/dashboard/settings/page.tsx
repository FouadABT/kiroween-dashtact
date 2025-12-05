"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMetadata } from "@/contexts/MetadataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Palette, 
  Calendar, 
  Clock, 
  ShoppingCart, 
  Mail, 
  House, 
  Scale, 
  Menu, 
  MessageSquare, 
  Bell,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Settings menu items with permissions
const settingsItems = [
  {
    key: 'branding',
    label: 'Branding',
    description: 'Manage brand identity, logos, and assets',
    icon: Palette,
    route: '/dashboard/settings/branding',
    permission: 'branding:manage',
    roles: ['Admin', 'Super Admin'],
  },
  {
    key: 'calendar',
    label: 'Calendar Settings',
    description: 'Manage calendar settings and categories',
    icon: Calendar,
    route: '/dashboard/settings/calendar',
    permission: 'calendar:admin',
    roles: ['Admin', 'Super Admin'],
  },
  {
    key: 'cron-jobs',
    label: 'Cron Jobs',
    description: 'Manage scheduled tasks and automation',
    icon: Clock,
    route: '/dashboard/settings/cron-jobs',
    permission: 'system.cron.manage',
    roles: ['Super Admin'],
  },
  {
    key: 'ecommerce',
    label: 'E-commerce Settings',
    description: 'Configure store and payment methods',
    icon: ShoppingCart,
    route: '/dashboard/settings/ecommerce',
    permission: 'settings:write',
    roles: ['Admin', 'Super Admin'],
  },
  {
    key: 'email',
    label: 'Email Settings',
    description: 'Configure email notification system',
    icon: Mail,
    route: '/dashboard/settings/email',
    permission: 'email:configure',
    roles: ['Super Admin'],
  },
  {
    key: 'landing-page',
    label: 'Landing Page',
    description: 'Manage landing page content and sections',
    icon: House,
    route: '/dashboard/settings/landing-page',
    permission: 'landing:write',
    roles: ['Admin', 'Super Admin'],
  },
  {
    key: 'legal',
    label: 'Legal Pages',
    description: 'Manage Terms of Service and Privacy Policy',
    icon: Scale,
    route: '/dashboard/settings/legal',
    permission: 'settings:write',
    roles: ['Admin', 'Super Admin'],
  },
  {
    key: 'menus',
    label: 'Menus',
    description: 'Manage navigation menus',
    icon: Menu,
    route: '/dashboard/settings/menus',
    permission: 'menu:write',
    roles: ['Admin', 'Super Admin'],
  },
  {
    key: 'messaging',
    label: 'Messaging',
    description: 'Configure messaging system settings',
    icon: MessageSquare,
    route: '/dashboard/settings/messaging',
    permission: 'messaging:settings:write',
    roles: ['Admin', 'Super Admin'],
  },
  {
    key: 'notifications',
    label: 'Notifications Settings',
    description: 'Configure notification preferences and templates',
    icon: Bell,
    route: '/dashboard/settings/notifications',
    permission: 'notifications:write',
    roles: ['Admin', 'Super Admin'],
  },
  {
    key: 'theme',
    label: 'Theme',
    description: 'Customize theme colors and appearance',
    icon: Palette,
    route: '/dashboard/settings/theme',
    permission: 'settings:write',
    roles: ['Admin', 'Super Admin'],
  },
];

export default function SettingsPage() {
  const { updateMetadata } = useMetadata();
  const { hasPermission, hasRole } = useAuth();

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: "Settings",
      description: "Configure your application settings",
      keywords: ["settings", "configuration", "preferences"],
    });
  }, [updateMetadata]);

  // Filter settings items based on user permissions and roles
  const visibleSettings = settingsItems.filter(item => {
    // Check permission
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    
    // Check role
    if (item.roles.length > 0 && !item.roles.some(role => hasRole(role))) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your application settings and preferences"
      />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleSettings.map((setting) => {
          const Icon = setting.icon;
          const isRestricted = setting.roles.length > 0;
          
          return (
            <Link key={setting.key} href={setting.route}>
              <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer h-full">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {setting.label}
                      </CardTitle>
                      {isRestricted && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {setting.roles.join(', ')}
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {setting.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {visibleSettings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No settings available. Contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
