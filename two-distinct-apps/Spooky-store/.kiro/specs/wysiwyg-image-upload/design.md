# WYSIWYG Editor Image Upload Enhancement - Design Document

## Overview

This design document outlines the technical implementation for adding image upload functionality to the existing TipTap-based WYSIWYG editor used in both the Pages CMS and Blog System. The solution will provide a seamless, integrated image upload experience with drag-and-drop support, validation, and proper error handling.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           ContentEditor Component                       │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  TipTap Editor with Image Extension              │  │ │
│  │  │  - Image Upload Button                           │  │ │
│  │  │  - Drag & Drop Handler                           │  │ │
│  │  │  - Image Node Renderer                           │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  ImageUploadService                              │  │ │
│  │  │  - File Validation                               │  │ │
│  │  │  - Upload to Backend                             │  │ │
│  │  │  - Progress Tracking                             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP POST /uploads/editor-image
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                    Backend (NestJS)                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           UploadsController                            │ │
│  │  - POST /uploads/editor-image                         │ │
│  │  - JWT Authentication                                 │ │
│  │  - File Validation                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           UploadsService                               │ │
│  │  - File Storage (uploads/editor-images/)              │ │
│  │  - Filename Generation                                │ │
│  │  - URL Generation                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Enhanced ContentEditor Component

**Location**: `frontend/src/components/pages/ContentEditor.tsx` (existing)

**Enhancements**:
```typescript
interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

// Add image upload configuration to TipTap editor
const editor = useEditor({
  extensions: [
    // ... existing extensions
    Image.configure({
      inline: true,
      allowBase64: false,
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    // Custom image upload extension
    ImageUpload.configure({
      uploadFn: uploadEditorImage,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'],
    }),
  ],
  // ... rest of config
});
```

#### 2. ImageUploadButton Component

**Location**: `frontend/src/components/editor/ImageUploadButton.tsx` (new)

```typescript
interface ImageUploadButtonProps {
  editor: Editor;
  disabled?: boolean;
}

export function ImageUploadButton({ editor, disabled }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Validate file
    if (!validateImageFile(file)) {
      toast.error('Invalid file type or size');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadEditorImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        title="Insert Image"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
    </>
  );
}
```

#### 3. ImageUpload TipTap Extension

**Location**: `frontend/src/lib/editor/extensions/ImageUpload.ts` (new)

```typescript
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface ImageUploadOptions {
  uploadFn: (file: File) => Promise<string>;
  maxSize: number;
  allowedTypes: string[];
}

export const ImageUpload = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      uploadFn: async () => '',
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'],
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          handleDOMEvents: {
            drop: (view, event) => {
              // Handle drag and drop
              const files = Array.from(event.dataTransfer?.files || []);
              const imageFiles = files.filter(file => 
                this.options.allowedTypes.includes(file.type)
              );

              if (imageFiles.length > 0) {
                event.preventDefault();
                imageFiles.forEach(file => this.handleImageUpload(file, view));
                return true;
              }
              return false;
            },
            paste: (view, event) => {
              // Handle paste
              const files = Array.from(event.clipboardData?.files || []);
              const imageFiles = files.filter(file => 
                this.options.allowedTypes.includes(file.type)
              );

              if (imageFiles.length > 0) {
                event.preventDefault();
                imageFiles.forEach(file => this.handleImageUpload(file, view));
                return true;
              }
              return false;
            },
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      uploadImage: (file: File) => ({ commands }) => {
        return this.handleImageUpload(file, this.editor.view);
      },
    };
  },

  handleImageUpload(file: File, view: any) {
    // Validate file size
    if (file.size > this.options.maxSize) {
      toast.error(`File size exceeds ${this.options.maxSize / 1024 / 1024}MB limit`);
      return false;
    }

    // Insert placeholder
    const { schema } = view.state;
    const pos = view.state.selection.from;
    const node = schema.nodes.image.create({
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
      class: 'uploading',
    });
    const tr = view.state.tr.insert(pos, node);
    view.dispatch(tr);

    // Upload file
    this.options.uploadFn(file)
      .then(url => {
        // Replace placeholder with actual image
        const { state } = view;
        const $pos = state.doc.resolve(pos);
        const tr = state.tr.setNodeMarkup(pos, null, {
          src: url,
          class: '',
        });
        view.dispatch(tr);
      })
      .catch(error => {
        // Remove placeholder on error
        const { state } = view;
        const tr = state.tr.delete(pos, pos + 1);
        view.dispatch(tr);
        toast.error('Failed to upload image');
      });

    return true;
  },
});
```

