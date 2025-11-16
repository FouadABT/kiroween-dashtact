/**
 * Dashboard Menu Seed Data
 *
 * This file defines the default dashboard menu structure that will be migrated
 * from the hardcoded NavigationContext to the database-driven DashboardMenu system.
 *
 * Menu Structure:
 * - Dashboard (WIDGET_BASED)
 * - Analytics (WIDGET_BASED)
 * - E-commerce (parent with HARDCODED children)
 *   - Products
 *   - Orders
 *   - Customers
 *   - Inventory
 * - Pages (HARDCODED)
 * - Blog (HARDCODED)
 * - Settings (HARDCODED)
 */

export interface MenuDefinition {
  key: string;
  label: string;
  icon: string;
  route: string;
  order: number;
  parentId?: string;
  pageType: 'WIDGET_BASED' | 'HARDCODED' | 'CUSTOM' | 'EXTERNAL';
  pageIdentifier?: string;
  componentPath?: string;
  isActive: boolean;
  requiredPermissions: string[];
  requiredRoles: string[];
  featureFlag?: string;
  description?: string;
  badge?: string;
}

/**
 * Default dashboard menu items
 * These will be created during database seeding
 */
export const DEFAULT_DASHBOARD_MENUS: MenuDefinition[] = [
  // Dashboard - Widget-based customizable dashboard
  {
    key: 'main-dashboard',
    label: 'Dashboard',
    icon: 'Home',
    route: '/dashboard',
    order: 1,
    pageType: 'WIDGET_BASED',
    pageIdentifier: 'main-dashboard',
    isActive: true,
    requiredPermissions: [],
    requiredRoles: [],
    description: 'Main dashboard with customizable widgets',
  },

  // Analytics - Widget-based analytics dashboard
  {
    key: 'analytics-dashboard',
    label: 'Analytics',
    icon: 'BarChart3',
    route: '/dashboard/analytics',
    order: 2,
    pageType: 'WIDGET_BASED',
    pageIdentifier: 'analytics-dashboard',
    isActive: true,
    requiredPermissions: [],
    requiredRoles: [],
    description: 'Analytics dashboard with data visualization widgets',
  },

  // E-commerce Parent Menu
  {
    key: 'ecommerce',
    label: 'E-Commerce',
    icon: 'ShoppingCart',
    route: '/dashboard/ecommerce',
    order: 3,
    pageType: 'HARDCODED',
    componentPath: '/dashboard/ecommerce/page',
    isActive: true,
    requiredPermissions: [],
    requiredRoles: [],
    featureFlag: 'ecommerce',
    description: 'E-commerce management section',
  },

  // E-commerce - Products
  {
    key: 'ecommerce-products',
    label: 'Products',
    icon: 'Package',
    route: '/dashboard/ecommerce/products',
    order: 1,
    parentId: 'ecommerce',
    pageType: 'HARDCODED',
    componentPath: '/dashboard/ecommerce/products/page',
    isActive: true,
    requiredPermissions: ['products:read'],
    requiredRoles: [],
    featureFlag: 'ecommerce',
    description: 'Manage products and inventory',
  },

  // E-commerce - Orders
  {
    key: 'ecommerce-orders',
    label: 'Orders',
    icon: 'ShoppingBag',
    route: '/dashboard/ecommerce/orders',
    order: 2,
    parentId: 'ecommerce',
    pageType: 'HARDCODED',
    componentPath: '/dashboard/ecommerce/orders/page',
    isActive: true,
    requiredPermissions: ['orders:read'],
    requiredRoles: [],
    featureFlag: 'ecommerce',
    description: 'View and manage customer orders',
  },

  // E-commerce - Customers
  {
    key: 'ecommerce-customers',
    label: 'Customers',
    icon: 'Users',
    route: '/dashboard/ecommerce/customers',
    order: 3,
    parentId: 'ecommerce',
    pageType: 'HARDCODED',
    componentPath: '/dashboard/ecommerce/customers/page',
    isActive: true,
    requiredPermissions: ['customers:read'],
    requiredRoles: [],
    featureFlag: 'ecommerce',
    description: 'Manage customer information',
  },

  // E-commerce - Inventory
  {
    key: 'ecommerce-inventory',
    label: 'Inventory',
    icon: 'Warehouse',
    route: '/dashboard/ecommerce/inventory',
    order: 4,
    parentId: 'ecommerce',
    pageType: 'HARDCODED',
    componentPath: '/dashboard/ecommerce/inventory/page',
    isActive: true,
    requiredPermissions: ['inventory:read'],
    requiredRoles: [],
    featureFlag: 'ecommerce',
    description: 'Track and manage inventory levels',
  },

  // Pages
  {
    key: 'pages',
    label: 'Pages',
    icon: 'FileEdit',
    route: '/dashboard/pages',
    order: 4,
    pageType: 'HARDCODED',
    componentPath: '/dashboard/pages/page',
    isActive: true,
    requiredPermissions: ['pages:read'],
    requiredRoles: [],
    description: 'Manage custom pages and content',
  },

  // Blog
  {
    key: 'blog',
    label: 'Blog',
    icon: 'FileText',
    route: '/dashboard/blog',
    order: 5,
    pageType: 'HARDCODED',
    componentPath: '/dashboard/blog/page',
    isActive: true,
    requiredPermissions: ['blog:read'],
    requiredRoles: [],
    featureFlag: 'blog',
    description: 'Manage blog posts and content',
  },

  // Settings
  {
    key: 'settings',
    label: 'Settings',
    icon: 'Settings',
    route: '/dashboard/settings',
    order: 6,
    pageType: 'HARDCODED',
    componentPath: '/dashboard/settings/page',
    isActive: true,
    requiredPermissions: ['settings:read'],
    requiredRoles: [],
    description: 'System and user settings',
  },

  // Settings - Menu Management (Super Admin Only)
  {
    key: 'settings-menus',
    label: 'Menu Management',
    icon: 'Menu',
    route: '/dashboard/settings/menus',
    order: 1,
    parentId: 'settings',
    pageType: 'HARDCODED',
    componentPath: '/dashboard/settings/menus/page',
    isActive: true,
    requiredPermissions: ['menus:view'],
    requiredRoles: ['Super Admin'],
    description: 'Manage dashboard menu structure (Super Admin only)',
  },

  // Settings - E-commerce Settings
  {
    key: 'settings-ecommerce',
    label: 'E-commerce',
    icon: 'ShoppingCart',
    route: '/dashboard/settings/ecommerce',
    order: 2,
    parentId: 'settings',
    pageType: 'HARDCODED',
    componentPath: '/dashboard/settings/ecommerce/page',
    isActive: true,
    requiredPermissions: ['settings:write'],
    requiredRoles: [],
    featureFlag: 'ecommerce',
    description: 'Configure e-commerce settings',
  },
];

