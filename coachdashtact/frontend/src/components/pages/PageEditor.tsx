'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageBasicInfo } from './PageBasicInfo';
import { ContentEditor } from './ContentEditor';
import { PageMetadata } from './PageMetadata';
import { PageSettings } from './PageSettings';
import { FeaturedImageUpload } from './FeaturedImageUpload';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { CustomPage, PageStatus, PageVisibility } from '@/types/pages';
import { Loader2, Save, Eye, FileText } from 'lucide-react';
import { useMetadata } from '@/contexts/MetadataContext';

interface PageEditorProps {
  mode: 'create' | 'edit';
  pageId?: string;
}

export function PageEditor({ mode, pageId }: PageEditorProps) {
  const router = useRouter();
  const { setDynamicValues } = useMetadata();
  const [isLoading, setIsLoading] = useState<boolean>(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState<PageStatus>(PageStatus.DRAFT);
  const [visibility, setVisibility] = useState<PageVisibility>(PageVisibility.PUBLIC);
  const [parentPageId, setParentPageId] = useState<string | undefined>();
  const [showInNavigation, setShowInNavigation] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [customCssClass, setCustomCssClass] = useState('');
  const [templateKey, setTemplateKey] = useState('default');

  // Load existing page data
  useEffect(() => {
    if (mode === 'edit' && pageId) {
      loadPage();
    }
  }, [mode, pageId]);

  const loadPage = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/admin/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load page');
      }

      const page: CustomPage = await response.json();
      
      setTitle(page.title);
      setSlug(page.slug);
      setContent(page.content);
      setExcerpt(page.excerpt || '');
      setFeaturedImage(page.featuredImage || '');
      setStatus(page.status);
      setVisibility(page.visibility);
      setParentPageId(page.parentPageId || undefined);
      setShowInNavigation(page.showInNavigation);
      setDisplayOrder(page.displayOrder);
      setMetaTitle(page.metaTitle || '');
      setMetaDescription(page.metaDescription || '');
      setMetaKeywords(page.metaKeywords || '');
      setCustomCssClass(page.customCssClass || '');
      setTemplateKey(page.templateKey || 'default');
      
      // Update breadcrumb with page title
      console.log('[PageEditor] Page loaded:', {
        id: page.id,
        title: page.title,
        slug: page.slug
      });
      console.log('[PageEditor] Setting dynamic values:', { pageTitle: page.title });
      setDynamicValues({ pageTitle: page.title });
    } catch (error) {
      console.error('[PageEditor] Error loading page:', error);
      toast.error('Failed to load page');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && mode === 'edit') {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for 30 seconds
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, title, slug, content, excerpt, featuredImage, status, visibility, parentPageId, showInNavigation, displayOrder, metaTitle, metaDescription, metaKeywords, customCssClass, templateKey]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async (isAutoSave = false) => {
    console.log('[PageEditor] handleSave called:', {
      isAutoSave,
      mode,
      pageId,
      contentLength: content.length,
      contentPreview: content.substring(0, 100)
    });

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsSaving(true);

    try {
      const pageData = {
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        status,
        visibility,
        parentPageId: parentPageId || undefined,
        showInNavigation,
        displayOrder,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords: metaKeywords || undefined,
        customCssClass: customCssClass || undefined,
        templateKey,
      };

      console.log('[PageEditor] Saving page data:', {
        url: mode === 'create' ? '/pages' : `/pages/${pageId}`,
        method: mode === 'create' ? 'POST' : 'PATCH',
        contentLength: pageData.content.length,
        title: pageData.title
      });

      const url = mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/pages`
        : `${process.env.NEXT_PUBLIC_API_URL}/pages/${pageId}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(pageData),
      });

      console.log('[PageEditor] Save response:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[PageEditor] Save failed:', error);
        throw new Error(error.message || 'Failed to save page');
      }

      const savedPage: CustomPage = await response.json();
      console.log('[PageEditor] Page saved successfully:', {
        id: savedPage.id,
        title: savedPage.title,
        contentLength: savedPage.content.length
      });

      setHasUnsavedChanges(false);

      if (!isAutoSave) {
        toast.success(mode === 'create' ? 'Page created successfully' : 'Page updated successfully');

        if (mode === 'create') {
          router.push(`/dashboard/pages/${savedPage.id}/edit`);
        }
      }
    } catch (error) {
      console.error('[PageEditor] Error saving page:', error);
      if (!isAutoSave) {
        toast.error(error instanceof Error ? error.message : 'Failed to save page');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    console.log('[PageEditor] handlePublish called:', {
      mode,
      pageId,
      hasUnsavedChanges,
      contentLength: content.length
    });

    // Always save content first before publishing
    if (hasUnsavedChanges || mode === 'create') {
      console.log('[PageEditor] Saving content before publishing...');
      await handleSave(false);
    }

    if (mode === 'create' || !pageId) {
      console.log('[PageEditor] Cannot publish in create mode without pageId');
      return;
    }

    setIsSaving(true);

    try {
      console.log('[PageEditor] Publishing page:', pageId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/${pageId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      console.log('[PageEditor] Publish response:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[PageEditor] Publish failed:', error);
        throw new Error('Failed to publish page');
      }

      setStatus(PageStatus.PUBLISHED);
      setHasUnsavedChanges(false);

      toast.success('Page published successfully');
      console.log('[PageEditor] Page published successfully');
    } catch (error) {
      console.error('[PageEditor] Error publishing page:', error);
      toast.error('Failed to publish page');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (mode === 'edit' && pageId) {
      // Open preview in new tab
      window.open(`/${slug}?preview=true`, '_blank');
    } else {
      toast.info('Save the page first to preview');
    }
  };

  const handleFieldChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PermissionGuard permission="pages:write">
      <div className="container mx-auto space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-end gap-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-muted-foreground">
              Unsaved changes
            </span>
          )}
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={mode === 'create'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <PermissionGuard permission="pages:publish" fallback={null}>
            <Button
              onClick={handlePublish}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          </PermissionGuard>
        </div>

        {/* Editor Tabs */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <PageBasicInfo
              title={title}
              slug={slug}
              excerpt={excerpt}
              onTitleChange={(value: string) => {
                setTitle(value);
                handleFieldChange();
              }}
              onSlugChange={(value: string) => {
                setSlug(value);
                handleFieldChange();
              }}
              onExcerptChange={(value: string) => {
                setExcerpt(value);
                handleFieldChange();
              }}
              excludePageId={pageId}
            />

            <FeaturedImageUpload
              imageUrl={featuredImage}
              onImageChange={(value: string) => {
                setFeaturedImage(value);
                handleFieldChange();
              }}
            />

            <ContentEditor
              content={content}
              onChange={(value: string) => {
                console.log('[PageEditor] Content changed:', {
                  newLength: value.length,
                  oldLength: content.length,
                  preview: value.substring(0, 100)
                });
                setContent(value);
                handleFieldChange();
              }}
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <PageMetadata
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              metaKeywords={metaKeywords}
              onMetaTitleChange={(value: string) => {
                setMetaTitle(value);
                handleFieldChange();
              }}
              onMetaDescriptionChange={(value: string) => {
                setMetaDescription(value);
                handleFieldChange();
              }}
              onMetaKeywordsChange={(value: string) => {
                setMetaKeywords(value);
                handleFieldChange();
              }}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PageSettings
              status={status}
              visibility={visibility}
              parentPageId={parentPageId}
              showInNavigation={showInNavigation}
              displayOrder={displayOrder}
              customCssClass={customCssClass}
              templateKey={templateKey}
              onStatusChange={(value: PageStatus) => {
                setStatus(value);
                handleFieldChange();
              }}
              onVisibilityChange={(value: PageVisibility) => {
                setVisibility(value);
                handleFieldChange();
              }}
              onParentPageIdChange={(value: string | undefined) => {
                setParentPageId(value);
                handleFieldChange();
              }}
              onShowInNavigationChange={(value: boolean) => {
                setShowInNavigation(value);
                handleFieldChange();
              }}
              onDisplayOrderChange={(value: number) => {
                setDisplayOrder(value);
                handleFieldChange();
              }}
              onCustomCssClassChange={(value: string) => {
                setCustomCssClass(value);
                handleFieldChange();
              }}
              onTemplateKeyChange={(value: string) => {
                setTemplateKey(value);
                handleFieldChange();
              }}
              excludePageId={pageId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
