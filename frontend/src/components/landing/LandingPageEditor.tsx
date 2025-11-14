'use client';

/**
 * Landing Page Editor
 * 
 * Main editor component for customizing landing page content.
 * Provides section management, preview, and global settings editing.
 */

import { useState, useEffect } from 'react';
import { LandingApi } from '@/lib/api';
import { LandingPageContent, LandingPageSection } from '@/types/landing-page';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, RotateCcw, Eye } from 'lucide-react';
import { SectionList } from '@/components/landing/SectionList';
import { PreviewPanel } from '@/components/landing/PreviewPanel';
import { GlobalSettingsEditor } from '@/components/landing/GlobalSettingsEditor';

export function LandingPageEditor() {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load landing page content
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const data = await LandingApi.getContentAdmin();
      setContent(data);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load landing page content:', error);
      toast.error('Failed to load landing page content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    try {
      setIsSaving(true);
      const updated = await LandingApi.updateContent({
        sections: content.sections,
        settings: content.settings,
      });
      setContent(updated);
      setHasChanges(false);
      toast.success('Landing page updated successfully');
    } catch (error) {
      console.error('Failed to save landing page:', error);
      toast.error('Failed to save landing page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset to default content? This cannot be undone.')) {
      return;
    }

    try {
      setIsSaving(true);
      const defaultContent = await LandingApi.resetToDefaults();
      setContent(defaultContent);
      setHasChanges(false);
      toast.success('Landing page reset to defaults');
    } catch (error) {
      console.error('Failed to reset landing page:', error);
      toast.error('Failed to reset landing page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionsChange = (sections: LandingPageSection[]) => {
    if (!content) return;
    setContent({ ...content, sections });
    setHasChanges(true);
  };

  const handleSettingsChange = (settings: LandingPageContent['settings']) => {
    if (!content) return;
    setContent({ ...content, settings });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!content) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Failed to load landing page content
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
        {hasChanges && (
          <p className="text-sm text-muted-foreground mt-2">
            You have unsaved changes
          </p>
        )}
      </Card>

      {/* Editor Tabs */}
      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SectionList
                sections={content.sections}
                onChange={handleSectionsChange}
              />
            </div>
            {showPreview && (
              <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-12rem)]">
                <PreviewPanel content={content} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <GlobalSettingsEditor
            settings={content.settings}
            onChange={handleSettingsChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
