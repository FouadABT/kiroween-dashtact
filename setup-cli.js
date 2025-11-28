#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function confirm(prompt) {
  const answer = await question(`${prompt} (y/n): `);
  return answer.toLowerCase() === 'y';
}

async function selectFeatures() {
  log('\n📋 Choose Your Setup Profile:', 'bright');
  log('Select one of the following configurations:\n', 'yellow');

  const profiles = [
    {
      name: 'ecommerce',
      label: 'E-commerce Store',
      description: 'Full e-commerce with products, orders, payments, shipping',
      features: {
        landing: true,
        blog: false,
        ecommerce: true,
        calendar: false,
        crm: false,
        notifications: true,
        customerAccount: true,
      },
    },
    {
      name: 'crm',
      label: 'CRM System',
      description: 'Customer relationship management with calendar & notifications',
      features: {
        landing: true,
        blog: false,
        ecommerce: false,
        calendar: true,
        crm: true,
        notifications: true,
        customerAccount: false,
      },
    },
    {
      name: 'full',
      label: 'Full Stack',
      description: 'Everything enabled - all features available',
      features: {
        landing: true,
        blog: true,
        ecommerce: true,
        calendar: true,
        crm: true,
        notifications: true,
        customerAccount: true,
      },
    },
    {
      name: 'minimal',
      label: 'Minimal Setup',
      description: 'Core features only - dashboard, auth, notifications',
      features: {
        landing: false,
        blog: false,
        ecommerce: false,
        calendar: false,
        crm: false,
        notifications: true,
        customerAccount: false,
      },
    },
  ];

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    log(`  ${i + 1}. ${profile.label}`, 'cyan');
    log(`     ${profile.description}`, 'yellow');
  }

  let choice = '';
  while (!['1', '2', '3', '4'].includes(choice)) {
    choice = await question('\nSelect profile (1-4): ');
  }

  const selectedProfile = profiles[parseInt(choice) - 1];
  log(`\n✅ Selected: ${selectedProfile.label}`, 'green');
  log('Enabled features:', 'cyan');
  
  for (const [feature, enabled] of Object.entries(selectedProfile.features)) {
    if (enabled) {
      log(`  ✅ ${feature}`, 'green');
    }
  }

  return selectedProfile.features;
}

function updateEnvFile(filePath, features, isBackend = false) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (isBackend) {
    // Update backend .env
    for (const [key, value] of Object.entries(features)) {
      const envKey = `ENABLE_${key.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '')}`;
      const pattern = new RegExp(`^${envKey}=.*$`, 'gm');
      const replacement = `${envKey}=${value ? 'true' : 'false'}`;
      content = content.replace(pattern, replacement);
    }
  } else {
    // Update frontend .env.local
    for (const [key, value] of Object.entries(features)) {
      const envKey = `NEXT_PUBLIC_ENABLE_${key.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '')}`;
      const pattern = new RegExp(`^${envKey}=.*$`, 'gm');
      const replacement = `${envKey}=${value ? 'true' : 'false'}`;
      content = content.replace(pattern, replacement);
    }
  }

  fs.writeFileSync(filePath, content);
}

