'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Loader2 } from 'lucide-react';

interface QuantityUpdaterProps {
  itemId: string;
  quantity: number;
  maxQuantity?: number;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

export function QuantityUpdater({
  itemId,
  quantity,
  maxQuantity,
  onQuantityChange,
}: QuantityUpdaterProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Update local quantity when prop changes
  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  // Debounced API call
  const debouncedUpdate = useCallback(
    (newQuantity: number) => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer
      const timer = setTimeout(async () => {
        setIsUpdating(true);
        try {
          await onQuantityChange(itemId, newQuantity);
        } finally {
          setIsUpdating(false);
        }
      }, 500); // 500ms debounce

      setDebounceTimer(timer);
    },
    [itemId, onQuantityChange, debounceTimer]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleIncrement = () => {
    const newQuantity = localQuantity + 1;
    if (maxQuantity && newQuantity > maxQuantity) {
      return;
    }
    setLocalQuantity(newQuantity);
    debouncedUpdate(newQuantity);
  };

  const handleDecrement = () => {
    if (localQuantity <= 1) return;
    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    debouncedUpdate(newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      setLocalQuantity(1);
      debouncedUpdate(1);
      return;
    }
    if (maxQuantity && value > maxQuantity) {
      setLocalQuantity(maxQuantity);
      debouncedUpdate(maxQuantity);
      return;
    }
    setLocalQuantity(value);
    debouncedUpdate(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={localQuantity <= 1 || isUpdating}
        className="h-8 w-8"
      >
        <Minus className="h-3 w-3" />
      </Button>

      <div className="relative">
        <Input
          type="number"
          min="1"
          max={maxQuantity}
          value={localQuantity}
          onChange={handleInputChange}
          disabled={isUpdating}
          className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-3 w-3 animate-spin" />
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={(maxQuantity !== undefined && localQuantity >= maxQuantity) || isUpdating}
        className="h-8 w-8"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
