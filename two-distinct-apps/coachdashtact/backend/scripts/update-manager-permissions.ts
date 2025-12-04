import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateManagerPermissions() {
  console.log('🔄 Updating Manager role permissions...\n');

  // Find Manager role
  const managerRole = await prisma.userRole.findUnique({
    where: { name: 'Manager' },
  });

  if (!managerRole) {
    console.log('❌ Manager role not found');
    return;
  }

  // Find landing and pages read permissions
  const landingReadPerm = await prisma.permission.findUnique({
    where: { name: 'landing:read' },
  });

  const pagesReadPerm = await prisma.permission.findUnique({
    where: { name: 'pages:read' },
  });

  if (!landingReadPerm || !pagesReadPerm) {
    console.log('❌ Required permissions not found');
    return;
  }

  // Assign landing:read permission
  const existingLandingPerm = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: landingReadPerm.id,
      },
    },
  });

  if (!existingLandingPerm) {
    await prisma.rolePermission.create({
      data: {
        roleId: managerRole.id,
        permissionId: landingReadPerm.id,
      },
    });
    console.log('✅ Assigned landing:read to Manager');
  } else {
    console.log('⏭️  Manager already has landing:read');
  }

  // Assign pages:read permission
  const existingPagesPerm = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: pagesReadPerm.id,
      },
    },
  });

  if (!existingPagesPerm) {
    await prisma.rolePermission.create({
      data: {
        roleId: managerRole.id,
        permissionId: pagesReadPerm.id,
      },
    });
    console.log('✅ Assigned pages:read to Manager');
  } else {
    console.log('⏭️  Manager already has pages:read');
  }

  console.log('\n✨ Manager role permissions updated!');
  await prisma.$disconnect();
}

updateManagerPermissions().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
