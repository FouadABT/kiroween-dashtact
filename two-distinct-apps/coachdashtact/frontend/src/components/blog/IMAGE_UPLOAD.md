# Blog Image Upload System

## Overview

The blog image upload system provides a seamless way to upload, preview, and manage featured images for blog posts. It integrates with the existing file upload module and provides image optimization recommendations.

## Features

### 1. Image Upload
- **Drag-and-drop support**: Drag images directly onto the upload area
- **Click to select**: Traditional file picker interface
- **File validation**: Automatic validation of file type and size
- **Progress indicator**: Visual feedback during upload
- **Error handling**: Clear error messages for failed uploads

### 2. Image Preview
- **Real-time preview**: See uploaded image immediately
- **Hover actions**: Replace or remove image on hover
- **Responsive display**: Images scale appropriately
- **Error recovery**: Graceful handling of broken images

### 3. Image Optimization
- **Size recommendations**: Suggests optimal dimensions (1200x630)
- **Aspect ratio validation**: Warns about non-optimal ratios
- **File size limits**: Enforces 5MB maximum
- **Format support**: JPEG, PNG, GIF, WebP

### 4. Image Management
- **Replace functionality**: Upload new image to replace existing
- **Delete functionality**: Remove image with confirmation
- **Backend integration**: Automatic cleanup of old images
- **URL management**: Handles both uploaded and external URLs

## Components

### BlogImageUpload

Main component for blog image uploads.

**Location**: `frontend/src/components/blog/BlogImageUpload.tsx`

**Props**:
```typescript
interface BlogImageUploadProps {
  value?: string;              // Current image URL
  onChange: (url: string) => void;  // Change handler
  label?: string;              // Field label
  disabled?: boolean;          // Disabled state
  className?: string;          // Additional CSS classes
}
```

**Usage**:
```tsx
import { BlogImageUpload } from '@/components/blog/BlogImageUpload';

<BlogImageUpload
  value={featuredImage}
  onChange={(url) => setFeaturedImage(url)}
  label="Featured Image"
  disabled={loading}
/>
```

### Image Optimization Utilities

Helper functions for image validation and optimization.

**Location**: `frontend/src/lib/image-optimization.ts`

**Key Functions**:

#### getImageDimensions
```typescript
async function getImageDimensions(url: string): Promise<ImageDimensions>
```
Get width and height of an image from URL.

#### validateBlogImage
```typescript
async function validateBlogImage(
  file: File,
  maxSize?: number
): Promise<ImageValidationResult>
```
Validate image file with recommendations.

#### compressImage
```typescript
async function compressImage(
  file: File,
  maxWidth?: number,
  maxHeight?: number,
  quality?: number
): Promise<Blob>
```
Compress image client-side before upload.

#### getImageRecommendations
```typescript
function getImageRecommendations(dimensions: ImageDimensions): string[]
```
Get optimization recommendations for image dimensions.

## Backend Integration

### Upload Endpoint

**POST** `/uploads`

Upload a file to the server.

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `file`: File to upload
  - `type`: 'image' or 'document'
  - `description`: Optional description

**Response**:
```json
{
  "filename": "uuid.jpg",
  "originalName": "photo.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "url": "/uploads/images/uuid.jpg",
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

**Permissions**: Requires `files:write` permission

### Delete Endpoint

**DELETE** `/uploads/:type/:filename`

Delete an uploaded file.

**Parameters**:
- `type`: 'image' or 'document'
- `filename`: Name of file to delete

**Response**:
```json
{
  "message": "File deleted successfully"
}
```

**Permissions**: Requires `files:delete` permission

## Configuration

### Recommended Image Sizes

```typescript
const RECOMMENDED_SIZES = {
  featuredImage: {
    width: 1200,
    height: 630,
    aspectRatio: 1.905,
  },
  thumbnail: {
    width: 400,
    height: 300,
    aspectRatio: 1.333,
  },
  contentImage: {
    maxWidth: 1200,
    maxHeight: 800,
  },
};
```

### File Constraints

- **Maximum file size**: 5MB
- **Allowed formats**: JPEG, PNG, GIF, WebP
- **Recommended dimensions**: 1200x630 pixels
- **Aspect ratio**: 1.905:1 (for Open Graph)

## Usage Examples

### Basic Upload

```tsx
import { BlogImageUpload } from '@/components/blog/BlogImageUpload';

function MyComponent() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <BlogImageUpload
      value={imageUrl}
      onChange={setImageUrl}
    />
  );
}
```

### With Validation

```tsx
import { BlogImageUpload } from '@/components/blog/BlogImageUpload';
import { validateBlogImage } from '@/lib/image-optimization';

function MyComponent() {
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = async (url: string) => {
    // Additional validation if needed
    setImageUrl(url);
  };

  return (
    <BlogImageUpload
      value={imageUrl}
      onChange={handleChange}
    />
  );
}
```

### In Blog Editor

The BlogImageUpload component is integrated into the BlogEditor:

```tsx
// In BlogEditor.tsx
<BlogImageUpload
  value={formData.featuredImage}
  onChange={(url) => handleChange('featuredImage', url)}
  label="Featured Image"
  disabled={loading}
