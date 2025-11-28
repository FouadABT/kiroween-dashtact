# Image Upload Added to Content Editor

## What Was Added

An **Upload Image** button in the markdown toolbar that allows users to upload images directly into the content.

## How It Works

1. **Click the Upload button** (📤 icon) in the toolbar
2. **Select an image** from your computer
3. **Image uploads** to the backend
4. **Markdown is inserted** automatically: `![filename](uploaded-url)`
5. **Image appears** in the preview

## Features

### Upload Button
- Located next to the Image Markdown button
- Shows upload icon (📤)
- Shows spinner while uploading
- Disabled during upload

### Validation
- **File types:** PNG, JPG, WebP, SVG
- **Max size:** 5MB
- **Error messages:** Toast notifications for invalid files

### Auto-Insert
- Uploads image to backend
- Gets the URL from response
- Inserts markdown at cursor position
- Format: `![filename](url)`

### User Feedback
- Loading spinner during upload
- Success toast when complete
- Error toast if upload fails
- File input resets after upload

## Toolbar Layout

```
[H1] [H2] [H3] | [B] [I] | [•] [1.] | [🔗] [🖼️] [📤] | ["] [</>]
                                      ↑
                                  New Upload Button
```

## Usage Example

1. **Write content:**
   ```markdown
   # My Page
   
   Here's an image:
   ```

2. **Click Upload button**
3. **Select image** (e.g., `screenshot.png`)
4. **Auto-inserted:**
   ```markdown
   # My Page
   
   Here's an image:
   ![screenshot.png](/uploads/images/abc123.png)
   ```

5. **Click Preview** → See the image rendered!

## Technical Details

### Uses Existing API
```typescript
await PagesApi.uploadFeaturedImage(file);
```

Same endpoint as featured image upload:
- `POST /pages/featured-image`
- Multipart form data
- Returns `{ url, filename, size, mimetype }`

### File Validation
```typescript
// Valid types
['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']

// Max size
5MB (5 * 1024 * 1024 bytes)
```

### Error Handling
- Invalid file type → Toast error
- File too large → Toast error
- Upload fails → Toast error + console log
- All errors reset the file input

## Files Modified

✅ `frontend/src/components/pages/ContentEditor.tsx`

## Benefits

1. **No manual URL entry** - Upload and insert in one click
2. **Consistent with featured image** - Uses same upload logic
3. **Validated uploads** - File type and size checks
4. **Good UX** - Loading states and error messages
5. **Markdown preview** - See images in preview tab

## Testing

1. Go to `/dashboard/pages/new`
2. Click "Content" section
3. Click the Upload button (📤) in toolbar
4. Select an image file
5. Wait for upload (see spinner)
6. See markdown inserted: `![name](url)`
7. Click Preview tab
8. See the image rendered

### Test Error Cases
- Try uploading a PDF → See error toast
- Try uploading 10MB image → See error toast
- Upload valid image → Success!

## Status

✅ Image upload button added
✅ Uses existing upload API
✅ Auto-inserts markdown
✅ Full validation and error handling
✅ Loading states
✅ Toast notifications