function runCommand(command, cwd = '.') {
  try {
    log(`\n▶️  Running: ${command}`, 'blue');
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`\n❌ Command failed: ${command}`, 'yellow');
    return false;
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         🚀 Dashtact Fresh Setup CLI                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  // Step 1: Check prerequisites
  log('Step 1: Checking Prerequisites', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  try {
    execSync('node --version', { stdio: 'pipe' });
    log('✅ Node.js installed', 'green');
  } catch {
    log('❌ Node.js not found', 'yellow');
    process.exit(1);
  }

  try {
    execSync('npm --version', { stdio: 'pipe' });
    log('✅ npm installed', 'green');
  } catch {
    log('❌ npm not found', 'yellow');
    process.exit(1);
  }

  // Step 2: Feature selection
  log('\nStep 2: Feature Selection', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  const features = await selectFeatures();

  log('\n📝 Selected Features:', 'bright');
  for (const [key, enabled] of Object.entries(features)) {
    const status = enabled ? '✅' : '❌';
    log(`  ${status} ${key}`, enabled ? 'green' : 'yellow');
  }

  // Step 3: Confirm database reset
  log('\nStep 3: Database Setup', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  const resetDb = await confirm('Reset database? (This will delete all existing data)');
  if (!resetDb) {
    log('\n⚠️  Skipping database reset. Using existing database.', 'yellow');
  }

  // Step 4: Update environment files
  log('\nStep 4: Updating Environment Files', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  try {
    updateEnvFile('backend/.env', features, true);
    log('✅ Updated backend/.env', 'green');

    updateEnvFile('frontend/.env.local', features, false);
    log('✅ Updated frontend/.env.local', 'green');
  } catch (error) {
    log(`❌ Failed to update environment files: ${error.message}`, 'yellow');
    process.exit(1);
  }

  // Step 5: Install dependencies
  log('\nStep 5: Installing Dependencies', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  const installDeps = await confirm('Install npm dependencies?');
  if (installDeps) {
    if (!runCommand('npm install', 'backend')) {
      log('⚠️  Backend dependencies installation had issues', 'yellow');
    }
    if (!runCommand('npm install', 'frontend')) {
      log('⚠️  Frontend dependencies installation had issues', 'yellow');
    }
  }

  // Step 6: Database migration
  log('\nStep 6: Database Migration', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  if (resetDb) {
    const migrate = await confirm('Run database migrations?');
    if (migrate) {
      if (!runCommand('npx prisma migrate reset --force', 'backend')) {
        log('❌ Database migration failed', 'yellow');
        process.exit(1);
      }
      log('✅ Database migrated successfully', 'green');
    }
  }

  // Step 7: Seed database
  log('\nStep 7: Seeding Database', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  const seed = await confirm('Run database seed?');
  if (seed) {
    // Pass feature flags as environment variables to seed process
    const seedEnv = {
      ...process.env,
      ENABLE_LANDING: features.landing ? 'true' : 'false',
      ENABLE_BLOG: features.blog ? 'true' : 'false',
      ENABLE_ECOMMERCE: features.ecommerce ? 'true' : 'false',
      ENABLE_CALENDAR: features.calendar ? 'true' : 'false',
      ENABLE_CRM: features.crm ? 'true' : 'false',
      ENABLE_NOTIFICATIONS: features.notifications ? 'true' : 'false',
      ENABLE_CUSTOMER_ACCOUNT: features.customerAccount ? 'true' : 'false',
    };

    try {
      log(`\n▶️  Running: npm run prisma:seed`, 'blue');
      execSync('npm run prisma:seed', { 
        cwd: 'backend',
        stdio: 'inherit',
        env: seedEnv
      });
      log('✅ Database seeded successfully', 'green');
    } catch (error) {
      log('❌ Database seeding failed', 'yellow');
      process.exit(1);
    }
  }

  // Step 8: Summary
  log('\nStep 8: Setup Complete! 🎉', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  log('📋 Next Steps:', 'bright');
  log('  1. Start the backend server:', 'cyan');
  log('     cd backend && npm run start:dev\n', 'yellow');

  log('  2. In another terminal, start the frontend:', 'cyan');
  log('     cd frontend && npm run dev\n', 'yellow');

  log('  3. Open your browser and go to:', 'cyan');
  log('     http://localhost:3000\n', 'yellow');

  log('  4. Log in with default credentials:', 'cyan');
  log('     Email: admin@dashtact.com', 'yellow');
  log('     Password: dashtact\n', 'yellow');

  log('⚠️  IMPORTANT: Change the default password immediately after login!\n', 'yellow');

  log('📚 Useful Commands:', 'bright');
  log('  • Run tests: cd backend && npx ts-node test-feature-flags.ts', 'cyan');
  log('  • View database: cd backend && npx prisma studio', 'cyan');
  log('  • Reset database: cd backend && npx prisma migrate reset\n', 'cyan');

  log('✅ Setup complete! Happy coding! 🚀\n', 'green');

  rl.close();
}

main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, 'yellow');
  rl.close();
  process.exit(1);
});
