'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ParentPageSelector } from './ParentPageSelector';
import { PageStatus, PageVisibility } from '@/types/pages';
import { Info } from 'lucide-react';

interface PageSettingsProps {
  status: PageStatus;
  visibility: PageVisibility;
  parentPageId?: string;
  showInNavigation: boolean;
  displayOrder: number;
  customCssClass: string;
  templateKey: string;
  onStatusChange: (value: PageStatus) => void;
  onVisibilityChange: (value: PageVisibility) => void;
  onParentPageIdChange: (value: string | undefined) => void;
  onShowInNavigationChange: (value: boolean) => void;
  onDisplayOrderChange: (value: number) => void;
  onCustomCssClassChange: (value: string) => void;
  onTemplateKeyChange: (value: string) => void;
  excludePageId?: string;
}

export function PageSettings({
  status,
  visibility,
  parentPageId,
  showInNavigation,
  displayOrder,
  customCssClass,
  templateKey,
  onStatusChange,
  onVisibilityChange,
  onParentPageIdChange,
  onShowInNavigationChange,
  onDisplayOrderChange,
  onCustomCssClassChange,
  onTemplateKeyChange,
  excludePageId,
}: PageSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Status</CardTitle>
          <CardDescription>
            Control the publication status and visibility of your page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => onStatusChange(value as PageStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PageStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={PageStatus.PUBLISHED}>Published</SelectItem>
                <SelectItem value={PageStatus.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {status === PageStatus.DRAFT && 'Draft pages are not visible to the public'}
              {status === PageStatus.PUBLISHED && 'Published pages are visible to the public'}
              {status === PageStatus.ARCHIVED && 'Archived pages are hidden but not deleted'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(value) => onVisibilityChange(value as PageVisibility)}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PageVisibility.PUBLIC}>Public</SelectItem>
                <SelectItem value={PageVisibility.PRIVATE}>Private</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {visibility === PageVisibility.PUBLIC && 'Public pages are accessible to everyone'}
              {visibility === PageVisibility.PRIVATE && 'Private pages require authentication'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Page Hierarchy</CardTitle>
          <CardDescription>
            Organize your pages in a hierarchical structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ParentPageSelector
            value={parentPageId}
            onChange={onParentPageIdChange}
            excludePageId={excludePageId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>
            Control how this page appears in site navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showInNavigation">Show in Navigation</Label>
              <p className="text-sm text-muted-foreground">
                Display this page in the site navigation menu
              </p>
            </div>
            <Switch
              id="showInNavigation"
              checked={showInNavigation}
              onCheckedChange={onShowInNavigationChange}
            />
          </div>

          {showInNavigation && (
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => onDisplayOrderChange(parseInt(e.target.value) || 0)}
                min={0}
              />
              <p className="text-sm text-muted-foreground">
                Lower numbers appear first in navigation menus
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>
            Additional customization options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customCssClass">Custom CSS Class (Optional)</Label>
            <Input
              id="customCssClass"
              value={customCssClass}
              onChange={(e) => onCustomCssClassChange(e.target.value)}
              placeholder="custom-page-class"
              pattern="[a-zA-Z0-9-_]+"
            />
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>Add a custom CSS class for advanced styling. Use only alphanumeric characters, hyphens, and underscores.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateKey">Template</Label>
            <Select value={templateKey} onValueChange={onTemplateKeyChange}>
              <SelectTrigger id="templateKey">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="full-width">Full Width</SelectItem>
                <SelectItem value="sidebar">With Sidebar</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose a template layout for this page
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
