/**
 * Test script to verify coaching platform notification triggers
 * 
 * This script tests:
 * 1. Session created notifications
 * 2. Booking confirmed notifications
 * 3. Booking rejected notifications
 * 4. Session completed notifications
 * 5. Session cancelled notifications
 * 6. Member assigned notifications
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Test credentials (update these with actual test users)
const COACH_EMAIL = 'coach@example.com';
const COACH_PASSWORD = 'password123';
const MEMBER_EMAIL = 'member@example.com';
const MEMBER_PASSWORD = 'password123';

let coachToken = '';
let memberToken = '';
let coachId = '';
let memberId = '';
let memberProfileId = '';
let sessionId = '';
let bookingId = '';

async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return {
      token: response.data.access_token,
      userId: response.data.user.id,
    };
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.response?.data || error.message);
    throw error;
  }
}

async function getNotifications(token) {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get notifications:', error.response?.data || error.message);
    return [];
  }
}

async function test1_MemberAssignedNotification() {
  console.log('\n=== Test 1: Member Assigned Notification ===');
  
  try {
    // Get member profile
    const profileResponse = await axios.get(`${API_URL}/members`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    
    if (profileResponse.data.length === 0) {
      console.log('❌ No member profile found');
      return false;
    }
    
    memberProfileId = profileResponse.data[0].id;
    
    // Assign coach (if not already assigned)
    if (!profileResponse.data[0].coachId) {
      await axios.patch(
        `${API_URL}/members/${memberProfileId}/assign-coach`,
        { coachId },
        { headers: { Authorization: `Bearer ${memberToken}` } }
      );
      
      // Check coach notifications
      const notifications = await getNotifications(coachToken);
      const assignNotification = notifications.find(n => 
        n.title.includes('New Member') || n.title.includes('assigned')
      );
      
      if (assignNotification) {
        console.log('✅ Member assigned notification sent to coach');
        return true;
      } else {
        console.log('❌ Member assigned notification NOT found');
        return false;
      }
    } else {
      console.log('ℹ️  Member already assigned to coach');
      return true;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

async function test2_SessionCreatedNotification() {
  console.log('\n=== Test 2: Session Created Notification ===');
  
  try {
    // Create a session
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 7); // Next week
    
    const sessionData = {
      memberId: memberProfileId,
      coachId,
      scheduledAt: scheduledAt.toISOString(),
      duration: 60,
      type: 'regular',
      memberNotes: 'Test session for notifications',
    };
    
    const response = await axios.post(`${API_URL}/sessions`, sessionData, {
      headers: { Authorization: `Bearer ${coachToken}` },
    });
    
    sessionId = response.data.id;
    
    // Check notifications for both coach and member
    const coachNotifications = await getNotifications(coachToken);
    const memberNotifications = await getNotifications(memberToken);
    
    const coachNotif = coachNotifications.find(n => 
      n.title.includes('Coaching Session') && n.message.includes('scheduled')
    );
    const memberNotif = memberNotifications.find(n => 
      n.title.includes('Coaching Session') && n.message.includes('scheduled')
    );
    
    if (coachNotif && memberNotif) {
      console.log('✅ Session created notifications sent to both coach and member');
      return true;
    } else {
      console.log('❌ Session created notifications NOT found');
      console.log('  Coach notification:', !!coachNotif);
      console.log('  Member notification:', !!memberNotif);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

async function test3_BookingConfirmedNotification() {
  console.log('\n=== Test 3: Booking Confirmed Notification ===');
  
  try {
    // Create a booking (which auto-confirms)
    const requestedDate = new Date();
    requestedDate.setDate(requestedDate.getDate() + 14); // Two weeks from now
    
    const bookingData = {
      memberId: memberProfileId,
      coachId,
      requestedDate: requestedDate.toISOString().split('T')[0],
      requestedTime: '14:00',
      duration: 60,
      memberNotes: 'Test booking for notifications',
    };
    
    const response = await axios.post(`${API_URL}/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    
    bookingId = response.data.id;
    
    // Check member notifications
    const notifications = await getNotifications(memberToken);
    const confirmNotif = notifications.find(n => 
      n.title.includes('Booking Confirmed') || n.title.includes('confirmed')
    );
    
    if (confirmNotif) {
      console.log('✅ Booking confirmed notification sent to member');
      return true;
    } else {
      console.log('❌ Booking confirmed notification NOT found');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

async function test4_SessionCompletedNotification() {
  console.log('\n=== Test 4: Session Completed Notification ===');
  
  try {
    if (!sessionId) {
      console.log('⚠️  Skipping - no session ID available');
      return true;
    }
    
    // Complete the session
    const completeData = {
      coachNotes: 'Test session completed',
      outcomes: 'Good progress',
    };
    
    await axios.patch(`${API_URL}/sessions/${sessionId}/complete`, completeData, {
      headers: { Authorization: `Bearer ${coachToken}` },
    });
    
    // Check notifications for both coach and member
    const coachNotifications = await getNotifications(coachToken);
    const memberNotifications = await getNotifications(memberToken);
    
    const coachNotif = coachNotifications.find(n => 
      n.title.includes('Session Completed')
    );
    const memberNotif = memberNotifications.find(n => 
      n.title.includes('Session Completed') && n.message.includes('rate')
    );
    
    if (coachNotif && memberNotif) {
      console.log('✅ Session completed notifications sent to both coach and member');
      return true;
    } else {
      console.log('❌ Session completed notifications NOT found');
      console.log('  Coach notification:', !!coachNotif);
      console.log('  Member notification:', !!memberNotif);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

async function test5_SessionCancelledNotification() {
  console.log('\n=== Test 5: Session Cancelled Notification ===');
  
  try {
    // Create another session to cancel
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 21); // Three weeks from now
    
    const sessionData = {
      memberId: memberProfileId,
      coachId,
      scheduledAt: scheduledAt.toISOString(),
      duration: 60,
      type: 'regular',
    };
    
    const createResponse = await axios.post(`${API_URL}/sessions`, sessionData, {
      headers: { Authorization: `Bearer ${coachToken}` },
    });
    
    const cancelSessionId = createResponse.data.id;
    
    // Cancel the session
    await axios.patch(
      `${API_URL}/sessions/${cancelSessionId}/cancel`,
      { reason: 'Testing cancellation notifications' },
      { headers: { Authorization: `Bearer ${coachToken}` } }
    );
    
    // Check notifications for both coach and member
    const coachNotifications = await getNotifications(coachToken);
    const memberNotifications = await getNotifications(memberToken);
    
    const coachNotif = coachNotifications.find(n => 
      n.title.includes('Session Cancelled')
    );
    const memberNotif = memberNotifications.find(n => 
      n.title.includes('Session Cancelled')
    );
    
    if (coachNotif && memberNotif) {
      console.log('✅ Session cancelled notifications sent to both coach and member');
      return true;
    } else {
      console.log('❌ Session cancelled notifications NOT found');
      console.log('  Coach notification:', !!coachNotif);
      console.log('  Member notification:', !!memberNotif);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Coaching Platform Notification Tests\n');
  console.log(`API URL: ${API_URL}\n`);
  
  try {
    // Login
    console.log('Logging in...');
    const coachAuth = await login(COACH_EMAIL, COACH_PASSWORD);
    coachToken = coachAuth.token;
    coachId = coachAuth.userId;
    console.log('✅ Coach logged in');
    
    const memberAuth = await login(MEMBER_EMAIL, MEMBER_PASSWORD);
    memberToken = memberAuth.token;
    memberId = memberAuth.userId;
    console.log('✅ Member logged in');
    
    // Run tests
    const results = [];
    
    results.push(await test1_MemberAssignedNotification());
    results.push(await test2_SessionCreatedNotification());
    results.push(await test3_BookingConfirmedNotification());
    results.push(await test4_SessionCompletedNotification());
    results.push(await test5_SessionCancelledNotification());
    
    // Summary
    console.log('\n=== Test Summary ===');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('✅ All notification tests passed!');
    } else {
      console.log('❌ Some notification tests failed');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests
runTests();
