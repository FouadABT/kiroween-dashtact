'use client';

import { cn } from '@/lib/utils';

interface Variant {
  id: string;
  name: string;
  attributes: Record<string, any>;
  price?: number | null;
  isActive: boolean;
  inventory?: {
    quantity: number;
    reserved: number;
    available: number;
  };
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
}: VariantSelectorProps) {
  // Group variants by attribute type (e.g., size, color)
  const attributeTypes = new Set<string>();
  variants.forEach(variant => {
    Object.keys(variant.attributes || {}).forEach(key => {
      attributeTypes.add(key);
    });
  });
  
  // If no attributes, show simple variant selector
  if (attributeTypes.size === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Select Option</h3>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = variant.id === selectedVariantId;
            const isAvailable = variant.isActive && (variant.inventory?.available || 0) > 0;
            
            return (
              <button
                key={variant.id}
                onClick={() => isAvailable && onVariantChange(variant.id)}
                disabled={!isAvailable}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isAvailable
                    ? 'border-border hover:border-primary/50 bg-background text-foreground'
                    : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                )}
              >
                {variant.name}
                {!isAvailable && ' (Out of Stock)'}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Render attribute-based selectors
  return (
    <div className="space-y-6">
      {Array.from(attributeTypes).map((attributeType) => {
        // Get unique values for this attribute type
        const uniqueValues = new Set<string>();
        variants.forEach(variant => {
          const value = variant.attributes?.[attributeType];
          if (value) uniqueValues.add(String(value));
        });
        
        const selectedVariant = variants.find(v => v.id === selectedVariantId);
        const selectedValue = selectedVariant?.attributes?.[attributeType];
        
        return (
          <div key={attributeType} className="space-y-3">
            <h3 className="text-sm font-medium text-foreground capitalize">
              {attributeType}: {selectedValue && <span className="text-muted-foreground">{selectedValue}</span>}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {Array.from(uniqueValues).map((value) => {
                // Find variant with this attribute value
                const variant = variants.find(v => 
                  String(v.attributes?.[attributeType]) === value
                );
                
                if (!variant) return null;
                
                const isSelected = variant.id === selectedVariantId;
                const isAvailable = variant.isActive && (variant.inventory?.available || 0) > 0;
                
                // Check if this is a color attribute for visual swatches
                const isColor = attributeType.toLowerCase() === 'color' || attributeType.toLowerCase() === 'colour';
                
                if (isColor) {
                  return (
                    <button
                      key={value}
                      onClick={() => isAvailable && onVariantChange(variant.id)}
                      disabled={!isAvailable}
                      className={cn(
                        'relative w-12 h-12 rounded-full border-2 transition-all',
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20'
                          : isAvailable
                          ? 'border-border hover:border-primary/50'
                          : 'border-border cursor-not-allowed opacity-50'
                      )}
                      title={value}
                      style={{
                        backgroundColor: value.toLowerCase(),
                      }}
                    >
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-destructive rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                }
                
                // Default button style for other attributes
                return (
                  <button
                    key={value}
                    onClick={() => isAvailable && onVariantChange(variant.id)}
                    disabled={!isAvailable}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all min-w-[60px]',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isAvailable
                        ? 'border-border hover:border-primary/50 bg-background text-foreground'
                        : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
