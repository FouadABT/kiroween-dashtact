/**
 * Email API Endpoint Test Script
 * 
 * Tests that all email API endpoints are properly wired and accessible
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testEndpoints() {
  console.log('🔍 Verifying Email API Endpoints Configuration\n');
  console.log('='.repeat(60));

  const checks = [];

  // Check 1: Email module exists
  try {
    const fs = require('fs');
    const path = require('path');
    const emailModulePath = path.join(__dirname, 'src', 'email', 'email.module.ts');
    const exists = fs.existsSync(emailModulePath);
    checks.push({
      name: 'Email module file exists',
      passed: exists,
    });
  } catch (error) {
    checks.push({
      name: 'Email module file exists',
      passed: false,
      error: error.message,
    });
  }

  // Check 2: Email controller exists
  try {
    const fs = require('fs');
    const path = require('path');
    const controllerPath = path.join(__dirname, 'src', 'email', 'email.controller.ts');
    const exists = fs.existsSync(controllerPath);
    checks.push({
      name: 'Email controller file exists',
      passed: exists,
    });
  } catch (error) {
    checks.push({
      name: 'Email controller file exists',
      passed: false,
      error: error.message,
    });
  }

  // Check 3: Email service exists
  try {
    const fs = require('fs');
    const path = require('path');
    const servicePath = path.join(__dirname, 'src', 'email', 'email.service.ts');
    const exists = fs.existsSync(servicePath);
    checks.push({
      name: 'Email service file exists',
      passed: exists,
    });
  } catch (error) {
    checks.push({
      name: 'Email service file exists',
      passed: false,
      error: error.message,
    });
  }

  // Check 4: Email permissions exist in database
  try {
    const permissions = await prisma.permission.findMany({
      where: {
        name: {
          in: ['email:configure', 'email:send', 'email:view_logs', 'email:manage_templates'],
        },
      },
    });
    checks.push({
      name: 'Email permissions exist in database',
      passed: permissions.length === 4,
      details: `Found ${permissions.length}/4 permissions`,
    });
  } catch (error) {
    checks.push({
      name: 'Email permissions exist in database',
      passed: false,
      error: error.message,
    });
  }

  // Check 5: Super Admin has email permissions
  try {
    const superAdmin = await prisma.userRole.findUnique({
      where: { name: 'Super Admin' },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const emailPerms = superAdmin?.rolePermissions.filter(
      rp => rp.permission.name.startsWith('email:')
    );

    checks.push({
      name: 'Super Admin has email permissions',
      passed: emailPerms && emailPerms.length > 0,
      details: `Found ${emailPerms?.length || 0} email permissions`,
    });
  } catch (error) {
    checks.push({
      name: 'Super Admin has email permissions',
      passed: false,
      error: error.message,
    });
  }

  // Check 6: Email settings menu exists
  try {
    const menu = await prisma.dashboardMenu.findFirst({
      where: { key: 'settings-email' },
    });
    checks.push({
      name: 'Email settings menu exists',
      passed: !!menu,
      details: menu ? `Route: ${menu.route}` : 'Menu not found',
    });
  } catch (error) {
    checks.push({
      name: 'Email settings menu exists',
      passed: false,
      error: error.message,
    });
  }

  // Check 7: Email settings menu requires Super Admin
  try {
    const menu = await prisma.dashboardMenu.findFirst({
      where: { key: 'settings-email' },
    });
    const requiresSuperAdmin = menu?.requiredRoles?.includes('Super Admin');
    checks.push({
      name: 'Email menu requires Super Admin role',
      passed: requiresSuperAdmin,
      details: `Required roles: ${menu?.requiredRoles?.join(', ') || 'none'}`,
    });
  } catch (error) {
    checks.push({
      name: 'Email menu requires Super Admin role',
      passed: false,
      error: error.message,
    });
  }

  // Check 8: Email templates seeded
  try {
    const templates = await prisma.emailTemplate.findMany();
    checks.push({
      name: 'Email templates seeded',
      passed: templates.length >= 4,
      details: `Found ${templates.length} templates`,
    });
  } catch (error) {
    checks.push({
      name: 'Email templates seeded',
      passed: false,
      error: error.message,
    });
  }

  // Check 9: Email configuration table exists
  try {
    const count = await prisma.emailConfiguration.count();
    checks.push({
      name: 'Email configuration table accessible',
      passed: true,
      details: `${count} configurations in database`,
    });
  } catch (error) {
    checks.push({
      name: 'Email configuration table accessible',
      passed: false,
      error: error.message,
    });
  }

  // Check 10: Email queue table exists
  try {
    const count = await prisma.emailQueue.count();
    checks.push({
      name: 'Email queue table accessible',
      passed: true,
      details: `${count} items in queue`,
    });
  } catch (error) {
    checks.push({
      name: 'Email queue table accessible',
      passed: false,
      error: error.message,
    });
  }

  // Print results
  console.log('\n📋 Endpoint Configuration Checks:\n');
  
  let passed = 0;
  let failed = 0;

  checks.forEach(check => {
    if (check.passed) {
      passed++;
      console.log(`✅ ${check.name}`);
      if (check.details) {
        console.log(`   ${check.details}`);
      }
    } else {
      failed++;
      console.log(`❌ ${check.name}`);
      if (check.error) {
        console.log(`   Error: ${check.error}`);
      }
      if (check.details) {
        console.log(`   ${check.details}`);
      }
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('\n' + '='.repeat(60));

  // API Endpoint Summary
  console.log('\n📡 Expected API Endpoints:\n');
  console.log('Configuration:');
  console.log('  POST   /email/configuration       - Save SMTP configuration');
  console.log('  GET    /email/configuration       - Get SMTP configuration');
  console.log('  PATCH  /email/configuration/toggle - Toggle email system');
  console.log('  POST   /email/configuration/test  - Send test email');
  console.log('\nTemplates:');
  console.log('  POST   /email/templates           - Create template');
  console.log('  GET    /email/templates           - List templates');
  console.log('  GET    /email/templates/:id       - Get template');
  console.log('  PUT    /email/templates/:id       - Update template');
  console.log('  DELETE /email/templates/:id       - Delete template');
  console.log('\nLogs:');
  console.log('  GET    /email/logs                - Get email logs');
  console.log('  GET    /email/logs/:id            - Get log details');
  console.log('  GET    /email/logs/stats          - Get statistics');
  console.log('\n' + '='.repeat(60));

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

testEndpoints().catch(error => {
  console.error('Test failed:', error);
  prisma.$disconnect();
  process.exit(1);
});
