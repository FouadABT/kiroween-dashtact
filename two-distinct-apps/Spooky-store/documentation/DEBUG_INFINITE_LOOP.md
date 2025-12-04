# Debug Infinite Loop Issue

## What I Fixed

### 1. Root Page (`/`)
Added redirect guard to prevent multiple redirects from the home page.

### 2. AuthContext Initialization
- Removed dependencies from useEffect to prevent re-initialization
- Added `hasInitialized` flag to ensure init runs only once
- Added debug console logs

### 3. RouteGuard Component
- Already had redirect guard from previous fix
- Added debug console logs

### 4. Root Page Redirect
- Added redirect guard
- Added debug console logs

## How to Debug

### Step 1: Open Browser Console
1. Open your browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Clear the console (click the 🚫 icon)

### Step 2: Clear All Storage
In the Console tab, run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 3: Navigate to the Site
Go to `http://localhost:3000/`

### Step 4: Watch Console Output

**Expected Output (Normal Flow):**
```
[AuthContext] Initializing auth...
[AuthContext] No token found
[AuthContext] Auth initialization complete
[Home] { isLoading: false, isAuthenticated: false, hasRedirected: false }
[Home] Redirecting...
[Home] User not authenticated, redirecting to login
[RouteGuard] { pathname: '/login', isLoading: false, isAuthenticated: false, requireAuth: false, hasRedirected: false }
[RouteGuard] No redirect needed
```

**Problem Output (Infinite Loop):**
```
[AuthContext] Initializing auth...
[AuthContext] Initializing auth...  ← REPEATING
[AuthContext] Initializing auth...  ← REPEATING
[Home] Redirecting...
[Home] Redirecting...  ← REPEATING
[Home] Redirecting...  ← REPEATING
```

### Step 5: Analyze the Output

Look for:
1. **Multiple "[AuthContext] Initializing auth..."** - AuthContext is re-mounting
2. **Multiple "[Home] Redirecting..."** - Home page is re-rendering and redirecting
3. **"Already redirected, skipping"** - Guards are working correctly

## Common Issues and Solutions

### Issue 1: AuthContext Keeps Re-initializing
**Symptom:** You see multiple "[AuthContext] Initializing auth..." messages

**Cause:** The AuthProvider is being unmounted and remounted

**Solution:** Check if there's a parent component causing re-renders

### Issue 2: Home Page Keeps Redirecting
**Symptom:** You see multiple "[Home] Redirecting..." messages

**Cause:** The redirect guard isn't working

**Solution:** The `hasRedirectedRef` should prevent this. If it's not working, there might be a React strict mode issue.

### Issue 3: RouteGuard Keeps Redirecting
**Symptom:** You see multiple redirect messages from RouteGuard

**Cause:** The component is re-rendering before the redirect completes

**Solution:** The `hasRedirectedRef` should prevent this.

## React Strict Mode

Next.js runs in Strict Mode in development, which causes components to mount twice. This is NORMAL and expected.

**What you'll see:**
```
[AuthContext] Initializing auth...
[AuthContext] Cleaning up...
[AuthContext] Initializing auth...
```

This is fine! The second initialization should complete normally.

## Emergency Fix: Disable Strict Mode

If the issue persists, you can temporarily disable strict mode to test:

**File:** `frontend/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,  // Changed from true to false
  // ... rest of config
};

module.exports = nextConfig;
```

**Then restart the dev server:**
```bash
cd frontend
# Stop the server (Ctrl+C)
npm run dev
```

## What to Share

If the issue persists, share:

1. **Full console output** from the moment you load the page
2. **Network tab** - Are there multiple requests to the same endpoint?
3. **React DevTools** - Is the AuthProvider mounting multiple times?
4. **Browser** - Which browser are you using?

## Next Steps

1. Clear storage and reload
2. Check console output
3. Look for the patterns described above
4. Share the console output if issue persists

## Files Modified
- `frontend/src/app/page.tsx` - Added redirect guard and debug logs
- `frontend/src/contexts/AuthContext.tsx` - Fixed initialization and added debug logs
- `frontend/src/components/auth/RouteGuard.tsx` - Added debug logs
