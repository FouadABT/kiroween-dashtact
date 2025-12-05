'use client';

import { useState } from 'react';
import { Inventory, AdjustInventoryDto } from '@/types/ecommerce';
import { InventoryApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface InventoryAdjusterProps {
  inventory: Inventory;
  onComplete: () => void;
  onCancel: () => void;
}

const ADJUSTMENT_REASONS = [
  'Restock',
  'Sale',
  'Damage',
  'Loss',
  'Return',
  'Correction',
  'Other',
];

export function InventoryAdjuster({ inventory, onComplete, onCancel }: InventoryAdjusterProps) {
  // toast is imported directly
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    quantityChange: 0,
    reason: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.quantityChange === 0) {
      toast.error('Quantity change cannot be zero');
      return;
    }

    if (!formData.reason) {
      toast.error('Please select a reason for the adjustment');
      return;
    }

    try {
      setIsSubmitting(true);
      const adjustmentData: AdjustInventoryDto = {
        productVariantId: inventory.productVariantId,
        quantityChange: formData.quantityChange,
        reason: formData.reason,
        notes: formData.notes || undefined,
      };

      await InventoryApi.adjust(adjustmentData);

      toast.success('Inventory adjusted successfully');

      onComplete();
    } catch (error) {
      toast.error('Failed to adjust inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const newQuantity = inventory.quantity + formData.quantityChange;
  const newAvailable = inventory.available + formData.quantityChange;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current Stock Info */}
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current Quantity:</span>
          <span className="font-semibold">{inventory.quantity}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Reserved:</span>
          <span className="font-semibold">{inventory.reserved}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Available:</span>
          <span className="font-semibold">{inventory.available}</span>
        </div>
      </div>

      {/* Quantity Change */}
      <div className="space-y-2">
        <Label htmlFor="quantityChange">
          Quantity Change
          <span className="text-muted-foreground text-xs ml-2">
            (Use negative numbers to decrease)
          </span>
        </Label>
        <Input
          id="quantityChange"
          type="number"
          value={formData.quantityChange}
          onChange={(e) =>
            setFormData({ ...formData, quantityChange: parseInt(e.target.value) || 0 })
          }
          placeholder="Enter quantity change (e.g., 10 or -5)"
        />
      </div>

      {/* New Stock Preview */}
      {formData.quantityChange !== 0 && (
        <div className="bg-primary/10 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">After Adjustment:</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">New Quantity:</span>
            <span className="font-semibold">{newQuantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">New Available:</span>
            <span className="font-semibold">{newAvailable}</span>
          </div>
        </div>
      )}

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Select
          value={formData.reason}
          onValueChange={(value) => setFormData({ ...formData, reason: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {ADJUSTMENT_REASONS.map((reason) => (
              <SelectItem key={reason} value={reason}>
                {reason}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional notes about this adjustment"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Adjusting...' : 'Adjust Inventory'}
        </Button>
      </div>
    </form>
  );
}
