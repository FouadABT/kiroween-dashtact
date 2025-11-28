# Avatar Display Troubleshooting Guide

## Current Status

✅ **Fix Implemented**: The avatar refresh mechanism is already in place and working correctly.

## How It Works

1. **Avatar Upload Flow**:
   - User uploads avatar via `/dashboard/profile`
   - Avatar is saved to database
   - `useAvatarUpload()` hook calls `refreshUser()` from AuthContext
   - AuthContext fetches fresh user data from backend
   - Header avatar updates automatically

2. **Key Components**:
   - `AuthContext.refreshUser()` - Fetches fresh user profile
   - `useAvatarUpload()` - Calls `refreshUser()` after upload
   - `Header.tsx` - Displays `user?.avatarUrl` from AuthContext

## Verification Steps

### 1. Check if Avatar is in Database

Run this query in your database:
```sql
SELECT id, email, name, avatar_url 
FROM users 
WHERE email = 'your-email@example.com';
```

Expected: `avatar_url` should contain a URL like:
```
http://localhost:3001/uploads/avatars/[filename].webp
```

### 2. Check if Avatar File Exists

Navigate to:
```
backend/uploads/avatars/
```

You should see your avatar file there.

### 3. Check Browser Console

Open browser DevTools (F12) and look for:
```
[AuthContext] User profile refreshed
```

This confirms the refresh is working.

### 4. Check Network Tab

In DevTools Network tab, after uploading avatar:
1. Look for `POST /profile/avatar` - Should return 200
2. Look for `GET /auth/profile` - Should return user with new avatarUrl

### 5. Verify Avatar URL is Accessible

Copy the avatar URL from database and paste in browser:
```
http://localhost:3001/uploads/avatars/[your-file].webp
```

Should display the image.

## Common Issues & Solutions

### Issue 1: Avatar Not Showing After Upload

**Symptoms**: Upload succeeds but header still shows initials

**Solutions**:
1. **Refresh the page** (Ctrl+R or Cmd+R)
   - This forces AuthContext to reload
   
2. **Check browser console** for errors
   - Look for failed API calls
   - Check for CORS errors

3. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue 2: Avatar URL is Null in Database

**Symptoms**: Database shows `avatar_url: null`

**Solutions**:
1. Check backend logs for upload errors
2. Verify `backend/uploads/avatars/` directory exists and is writable
3. Check file size limits (default: 5MB)

### Issue 3: Avatar File Not Found (404)

**Symptoms**: Avatar URL exists but returns 404

**Solutions**:
1. Verify file exists in `backend/uploads/avatars/`
2. Check backend static file serving is configured:
   ```typescript
   // backend/src/main.ts
   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
     prefix: '/uploads/',
   });
   ```
3. Restart backend server

### Issue 4: CORS Error

**Symptoms**: Browser console shows CORS error when loading avatar

**Solutions**:
1. Check backend CORS configuration:
   ```typescript
   // backend/src/main.ts
   app.enableCors({
     origin: 'http://localhost:3000',
     credentials: true,
   });
   ```
2. Restart backend server

### Issue 5: Avatar Shows Briefly Then Disappears

**Symptoms**: Avatar appears for a moment then reverts to initials

**Solutions**:
1. Check if `refreshUser()` is being called multiple times
2. Look for conflicting state updates
3. Check React Query cache invalidation

## Testing the Fix

### Test 1: Upload New Avatar

1. Go to `/dashboard/profile`
2. Upload a new avatar
3. **Expected**: Header avatar updates immediately (no page refresh needed)
4. **Verify**: Check browser console for `[AuthContext] User profile refreshed`

### Test 2: Delete Avatar

1. Go to `/dashboard/profile`
2. Click "Remove" on avatar
3. **Expected**: Header shows initials immediately
4. **Verify**: Database `avatar_url` is null

### Test 3: Page Refresh

1. Upload avatar
2. Refresh page (F5)
3. **Expected**: Avatar persists in header
4. **Verify**: AuthContext loads avatar from backend

### Test 4: Logout/Login

