# Restart Dev Server - Clear Cache

## Problem

After making changes to convert pages to client components, Next.js is still showing old errors because of cached builds.

## Solution

You need to restart the frontend dev server with a clean cache.

## Steps to Fix

### 1. Stop the Frontend Server
Press `Ctrl+C` in the terminal running the frontend

### 2. Delete Next.js Cache
```bash
cd frontend
rmdir /s /q .next
```

Or manually delete the `.next` folder in the frontend directory.

### 3. Restart the Server
```bash
npm run dev
```

### 4. Hard Refresh Browser
- Press `Ctrl+Shift+R` (Windows/Linux)
- Or `Cmd+Shift+R` (Mac)
- Or open DevTools → Network tab → Check "Disable cache"

## Why This Happens

Next.js caches compiled pages in the `.next` folder. When you change a page from Server Component to Client Component, the cache can cause conflicts.

## Alternative: Kill Process

If the server won't stop:

```bash
# Find the process
netstat -ano | findstr :3000

# Kill it (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

## After Restart

1. Navigate to `/dashboard/pages/new`
2. Create a page
3. Click Publish
4. Should redirect to edit page without errors
5. Images should display correctly

## Image Issue

The image error `GET http://localhost:3000/uploads/images/...` happens because:
- The image is stored on backend (port 3001)
- Frontend is trying to access it on port 3000
- Our `getImageUrl()` helper should fix this, but cache might be serving old code

After clearing cache and restarting, the image proxy should work correctly.
