'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Visibility, UpdateUploadDto } from '@/types/media';
import { X } from 'lucide-react';

interface MediaEditModalProps {
  upload: Upload | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: UpdateUploadDto) => Promise<void>;
}

export function MediaEditModal({ upload, open, onOpenChange, onSave }: MediaEditModalProps) {
  const [formData, setFormData] = useState<UpdateUploadDto>({
    title: '',
    description: '',
    altText: '',
    tags: [],
    visibility: Visibility.PRIVATE,
    allowedRoles: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (upload) {
      setFormData({
        title: upload.title || '',
        description: upload.description || '',
        altText: upload.altText || '',
        tags: upload.tags || [],
        visibility: upload.visibility,
        allowedRoles: upload.allowedRoles || [],
      });
    }
  }, [upload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upload) return;

    setIsSaving(true);
    try {
      await onSave(upload.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!upload) return null;

  const isImage = upload.type === 'IMAGE' || upload.type === 'AVATAR' || upload.type === 'EDITOR_IMAGE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Media Metadata</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a title for this file"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter a description"
              rows={3}
            />
          </div>

          {isImage && (
            <div className="space-y-2">
              <Label htmlFor="altText">Alt Text</Label>
              <Input
                id="altText"
                value={formData.altText}
                onChange={(e) => setFormData((prev) => ({ ...prev, altText: e.target.value }))}
                placeholder="Describe the image for accessibility"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, visibility: value as Visibility }))
              }
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Visibility.PUBLIC}>Public - Visible to everyone</SelectItem>
                <SelectItem value={Visibility.PRIVATE}>Private - Only you and admins</SelectItem>
                <SelectItem value={Visibility.ROLE_BASED}>Role-based - Specific roles only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.visibility === Visibility.ROLE_BASED && (
            <div className="space-y-2">
              <Label htmlFor="allowedRoles">Allowed Roles</Label>
              <Input
                id="allowedRoles"
                value={formData.allowedRoles?.join(', ') || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    allowedRoles: e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                  }))
                }
                placeholder="Enter role IDs separated by commas"
              />
              <p className="text-xs text-muted-foreground">
                Enter role IDs that should have access to this file
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
