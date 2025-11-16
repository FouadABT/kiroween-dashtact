/**
 * Verification Script: Dashboard Customization Permissions
 * 
 * This script verifies that widget and layout permissions are correctly
 * assigned to all user roles as per the requirements.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PermissionCheck {
  role: string;
  permission: string;
  expected: boolean;
  actual: boolean;
  status: 'PASS' | 'FAIL';
}

async function verifyDashboardPermissions() {
  console.log('🔍 Verifying Dashboard Customization Permissions...\n');

  const results: PermissionCheck[] = [];

  // Define expected permissions per role
  const expectedPermissions = {
    'Super Admin': {
      'widgets:read': true,
      'widgets:write': true,
      'widgets:delete': true,
      'layouts:read': true,
      'layouts:write': true,
      'layouts:delete': true,
    },
    'Admin': {
      'widgets:read': true,
      'widgets:write': true,
      'widgets:delete': true,
      'layouts:read': true,
      'layouts:write': true,
      'layouts:delete': true,
    },
    'Manager': {
      'widgets:read': true,
      'widgets:write': false,
      'widgets:delete': false,
      'layouts:read': true,
      'layouts:write': true,
      'layouts:delete': false,
    },
    'User': {
      'widgets:read': true,
      'widgets:write': false,
      'widgets:delete': false,
      'layouts:read': true,
      'layouts:write': true,
      'layouts:delete': false,
    },
  };

  // Fetch all roles with their permissions
  const roles = await prisma.userRole.findMany({
    where: {
      name: {
        in: ['Super Admin', 'Admin', 'Manager', 'User'],
      },
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  // Check each role's permissions
  for (const role of roles) {
    const roleExpectations = expectedPermissions[role.name];
    if (!roleExpectations) continue;

    const rolePermissions = role.rolePermissions.map(
      (rp) => rp.permission.name
    );

    // Check if role has *:* (super admin)
    const hasSuperAdmin = rolePermissions.includes('*:*');

    for (const [permissionName, expected] of Object.entries(roleExpectations)) {
      const actual = hasSuperAdmin || rolePermissions.includes(permissionName);
      const status = actual === expected ? 'PASS' : 'FAIL';

      results.push({
        role: role.name,
        permission: permissionName,
        expected: expected as boolean,
        actual,
        status,
      });
    }
  }

  // Display results
  console.log('📊 Permission Verification Results:\n');
  console.log('Role'.padEnd(15), 'Permission'.padEnd(20), 'Expected', 'Actual', 'Status');
  console.log('-'.repeat(70));

  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    const statusIcon = result.status === 'PASS' ? '✅' : '❌';
    console.log(
      result.role.padEnd(15),
      result.permission.padEnd(20),
      result.expected.toString().padEnd(8),
      result.actual.toString().padEnd(7),
      `${statusIcon} ${result.status}`
    );

    if (result.status === 'PASS') passCount++;
    else failCount++;
  }

  console.log('-'.repeat(70));
  console.log(`\n✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);

  // Verify widget and layout permissions exist
  console.log('\n🔍 Verifying Permission Existence:\n');

  const requiredPermissions = [
    'widgets:read',
    'widgets:write',
    'widgets:delete',
    'layouts:read',
    'layouts:write',
    'layouts:delete',
  ];

  for (const permName of requiredPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: permName },
    });

    if (permission) {
      console.log(`✅ ${permName.padEnd(20)} - EXISTS`);
    } else {
      console.log(`❌ ${permName.padEnd(20)} - MISSING`);
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  if (failCount === 0) {
    console.log('✅ All dashboard customization permissions are correctly configured!');
  } else {
    console.log(`❌ ${failCount} issues found. Please review the configuration.`);
  }
  console.log('='.repeat(70) + '\n');

  await prisma.$disconnect();
  process.exit(failCount > 0 ? 1 : 0);
}

verifyDashboardPermissions().catch((error) => {
  console.error('❌ Error verifying permissions:', error);
  process.exit(1);
});
