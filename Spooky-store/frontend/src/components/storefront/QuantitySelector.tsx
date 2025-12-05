'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity?: number;
  minQuantity?: number;
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  maxQuantity = 999,
  minQuantity = 1,
  disabled = false,
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };
  
  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    
    if (isNaN(value)) {
      onQuantityChange(minQuantity);
      return;
    }
    
    if (value < minQuantity) {
      onQuantityChange(minQuantity);
    } else if (value > maxQuantity) {
      onQuantityChange(maxQuantity);
    } else {
      onQuantityChange(value);
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Quantity</label>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled || quantity <= minQuantity}
          className="h-10 w-10"
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <Input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          min={minQuantity}
          max={maxQuantity}
          className="h-10 w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled || quantity >= maxQuantity}
          className="h-10 w-10"
        >
          <Plus className="w-4 h-4" />
        </Button>
        
        {maxQuantity < 999 && (
          <span className="text-sm text-muted-foreground ml-2">
            {maxQuantity} available
          </span>
        )}
      </div>
    </div>
  );
}
