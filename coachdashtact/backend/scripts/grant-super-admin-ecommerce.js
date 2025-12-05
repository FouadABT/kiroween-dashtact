const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function grantEcommercePermissions() {
  try {
    console.log('🔧 Granting e-commerce permissions to Super Admin...\n');

    // Get Super Admin role
    const superAdminRole = await prisma.userRole.findFirst({
      where: { name: 'Super Admin' },
    });

    if (!superAdminRole) {
      console.log('❌ Super Admin role not found!');
      return;
    }

    // Get all e-commerce permissions
    const ecommercePermissions = await prisma.permission.findMany({
      where: {
        resource: {
          in: ['orders', 'products', 'customers', 'inventory'],
        },
      },
    });

    console.log(`Found ${ecommercePermissions.length} e-commerce permissions\n`);

    // Get existing permissions for Super Admin
    const existingPerms = await prisma.rolePermission.findMany({
      where: { roleId: superAdminRole.id },
    });

    const existingPermIds = existingPerms.map(p => p.permissionId);

    // Add missing permissions
    const newPermissions = ecommercePermissions.filter(
      p => !existingPermIds.includes(p.id)
    );

    if (newPermissions.length > 0) {
      for (const perm of newPermissions) {
        await prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: perm.id,
          },
        });
        console.log(`✓ Added: ${perm.name}`);
      }
      console.log(`\n✅ Added ${newPermissions.length} permissions to Super Admin`);
    } else {
      console.log('✅ Super Admin already has all e-commerce permissions');
    }

    // Show summary
    const totalPerms = await prisma.rolePermission.count({
      where: { roleId: superAdminRole.id },
    });

    console.log(`\n📊 Super Admin now has ${totalPerms} total permissions`);
    console.log('\n💡 Next steps:');
    console.log('   1. Log out and log back in to refresh your token');
    console.log('   2. The e-commerce widgets should now work!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

grantEcommercePermissions();
