# Blog Image Upload - Quick Reference

## Problem Fixed ✅

**Issue**: Images uploaded to blog posts showed error:
```
⨯ upstream image http://localhost:3001/uploads/images/xxx.jpg resolved to private ip
```

**Solution**: Implemented image proxy system that works in all environments.

## How to Use

### 1. Upload Image in Blog Editor

```typescript
// Navigate to /dashboard/blog/new or /dashboard/blog/[id]/edit
// Click "Featured Image" section
// Drag & drop or click to select image
// Image uploads automatically
// Preview shows immediately
```

### 2. Image URL Handling (Automatic)

All blog components now automatically handle image URLs:

```typescript
import { getImageUrl } from '@/lib/image-proxy';

// In any component
<Image src={getImageUrl(imageUrl)} alt="..." />
```

### 3. Supported Image Formats

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)

**Limits**:
- Max file size: 5MB
- Recommended: 1200x630 pixels (for social sharing)

## API Endpoints

### Upload Image
```
POST /uploads
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
  file: <image file>
  type: "image"
  description: "Blog post featured image"

Response:
{
  "id": "xxx",
  "url": "/uploads/images/xxx.jpg",
  "filename": "xxx.jpg",
  "mimeType": "image/jpeg",
  "size": 123456
}
```

### Get Image (Direct)
```
GET http://localhost:3001/uploads/images/xxx.jpg
```

### Get Image (Proxied)
```
GET /api/image-proxy?url=http://localhost:3001/uploads/images/xxx.jpg
```

## Helper Functions

### `getImageUrl(imageUrl)`

Main function for getting image URLs. Handles all cases automatically.

```typescript
import { getImageUrl } from '@/lib/image-proxy';

// Relative URL
getImageUrl('/uploads/images/test.jpg')
// → In dev: http://localhost:3001/uploads/images/test.jpg
// → In prod: /api/image-proxy?url=...

// Absolute URL (localhost)
getImageUrl('http://localhost:3001/uploads/images/test.jpg')
// → In dev: http://localhost:3001/uploads/images/test.jpg
// → In prod: /api/image-proxy?url=...

// Absolute URL (public)
getImageUrl('https://cdn.example.com/image.jpg')
// → https://cdn.example.com/image.jpg (no proxy needed)

// Null/undefined
getImageUrl(null)
// → /placeholder-image.svg
```

### `getProxiedImageUrl(imageUrl)`

Explicitly get proxied URL (advanced use).

```typescript
import { getProxiedImageUrl } from '@/lib/image-proxy';

const proxiedUrl = getProxiedImageUrl('http://localhost:3001/uploads/images/test.jpg');
// → /api/image-proxy?url=http%3A%2F%2Flocalhost%3A3001%2Fuploads%2Fimages%2Ftest.jpg
```

### `isLocalUrl(url)`

Check if URL is localhost/private IP.

```typescript
import { isLocalUrl } from '@/lib/image-proxy';

isLocalUrl('http://localhost:3001/image.jpg')  // → true
isLocalUrl('http://127.0.0.1/image.jpg')       // → true
isLocalUrl('http://192.168.1.1/image.jpg')     // → true
isLocalUrl('https://example.com/image.jpg')    // → false
```

## Components Updated

All blog components automatically use the proxy:

1. ✅ `BlogImageUpload` - Image preview in editor
2. ✅ `BlogCard` - Featured image in blog list
3. ✅ `BlogPost` - Featured image in full post view

## Testing

### Manual Test

1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to: `http://localhost:3000/dashboard/blog/new`
4. Upload an image
5. Verify preview shows
6. Save post
7. View post on blog page
8. Verify image displays

### Automated Test

```bash
node test-image-proxy.js
```

### Browser DevTools Test

1. Open DevTools → Network tab
2. Upload image in blog editor
3. Look for request to `/api/image-proxy?url=...`
4. Verify:
   - Status: 200
   - Content-Type: image/jpeg (or png, gif, webp)
   - Cache-Control: public, max-age=31536000

## Troubleshooting

### Image Not Displaying

**Check**:
1. Backend running? `curl http://localhost:3001/health`
2. Image exists? `curl http://localhost:3001/uploads/images/xxx.jpg`
3. Proxy works? `curl http://localhost:3000/api/image-proxy?url=http://localhost:3001/uploads/images/xxx.jpg`
4. Browser console errors?

**Fix**:
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### Upload Fails

**Check**:
1. File size < 5MB?
2. File type is image?
3. Backend uploads folder writable?
4. Authentication token valid?

**Fix**:
```bash
# Check backend logs
cd backend
npm run start:dev

# Check uploads folder
ls -la backend/uploads/images/
```

### Proxy Returns 500

**Check**:
1. Backend CORS allows frontend origin?
2. Backend authentication not required for images?
3. Image file exists on disk?

**Fix**:
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

## Environment Variables

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Files Reference

```
frontend/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── image-proxy/
│   │           └── route.ts          # Proxy API route
│   ├── lib/
│   │   └── image-proxy.ts            # Helper functions
│   ├── components/
│   │   └── blog/
│   │       ├── BlogImageUpload.tsx   # Upload component
│   │       ├── BlogCard.tsx          # List view
│   │       └── BlogPost.tsx          # Full post view
│   └── public/
│       └── placeholder-image.svg     # Fallback image
├── next.config.ts                    # Image config
└── .env.local                        # Environment vars
```

## Performance

- ✅ Images cached for 1 year (`max-age=31536000`)
- ✅ Proxy runs server-side (no client overhead)
- ✅ Supports all Next.js Image optimization features
- ✅ Lazy loading enabled by default
- ✅ Responsive images with `sizes` attribute

## Security

- ✅ Server-side proxy (no client exposure)
- ✅ URL validation and sanitization
- ✅ Content-Type verification
- ✅ File size limits enforced
- ✅ Authentication required for uploads
- ✅ CORS properly configured

## Next Steps

1. ✅ Upload images work in development
2. ✅ Images display correctly
3. ✅ Proxy handles errors gracefully
4. 🔄 Test in production build
5. 🔄 Consider CDN integration
6. 🔄 Add image compression
7. 🔄 Implement WebP conversion

## Support

For issues or questions:
1. Check `BLOG_IMAGE_LOCALHOST_FIX.md` for detailed explanation
2. Run `node test-image-proxy.js` for diagnostics
3. Check browser console and network tab
4. Review backend logs for errors

---

**Status**: ✅ Fully Implemented and Working
**Last Updated**: 2025-11-12
