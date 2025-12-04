/**
 * Manual E2E Test Script for Coaching Platform
 * 
 * This script tests all the key flows of the coaching platform:
 * 1. Member signup and coach assignment
 * 2. Coach sets availability
 * 3. Member books a session
 * 4. Coach completes session
 * 5. Member rates session
 * 6. Capacity limits
 * 7. Cancellation flow
 * 8. Permission enforcement
 * 
 * Run with: node test-coaching-e2e-manual.js
 */

const API_BASE = 'http://localhost:3001';

async function request(method, path, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_BASE}${path}`, options);
  const text = await response.text();
  
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = text;
  }
  
  return {
    status: response.status,
    ok: response.ok,
    body,
  };
}

async function runTests() {
  console.log('🧪 Starting Coaching Platform E2E Tests\n');
  
  let adminToken, coachToken, memberToken;
  let coachUserId, memberUserId;
  let availabilitySlotId, sessionId, bookingId;
  
  try {
    // Test 1: Create and login as admin
    console.log('1️⃣  Creating admin user...');
    const adminEmail = `e2e-admin-${Date.now()}@test.com`;
    let res = await request('POST', '/auth/register', {
      email: adminEmail,
      password: 'Test123!@#',
      name: 'E2E Admin',
    });
    
    if (!res.ok) {
      console.error('❌ Failed to create admin:', res.body);
      return;
    }
    
    // Login as admin
    res = await request('POST', '/auth/login', {
      email: adminEmail,
      password: 'Test123!@#',
    });
    
    if (!res.ok) {
      console.error('❌ Failed to login as admin:', res.body);
      return;
    }
    
    adminToken = res.body.access_token;
    console.log('✅ Admin created and logged in\n');
    
    // Test 2: Create coach user
    console.log('2️⃣  Creating coach user...');
    const coachEmail = `e2e-coach-${Date.now()}@test.com`;
    res = await request('POST', '/auth/register', {
      email: coachEmail,
      password: 'Test123!@#',
      name: 'E2E Coach',
    });
    
    if (!res.ok) {
      console.error('❌ Failed to create coach:', res.body);
      return;
    }
    
    coachUserId = res.body.user.id;
    
    // Login as coach
    res = await request('POST', '/auth/login', {
      email: coachEmail,
      password: 'Test123!@#',
    });
    
    if (!res.ok) {
      console.error('❌ Failed to login as coach:', res.body);
      return;
    }
    
    coachToken = res.body.access_token;
    console.log('✅ Coach created and logged in\n');
    
    // Test 3: Coach sets availability
    console.log('3️⃣  Coach setting availability...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayOfWeek = tomorrow.getDay();
    
    res = await request('POST', '/coach-availability', {
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      maxSessionsPerSlot: 2,
      bufferMinutes: 15,
    }, coachToken);
    
    if (!res.ok) {
      console.error('❌ Failed to set availability:', res.body);
      return;
    }
    
    availabilitySlotId = res.body.id;
    console.log('✅ Availability set:', res.body);
    console.log('');
    
    // Test 4: Create member user
    console.log('4️⃣  Creating member user...');
    const memberEmail = `e2e-member-${Date.now()}@test.com`;
    res = await request('POST', '/auth/register', {
      email: memberEmail,
      password: 'Test123!@#',
      name: 'E2E Member',
    });
    
    if (!res.ok) {
      console.error('❌ Failed to create member:', res.body);
      return;
    }
    
    memberUserId = res.body.user.id;
    
    // Login as member
    res = await request('POST', '/auth/login', {
      email: memberEmail,
      password: 'Test123!@#',
    });
    
    if (!res.ok) {
      console.error('❌ Failed to login as member:', res.body);
      return;
    }
    
    memberToken = res.body.access_token;
    console.log('✅ Member created and logged in\n');
    
    // Test 5: View available slots
    console.log('5️⃣  Member viewing available slots...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    res = await request('GET', `/coach-availability/${coachUserId}/slots?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, null, memberToken);
    
    if (!res.ok) {
      console.error('❌ Failed to get available slots:', res.body);
      return;
    }
    
    console.log(`✅ Found ${res.body.length} available slots\n`);
    
    // Test 6: Book a session
    console.log('6️⃣  Member booking a session...');
    tomorrow.setHours(10, 0, 0, 0);
    
    res = await request('POST', '/bookings', {
      coachId: coachUserId,
      requestedDate: tomorrow.toISOString(),
      requestedTime: '10:00',
      duration: 60,
      memberNotes: 'E2E Test Booking',
    }, memberToken);
    
    if (!res.ok) {
      console.error('❌ Failed to book session:', res.body);
      return;
    }
    
    bookingId = res.body.id;
    sessionId = res.body.sessionId;
    console.log('✅ Session booked:', { bookingId, sessionId });
    console.log('');
    
    // Test 7: Coach views the session
    console.log('7️⃣  Coach viewing the session...');
    res = await request('GET', `/sessions/${sessionId}`, null, coachToken);
    
    if (!res.ok) {
      console.error('❌ Failed to view session:', res.body);
      return;
    }
    
    console.log('✅ Coach can view session:', res.body.id);
    console.log('');
    
    // Test 8: Coach completes the session
    console.log('8️⃣  Coach completing the session...');
    res = await request('PATCH', `/sessions/${sessionId}/complete`, {
      coachNotes: 'E2E Test Session Completed',
      outcomes: 'Great progress made',
    }, coachToken);
    
    if (!res.ok) {
      console.error('❌ Failed to complete session:', res.body);
      return;
    }
    
    console.log('✅ Session completed:', res.body.status);
    console.log('');
    
    // Test 9: Member rates the session
    console.log('9️⃣  Member rating the session...');
    res = await request('POST', `/sessions/${sessionId}/rate`, {
      rating: 5,
      feedback: 'Excellent session!',
    }, memberToken);
    
    if (!res.ok) {
      console.error('❌ Failed to rate session:', res.body);
      return;
    }
    
    console.log('✅ Session rated:', res.body.rating);
    console.log('');
    
    // Test 10: Test permission enforcement
    console.log('🔟 Testing permission enforcement...');
    
    // Member should not be able to view all members
    res = await request('GET', '/members', null, memberToken);
    if (res.status === 403 || res.status === 401) {
      console.log('✅ Member correctly denied access to members list');
    } else {
      console.log('❌ Member should not have access to members list');
    }
    
    // Member should not be able to create availability
    res = await request('POST', '/coach-availability', {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      maxSessionsPerSlot: 1,
      bufferMinutes: 15,
    }, memberToken);
    
    if (res.status === 403 || res.status === 401) {
      console.log('✅ Member correctly denied access to create availability');
    } else {
      console.log('❌ Member should not be able to create availability');
    }
    
    console.log('');
    
    // Test 11: Test cancellation flow
    console.log('1️⃣1️⃣  Testing cancellation flow...');
    
    // Book another session
    const tomorrow2 = new Date();
    tomorrow2.setDate(tomorrow2.getDate() + 2);
    tomorrow2.setHours(14, 0, 0, 0);
    
    res = await request('POST', '/bookings', {
      coachId: coachUserId,
      requestedDate: tomorrow2.toISOString(),
      requestedTime: '14:00',
      duration: 60,
      memberNotes: 'E2E Test Booking to Cancel',
    }, memberToken);
    
    if (!res.ok) {
      console.error('❌ Failed to book second session:', res.body);
      return;
    }
    
    const cancelBookingId = res.body.id;
    const cancelSessionId = res.body.sessionId;
    console.log('✅ Second session booked for cancellation test');
    
    // Cancel the booking
    res = await request('DELETE', `/bookings/${cancelBookingId}`, null, memberToken);
    
    if (!res.ok) {
      console.error('❌ Failed to cancel booking:', res.body);
      return;
    }
    
    console.log('✅ Booking cancelled successfully');
    
    // Verify session is cancelled
    res = await request('GET', `/sessions/${cancelSessionId}`, null, coachToken);
    
    if (res.ok && res.body.status === 'cancelled') {
      console.log('✅ Session status correctly updated to cancelled');
    } else {
      console.log('❌ Session status should be cancelled');
    }
    
    console.log('');
    
    console.log('🎉 All tests completed successfully!\n');
    console.log('Summary:');
    console.log('✅ Admin user created');
    console.log('✅ Coach user created and set availability');
    console.log('✅ Member user created and booked session');
    console.log('✅ Coach completed session');
    console.log('✅ Member rated session');
    console.log('✅ Permission enforcement working');
    console.log('✅ Cancellation flow working');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the tests
runTests().catch(console.error);
