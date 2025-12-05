/**
 * Update Script: Dashboard Customization Permissions
 * 
 * This script updates existing roles to include the new widget and layout permissions.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDashboardPermissions() {
  console.log('🔄 Updating Dashboard Customization Permissions...\n');

  try {
    // Define the permissions to add for each role
    const rolePermissions = {
      'Super Admin': [], // Already has *:* so no need to add specific permissions
      'Admin': [
        'widgets:read',
        'widgets:write',
        'widgets:delete',
        'layouts:read',
        'layouts:write',
        'layouts:delete',
      ],
      'Manager': [
        'widgets:read',
        'layouts:read',
        'layouts:write',
      ],
      'User': [
        'widgets:read',
        'layouts:read',
        'layouts:write',
      ],
    };

    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      if (permissionNames.length === 0) {
        console.log(`⏭️  Skipping ${roleName} (has *:* permission)`);
        continue;
      }

      // Find the role
      const role = await prisma.userRole.findUnique({
        where: { name: roleName },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        console.log(`❌ Role not found: ${roleName}`);
        continue;
      }

      console.log(`\n📝 Updating ${roleName}...`);

      // Get existing permission names
      const existingPermissions = role.rolePermissions.map(
        (rp) => rp.permission.name
      );

      // Add missing permissions
      for (const permName of permissionNames) {
        if (existingPermissions.includes(permName)) {
          console.log(`  ⏭️  ${permName} - Already assigned`);
          continue;
        }

        // Find the permission
        const permission = await prisma.permission.findUnique({
          where: { name: permName },
        });

        if (!permission) {
          console.log(`  ❌ ${permName} - Permission not found`);
          continue;
        }

        // Check if role-permission relationship already exists
        const existing = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
        });

        if (existing) {
          console.log(`  ⏭️  ${permName} - Relationship already exists`);
          continue;
        }

        // Create the role-permission relationship
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });

        console.log(`  ✅ ${permName} - Added`);
      }
    }

    console.log('\n✨ Dashboard permissions updated successfully!\n');
  } catch (error) {
    console.error('❌ Error updating permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateDashboardPermissions().catch((error) => {
  console.error('Failed to update permissions:', error);
  process.exit(1);
});
