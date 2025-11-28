/**
 * Test Image Proxy Functionality
 * 
 * This script tests the image proxy API route to ensure it works correctly.
 * 
 * Usage:
 *   node test-image-proxy.js
 * 
 * Prerequisites:
 *   - Backend running on http://localhost:3001
 *   - Frontend running on http://localhost:3000
 *   - At least one image uploaded to backend
 */

const http = require('http');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

// Test image URL (replace with actual uploaded image)
const TEST_IMAGE_PATH = '/uploads/images/test.jpg';

console.log('🧪 Testing Image Proxy Functionality\n');

// Test 1: Check if backend image exists
function testBackendImage() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣  Testing direct backend image access...');
    const url = `${BACKEND_URL}${TEST_IMAGE_PATH}`;
    
    http.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Backend image accessible');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}\n`);
        resolve(true);
      } else {
        console.log(`   ⚠️  Backend image returned status ${res.statusCode}`);
        console.log('   Note: This might be expected if no image exists yet\n');
        resolve(false);
      }
    }).on('error', (err) => {
      console.log('   ❌ Backend not accessible');
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Test 2: Check if proxy works
function testProxyImage() {
  return new Promise((resolve, reject) => {
    console.log('2️⃣  Testing image proxy API route...');
    const imageUrl = encodeURIComponent(`${BACKEND_URL}${TEST_IMAGE_PATH}`);
    const url = `${FRONTEND_URL}/api/image-proxy?url=${imageUrl}`;
    
    http.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Proxy working correctly');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   Cache-Control: ${res.headers['cache-control']}\n`);
        resolve(true);
      } else {
        console.log(`   ❌ Proxy returned status ${res.statusCode}`);
        
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const error = JSON.parse(body);
            console.log(`   Error: ${error.error}\n`);
          } catch {
            console.log(`   Response: ${body}\n`);
          }
          resolve(false);
        });
      }
    }).on('error', (err) => {
      console.log('   ❌ Frontend not accessible');
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Test 3: Check proxy with missing URL parameter
function testProxyError() {
  return new Promise((resolve, reject) => {
    console.log('3️⃣  Testing proxy error handling...');
    const url = `${FRONTEND_URL}/api/image-proxy`;
    
    http.get(url, (res) => {
      if (res.statusCode === 400) {
        console.log('   ✅ Proxy correctly handles missing URL parameter');
        console.log(`   Status: ${res.statusCode}\n`);
        resolve(true);
      } else {
        console.log(`   ⚠️  Expected 400, got ${res.statusCode}\n`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log('   ❌ Frontend not accessible');
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  const backendOk = await testBackendImage();
  const proxyOk = await testProxyImage();
  const errorHandlingOk = await testProxyError();
  
  console.log('📊 Test Results:');
  console.log(`   Backend Image: ${backendOk ? '✅' : '⚠️'}`);
  console.log(`   Proxy Functionality: ${proxyOk ? '✅' : '❌'}`);
  console.log(`   Error Handling: ${errorHandlingOk ? '✅' : '❌'}`);
  
  if (proxyOk && errorHandlingOk) {
    console.log('\n🎉 All critical tests passed! Image proxy is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Upload an image in the blog editor');
  console.log('   2. Check browser DevTools → Network tab');
  console.log('   3. Look for requests to /api/image-proxy');
  console.log('   4. Verify images display correctly');
}

runTests().catch(console.error);
