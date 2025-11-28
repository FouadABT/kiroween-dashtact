# Expected Console Output - Test Guide

## Test 1: Fresh Load (No Auth)

### Steps:
1. Clear all storage (localStorage, sessionStorage, cookies)
2. Navigate to `http://localhost:3000/`
3. Check console output

### Expected Console Output:
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

### What This Means:
✅ AuthContext initialized once
✅ Home page redirected once to login
✅ RouteGuard allowed access to login page
✅ No loops detected

---

## Test 2: Direct Login Page Access

### Steps:
1. Clear all storage
2. Navigate directly to `http://localhost:3000/login`
3. Check console output

### Expected Console Output:
```
[AuthContext] Initializing auth...
[AuthContext] No token found
[AuthContext] Auth initialization complete
[RouteGuard] { pathname: '/login', isLoading: false, isAuthenticated: false, requireAuth: false, hasRedirected: false }
[RouteGuard] No redirect needed
```

### What This Means:
✅ AuthContext initialized once
✅ RouteGuard allowed access (no redirect needed)
✅ Login form displayed
✅ No loops detected

---

## Test 3: Authenticated User on Login Page

### Steps:
1. Log in successfully
2. Navigate to `http://localhost:3000/login`
3. Check console output

### Expected Console Output:
```
[AuthContext] Initializing auth...
[AuthContext] Valid token found, loading user...
[AuthContext] Auth initialization complete
[RouteGuard] { pathname: '/login', isLoading: false, isAuthenticated: true, requireAuth: false, hasRedirected: false }
[RouteGuard] Auth route but user authenticated, redirecting to dashboard
```

### What This Means:
✅ AuthContext loaded user from token
✅ RouteGuard detected authenticated user on auth page
✅ Redirected to dashboard once
✅ No loops detected

---

## Test 4: Protected Page Access (No Auth)

### Steps:
1. Clear all storage
2. Navigate to `http://localhost:3000/dashboard`
3. Check console output

### Expected Console Output:
```
[AuthContext] Initializing auth...
[AuthContext] No token found
[AuthContext] Auth initialization complete
[RouteGuard] { pathname: '/dashboard', isLoading: false, isAuthenticated: false, requireAuth: true, hasRedirected: false }
[RouteGuard] Protected route, redirecting to login
[RouteGuard] { pathname: '/login', isLoading: false, isAuthenticated: false, requireAuth: false, hasRedirected: false }
[RouteGuard] No redirect needed
```

### What This Means:
✅ AuthContext initialized once
✅ RouteGuard detected unauthenticated user on protected page
✅ Redirected to login once
✅ No loops detected

---

## BAD Output (Infinite Loop)

### What You DON'T Want to See:
```
[AuthContext] Initializing auth...
[AuthContext] Initializing auth...
[AuthContext] Initializing auth...
[Home] Redirecting...
[Home] Redirecting...
[Home] Redirecting...
[RouteGuard] { pathname: '/login', ... }
[RouteGuard] { pathname: '/login', ... }
[RouteGuard] { pathname: '/login', ... }
```

### If You See This:
1. The component is re-mounting repeatedly
2. The redirect guard isn't working
3. There's a parent component causing re-renders

### Debug Steps:
1. Check if you're using React Strict Mode (causes double mount in dev)
2. Check if there's a parent component re-rendering
3. Share the full console output

---

## React Strict Mode Note

In development, React Strict Mode causes components to mount twice. You might see:

```
[AuthContext] Initializing auth...
[AuthContext] Cleaning up...
[AuthContext] Initializing auth...
[AuthContext] Auth initialization complete
```

**This is NORMAL!** The second initialization should complete successfully without loops.

---

## How to Copy Console Output

### Chrome/Edge:
1. Right-click in console
2. Select "Save as..." to save to file
3. Or select all (Ctrl+A) and copy (Ctrl+C)

### Firefox:
1. Right-click in console
2. Select "Export Visible Messages to File"
3. Or select all and copy

### Safari:
1. Select all messages
2. Copy (Cmd+C)

---

## What to Share If Issue Persists

Please provide:

1. **Full console output** (from page load to when loop starts)
2. **Browser name and version** (e.g., Chrome 120, Firefox 121)
3. **Operating system** (Windows, Mac, Linux)
4. **Screenshot of Network tab** showing the requests
5. **Any error messages** in red

This will help identify the exact cause of the infinite loop.
