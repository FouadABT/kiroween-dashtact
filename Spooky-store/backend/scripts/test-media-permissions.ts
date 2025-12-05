import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing media library permissions...\n');

  // Get test users with different roles
  const adminUser = await prisma.user.findFirst({
    where: { 
      role: { 
        name: { in: ['Admin', 'Super Admin'] } 
      } 
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const regularUser = await prisma.user.findFirst({
    where: { role: { name: 'User' } },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!adminUser) {
    console.log('⚠️  No admin user found. Please create an admin user first.');
    return;
  }

  if (!regularUser) {
    console.log('⚠️  No regular user found. Please create a regular user first.');
    return;
  }

  // Extract permissions
  const adminPermissions = adminUser.role.rolePermissions.map(
    (rp) => rp.permission.name,
  );
  const userPermissions = regularUser.role.rolePermissions.map(
    (rp) => rp.permission.name,
  );

  console.log('👤 Admin User Permissions:');
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Role: ${adminUser.role.name}`);
  console.log('   Media Permissions:');
  const adminMediaPerms = adminPermissions.filter((p) => p.startsWith('media:'));
  adminMediaPerms.forEach((p) => console.log(`     ✅ ${p}`));
  console.log();

  console.log('👤 Regular User Permissions:');
  console.log(`   Email: ${regularUser.email}`);
  console.log(`   Role: ${regularUser.role.name}`);
  console.log('   Media Permissions:');
  const userMediaPerms = userPermissions.filter((p) => p.startsWith('media:'));
  userMediaPerms.forEach((p) => console.log(`     ✅ ${p}`));
  console.log();

  // Test permission checks
  console.log('🔍 Permission Check Results:\n');

  const testPermissions = [
    'media:view',
    'media:view:all',
    'media:upload',
    'media:edit:own',
    'media:edit:all',
    'media:delete:own',
    'media:delete:all',
  ];

  console.log('Permission                | Admin | User');
  console.log('--------------------------|-------|------');
  testPermissions.forEach((perm) => {
    const adminHas = adminPermissions.includes(perm);
    const userHas = userPermissions.includes(perm);
    const adminIcon = adminHas ? '✅' : '❌';
    const userIcon = userHas ? '✅' : '❌';
    console.log(
      `${perm.padEnd(25)} | ${adminIcon}    | ${userIcon}`,
    );
  });

  console.log('\n✨ Permission test completed!');
  console.log('\n📋 Summary:');
  console.log(`   - Admin has ${adminMediaPerms.length}/7 media permissions`);
  console.log(`   - User has ${userMediaPerms.length}/7 media permissions`);
  console.log('\n✅ Expected behavior:');
  console.log('   - Admin: Full access (all 7 permissions)');
  console.log('   - User: Basic access (media:view, media:upload only)');
}

main()
  .catch((e) => {
    console.error('❌ Error testing permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
