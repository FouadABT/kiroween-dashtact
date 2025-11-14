'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';

interface PageMetadataProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onMetaKeywordsChange: (value: string) => void;
}

export function PageMetadata({
  metaTitle,
  metaDescription,
  metaKeywords,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onMetaKeywordsChange,
}: PageMetadataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO & Metadata</CardTitle>
        <CardDescription>
          Optimize your page for search engines and social media
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title (Optional)</Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Leave empty to use page title"
            maxLength={200}
          />
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>{metaTitle.length}/200 characters</p>
              <p>Recommended: 50-60 characters for optimal display in search results</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description (Optional)</Label>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Leave empty to use page excerpt"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>{metaDescription.length}/500 characters</p>
              <p>Recommended: 150-160 characters for optimal display in search results</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaKeywords">Meta Keywords (Optional)</Label>
          <Input
            id="metaKeywords"
            value={metaKeywords}
            onChange={(e) => onMetaKeywordsChange(e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
          />
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Separate keywords with commas. Note: Most search engines don't use meta keywords anymore.</p>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="font-medium mb-2">Preview</h4>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-primary">
                {metaTitle || 'Page Title'}
              </p>
              <p className="text-xs text-muted-foreground">
                {metaDescription || 'Page description will appear here'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
