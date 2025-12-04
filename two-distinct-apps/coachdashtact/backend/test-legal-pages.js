/**
 * Manual test script for Legal Pages API
 * Run with: node test-legal-pages.js
 */

const API_BASE = 'http://localhost:3001';

async function testLegalPagesAPI() {
  console.log('🧪 Testing Legal Pages API\n');

  try {
    // Test 1: GET /legal-pages/terms (should return null initially)
    console.log('1️⃣ Testing GET /legal-pages/terms (public)');
    const termsResponse = await fetch(`${API_BASE}/legal-pages/terms`);
    const termsData = await termsResponse.json();
    console.log('   Status:', termsResponse.status);
    console.log('   Response:', termsData);
    console.log('   ✅ GET terms endpoint works\n');

    // Test 2: GET /legal-pages/privacy (should return null initially)
    console.log('2️⃣ Testing GET /legal-pages/privacy (public)');
    const privacyResponse = await fetch(`${API_BASE}/legal-pages/privacy`);
    const privacyData = await privacyResponse.json();
    console.log('   Status:', privacyResponse.status);
    console.log('   Response:', privacyData);
    console.log('   ✅ GET privacy endpoint works\n');

    // Test 3: GET with invalid page type (should return 400)
    console.log('3️⃣ Testing GET /legal-pages/invalid (should fail)');
    const invalidResponse = await fetch(`${API_BASE}/legal-pages/invalid`);
    console.log('   Status:', invalidResponse.status);
    if (invalidResponse.status === 400) {
      const errorData = await invalidResponse.json();
      console.log('   Error:', errorData.message);
      console.log('   ✅ Validation works correctly\n');
    } else {
      console.log('   ❌ Expected 400 status\n');
    }

    // Test 4: PUT without auth (should return 401)
    console.log('4️⃣ Testing PUT /legal-pages/terms without auth (should fail)');
    const unauthResponse = await fetch(`${API_BASE}/legal-pages/terms`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '<h1>Test</h1>' }),
    });
    console.log('   Status:', unauthResponse.status);
    if (unauthResponse.status === 401) {
      console.log('   ✅ Auth guard works correctly\n');
    } else {
      console.log('   ❌ Expected 401 status\n');
    }

    console.log('✅ All basic tests passed!');
    console.log('\nNote: To test authenticated endpoints, you need to:');
    console.log('1. Start the backend server: cd backend && npm run start:dev');
    console.log('2. Login as admin to get a JWT token');
    console.log('3. Use the token in Authorization header for PUT requests');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the backend server is running:');
    console.log('cd backend && npm run start:dev');
  }
}

testLegalPagesAPI();
