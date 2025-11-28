# Blog Authentication Diagnostic

## Issue
Getting 401 Unauthorized when accessing `/blog/admin/posts` even after logging out and back in.

## Diagnostic Steps

### 1. Check Browser Token

Open browser DevTools (F12) and run this in the Console:

```javascript
// Check if token exists
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token length:', token ? token.length : 0);

// Decode JWT (without verification)
if (token) {
  const parts = token.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token payload:', payload);
    console.log('Has blog:read permission:', payload.permissions?.includes('blog:read'));
    console.log('Token expires:', new Date(payload.exp * 1000));
    console.log('Token expired:', Date.now() > payload.exp * 1000);
  }
}
```

### 2. Test API Call Manually

In browser console:

```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:3001/blog/admin/posts?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

### 3. Check Network Tab

1. Open DevTools → Network tab
2. Try to access `/dashboard/blog` page
3. Look for the request to `/blog/admin/posts`
4. Check the request headers - is `Authorization: Bearer ...` present?
5. Check the response - what's the exact error?

### 4. Clear Everything and Re-login

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then refresh page and log in again
```

## Common Issues

### Issue 1: Token Not Being Sent
**Symptom**: No `Authorization` header in Network tab
**Solution**: Check if `localStorage.getItem('token')` returns a value

### Issue 2: Token Expired
**Symptom**: Token exists but is expired
**Solution**: Log out and log back in

### Issue 3: Token Missing Permissions
**Symptom**: Token exists but doesn't have `blog:read` permission
**Solution**: Database has permissions but token doesn't - need to re-login

### Issue 4: CORS Issue
**Symptom**: Request blocked by CORS
**Solution**: Check backend CORS configuration

### Issue 5: Wrong API URL
**Symptom**: Request goes to wrong URL
**Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local`

## Quick Fix Script

Run this in browser console to diagnose:

```javascript
async function diagnoseBlogAuth() {
  console.log('=== Blog Auth Diagnostic ===\n');
  
  // Check token
  const token = localStorage.getItem('token');
  console.log('1. Token exists:', !!token);
  
  if (!token) {
    console.error('❌ No token found! Please log in.');
    return;
  }
  
  // Decode token
  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    console.log('2. Token user:', payload.email);
    console.log('3. Token role:', payload.roleName);
    console.log('4. Token permissions:', payload.permissions?.length || 0);
    console.log('5. Has blog:read:', payload.permissions?.includes('blog:read'));
    console.log('6. Token expires:', new Date(payload.exp * 1000).toLocaleString());
    console.log('7. Token expired:', Date.now() > payload.exp * 1000);
    
    if (!payload.permissions?.includes('blog:read')) {
      console.error('❌ Token missing blog:read permission!');
      console.log('   Solution: Log out and log back in');
      return;
    }
    
    if (Date.now() > payload.exp * 1000) {
      console.error('❌ Token expired!');
      console.log('   Solution: Log out and log back in');
      return;
    }
  } catch (e) {
    console.error('❌ Failed to decode token:', e);
    return;
  }
  
  // Test API call
  console.log('\n8. Testing API call...');
  try {
    const response = await fetch('http://localhost:3001/blog/admin/posts?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('9. Response status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Blog posts:', data.total);
    } else {
      const error = await response.text();
      console.error('❌ API Error:', error);
    }
  } catch (e) {
    console.error('❌ Network error:', e);
  }
}

diagnoseBlogAuth();
```

## Expected Output

If everything is working:
```
=== Blog Auth Diagnostic ===

1. Token exists: true
2. Token user: fouad.abt@gmail.com
3. Token role: Admin
4. Token permissions: 21
5. Has blog:read: true
6. Token expires: 11/11/2025, 11:45:00 PM
7. Token expired: false

8. Testing API call...
9. Response status: 200 OK
✅ SUCCESS! Blog posts: 0
```

## Next Steps

Based on the diagnostic output, follow the appropriate solution above.
