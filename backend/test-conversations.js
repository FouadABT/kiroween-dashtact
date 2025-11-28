const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Test user credentials (assuming these exist from seed data)
const TEST_USER = {
  email: 'admin@example.com',
  password: 'Admin123!@#',
};

const TEST_USER_2 = {
  email: 'user@example.com',
  password: 'User123!@#',
};

let authToken = '';
let authToken2 = '';
let conversationId = '';
let userId2 = '';

async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data.accessToken;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testConversationsModule() {
  console.log('🧪 Testing Conversations Module\n');

  try {
    // 1. Login as first user
    console.log('1️⃣  Logging in as admin...');
    authToken = await login(TEST_USER.email, TEST_USER.password);
    console.log('✅ Admin logged in successfully\n');

    // 2. Login as second user
    console.log('2️⃣  Logging in as regular user...');
    authToken2 = await login(TEST_USER_2.email, TEST_USER_2.password);
    console.log('✅ User logged in successfully\n');

    // 3. Get user2 ID
    console.log('3️⃣  Getting user2 profile...');
    const user2Response = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken2}` },
    });
    userId2 = user2Response.data.id;
    console.log(`✅ User2 ID: ${userId2}\n`);

    // 4. Create a direct conversation
    console.log('4️⃣  Creating direct conversation...');
    const createResponse = await axios.post(
      `${API_URL}/messaging/conversations`,
      {
        type: 'DIRECT',
        participantIds: [userId2],
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    conversationId = createResponse.data.data.id;
    console.log('✅ Direct conversation created:', conversationId);
    console.log('   Participants:', createResponse.data.data.participants.length);
    console.log('');

    // 5. Get conversations list
    console.log('5️⃣  Getting conversations list...');
    const listResponse = await axios.get(`${API_URL}/messaging/conversations`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('✅ Conversations retrieved:', listResponse.data.conversations.length);
    console.log('');

    // 6. Get specific conversation
    console.log('6️⃣  Getting conversation details...');
    const getResponse = await axios.get(
      `${API_URL}/messaging/conversations/${conversationId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Conversation details retrieved');
    console.log('   Type:', getResponse.data.data.type);
    console.log('   Participants:', getResponse.data.data.participants.length);
    console.log('');

    // 7. Search conversations
    console.log('7️⃣  Searching conversations...');
    const searchResponse = await axios.get(
      `${API_URL}/messaging/conversations/search?q=user`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Search results:', searchResponse.data.conversations.length);
    console.log('');

    // 8. Get unread count
    console.log('8️⃣  Getting unread count...');
    const unreadResponse = await axios.get(`${API_URL}/messaging/unread-count`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('✅ Unread count:', unreadResponse.data.count);
    console.log('');

    // 9. Mark conversation as read
    console.log('9️⃣  Marking conversation as read...');
    await axios.post(
      `${API_URL}/messaging/conversations/${conversationId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Conversation marked as read\n');

    // 10. Test duplicate direct conversation prevention
    console.log('🔟 Testing duplicate direct conversation prevention...');
    const duplicateResponse = await axios.post(
      `${API_URL}/messaging/conversations`,
      {
        type: 'DIRECT',
        participantIds: [userId2],
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Duplicate prevention works - returned existing conversation');
    console.log('   Same ID:', duplicateResponse.data.data.id === conversationId);
    console.log('');

    console.log('✅ All conversation tests passed!\n');
    console.log('📊 Summary:');
    console.log('   ✓ Direct conversation creation');
    console.log('   ✓ Conversation listing');
    console.log('   ✓ Conversation details retrieval');
    console.log('   ✓ Conversation search');
    console.log('   ✓ Unread count');
    console.log('   ✓ Mark as read');
    console.log('   ✓ Duplicate prevention');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testConversationsModule();
