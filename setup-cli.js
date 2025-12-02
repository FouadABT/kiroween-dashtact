#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
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

// Create environment files if they don't exist
function ensureEnvFiles() {
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const backendEnvExamplePath = path.join(__dirname, 'backend', '.env.example');
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  
  // Create backend .env from .env.example if it doesn't exist
  if (!fs.existsSync(backendEnvPath)) {
    if (fs.existsSync(backendEnvExamplePath)) {
      // Copy from .env.example
      fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
      log('✅ Created backend/.env from .env.example', 'green');
    } else {
      // Create with all default values if .env.example doesn't exist
      const defaultBackendEnv = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"

# Application
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001

# JWT Authentication Configuration
JWT_SECRET=CHANGE_THIS_JWT_SECRET_MIN_64_CHARS
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ISSUER=dashboard-app
JWT_AUDIENCE=dashboard-users

# Password Security
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=100

# Security Features
ENABLE_AUDIT_LOGGING=true
ACCOUNT_LOCKOUT_ENABLED=false
ACCOUNT_LOCKOUT_MAX_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=900

# Activity Logging Configuration
ACTIVITY_LOG_ENABLED=true
AUDIT_LOG_TOKEN_REFRESH=false

# Feature Flags - Controls which features are available
ENABLE_LANDING=true
ENABLE_BLOG=true
ENABLE_ECOMMERCE=true
ENABLE_CALENDAR=true
ENABLE_CRM=true
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=true

# Setup Status
SETUP_COMPLETED=false

# Legacy Feature Flags
FEATURE_EMAIL_VERIFICATION=false
FEATURE_TWO_FACTOR_AUTH=false
FEATURE_SOCIAL_AUTH=false
FEATURE_REMEMBER_ME=true
FEATURE_PASSWORD_RESET=true
FEATURE_SESSION_MANAGEMENT=false

# Default Settings
DEFAULT_USER_ROLE=USER

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Token Blacklist Cleanup
BLACKLIST_CLEANUP_ENABLED=true
BLACKLIST_CLEANUP_INTERVAL=86400000

# Email System Configuration
EMAIL_ENCRYPTION_KEY=CHANGE_THIS_EMAIL_ENCRYPTION_KEY_MIN_32_CHARS

# Email SMTP (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
`;
      fs.writeFileSync(backendEnvPath, defaultBackendEnv);
      log('✅ Created backend/.env with default values', 'green');
    }
  }
  
  // Create frontend .env.local with default values if it doesn't exist
  if (!fs.existsSync(frontendEnvPath)) {
    const defaultFrontendEnv = `# Development Environment - Local
# DO NOT COMMIT THIS FILE TO GIT!

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Feature Flags - Controls which features are available
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_CALENDAR=true
NEXT_PUBLIC_ENABLE_CRM=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true

# Page Visibility - Controls which pages are visible to users
NEXT_PUBLIC_SHOW_HOME_PAGE=true
NEXT_PUBLIC_SHOW_SHOP_PAGE=true
NEXT_PUBLIC_SHOW_BLOG_PAGE=true
NEXT_PUBLIC_SHOW_ACCOUNT_PAGE=true

# Setup Status
NEXT_PUBLIC_SETUP_COMPLETED=false

# Dynamic Header/Footer - Set to 'true' to use header/footer from CMS settings
# When enabled, uses configurations from /dashboard/settings/landing-page
# When disabled, uses hardcoded PublicNavigation and Footer components
NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER=true

# Blog Configuration (only applies when NEXT_PUBLIC_ENABLE_BLOG=true)
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
`;
    fs.writeFileSync(frontendEnvPath, defaultFrontendEnv);
    log('✅ Created frontend/.env.local with default values', 'green');
  }
}

// Database utility functions
async function checkPostgreSQLInstalled() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function testDatabaseConnection(connectionString) {
  // Try using Node.js pg library first (more reliable cross-platform)
  try {
    // Try to require pg from backend node_modules
    let Client;
    try {
      Client = require(path.join(__dirname, 'backend', 'node_modules', 'pg')).Client;
    } catch {
      // Fallback to global pg if available
      Client = require('pg').Client;
    }
    
    const client = new Client({ connectionString });
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        client.end();
        resolve({ success: false, error: 'Connection timeout (10s)' });
      }, 10000);

      client.connect((err) => {
        if (err) {
          clearTimeout(timeout);
          client.end();
          resolve({ success: false, error: err.message });
        } else {
          client.query('SELECT 1', (queryErr) => {
            clearTimeout(timeout);
            client.end();
            if (queryErr) {
              resolve({ success: false, error: queryErr.message });
            } else {
              resolve({ success: true });
            }
          });
        }
      });
    });
  } catch (requireError) {
    // Fallback to psql command if pg module not available
    return new Promise((resolve) => {
      const testCommand = `psql "${connectionString}" -c "SELECT 1"`;
      exec(testCommand, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: 'pg module not found. Please run: cd backend && npm install' });
        } else {
          resolve({ success: true });
        }
      });
    });
  }
}

function parseDatabaseUrl(url) {
  try {
    const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
    const match = url.match(regex);
    if (match) {
      return {
        user: match[1],
        password: match[2],
        host: match[3],
        port: match[4],
        database: match[5],
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function checkDatabaseExists(dbConfig) {
  try {
    // Try to require pg from backend node_modules
    let Client;
    try {
      Client = require(path.join(__dirname, 'backend', 'node_modules', 'pg')).Client;
    } catch {
      Client = require('pg').Client;
    }
    
    // Connect to postgres database to check if target database exists
    const connectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/postgres`;
    const client = new Client({ connectionString });
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        client.end();
        resolve({ exists: false, error: 'Connection timeout', canConnect: false });
      }, 10000);

      client.connect((err) => {
        if (err) {
          clearTimeout(timeout);
          client.end();
          resolve({ exists: false, error: err.message, canConnect: false });
        } else {
          client.query(
            "SELECT datname FROM pg_database WHERE datname = $1",
            [dbConfig.database],
            (queryErr, result) => {
              clearTimeout(timeout);
              client.end();
              if (queryErr) {
                resolve({ exists: false, error: queryErr.message, canConnect: true });
              } else {
                resolve({ exists: result.rows.length > 0, canConnect: true });
              }
            }
          );
        }
      });
    });
  } catch (requireError) {
    // Fallback to psql command
    return new Promise((resolve) => {
      const checkCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -lqt`;
      exec(checkCommand, { env: { ...process.env, PGPASSWORD: dbConfig.password } }, (error, stdout) => {
        if (error) {
          resolve({ exists: false, error: error.message, canConnect: false });
        } else {
          const exists = stdout.includes(dbConfig.database);
          resolve({ exists, canConnect: true });
        }
      });
    });
  }
}

async function createDatabase(dbConfig) {
  try {
    // Try to require pg from backend node_modules
    let Client;
    try {
      Client = require(path.join(__dirname, 'backend', 'node_modules', 'pg')).Client;
    } catch {
      Client = require('pg').Client;
    }
    
    // Connect to postgres database to create new database
    const connectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/postgres`;
    const client = new Client({ connectionString });
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        client.end();
        resolve({ success: false, error: 'Connection timeout' });
      }, 10000);

      client.connect((err) => {
        if (err) {
          clearTimeout(timeout);
          client.end();
          resolve({ success: false, error: err.message });
        } else {
          client.query(
            `CREATE DATABASE "${dbConfig.database}"`,
            (queryErr) => {
              clearTimeout(timeout);
              client.end();
              if (queryErr) {
                resolve({ success: false, error: queryErr.message });
              } else {
                resolve({ success: true });
              }
            }
          );
        }
      });
    });
  } catch (requireError) {
    // Fallback to psql command
    return new Promise((resolve) => {
      const createCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -c "CREATE DATABASE \\"${dbConfig.database}\\";"`;
      exec(createCommand, { env: { ...process.env, PGPASSWORD: dbConfig.password } }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  }
}

async function selectFeatures() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         📋 Full-Stack Starter Kit - Setup Profiles        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('🏗️  This is a SKELETON/TEMPLATE full-stack dashboard - your foundation!', 'bright');
  log('   Think of it as the bones of your application, ready to be built upon.\n', 'dim');

  log('💡 What is a Skeleton/Template?', 'yellow');
  log('   • A pre-built foundation with core architecture in place', 'dim');
  log('   • Ready-to-use structure that you build upon and customize', 'dim');
  log('   • Not a finished product - it\'s YOUR starting point', 'dim');
  log('   • The framework is done, now add your unique features!\n', 'dim');

  log('✨ Powered by Kiro AI - Your Development Partner', 'magenta');
  log('   Use Kiro to flesh out this skeleton:', 'dim');
  log('   • Add custom features tailored to your business', 'dim');
  log('   • Build on top of the existing foundation', 'dim');
  log('   • Extend the skeleton with your unique requirements', 'dim');
  log('   • Transform this template into your dream application', 'dim');
  log('   • Get intelligent suggestions and code generation\n', 'dim');

  log('🎯 Remember: This is a SKELETON, not a cage!', 'bright');
  log('   ✓ Enable/disable features anytime via .env files', 'dim');
  log('   ✓ All features are modular building blocks', 'dim');
  log('   ✓ Mix, match, and extend as your project grows', 'dim');
  log('   ✓ These profiles are foundations - build your vision on top!\n', 'dim');

  log('📋 Available Setup Profiles:', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  const profiles = [
    {
      name: 'ecommerce',
      label: 'E-commerce Store',
      description: 'Full e-commerce with products, orders, payments, shipping',
      examples: 'Online shop, marketplace, dropshipping store, retail platform',
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
      label: 'CRM & Business Management',
      description: 'Customer relationship management with calendar & notifications',
      examples: 'Sales CRM, client portal, service business, consulting firm',
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
      label: 'Full-Stack Platform',
      description: 'Everything enabled - all features available',
      examples: 'SaaS platform, enterprise portal, multi-purpose dashboard, agency site',
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
      label: 'Minimal Dashboard',
      description: 'Core features only - dashboard, auth, notifications',
      examples: 'Admin panel, internal tool, simple backend, MVP project',
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
    log(`     ${profile.description}`, 'dim');
    log(`     💼 Use cases: ${profile.examples}`, 'yellow');
    log('');
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

  // Helper function to convert camelCase to SCREAMING_SNAKE_CASE
  function toScreamingSnakeCase(str) {
    return str
      .replace(/([A-Z])/g, (match) => '_' + match) // Add underscore before each capital letter
      .toUpperCase()                                // Convert to uppercase
      .replace(/^_/, '');                           // Remove leading underscore if any
  }

  if (isBackend) {
    // Update backend .env
    for (const [key, value] of Object.entries(features)) {
      const envKey = `ENABLE_${toScreamingSnakeCase(key)}`;
      const pattern = new RegExp(`^${envKey}=.*$`, 'gm');
      const replacement = `${envKey}=${value ? 'true' : 'false'}`;
      
      if (content.match(pattern)) {
        content = content.replace(pattern, replacement);
        log(`  Updated ${envKey}=${value ? 'true' : 'false'}`, 'dim');
      } else {
        log(`  ⚠️  ${envKey} not found in ${filePath}`, 'yellow');
      }
    }
  } else {
    // Update frontend .env.local
    for (const [key, value] of Object.entries(features)) {
      const envKey = `NEXT_PUBLIC_ENABLE_${toScreamingSnakeCase(key)}`;
      const pattern = new RegExp(`^${envKey}=.*$`, 'gm');
      const replacement = `${envKey}=${value ? 'true' : 'false'}`;
      
      if (content.match(pattern)) {
        content = content.replace(pattern, replacement);
        log(`  Updated ${envKey}=${value ? 'true' : 'false'}`, 'dim');
      } else {
        log(`  ⚠️  ${envKey} not found in ${filePath}`, 'yellow');
      }
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

function sanitizeMcpConfig() {
  const mcpConfigPath = path.join(__dirname, '.kiro', 'settings', 'mcp.json');
  
  if (!fs.existsSync(mcpConfigPath)) {
    return { success: false, reason: 'MCP config not found' };
  }

  try {
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    let sanitized = false;

    // Sanitize GitHub token
    if (mcpConfig.mcpServers?.github?.env?.GITHUB_PERSONAL_ACCESS_TOKEN) {
      const token = mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
      if (token && token.length > 8 && !token.includes('YOUR_')) {
        // Replace with placeholder but keep format
        mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = 'YOUR_GITHUB_TOKEN_HERE';
        sanitized = true;
      }
    }

    // Add comments to sensitive fields
    if (sanitized) {
      fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
      return { success: true, sanitized: true };
    }

    return { success: true, sanitized: false };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

async function configureDatabaseConnection() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║              �️  tDatabase Configuration                    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('This starter kit uses PostgreSQL as its database.', 'dim');
  log('You can use a local PostgreSQL instance or a cloud provider.\n', 'dim');

  // Check if PostgreSQL is installed
  const pgInstalled = await checkPostgreSQLInstalled();
  if (pgInstalled) {
    log('✅ PostgreSQL client detected', 'green');
  } else {
    log('⚠️  PostgreSQL client not detected', 'yellow');
    log('   You can still continue if using a remote database.', 'dim');
  }

  log('\n📋 Database Setup Options:', 'bright');
  log('  1. Use existing DATABASE_URL from .env file', 'cyan');
  log('  2. Enter new database connection details', 'cyan');
  log('  3. Skip database configuration (configure manually later)', 'cyan');

  let choice = '';
  while (!['1', '2', '3'].includes(choice)) {
    choice = await question('\nSelect option (1-3): ');
  }

  let databaseUrl = '';
  let dbConfig = null;

  if (choice === '1') {
    // Read existing DATABASE_URL
    const envPath = path.join(__dirname, 'backend', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL="([^"]+)"/);
      if (match) {
        databaseUrl = match[1];
        log(`\n📌 Found existing DATABASE_URL`, 'green');
        log(`   ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`, 'dim');
      } else {
        log('\n❌ No DATABASE_URL found in .env file', 'red');
        log('   Let\'s configure it now.', 'yellow');
        choice = '2'; // Switch to manual entry
      }
    } else {
      log('\n⚠️  .env file not found - will be created', 'yellow');
      log('   Let\'s configure your database connection.', 'dim');
      choice = '2'; // Switch to manual entry
    }
  }
  
  if (choice === '2') {
    // Collect database details
    log('\n📝 Enter Database Connection Details:', 'bright');
    log('   (Press Enter to use default values shown in brackets)\n', 'dim');

    const host = (await question('Database Host [localhost]: ')) || 'localhost';
    const port = (await question('Database Port [5432]: ')) || '5432';
    const user = (await question('Database User [postgres]: ')) || 'postgres';
    const password = await question('Database Password: ');
    const database = (await question('Database Name [myapp]: ')) || 'myapp';

    databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
    dbConfig = { host, port, user, password, database };

    log(`\n📌 Connection string created`, 'green');
    log(`   postgresql://${user}:****@${host}:${port}/${database}`, 'dim');
  } else if (choice === '3') {
    log('\n⏭️  Skipping database configuration', 'yellow');
    log('   Remember to configure DATABASE_URL in backend/.env before running migrations!\n', 'yellow');
    return { skip: true };
  }

  // Parse database URL if not already parsed
  if (!dbConfig) {
    dbConfig = parseDatabaseUrl(databaseUrl);
    if (!dbConfig) {
      log('\n❌ Invalid database URL format', 'red');
      return await configureDatabaseConnection();
    }
  }

  // Test connection
  log('\n🔍 Testing database connection...', 'blue');
  const connectionTest = await testDatabaseConnection(databaseUrl);

  if (connectionTest.success) {
    log('✅ Database connection successful!', 'green');
    return { databaseUrl, dbConfig, connectionSuccess: true };
  } else {
    log('❌ Database connection failed', 'red');
    log(`   Error: ${connectionTest.error}`, 'dim');

    // Check if database exists
    log('\n🔍 Checking if database exists...', 'blue');
    const dbCheck = await checkDatabaseExists(dbConfig);

    if (!dbCheck.canConnect) {
      log('❌ Cannot connect to PostgreSQL server', 'red');
      log(`   Error: ${dbCheck.error}`, 'dim');
      log('\n💡 Possible issues:', 'yellow');
      log('   • PostgreSQL service is not running', 'dim');
      log('   • Wrong host or port', 'dim');
      log('   • Firewall blocking connection', 'dim');
      log('   • Wrong username or password', 'dim');
      
      const retry = await confirm('\nWould you like to re-enter connection details?');
      if (retry) {
        return await configureDatabaseConnection();
      } else {
        log('\n⏭️  Skipping database setup', 'yellow');
        log('   Fix the connection issue and run setup again.', 'dim');
        return { skip: true };
      }
    }

    if (!dbCheck.exists) {
      log(`⚠️  Database "${dbConfig.database}" does not exist`, 'yellow');
      log('   But PostgreSQL server connection is working!', 'green');
      
      const createDb = await confirm('\nWould you like to create this database?');

      if (createDb) {
        log('\n🔨 Creating database...', 'blue');
        const createResult = await createDatabase(dbConfig);

        if (createResult.success) {
          log(`✅ Database "${dbConfig.database}" created successfully!`, 'green');
          
          // Test connection again with new database
          log('\n🔍 Testing connection to new database...', 'blue');
          const newConnectionTest = await testDatabaseConnection(databaseUrl);
          
          if (newConnectionTest.success) {
            log('✅ Connection to new database successful!', 'green');
            return { databaseUrl, dbConfig, connectionSuccess: true, databaseCreated: true };
          } else {
            log('⚠️  Database created but connection test failed', 'yellow');
            log('   This is normal - the database is ready for migrations.', 'dim');
            return { databaseUrl, dbConfig, connectionSuccess: true, databaseCreated: true };
          }
        } else {
          log('❌ Failed to create database', 'red');
          log(`   Error: ${createResult.error}`, 'dim');
          log('\n💡 You can create it manually:', 'yellow');
          log(`   psql -U ${dbConfig.user} -c "CREATE DATABASE ${dbConfig.database};"`, 'dim');
          
          const continueAnyway = await confirm('\nContinue setup anyway? (You can create database manually later)');
          if (continueAnyway) {
            return { databaseUrl, dbConfig, connectionSuccess: false, needsManualSetup: true };
          } else {
            return { skip: true };
          }
        }
      } else {
        log('\n⏭️  Skipping database creation', 'yellow');
        log('   Remember to create the database before running migrations:', 'dim');
        log(`   CREATE DATABASE ${dbConfig.database};`, 'dim');
        
        const continueAnyway = await confirm('\nContinue setup anyway?');
        if (continueAnyway) {
          return { databaseUrl, dbConfig, connectionSuccess: false, needsManualSetup: true };
        } else {
          return { skip: true };
        }
      }
    } else {
      log('⚠️  Database exists but connection failed', 'yellow');
      log('   Please check your credentials and try again.', 'dim');
      const retry = await confirm('\nWould you like to re-enter connection details?');
      if (retry) {
        return await configureDatabaseConnection();
      } else {
        return { skip: true };
      }
    }
  }
}

async function configureTheme() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║              🎨 Theme Configuration                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('Choose the default theme mode for your application.', 'dim');
  log('Users can change this later from their settings.\n', 'dim');

  log('📋 Theme Mode Options:', 'bright');
  log('  1. System (follows OS preference) - Recommended', 'cyan');
  log('  2. Light (always light theme)', 'cyan');
  log('  3. Dark (always dark theme)', 'cyan');

  let choice = '';
  while (!['1', '2', '3'].includes(choice)) {
    choice = await question('\nSelect theme mode (1-3): ');
  }

  const themeModes = {
    '1': 'system',
    '2': 'light',
    '3': 'dark',
  };

  const themeMode = themeModes[choice];
  const themeLabels = {
    'system': 'System (Auto)',
    'light': 'Light',
    'dark': 'Dark',
  };

  log(`\n✅ Selected: ${themeLabels[themeMode]}`, 'green');
  
  return { themeMode };
}

