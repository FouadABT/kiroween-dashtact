# Theme Persistence Debug Guide

## Issue Summary

Theme toggle works and saves to backend without 403 errors, but theme doesn't persist after page refresh.

## What's Working

✅ Theme toggle in header works visually
✅ No 403 Forbidden errors
✅ API call succeeds and returns 200 OK
✅ Backend creates user-specific settings automatically
✅ User-specific settings record is created in database

## What's Not Working

❌ After page refresh, theme reverts to previous state (dark mode)
❌ The saved theme mode doesn't persist

## Debug Steps

### Step 1: Check Console Logs

With the debugging code added, you should see these logs when toggling:

```
[Header] Toggling theme from dark to light
[ThemeContext] setThemeMode called with: light
[ThemeContext] Updating backend with mode: light settingsId: cmhr35ic90000iwykn764x6vb
[ThemeContext] Backend response: { themeMode: 'light', ... }
```

**What to check:**
- Does the "setThemeMode called with" show the correct mode?
- Does the "Backend response" show the correct `themeMode`?
- Is there any error between these logs?

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Toggle the theme
3. Find the PATCH request to `/settings/cmhr35ic90000iwykn764x6vb`
4. Check the **Request Payload**:
   ```json
   {
     "themeMode": "light"
   }
   ```
5. Check the **Response**:
   ```json
   {
     "id": "cmhr35ic90000iwykn764x6vb",
     "themeMode": "light",  // ← Should match what you selected
     ...
   }
   ```

**What to check:**
- Does the request payload have the correct `themeMode`?
- Does the response have the correct `themeMode`?
- If response shows wrong mode, the backend might be saving incorrectly

### Step 3: Check Database

Query the database to see what's actually saved:

```sql
-- Check user's settings
SELECT 
  id, 
  user_id, 
  theme_mode, 
  scope,
  created_at,
  updated_at 
FROM settings 
WHERE user_id = 'cmhr1gmum0001iwrswetmk40m'  -- Your user ID
ORDER BY updated_at DESC;
```

**What to check:**
- Is there a user-specific settings record (scope = 'user')?
- Does `theme_mode` match what you selected?
- Is `updated_at` recent (showing it was just updated)?

### Step 4: Check localStorage

Open DevTools → Application → Local Storage → `http://localhost:3000`

Look for:
- `theme-mode`: Should be 'light' or 'dark' or 'system'
- `theme-settings`: Cached settings object

**What to check:**
- Does `theme-mode` match what you selected?
- Does the cached settings have the correct `themeMode`?

### Step 5: Check Page Load Sequence

When you refresh the page, check the console for this sequence:

```
[ThemeContext] Loading settings...
[ThemeContext] Loaded settings: { themeMode: 'light', ... }
[ThemeContext] Applying theme: light
```

**What to check:**
- Are settings loaded correctly on page load?
- Does the loaded settings have the correct `themeMode`?
- Is the theme applied correctly?

## Common Issues & Solutions

### Issue 1: Response shows wrong themeMode

**Symptom**: API response has `"themeMode": "dark"` when you clicked to switch to light

**Possible Causes**:
1. Multiple rapid clicks causing race condition
2. Debounce capturing wrong value
3. Backend saving wrong value

**Solution**:
- Check console logs to see what value was sent
- Try clicking once and waiting 1 second before refreshing
- Check if multiple PATCH requests are being sent

### Issue 2: Settings not loading on refresh

**Symptom**: Page loads but theme doesn't apply

**Possible Causes**:
1. API call failing silently
2. Cache returning stale data
3. Settings not found for user

**Solution**:
- Check Network tab for GET `/settings/user/{userId}` request
- Clear localStorage and try again
- Check if user has settings in database

### Issue 3: localStorage has wrong value

**Symptom**: `theme-mode` in localStorage doesn't match database

**Possible Causes**:
1. localStorage not being updated after API call
2. Cache not being invalidated
3. Multiple tabs interfering

**Solution**:
- Clear localStorage: `localStorage.clear()`
- Close all tabs and open fresh
- Check if cache is being updated in the code

### Issue 4: Database has wrong value

**Symptom**: Database shows wrong `theme_mode`

**Possible Causes**:
1. Backend controller saving wrong value
2. DTO transformation issue
3. Multiple requests overwriting each other

**Solution**:
- Check backend logs for the PATCH request
- Add logging to backend controller to see what's being saved
- Check if there are multiple settings records for the user

## Testing Procedure

Follow these steps to systematically test:

1. **Clear Everything**:
   ```javascript
   // In browser console
   localStorage.clear();
   ```

2. **Delete User Settings** (optional, for clean slate):
   ```sql
   DELETE FROM settings WHERE user_id = 'your_user_id';
   ```

3. **Refresh Page**: Should load global settings (dark mode by default)

4. **Toggle Theme**: Click once, wait 1 second

5. **Check Console**: Verify logs show correct mode

6. **Check Network**: Verify request/response have correct mode

7. **Wait 2 seconds**: Let debounce complete

8. **Refresh Page**: Theme should persist

9. **Check Database**: Verify correct value is saved

## Expected Behavior

### First Toggle (Global → User Settings)

1. User clicks toggle (dark → light)
2. Frontend sends PATCH to global settings ID
3. Backend detects user trying to update global settings
4. Backend creates NEW user-specific settings with `themeMode: 'light'`
5. Backend returns new user settings
6. Frontend updates state with new settings (including new ID)
7. Frontend caches new settings
8. On refresh, frontend loads user settings (not global)

### Subsequent Toggles (User Settings)

1. User clicks toggle (light → dark)
2. Frontend sends PATCH to user settings ID
3. Backend updates user settings
4. Backend returns updated settings
5. Frontend updates state and cache
6. On refresh, frontend loads updated user settings

## Code Changes Made

### Backend (`backend/src/settings/settings.controller.ts`)

Added logic to automatically create user-specific settings when user tries to update global settings.

### Frontend (`frontend/src/contexts/ThemeContext.tsx`)

1. Added debug logging
2. Improved cache management
3. Fixed closure issues with debounce
4. Ensured settings state is updated with API response

### Frontend (`frontend/src/components/dashboard/Header.tsx`)

Added debug logging to track toggle clicks.

## Next Steps

1. **Run the app** with both backend and frontend
2. **Open DevTools** console
3. **Toggle theme** once
4. **Check all debug logs** in console
5. **Check Network tab** for the PATCH request
6. **Wait 2 seconds** for debounce
7. **Refresh page**
8. **Report findings**:
   - What do the console logs show?
   - What does the Network tab show?
   - What does the database show?
   - Does the theme persist?

## Contact Points for Further Debug

If issue persists, provide:
1. Screenshot of console logs
2. Screenshot of Network tab (request + response)
3. Database query result
4. localStorage contents

This will help identify exactly where the issue is occurring.
