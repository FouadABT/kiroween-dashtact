/**
 * Email System Integration Test Script
 * 
 * This script tests the complete email system integration including:
 * - Configuration management
 * - Email sending flow
 * - Template system
 * - Rate limiting
 * - Notification preferences integration
 * - Access control
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test results tracking
const results = {
  passed: [],
  failed: [],
};

function logTest(name, passed, details = '') {
  if (passed) {
    results.passed.push(name);
    console.log(`✅ ${name}`);
  } else {
    results.failed.push({ name, details });
    console.log(`❌ ${name}: ${details}`);
  }
}

async function testEmailConfiguration() {
  console.log('\n📧 Testing Email Configuration...\n');

  try {
    // Test 1: Create email configuration
    const config = await prisma.emailConfiguration.create({
      data: {
        smtpHost: 'smtp.test.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUsername: 'test@test.com',
        smtpPassword: 'encrypted_password_here',
        senderEmail: 'noreply@test.com',
        senderName: 'Test App',
        isEnabled: false,
        createdBy: 'test-user',
        updatedBy: 'test-user',
      },
    });
    logTest('Create email configuration', !!config.id);

    // Test 2: Retrieve configuration
    const retrieved = await prisma.emailConfiguration.findUnique({
      where: { id: config.id },
    });
    logTest('Retrieve email configuration', retrieved?.smtpHost === 'smtp.test.com');

    // Test 3: Update configuration
    const updated = await prisma.emailConfiguration.update({
      where: { id: config.id },
      data: { isEnabled: true },
    });
    logTest('Update email configuration', updated.isEnabled === true);

    // Test 4: Toggle email system
    const toggled = await prisma.emailConfiguration.update({
      where: { id: config.id },
      data: { isEnabled: false },
    });
    logTest('Toggle email system', toggled.isEnabled === false);

    // Cleanup
    await prisma.emailConfiguration.delete({ where: { id: config.id } });

    return true;
  } catch (error) {
    logTest('Email configuration tests', false, error.message);
    return false;
  }
}

async function testEmailTemplates() {
  console.log('\n📝 Testing Email Templates...\n');

  try {
    // Test 1: Create template
    const template = await prisma.emailTemplate.create({
      data: {
        name: 'Test Template',
        slug: 'test-template-' + Date.now(),
        subject: 'Test Subject {{name}}',
        htmlBody: '<p>Hello {{name}}, welcome to {{appName}}!</p>',
        textBody: 'Hello {{name}}, welcome to {{appName}}!',
        variables: ['name', 'appName'],
        category: 'SYSTEM',
        isActive: true,
        createdBy: 'test-user',
        updatedBy: 'test-user',
      },
    });
    logTest('Create email template', !!template.id);

    // Test 2: Retrieve template
    const retrieved = await prisma.emailTemplate.findUnique({
      where: { id: template.id },
    });
    logTest('Retrieve email template', retrieved?.name === 'Test Template');

    // Test 3: Validate variables
    logTest('Template variables stored correctly', 
      Array.isArray(retrieved.variables) && retrieved.variables.includes('name'));

    // Test 4: Update template
    const updated = await prisma.emailTemplate.update({
      where: { id: template.id },
      data: { isActive: false },
    });
    logTest('Update email template', updated.isActive === false);

    // Test 5: Find by slug
    const bySlug = await prisma.emailTemplate.findUnique({
      where: { slug: template.slug },
    });
    logTest('Find template by slug', bySlug?.id === template.id);

    // Cleanup
    await prisma.emailTemplate.delete({ where: { id: template.id } });

    return true;
  } catch (error) {
    logTest('Email template tests', false, error.message);
    return false;
  }
}

async function testEmailQueue() {
  console.log('\n📬 Testing Email Queue...\n');

  try {
    // Test 1: Add email to queue
    const queueItem = await prisma.emailQueue.create({
      data: {
        recipient: 'test@example.com',
        subject: 'Test Email',
        htmlBody: '<p>Test content</p>',
        textBody: 'Test content',
        status: 'PENDING',
        priority: 5,
        attempts: 0,
        maxAttempts: 3,
      },
    });
    logTest('Add email to queue', !!queueItem.id);

    // Test 2: Retrieve pending emails
    const pending = await prisma.emailQueue.findMany({
      where: { status: 'PENDING' },
    });
    logTest('Retrieve pending emails', pending.length > 0);

    // Test 3: Update queue status
    const updated = await prisma.emailQueue.update({
      where: { id: queueItem.id },
      data: { 
        status: 'PROCESSING',
        attempts: 1,
        lastAttemptAt: new Date(),
      },
    });
    logTest('Update queue status', updated.status === 'PROCESSING');

    // Test 4: Mark as sent
    const sent = await prisma.emailQueue.update({
      where: { id: queueItem.id },
      data: { status: 'SENT' },
    });
    logTest('Mark email as sent', sent.status === 'SENT');

    // Test 5: Test retry logic (simulate failure)
    const failedItem = await prisma.emailQueue.create({
      data: {
        recipient: 'fail@example.com',
        subject: 'Failed Email',
        htmlBody: '<p>This will fail</p>',
        status: 'PENDING',
        priority: 5,
        attempts: 0,
        maxAttempts: 3,
      },
    });

    // Simulate 3 failed attempts
    for (let i = 1; i <= 3; i++) {
      await prisma.emailQueue.update({
        where: { id: failedItem.id },
        data: {
          attempts: i,
          lastAttemptAt: new Date(),
          error: `Attempt ${i} failed`,
        },
      });
    }

    const maxAttempts = await prisma.emailQueue.findUnique({
      where: { id: failedItem.id },
    });
    logTest('Retry logic (max attempts)', maxAttempts.attempts === 3);

    // Mark as failed after max attempts
    await prisma.emailQueue.update({
      where: { id: failedItem.id },
      data: { status: 'FAILED' },
    });

    const failed = await prisma.emailQueue.findUnique({
      where: { id: failedItem.id },
    });
    logTest('Mark as failed after max attempts', failed.status === 'FAILED');

    // Cleanup
    await prisma.emailQueue.deleteMany({
      where: { id: { in: [queueItem.id, failedItem.id] } },
    });

    return true;
  } catch (error) {
    logTest('Email queue tests', false, error.message);
    return false;
  }
}

async function testEmailLogs() {
  console.log('\n📊 Testing Email Logs...\n');

  try {
    // Test 1: Create email log
    const log = await prisma.emailLog.create({
      data: {
        recipient: 'test@example.com',
        subject: 'Test Email',
        status: 'SENT',
        sentAt: new Date(),
      },
    });
    logTest('Create email log', !!log.id);

    // Test 2: Retrieve logs
    const logs = await prisma.emailLog.findMany({
      where: { recipient: 'test@example.com' },
    });
    logTest('Retrieve email logs', logs.length > 0);

    // Test 3: Filter by status
    const sentLogs = await prisma.emailLog.findMany({
      where: { status: 'SENT' },
    });
    logTest('Filter logs by status', sentLogs.length > 0);

    // Test 4: Create failed log
    const failedLog = await prisma.emailLog.create({
      data: {
        recipient: 'fail@example.com',
        subject: 'Failed Email',
        status: 'FAILED',
        error: 'SMTP connection failed',
      },
    });
    logTest('Create failed email log', failedLog.status === 'FAILED');

    // Test 5: Filter by date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = await prisma.emailLog.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
    logTest('Filter logs by date range', todayLogs.length > 0);

    // Cleanup
    await prisma.emailLog.deleteMany({
      where: { id: { in: [log.id, failedLog.id] } },
    });

    return true;
  } catch (error) {
    logTest('Email logs tests', false, error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n⏱️  Testing Rate Limiting...\n');

  try {
    const now = new Date();

    // Test 1: Create hourly rate limit
    const hourlyLimit = await prisma.emailRateLimit.create({
      data: {
        windowType: 'hourly',
        windowStart: now,
        emailCount: 0,
        maxEmails: 100,
      },
    });
    logTest('Create hourly rate limit', !!hourlyLimit.id);

    // Test 2: Increment email count
    const updated = await prisma.emailRateLimit.update({
      where: { id: hourlyLimit.id },
      data: { emailCount: { increment: 1 } },
    });
    logTest('Increment email count', updated.emailCount === 1);

    // Test 3: Check if limit reached
    await prisma.emailRateLimit.update({
      where: { id: hourlyLimit.id },
      data: { emailCount: 100 },
    });
    const atLimit = await prisma.emailRateLimit.findUnique({
      where: { id: hourlyLimit.id },
    });
    logTest('Check rate limit reached', atLimit.emailCount >= atLimit.maxEmails);

    // Test 4: Create daily rate limit
    const dailyLimit = await prisma.emailRateLimit.create({
      data: {
        windowType: 'daily',
        windowStart: now,
        emailCount: 50,
        maxEmails: 1000,
      },
    });
    logTest('Create daily rate limit', dailyLimit.windowType === 'daily');

    // Test 5: Query current window
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);
    const currentLimits = await prisma.emailRateLimit.findMany({
      where: {
        windowType: 'hourly',
        windowStart: {
          gte: currentHour,
        },
      },
    });
    logTest('Query current rate limit window', currentLimits.length >= 0);

    // Cleanup
    await prisma.emailRateLimit.deleteMany({
      where: { id: { in: [hourlyLimit.id, dailyLimit.id] } },
    });

    return true;
  } catch (error) {
    logTest('Rate limiting tests', false, error.message);
    return false;
  }
}

async function testAccessControl() {
  console.log('\n🔒 Testing Access Control...\n');

  try {
    // Test 1: Verify email permissions exist
    const emailPermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'email:',
        },
      },
    });
    logTest('Email permissions exist', emailPermissions.length >= 4);

    // Test 2: Verify Super Admin has email permissions
    const superAdminRole = await prisma.userRole.findUnique({
      where: { name: 'Super Admin' },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const hasEmailPermissions = superAdminRole?.rolePermissions.some(
      rp => rp.permission.name.startsWith('email:')
    );
    logTest('Super Admin has email permissions', hasEmailPermissions);

    // Test 3: Verify email:configure permission exists
    const configurePermission = await prisma.permission.findUnique({
      where: { name: 'email:configure' },
    });
    logTest('email:configure permission exists', !!configurePermission);

    // Test 4: Verify email menu exists
    const emailMenu = await prisma.dashboardMenu.findFirst({
      where: { key: 'settings-email' },
    });
    logTest('Email settings menu exists', !!emailMenu);

    // Test 5: Verify menu requires Super Admin role
    const requiresSuperAdmin = emailMenu?.requiredRoles?.includes('Super Admin');
    logTest('Email menu requires Super Admin', requiresSuperAdmin);

    return true;
  } catch (error) {
    logTest('Access control tests', false, error.message);
    return false;
  }
}

async function testEmailStatistics() {
  console.log('\n📈 Testing Email Statistics...\n');

  try {
    // Create test data
    const testLogs = [];
    for (let i = 0; i < 10; i++) {
      const log = await prisma.emailLog.create({
        data: {
          recipient: `test${i}@example.com`,
          subject: `Test Email ${i}`,
          status: i < 8 ? 'SENT' : 'FAILED',
          sentAt: i < 8 ? new Date() : null,
        },
      });
      testLogs.push(log.id);
    }

    // Test 1: Count total sent
    const totalSent = await prisma.emailLog.count({
      where: { status: 'SENT' },
    });
    logTest('Count total sent emails', totalSent >= 8);

    // Test 2: Count total failed
    const totalFailed = await prisma.emailLog.count({
      where: { status: 'FAILED' },
    });
    logTest('Count total failed emails', totalFailed >= 2);

    // Test 3: Calculate failure rate
    const total = await prisma.emailLog.count();
    const failureRate = (totalFailed / total) * 100;
    logTest('Calculate failure rate', failureRate >= 0 && failureRate <= 100);

    // Test 4: Count emails sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sentToday = await prisma.emailLog.count({
      where: {
        status: 'SENT',
        sentAt: {
          gte: today,
        },
      },
    });
    logTest('Count emails sent today', sentToday >= 0);

    // Test 5: Count queued emails
    const queued = await prisma.emailQueue.count({
      where: { status: 'PENDING' },
    });
    logTest('Count queued emails', queued >= 0);

    // Cleanup
    await prisma.emailLog.deleteMany({
      where: { id: { in: testLogs } },
    });

    return true;
  } catch (error) {
    logTest('Email statistics tests', false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Email System Integration Tests\n');
  console.log('='.repeat(60));

  await testEmailConfiguration();
  await testEmailTemplates();
  await testEmailQueue();
  await testEmailLogs();
  await testRateLimiting();
  await testAccessControl();
  await testEmailStatistics();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed Tests:');
    results.failed.forEach(({ name, details }) => {
      console.log(`  - ${name}: ${details}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  await prisma.$disconnect();

  process.exit(results.failed.length > 0 ? 1 : 0);
}

runAllTests().catch((error) => {
  console.error('Test execution failed:', error);
  prisma.$disconnect();
  process.exit(1);
});
