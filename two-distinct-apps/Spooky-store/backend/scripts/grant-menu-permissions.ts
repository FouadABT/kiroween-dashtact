import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantMenuPermissions() {
  console.log('🔐 Granting menu management permissions to Super Admins...\n');

  try {
    // Find Super Admin role
    const superAdminRole = await prisma.userRole.findFirst({
      where: { name: 'Super Admin' },
      include: { 
        rolePermissions: {
          include: {
            permission: true
          }
        }
      },
    });

    if (!superAdminRole) {
      console.error('❌ Super Admin role not found!');
      process.exit(1);
    }

    console.log(`✅ Found Super Admin role (ID: ${superAdminRole.id})`);

    // Find menu management permissions
    const menuPermissions = await prisma.permission.findMany({
      where: {
        name: {
          in: ['menus:view', 'menus:create', 'menus:update', 'menus:delete'],
        },
      },
    });

    if (menuPermissions.length === 0) {
      console.error(
        '❌ Menu management permissions not found! Run prisma:seed first.',
      );
      process.exit(1);
    }

    console.log(
      `✅ Found ${menuPermissions.length} menu management permissions`,
    );

    // Get existing permission IDs for Super Admin
    const existingPermissionIds = superAdminRole.rolePermissions.map((rp) => rp.permission.id);

    // Filter out permissions that are already assigned
    const newPermissions = menuPermissions.filter(
      (p) => !existingPermissionIds.includes(p.id),
    );

    if (newPermissions.length === 0) {
      console.log(
        '\n✅ All menu management permissions already assigned to Super Admin role',
      );
    } else {
      // Assign new permissions to Super Admin role via RolePermission
      for (const permission of newPermissions) {
        await prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });
      }

      console.log(
        `\n✅ Assigned ${newPermissions.length} new menu management permissions to Super Admin role:`,
      );
      newPermissions.forEach((p) => {
        console.log(`   - ${p.name}: ${p.description}`);
      });
    }

    // Find all users with Super Admin role
    const superAdmins = await prisma.user.findMany({
      where: {
        roleId: superAdminRole.id,
      },
      include: {
        role: true,
      },
    });

    console.log(`\n✅ Found ${superAdmins.length} Super Admin user(s):`);
    superAdmins.forEach((user) => {
      console.log(`   - ${user.email} (${user.name || 'No name'})`);
    });

    // Verify permissions
    console.log('\n🔍 Verifying permission assignments...');

    const updatedRole = await prisma.userRole.findUnique({
      where: { id: superAdminRole.id },
      include: { 
        rolePermissions: {
          include: {
            permission: true
          }
        }
      },
    });

    if (!updatedRole) {
      console.error('❌ Failed to verify role after update!');
      process.exit(1);
    }

    const menuPermissionNames = menuPermissions.map((p) => p.name);
    const assignedMenuPermissions = updatedRole.rolePermissions
      .map(rp => rp.permission)
      .filter((p) => menuPermissionNames.includes(p.name));

    if (assignedMenuPermissions.length === menuPermissions.length) {
      console.log(
        '✅ All menu management permissions successfully assigned and verified!',
      );
    } else {
      console.error('❌ Permission verification failed!');
      console.error(
        `Expected ${menuPermissions.length} permissions, found ${assignedMenuPermissions.length}`,
      );
      process.exit(1);
    }

    console.log('\n✅ Menu permission migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Error granting menu permissions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

grantMenuPermissions();