#### 4. Image Upload Service

**Location**: `frontend/src/lib/api/uploads.ts` (enhance existing)

```typescript
export async function uploadEditorImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/uploads/editor-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
}

export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
}
```

### Backend Components

#### 1. UploadsController Enhancement

**Location**: `backend/src/uploads/uploads.controller.ts` (existing)

**Add New Endpoint**:
```typescript
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // ... existing endpoints

  @Post('editor-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEditorImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }

    // Upload file
    const url = await this.uploadsService.uploadEditorImage(file);

    return {
      url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
```

#### 2. UploadsService Enhancement

**Location**: `backend/src/uploads/uploads.service.ts` (existing)

**Add New Method**:
```typescript
@Injectable()
export class UploadsService {
  private readonly uploadDir = 'uploads/editor-images';

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadEditorImage(file: Express.Multer.File): Promise<string> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${ext}`;

    // Save file
    const filepath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filepath, file.buffer);

    // Generate URL
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}/${this.uploadDir}/${filename}`;

    return url;
  }

  // ... existing methods
}
```

## Data Models

### Image Upload Request

```typescript
interface ImageUploadRequest {
  file: File; // Multipart form data
}
```

### Image Upload Response

```typescript
interface ImageUploadResponse {
  url: string;          // Full URL to uploaded image
  filename: string;     // Original filename
  size: number;         // File size in bytes
  mimetype: string;     // MIME type
}
```

### TipTap Image Node Attributes

```typescript
interface ImageNodeAttributes {
  src: string;          // Image URL
  alt?: string;         // Alt text for accessibility
  title?: string;       // Image title
  width?: number;       // Image width
  height?: number;      // Image height
  class?: string;       // CSS class
}
```

## Error Handling

### Frontend Error Handling

```typescript
// File validation errors
class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

// Upload errors
class UploadError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'UploadError';
  }
}

// Error handling in upload function
async function uploadEditorImage(file: File): Promise<string> {
  try {
    // Validate
    if (!validateImageFile(file)) {
      throw new FileValidationError('Invalid file type or size');
    }

    // Upload
    const response = await fetch(...);
    
    if (!response.ok) {
      const error = await response.json();
      throw new UploadError(error.message, response.status);
    }

    return data.url;
  } catch (error) {
    if (error instanceof FileValidationError) {
      toast.error(error.message);
    } else if (error instanceof UploadError) {
      toast.error(`Upload failed: ${error.message}`);
    } else {
      toast.error('An unexpected error occurred');
    }
    throw error;
  }
}
```

### Backend Error Handling

```typescript
// In controller
@Post('editor-image')
async uploadEditorImage(@UploadedFile() file: Express.Multer.File) {
  try {
    // Validation
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }

    // Upload
    const url = await this.uploadsService.uploadEditorImage(file);
    return { url, filename: file.originalname, size: file.size, mimetype: file.mimetype };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new InternalServerErrorException('Failed to upload image');
  }
}
```

## Testing Strategy

### Unit Tests

#### Frontend Tests

**File**: `frontend/src/components/editor/__tests__/ImageUploadButton.test.tsx`

```typescript
describe('ImageUploadButton', () => {
  it('should render upload button', () => {
    // Test button rendering
  });

  it('should open file dialog on click', () => {
    // Test file dialog opening
  });

  it('should validate file type', () => {
    // Test file type validation
  });

  it('should validate file size', () => {
    // Test file size validation
  });

  it('should upload image and insert into editor', async () => {
    // Test successful upload
  });

  it('should show error on upload failure', async () => {
    // Test error handling
  });

  it('should disable button during upload', () => {
    // Test loading state
  });
});
```

**File**: `frontend/src/lib/editor/extensions/__tests__/ImageUpload.test.ts`

```typescript
describe('ImageUpload Extension', () => {
  it('should handle drag and drop', () => {
    // Test drag and drop functionality
  });

  it('should handle paste', () => {
    // Test paste functionality
  });

  it('should insert placeholder during upload', () => {
    // Test placeholder insertion
  });

  it('should replace placeholder with image on success', () => {
    // Test image insertion
  });

  it('should remove placeholder on error', () => {
    // Test error handling
  });

  it('should validate file size', () => {
    // Test file size validation
  });
});
```

**File**: `frontend/src/lib/api/__tests__/uploads.test.ts`

