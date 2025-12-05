# Avatar Debug Guide - Complete Logging Added

## What Was Added

I've added comprehensive console logging throughout the entire avatar flow to help diagnose the issue.

## Logging Points

### Backend Logs (Check Terminal Running Backend)

1. **Login Flow**:
   ```
   [AuthService] Login attempt for: [email]
   [AuthService] User validated, avatar from DB: [url or null]
   [AuthService] Building user profile: { userId, email, name, avatarUrl, hasAvatar }
   [AuthService] Login response prepared with avatar: [url or null]
   ```

2. **Profile Fetch Flow** (when refreshUser() is called):
   ```
   [AuthService] Getting user profile for: [userId]
   [AuthService] User found in DB with avatar: [url or null]
   [AuthService] Building user profile: { userId, email, name, avatarUrl, hasAvatar }
   ```

### Frontend Logs (Check Browser Console - F12)

1. **Login Flow**:
   ```
   [AuthContext] Attempting login for: [email]
   [AuthContext] Login response received: {
     hasUser: true,
     userId: [id],
     userEmail: [email],
     userName: [name],
     avatarUrl: [url or null],
     hasAvatar: true/false,
     hasAccessToken: true,
     hasRefreshToken: true
   }
   [AuthContext] Setting user state with avatar: [url or null]
   [AuthContext] Login complete, user authenticated
   ```

2. **Page Load Flow**:
   ```
   [AuthContext] Initializing auth...
   [AuthContext] Valid token found, loading user...
   [AuthContext] Loading user from token...
   [AuthContext] Fetching user profile from API...
   [AuthContext] User profile loaded: {
     id, email, name, avatarUrl, hasAvatar
   }
   ```

3. **Avatar Upload Flow**:
   ```
   [useAvatarUpload] Starting avatar upload: [filename]
   [useAvatarUpload] Mutation started
   [useAvatarUpload] Previous avatar: [url or null]
   [useAvatarUpload] Upload successful, new avatar URL: [url]
   [useAvatarUpload] Updating React Query cache with new avatar
   [useAvatarUpload] Calling refreshUser() to update AuthContext
   [AuthContext] Refreshing user profile...
   [AuthContext] User profile refreshed: {
     id, email, name, avatarUrl, hasAvatar,
     previousAvatar, avatarChanged: true/false
   }
   [AuthContext] User state updated with new profile data
   [useAvatarUpload] refreshUser() completed
   [useAvatarUpload] Mutation settled, invalidating queries
   ```

4. **Header Rendering**:
   ```
   [Header] Rendering with user: {
     hasUser: true,
     userId: [id],
     userName: [name],
     avatarUrl: [url or null],
     hasAvatar: true/false
   }
   ```

## Testing Steps

### Step 1: Check Current State

1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the page
4. Look for `[Header] Rendering with user:` log
5. **Check**: Does `avatarUrl` have a value? Does `hasAvatar` = true?

### Step 2: Test Login Flow

1. Log out
2. Clear console (Ctrl+L or Cmd+K)
3. Log back in
4. Watch for these logs in order:
   - Backend: `[AuthService] Login attempt for:`
   - Backend: `[AuthService] User validated, avatar from DB:`
   - Backend: `[AuthService] Login response prepared with avatar:`
   - Frontend: `[AuthContext] Login response received:`
   - Frontend: `[AuthContext] Setting user state with avatar:`
   - Frontend: `[Header] Rendering with user:`

5. **Verify**: At each step, check if `avatarUrl` is present

### Step 3: Test Avatar Upload

1. Clear console
2. Go to `/dashboard/profile`
3. Upload a new avatar
4. Watch for these logs:
   - `[useAvatarUpload] Starting avatar upload:`
   - `[useAvatarUpload] Upload successful, new avatar URL:`
   - `[useAvatarUpload] Calling refreshUser()`
   - `[AuthContext] Refreshing user profile...`
   - `[AuthContext] User profile refreshed:` (check `avatarChanged: true`)
   - `[Header] Rendering with user:` (should show new avatar)

5. **Verify**: Avatar should appear in header immediately

### Step 4: Test Page Refresh

1. After uploading avatar, refresh page (F5)
2. Clear console first
3. Watch for:
   - `[AuthContext] Initializing auth...`
   - `[AuthContext] Valid token found, loading user...`
   - `[AuthContext] User profile loaded:` (check `avatarUrl`)
   - `[Header] Rendering with user:` (check `avatarUrl`)