/>
```

## Image Optimization Best Practices

### 1. Use Optimal Dimensions

For featured images, use 1200x630 pixels:
- Perfect for Open Graph (social media sharing)
- Good balance between quality and file size
- Widely supported aspect ratio

### 2. Choose the Right Format

- **JPEG**: Best for photographs (smaller file size)
- **PNG**: Best for graphics with transparency
- **WebP**: Modern format with best compression (if supported)
- **GIF**: Only for simple animations

### 3. Compress Before Upload

Use the `compressImage` utility to reduce file size:

```typescript
import { compressImage } from '@/lib/image-optimization';

const compressed = await compressImage(file, 1200, 630, 0.9);
```

### 4. Validate Dimensions

Check image dimensions before upload:

```typescript
import { getImageDimensions, getImageRecommendations } from '@/lib/image-optimization';

const dimensions = await getImageDimensions(url);
const recommendations = getImageRecommendations(dimensions);
```

## Error Handling

### Common Errors

1. **File too large**
   - Error: "File size exceeds 5MB"
   - Solution: Compress image or use smaller file

2. **Invalid file type**
   - Error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image"
   - Solution: Convert image to supported format

3. **Upload failed**
   - Error: "Failed to upload image"
   - Solution: Check network connection and try again

4. **Image load failed**
   - Error: "Failed to load image preview"
   - Solution: Verify image URL is accessible

### Error Display

Errors are displayed in the component with:
- Red background
- Alert icon
- Clear error message
- Toast notification

## Accessibility

### Keyboard Navigation

- Tab to focus upload area
- Enter/Space to open file picker
- Tab to action buttons (Replace, Remove)
- Enter/Space to activate buttons

### Screen Reader Support

- Upload area has descriptive label
- File requirements announced
- Upload progress announced
- Error messages announced
- Success messages announced

### Visual Indicators

- Clear focus states
- High contrast error messages
- Progress indicator for uploads
- Hover states for actions

## Testing

### Manual Testing

1. **Upload new image**
   - Drag and drop image
   - Click to select image
   - Verify preview appears
   - Check image URL is set

2. **Replace image**
   - Hover over existing image
   - Click "Replace" button
   - Select new image
   - Verify old image is replaced

3. **Delete image**
   - Hover over existing image
   - Click "Remove" button
   - Verify image is removed
   - Check URL is cleared

4. **Error handling**
   - Try uploading file > 5MB
   - Try uploading non-image file
   - Verify error messages appear

### Automated Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogImageUpload } from './BlogImageUpload';

describe('BlogImageUpload', () => {
  it('should upload image', async () => {
    const onChange = jest.fn();
    render(<BlogImageUpload onChange={onChange} />);
    
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
});
```

## Troubleshooting

### Image not uploading

**Symptoms**: Upload progress stuck or fails

**Possible causes**:
1. Network connection issues
2. Backend server not running
3. Missing authentication token
4. Insufficient permissions

**Solutions**:
1. Check network connection
2. Verify backend is running on port 3001
3. Ensure user is logged in
4. Verify user has `files:write` permission

### Image preview not showing

**Symptoms**: Upload succeeds but no preview

**Possible causes**:
1. Invalid image URL
2. CORS issues
3. Image file corrupted

**Solutions**:
1. Check image URL in browser
2. Verify CORS headers on backend
3. Try uploading different image

### Image too large

**Symptoms**: Error about file size

**Solutions**:
1. Compress image before upload
2. Resize image to 1200x630
3. Convert to more efficient format (WebP)

## Future Enhancements

### Planned Features

1. **Image cropping**: Built-in crop tool for aspect ratio
2. **Multiple images**: Support for image galleries
3. **Image filters**: Basic editing (brightness, contrast)
4. **CDN integration**: Automatic upload to CDN
5. **Lazy loading**: Optimize page load performance
6. **Responsive images**: Generate multiple sizes
7. **Alt text editor**: Accessibility improvements
8. **Image library**: Browse previously uploaded images

### Performance Improvements

1. **Client-side compression**: Reduce upload size
2. **Progressive upload**: Show progress for large files
3. **Thumbnail generation**: Create thumbnails on upload
4. **Caching**: Cache uploaded images locally
5. **Batch upload**: Upload multiple images at once

## Resources

- **Component**: `frontend/src/components/blog/BlogImageUpload.tsx`
- **Utilities**: `frontend/src/lib/image-optimization.ts`
- **Backend Service**: `backend/src/uploads/uploads.service.ts`
- **Backend Controller**: `backend/src/uploads/uploads.controller.ts`
- **Upload Config**: `backend/src/uploads/interfaces/upload-config.interface.ts`

## Support

For issues or questions:
1. Check this documentation
2. Review error messages
3. Check browser console for errors
4. Verify backend logs
5. Test with different images
