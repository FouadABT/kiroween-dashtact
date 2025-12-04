# WYSIWYG Editor Implementation Guide

## Recommended: Tiptap Editor

**Tiptap** is the best modern WYSIWYG editor for Next.js projects.

### Why Tiptap?
- ✅ Modern, actively maintained (2024)
- ✅ Built specifically for React/Next.js
- ✅ Headless architecture (fully customizable)
- ✅ Markdown support built-in
- ✅ Image upload support
- ✅ Free and MIT licensed
- ✅ Excellent documentation
- ✅ TypeScript support
- ✅ Used by: GitLab, Substack, Axios

## Installation Steps

### 1. Install Tiptap Packages

```bash
cd frontend
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```

### 2. Create Tiptap Editor Component

Create `frontend/src/components/pages/TiptapEditor.tsx`:

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Code,
  Image as ImageIcon,
  Upload,
  Undo,
  Redo
} from 'lucide-react';
import { useRef, useState } from 'react';
import { PagesApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/image-proxy';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your content here...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PNG, JPG, WebP, or SVG image',
        variant: 'destructive',
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await PagesApi.uploadFeaturedImage(file);
      const imageUrl = getImageUrl(response.url);
      
      editor.chain().focus().setImage({ src: imageUrl }).run();
      
      toast({
        title: 'Image uploaded',
        description: 'Image has been inserted into your content',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Upload className="h-4 w-4 animate-pulse" /> : <ImageIcon className="h-4 w-4" />}
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-muted' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
```

### 3. Update ContentEditor to Use Tiptap

Replace `frontend/src/components/pages/ContentEditor.tsx`:

```typescript
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TiptapEditor } from './TiptapEditor';

interface ContentEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>
          Write your page content with the rich text editor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TiptapEditor content={content} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
```

### 4. Add Tiptap Styles

Add to `frontend/src/app/globals.css`:

```css
/* Tiptap Editor Styles */
.ProseMirror {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}
```

## Features

### What You Get

1. **Real-time WYSIWYG Editing**
   - See formatted content as you type
   - No markdown syntax visible
   - Professional editing experience

2. **Rich Formatting**
   - Headings (H1, H2, H3)
   - Bold, Italic
   - Bullet lists, Numbered lists
   - Links
   - Images
   - Blockquotes
   - Inline code
   - Undo/Redo

3. **Image Upload**
   - Click image button
   - Select file
   - Auto-uploads to backend
   - Inserts image inline
   - Shows in real-time

4. **Active State Indicators**
   - Buttons highlight when active
   - Shows current formatting
   - Visual feedback

## Testing

1. Install packages
2. Create TiptapEditor component
3. Update ContentEditor
4. Add CSS styles
5. Test at `/dashboard/pages/new`

## Benefits

- ✅ **Better UX**: See what you're creating in real-time
- ✅ **No Markdown**: Users don't need to know markdown
- ✅ **Image Preview**: Images show immediately after upload
- ✅ **Professional**: Looks like Medium, Notion, etc.
- ✅ **Accessible**: Keyboard shortcuts, screen reader support
- ✅ **Mobile Friendly**: Works on touch devices

## Alternative Options

If you prefer something else:

1. **Novel** - AI-powered editor (by Vercel)
2. **Lexical** - By Meta/Facebook
3. **Slate** - Highly customizable
4. **Quill** - Classic, stable

But **Tiptap is the best choice** for modern Next.js projects.

## Next Steps

1. Run the installation command
2. Create the TiptapEditor component
3. Update ContentEditor
4. Add CSS
5. Test and enjoy!

The editor will look and feel like professional CMS editors (WordPress, Medium, Notion).
