import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addLandingPermissions() {
  console.log('🔧 Adding landing and pages permissions to Admin role...');

  try {
    // Get Admin role
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Admin' },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!adminRole) {
      console.error('❌ Admin role not found');
      return;
    }

    console.log(`✅ Found Admin role: ${adminRole.id}`);

    // Get landing and pages permissions
    const permissionsToAdd = [
      'landing:read',
      'landing:write',
      'landing:publish',
      'pages:read',
      'pages:write',
      'pages:delete',
      'pages:publish',
    ];

    const permissions = await prisma.permission.findMany({
      where: {
        name: {
          in: permissionsToAdd,
        },
      },
    });

    console.log(`✅ Found ${permissions.length} permissions to add`);

    // Get existing permission IDs for this role
    const existingPermissionIds = new Set(
      adminRole.rolePermissions.map((rp) => rp.permissionId),
    );

    // Add missing permissions
    let addedCount = 0;
    for (const permission of permissions) {
      if (!existingPermissionIds.has(permission.id)) {
        await prisma.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        });
        console.log(`  ✅ Added: ${permission.name}`);
        addedCount++;
      } else {
        console.log(`  ⏭️  Already exists: ${permission.name}`);
      }
    }

    console.log(`\n✨ Successfully added ${addedCount} permissions to Admin role`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addLandingPermissions()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
