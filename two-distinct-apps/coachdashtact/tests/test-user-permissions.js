const fetch = require('node-fetch');

async function testUserPermissions() {
  try {
    // Login with the user
    console.log('🔐 Logging in as fouad.abt@gmail.com...');
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'fouad.abt@gmail.com',
        password: 'Fouad123@' // You'll need to provide the correct password
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.error('❌ Login failed:', error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('User:', loginData.user.email);
    console.log('Role:', loginData.user.role.name);
    console.log('Permissions:', loginData.user.permissions);
    
    const accessToken = loginData.accessToken;

    // Get user profile
    console.log('\n📋 Fetching user profile...');
    const profileResponse = await fetch('http://localhost:3001/auth/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      console.error('❌ Profile fetch failed');
      return;
    }

    const profile = await profileResponse.json();
    console.log('✅ Profile fetched!');
    console.log('User:', profile.email);
    console.log('Role:', profile.role.name);
    console.log('Permissions:', profile.permissions);

    // Test users endpoint
    console.log('\n👥 Testing users endpoint...');
    const usersResponse = await fetch('http://localhost:3001/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!usersResponse.ok) {
      const error = await usersResponse.json();
      console.error('❌ Users endpoint failed:', error);
    } else {
      console.log('✅ Users endpoint accessible!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUserPermissions();
