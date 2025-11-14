'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ResizableImageExtension from 'tiptap-extension-resize-image';
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
  Code2,
  Undo,
  Redo
} from 'lucide-react';
import { ImageUpload } from '@/lib/editor/extensions/ImageUpload';
import { ImageUploadButton } from '@/components/editor/ImageUploadButton';
import { uploadEditorImage } from '@/lib/api/uploads';

interface ContentEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  console.log('[ContentEditor] Rendering:', {
    contentLength: content.length,
    isInitialized,
    contentPreview: content.substring(0, 100)
  });
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ResizableImageExtension.configure({
        inline: true,
        allowBase64: false,
      }),
      ImageUpload.configure({
        uploadFn: uploadEditorImage,
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
          'image/gif',
          'image/svg+xml',
        ],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('[ContentEditor] onUpdate fired:', {
        htmlLength: html.length,
        htmlPreview: html.substring(0, 100)
      });
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6 border rounded-md',
      },
    },
  });

  // Only update editor content on initial load, not on every content prop change
  React.useEffect(() => {
    console.log('[ContentEditor] useEffect triggered:', {
      hasEditor: !!editor,
      isInitialized,
      contentLength: content.length
    });
    
    if (editor && !isInitialized && content) {
      console.log('[ContentEditor] Initializing editor with content');
      editor.commands.setContent(content);
      setIsInitialized(true);
    }
  }, [editor, content, isInitialized]);

  const addLink = () => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>
          Write your page content with the rich text editor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-border" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-muted' : ''}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-muted' : ''}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-border" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-muted' : ''}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-muted' : ''}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-border" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addLink}
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            <ImageUploadButton editor={editor} uploadFn={uploadEditorImage} />

            <div className="w-px h-8 bg-border" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'bg-muted' : ''}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'bg-muted' : ''}
              title="Inline Code"
            >
              <Code2 className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-border" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Editor Content */}
          <EditorContent editor={editor} />
        </div>
      </CardContent>
    </Card>
  );
}
