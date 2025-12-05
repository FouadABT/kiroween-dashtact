# Blog Image Upload - Testing Checklist

## Pre-Testing Setup

### 1. Start Backend
```bash
cd backend
npm run start:dev
```
**Expected**: Server starts on port 3001

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
**Expected**: Server starts on port 3000

### 3. Verify Servers Running
```bash
# Test backend
curl http://localhost:3001/health

# Test frontend
curl http://localhost:3000
```

## Automated Tests

### Run Proxy Test Script
```bash
node test-image-proxy.js
```

**Expected Output**:
```
🧪 Testing Image Proxy Functionality

1️⃣  Testing direct backend image access...
   ✅ Backend image accessible
   Status: 200
   Content-Type: image/jpeg

2️⃣  Testing image proxy API route...
   ✅ Proxy working correctly
   Status: 200
   Content-Type: image/jpeg
   Cache-Control: public, max-age=31536000, immutable

3️⃣  Testing proxy error handling...
   ✅ Proxy correctly handles missing URL parameter
   Status: 400

📊 Test Results:
   Backend Image: ✅
   Proxy Functionality: ✅
   Error Handling: ✅

🎉 All critical tests passed! Image proxy is working correctly.
```

## Manual Testing

### Test 1: Upload Image in Blog Editor

1. **Navigate to Blog Editor**
   - URL: `http://localhost:3000/dashboard/blog/new`
   - Login if needed

2. **Upload Image**
   - Scroll to "Featured Image" section
   - Click or drag & drop an image
   - **Expected**: Upload progress shows
   - **Expected**: Preview displays immediately

3. **Verify Preview**
   - **Expected**: Image shows in preview
   - **Expected**: No console errors
   - **Expected**: Image URL in form data

4. **Check Network Tab**
   - Open DevTools → Network tab
   - **Expected**: POST to `/uploads` succeeds
   - **Expected**: Response contains image URL
   - **Expected**: Image preview loads

### Test 2: Save and View Blog Post

1. **Fill in Post Details**
   - Title: "Test Post with Image"
   - Content: "This is a test post"
   - Keep uploaded image

2. **Save as Draft**
   - Click "Save Draft" button
   - **Expected**: Success toast appears
   - **Expected**: Redirects to blog list

3. **View in Blog List**
   - Navigate to `/dashboard/blog`
   - **Expected**: Post appears in list
   - **Expected**: Featured image displays
   - **Expected**: No console errors

4. **View Full Post**
   - Click on the post
   - **Expected**: Full post page loads
   - **Expected**: Featured image displays at top
   - **Expected**: Image is full width

### Test 3: Public Blog View

1. **Publish Post**
   - Edit the post
   - Click "Publish" button
   - **Expected**: Status changes to "Published"

2. **View on Public Blog**
   - Navigate to `/blog`
   - **Expected**: Post appears in list
   - **Expected**: Featured image displays in card

3. **View Full Post**
   - Click on post card
   - Navigate to `/blog/test-post-with-image`
   - **Expected**: Full post displays
   - **Expected**: Featured image shows

### Test 4: Image Proxy Verification

1. **Open DevTools**
   - Network tab
   - Filter: "image-proxy"

2. **Load Blog Post with Image**
   - **Expected**: Request to `/api/image-proxy?url=...`
   - **Expected**: Status: 200
   - **Expected**: Content-Type: image/jpeg (or png, gif, webp)
   - **Expected**: Cache-Control: public, max-age=31536000

3. **Check Response Headers**
   ```
   Content-Type: image/jpeg
   Cache-Control: public, max-age=31536000, immutable
   ```

### Test 5: Error Handling

1. **Test Invalid Image**
   - Try uploading a non-image file (e.g., .txt)
   - **Expected**: Error message shows
   - **Expected**: Upload rejected

2. **Test Large Image**
   - Try uploading image > 5MB
   - **Expected**: Error message shows
   - **Expected**: Upload rejected

3. **Test Missing Image**
   - Create post without image
   - **Expected**: No errors
   - **Expected**: Placeholder or no image shown

4. **Test Broken Image URL**
   - Manually set invalid image URL
   - **Expected**: Placeholder image shows
   - **Expected**: No console errors

### Test 6: Image Replacement

1. **Upload Initial Image**
   - Upload an image
   - **Expected**: Preview shows

2. **Replace Image**
   - Hover over preview
   - Click "Replace" button
   - Upload new image
   - **Expected**: New image replaces old
   - **Expected**: Preview updates

3. **Remove Image**
   - Hover over preview
   - Click "Remove" button
   - **Expected**: Image removed
   - **Expected**: Upload area shows again

### Test 7: Multiple Image Formats

Test each supported format:

1. **JPEG**
   - Upload .jpg file
   - **Expected**: Works ✅

2. **PNG**
   - Upload .png file
   - **Expected**: Works ✅

3. **GIF**
   - Upload .gif file
   - **Expected**: Works ✅

