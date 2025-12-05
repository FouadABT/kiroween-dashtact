# Content Save Debug Guide

## Logging Added

I've added comprehensive logging to debug why content edits aren't being saved.

## Where to Look

### 1. Open Browser Console
1. Navigate to `/dashboard/pages/[id]/edit`
2. Open DevTools (F12)
3. Go to Console tab
4. Look for logs prefixed with:
   - `[ContentEditor]` - Editor initialization and updates
   - `[PageEditor]` - Save operations and content state

### 2. Expected Log Flow

**When page loads:**
```
[PageEditor] Page loaded: { id: "...", title: "...", slug: "..." }
[ContentEditor] Rendering: { contentLength: 1234, isInitialized: false, contentPreview: "..." }
[ContentEditor] useEffect triggered: { hasEditor: true, isInitialized: false, contentLength: 1234 }
[ContentEditor] Initializing editor with content
```

**When you edit content:**
```
[ContentEditor] onUpdate fired: { htmlLength: 1250, htmlPreview: "..." }
[PageEditor] Content changed: { newLength: 1250, oldLength: 1234, preview: "..." }
```

**When you click Save:**
```
[PageEditor] handleSave called: { isAutoSave: false, mode: "edit", pageId: "...", contentLength: 1250 }
[PageEditor] Saving page data: { url: "/pages/...", method: "PATCH", contentLength: 1250 }
[PageEditor] Save response: { status: 200, ok: true }
[PageEditor] Page saved successfully: { id: "...", title: "...", contentLength: 1250 }
```

**When you reload the page:**
```
[PageEditor] Page loaded: { id: "...", title: "...", slug: "..." }
[ContentEditor] Rendering: { contentLength: 1250, ... } // Should show NEW length
```

## Common Issues to Check

### Issue 1: Content Not Changing in State
**Symptom:**
```
[ContentEditor] onUpdate fired: { htmlLength: 1250 }
[PageEditor] Content changed: { newLength: 1250, oldLength: 1234 }
// But when you save:
[PageEditor] handleSave called: { contentLength: 1234 } // ❌ Still old length!
```

**Cause**: State not updating properly

**Solution**: Check if there's a stale closure or state issue

### Issue 2: Save Request Not Sent
**Symptom:**
```
[PageEditor] handleSave called: { ... }
// No "Saving page data" log appears
```

**Cause**: Validation failing (title, slug, or content empty)

**Solution**: Check validation messages in console

### Issue 3: Save Request Fails
**Symptom:**
```
[PageEditor] Save response: { status: 400, ok: false }
[PageEditor] Save failed: { message: "..." }
```

**Cause**: Backend validation error or API issue

**Solution**: Check backend logs and error message

### Issue 4: Content Resets After Save
**Symptom:**
```
[PageEditor] Page saved successfully: { contentLength: 1250 }
// But immediately after:
[ContentEditor] useEffect triggered: { contentLength: 1234 } // ❌ Old content!
```

**Cause**: Page reloading or state resetting

**Solution**: Check if page is being reloaded or if loadPage() is being called again

### Issue 5: Editor Reinitializing
**Symptom:**
```
[ContentEditor] Initializing editor with content
// Happens multiple times, resetting your edits
```

**Cause**: `isInitialized` flag not working or component remounting

**Solution**: Check if component is unmounting/remounting

## Testing Steps

### Step 1: Load Page
1. Navigate to edit page
2. Check console for initial load logs
3. Verify content length matches what you see

### Step 2: Edit Content
1. Type some text in the editor
2. Check console for `onUpdate` and `Content changed` logs
3. Verify new length is greater than old length

### Step 3: Save
1. Click "Save Draft" button
2. Check console for save logs
3. Verify API request is sent with correct content length
4. Verify response is successful

### Step 4: Reload
1. Refresh the page (F5)
2. Check console for page load logs
3. Verify content length matches what you saved
4. Verify editor shows your edits

## What to Report

If the issue persists, copy and paste:

1. **All console logs** from loading the page through saving
2. **The exact steps** you took
3. **What you expected** vs **what happened**
4. **Network tab** - Check the PATCH request to `/pages/[id]`:
   - Request payload (body)
   - Response status and body

## Quick Checks

### Check 1: Is Content State Updating?
Look for this pattern:
```
[PageEditor] Content changed: { newLength: X, oldLength: Y }
```
If X > Y, state is updating ✅

### Check 2: Is Save Sending Correct Data?
Look for:
```
[PageEditor] Saving page data: { contentLength: X }
```
Should match the length from "Content changed" ✅

### Check 3: Is Backend Saving It?
Look for:
```
[PageEditor] Page saved successfully: { contentLength: X }
```
Should match what you sent ✅

### Check 4: Is It Loading Back Correctly?
After reload, look for:
```
[PageEditor] Page loaded: { ... }
[ContentEditor] Rendering: { contentLength: X }
```
Should match what was saved ✅

## Status

✅ Logging added - Ready to debug!

Run through the test steps and check the console logs to identify where the issue is occurring.
