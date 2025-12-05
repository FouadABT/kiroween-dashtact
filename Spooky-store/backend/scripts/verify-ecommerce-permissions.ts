import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEcommercePermissions() {
  console.log('🔍 Verifying E-Commerce Permissions...\n');

  // Get Admin role with permissions
  const admin = await prisma.userRole.findUnique({
    where: { name: 'Admin' },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  // Get Manager role with permissions
  const manager = await prisma.userRole.findUnique({
    where: { name: 'Manager' },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!admin || !manager) {
    console.error('❌ Could not find Admin or Manager role');
    process.exit(1);
  }

  // Filter e-commerce permissions
  const ecommerceResources = ['customers', 'products', 'orders', 'inventory'];
  
  const adminEcommercePerms = admin.rolePermissions
    .filter(rp => ecommerceResources.includes(rp.permission.resource))
    .map(rp => rp.permission.name)
    .sort();

  const managerEcommercePerms = manager.rolePermissions
    .filter(rp => ecommerceResources.includes(rp.permission.resource))
    .map(rp => rp.permission.name)
    .sort();

  console.log('✅ Admin E-Commerce Permissions:');
  adminEcommercePerms.forEach(perm => console.log(`   - ${perm}`));

  console.log('\n✅ Manager E-Commerce Permissions:');
  managerEcommercePerms.forEach(perm => console.log(`   - ${perm}`));

  // Verify Admin has all required permissions
  const requiredAdminPerms = [
    'customers:read', 'customers:write', 'customers:delete',
    'products:read', 'products:write', 'products:delete', 'products:publish',
    'orders:read', 'orders:write', 'orders:delete', 'orders:fulfill',
    'inventory:read', 'inventory:write',
  ];

  const missingAdminPerms = requiredAdminPerms.filter(
    perm => !adminEcommercePerms.includes(perm)
  );

  // Verify Manager has read/write but not delete
  const requiredManagerPerms = [
    'customers:read', 'customers:write',
    'products:read', 'products:write', 'products:publish',
    'orders:read', 'orders:write', 'orders:fulfill',
    'inventory:read', 'inventory:write',
  ];

  const forbiddenManagerPerms = [
    'customers:delete', 'products:delete', 'orders:delete'
  ];

  const missingManagerPerms = requiredManagerPerms.filter(
    perm => !managerEcommercePerms.includes(perm)
  );

  const incorrectManagerPerms = forbiddenManagerPerms.filter(
    perm => managerEcommercePerms.includes(perm)
  );

  console.log('\n📊 Verification Results:');
  
  if (missingAdminPerms.length === 0) {
    console.log('✅ Admin has all required e-commerce permissions');
  } else {
    console.log('❌ Admin missing permissions:', missingAdminPerms);
  }

  if (missingManagerPerms.length === 0 && incorrectManagerPerms.length === 0) {
    console.log('✅ Manager has correct e-commerce permissions (read/write, no delete)');
  } else {
    if (missingManagerPerms.length > 0) {
      console.log('❌ Manager missing permissions:', missingManagerPerms);
    }
    if (incorrectManagerPerms.length > 0) {
      console.log('❌ Manager has forbidden permissions:', incorrectManagerPerms);
    }
  }

  await prisma.$disconnect();
}

verifyEcommercePermissions().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