1. Upload avatar
2. Logout
3. Login again
4. **Expected**: Avatar shows in header
5. **Verify**: Fresh login loads latest user data

## Debug Commands

### Check User Data in AuthContext

Add this to any component:
```typescript
import { useAuth } from '@/contexts/AuthContext';

function DebugComponent() {
  const { user } = useAuth();
  
  console.log('User data:', user);
  console.log('Avatar URL:', user?.avatarUrl);
  
  return null;
}
```

### Force Refresh User Data

Add this button to test:
```typescript
import { useAuth } from '@/contexts/AuthContext';

function RefreshButton() {
  const { refreshUser } = useAuth();
  
  return (
    <button onClick={refreshUser}>
      Refresh User Data
    </button>
  );
}
```

### Check React Query Cache

```typescript
import { useQueryClient } from '@tanstack/react-query';

function DebugCache() {
  const queryClient = useQueryClient();
  const profileData = queryClient.getQueryData(['profile']);
  
  console.log('Profile cache:', profileData);
  
  return null;
}
```

## Quick Fix Checklist

If avatar is not showing, try these in order:

- [ ] Refresh the page (F5)
- [ ] Check browser console for errors
- [ ] Verify avatar URL in database
- [ ] Check if avatar file exists in `backend/uploads/avatars/`
- [ ] Test avatar URL directly in browser
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Restart backend server
- [ ] Logout and login again

## Expected Behavior

✅ **After Upload**:
- Avatar appears in profile page immediately
- Header avatar updates automatically (via `refreshUser()`)
- No page refresh needed

✅ **After Page Refresh**:
- Avatar persists in header
- AuthContext loads from backend

✅ **After Logout/Login**:
- Avatar shows immediately after login
- Fresh user data loaded

## Code References

### AuthContext.refreshUser()
```typescript
// frontend/src/contexts/AuthContext.tsx
const refreshUser = useCallback(async () => {
  if (!isAuthenticated || !accessToken) return;
  
  try {
    const response = await fetch(
      `${authConfig.api.baseUrl}${authConfig.endpoints.profile}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to refresh user profile');
    }

    const userProfile: UserProfile = await response.json();
    setUser(userProfile);
    console.log('[AuthContext] User profile refreshed');
  } catch (error) {
    console.error('Failed to refresh user:', error);
  }
}, [isAuthenticated, accessToken]);
```

### useAvatarUpload() Hook
```typescript
// frontend/src/hooks/useProfile.ts
export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: UploadProgress) => void;
    }) => ProfileApi.uploadAvatar(file, onProgress),
    onSuccess: async (data: AvatarUploadResponse) => {
      // Update profile cache
      const previousProfile = queryClient.getQueryData<ProfileResponse>(PROFILE_QUERY_KEY);
      if (previousProfile) {
        queryClient.setQueryData<ProfileResponse>(PROFILE_QUERY_KEY, {
          ...previousProfile,
          avatarUrl: data.url,
          updatedAt: new Date().toISOString(),
        });
      }

      // Refresh AuthContext user data
      await refreshUser();

      toast.success('Your profile picture has been updated successfully');
    },
  });
}
```

### Header Avatar Display
```typescript
// frontend/src/components/dashboard/Header.tsx
<Avatar className="h-7 w-7 sm:h-8 sm:w-8">
  <AvatarImage 
    src={user?.avatarUrl || undefined} 
    alt={`${user?.name || 'User'} profile picture`} 
  />
  <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm font-semibold">
    {user?.name 
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : <User className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
    }
  </AvatarFallback>
</Avatar>
```

## Need More Help?

If the issue persists after trying all solutions:

1. Check backend logs for errors
2. Verify database connection
3. Test API endpoints with Postman/curl
4. Check file permissions on `backend/uploads/avatars/`
5. Verify environment variables are set correctly

---

**Status**: ✅ Fix implemented and working
**Last Updated**: Current session
**Related Files**: 
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/hooks/useProfile.ts`
- `frontend/src/components/dashboard/Header.tsx`
