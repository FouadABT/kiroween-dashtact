# WYSIWYG Editor Image Upload Enhancement - Implementation Plan

## Overview

This implementation plan breaks down the WYSIWYG image upload enhancement into **two focused tasks**. Each task is designed to be completed independently and includes comprehensive unit tests.

## Tasks

- [x] 1. Implement Image Upload in Page Editor with Backend Support







- [x] 1.1 Create backend upload endpoint for editor images

  - Add POST /uploads/editor-image endpoint to UploadsController
  - Implement file validation (type: PNG, JPG, JPEG, WebP, GIF, SVG; size: max 5MB)
  - Add uploadEditorImage method to UploadsService
  - Generate unique filenames with timestamp and random string
  - Save files to uploads/editor-images/ directory
  - Return full URL to uploaded image
  - Apply JWT authentication guard
  - Handle errors with appropriate HTTP status codes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 1.2 Create ImageUpload TipTap extension

  - Create frontend/src/lib/editor/extensions/ImageUpload.ts
  - Implement drag and drop handler for images
  - Implement paste handler for images
  - Add file validation (type and size)
  - Insert loading placeholder during upload
  - Replace placeholder with image on success
  - Remove placeholder on error
  - Support multiple file drops
  - Display toast notifications for errors
  - _Requirements: 1.1, 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_


- [x] 1.3 Create ImageUploadButton component

  - Create frontend/src/components/editor/ImageUploadButton.tsx
  - Add image icon button to trigger file selection
  - Implement file input with accept="image/*"
  - Add file validation before upload
  - Show loading spinner during upload
  - Call uploadEditorImage API function
  - Insert image into editor on success
  - Display error toast on failure
  - Disable button during upload
  - Add tooltip "Insert Image"
  - Ensure keyboard accessibility (Tab, Enter)
  - _Requirements: 1.1, 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 1.4 Create image upload API service


  - Add uploadEditorImage function to frontend/src/lib/api/uploads.ts
  - Create FormData with file
  - Send POST request to /uploads/editor-image
  - Include JWT token in Authorization header
  - Return image URL from response
  - Throw descriptive errors on failure
  - Add validateImageFile helper function
  - Validate file type (PNG, JPG, JPEG, WebP, GIF, SVG)
  - Validate file size (max 5MB)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 1.5 Enhance ContentEditor component for pages

  - Update frontend/src/components/pages/ContentEditor.tsx
  - Add Image extension to TipTap editor configuration
  - Add ImageUpload extension to TipTap editor configuration
  - Add ImageUploadButton to editor toolbar
  - Position button after text formatting options
  - Configure image node with inline: true
  - Add CSS class 'editor-image' to images
  - Ensure drag and drop works in editor area
  - Test image insertion at cursor position
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 1.6 Write unit tests for backend upload endpoint
  - Create backend/src/uploads/__tests__/uploads.controller.spec.ts tests
  - Test successful image upload returns URL
  - Test invalid file type returns 400 error
  - Test file size exceeded returns 400 error
  - Test missing file returns 400 error
  - Test authentication required (401 without token)
  - Test response includes url, filename, size, mimetype
  - Mock UploadsService.uploadEditorImage
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 1.7 Write unit tests for backend upload service
  - Create backend/src/uploads/__tests__/uploads.service.spec.ts tests
  - Test uploadEditorImage saves file to disk
  - Test unique filename generation (timestamp + random)
  - Test correct URL generation with base URL
  - Test upload directory creation if not exists
  - Test file extension preservation
  - Mock fs.promises.writeFile
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 1.8 Write unit tests for ImageUploadButton component
  - Create frontend/src/components/editor/__tests__/ImageUploadButton.test.tsx
  - Test button renders with image icon
  - Test clicking button opens file dialog
  - Test file selection triggers upload
  - Test invalid file type shows error toast
  - Test file size exceeded shows error toast
  - Test successful upload inserts image in editor
  - Test upload failure shows error toast
  - Test button disabled during upload
  - Test loading spinner shown during upload
  - Test tooltip displays "Insert Image"
  - Mock uploadEditorImage function
  - Mock TipTap editor
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 1.9 Write unit tests for ImageUpload extension
  - Create frontend/src/lib/editor/extensions/__tests__/ImageUpload.test.ts
  - Test drag and drop handler accepts image files
  - Test drag and drop rejects non-image files
  - Test paste handler accepts image files
  - Test paste handler rejects non-image files
  - Test placeholder insertion during upload
  - Test placeholder replacement on success
  - Test placeholder removal on error
  - Test file size validation
  - Test multiple file drops
  - Mock uploadFn option
  - Mock TipTap view and state
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 1.10 Write unit tests for upload API service
  - Create frontend/src/lib/api/__tests__/uploads.test.ts
  - Test uploadEditorImage sends POST request
  - Test FormData includes file
  - Test Authorization header includes JWT token
  - Test successful response returns URL
  - Test 400 error throws with message
  - Test 401 error throws authentication error
  - Test 500 error throws server error
  - Test validateImageFile accepts valid types
  - Test validateImageFile rejects invalid types
  - Test validateImageFile rejects oversized files
  - Mock fetch API
  - Mock getAccessToken function
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Implement Image Upload in Blog Editor





