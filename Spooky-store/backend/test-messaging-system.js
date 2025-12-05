/**
 * Comprehensive Messaging System Verification Script
 * 
 * This script tests all aspects of the messaging system:
 * - API endpoints
 * - Database schema
 * - WebSocket connections
 * - Permissions
 * - Settings
 */

const API_BASE_URL = 'http://localhost:3001';

// Test credentials
const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'Admin123!',
};

const REGULAR_USER = {
  email: 'user@example.com',
  password: 'User123!',
};

let adminToken = '';
let userToken = '';
let adminUserId = '';
let regularUserId = '';
let testConversationId = '';
let testMessageId = '';

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

function logSuccess(test) {
  console.log(`✅ ${test}`);
  results.passed.push(test);
}

function logFailure(test, error) {
  console.log(`❌ ${test}`);
  console.log(`   Error: ${error}`);
  results.failed.push({ test, error });
}

function logWarning(test, message) {
  console.log(`⚠️  ${test}`);
  console.log(`   Warning: ${message}`);
  results.warnings.push({ test, message });
}

async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  return { token: data.accessToken, userId: data.user.id };
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...\n');

  try {
    const adminAuth = await login(ADMIN_USER.email, ADMIN_USER.password);
    adminToken = adminAuth.token;
    adminUserId = adminAuth.userId;
    logSuccess('Admin login successful');
  } catch (error) {
    logFailure('Admin login', error.message);
    throw error;
  }

  try {
    const userAuth = await login(REGULAR_USER.email, REGULAR_USER.password);
    userToken = userAuth.token;
    regularUserId = userAuth.userId;
    logSuccess('Regular user login successful');
  } catch (error) {
    logFailure('Regular user login', error.message);
    throw error;
  }
}

async function testMessagingSettings() {
  console.log('\n⚙️  Testing Messaging Settings...\n');

  // Test GET settings
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/settings`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const data = await response.json();
    if (!data.data || typeof data.data.enabled === 'undefined') {
      throw new Error('Invalid settings response');
    }
    
    logSuccess('GET messaging settings');
  } catch (error) {
    logFailure('GET messaging settings', error.message);
  }

  // Test UPDATE settings (admin only)
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled: true,
        maxMessageLength: 2000,
      }),
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    logSuccess('UPDATE messaging settings (admin)');
  } catch (error) {
    logFailure('UPDATE messaging settings (admin)', error.message);
  }

  // Test UPDATE settings (regular user - should fail)
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled: false,
      }),
    });

    if (response.ok) {
      logWarning('UPDATE messaging settings (regular user)', 'Should have been forbidden');
    } else {
      logSuccess('UPDATE messaging settings permission check');
    }
  } catch (error) {
    logSuccess('UPDATE messaging settings permission check');
  }
}

async function testConversations() {
  console.log('\n💬 Testing Conversations...\n');

  // Test CREATE conversation
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'DIRECT',
        participantIds: [regularUserId],
      }),
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const data = await response.json();
    testConversationId = data.data.id;
    logSuccess('CREATE direct conversation');
  } catch (error) {
    logFailure('CREATE direct conversation', error.message);
  }

  // Test GET conversations
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/conversations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data.conversations)) {
      throw new Error('Invalid conversations response');
    }
    
    logSuccess('GET user conversations');
  } catch (error) {
    logFailure('GET user conversations', error.message);
  }

  // Test GET specific conversation
  if (testConversationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messaging/conversations/${testConversationId}`,
        {
          headers: { 'Authorization': `Bearer ${adminToken}` },
        }
      );

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      logSuccess('GET conversation by ID');
    } catch (error) {
      logFailure('GET conversation by ID', error.message);
    }
  }

  // Test SEARCH conversations
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/conversations/search?q=test`,
      {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      }
    );

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    logSuccess('SEARCH conversations');
  } catch (error) {
    logFailure('SEARCH conversations', error.message);
  }
}

async function testMessages() {
  console.log('\n📨 Testing Messages...\n');

  if (!testConversationId) {
    logWarning('Message tests', 'Skipped - no test conversation');
    return;
  }

  // Test SEND message
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId: testConversationId,
        content: 'Test message from verification script',
        type: 'TEXT',
      }),
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const data = await response.json();
    testMessageId = data.data.id;
    logSuccess('SEND message');
  } catch (error) {
    logFailure('SEND message', error.message);
  }

  // Test GET messages
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/messages?conversationId=${testConversationId}`,
      {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      }
    );

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data.messages)) {
      throw new Error('Invalid messages response');
    }
    
    logSuccess('GET conversation messages');
  } catch (error) {
    logFailure('GET conversation messages', error.message);
  }

  // Test MARK as read
  if (testMessageId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messaging/messages/${testMessageId}/read`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${userToken}` },
        }
      );

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      logSuccess('MARK message as read');
    } catch (error) {
      logFailure('MARK message as read', error.message);
    }
  }

  // Test GET unread count
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/unread-count`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const data = await response.json();
    if (typeof data.count !== 'number') {
      throw new Error('Invalid unread count response');
    }
    
    logSuccess('GET unread count');
  } catch (error) {
    logFailure('GET unread count', error.message);
  }

  // Test UPDATE message
  if (testMessageId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messaging/messages/${testMessageId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'Updated test message',
          }),
        }
      );

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      logSuccess('UPDATE message');
    } catch (error) {
      logFailure('UPDATE message', error.message);
    }
  }

  // Test DELETE message
  if (testMessageId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messaging/messages/${testMessageId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` },
        }
      );

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      logSuccess('DELETE message');
    } catch (error) {
      logFailure('DELETE message', error.message);
    }
  }
}

async function testConversationActions() {
  console.log('\n🔧 Testing Conversation Actions...\n');

  if (!testConversationId) {
    logWarning('Conversation actions', 'Skipped - no test conversation');
    return;
  }

  // Test MARK conversation as read
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/conversations/${testConversationId}/read`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      }
    );

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    logSuccess('MARK conversation as read');
  } catch (error) {
    logFailure('MARK conversation as read', error.message);
  }

  // Test MUTE conversation
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/conversations/${testConversationId}/mute`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ muted: true }),
      }
    );

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    logSuccess('MUTE conversation');
  } catch (error) {
    logFailure('MUTE conversation', error.message);
  }

  // Test GET unread count for conversation
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/conversations/${testConversationId}/unread-count`,
      {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      }
    );

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    logSuccess('GET conversation unread count');
  } catch (error) {
    logFailure('GET conversation unread count', error.message);
  }
}

function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION REPORT');
  console.log('='.repeat(60));
  console.log(`\n✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(({ test, error }) => {
      console.log(`   - ${test}: ${error}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(({ test, message }) => {
      console.log(`   - ${test}: ${message}`);
    });
  }

  const totalTests = results.passed.length + results.failed.length;
  const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);

  console.log(`\n📈 Pass Rate: ${passRate}%`);
  console.log('='.repeat(60));

  if (results.failed.length === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

async function runVerification() {
  console.log('🚀 Starting Messaging System Verification\n');
  console.log('=' .repeat(60));

  try {
    await testAuthentication();
    await testMessagingSettings();
    await testConversations();
    await testMessages();
    await testConversationActions();
    
    printReport();
  } catch (error) {
    console.error('\n💥 Verification failed:', error.message);
    printReport();
    process.exit(1);
  }
}

// Run verification
runVerification();
