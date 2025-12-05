#!/usr/bin/env node

/**
 * Production Build Test Script
 * 
 * Tests the production build for common issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Production Build\n');

let hasErrors = false;

// Test 1: Clean build
console.log('1️⃣  Testing clean build...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('   ✅ Build successful\n');
} catch (error) {
  console.error('   ❌ Build failed');
  console.error(error.stdout?.toString() || error.message);
  hasErrors = true;
}

// Test 2: Check for 'use client' in interactive components
console.log('2️⃣  Checking interactive components...');
const interactiveComponents = [
  'button.tsx',
  'dialog.tsx',
  'select.tsx',
  'input.tsx',
  'checkbox.tsx',
  'switch.tsx',
];

interactiveComponents.forEach(file => {
  const filePath = path.join(__dirname, 'src/components/ui', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("'use client'")) {
      console.log(`   ✅ ${file} has 'use client'`);
    } else {
      console.error(`   ❌ ${file} missing 'use client'`);
      hasErrors = true;
    }
  }
});
console.log('');

// Test 3: Check for asChild + onClick anti-pattern
console.log('3️⃣  Checking for asChild + onClick anti-pattern...');
const notFoundFile = path.join(__dirname, 'src/app/[...slug]/not-found.tsx');
if (fs.existsSync(notFoundFile)) {
  const content = fs.readFileSync(notFoundFile, 'utf8');
  if (content.includes('asChild') && content.includes('onClick') && 
      content.match(/asChild[^>]*onClick|onClick[^>]*asChild/)) {
    console.error('   ❌ asChild + onClick anti-pattern found in not-found.tsx');
    hasErrors = true;
  } else {
    console.log('   ✅ No asChild + onClick anti-pattern in not-found.tsx');
  }
} else {
  console.log('   ℹ️  not-found.tsx not found (optional)');
}
console.log('');

// Test 4: Check build output
console.log('4️⃣  Checking build output...');
const buildManifest = path.join(__dirname, '.next/build-manifest.json');
if (fs.existsSync(buildManifest)) {
  const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
  const pageCount = Object.keys(manifest.pages || {}).length;
  console.log(`   ✅ ${pageCount} pages built successfully`);
} else {
  console.error('   ❌ Build manifest not found');
  hasErrors = true;
}
console.log('');

// Summary
console.log('='.repeat(50));
console.log('📊 Test Summary\n');

if (hasErrors) {
  console.error('❌ FAILED: Some tests failed');
  process.exit(1);
} else {
  console.log('✅ PASSED: All tests passed!');
  console.log('\n🚀 Production build is ready for deployment');
  process.exit(0);
}
