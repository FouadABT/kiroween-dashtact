#!/usr/bin/env node

/**
 * Password Reset API Sync Verification Script
 * 
 * Verifies that frontend API client methods match backend endpoints
 * for password reset functionality.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Password Reset API Sync...\n');

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

function logPass(message) {
  results.passed.push(message);
  console.log(`✅ ${message}`);
}

function logFail(message) {
  results.failed.push(message);
  console.log(`❌ ${message}`);
}

function logWarn(message) {
  results.warnings.push(message);
  console.log(`⚠️  ${message}`);
}

// Check if files exist
const filesToCheck = [
  'frontend/src/lib/api.ts',
  'frontend/src/types/auth.ts',
  'backend/src/auth/auth.controller.ts',
  'backend/src/auth/dto/forgot-password.dto.ts',
  'backend/src/auth/dto/validate-reset-token.dto.ts',
  'backend/src/auth/dto/reset-password.dto.ts',
  'backend/src/email/email.controller.ts',
];

console.log('📁 Checking required files...\n');

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    logPass(`File exists: ${file}`);
  } else {
    logFail(`File missing: ${file}`);
  }
});

console.log('\n📋 Checking API methods...\n');

// Check frontend API methods
const apiFile = fs.readFileSync('frontend/src/lib/api.ts', 'utf8');

const methodsToCheck = [
  {
    name: 'forgotPassword',
    pattern: /static async forgotPassword\(email: string\)/,
    endpoint: '/auth/forgot-password',
  },
  {
    name: 'validateResetToken',
    pattern: /static async validateResetToken\(token: string\)/,
    endpoint: '/auth/validate-reset-token',
  },
  {
    name: 'resetPassword',
    pattern: /static async resetPassword\(token: string, newPassword: string\)/,
    endpoint: '/auth/reset-password',
  },
  {
    name: 'isEmailSystemEnabled',
    pattern: /static async isEmailSystemEnabled\(\)/,
    endpoint: '/email/configuration',
  },
];

methodsToCheck.forEach(method => {
  if (method.pattern.test(apiFile)) {
    logPass(`API method exists: ${method.name}`);
    
    // Check if endpoint is referenced
    if (apiFile.includes(method.endpoint)) {
      logPass(`  → Endpoint referenced: ${method.endpoint}`);
    } else {
      logFail(`  → Endpoint NOT referenced: ${method.endpoint}`);
    }
  } else {
    logFail(`API method missing: ${method.name}`);
  }
});

console.log('\n🔧 Checking backend endpoints...\n');

// Check backend controller
const controllerFile = fs.readFileSync('backend/src/auth/auth.controller.ts', 'utf8');

const endpointsToCheck = [
  {
    name: 'forgot-password',
    pattern: /@Post\('forgot-password'\)/,
    dto: 'ForgotPasswordDto',
  },
  {
    name: 'validate-reset-token',
    pattern: /@Post\('validate-reset-token'\)/,
    dto: 'ValidateResetTokenDto',
  },
  {
    name: 'reset-password',
    pattern: /@Post\('reset-password'\)/,
    dto: 'ResetPasswordDto',
  },
];

endpointsToCheck.forEach(endpoint => {
  if (endpoint.pattern.test(controllerFile)) {
    logPass(`Backend endpoint exists: ${endpoint.name}`);
    
    // Check if DTO is used
    if (controllerFile.includes(endpoint.dto)) {
      logPass(`  → DTO used: ${endpoint.dto}`);
    } else {
      logWarn(`  → DTO not found: ${endpoint.dto}`);
    }
  } else {
    logFail(`Backend endpoint missing: ${endpoint.name}`);
  }
});

// Check email configuration endpoint
const emailControllerFile = fs.readFileSync('backend/src/email/email.controller.ts', 'utf8');

if (/@Get\('configuration'\)/.test(emailControllerFile)) {
  logPass('Email configuration endpoint exists');
} else {
  logFail('Email configuration endpoint missing');
}

console.log('\n📝 Checking DTOs...\n');

const dtosToCheck = [
  {
    file: 'backend/src/auth/dto/forgot-password.dto.ts',
    field: 'email',
    type: 'string',
  },
  {
    file: 'backend/src/auth/dto/validate-reset-token.dto.ts',
    field: 'token',
    type: 'string',
  },
  {
    file: 'backend/src/auth/dto/reset-password.dto.ts',
    field: 'token',
    type: 'string',
  },
  {
    file: 'backend/src/auth/dto/reset-password.dto.ts',
    field: 'newPassword',
    type: 'string',
  },
];

dtosToCheck.forEach(dto => {
  if (fs.existsSync(dto.file)) {
    const content = fs.readFileSync(dto.file, 'utf8');
    if (content.includes(dto.field)) {
      logPass(`DTO field exists: ${dto.field} in ${path.basename(dto.file)}`);
    } else {
      logFail(`DTO field missing: ${dto.field} in ${path.basename(dto.file)}`);
    }
  }
});

console.log('\n🧪 Checking tests...\n');

const testFile = 'frontend/src/lib/__tests__/api-password-reset.test.ts';
if (fs.existsSync(testFile)) {
  logPass('Test file exists');
  
  const testContent = fs.readFileSync(testFile, 'utf8');
  
  const testsToCheck = [
    'forgotPassword',
    'validateResetToken',
    'resetPassword',
    'isEmailSystemEnabled',
  ];
  
  testsToCheck.forEach(test => {
    if (testContent.includes(`describe('${test}'`)) {
      logPass(`  → Test suite exists: ${test}`);
    } else {
      logWarn(`  → Test suite missing: ${test}`);
    }
  });
} else {
  logWarn('Test file not found (optional)');
}

console.log('\n📊 Summary\n');
console.log('='.repeat(50));
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);
console.log('='.repeat(50));

if (results.failed.length > 0) {
  console.log('\n❌ Verification FAILED\n');
  console.log('Failed checks:');
  results.failed.forEach(msg => console.log(`  - ${msg}`));
  process.exit(1);
} else if (results.warnings.length > 0) {
  console.log('\n⚠️  Verification PASSED with warnings\n');
  console.log('Warnings:');
  results.warnings.forEach(msg => console.log(`  - ${msg}`));
  process.exit(0);
} else {
  console.log('\n✅ All checks PASSED!\n');
  console.log('Password reset API is fully synced between frontend and backend.');
  process.exit(0);
}
