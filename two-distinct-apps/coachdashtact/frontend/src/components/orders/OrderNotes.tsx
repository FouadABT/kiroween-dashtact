'use client';

import { useState } from 'react';
import { Order } from '@/types/ecommerce';
import { OrdersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OrderNotesProps {
  order: Order;
  onNoteAdded: () => void;
}

export function OrderNotes({ order, onNoteAdded }: OrderNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setIsAdding(true);
      await OrdersApi.addNote(order.id, newNote);
      setNewNote('');
      onNoteAdded();
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Order Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Notes */}
        <div className="space-y-4">
          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold">Customer Notes</Label>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm whitespace-pre-wrap">{order.customerNotes}</p>
              </div>
            </div>
          )}

          {/* Internal Notes */}
          {order.internalNotes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold">Internal Notes</Label>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm whitespace-pre-wrap">{order.internalNotes}</p>
              </div>
            </div>
          )}

          {!order.customerNotes && !order.internalNotes && (
            <p className="text-sm text-muted-foreground">No notes available</p>
          )}
        </div>

        <PermissionGuard permission="orders:write" fallback={null}>
          <Separator />

          {/* Add New Note */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newNote">Add Internal Note</Label>
              <Textarea
                id="newNote"
                placeholder="Add a note about this order..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Internal notes are only visible to staff members
              </p>
            </div>

            <Button
              onClick={handleAddNote}
              disabled={isAdding || !newNote.trim()}
              className="w-full"
            >
              {isAdding ? 'Adding Note...' : 'Add Note'}
            </Button>
          </div>
        </PermissionGuard>
      </CardContent>
    </Card>
  );
}
