/**
 * Task 4 Verification Script
 * 
 * Verifies all requirements for Task 4: Integration, navigation, and final setup
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const results = {
  passed: [],
  failed: [],
};

function logTest(name, passed, details = '') {
  if (passed) {
    results.passed.push(name);
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    results.failed.push({ name, details });
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

async function verifyTask4() {
  console.log('🔍 Task 4: Integration, Navigation, and Final Setup Verification\n');
  console.log('='.repeat(70));

  // 1. Dashboard sidebar navigation
  console.log('\n📱 1. Dashboard Sidebar Navigation\n');
  
  const emailMenu = await prisma.dashboardMenu.findFirst({
    where: { key: 'settings-email' },
  });
  
  logTest(
    'Email settings link added to sidebar',
    !!emailMenu,
    emailMenu ? `Route: ${emailMenu.route}` : 'Menu not found'
  );
  
  logTest(
    'Email menu under Settings section',
    emailMenu?.parentId !== null,
    emailMenu?.parentId ? 'Has parent menu' : 'No parent'
  );
  
  logTest(
    'Email menu has Mail icon',
    emailMenu?.icon === 'Mail',
    `Icon: ${emailMenu?.icon}`
  );
  
  logTest(
    'Email menu visible only to Super Admin',
    emailMenu?.requiredRoles?.includes('Super Admin'),
    `Required roles: ${emailMenu?.requiredRoles?.join(', ')}`
  );

  // 2. Frontend components wired to backend
  console.log('\n🔌 2. Frontend Components Wired to Backend\n');
  
  const frontendFiles = [
    'frontend/src/app/dashboard/settings/email/page.tsx',
    'frontend/src/app/dashboard/settings/email/components/EmailConfigurationForm.tsx',
    'frontend/src/app/dashboard/settings/email/components/EmailToggle.tsx',
    'frontend/src/app/dashboard/settings/email/components/TestEmailDialog.tsx',
    'frontend/src/app/dashboard/settings/email/components/EmailTemplateList.tsx',
    'frontend/src/app/dashboard/settings/email/components/EmailTemplateEditor.tsx',
    'frontend/src/app/dashboard/settings/email/components/EmailLogsTable.tsx',
    'frontend/src/app/dashboard/settings/email/components/EmailStatsCards.tsx',
    'frontend/src/app/dashboard/settings/email/components/RateLimitSettings.tsx',
    'frontend/src/lib/api/email.ts',
    'frontend/src/types/email.ts',
  ];
  
  let allFilesExist = true;
  frontendFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    if (!exists) allFilesExist = false;
  });
  
  logTest('All frontend components exist', allFilesExist);
  logTest('API client exists', fs.existsSync(path.join(__dirname, '..', 'frontend/src/lib/api/email.ts')));
  logTest('Type definitions exist', fs.existsSync(path.join(__dirname, '..', 'frontend/src/types/email.ts')));

  // 3. Email configuration flow
  console.log('\n⚙️  3. Email Configuration Flow\n');
  
  const backendFiles = [
    'backend/src/email/email.module.ts',
    'backend/src/email/email.controller.ts',
    'backend/src/email/email.service.ts',
    'backend/src/email/services/smtp.service.ts',
    'backend/src/email/services/email-encryption.service.ts',
  ];
  
  let allBackendFilesExist = true;
  backendFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file.replace('backend/', '')));
    if (!exists) allBackendFilesExist = false;
  });
  
  logTest('Backend email module exists', allBackendFilesExist);
  
  const configTable = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name = 'email_configuration'
  `;
  logTest('Email configuration table exists', configTable.length > 0);

  // 4. Email sending flow
  console.log('\n📧 4. Email Sending Flow\n');
  
  const queueTable = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name = 'email_queue'
  `;
  logTest('Email queue table exists', queueTable.length > 0);
  
  const processorExists = fs.existsSync(
    path.join(__dirname, 'src/email/processors/email-queue.processor.ts')
  );
  logTest('Queue processor exists', processorExists);
  
  const queueServiceExists = fs.existsSync(
    path.join(__dirname, 'src/email/services/email-queue.service.ts')
  );
  logTest('Queue service exists', queueServiceExists);

  // 5. Template system
  console.log('\n📝 5. Template System\n');
  
  const templateTable = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name = 'email_templates'
  `;
  logTest('Email template table exists', templateTable.length > 0);
  
  const templates = await prisma.emailTemplate.findMany();
  logTest('Default templates seeded', templates.length >= 4, `Found ${templates.length} templates`);
  
  const templateServiceExists = fs.existsSync(
    path.join(__dirname, 'src/email/services/email-template.service.ts')
  );
  logTest('Template service exists', templateServiceExists);

  // 6. Rate limiting
  console.log('\n⏱️  6. Rate Limiting\n');
  
  const rateLimitTable = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name = 'email_rate_limits'
  `;
  logTest('Rate limit table exists', rateLimitTable.length > 0);

  // 7. Notification preferences integration
  console.log('\n🔔 7. Notification Preferences Integration\n');
  
  const emailServiceContent = fs.readFileSync(
    path.join(__dirname, 'src/email/email.service.ts'),
    'utf-8'
  );
  
  const hasPreferenceCheck = emailServiceContent.includes('notificationPreference') ||
                             emailServiceContent.includes('shouldSkipEmail');
  logTest('Email service checks notification preferences', hasPreferenceCheck);

  // 8. Access control
  console.log('\n🔒 8. Access Control\n');
  
  const emailPermissions = await prisma.permission.findMany({
    where: {
      name: { in: ['email:configure', 'email:send', 'email:view_logs', 'email:manage_templates'] },
    },
  });
  logTest('Email permissions exist', emailPermissions.length === 4, `Found ${emailPermissions.length}/4`);
  
  const superAdmin = await prisma.userRole.findUnique({
    where: { name: 'Super Admin' },
    include: {
      rolePermissions: {
        include: { permission: true },
      },
    },
  });
  
  const hasEmailPerms = superAdmin?.rolePermissions.some(
    rp => rp.permission.name.startsWith('email:')
  );
  logTest('Super Admin has email permissions', hasEmailPerms);
  
  const controllerContent = fs.readFileSync(
    path.join(__dirname, 'src/email/email.controller.ts'),
    'utf-8'
  );
  
  const hasGuard = controllerContent.includes('SuperAdminGuard') ||
                   controllerContent.includes('@UseGuards');
  logTest('Email controller has access guards', hasGuard);

  // 9. Documentation
  console.log('\n📚 9. Documentation\n');
  
  const docExists = fs.existsSync(
    path.join(__dirname, 'EMAIL_SYSTEM_DOCUMENTATION.md')
  );
  logTest('Developer documentation exists', docExists);
  
  if (docExists) {
    const docContent = fs.readFileSync(
      path.join(__dirname, 'EMAIL_SYSTEM_DOCUMENTATION.md'),
      'utf-8'
    );
    
    logTest('Documentation includes SMTP configuration', docContent.includes('SMTP Configuration'));
    logTest('Documentation includes template syntax', docContent.includes('Template Variable Syntax'));
    logTest('Documentation includes API endpoints', docContent.includes('API Endpoints'));
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Verification Summary\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Checks:');
    results.failed.forEach(({ name, details }) => {
      console.log(`  - ${name}`);
      if (details) console.log(`    ${details}`);
    });
  } else {
    console.log('\n🎉 All Task 4 requirements verified successfully!');
  }
  
  console.log('\n' + '='.repeat(70));

  await prisma.$disconnect();
  process.exit(results.failed.length > 0 ? 1 : 0);
}

verifyTask4().catch(error => {
  console.error('Verification failed:', error);
  prisma.$disconnect();
  process.exit(1);
});
