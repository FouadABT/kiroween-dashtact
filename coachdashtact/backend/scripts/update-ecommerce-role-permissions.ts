import { PrismaClient } from '@prisma/client';
import { DEFAULT_ROLES } from '../prisma/seed-data/auth.seed';

const prisma = new PrismaClient();

async function updateRolePermissions() {
  console.log('🔄 Updating role permissions for e-commerce...\n');

  for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
    console.log(`Processing role: ${roleData.name}`);
    
    const role = await prisma.userRole.findUnique({
      where: { name: roleData.name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      console.log(`  ⚠️  Role not found: ${roleData.name}`);
      continue;
    }

    // Get current permission names
    const currentPermissions = role.rolePermissions.map(rp => rp.permission.name);

    // Find permissions to add
    const permissionsToAdd = roleData.permissions.filter(
      perm => !currentPermissions.includes(perm)
    );

    if (permissionsToAdd.length === 0) {
      console.log(`  ✅ No new permissions to add\n`);
      continue;
    }

    console.log(`  📝 Adding ${permissionsToAdd.length} new permissions:`);

    for (const permissionName of permissionsToAdd) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (!permission) {
        console.log(`    ⚠️  Permission not found: ${permissionName}`);
        continue;
      }

      const existingAssignment = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
      });

      if (!existingAssignment) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
        console.log(`    ✅ Added: ${permissionName}`);
      }
    }

    console.log('');
  }

  console.log('✨ Role permissions updated successfully!');
}

updateRolePermissions()
  .catch((error) => {
    console.error('❌ Error updating role permissions:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
