import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Feature Flags interface for conditional menu creation
 */
interface FeatureFlags {
  landing: boolean;
  blog: boolean;
  ecommerce: boolean;
  calendar: boolean;
  crm: boolean;
  notifications: boolean;
  customerAccount: boolean;
}

export async function seedDashboardMenus(
  prismaClient?: PrismaClient,
  featureFlags?: FeatureFlags,
) {
  const db = prismaClient || prisma;
  const flags = featureFlags || {
    landing: true,
    blog: true,
    ecommerce: true,
    calendar: true,
    crm: false,
    notifications: true,
    customerAccount: true,
  };

  console.log('Seeding dashboard menus...');

  // First, clean up menus for disabled features
  const disabledFeatures: string[] = [];
  if (!flags.blog) disabledFeatures.push('blog');
  if (!flags.calendar) disabledFeatures.push('calendar');
  if (!flags.ecommerce) {
    disabledFeatures.push(
      'ecommerce',
      'ecommerce-products',
      'ecommerce-orders',
      'ecommerce-customers',
      'ecommerce-inventory',
      'ecommerce-categories',
      'ecommerce-payments',
      'ecommerce-shipping',
    );
  }
  if (!flags.landing) disabledFeatures.push('settings-landing-page');
  if (!flags.notifications) disabledFeatures.push('settings-notifications');
  if (!flags.calendar) disabledFeatures.push('settings-calendar');
  if (!flags.ecommerce) disabledFeatures.push('settings-ecommerce');

  if (disabledFeatures.length > 0) {
    console.log(
      `🗑️  Cleaning up menus for disabled features: ${disabledFeatures.join(', ')}`,
    );
    await db.dashboardMenu.deleteMany({
      where: {
        key: { in: disabledFeatures },
      },
    });
  }

  // Get or create Settings parent menu
  let settingsMenu = await db.dashboardMenu.findFirst({
    where: { key: 'settings' },
  });

  if (!settingsMenu) {
    settingsMenu = await db.dashboardMenu.create({
      data: {
        key: 'settings',
        label: 'Settings',
        icon: 'Settings',
        route: '/dashboard/settings',
        pageType: 'HARDCODED',
        order: 100,
        requiredPermissions: ['settings:read'],
        isActive: true,
      },
    });
  }

  // MAIN NAVIGATION ITEMS
  const mainMenuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      order: 1,
      permissions: [],
      roles: ['Admin', 'Super Admin'],
      description: 'Main dashboard overview',
      feature: null, // Always show
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: 'ChartLine',
      route: '/dashboard/analytics',
      order: 5,
      permissions: [],
      roles: ['Admin', 'Super Admin'],
      description: 'View analytics and reports',
      feature: null, // Always show
    },
    {
      key: 'activity',
      label: 'Activity',
      icon: 'Activity',
      route: '/dashboard/activity',
      order: 10,
      permissions: ['activity-logs:read'],
      roles: ['Admin', 'Super Admin'],
      description: 'View system activity logs',
      feature: null, // Always show
    },
    {
      key: 'blog',
      label: 'Blog',
      icon: 'BookOpen',
      route: '/dashboard/blog',
      order: 15,
      permissions: ['blog:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage blog posts and categories',
      feature: 'blog',
    },
    {
      key: 'calendar',
      label: 'Calendar',
      icon: 'Calendar',
      route: '/dashboard/calendar',
      order: 20,
      permissions: ['calendar:read'],
      roles: [],
      description: 'Manage calendar events',
      feature: 'calendar',
    },
    {
      key: 'coaching',
      label: 'Coaching',
      icon: 'GraduationCap',
      route: '/dashboard/coaching',
      order: 22,
      permissions: ['members:read', 'sessions:read'],
      roles: ['Coach'],
      description: 'Manage coaching members and sessions',
      feature: null, // Always show for coaches
    },
    {
      key: 'ecommerce',
      label: 'E-commerce',
      icon: 'ShoppingCart',
      route: '/dashboard/ecommerce',
      order: 25,
      permissions: ['products:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage products, orders, and inventory',
      feature: 'ecommerce',
    },
    {
      key: 'media-library',
      label: 'Media Library',
      icon: 'Image',
      route: '/dashboard/media',
      order: 30,
      permissions: ['media:view'],
      roles: [],
      description: 'Manage media files and uploads',
      feature: null, // Always show
    },
    {
      key: 'member-portal',
      label: 'Member Portal',
      icon: 'User',
      route: '/dashboard/member',
      order: 32,
      permissions: ['profile:read-own'],
      roles: ['Member'],
      description: 'Access member portal and coaching sessions',
      feature: null, // Always show for members
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      route: '/dashboard/notifications',
      order: 35,
      permissions: ['notifications:read'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage notifications and templates',
      feature: 'notifications',
    },
    {
      key: 'pages',
      label: 'Pages',
      icon: 'FileText',
      route: '/dashboard/pages',
      order: 40,
      permissions: ['pages:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage custom pages',
      feature: null, // Always show
    },
    {
      key: 'permissions',
      label: 'Permissions',
      icon: 'Lock',
      route: '/dashboard/permissions',
      order: 55,
      permissions: ['permissions:read'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage permissions and roles',
      feature: null, // Always show
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: 'User',
      route: '/dashboard/profile',
      order: 60,
      permissions: ['profile:read'],
      roles: [],
      description: 'View and edit your profile',
      feature: null, // Always show
    },
    {
      key: 'roles',
      label: 'Roles',
      icon: 'Shield',
      route: '/dashboard/roles',
      order: 65,
      permissions: ['roles:read'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage user roles',
      feature: null, // Always show
    },
    {
      key: 'users',
      label: 'Users',
      icon: 'Users',
      route: '/dashboard/users',
      order: 70,
      permissions: ['users:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage system users',
      feature: null, // Always show
    },
    {
      key: 'widgets',
      label: 'Widgets',
      icon: 'Boxes',
      route: '/dashboard/widgets',
      order: 75,
      permissions: ['widgets:read'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage dashboard widgets',
      feature: null, // Always show
    },
  ];

  // Create main navigation items (filtered by feature flags)
  for (const item of mainMenuItems) {
    // Skip if feature is disabled
    if (item.feature && !flags[item.feature as keyof FeatureFlags]) {
      console.log(`⏭️  Skipping menu item: ${item.label} (feature disabled)`);
      continue;
    }

    await db.dashboardMenu.upsert({
      where: { key: item.key },
      update: {},
      create: {
        key: item.key,
        label: item.label,
        icon: item.icon,
        route: item.route,
        pageType: 'HARDCODED',
        order: item.order,
        requiredPermissions: item.permissions,
        requiredRoles: item.roles.length > 0 ? item.roles : undefined,
        description: item.description,
        featureFlag: item.feature,
        isActive: true,
      },
    });
  }

  // SETTINGS SUB-MENU ITEMS
  const settingsItems = [
    {
      key: 'settings-branding',
      label: 'Branding',
      icon: 'Palette',
      route: '/dashboard/settings/branding',
      order: 1,
      permissions: ['branding:manage'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage brand identity, logos, and assets',
      feature: null, // Always show
    },
    {
      key: 'settings-calendar',
      label: 'Calendar Settings',
      icon: 'Calendar',
      route: '/dashboard/settings/calendar',
      order: 2,
      permissions: ['calendar:admin'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage calendar settings, categories, and permissions',
      feature: 'calendar',
    },
    {
      key: 'settings-cron-jobs',
      label: 'Cron Jobs',
      icon: 'Clock',
      route: '/dashboard/settings/cron-jobs',
      order: 3,
      permissions: ['system.cron.manage'],
      roles: ['Super Admin'],
      description: 'Manage scheduled tasks and cron jobs (Super Admin only)',
      feature: null, // Always show
    },
    {
      key: 'settings-ecommerce',
      label: 'E-commerce Settings',
      icon: 'ShoppingCart',
      route: '/dashboard/settings/ecommerce',
      order: 4,
      permissions: ['settings:write'],
      roles: ['Admin', 'Super Admin'],
      description: 'Configure e-commerce settings and payment methods',
      feature: 'ecommerce',
    },
    {
      key: 'settings-email',
      label: 'Email Settings',
      icon: 'Mail',
      route: '/dashboard/settings/email',
      order: 5,
      permissions: ['email:configure'],
      roles: ['Super Admin'],
      description: 'Configure email notification system (Super Admin only)',
      feature: null, // Always show
    },
    {
      key: 'settings-landing-page',
      label: 'Landing Page',
      icon: 'House',
      route: '/dashboard/settings/landing-page',
      order: 6,
      permissions: ['landing:write'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage landing page content and sections',
      feature: 'landing',
    },
    {
      key: 'settings-legal',
      label: 'Legal Pages',
      icon: 'Scale',
      route: '/dashboard/settings/legal',
      order: 7,
      permissions: ['settings:write'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage Terms of Service and Privacy Policy',
      feature: null, // Always show
    },
    {
      key: 'settings-menus',
      label: 'Menus',
      icon: 'Menu',
      route: '/dashboard/settings/menus',
      order: 8,
      permissions: ['menu:write'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage navigation menus',
      feature: null, // Always show
    },
    {
      key: 'settings-messaging',
      label: 'Messaging',
      icon: 'MessageSquare',
      route: '/dashboard/settings/messaging',
      order: 9,
      permissions: ['messaging:settings:write'],
      roles: ['Admin', 'Super Admin'],
      description: 'Configure messaging system settings',
      feature: null, // Always show
    },
    {
      key: 'settings-notifications',
      label: 'Notifications Settings',
      icon: 'Bell',
      route: '/dashboard/settings/notifications',
      order: 10,
      permissions: ['notifications:write'],
      roles: ['Admin', 'Super Admin'],
      description: 'Configure notification preferences and templates',
      feature: 'notifications',
    },
    {
      key: 'settings-security',
      label: 'Security',
      icon: 'Shield',
      route: '/dashboard/settings/security',
      order: 11,
      permissions: ['settings:write'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage security settings and authentication',
      feature: null, // Always show
    },
    {
      key: 'settings-theme',
      label: 'Theme',
      icon: 'Palette',
      route: '/dashboard/settings/theme',
      order: 12,
      permissions: ['settings:write'],
      roles: ['Admin', 'Super Admin'],
      description: 'Customize theme colors and appearance',
      feature: null, // Always show
    },
  ];

  // Create settings sub-items (filtered by feature flags)
  for (const item of settingsItems) {
    // Skip if feature is disabled
    if (item.feature && !flags[item.feature as keyof FeatureFlags]) {
      console.log(
        `⏭️  Skipping settings item: ${item.label} (feature disabled)`,
      );
      continue;
    }

    await db.dashboardMenu.upsert({
      where: { key: item.key },
      update: {},
      create: {
        key: item.key,
        label: item.label,
        icon: item.icon,
        route: item.route,
        pageType: 'HARDCODED',
        order: item.order,
        parentId: settingsMenu.id,
        requiredPermissions: item.permissions,
        requiredRoles: item.roles.length > 0 ? item.roles : undefined,
        description: item.description,
        featureFlag: item.feature,
        isActive: true,
      },
    });
  }

  // Get ecommerce parent menu (only if ecommerce is enabled)
  let ecommerceMenu: any = null;
  if (flags.ecommerce) {
    ecommerceMenu = await db.dashboardMenu.findFirst({
      where: { key: 'ecommerce' },
    });
  }

  // ECOMMERCE SUB-MENU ITEMS
  const ecommerceItems = [
    {
      key: 'ecommerce-products',
      label: 'Products',
      icon: 'Package',
      route: '/dashboard/ecommerce/products',
      order: 1,
      permissions: ['products:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage product catalog',
    },
    {
      key: 'ecommerce-inventory',
      label: 'Inventory',
      icon: 'Package',
      route: '/dashboard/ecommerce/inventory',
      order: 2,
      permissions: ['inventory:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage product inventory and stock',
    },
    {
      key: 'ecommerce-orders',
      label: 'Orders',
      icon: 'ShoppingCart',
      route: '/dashboard/ecommerce/orders',
      order: 3,
      permissions: ['orders:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage customer orders',
    },
    {
      key: 'ecommerce-customers',
      label: 'Customers',
      icon: 'Users',
      route: '/dashboard/ecommerce/customers',
      order: 4,
      permissions: ['customers:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage customer accounts',
    },
    {
      key: 'ecommerce-categories',
      label: 'Categories',
      icon: 'Layers',
      route: '/dashboard/ecommerce/categories',
      order: 5,
      permissions: ['categories:read'],
      roles: ['Admin', 'Manager', 'Super Admin'],
      description: 'Manage product categories',
    },
    {
      key: 'ecommerce-shipping',
      label: 'Shipping Methods',
      icon: 'Truck',
      route: '/dashboard/ecommerce/shipping',
      order: 6,
      permissions: ['shipping:read'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage shipping methods and rates',
    },
    {
      key: 'ecommerce-payments',
      label: 'Payment Methods',
      icon: 'CreditCard',
      route: '/dashboard/ecommerce/payments',
      order: 7,
      permissions: ['payments:read'],
      roles: ['Admin', 'Super Admin'],
      description: 'Manage payment methods',
    },
  ];

  // Create ecommerce sub-items (only if ecommerce is enabled)
  if (ecommerceMenu && flags.ecommerce) {
    for (const item of ecommerceItems) {
      await db.dashboardMenu.upsert({
        where: { key: item.key },
        update: {},
        create: {
          key: item.key,
          label: item.label,
          icon: item.icon,
          route: item.route,
          pageType: 'HARDCODED',
          order: item.order,
          parentId: ecommerceMenu.id,
          requiredPermissions: item.permissions,
          requiredRoles: item.roles.length > 0 ? item.roles : undefined,
          description: item.description,
          isActive: true,
        },
      });
    }
  } else if (!flags.ecommerce) {
    console.log(
      '⏭️  E-commerce feature disabled, skipping ecommerce sub-items',
    );
  }

  console.log(
    '✅ Dashboard menus seeded successfully with role-based access control',
  );
}