4. **WebP**
   - Upload .webp file
   - **Expected**: Works ✅

### Test 8: Responsive Images

1. **Desktop View**
   - View blog post on desktop
   - **Expected**: Image displays full width
   - **Expected**: Image scales properly

2. **Tablet View**
   - Resize browser to tablet size
   - **Expected**: Image scales down
   - **Expected**: Maintains aspect ratio

3. **Mobile View**
   - Resize browser to mobile size
   - **Expected**: Image scales to fit
   - **Expected**: No horizontal scroll

## Browser Testing

Test in multiple browsers:

### Chrome
- [ ] Upload works
- [ ] Images display
- [ ] Proxy works
- [ ] No console errors

### Firefox
- [ ] Upload works
- [ ] Images display
- [ ] Proxy works
- [ ] No console errors

### Safari
- [ ] Upload works
- [ ] Images display
- [ ] Proxy works
- [ ] No console errors

### Edge
- [ ] Upload works
- [ ] Images display
- [ ] Proxy works
- [ ] No console errors

## Performance Testing

### 1. Check Image Load Time
- Open DevTools → Network tab
- Load blog post with image
- **Expected**: Image loads < 1 second
- **Expected**: Cached on subsequent loads

### 2. Check Proxy Performance
- First load: Proxy fetches from backend
- Second load: Served from cache
- **Expected**: Second load much faster

### 3. Check Memory Usage
- Open DevTools → Performance tab
- Load multiple blog posts with images
- **Expected**: No memory leaks
- **Expected**: Smooth scrolling

## Security Testing

### 1. Test Authentication
- Try uploading without login
- **Expected**: 401 Unauthorized

### 2. Test File Type Validation
- Try uploading .exe file
- **Expected**: Rejected

### 3. Test File Size Limit
- Try uploading 10MB file
- **Expected**: Rejected

### 4. Test CORS
- Check proxy response headers
- **Expected**: Proper CORS headers

## Production Build Testing

### 1. Build Frontend
```bash
cd frontend
npm run build
```
**Expected**: Build succeeds with no errors

### 2. Start Production Server
```bash
npm start
```
**Expected**: Server starts on port 3000

### 3. Test in Production Mode
- Repeat all manual tests above
- **Expected**: All tests pass
- **Expected**: Proxy works correctly
- **Expected**: Images display

## Troubleshooting Tests

### If Upload Fails

1. **Check Backend**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check Uploads Folder**
   ```bash
   ls -la backend/uploads/images/
   ```

3. **Check Permissions**
   ```bash
   # Backend uploads folder should be writable
   ```

### If Images Don't Display

1. **Check Proxy**
   ```bash
   curl "http://localhost:3000/api/image-proxy?url=http://localhost:3001/uploads/images/test.jpg"
   ```

2. **Check Browser Console**
   - Look for errors
   - Check Network tab

3. **Clear Cache**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

### If Proxy Returns 500

1. **Check Backend Logs**
   - Look for errors in backend console

2. **Check Image Exists**
   ```bash
   curl http://localhost:3001/uploads/images/xxx.jpg
   ```

3. **Check CORS**
   - Verify backend allows frontend origin

## Final Checklist

Before marking as complete:

- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] Images upload successfully
- [ ] Images display in all views
- [ ] Proxy works correctly
- [ ] Caching works
- [ ] Error handling works
- [ ] Multiple formats supported
- [ ] Responsive on all devices
- [ ] Works in all browsers
- [ ] Production build succeeds
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Documentation complete

## Success Criteria

✅ **All tests pass**
✅ **Images upload and display correctly**
✅ **Proxy works in all environments**
✅ **No errors in console**
✅ **Performance is acceptable**
✅ **Security measures in place**

## Test Results

Date: ___________
Tester: ___________

| Test Category | Status | Notes |
|--------------|--------|-------|
| Automated Tests | ⬜ Pass ⬜ Fail | |
| Upload Functionality | ⬜ Pass ⬜ Fail | |
| Image Display | ⬜ Pass ⬜ Fail | |
| Proxy Functionality | ⬜ Pass ⬜ Fail | |
| Error Handling | ⬜ Pass ⬜ Fail | |
| Multiple Formats | ⬜ Pass ⬜ Fail | |
| Responsive Design | ⬜ Pass ⬜ Fail | |
| Browser Compatibility | ⬜ Pass ⬜ Fail | |
| Performance | ⬜ Pass ⬜ Fail | |
| Security | ⬜ Pass ⬜ Fail | |
| Production Build | ⬜ Pass ⬜ Fail | |

**Overall Status**: ⬜ Pass ⬜ Fail

**Notes**:
_______________________________________
_______________________________________
_______________________________________

---

**Next Steps After Testing**:
1. Mark all passing tests
2. Document any issues found
3. Fix any failing tests
4. Retest after fixes
5. Deploy to production when all tests pass
