'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { legalPagesApi } from '@/lib/api/legal-pages';
import { LegalPage } from '@/types/legal-pages';
import { ContentEditor } from '@/components/pages/ContentEditor';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { toast } from 'sonner';

export default function LegalPagesSettingsPage() {
  const [termsPage, setTermsPage] = useState<LegalPage | null>(null);
  const [privacyPage, setPrivacyPage] = useState<LegalPage | null>(null);
  const [termsContent, setTermsContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLegalPages();
  }, []);

  const loadLegalPages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [terms, privacy] = await Promise.all([
        legalPagesApi.getLegalPage('terms'),
        legalPagesApi.getLegalPage('privacy'),
      ]);

      setTermsPage(terms);
      setPrivacyPage(privacy);
      setTermsContent(terms?.content || '');
      setPrivacyContent(privacy?.content || '');
    } catch (err) {
      console.error('Failed to load legal pages:', err);
      setError('Failed to load legal pages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (pageType: 'terms' | 'privacy') => {
    setIsSaving(true);
    setError(null);

    try {
      const content = pageType === 'terms' ? termsContent : privacyContent;
      
      if (!content || content.trim() === '' || content === '<p></p>') {
        toast.error('Content cannot be empty');
        return;
      }

      const updatedPage = await legalPagesApi.updateLegalPage(pageType, content);

      if (pageType === 'terms') {
        setTermsPage(updatedPage);
      } else {
        setPrivacyPage(updatedPage);
      }

      toast.success(`${pageType === 'terms' ? 'Terms of Service' : 'Privacy Policy'} updated successfully`);
    } catch (err) {
      console.error('Failed to save legal page:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PermissionGuard permission="settings.manage">
      <div className="space-y-6">
        <PageHeader
          title="Legal Pages"
          description="Manage your Terms of Service and Privacy Policy content"
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'terms' | 'privacy')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
                <CardDescription>
                  Edit your Terms of Service content. This will be displayed at /terms
                  {termsPage?.updatedAt && (
                    <span className="block mt-2 text-sm">
                      Last updated: {new Date(termsPage.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContentEditor
                  content={termsContent}
                  onChange={setTermsContent}
                />

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('terms')}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>
                  Edit your Privacy Policy content. This will be displayed at /privacy
                  {privacyPage?.updatedAt && (
                    <span className="block mt-2 text-sm">
                      Last updated: {new Date(privacyPage.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContentEditor
                  content={privacyContent}
                  onChange={setPrivacyContent}
                />

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('privacy')}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
