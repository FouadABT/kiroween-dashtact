/**
 * Test Blog Authentication
 * 
 * This script tests if the JWT token can access the blog endpoint
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testBlogAuth() {
  console.log('🔍 Testing Blog Authentication...\n');

  // Step 1: Login
  console.log('Step 1: Logging in...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'fouad.abt@gmail.com',
      password: 'Password123!',
    }),
  });

  if (!loginResponse.ok) {
    console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText);
    const error = await loginResponse.text();
    console.error('Error:', error);
    return;
  }

  const loginData = await loginResponse.json();
  console.log('✅ Login successful');
  console.log('User:', loginData.user.email);
  console.log('Role:', loginData.user.roleName);
  console.log('Permissions:', loginData.user.permissions.slice(0, 5), '...');
  console.log('Has blog:read?', loginData.user.permissions.includes('blog:read'));
  console.log('Token:', loginData.accessToken.substring(0, 50) + '...\n');

  // Step 2: Test blog endpoint
  console.log('Step 2: Testing /blog/admin/posts endpoint...');
  const blogResponse = await fetch(`${API_BASE_URL}/blog/admin/posts?page=1&limit=10`, {
    headers: {
      'Authorization': `Bearer ${loginData.accessToken}`,
    },
  });

  console.log('Response status:', blogResponse.status, blogResponse.statusText);

  if (!blogResponse.ok) {
    console.error('❌ Blog endpoint failed');
    const error = await blogResponse.text();
    console.error('Error response:', error);
    return;
  }

  const blogData = await blogResponse.json();
  console.log('✅ Blog endpoint successful');
  console.log('Total posts:', blogData.total);
  console.log('Posts returned:', blogData.posts.length);
  console.log('\nFirst post:', blogData.posts[0] ? {
    id: blogData.posts[0].id,
    title: blogData.posts[0].title,
    status: blogData.posts[0].status,
  } : 'No posts');
}

testBlogAuth().catch(console.error);
