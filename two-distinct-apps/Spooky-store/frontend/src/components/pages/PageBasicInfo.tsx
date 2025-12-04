'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SlugInput } from './SlugInput';

interface PageBasicInfoProps {
  title: string;
  slug: string;
  excerpt: string;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  excludePageId?: string;
}

export function PageBasicInfo({
  title,
  slug,
  excerpt,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  excludePageId,
}: PageBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Enter the basic details for your page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter page title"
            maxLength={200}
          />
          <p className="text-sm text-muted-foreground">
            {title.length}/200 characters
          </p>
        </div>

        <SlugInput
          value={slug}
          title={title}
          onChange={onSlugChange}
          excludePageId={excludePageId}
        />

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt (Optional)</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => onExcerptChange(e.target.value)}
            placeholder="Enter a brief description of the page"
            rows={3}
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground">
            {excerpt.length}/500 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