```typescript
describe('uploadEditorImage', () => {
  it('should upload image successfully', async () => {
    // Test successful upload
  });

  it('should throw error on invalid file type', async () => {
    // Test file type validation
  });

  it('should throw error on file size exceeded', async () => {
    // Test file size validation
  });

  it('should throw error on network failure', async () => {
    // Test network error handling
  });

  it('should include auth token in request', async () => {
    // Test authentication
  });
});
```

#### Backend Tests

**File**: `backend/src/uploads/__tests__/uploads.controller.spec.ts`

```typescript
describe('UploadsController - editor-image', () => {
  it('should upload image successfully', async () => {
    // Test successful upload
  });

  it('should reject invalid file type', async () => {
    // Test file type validation
  });

  it('should reject file size exceeded', async () => {
    // Test file size validation
  });

  it('should require authentication', async () => {
    // Test auth guard
  });

  it('should return image URL', async () => {
    // Test response format
  });
});
```

**File**: `backend/src/uploads/__tests__/uploads.service.spec.ts`

```typescript
describe('UploadsService - uploadEditorImage', () => {
  it('should save file to disk', async () => {
    // Test file saving
  });

  it('should generate unique filename', async () => {
    // Test filename generation
  });

  it('should return correct URL', async () => {
    // Test URL generation
  });

  it('should create upload directory if not exists', async () => {
    // Test directory creation
  });
});
```

### Integration Tests

**File**: `frontend/src/__tests__/integration/editor-image-upload.test.tsx`

```typescript
describe('Editor Image Upload Integration', () => {
  it('should upload image in page editor', async () => {
    // Test page editor integration
  });

  it('should upload image in blog editor', async () => {
    // Test blog editor integration
  });

  it('should handle multiple uploads', async () => {
    // Test multiple uploads
  });

  it('should display uploaded images correctly', async () => {
    // Test image display
  });
});
```

## Performance Considerations

### Frontend Optimization

1. **Lazy Loading**: Load image upload extension only when editor is initialized
2. **Debouncing**: Debounce drag-over events to prevent excessive re-renders
3. **Image Compression**: Consider client-side image compression before upload (future enhancement)
4. **Concurrent Uploads**: Limit concurrent uploads to 3 to prevent overwhelming the server

### Backend Optimization

1. **File Streaming**: Use streaming for large file uploads
2. **Async Processing**: Process uploads asynchronously
3. **CDN Integration**: Consider CDN for serving uploaded images (future enhancement)
4. **Image Optimization**: Implement server-side image optimization (future enhancement)

## Security Considerations

1. **Authentication**: All uploads require JWT authentication
2. **File Validation**: Validate file type and size on both client and server
3. **Filename Sanitization**: Generate unique filenames to prevent path traversal
4. **MIME Type Verification**: Verify MIME type matches file extension
5. **Rate Limiting**: Implement rate limiting on upload endpoint (future enhancement)
6. **Virus Scanning**: Consider virus scanning for uploaded files (future enhancement)

## Accessibility

1. **Keyboard Navigation**: Image upload button is keyboard accessible (Tab, Enter)
2. **Screen Reader Support**: Button has proper aria-label and tooltip
3. **Alt Text**: Prompt users to add alt text for uploaded images
4. **Focus Management**: Maintain focus after image insertion
5. **Error Announcements**: Announce upload errors to screen readers

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

### Frontend
- `@tiptap/core`: ^2.1.0
- `@tiptap/react`: ^2.1.0
- `@tiptap/extension-image`: ^2.1.0
- `@tiptap/pm`: ^2.1.0

### Backend
- `@nestjs/platform-express`: ^10.0.0
- `multer`: ^1.4.5-lts.1

## Deployment Considerations

1. **Environment Variables**: Ensure `API_BASE_URL` is set correctly in production
2. **Upload Directory**: Ensure upload directory has proper permissions
3. **Static File Serving**: Configure NestJS to serve static files from uploads directory
4. **CORS**: Ensure CORS is configured to allow image requests from frontend domain
5. **File Storage**: Consider cloud storage (S3, Cloudinary) for production (future enhancement)

## Future Enhancements

1. **Image Editing**: Add basic image editing (crop, resize, rotate)
2. **Image Gallery**: Add image gallery for selecting previously uploaded images
3. **Cloud Storage**: Integrate with S3 or Cloudinary
4. **Image Optimization**: Automatic image compression and format conversion
5. **Lazy Loading**: Implement lazy loading for images in published content
6. **Responsive Images**: Generate multiple sizes for responsive images