async function configureBranding() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║              🏢 Branding Configuration                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('Set up your brand identity for the application.', 'dim');
  log('Press Enter to use default values or skip optional fields.\n', 'dim');

  const configureBrand = await confirm('Would you like to configure branding now?');
  
  if (!configureBrand) {
    log('\n⏭️  Skipping branding configuration', 'yellow');
    log('   You can configure branding later from Dashboard → Settings → Branding\n', 'dim');
    return { skip: true };
  }

  log('\n📝 Enter your brand information:', 'bright');
  log('   (Leave empty to use defaults)\n', 'dim');

  const brandName = (await question('Brand Name [Dashboard]: ')) || 'Dashboard';
  const tagline = await question('Tagline (optional): ');
  const description = await question('Description (optional): ');
  const websiteUrl = await question('Website URL (optional): ');
  const supportEmail = await question('Support Email (optional): ');

  log('\n💡 Note: Logos and favicon can be uploaded from Dashboard → Settings → Branding', 'yellow');
  log('   • Light theme logo', 'dim');
  log('   • Dark theme logo', 'dim');
  log('   • Favicon\n', 'dim');

  return {
    brandName,
    tagline: tagline || null,
    description: description || null,
    websiteUrl: websiteUrl || null,
    supportEmail: supportEmail || null,
  };
}

