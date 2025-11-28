'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Code, Eye, Palette, Layout, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ContentSectionData } from '@/types/landing-page';

interface ContentSectionEditorProps {
  data: ContentSectionData;
  onSave: (data: ContentSectionData) => void;
  onClose: () => void;
}

export function ContentSectionEditor({ data, onSave, onClose }: ContentSectionEditorProps) {
  const [formData, setFormData] = useState<ContentSectionData>(data);
  const [activeTab, setActiveTab] = useState<'visual' | 'html' | 'css'>('visual');
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  // Rich text formatting helpers
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertHTML = (html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const node = range.createContextualFragment(html);
      range.insertNode(node);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Section Title (Optional)</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter section title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={formData.layout}
              onValueChange={(value: 'single' | 'two-column') =>
                setFormData({ ...formData, layout: value })
              }
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Column</SelectItem>
                <SelectItem value="two-column">Two Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentWidth">Content Width</Label>
            <Select
              value={formData.contentWidth || 'standard'}
              onValueChange={(value: 'full' | 'wide' | 'standard' | 'narrow') =>
                setFormData({ ...formData, contentWidth: value })
              }
            >
              <SelectTrigger id="contentWidth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="narrow">Narrow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.layout === 'two-column' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagePosition">Image Position</Label>
              <Select
                value={formData.imagePosition || 'left'}
                onValueChange={(value: 'left' | 'right' | 'top' | 'bottom') =>
                  setFormData({ ...formData, imagePosition: value })
                }
              >
                <SelectTrigger id="imagePosition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Content Editor Tabs */}
      <Card className="p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="visual" className="gap-2">
                <Eye className="h-4 w-4" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="html" className="gap-2">
                <Code className="h-4 w-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="css" className="gap-2">
                <Palette className="h-4 w-4" />
                Custom CSS
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Switch
                checked={showPreview}
                onCheckedChange={setShowPreview}
                id="preview-toggle"
              />
              <Label htmlFor="preview-toggle" className="text-sm cursor-pointer">
                Live Preview
              </Label>
            </div>
          </div>

          {/* Visual Editor Tab */}
          <TabsContent value="visual" className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Use the HTML tab for full control, or use this visual editor for basic formatting.
              </AlertDescription>
            </Alert>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-lg">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                title="Bold"
              >
                <strong>B</strong>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                title="Italic"
              >
                <em>I</em>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                title="Underline"
              >
                <u>U</u>
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('formatBlock', '<h2>')}
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('formatBlock', '<h3>')}
                title="Heading 3"
              >
                H3
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('formatBlock', '<p>')}
                title="Paragraph"
              >
                P
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertUnorderedList')}
                title="Bullet List"
              >
                • List
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertOrderedList')}
                title="Numbered List"
              >
                1. List
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = prompt('Enter URL:');
                  if (url) formatText('createLink', url);
                }}
                title="Insert Link"
              >
                Link
              </Button>
            </div>

            {/* Editable Content Area */}
            <div
              contentEditable
              className="min-h-[300px] p-4 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              dangerouslySetInnerHTML={{ __html: formData.content }}
              onBlur={(e) => {
                setFormData({ ...formData, content: e.currentTarget.innerHTML });
              }}
              suppressContentEditableWarning
            />

            <p className="text-xs text-muted-foreground">
              Tip: Switch to HTML tab for advanced editing with full HTML control
            </p>
          </TabsContent>

          {/* HTML Source Tab */}
          <TabsContent value="html" className="space-y-3">
            <Alert>
              <Code className="h-4 w-4" />
              <AlertDescription>
                Edit HTML directly. Content will be sanitized on save to prevent security issues.
              </AlertDescription>
            </Alert>

            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="<h2>Your HTML content here</h2><p>Add any HTML elements...</p>"
              className="font-mono text-sm min-h-[400px]"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Insert:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, content: formData.content + '\n<h2>Heading</h2>' })}
                >
                  Heading
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, content: formData.content + '\n<p>Paragraph text</p>' })}
                >
                  Paragraph
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, content: formData.content + '\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>' })}
                >
                  List
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, content: formData.content + '\n<a href="#">Link</a>' })}
                >
                  Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, content: formData.content + '\n<img src="https://via.placeholder.com/600x400" alt="Image" />' })}
                >
                  Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, content: formData.content + '\n<div class="grid grid-cols-2 gap-4">\n  <div>Column 1</div>\n  <div>Column 2</div>\n</div>' })}
                >
                  2 Columns
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Custom CSS Tab */}
          <TabsContent value="css" className="space-y-3">
            <Alert>
              <Palette className="h-4 w-4" />
              <AlertDescription>
                Add custom CSS for this section. CSS will be scoped to prevent conflicts.
              </AlertDescription>
            </Alert>

            <Textarea
              value={formData.customCSS || ''}
              onChange={(e) => setFormData({ ...formData, customCSS: e.target.value })}
              placeholder=".my-heading {
  color: #3b82f6;
  font-size: 2rem;
  font-weight: bold;
}

.my-button {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
}"
              className="font-mono text-sm min-h-[400px]"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Tips:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use Tailwind classes in your HTML for quick styling</li>
                <li>Custom CSS is scoped to this section only</li>
                <li>Avoid !important - use specific selectors instead</li>
                <li>Test responsiveness with different screen sizes</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Live Preview */}
      {showPreview && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="h-4 w-4" />
            <h3 className="font-semibold">Live Preview</h3>
          </div>
          <div className="border border-border rounded-lg p-6 bg-background">
            {formData.title && (
              <h2 className="text-2xl font-bold mb-4">{formData.title}</h2>
            )}
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
            {formData.customCSS && (
              <style dangerouslySetInnerHTML={{ __html: formData.customCSS }} />
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
