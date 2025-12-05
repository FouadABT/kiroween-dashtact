'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { showErrorToast, showSuccessToast } from '@/lib/toast-helpers';
import { BlogTag } from '@/types/blog';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * TagManagement Component
 * 
 * Component for managing blog tags.
 * 
 * Features:
 * - List all tags with post counts
 * - Create new tag
 * - Edit existing tag
 * - Delete tag (with validation)
 * - Auto-generate slug from name
 */
export function TagManagement() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<BlogTag | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  /**
   * Fetch tags from API
   */
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/blog/tags/all`);

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      showErrorToast('Error', 'Failed to load tags. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate slug from name
   */
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  /**
   * Handle create/edit tag
   */
  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      showErrorToast('Error', 'Tag name is required');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = editingTag
        ? `${API_BASE_URL}/blog/tags/${editingTag.id}`
        : `${API_BASE_URL}/blog/tags`;
      const method = editingTag ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save tag');
      }

      showSuccessToast('Success', `Tag ${editingTag ? 'updated' : 'created'} successfully`);

      // Reset form and close dialog
      setFormData({ name: '', slug: '' });
      setEditingTag(null);
      setDialogOpen(false);

      // Refresh tags
      fetchTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      showErrorToast('Error', error instanceof Error ? error.message : 'Failed to save tag. Please try again.');
    }
  };

  /**
   * Handle delete tag
   */
  const handleDelete = async () => {
    if (!tagToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/blog/tags/${tagToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete tag');
      }

      showSuccessToast('Success', 'Tag deleted successfully');

      // Refresh tags
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      showErrorToast('Error', error instanceof Error ? error.message : 'Failed to delete tag. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  /**
   * Open create dialog
   */
  const handleCreate = () => {
    setFormData({ name: '', slug: '' });
    setEditingTag(null);
    setDialogOpen(true);
  };

  /**
   * Open edit dialog
   */
  const handleEdit = (tag: BlogTag) => {
    setFormData({
      name: tag.name,
      slug: tag.slug,
    });
    setEditingTag(tag);
    setDialogOpen(true);
  };

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  // Auto-generate slug when name changes
  useEffect(() => {
    if (!editingTag && formData.name) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, editingTag]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tags</h2>
          <p className="text-muted-foreground">
            Manage blog post tags
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {/* Tags Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading tags...
                </TableCell>
              </TableRow>
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="text-muted-foreground">
                    No tags yet. Create your first tag!
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.slug}
                  </TableCell>
                  <TableCell>{tag._count?.posts || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tag)}
                        title="Edit tag"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTagToDelete(tag);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete tag"
                        disabled={(tag._count?.posts || 0) > 0}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Edit Tag' : 'Create Tag'}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? 'Update the tag details below.'
                : 'Add a new tag for organizing blog posts.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter tag name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="url-friendly-slug"
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to auto-generate from name
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingTag(null);
                setFormData({ name: '', slug: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tag &quot;{tagToDelete?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