async function selectEnvironment() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║              🌍 Environment Selection                      ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('📋 Select your environment:', 'bright');
  log('  1. Development (local development with debug features)', 'cyan');
  log('  2. Production (optimized for deployment)', 'cyan');

  let choice = '';
  while (!['1', '2'].includes(choice)) {
    choice = await question('\nSelect environment (1-2): ');
  }

  const isProduction = choice === '2';

  if (isProduction) {
    log('\n⚠️  PRODUCTION MODE SELECTED', 'yellow');
    log('   Make sure to:', 'yellow');
    log('   • Use strong, unique passwords', 'dim');
    log('   • Enable SSL for database connections', 'dim');
    log('   • Set secure JWT secrets (min 64 characters)', 'dim');
    log('   • Configure proper CORS origins', 'dim');
    log('   • Review all security settings\n', 'dim');
  }

  return { isProduction, envFile: isProduction ? '.env.production' : '.env' };
}

async function verifyEnvironment() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         🔍 Environment Verification                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('Checking your development environment...\n', 'dim');

  let hasErrors = false;
  let hasWarnings = false;

  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { stdio: 'pipe' }).toString().trim();
    const versionNumber = nodeVersion.replace('v', '');
    const majorVersion = parseInt(versionNumber.split('.')[0]);
    
    if (majorVersion >= 18) {
      log(`✅ Node.js ${nodeVersion} (Recommended: v18+)`, 'green');
    } else {
      log(`⚠️  Node.js ${nodeVersion} (Recommended: v18+)`, 'yellow');
      log('   Consider upgrading for better performance and security', 'dim');
      hasWarnings = true;
    }
  } catch {
    log('❌ Node.js not found', 'red');
    log('   Install from: https://nodejs.org/', 'yellow');
    hasErrors = true;
  }

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { stdio: 'pipe' }).toString().trim();
    log(`✅ npm v${npmVersion}`, 'green');
  } catch {
    log('❌ npm not found', 'red');
    hasErrors = true;
  }

  // Check PostgreSQL
  try {
    const pgVersion = execSync('psql --version', { stdio: 'pipe' }).toString().trim();
    log(`✅ PostgreSQL installed (${pgVersion})`, 'green');
  } catch {
    log('⚠️  PostgreSQL client not detected', 'yellow');
    log('   Options:', 'dim');
    log('   • Install locally: https://www.postgresql.org/download/', 'dim');
    log('   • Use cloud service: Supabase, Railway, Neon, AWS RDS', 'dim');
    log('   • Use Docker: docker run -p 5432:5432 postgres', 'dim');
    log('   You can continue setup and configure database connection later.', 'dim');
    hasWarnings = true;
  }

  // Check if backend dependencies exist
  const backendPackageJson = path.join(__dirname, 'backend', 'package.json');
  if (fs.existsSync(backendPackageJson)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(backendPackageJson, 'utf8'));
      
      // Check for NestJS
      if (pkg.dependencies['@nestjs/core']) {
        log(`✅ NestJS backend detected (v${pkg.dependencies['@nestjs/core']})`, 'green');
      } else {
        log('⚠️  NestJS not found in backend dependencies', 'yellow');
        hasWarnings = true;
      }

      // Check for Prisma
      if (pkg.dependencies['@prisma/client']) {
        log(`✅ Prisma ORM detected (v${pkg.dependencies['@prisma/client']})`, 'green');
      } else {
        log('⚠️  Prisma not found in backend dependencies', 'yellow');
        hasWarnings = true;
      }
    } catch (error) {
      log('⚠️  Could not read backend package.json', 'yellow');
      hasWarnings = true;
    }
  } else {
    log('❌ Backend package.json not found', 'red');
    log('   Make sure you are running this from the project root directory', 'yellow');
    hasErrors = true;
  }

  // Check if frontend dependencies exist
  const frontendPackageJson = path.join(__dirname, 'frontend', 'package.json');
  if (fs.existsSync(frontendPackageJson)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(frontendPackageJson, 'utf8'));
      
      // Check for Next.js
      if (pkg.dependencies['next']) {
        log(`✅ Next.js frontend detected (v${pkg.dependencies['next']})`, 'green');
      } else {
        log('⚠️  Next.js not found in frontend dependencies', 'yellow');
        hasWarnings = true;
      }

      // Check for React
      if (pkg.dependencies['react']) {
        log(`✅ React detected (v${pkg.dependencies['react']})`, 'green');
      } else {
        log('⚠️  React not found in frontend dependencies', 'yellow');
        hasWarnings = true;
      }
    } catch (error) {
      log('⚠️  Could not read frontend package.json', 'yellow');
      hasWarnings = true;
    }
  } else {
    log('❌ Frontend package.json not found', 'red');
    log('   Make sure you are running this from the project root directory', 'yellow');
    hasErrors = true;
  }

  // Summary
  log('');
  if (hasErrors) {
    log('❌ Critical issues found. Please fix the errors above before continuing.', 'red');
    const continueAnyway = await confirm('\nDo you want to continue anyway? (Not recommended)');
    if (!continueAnyway) {
      log('\n👋 Setup cancelled. Fix the issues and run setup again.', 'yellow');
      process.exit(1);
    }
  } else if (hasWarnings) {
    log('⚠️  Some warnings detected. Setup can continue but you may need to install dependencies.', 'yellow');
    const continueSetup = await confirm('\nContinue with setup?');
    if (!continueSetup) {
      log('\n👋 Setup cancelled.', 'yellow');
      process.exit(0);
    }
  } else {
    log('✅ All checks passed! Your environment is ready.', 'green');
  }

  return { hasErrors, hasWarnings };
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║    🏗️  Full-Stack Skeleton/Template - Setup Wizard       ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('Welcome to your application skeleton setup!', 'bright');
  log('This template provides the foundation - you build the rest.\n', 'dim');
  
  log('💡 What you\'re getting:', 'yellow');
  log('   • A complete skeleton/template with core architecture', 'dim');
  log('   • Pre-built foundation ready for customization', 'dim');
  log('   • The bones of your app - now add the muscles!\n', 'dim');

  // Step 0: Ensure environment files exist
  log('Step 0: Preparing Environment Files', 'bright');
  log('─────────────────────────────────────────────────────────────', 'cyan');
  ensureEnvFiles();

  // Step 1: Verify environment
  log('\nStep 1: Environment Verification', 'bright');
  log('─────────────────────────────────────────────────────────────', 'cyan');

  const envCheck = await verifyEnvironment();

  // Step 2: Environment selection
  log('\nStep 2: Environment Configuration', 'bright');
  log('─────────────────────────────────────────────────────────────', 'cyan');

  const environment = await selectEnvironment();

  // Step 3: Feature selection
  log('\nStep 3: Feature Selection', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  const features = await selectFeatures();

  log('\n📝 Selected Features:', 'bright');
  for (const [key, enabled] of Object.entries(features)) {
    const status = enabled ? '✅' : '❌';
    log(`  ${status} ${key}`, enabled ? 'green' : 'dim');
  }

  // Step 4: Theme configuration
  log('\nStep 4: Theme Configuration', 'bright');
  log('─────────────────────────────────────────────────────────────', 'cyan');

  const theme = await configureTheme();

  // Step 5: Branding configuration
  log('\nStep 5: Branding Configuration', 'bright');
  log('─────────────────────────────────────────────────────────────', 'cyan');

  const branding = await configureBranding();

  // Step 6: Update environment files
  log('\nStep 6: Updating Environment Files', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  try {
    updateEnvFile(`backend/${environment.envFile}`, features, true);
    log(`✅ Updated backend/${environment.envFile}`, 'green');

    updateEnvFile('frontend/.env.local', features, false);
    log('✅ Updated frontend/.env.local', 'green');
  } catch (error) {
    log(`❌ Failed to update environment files: ${error.message}`, 'red');
    process.exit(1);
  }

  // Step 7: Install dependencies (MOVED BEFORE DATABASE TESTING)
  log('\nStep 7: Installing Dependencies', 'bright');
  log('─────────────────────────────────────────────────────────────\n', 'cyan');

  log('💡 Installing backend dependencies first (required for database operations)...', 'yellow');
  if (!runCommand('npm install', 'backend')) {
    log('⚠️  Backend dependencies installation had issues', 'yellow');
    log('   Database operations may fail without pg module', 'dim');
  } else {
    log('✅ Backend dependencies installed', 'green');
  }

  const installFrontend = await confirm('\nInstall frontend dependencies now?');
  if (installFrontend) {
    if (!runCommand('npm install', 'frontend')) {
      log('⚠️  Frontend dependencies installation had issues', 'yellow');
    } else {
      log('✅ Frontend dependencies installed', 'green');
    }
  } else {
    log('⏭️  Skipping frontend dependencies (you can install later with: cd frontend && npm install)', 'yellow');
  }

  // Step 8: Database configuration (MOVED AFTER DEPENDENCIES)
  log('\nStep 8: Database Configuration', 'bright');
  log('─────────────────────────────────────────────────────────────', 'cyan');

  const dbSetup = await configureDatabaseConnection();

  if (!dbSetup.skip && dbSetup.databaseUrl) {
    // Update .env file with database URL
    const envPath = path.join(__dirname, 'backend', environment.envFile);
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(
        /DATABASE_URL="[^"]*"/,
        `DATABASE_URL="${dbSetup.databaseUrl}"`
      );
      fs.writeFileSync(envPath, envContent);
      log(`\n✅ Updated ${environment.envFile} with database connection`, 'green');
    }

    // Update MCP configuration with new database connection
    const mcpConfigPath = path.join(__dirname, '.kiro', 'settings', 'mcp.json');
    if (fs.existsSync(mcpConfigPath)) {
      try {
        const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        
        if (mcpConfig.mcpServers && mcpConfig.mcpServers.postgres) {
          // Update postgres MCP with new connection string
          mcpConfig.mcpServers.postgres.env.DATABASE_URI = dbSetup.databaseUrl;
          
          // Hide sensitive tokens in GitHub MCP if present
          if (mcpConfig.mcpServers.github && mcpConfig.mcpServers.github.env && mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
            const token = mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
            if (token && token.length > 8) {
              // Keep token but add a comment for user awareness
              log('   ℹ️  GitHub MCP token detected (keeping existing token)', 'cyan');
            }
          }
          
          fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
          log('✅ Updated MCP configuration with database connection', 'green');
          
          log('\n📋 MCP (Model Context Protocol) Configuration:', 'bright');
          log('   Your project includes powerful MCP integrations:', 'dim');
          log('', 'reset');
          log('   🗄️  Postgres MCP - Database operations via AI', 'cyan');
          log('      • Query, analyze, and optimize your database', 'dim');
          log('      • Get schema insights and performance recommendations', 'dim');
          log('      • Connection: Updated with your database credentials', 'green');
          log('', 'reset');
          log('   🐙 GitHub MCP - Repository operations via AI', 'cyan');
          log('      • Search repos, create issues, manage PRs', 'dim');
          log('      • Read/write files directly to GitHub', 'dim');
          if (mcpConfig.mcpServers.github && !mcpConfig.mcpServers.github.disabled) {
            log('      • Status: ✅ Configured and enabled', 'green');
          } else {
            log('      • Status: ⚠️  Needs GitHub token configuration', 'yellow');
          }
          log('', 'reset');
          log('   🌐 Fetch MCP - Web scraping and API calls', 'cyan');
          log('      • Fetch and parse web content', 'dim');
          log('      • Make HTTP requests via AI', 'dim');
          log('', 'reset');
          log('   🕐 Time MCP - Timezone operations', 'cyan');
          log('      • Convert times between timezones', 'dim');
          log('      • Get current time in any timezone', 'dim');
          log('', 'reset');
          
          log('   💡 Required Tools:', 'yellow');
          log('      • uvx (Python package runner) - Required for Postgres, Time, Fetch MCPs', 'dim');
          log('        Install: https://docs.astral.sh/uv/getting-started/installation/', 'dim');
          log('      • npx (Node package runner) - Already installed with npm ✅', 'dim');
          log('', 'reset');
          
          log('   📖 Learn more about MCP:', 'bright');
          log('      • Open Command Palette → "MCP" to manage servers', 'dim');
          log('      • View MCP Servers in Kiro sidebar', 'dim');
          log('      • Configuration: .kiro/settings/mcp.json', 'dim');
          log('', 'reset');
        }
      } catch (error) {
        log(`   ⚠️  Could not update MCP configuration: ${error.message}`, 'yellow');
      }
    }
  }

  // Step 9: Database initialization
  if (!dbSetup.skip) {
    log('\nStep 9: Database Initialization', 'bright');
    log('─────────────────────────────────────────────────────────────\n', 'cyan');

    if (dbSetup.connectionSuccess) {
      log('📊 Database Status:', 'bright');
      log(`   Host: ${dbSetup.dbConfig.host}:${dbSetup.dbConfig.port}`, 'dim');
      log(`   Database: ${dbSetup.dbConfig.database}`, 'dim');
      log(`   User: ${dbSetup.dbConfig.user}`, 'dim');
      if (dbSetup.databaseCreated) {
        log(`   Status: ✅ Newly created`, 'green');
      } else {
        log(`   Status: ✅ Connected`, 'green');
      }

      const initDb = await confirm('\nInitialize database with Prisma migrations?');
      if (initDb) {
        log('\n🔄 Running Prisma migrations...', 'blue');
        
        // Generate Prisma client first
        if (runCommand('npx prisma generate', 'backend')) {
          log('✅ Prisma client generated', 'green');
        }

        // Run migrations
        let databaseWasReset = false;
        if (dbSetup.databaseCreated) {
          // New database - deploy migrations
          if (runCommand('npx prisma migrate deploy', 'backend')) {
            log('✅ Database migrations applied', 'green');
          } else {
            log('⚠️  Migration failed - trying alternative method', 'yellow');
            if (runCommand('npx prisma db push', 'backend')) {
              log('✅ Database schema pushed', 'green');
            }
          }
        } else {
          // Existing database - ask about reset
          const resetDb = await confirm('Reset existing database? (⚠️  This will delete all data)');
          if (resetDb) {
            if (runCommand('npx prisma migrate reset --force', 'backend')) {
              log('✅ Database reset and migrated', 'green');
              databaseWasReset = true;
              log('✅ Database seeded automatically by Prisma reset', 'green');
            }
          } else {
            if (runCommand('npx prisma migrate deploy', 'backend')) {
              log('✅ Database migrations applied', 'green');
            }
          }
        }

        // Step 10: Seed database (skip if already seeded by reset)
        if (!databaseWasReset) {
          log('\nStep 10: Seeding Database', 'bright');
          log('─────────────────────────────────────────────────────────────\n', 'cyan');

          const seed = await confirm('Seed database with initial data?');
          if (seed) {
          const seedEnv = {
            ...process.env,
            ENABLE_LANDING: features.landing ? 'true' : 'false',
            ENABLE_BLOG: features.blog ? 'true' : 'false',
            ENABLE_ECOMMERCE: features.ecommerce ? 'true' : 'false',
            ENABLE_CALENDAR: features.calendar ? 'true' : 'false',
            ENABLE_CRM: features.crm ? 'true' : 'false',
            ENABLE_NOTIFICATIONS: features.notifications ? 'true' : 'false',
            ENABLE_CUSTOMER_ACCOUNT: features.customerAccount ? 'true' : 'false',
            // Pass theme mode to seed script
            THEME_MODE: theme.themeMode,
            // Pass branding data to seed script
            BRAND_NAME: branding.skip ? '' : branding.brandName,
            BRAND_TAGLINE: branding.skip ? '' : (branding.tagline || ''),
            BRAND_DESCRIPTION: branding.skip ? '' : (branding.description || ''),
            BRAND_WEBSITE_URL: branding.skip ? '' : (branding.websiteUrl || ''),
            BRAND_SUPPORT_EMAIL: branding.skip ? '' : (branding.supportEmail || ''),
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
            log('❌ Database seeding failed', 'red');
            log('   You can run seeding manually later with: npm run prisma:seed', 'dim');
          }
        }
        } else {
          log('\nStep 10: Seeding Database', 'bright');
          log('─────────────────────────────────────────────────────────────\n', 'cyan');
          log('⏭️  Database already seeded by Prisma reset', 'green');
        }
      }
    } else {
      log('\n⚠️  Database connection not established', 'yellow');
      log('   Skipping database initialization', 'dim');
      log('   Configure DATABASE_URL in backend/.env and run:', 'yellow');
      log('   • npx prisma generate', 'dim');
      log('   • npx prisma migrate deploy', 'dim');
      log('   • npm run prisma:seed\n', 'dim');
    }
  } else {
    log('\nStep 9: Database Initialization', 'bright');
    log('─────────────────────────────────────────────────────────────\n', 'cyan');
    log('⏭️  Database setup skipped', 'yellow');
    log('   Remember to configure and initialize your database manually!\n', 'dim');
  }

  // Step 11: Production warnings
  if (environment.isProduction) {
    log('\nStep 11: Production Security Checklist', 'bright');
    log('─────────────────────────────────────────────────────────────\n', 'cyan');
    log('⚠️  IMPORTANT: Before deploying to production:', 'yellow');
    log('   ☐ Change JWT_SECRET to a strong random string (min 64 chars)', 'dim');
    log('   ☐ Update DATABASE_URL with production credentials', 'dim');
    log('   ☐ Enable SSL for database connections', 'dim');
    log('   ☐ Set CORS_ORIGIN to your production domain', 'dim');
    log('   ☐ Review and update all passwords', 'dim');
    log('   ☐ Enable ENABLE_AUDIT_LOGGING=true', 'dim');
    log('   ☐ Set NODE_ENV=production', 'dim');
    log('   ☐ Configure proper rate limiting', 'dim');
    log('   ☐ Set up SSL certificates', 'dim');
    log('   ☐ Configure backup strategy\n', 'dim');
  }

  // Final Summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'green');
  log('║              ✅ Setup Complete! 🎉                         ║', 'green');
  log('╚════════════════════════════════════════════════════════════╝\n', 'green');

  log('📋 Next Steps:', 'bright');
  log('  1. Start the backend server:', 'cyan');
  log(`     cd backend && npm run ${environment.isProduction ? 'start' : 'start:dev'}\n`, 'yellow');

  log('  2. In another terminal, start the frontend:', 'cyan');
  log(`     cd frontend && npm run ${environment.isProduction ? 'start' : 'dev'}\n`, 'yellow');

  log('  3. Open your browser and go to:', 'cyan');
  log('     http://localhost:3000\n', 'yellow');

  if (!environment.isProduction) {
    log('  4. Log in with default credentials:', 'cyan');
    log('     Email: admin@dashtact.com', 'yellow');
    log('     Password: dashtact\n', 'yellow');
    log('⚠️  IMPORTANT: Change the default password immediately after login!\n', 'yellow');
  }

  log('📚 Useful Commands:', 'bright');
  log('  • View database: cd backend && npx prisma studio', 'cyan');
  log('  • Run migrations: cd backend && npx prisma migrate deploy', 'cyan');
  log('  • Seed database: cd backend && npm run prisma:seed', 'cyan');
  log('  • Reset database: cd backend && npx prisma migrate reset', 'cyan');
  log('  • Generate Prisma client: cd backend && npx prisma generate\n', 'cyan');

  log('📖 Documentation:', 'bright');
  log('  • README.md - Project overview', 'dim');
  log('  • backend/README.md - Backend documentation', 'dim');
  log('  • frontend/README.md - Frontend documentation', 'dim');
  log('  • documentation/ - Additional guides\n', 'dim');

  log('🔐 MCP Security Note:', 'yellow');
  log('  • MCP configuration: .kiro/settings/mcp.json', 'dim');
  log('  • Contains database connection and API tokens', 'dim');
  log('  • ⚠️  DO NOT commit sensitive tokens to Git!', 'red');
  log('  • Add .kiro/settings/mcp.json to .gitignore if sharing publicly', 'dim');
  log('  • Use environment variables for production deployments\n', 'dim');

  log('🏗️  Transform This Skeleton with Kiro AI:', 'magenta');
  log('   The skeleton is ready - now bring it to life!', 'bright');
  log('', 'reset');
  log('  • Flesh out the skeleton: "Add a booking system to the calendar"', 'dim');
  log('  • Customize the template: "Redesign the dashboard for my industry"', 'dim');
  log('  • Extend the foundation: "Add multi-tenant support"', 'dim');
  log('  • Build new features: "Create a custom reporting module"', 'dim');
  log('  • Get expert guidance: "What\'s the best way to structure this?"', 'dim');
  log('  • Integrate anything: "Connect Stripe, Twilio, AWS, etc."\n', 'dim');

  log('🦴 → 💪 From Skeleton to Complete Application:', 'bright');
  log('   ✓ The bones are built (architecture, auth, database)', 'dim');
  log('   ✓ The foundation is solid (security, best practices)', 'dim');
  log('   ✓ The structure is ready (modular, scalable)', 'dim');
  log('   ✓ Now add YOUR unique features and business logic', 'green');
  log('   ✓ Transform this template into your dream application!', 'green');
  log('', 'reset');
  log('🎯 This skeleton + Your vision + Kiro AI = 🚀 Amazing Application!\n', 'magenta');

  log('✨ Happy building! 🎉\n', 'green');

  rl.close();
}

main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, 'yellow');
  rl.close();
  process.exit(1);
});
