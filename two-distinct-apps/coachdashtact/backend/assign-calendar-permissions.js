const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignCalendarPermissions() {
  console.log('Assigning calendar permissions to roles...');

  // Get roles
  const superAdmin = await prisma.userRole.findUnique({ where: { name: 'Super Admin' } });
  const admin = await prisma.userRole.findUnique({ where: { name: 'Admin' } });
  const manager = await prisma.userRole.findUnique({ where: { name: 'Manager' } });
  const user = await prisma.userRole.findUnique({ where: { name: 'User' } });

  // Get calendar permissions
  const calendarPerms = await prisma.permission.findMany({
    where: { resource: 'calendar' }
  });

  for (const perm of calendarPerms) {
    // Super Admin gets admin permission
    if (perm.action === 'admin' && superAdmin) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdmin.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: superAdmin.id,
          permissionId: perm.id
        }
      });
      console.log('✓ Assigned', perm.name, 'to Super Admin');
    }

    // Admin gets create, read, update, delete
    if (['create', 'read', 'update', 'delete'].includes(perm.action) && admin) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: admin.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: admin.id,
          permissionId: perm.id
        }
      });
      console.log('✓ Assigned', perm.name, 'to Admin');
    }

    // Manager gets create, read, update
    if (['create', 'read', 'update'].includes(perm.action) && manager) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: manager.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: manager.id,
          permissionId: perm.id
        }
      });
      console.log('✓ Assigned', perm.name, 'to Manager');
    }

    // User gets create, read
    if (['create', 'read'].includes(perm.action) && user) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: user.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: user.id,
          permissionId: perm.id
        }
      });
      console.log('✓ Assigned', perm.name, 'to User');
    }
  }

  console.log('✅ Calendar permissions assigned successfully');
  await prisma.$disconnect();
}

assignCalendarPermissions().catch(console.error);
