import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMenuPermissions() {
  console.log('🔍 Verifying menu management permissions...\n');

  try {
    // Check if permissions exist
    const menuPermissions = await prisma.permission.findMany({
      where: {
        name: {
          in: ['menus:view', 'menus:create', 'menus:update', 'menus:delete'],
        },
      },
    });

    console.log(`✅ Found ${menuPermissions.length}/4 menu permissions:`);
    menuPermissions.forEach((p) => {
      console.log(`   - ${p.name}: ${p.description}`);
    });

    // Check Super Admin role permissions
    const superAdminRole = await prisma.userRole.findFirst({
      where: { name: 'Super Admin' },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!superAdminRole) {
      console.error('\n❌ Super Admin role not found!');
      process.exit(1);
    }

    const superAdminMenuPerms = superAdminRole.rolePermissions
      .map((rp) => rp.permission)
      .filter((p) => p.name.startsWith('menus:'));

    console.log(
      `\n✅ Super Admin has ${superAdminMenuPerms.length}/4 menu permissions:`,
    );
    superAdminMenuPerms.forEach((p) => {
      console.log(`   - ${p.name}`);
    });

    if (superAdminMenuPerms.length === 4) {
      console.log('\n✅ All menu permissions correctly assigned!');
    } else {
      console.error('\n❌ Some menu permissions are missing!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error verifying permissions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMenuPermissions();
