'use client';

/**
 * EmailTemplateEditor Component
 * 
 * Editor for creating and updating email templates with:
 * - Name, slug, subject, category fields
 * - HTML body editor (textarea for now, can be upgraded to rich text)
 * - Plain text body editor
 * - Variable management interface
 * - Syntax help text
 * - Preview functionality
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, X, Plus, Trash2, Eye, Info } from 'lucide-react';
import { emailTemplateApi } from '@/lib/api/email';
import type { EmailTemplate, CreateEmailTemplateDto, UpdateEmailTemplateDto } from '@/types/email';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmailTemplateEditorProps {
  template?: EmailTemplate | null;
  onSave: () => void;
  onCancel: () => void;
}

export function EmailTemplateEditor({ template, onSave, onCancel }: EmailTemplateEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('SYSTEM');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Load template data if editing
  useEffect(() => {
    if (template) {
      setName(template.name);
      setSlug(template.slug);
      setSubject(template.subject);
      setCategory(template.category);
      setHtmlBody(template.htmlBody);
      setTextBody(template.textBody || '');
      setVariables(template.variables || []);
      setIsActive(template.isActive);
    }
  }, [template]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!template) {
      // Only auto-generate slug for new templates
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  };

  // Add variable
  const handleAddVariable = () => {
    if (newVariable && !variables.includes(newVariable)) {
      setVariables([...variables, newVariable]);
      setNewVariable('');
    }
  };

  // Remove variable
  const handleRemoveVariable = (variable: string) => {
    setVariables(variables.filter((v) => v !== variable));
  };

  // Extract variables from content
  const extractVariables = () => {
    const regex = /\{\{(\w+)\}\}/g;
    const found = new Set<string>();
    
    let match;
    while ((match = regex.exec(htmlBody)) !== null) {
      found.add(match[1]);
    }
    while ((match = regex.exec(textBody)) !== null) {
      found.add(match[1]);
    }
    while ((match = regex.exec(subject)) !== null) {
      found.add(match[1]);
    }

    const extracted = Array.from(found);
    const newVars = extracted.filter((v) => !variables.includes(v));
    
    if (newVars.length > 0) {
      setVariables([...variables, ...newVars]);
      toast.success(`Found ${newVars.length} new variable(s): ${newVars.join(', ')}`);
    } else {
      toast.info('All variables in the template are already listed');
    }
  };

  // Handle save
  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!slug.trim()) {
      toast.error('Template slug is required');
      return;
    }

    if (!subject.trim()) {
      toast.error('Subject is required');
      return;
    }

    if (!htmlBody.trim()) {
      toast.error('HTML body is required');
      return;
    }

    try {
      setIsSaving(true);

      if (template) {
        // Update existing template
        const updateDto: UpdateEmailTemplateDto = {
          name,
          subject,
          htmlBody,
          textBody: textBody || undefined,
          variables,
          isActive,
        };
        await emailTemplateApi.updateTemplate(template.id, updateDto);
        toast.success('Template updated successfully');
      } else {
        // Create new template
        const createDto: CreateEmailTemplateDto = {
          name,
          slug,
          subject,
          category,
          htmlBody,
          textBody: textBody || undefined,
          variables,
        };
        await emailTemplateApi.createTemplate(createDto);
        toast.success('Template created successfully');
      }

      onSave();
    } catch (error: any) {
      console.error('Failed to save template:', error);
      toast.error(error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  // Render preview
  const renderPreview = () => {
    let preview = htmlBody;
    variables.forEach((variable) => {
      const placeholder = `[${variable}]`;
      preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), placeholder);
    });
    return preview;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{template ? 'Edit Template' : 'Create Template'}</CardTitle>
              <CardDescription>
                {template
                  ? 'Update email template settings and content'
                  : 'Create a new reusable email template'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Welcome Email"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="welcome-email"
                    disabled={isSaving || !!template}
                  />
                  {template && (
                    <p className="text-xs text-muted-foreground">
                      Slug cannot be changed after creation
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Welcome to {{appName}}!"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{{'} and {'}'} for variables, e.g., {'{{userName}}'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={isSaving || !!template}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM">System</SelectItem>
                      <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="NOTIFICATION">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                  {template && (
                    <p className="text-xs text-muted-foreground">
                      Category cannot be changed after creation
                    </p>
                  )}
                </div>

                {template && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      disabled={isSaving}
                    />
                    <Label htmlFor="isActive">Template is active</Label>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Use {'{{variableName}}'} syntax for dynamic content. Variables will be replaced
                  when the email is sent.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="htmlBody">HTML Body *</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                    disabled={!htmlBody}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
                <Textarea
                  id="htmlBody"
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  placeholder="<h1>Hello {{userName}}!</h1><p>Welcome to our platform.</p>"
                  className="min-h-[300px] font-mono text-sm"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textBody">Plain Text Body (Optional)</Label>
                <Textarea
                  id="textBody"
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  placeholder="Hello {{userName}}! Welcome to our platform."
                  className="min-h-[150px] font-mono text-sm"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Fallback for email clients that don&apos;t support HTML
                </p>
              </div>
            </TabsContent>

            {/* Variables Tab */}
            <TabsContent value="variables" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Define variables that can be used in your template. Use the format {'{{variableName}}'} in
                  your content.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Input
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="variableName"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVariable();
                    }
                  }}
                  disabled={isSaving}
                />
                <Button onClick={handleAddVariable} disabled={!newVariable || isSaving}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
                <Button variant="outline" onClick={extractVariables} disabled={isSaving}>
                  Auto-Detect
                </Button>
              </div>

              {variables.length > 0 ? (
                <div className="space-y-2">
                  <Label>Template Variables</Label>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                        {'{{' + variable + '}}'}
                        <button
                          onClick={() => handleRemoveVariable(variable)}
                          className="ml-1 hover:text-destructive"
                          disabled={isSaving}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No variables defined. Add variables manually or use Auto-Detect to find them in your
                  content.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Variables are shown as [variableName] placeholders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <p className="mt-1 text-sm">{subject.replace(/\{\{(\w+)\}\}/g, '[$1]')}</p>
            </div>
            <div>
              <Label>HTML Content</Label>
              <div
                className="mt-2 rounded-md border bg-background p-4"
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />
            </div>
            {textBody && (
              <div>
                <Label>Plain Text Content</Label>
                <pre className="mt-2 whitespace-pre-wrap rounded-md border bg-muted p-4 text-sm">
                  {textBody.replace(/\{\{(\w+)\}\}/g, '[$1]')}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
