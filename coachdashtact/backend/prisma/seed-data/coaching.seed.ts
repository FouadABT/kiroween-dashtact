import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCoachingPermissions() {
  console.log('🏋️ Seeding coaching platform permissions...');

  // Define all coaching permissions
  const coachingPermissions = [
    // Coach permissions
    {
      name: 'members:read',
      description: 'View member profiles',
      resource: 'members',
      action: 'read',
    },
    {
      name: 'members:write',
      description: 'Create and update member profiles',
      resource: 'members',
      action: 'write',
    },
    {
      name: 'members:assign',
      description: 'Assign members to coaches',
      resource: 'members',
      action: 'assign',
    },
    {
      name: 'sessions:read',
      description: 'View coaching sessions',
      resource: 'sessions',
      action: 'read',
    },
    {
      name: 'sessions:write',
      description: 'Create and update coaching sessions',
      resource: 'sessions',
      action: 'write',
    },
    {
      name: 'sessions:complete',
      description: 'Mark sessions as complete',
      resource: 'sessions',
      action: 'complete',
    },
    {
      name: 'sessions:cancel',
      description: 'Cancel coaching sessions',
      resource: 'sessions',
      action: 'cancel',
    },
    {
      name: 'bookings:read',
      description: 'View session bookings',
      resource: 'bookings',
      action: 'read',
    },
    {
      name: 'bookings:manage',
      description: 'Manage session bookings',
      resource: 'bookings',
      action: 'manage',
    },
    {
      name: 'availability:read',
      description: 'View coach availability',
      resource: 'availability',
      action: 'read',
    },
    {
      name: 'availability:manage',
      description: 'Manage coach availability',
      resource: 'availability',
      action: 'manage',
    },
    {
      name: 'groups:create',
      description: 'Create group conversations for sessions',
      resource: 'groups',
      action: 'create',
    },
    {
      name: 'messaging:access',
      description: 'Access messaging system to send and receive messages',
      resource: 'messaging',
      action: 'access',
    },
    {
      name: 'notifications:read',
      description: 'View and manage own notifications',
      resource: 'notifications',
      action: 'read',
    },
    // Member permissions
    {
      name: 'profile:read-own',
      description: 'View own member profile',
      resource: 'profile',
      action: 'read-own',
    },
    {
      name: 'profile:update-own',
      description: 'Update own member profile',
      resource: 'profile',
      action: 'update-own',
    },
    {
      name: 'sessions:read-own',
      description: 'View own coaching sessions',
      resource: 'sessions',
      action: 'read-own',
    },
    {
      name: 'sessions:rate',
      description: 'Rate completed sessions',
      resource: 'sessions',
      action: 'rate',
    },
    {
      name: 'bookings:create',
      description: 'Create session bookings',
      resource: 'bookings',
      action: 'create',
    },
    {
      name: 'bookings:cancel-own',
      description: 'Cancel own session bookings',
      resource: 'bookings',
      action: 'cancel-own',
    },
    {
      name: 'messages:coach',
      description: 'Message assigned coach',
      resource: 'messages',
      action: 'coach',
    },
  ];

  // Create permissions
  for (const permission of coachingPermissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
  }

  console.log(`✅ Created ${coachingPermissions.length} coaching permissions`);

  // Get roles
  const coachRole = await prisma.userRole.findUnique({
    where: { name: 'Coach' },
  });
  const memberRole = await prisma.userRole.findUnique({
    where: { name: 'Member' },
  });
  const adminRole = await prisma.userRole.findUnique({
    where: { name: 'Admin' },
  });
  const superAdminRole = await prisma.userRole.findUnique({
    where: { name: 'Super Admin' },
  });

  // Create Coach role if it doesn't exist
  let coachRoleId = coachRole?.id;
  if (!coachRole) {
    const newCoachRole = await prisma.userRole.create({
      data: {
        name: 'Coach',
        description: 'Coach role for coaching platform',
        isSystemRole: true,
      },
    });
    coachRoleId = newCoachRole.id;
    console.log('✅ Created Coach role');
  }

  // Create Member role if it doesn't exist
  let memberRoleId = memberRole?.id;
  if (!memberRole) {
    const newMemberRole = await prisma.userRole.create({
      data: {
        name: 'Member',
        description: 'Member role for coaching platform',
        isSystemRole: true,
      },
    });
    memberRoleId = newMemberRole.id;
    console.log('✅ Created Member role');
  }

  // Assign permissions to Coach role
  if (coachRoleId) {
    const coachPermissionNames = [
      'members:read',
      'members:write',
      'members:assign',
      'sessions:read',
      'sessions:write',
      'sessions:complete',
      'sessions:cancel',
      'bookings:read',
      'bookings:manage',
      'availability:read',
      'availability:manage',
      'groups:create',
      'messaging:access',
      'notifications:read',
    ];

    for (const permName of coachPermissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: coachRoleId,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: coachRoleId,
            permissionId: permission.id,
          },
        });
      }
    }
    console.log(`✅ Assigned ${coachPermissionNames.length} permissions to Coach role`);
  }

  // Assign permissions to Member role
  if (memberRoleId) {
    const memberPermissionNames = [
      'profile:read-own',
      'profile:update-own',
      'sessions:read-own',
      'sessions:rate',
      'bookings:create',
      'bookings:cancel-own',
      'messages:coach',
      'availability:read',
      'messaging:access',
      'notifications:read',
    ];

    for (const permName of memberPermissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: memberRoleId,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: memberRoleId,
            permissionId: permission.id,
          },
        });
      }
    }
    console.log(`✅ Assigned ${memberPermissionNames.length} permissions to Member role`);
  }

  // Assign all coaching permissions to Admin role
  if (adminRole) {
    for (const permission of coachingPermissions) {
      const perm = await prisma.permission.findUnique({
        where: { name: permission.name },
      });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        });
      }
    }
    console.log(`✅ Assigned all coaching permissions to Admin role`);
  }

  // Assign all coaching permissions to Super Admin role
  if (superAdminRole) {
    for (const permission of coachingPermissions) {
      const perm = await prisma.permission.findUnique({
        where: { name: permission.name },
      });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: superAdminRole.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: superAdminRole.id,
            permissionId: perm.id,
          },
        });
      }
    }
    console.log(`✅ Assigned all coaching permissions to Super Admin role`);
  }

  console.log('✅ Coaching platform permissions seeded successfully');
}
