import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseMenuVisibility() {
  console.log('🔍 Diagnosing Menu Visibility Issues\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Role: ${user.role.name}`);
      
      const permissions = user.role.rolePermissions.map(rp => rp.permission.name);
      console.log(`   Permissions (${permissions.length}):`);
      permissions.forEach(p => console.log(`     - ${p}`));
    }

    // Get all menus
    console.log('\n\n📋 All Dashboard Menus:\n');
    const menus = await prisma.dashboardMenu.findMany({
      orderBy: { order: 'asc' },
    });

    console.log(`Found ${menus.length} menus\n`);

    for (const menu of menus) {
      console.log(`\n📌 ${menu.label} (${menu.key})`);
      console.log(`   Route: ${menu.route}`);
      console.log(`   Active: ${menu.isActive}`);
      console.log(`   Order: ${menu.order}`);
      console.log(`   Parent ID: ${menu.parentId || 'None (top-level)'}`);
      console.log(`   Required Roles: ${menu.requiredRoles.length > 0 ? menu.requiredRoles.join(', ') : 'None'}`);
      console.log(`   Required Permissions: ${menu.requiredPermissions.length > 0 ? menu.requiredPermissions.join(', ') : 'None'}`);
      console.log(`   Feature Flag: ${menu.featureFlag || 'None'}`);
    }

    // Check ecommerce settings
    console.log('\n\n⚙️  E-commerce Settings:\n');
    const ecommerceSettings = await prisma.ecommerceSettings.findMany();
    
    if (ecommerceSettings.length === 0) {
      console.log('   ⚠️  No e-commerce settings found!');
      console.log('   This means ecommerce feature flag will be disabled.');
    } else {
      for (const settings of ecommerceSettings) {
        console.log(`\n   Scope: ${settings.scope}`);
        console.log(`   User ID: ${settings.userId || 'Global'}`);
        console.log(`   Track Inventory: ${settings.trackInventory}`);
        console.log(`   Shipping Enabled: ${settings.shippingEnabled}`);
        console.log(`   Portal Enabled: ${settings.portalEnabled}`);
      }
    }

    // Simulate menu filtering for first user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n\n🧪 Simulating Menu Filtering for: ${testUser.email}\n`);
      
      const userRoles = [testUser.role.name];
      const userPermissions = testUser.role.rolePermissions.map(rp => rp.permission.name);
      
      const ecommerceSetting = await prisma.ecommerceSettings.findFirst({
        where: {
          OR: [
            { scope: 'global' },
            { userId: testUser.id },
          ],
        },
        orderBy: { scope: 'desc' },
      });

      console.log(`   User Roles: ${userRoles.join(', ')}`);
      console.log(`   User Permissions: ${userPermissions.join(', ')}`);
      console.log(`   Track Inventory: ${ecommerceSetting?.trackInventory || false}\n`);

      const activeMenus = menus.filter(m => m.isActive);
      console.log(`   Active Menus: ${activeMenus.length}/${menus.length}\n`);

      for (const menu of activeMenus) {
        const reasons: string[] = [];
        let visible = true;

        // Check role requirement
        if (menu.requiredRoles.length > 0) {
          const hasRole = menu.requiredRoles.some(r => userRoles.includes(r));
          if (!hasRole) {
            visible = false;
            reasons.push(`Missing role: ${menu.requiredRoles.join(' or ')}`);
          }
        }

        // Check permission requirement
        if (menu.requiredPermissions.length > 0) {
          const hasAllPermissions = menu.requiredPermissions.every(p => userPermissions.includes(p));
          if (!hasAllPermissions) {
            visible = false;
            const missingPerms = menu.requiredPermissions.filter(p => !userPermissions.includes(p));
            reasons.push(`Missing permissions: ${missingPerms.join(', ')}`);
          }
        }

        // Check feature flag
        if (menu.featureFlag) {
          if (menu.featureFlag === 'ecommerce' && !ecommerceSetting) {
            visible = false;
            reasons.push('Ecommerce settings not found');
          }
          if (menu.featureFlag === 'blog') {
            // Blog feature flag check - assuming always enabled for now
          }
        }

        const status = visible ? '✅ VISIBLE' : '❌ HIDDEN';
        console.log(`   ${status} ${menu.label}`);
        if (!visible && reasons.length > 0) {
          reasons.forEach(r => console.log(`      → ${r}`));
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseMenuVisibility();
