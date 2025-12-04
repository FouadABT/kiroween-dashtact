const fetch = require('node-fetch');

async function testRegister() {
  try {
    console.log('Testing registration...');
    console.log('Endpoint: http://localhost:3001/auth/register');
    
    const testData = {
      email: 'test' + Date.now() + '@example.com',
      password: 'Test123!A',
      name: 'Test User',
    };
    
    console.log('Payload:', testData);
    
    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('\nStatus:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('\n❌ Registration failed:', data);
    } else {
      console.log('\n✅ Registration successful!');
      console.log('User ID:', data.user?.id);
      console.log('User Email:', data.user?.email);
      console.log('User Name:', data.user?.name);
      console.log('Has Access Token:', !!data.accessToken);
      console.log('Has Refresh Token:', !!data.refreshToken);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testRegister();
