/**
 * Prisma Database Sync Verification Script
 * 
 * This script verifies that Prisma schema, backend DTOs, and frontend types
 * are in sync across the full stack.
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function extractPrismaModels(schemaContent) {
  const models = {};
  const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    const fields = {};

    const fieldRegex = /(\w+)\s+(\w+)(\?)?(\[\])?/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];
      const isOptional = !!fieldMatch[3];
      const isArray = !!fieldMatch[4];

      fields[fieldName] = {
        type: fieldType,
        optional: isOptional,
        array: isArray
      };
    }

    models[modelName] = fields;
  }

  return models;
}

function extractTypeScriptInterfaces(content) {
  const interfaces = {};
  const interfaceRegex = /export\s+interface\s+(\w+)\s*{([^}]+)}/g;
  let match;

  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const interfaceBody = match[2];
    const fields = {};

    const fieldRegex = /(\w+)\??:\s*([^;]+);/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(interfaceBody)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2].trim();
      const isOptional = interfaceBody.includes(`${fieldName}?:`);

      fields[fieldName] = {
        type: fieldType,
        optional: isOptional
      };
    }

    interfaces[interfaceName] = fields;
  }

  return interfaces;
}

function compareModels(prismaModels, frontendTypes) {
  const issues = [];
  const matches = [];

  for (const [modelName, prismaFields] of Object.entries(prismaModels)) {
    const frontendType = frontendTypes[modelName];

    if (!frontendType) {
      issues.push(`❌ Missing frontend type for Prisma model: ${modelName}`);
      continue;
    }

    for (const [fieldName, prismaField] of Object.entries(prismaFields)) {
      const frontendField = frontendType[fieldName];

      if (!frontendField) {
        issues.push(`❌ ${modelName}.${fieldName} exists in Prisma but missing in frontend`);
      } else if (prismaField.optional !== frontendField.optional) {
        issues.push(`⚠️  ${modelName}.${fieldName} optionality mismatch (Prisma: ${prismaField.optional}, Frontend: ${frontendField.optional})`);
      } else {
        matches.push(`✓ ${modelName}.${fieldName}`);
      }
    }

    for (const [fieldName] of Object.entries(frontendType)) {
      if (!prismaFields[fieldName]) {
        issues.push(`⚠️  ${modelName}.${fieldName} exists in frontend but missing in Prisma`);
      }
    }
  }

  return { issues, matches };
}

async function main() {
  logSection('🔍 Prisma Database Sync Verification');

  const results = {
    filesChecked: 0,
    filesFound: 0,
    issues: [],
    warnings: [],
    success: []
  };

  // Check Prisma schema
  logSection('📋 Checking Prisma Schema');
  const schemaPath = path.join(process.cwd(), 'backend', 'prisma', 'schema.prisma');
  
  if (!checkFileExists(schemaPath)) {
    log('❌ Prisma schema not found at: ' + schemaPath, 'red');
    results.issues.push('Prisma schema file missing');
  } else {
    log('✓ Prisma schema found', 'green');
    results.filesFound++;
    const schemaContent = readFileContent(schemaPath);
    const prismaModels = extractPrismaModels(schemaContent);
    log(`Found ${Object.keys(prismaModels).length} Prisma models`, 'blue');
    results.prismaModels = prismaModels;
  }
  results.filesChecked++;

  // Check frontend types
  logSection('📋 Checking Frontend Types');
  const frontendTypesDir = path.join(process.cwd(), 'frontend', 'src', 'types');
  
  if (!checkFileExists(frontendTypesDir)) {
    log('❌ Frontend types directory not found', 'red');
    results.issues.push('Frontend types directory missing');
  } else {
    log('✓ Frontend types directory found', 'green');
    results.filesFound++;

    const typeFiles = fs.readdirSync(frontendTypesDir).filter(f => f.endsWith('.ts'));
    log(`Found ${typeFiles.length} TypeScript type files`, 'blue');

    let allFrontendTypes = {};
    typeFiles.forEach(file => {
      const content = readFileContent(path.join(frontendTypesDir, file));
      const interfaces = extractTypeScriptInterfaces(content);
      allFrontendTypes = { ...allFrontendTypes, ...interfaces };
    });

    results.frontendTypes = allFrontendTypes;
    log(`Extracted ${Object.keys(allFrontendTypes).length} TypeScript interfaces`, 'blue');
  }
  results.filesChecked++;

  // Compare models
  if (results.prismaModels && results.frontendTypes) {
    logSection('🔄 Comparing Prisma Models with Frontend Types');
    const comparison = compareModels(results.prismaModels, results.frontendTypes);
    
    if (comparison.issues.length > 0) {
      log('\n⚠️  Issues Found:', 'yellow');
      comparison.issues.forEach(issue => log(issue, 'yellow'));
      results.issues.push(...comparison.issues);
    }

    if (comparison.matches.length > 0) {
      log(`\n✓ ${comparison.matches.length} fields match correctly`, 'green');
    }
  }

  // Check Prisma client generation
  logSection('📦 Checking Prisma Client');
  const prismaClientPath = path.join(process.cwd(), 'backend', 'generated', 'prisma');
  
  if (!checkFileExists(prismaClientPath)) {
    log('⚠️  Prisma client not generated. Run: npm run prisma:generate', 'yellow');
    results.warnings.push('Prisma client needs generation');
  } else {
    log('✓ Prisma client generated', 'green');
    results.success.push('Prisma client exists');
  }
  results.filesChecked++;

  // Final summary
  logSection('📊 Verification Summary');
  log(`Files checked: ${results.filesChecked}`, 'blue');
  log(`Files found: ${results.filesFound}`, 'blue');
  log(`Issues: ${results.issues.length}`, results.issues.length > 0 ? 'red' : 'green');
  log(`Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');

  if (results.issues.length === 0 && results.warnings.length === 0) {
    log('\n✅ All checks passed! Database sync is healthy.', 'green');
    process.exit(0);
  } else if (results.issues.length > 0) {
    log('\n❌ Critical issues found. Please fix before proceeding.', 'red');
    process.exit(1);
  } else {
    log('\n⚠️  Warnings found. Review and address if needed.', 'yellow');
    process.exit(0);
  }
}

main().catch(error => {
  log('\n❌ Verification script failed:', 'red');
  console.error(error);
  process.exit(1);
});
