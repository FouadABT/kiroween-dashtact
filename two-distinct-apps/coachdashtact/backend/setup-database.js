#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection(config) {
  const client = new Client(config);
  try {
    await client.connect();
    await client.query('SELECT NOW()');
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

function generateConnectionString(config) {
  const { user, password, host, port, database } = config;
  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
}

function updateEnvFile(connectionString) {
  const envPath = path.join(__dirname, '.env');
  
  try {
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add DATABASE_URL
    const lines = envContent.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('DATABASE_URL=')) {
        lines[i] = `DATABASE_URL="${connectionString}"`;
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      lines.unshift(`DATABASE_URL="${connectionString}"`);
    }
    
    // Ensure other required env vars exist
    const requiredVars = {
      'PORT': '3001',
      'NODE_ENV': 'development',
      'JWT_SECRET': 'your-secret-key-here'
    };
    
    Object.entries(requiredVars).forEach(([key, defaultValue]) => {
      const exists = lines.some(line => line.startsWith(`${key}=`));
      if (!exists) {
        lines.push(`${key}=${defaultValue}`);
      }
    });
    
    fs.writeFileSync(envPath, lines.join('\n'));
    console.log('✅ Updated .env file');
    
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
  }
}

async function createDatabase(config, dbName) {
  const adminConfig = { ...config, database: 'postgres' };
  const client = new Client(adminConfig);
  
  try {
    await client.connect();
    await client.query(`CREATE DATABASE "${dbName}"`);
    await client.end();
    console.log(`✅ Database "${dbName}" created successfully`);
    return true;
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`ℹ️  Database "${dbName}" already exists`);
      return true;
    }
    console.error('❌ Failed to create database:', error.message);
    return false;
  }
}

async function main() {
  console.log('🐘 PostgreSQL Database Setup Tool');
  console.log('==================================\n');
  
  try {
    // Get database connection details
    const host = await question('Enter PostgreSQL host (default: localhost): ') || 'localhost';
    const port = await question('Enter PostgreSQL port (default: 5432): ') || '5432';
    const user = await question('Enter PostgreSQL username (default: postgres): ') || 'postgres';
    const password = await question('Enter PostgreSQL password: ');
    const database = await question('Enter database name (default: myapp): ') || 'myapp';
    
    console.log('\n🔍 Testing connection...');
    
    const config = {
      host,
      port: parseInt(port),
      user,
      password,
      database: 'postgres' // Connect to default database first
    };
    
    // Test connection to PostgreSQL server
    const connected = await testConnection(config);
    
    if (!connected) {
      console.log('\n❌ Could not connect to PostgreSQL server.');
      console.log('Please check your connection details and try again.');
      rl.close();
      return;
    }
    
    console.log('✅ Connected to PostgreSQL server');
    
    // Create database if it doesn't exist
    console.log(`\n📦 Creating database "${database}"...`);
    const dbCreated = await createDatabase(config, database);
    
    if (!dbCreated) {
      rl.close();
      return;
    }
    
    // Test connection to the specific database
    config.database = database;
    console.log(`\n🔍 Testing connection to "${database}" database...`);
    const dbConnected = await testConnection(config);
    
    if (!dbConnected) {
      console.log(`\n❌ Could not connect to database "${database}".`);
      rl.close();
      return;
    }
    
    console.log(`✅ Successfully connected to "${database}" database`);
    
    // Generate connection string and update .env
    const connectionString = generateConnectionString(config);
    console.log('\n📝 Updating .env file...');
    updateEnvFile(connectionString);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. npm run prisma:generate');
    console.log('2. npm run prisma:migrate');
    console.log('3. npm run start:dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}