import { PrismaClient } from '@prisma/client';

export async function seedCronJobsPermissions(prisma: PrismaClient) {
  console.log('Seeding cron jobs permissions...');

  // Create system.cron.manage permission
  const cronPermission = await prisma.permission.upsert({
    where: { name: 'system.cron.manage' },
    update: {},
    create: {
      name: 'system.cron.manage',
      description: 'Manage cron jobs (view, enable, disable, trigger, edit schedules)',
      resource: 'system',
      action: 'cron.manage',
    },
  });

  console.log('Created permission:', cronPermission.name);

  // Assign to Super Admin role
  const superAdminRole = await prisma.userRole.findFirst({
    where: { name: 'Super Admin' },
  });

  if (superAdminRole) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: cronPermission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: cronPermission.id,
      },
    });

    console.log('Assigned system.cron.manage permission to Super Admin role');
  } else {
    console.warn('Super Admin role not found, skipping permission assignment');
  }

  console.log('Cron jobs permissions seeded successfully');
}
