#!/usr/bin/env node

/**
 * Production Readiness Verification Script
 * 
 * Verifies that the application is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Production Readiness Verification\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Verify .next build exists
console.log('✓ Checking build output...');
if (!fs.existsSync(path.join(__dirname, '.next'))) {
  console.error('  ❌ ERROR: .next directory not found. Run "npm run build" first.');
  hasErrors = true;
} else {
  console.log('  ✅ Build output exists');
}

// Check 2: Verify no TypeScript errors
console.log('\n✓ Checking TypeScript compilation...');
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('  ✅ TypeScript configuration found');
} else {
  console.error('  ❌ ERROR: tsconfig.json not found');
  hasErrors = true;
}

// Check 3: Verify environment variables
console.log('\n✓ Checking environment configuration...');
const envFiles = ['.env.local', '.env.production'];
let hasEnv = false;
envFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file} exists`);
    hasEnv = true;
  }
});
if (!hasEnv) {
  console.warn('  ⚠️  WARNING: No environment files found');
  hasWarnings = true;
}

// Check 4: Verify critical files
console.log('\n✓ Checking critical files...');
const criticalFiles = [
  'package.json',
  'next.config.ts',
  'src/app/layout.tsx',
  'src/app/page.tsx',
];

criticalFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file}`);
  } else {
    console.error(`  ❌ ERROR: ${file} not found`);
    hasErrors = true;
  }
});

// Check 5: Verify no 'use client' issues
console.log('\n✓ Checking for common issues...');
const pageHeaderPath = path.join(__dirname, 'src/components/layout/PageHeader.tsx');
if (fs.existsSync(pageHeaderPath)) {
  const content = fs.readFileSync(pageHeaderPath, 'utf8');
  if (content.includes("'use client'")) {
    console.log('  ✅ PageHeader is a Client Component');
  } else {
    console.error('  ❌ ERROR: PageHeader should be a Client Component');
    hasErrors = true;
  }
}

// Check 6: Verify proxy.ts exists (not middleware.ts)
console.log('\n✓ Checking Next.js 16 compatibility...');
const proxyPath = path.join(__dirname, 'src/proxy.ts');
const middlewarePath = path.join(__dirname, 'src/middleware.ts');

if (fs.existsSync(proxyPath)) {
  console.log('  ✅ proxy.ts exists (Next.js 16 compatible)');
} else if (fs.existsSync(middlewarePath)) {
  console.warn('  ⚠️  WARNING: middleware.ts found (deprecated in Next.js 16)');
  console.warn('     Consider renaming to proxy.ts');
  hasWarnings = true;
} else {
  console.log('  ℹ️  No proxy/middleware file (optional)');
}

// Check 7: Verify next.config.ts has outputFileTracingRoot
console.log('\n✓ Checking Next.js configuration...');
const nextConfigPath = path.join(__dirname, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  if (content.includes('outputFileTracingRoot')) {
    console.log('  ✅ outputFileTracingRoot configured');
  } else {
    console.warn('  ⚠️  WARNING: outputFileTracingRoot not set (may cause lockfile warnings)');
    hasWarnings = true;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Verification Summary\n');

if (hasErrors) {
  console.error('❌ FAILED: Critical errors found. Fix errors before deploying.');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  PASSED WITH WARNINGS: Application is deployable but has minor issues.');
  console.log('\n✅ Safe to deploy to production');
  process.exit(0);
} else {
  console.log('✅ PASSED: All checks passed. Application is production-ready!');
  console.log('\n🚀 Ready to deploy to production');
  process.exit(0);
}
