/**
 * Test Blog Post Fetch
 * 
 * Diagnostic script to test blog post fetching from both backend and frontend.
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';
const TEST_SLUG = 'test-title';

console.log('🧪 Testing Blog Post Fetch\n');

// Test 1: Backend API
function testBackendAPI() {
  return new Promise((resolve) => {
    console.log('1️⃣  Testing Backend API...');
    const url = `${BACKEND_URL}/blog/${TEST_SLUG}`;
    console.log(`   URL: ${url}`);
    
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            console.log('   ✅ Backend API working');
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Post ID: ${data.id}`);
            console.log(`   Title: ${data.title}`);
            console.log(`   Slug: ${data.slug}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   Published: ${data.publishedAt}\n`);
            resolve(true);
          } catch (err) {
            console.log('   ❌ Failed to parse response');
            console.log(`   Error: ${err.message}\n`);
            resolve(false);
          }
        } else {
          console.log(`   ❌ Backend returned status ${res.statusCode}`);
          console.log(`   Response: ${body}\n`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ Backend not accessible');
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Test 2: Frontend Page
function testFrontendPage() {
  return new Promise((resolve) => {
    console.log('2️⃣  Testing Frontend Page...');
    const url = `${FRONTEND_URL}/blog/${TEST_SLUG}`;
    console.log(`   URL: ${url}`);
    
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('   ✅ Frontend page accessible');
          
          // Check if it's the actual post or not-found page
          if (body.includes('Post Not Found') || body.includes('doesn\'t exist')) {
            console.log('   ⚠️  Page shows "Post Not Found" message');
            console.log('   This means frontend is not fetching data correctly\n');
            resolve(false);
          } else if (body.includes('test title') || body.includes(TEST_SLUG)) {
            console.log('   ✅ Post content found in page\n');
            resolve(true);
          } else {
            console.log('   ⚠️  Page loaded but post content not found\n');
            resolve(false);
          }
        } else if (res.statusCode === 404) {
          console.log('   ❌ Frontend returned 404');
          console.log('   This means Next.js notFound() was called\n');
          resolve(false);
        } else {
          console.log(`   ⚠️  Unexpected status code\n`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ Frontend not accessible');
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Test 3: Check environment variables
function testEnvironmentConfig() {
  console.log('3️⃣  Checking Configuration...');
  console.log(`   Backend URL: ${BACKEND_URL}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  console.log(`   Test Slug: ${TEST_SLUG}`);
  console.log('');
  return Promise.resolve(true);
}

// Run all tests
async function runTests() {
  await testEnvironmentConfig();
  const backendOk = await testBackendAPI();
  const frontendOk = await testFrontendPage();
  
  console.log('📊 Test Results:');
  console.log(`   Backend API: ${backendOk ? '✅' : '❌'}`);
  console.log(`   Frontend Page: ${frontendOk ? '✅' : '❌'}`);
  
  if (backendOk && !frontendOk) {
    console.log('\n🔍 Diagnosis:');
    console.log('   Backend is working but frontend is not fetching data correctly.');
    console.log('\n💡 Possible Solutions:');
    console.log('   1. Check NEXT_PUBLIC_API_URL in frontend/.env.local');
    console.log('   2. Clear Next.js cache: rm -rf frontend/.next');
    console.log('   3. Restart frontend dev server');
    console.log('   4. Check browser console for errors');
    console.log('   5. Check if ISR cache needs clearing');
  } else if (!backendOk) {
    console.log('\n🔍 Diagnosis:');
    console.log('   Backend API is not working.');
    console.log('\n💡 Possible Solutions:');
    console.log('   1. Ensure backend is running: cd backend && npm run start:dev');
    console.log('   2. Check database connection');
    console.log('   3. Verify post exists in database');
    console.log('   4. Check backend logs for errors');
  } else if (backendOk && frontendOk) {
    console.log('\n🎉 Everything is working correctly!');
  }
}

runTests().catch(console.error);
