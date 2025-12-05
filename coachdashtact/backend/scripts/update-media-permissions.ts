import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Updating role permissions for media library...');

  // Get all roles
  const adminRole = await prisma.userRole.findUnique({
    where: { name: 'Admin' },
  });

  const superAdminRole = await prisma.userRole.findUnique({
    where: { name: 'Super Admin' },
  });

  const userRole = await prisma.userRole.findUnique({
    where: { name: 'User' },
  });

  // Get media permissions
  const mediaPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'media:view',
          'media:view:all',
          'media:upload',
          'media:edit:own',
          'media:edit:all',
          'media:delete:own',
          'media:delete:all',
        ],
      },
    },
  });

  // Assign all media permissions to Admin role
  if (adminRole) {
    console.log('Assigning media permissions to Admin role...');
    for (const permission of mediaPermissions) {
      const existing = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        });
        console.log(`  ✅ Assigned ${permission.name} to Admin`);
      } else {
        console.log(`  ⏭️  ${permission.name} already assigned to Admin`);
      }
    }
  }

  // Assign all media permissions to Super Admin role (they have *:* but let's be explicit)
  if (superAdminRole) {
    console.log('Assigning media permissions to Super Admin role...');
    for (const permission of mediaPermissions) {
      const existing = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });
        console.log(`  ✅ Assigned ${permission.name} to Super Admin`);
      } else {
        console.log(`  ⏭️  ${permission.name} already assigned to Super Admin`);
      }
    }
  }

  // Assign basic media permissions to User role
  if (userRole) {
    console.log('Assigning basic media permissions to User role...');
    const userMediaPermissions = mediaPermissions.filter((p) =>
      ['media:view', 'media:upload'].includes(p.name),
    );

    for (const permission of userMediaPermissions) {
      const existing = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        });
        console.log(`  ✅ Assigned ${permission.name} to User`);
      } else {
        console.log(`  ⏭️  ${permission.name} already assigned to User`);
      }
    }
  }

  console.log('✨ Media permissions update completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error updating permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