- [x] 2.1 Enhance ContentEditor component for blog posts


  - Update frontend/src/components/blog/BlogEditor.tsx (or equivalent)
  - Add Image extension to TipTap editor configuration
  - Add ImageUpload extension to TipTap editor configuration
  - Add ImageUploadButton to editor toolbar
  - Position button after text formatting options
  - Configure image node with inline: true
  - Add CSS class 'editor-image' to images
  - Ensure drag and drop works in editor area
  - Test image insertion at cursor position
  - Reuse ImageUploadButton component from Task 1
  - Reuse ImageUpload extension from Task 1
  - Reuse uploadEditorImage API function from Task 1
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 2.2 Write unit tests for blog editor image upload
  - Create frontend/src/components/blog/__tests__/BlogEditor.test.tsx (or enhance existing)
  - Test image upload button renders in blog editor
  - Test clicking button opens file dialog
  - Test file selection triggers upload
  - Test successful upload inserts image in editor
  - Test upload failure shows error toast
  - Test drag and drop works in blog editor
  - Test paste works in blog editor
  - Test image displays correctly in blog content
  - Mock uploadEditorImage function
  - Mock TipTap editor
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 2.3 Write integration tests for editor image upload
  - Create frontend/src/__tests__/integration/editor-image-upload.test.tsx
  - Test complete upload flow in page editor
  - Test complete upload flow in blog editor
  - Test multiple image uploads in sequence
  - Test uploaded images display correctly
  - Test uploaded images persist after save
  - Test drag and drop multiple images
  - Test paste image from clipboard
  - Test error handling for failed uploads
  - Test authentication required for uploads
  - Mock API responses
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

## Task Completion Criteria

### Task 1 Completion
- ✅ Backend endpoint /uploads/editor-image created and working
- ✅ ImageUpload TipTap extension created with drag/drop support
- ✅ ImageUploadButton component created and functional
- ✅ Upload API service created with validation
- ✅ ContentEditor enhanced for pages with image upload
- ✅ All backend unit tests passing (controller + service)
- ✅ All frontend unit tests passing (button + extension + API)
- ✅ Image upload works in page editor
- ✅ Drag and drop works in page editor
- ✅ File validation works correctly
- ✅ Error handling works correctly

### Task 2 Completion
- ✅ ContentEditor enhanced for blog posts with image upload
- ✅ All blog editor unit tests passing
- ✅ Integration tests passing
- ✅ Image upload works in blog editor
- ✅ Drag and drop works in blog editor
- ✅ Components reused from Task 1
- ✅ No code duplication

## Testing Requirements

### Unit Test Coverage
- Target: 80%+ code coverage for all new code
- All components must have unit tests
- All API functions must have unit tests
- All backend endpoints must have unit tests
- All backend services must have unit tests

### Test Scenarios to Cover
- ✅ Successful image upload
- ✅ Invalid file type rejection
- ✅ File size exceeded rejection
- ✅ Upload failure handling
- ✅ Authentication required
- ✅ Drag and drop functionality
- ✅ Paste functionality
- ✅ Multiple file uploads
- ✅ Loading states
- ✅ Error messages

## Notes

- **Reusability**: Task 2 reuses all components created in Task 1 (ImageUploadButton, ImageUpload extension, upload API service)
- **Testing**: Each task includes comprehensive unit tests to ensure reliability
- **Incremental**: Task 1 must be completed before Task 2
- **Focus**: Each task is focused on a single editor (pages or blog)
- **Validation**: File validation happens on both client and server
- **Security**: All uploads require JWT authentication
- **Accessibility**: All components are keyboard accessible
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Estimated Timeline

- **Task 1**: 4-6 hours (including tests)
- **Task 2**: 2-3 hours (reusing Task 1 components)
- **Total**: 6-9 hours

## Dependencies

- TipTap editor already installed and configured
- Uploads module already exists in backend
- JWT authentication already implemented
- Toast notification system already available
