'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Eye, X } from 'lucide-react';
import { Visibility } from '@/types/media';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: (selected: boolean) => void;
  onDeselectAll: () => void;
  onBulkDelete: () => Promise<void>;
  onBulkVisibilityUpdate: (visibility: Visibility) => Promise<void>;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkVisibilityUpdate,
}: BulkActionBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState<Visibility>(Visibility.PRIVATE);
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedCount === 0) return null;

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await onBulkDelete();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkVisibilityUpdate = async () => {
    setIsProcessing(true);
    try {
      await onBulkVisibilityUpdate(selectedVisibility);
      setShowVisibilityDialog(false);
    } catch (error) {
      console.error('Bulk visibility update failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              className="border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
            />
            <span className="font-medium">
              {selectedCount} of {totalCount} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowVisibilityDialog(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Change Visibility
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
              className="gap-2 hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
              Clear Selection
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} files?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will soft delete the selected files. They can be restored by an
              administrator. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change visibility for {selectedCount} files</AlertDialogTitle>
            <AlertDialogDescription>
              Select the new visibility level for the selected files.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Select value={selectedVisibility} onValueChange={(value) => setSelectedVisibility(value as Visibility)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Visibility.PUBLIC}>Public - Visible to everyone</SelectItem>
                <SelectItem value={Visibility.PRIVATE}>Private - Only you and admins</SelectItem>
                <SelectItem value={Visibility.ROLE_BASED}>
                  Role-based - Specific roles only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkVisibilityUpdate} disabled={isProcessing}>
              {isProcessing ? 'Updating...' : 'Update Visibility'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
