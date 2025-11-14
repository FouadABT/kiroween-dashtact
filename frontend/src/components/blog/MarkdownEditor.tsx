'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Eye,
  Edit,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

/**
 * MarkdownEditor Component
 * 
 * A markdown editor with formatting toolbar and preview mode.
 * 
 * Features:
 * - Formatting toolbar (bold, italic, headings, lists, etc.)
 * - Write and Preview tabs
 * - Image embedding support
 * - Code blocks
 * - Blockquotes
 * - Mobile-friendly interface
 * 
 * @param value - Current markdown content
 * @param onChange - Callback when content changes
 * @param label - Label for the editor
 * @param placeholder - Placeholder text
 * @param rows - Number of rows for textarea
 * @param required - Whether the field is required
 */
export function MarkdownEditor({
  value,
  onChange,
  label = 'Content',
  placeholder = 'Write your content here...',
  rows = 15,
  required = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  /**
   * Insert markdown syntax at cursor position
   */
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.getElementById('markdown-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end);

    onChange(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  /**
   * Toolbar button handlers
   */
  const handleBold = () => insertMarkdown('**', '**', 'bold text');
  const handleItalic = () => insertMarkdown('*', '*', 'italic text');
  const handleHeading1 = () => insertMarkdown('# ', '', 'Heading 1');
  const handleHeading2 = () => insertMarkdown('## ', '', 'Heading 2');
  const handleHeading3 = () => insertMarkdown('### ', '', 'Heading 3');
  const handleUnorderedList = () => insertMarkdown('- ', '', 'List item');
  const handleOrderedList = () => insertMarkdown('1. ', '', 'List item');
  const handleLink = () => insertMarkdown('[', '](https://example.com)', 'link text');
  const handleImage = () => insertMarkdown('![', '](https://example.com/image.jpg)', 'alt text');
  const handleCode = () => insertMarkdown('`', '`', 'code');
  const handleQuote = () => insertMarkdown('> ', '', 'quote');

  /**
   * Render markdown preview (basic implementation)
   * In production, use a proper markdown parser like react-markdown
   */
  const renderPreview = () => {
    if (!value) {
      return <p className="text-muted-foreground">Nothing to preview yet...</p>;
    }

    // Basic markdown rendering (replace with proper parser in production)
    let html = value;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg" loading="lazy" />');
    
    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>');
    
    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>');
    
    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-6 list-disc">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6 list-decimal">$1</li>');
    
    // Paragraphs
    html = html.split('\n\n').map(p => {
      if (!p.trim().startsWith('<')) {
        return `<p class="my-4">${p}</p>`;
      }
      return p;
    }).join('\n');

    return (
      <div 
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="markdown-content">{label} {required && '*'}</Label>}
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'write' | 'preview')}>
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="space-y-2">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBold}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleItalic}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleHeading1}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleHeading2}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleHeading3}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUnorderedList}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleOrderedList}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLink}
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImage}
              title="Insert Image"
            >
              <Image className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCode}
              title="Inline Code"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleQuote}
              title="Blockquote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          {/* Markdown Textarea */}
          <textarea
            id="markdown-content"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            required={required}
          />

          <p className="text-sm text-muted-foreground">
            Supports Markdown formatting. Use the toolbar buttons or type markdown syntax directly.
          </p>
        </TabsContent>

        <TabsContent value="preview">
          <div className="border rounded-lg p-6 min-h-[400px] bg-background">
            {renderPreview()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
