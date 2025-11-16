/**
 * Script: Upgrade User to Super Admin
 * 
 * Usage: npx ts-node scripts/upgrade-user-to-super-admin.ts <email>
 * Example: npx ts-node scripts/upgrade-user-to-super-admin.ts fouad.abt@gmail.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function upgradeUserToSuperAdmin(email: string) {
  console.log('='.repeat(70));
  console.log('Upgrading User to Super Admin');
  console.log('='.repeat(70));
  console.log(`\nEmail: ${email}\n`);

  try {
    // Find user
    console.log('Step 1: Finding user...');
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      console.error(`\nERROR: User not found: ${email}`);
      process.exit(1);
    }

    console.log('✓ User found:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Current Role: ${user.role.name}`);
    console.log(`  Current Role ID: ${user.roleId}\n`);

    // Find Super Admin role
    console.log('Step 2: Finding Super Admin role...');
    const superAdminRole = await prisma.userRole.findUnique({
      where: { name: 'Super Admin' },
    });

    if (!superAdminRole) {
      console.error('\nERROR: Super Admin role not found in database');
      process.exit(1);
    }

    console.log('✓ Super Admin role found:');
    console.log(`  ID: ${superAdminRole.id}`);
    console.log(`  Name: ${superAdminRole.name}\n`);

    // Check if already Super Admin
    if (user.roleId === superAdminRole.id) {
      console.log('✓ User is already a Super Admin!');
      console.log('\nNo changes needed.');
      process.exit(0);
    }

    // Update user role
    console.log('Step 3: Updating user role...');
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { roleId: superAdminRole.id },
      include: { role: true },
    });

    console.log('✓ User upgraded successfully!');
    console.log(`  Previous Role: ${user.role.name}`);
    console.log(`  New Role: ${updatedUser.role.name}`);
    console.log(`  New Role ID: ${updatedUser.roleId}\n`);

    console.log('='.repeat(70));
    console.log('SUCCESS: User upgraded to Super Admin');
    console.log('='.repeat(70));
    console.log('\n⚠️  IMPORTANT: User must log out and log back in for changes to take effect!\n');

  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('ERROR: Failed to upgrade user');
    console.error('='.repeat(70));
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error('ERROR: Email address is required\n');
  console.log('Usage:');
  console.log('  npx ts-node scripts/upgrade-user-to-super-admin.ts <email>\n');
  console.log('Example:');
  console.log('  npx ts-node scripts/upgrade-user-to-super-admin.ts fouad.abt@gmail.com\n');
  process.exit(1);
}

upgradeUserToSuperAdmin(email).catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