/**
 * Helper function to seed dashboard menus
 * This will be called from the main seed script
 */
export async function seedDashboardMenus(prisma: any) {
  console.log('🔧 Seeding dashboard menus...');

  // First pass: Create all menus without parent relationships
  const createdMenus = new Map<string, any>();

  for (const menu of DEFAULT_DASHBOARD_MENUS) {
    const { parentId, ...menuData } = menu;
    
    const created = await prisma.dashboardMenu.upsert({
      where: { key: menu.key },
      update: {
        ...menuData,
        parentId: null, // Will be set in second pass
      },
      create: {
        ...menuData,
        parentId: null, // Will be set in second pass
      },
    });

    createdMenus.set(menu.key, created);
    console.log(`  ✓ Created/updated menu: ${menu.label} (${menu.key})`);
  }

  // Second pass: Update parent relationships
  for (const menu of DEFAULT_DASHBOARD_MENUS) {
    if (menu.parentId) {
      const parent = createdMenus.get(menu.parentId);
      const child = createdMenus.get(menu.key);

      if (parent && child) {
        await prisma.dashboardMenu.update({
          where: { id: child.id },
          data: { parentId: parent.id },
        });
        console.log(`  ✓ Linked ${menu.label} to parent ${parent.label}`);
      }
    }
  }

  console.log('✅ Dashboard menus seeded successfully');
  console.log(`   Total menus created: ${DEFAULT_DASHBOARD_MENUS.length}`);
}
