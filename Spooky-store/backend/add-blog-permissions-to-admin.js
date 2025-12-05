const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Updating Admin role with blog permissions...');

  // Get Admin role
  const adminRole = await prisma.userRole.findUnique({
    where: { name: 'Admin' },
  });

  if (!adminRole) {
    console.error('❌ Admin role not found');
    process.exit(1);
  }

  // Blog permissions to add
  const blogPermissions = [
    'blog:read',
    'blog:write',
    'blog:delete',
    'blog:publish',
  ];

  for (const permissionName of blogPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) {
      console.log(`⚠️  Permission not found: ${permissionName}`);
      continue;
    }

    // Check if already assigned
    const existingAssignment = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
    });

    if (!existingAssignment) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
      console.log(`✅ Assigned permission: ${permissionName}`);
    } else {
      console.log(`⏭️  Permission already assigned: ${permissionName}`);
    }
  }

  console.log('✨ Admin role updated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error updating Admin role:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