4. **Verify**: Avatar persists after refresh

## Common Issues & What Logs Will Show

### Issue 1: Avatar Not in Database

**Symptoms**: 
- Backend logs show: `avatar from DB: null`
- Frontend logs show: `avatarUrl: null`

**Solution**: Avatar upload failed or wasn't saved. Check upload logs.

### Issue 2: Avatar in DB But Not in Login Response

**Symptoms**:
- Backend logs show: `avatar from DB: http://...` 
- But frontend logs show: `avatarUrl: null`

**Solution**: Problem in `buildUserProfile()` method. Check backend logs for errors.

### Issue 3: Avatar in Login Response But Not in AuthContext

**Symptoms**:
- Frontend logs show: `Login response received: { avatarUrl: "http://..." }`
- But later logs show: `avatarUrl: null`

**Solution**: State update issue. Check for errors between login and state setting.

### Issue 4: Avatar in AuthContext But Not in Header

**Symptoms**:
- `[AuthContext] User profile loaded: { avatarUrl: "http://..." }`
- But `[Header] Rendering with user: { avatarUrl: null }`

**Solution**: Header not reading from AuthContext correctly. Check component re-render.

### Issue 5: Avatar Upload Succeeds But refreshUser() Fails

**Symptoms**:
- `[useAvatarUpload] Upload successful`
- But no `[AuthContext] User profile refreshed` log

**Solution**: `refreshUser()` not being called or failing. Check for errors.

## What to Share for Debugging

If the issue persists, share these logs:

1. **Backend Terminal Output** (from login or profile fetch)
2. **Browser Console Output** (all logs starting with `[AuthContext]`, `[Header]`, `[useAvatarUpload]`)
3. **Network Tab** - Check these requests:
   - `POST /auth/login` - Response should include `user.avatarUrl`
   - `GET /auth/profile` - Response should include `avatarUrl`
   - `POST /profile/avatar` - Response should include new URL

## Quick Diagnostic Commands

### Check Database
```sql
SELECT id, email, name, avatar_url 
FROM users 
WHERE email = 'your-email@example.com';
```

### Check Network Response
In DevTools Network tab:
1. Find `POST /auth/login` request
2. Click on it
3. Go to "Response" tab
4. Look for `user.avatarUrl` in JSON

### Force Refresh User Data
Add this to any component temporarily:
```typescript
import { useAuth } from '@/contexts/AuthContext';

function DebugButton() {
  const { refreshUser, user } = useAuth();
  
  return (
    <div>
      <button onClick={refreshUser}>Force Refresh User</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
```

## Expected Log Flow (Happy Path)

### On Login:
```
Backend:
[AuthService] Login attempt for: fouad.abt@gmail.com
[AuthService] User validated, avatar from DB: http://localhost:3001/uploads/avatars/...
[AuthService] Building user profile: { avatarUrl: "http://...", hasAvatar: true }
[AuthService] Login response prepared with avatar: http://localhost:3001/uploads/avatars/...

Frontend:
[AuthContext] Attempting login for: fouad.abt@gmail.com
[AuthContext] Login response received: { avatarUrl: "http://...", hasAvatar: true }
[AuthContext] Setting user state with avatar: http://localhost:3001/uploads/avatars/...
[AuthContext] Login complete, user authenticated
[Header] Rendering with user: { avatarUrl: "http://...", hasAvatar: true }
```

### On Avatar Upload:
```
[useAvatarUpload] Starting avatar upload: image.jpg
[useAvatarUpload] Upload successful, new avatar URL: http://localhost:3001/uploads/avatars/...
[useAvatarUpload] Calling refreshUser()
[AuthContext] Refreshing user profile...
[AuthContext] User profile refreshed: { avatarUrl: "http://...", avatarChanged: true }
[Header] Rendering with user: { avatarUrl: "http://...", hasAvatar: true }
```

## Next Steps

1. **Restart both servers** to ensure new logging code is active:
   ```bash
   # Backend
   cd backend
   npm run start:dev
   
   # Frontend
   cd frontend
   npm run dev
   ```

2. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)

3. **Open browser console** (F12)

4. **Log out and log back in** while watching console

5. **Share the logs** if issue persists

---

**All logging is now in place!** The logs will show exactly where the avatar URL is being lost in the flow.
