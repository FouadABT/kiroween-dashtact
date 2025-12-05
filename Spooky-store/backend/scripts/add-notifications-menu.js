/**
 * Add Notifications Menu Item
 * 
 * Adds a Notifications menu item to the dashboard sidebar
 * between Pages and Blog (order 4.5)
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addNotificationsMenu() {
  console.log('📢 Adding Notifications menu item...\n');

  try {
    // Check if notifications menu already exists
    const existing = await prisma.dashboardMenu.findUnique({
      where: { key: 'notifications' },
    });

    if (existing) {
      console.log('⏭️  Notifications menu already exists');
      console.log(`   Label: ${existing.label}`);
      console.log(`   Route: ${existing.route}`);
      console.log(`   Order: ${existing.order}`);
      return;
    }

    // Get current menus to determine proper order
    const menus = await prisma.dashboardMenu.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
    });

    console.log('Current top-level menus:');
    menus.forEach(menu => {
      console.log(`  ${menu.order}. ${menu.label} (${menu.key})`);
    });

    // Find Pages and Blog to insert between them
    const pagesMenu = menus.find(m => m.key === 'pages');
    const blogMenu = menus.find(m => m.key === 'blog');

    let notificationsOrder = 4.5; // Default between Pages (4) and Blog (5)

    if (pagesMenu && blogMenu) {
      notificationsOrder = (pagesMenu.order + blogMenu.order) / 2;
      console.log(`\n📍 Inserting Notifications between Pages (${pagesMenu.order}) and Blog (${blogMenu.order})`);
      console.log(`   New order: ${notificationsOrder}`);
    }

    // Create the notifications menu
    const notificationsMenu = await prisma.dashboardMenu.create({
      data: {
        key: 'notifications',
        label: 'Notifications',
        icon: 'Bell',
        route: '/dashboard/notifications',
        order: notificationsOrder,
        parentId: null,
        pageType: 'HARDCODED',
        pageIdentifier: null,
        componentPath: '/dashboard/notifications/page',
        isActive: true,
        requiredPermissions: ['notifications:read'],
        requiredRoles: [],
        featureFlag: null,
        description: 'View and manage your notifications',
        badge: null,
      },
    });

    console.log('\n✅ Notifications menu created successfully!');
    console.log(`   ID: ${notificationsMenu.id}`);
    console.log(`   Label: ${notificationsMenu.label}`);
    console.log(`   Icon: ${notificationsMenu.icon}`);
    console.log(`   Route: ${notificationsMenu.route}`);
    console.log(`   Order: ${notificationsMenu.order}`);

    // Show updated menu order
    console.log('\n📋 Updated menu order:');
    const updatedMenus = await prisma.dashboardMenu.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
    });

    updatedMenus.forEach(menu => {
      const marker = menu.key === 'notifications' ? ' ← NEW' : '';
      console.log(`  ${menu.order}. ${menu.label} (${menu.key})${marker}`);
    });

    console.log('\n💡 Tip: Refresh your browser to see the new menu item!');

  } catch (error) {
    console.error('❌ Error adding notifications menu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addNotificationsMenu()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
