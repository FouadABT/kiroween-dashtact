const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addNotificationPermissions() {
  console.log('Adding notification permissions to roles...\n');

  const roles = ['User', 'Manager', 'Admin', 'USER', 'ADMIN', 'MODERATOR'];
  const permissions = {
    'User': ['notifications:read'],
    'Manager': ['notifications:read'],
    'Admin': ['notifications:read', 'notifications:write', 'notifications:delete'],
    'USER': ['notifications:read'],
    'ADMIN': ['notifications:read', 'notifications:write', 'notifications:delete'],
    'MODERATOR': ['notifications:read'],
  };

  for (const roleName of roles) {
    const role = await prisma.userRole.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      console.log(`❌ Role not found: ${roleName}`);
      continue;
    }

    console.log(`Processing role: ${roleName}`);

    for (const permissionName of permissions[roleName]) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (!permission) {
        console.log(`  ❌ Permission not found: ${permissionName}`);
        continue;
      }

      const existing = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
      });

      if (existing) {
        console.log(`  ⏭️  Already assigned: ${permissionName}`);
      } else {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
        console.log(`  ✅ Assigned: ${permissionName}`);
      }
    }
    console.log('');
  }

  console.log('✨ Done!');
}

addNotificationPermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
