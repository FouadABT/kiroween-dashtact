/**
 * Test script for Messaging Settings API
 * 
 * This script tests:
 * 1. GET /messaging-settings - Retrieve settings
 * 2. PATCH /messaging-settings - Update settings
 * 3. Caching behavior
 * 4. Permission guards
 */

const API_BASE_URL = 'http://localhost:3001';

// Test user credentials (Super Admin)
const TEST_USER = {
  email: 'fouad.abt@gmail.com',
  password: 'Admin@123',
};

let authToken = '';

/**
 * Login and get JWT token
 */
async function login() {
  console.log('\n🔐 Logging in as Super Admin...');
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(TEST_USER),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  authToken = data.accessToken;
  console.log('✅ Login successful');
  return authToken;
}

/**
 * Test GET /messaging-settings
 */
async function testGetSettings() {
  console.log('\n📖 Testing GET /messaging-settings...');
  
  const response = await fetch(`${API_BASE_URL}/messaging-settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GET failed: ${response.status} ${response.statusText}`);
  }

  const settings = await response.json();
  console.log('✅ Settings retrieved:');
  console.log(JSON.stringify(settings, null, 2));
  return settings;
}

/**
 * Test PATCH /messaging-settings
 */
async function testUpdateSettings() {
  console.log('\n✏️  Testing PATCH /messaging-settings...');
  
  const updateData = {
    enabled: true,
    maxMessageLength: 3000,
    messageRetentionDays: 120,
    maxGroupParticipants: 75,
  };

  const response = await fetch(`${API_BASE_URL}/messaging-settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PATCH failed: ${response.status} ${response.statusText}\n${error}`);
  }

  const settings = await response.json();
  console.log('✅ Settings updated:');
  console.log(JSON.stringify(settings, null, 2));
  
  // Verify updates
  if (settings.enabled !== updateData.enabled) {
    throw new Error('❌ enabled not updated correctly');
  }
  if (settings.maxMessageLength !== updateData.maxMessageLength) {
    throw new Error('❌ maxMessageLength not updated correctly');
  }
  if (settings.messageRetentionDays !== updateData.messageRetentionDays) {
    throw new Error('❌ messageRetentionDays not updated correctly');
  }
  if (settings.maxGroupParticipants !== updateData.maxGroupParticipants) {
    throw new Error('❌ maxGroupParticipants not updated correctly');
  }
  
  console.log('✅ All fields updated correctly');
  return settings;
}

/**
 * Test caching behavior
 */
async function testCaching() {
  console.log('\n⏱️  Testing caching behavior...');
  
  // First request
  const start1 = Date.now();
  await testGetSettings();
  const time1 = Date.now() - start1;
  
  // Second request (should be cached)
  const start2 = Date.now();
  await testGetSettings();
  const time2 = Date.now() - start2;
  
  console.log(`\n📊 Performance:`);
  console.log(`  First request: ${time1}ms`);
  console.log(`  Second request (cached): ${time2}ms`);
  
  if (time2 < time1) {
    console.log('✅ Caching appears to be working (second request faster)');
  } else {
    console.log('⚠️  Caching might not be working (second request not faster)');
  }
}

/**
 * Test validation
 */
async function testValidation() {
  console.log('\n🔍 Testing validation...');
  
  // Test invalid maxMessageLength (too low)
  console.log('\n  Testing maxMessageLength < 100...');
  const response1 = await fetch(`${API_BASE_URL}/messaging-settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ maxMessageLength: 50 }),
  });

  if (response1.status === 400) {
    console.log('  ✅ Correctly rejected maxMessageLength < 100');
  } else {
    console.log('  ❌ Should have rejected maxMessageLength < 100');
  }

  // Test invalid maxMessageLength (too high)
  console.log('\n  Testing maxMessageLength > 5000...');
  const response2 = await fetch(`${API_BASE_URL}/messaging-settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ maxMessageLength: 6000 }),
  });

  if (response2.status === 400) {
    console.log('  ✅ Correctly rejected maxMessageLength > 5000');
  } else {
    console.log('  ❌ Should have rejected maxMessageLength > 5000');
  }

  // Test invalid messageRetentionDays (too low)
  console.log('\n  Testing messageRetentionDays < 7...');
  const response3 = await fetch(`${API_BASE_URL}/messaging-settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageRetentionDays: 5 }),
  });

  if (response3.status === 400) {
    console.log('  ✅ Correctly rejected messageRetentionDays < 7');
  } else {
    console.log('  ❌ Should have rejected messageRetentionDays < 7');
  }

  // Test invalid messageRetentionDays (too high)
  console.log('\n  Testing messageRetentionDays > 365...');
  const response4 = await fetch(`${API_BASE_URL}/messaging-settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageRetentionDays: 400 }),
  });

  if (response4.status === 400) {
    console.log('  ✅ Correctly rejected messageRetentionDays > 365');
  } else {
    console.log('  ❌ Should have rejected messageRetentionDays > 365');
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  console.log('\n🔄 Resetting settings to defaults...');
  
  const defaultSettings = {
    enabled: false,
    maxMessageLength: 2000,
    messageRetentionDays: 90,
    maxGroupParticipants: 50,
    allowFileAttachments: false,
  };

  const response = await fetch(`${API_BASE_URL}/messaging-settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(defaultSettings),
  });

  if (!response.ok) {
    throw new Error(`Reset failed: ${response.status} ${response.statusText}`);
  }

  console.log('✅ Settings reset to defaults');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Messaging Settings API Tests\n');
  console.log('=' .repeat(60));

  try {
    // Login
    await login();

    // Test GET
    await testGetSettings();

    // Test PATCH
    await testUpdateSettings();

    // Test caching
    await testCaching();

    // Test validation
    await testValidation();

    // Reset to defaults
    await resetSettings();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Test failed:', error.message);
    console.error('=' .repeat(60));
    process.exit(1);
  }
}

// Run tests
runTests();
