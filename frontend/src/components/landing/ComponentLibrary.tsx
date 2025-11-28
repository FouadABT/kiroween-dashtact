'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Plus,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SectionTemplate } from '@/types/landing-cms';
import { LandingApi } from '@/lib/api';

interface ComponentLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: SectionTemplate) => void;
  currentSection?: any;
}

const CATEGORIES = [
  'All',
  'Hero',
  'Features',
  'Testimonials',
  'CTA',
  'Stats',
  'Content',
  'Pricing',
  'FAQ',
  'Team',
  'Gallery',
];

export function ComponentLibrary({
  open,
  onOpenChange,
  onSelectTemplate,
  currentSection,
}: ComponentLibraryProps) {
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SectionTemplate | null>(null);
  const [saveFormData, setSaveFormData] = useState({
    name: '',
    description: '',
    category: 'Hero',
    isPublic: false,
  });
  const [importData, setImportData] = useState('');

  // Load templates
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const category = selectedCategory === 'All' ? undefined : selectedCategory;
      const data = await LandingApi.getTemplates(category);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [templates, searchQuery]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, SectionTemplate[]> = {};
    filteredTemplates.forEach((template) => {
      if (!groups[template.category]) {
        groups[template.category] = [];
      }
      groups[template.category].push(template);
    });
    return groups;
  }, [filteredTemplates]);

  const handleUseTemplate = (template: SectionTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
    toast.success(`Template "${template.name}" added`);
  };

  const handleSaveAsTemplate = async () => {
    if (!currentSection) {
      toast.error('No section to save');
      return;
    }

    if (!saveFormData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      await LandingApi.createTemplate({
        name: saveFormData.name,
        description: saveFormData.description,
        category: saveFormData.category,
        section: currentSection,
        isPublic: saveFormData.isPublic,
      });

      toast.success('Template saved successfully');
      setShowSaveDialog(false);
      setSaveFormData({
        name: '',
        description: '',
        category: 'Hero',
        isPublic: false,
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleEditTemplate = async (template: SectionTemplate) => {
    setSaveFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      isPublic: template.isPublic,
    });
    setSelectedTemplate(template);
    setShowSaveDialog(true);
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await LandingApi.updateTemplate(selectedTemplate.id, {
        name: saveFormData.name,
        description: saveFormData.description,
        category: saveFormData.category,
        isPublic: saveFormData.isPublic,
      });

      toast.success('Template updated successfully');
      setShowSaveDialog(false);
      setSelectedTemplate(null);
      setSaveFormData({
        name: '',
        description: '',
        category: 'Hero',
        isPublic: false,
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await LandingApi.deleteTemplate(selectedTemplate.id);
      toast.success('Template deleted successfully');
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleExportTemplate = async (template: SectionTemplate) => {
    try {
      const data = await LandingApi.exportTemplate(template.id);
      const blob = new Blob([data.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Template exported successfully');
    } catch (error) {
      console.error('Failed to export template:', error);
      toast.error('Failed to export template');
    }
  };

  const handleImportTemplate = async () => {
    if (!importData.trim()) {
      toast.error('Please paste template data');
      return;
    }

    try {
      await LandingApi.importTemplate(importData);
      toast.success('Template imported successfully');
      setShowImportDialog(false);
      setImportData('');
      loadTemplates();
    } catch (error) {
      console.error('Failed to import template:', error);
      toast.error('Failed to import template');
    }
  };

  const handleDuplicateTemplate = async (template: SectionTemplate) => {
    try {
      await LandingApi.createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        section: template.section,
        isPublic: false,
      });
      toast.success('Template duplicated successfully');
      loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[80vh] p-0">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r border-border bg-muted/30 p-4">
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Templates
                </DialogTitle>
                <DialogDescription>
                  Choose from pre-built templates or create your own
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Categories */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                    CATEGORIES
                  </Label>
                  <ScrollArea className="h-[calc(80vh-280px)]">
                    <div className="space-y-1">
                      {CATEGORIES.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'secondary' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                          {category !== 'All' && (
                            <Badge variant="outline" className="ml-auto">
                              {templates.filter((t) => t.category === category).length}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-border">
                  {currentSection && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowSaveDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowImportDialog(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Template
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <ScrollArea className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Loading templates...</p>
                    </div>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your search or category filter
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-4">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryTemplates.map((template) => (
                            <Card
                              key={template.id}
                              className="group relative overflow-hidden transition-all hover:shadow-lg"
                              onMouseEnter={() => setHoveredTemplate(template.id)}
                              onMouseLeave={() => setHoveredTemplate(null)}
                            >
                              {/* Thumbnail */}
                              <div className="aspect-video bg-muted relative overflow-hidden">
                                {template.thumbnail ? (
                                  <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}

                                {/* Hover Overlay */}
                                {hoveredTemplate === template.id && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity">
                                    <Button
                                      size="sm"
                                      onClick={() => handleUseTemplate(template)}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Use Template
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleExportTemplate(template)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base truncate">
                                      {template.name}
                                    </CardTitle>
                                    {template.description && (
                                      <CardDescription className="text-xs line-clamp-2 mt-1">
                                        {template.description}
                                      </CardDescription>
                                    )}
                                  </div>

                                  {template.isCustom && (
                                    <DropdownMenu modal={false}>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => handleEditTemplate(template)}
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDuplicateTemplate(template)}
                                        >
                                          <Copy className="h-4 w-4 mr-2" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleExportTemplate(template)}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Export
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => {
                                            setSelectedTemplate(template);
                                            setShowDeleteDialog(true);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </CardHeader>

                              <CardFooter className="pt-0 flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {template.category}
                                </Badge>
                                {template.isCustom && (
                                  <Badge variant="outline" className="text-xs">
                                    Custom
                                  </Badge>
                                )}
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save/Edit Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Save as Template'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? 'Update your custom template'
                : 'Save this section as a reusable template'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                placeholder="My Awesome Template"
                value={saveFormData.name}
                onChange={(e) =>
                  setSaveFormData({ ...saveFormData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Describe your template..."
                value={saveFormData.description}
                onChange={(e) =>
                  setSaveFormData({ ...saveFormData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="template-category">Category</Label>
              <select
                id="template-category"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={saveFormData.category}
                onChange={(e) =>
                  setSaveFormData({ ...saveFormData, category: e.target.value })
                }
              >
                {CATEGORIES.filter((c) => c !== 'All').map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="template-public"
                checked={saveFormData.isPublic}
                onCheckedChange={(checked) =>
                  setSaveFormData({ ...saveFormData, isPublic: checked as boolean })
                }
              />
              <Label htmlFor="template-public" className="text-sm font-normal">
                Make this template public (visible to all users)
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setSelectedTemplate(null);
                setSaveFormData({
                  name: '',
                  description: '',
                  category: 'Hero',
                  isPublic: false,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={selectedTemplate ? handleUpdateTemplate : handleSaveAsTemplate}
            >
              {selectedTemplate ? 'Update' : 'Save'} Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Template Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Template</DialogTitle>
            <DialogDescription>
              Paste the JSON data of the template you want to import
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="import-data">Template JSON</Label>
              <Textarea
                id="import-data"
                placeholder='{"name": "My Template", "category": "Hero", ...}'
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setImportData('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImportTemplate}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedTemplate(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
