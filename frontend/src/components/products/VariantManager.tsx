'use client';

import React, { useState } from 'react';
import { ProductVariant, CreateProductVariantDto, UpdateProductVariantDto } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface VariantManagerProps {
  variants: ProductVariant[];
  onAdd: (variant: Omit<CreateProductVariantDto, 'productId'>) => void;
  onUpdate: (id: string, variant: UpdateProductVariantDto) => void;
  onDelete: (id: string) => void;
}

export function VariantManager({ variants, onAdd, onUpdate, onDelete }: VariantManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateProductVariantDto>>({
    name: '',
    sku: '',
    barcode: '',
    attributes: {},
    price: undefined,
    compareAtPrice: undefined,
    cost: undefined,
    image: '',
    isActive: true,
  });

  const handleAdd = () => {
    if (!formData.name || !formData.attributes) return;
    
    onAdd({
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode,
      attributes: formData.attributes,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice,
      cost: formData.cost,
      image: formData.image,
      isActive: formData.isActive ?? true,
    });
    
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      attributes: {},
      price: undefined,
      compareAtPrice: undefined,
      cost: undefined,
      image: '',
      isActive: true,
    });
    setIsAdding(false);
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setFormData({
      name: variant.name,
      sku: variant.sku || '',
      barcode: variant.barcode || '',
      attributes: variant.attributes,
      price: variant.price ? parseFloat(variant.price) : undefined,
      compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
      cost: variant.cost ? parseFloat(variant.cost) : undefined,
      image: variant.image || '',
      isActive: variant.isActive,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name) return;
    
    onUpdate(editingId, {
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode,
      attributes: formData.attributes,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice,
      cost: formData.cost,
      image: formData.image,
      isActive: formData.isActive,
    });
    
    setEditingId(null);
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      attributes: {},
      price: undefined,
      compareAtPrice: undefined,
      cost: undefined,
      image: '',
      isActive: true,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      attributes: {},
      price: undefined,
      compareAtPrice: undefined,
      cost: undefined,
      image: '',
      isActive: true,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        )}
      </div>

      {/* Existing Variants */}
      <div className="space-y-2">
        {variants.map((variant) => (
          <Card key={variant.id}>
            <CardContent className="p-4">
              {editingId === variant.id ? (
                <VariantForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={handleUpdate}
                  onCancel={handleCancel}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{variant.name}</h4>
                      {!variant.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {variant.sku && <span>SKU: {variant.sku}</span>}
                      {variant.price && (
                        <span className="ml-4">Price: ${variant.price}</span>
                      )}
                      {variant.inventory && (
                        <span className="ml-4">
                          Stock: {variant.inventory.available}
                        </span>
                      )}
                    </div>
                    {Object.keys(variant.attributes).length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {Object.entries(variant.attributes).map(([key, value]) => (
                          <Badge key={key} variant="outline">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(variant)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Variant Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <VariantForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleAdd}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface VariantFormProps {
  formData: Partial<CreateProductVariantDto>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<CreateProductVariantDto>>>;
  onSave: () => void;
  onCancel: () => void;
}

function VariantForm({ formData, setFormData, onSave, onCancel }: VariantFormProps) {
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

  const addAttribute = () => {
    if (!attributeKey || !attributeValue) return;
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        [attributeKey]: attributeValue,
      },
    });
    setAttributeKey('');
    setAttributeValue('');
  };

  const removeAttribute = (key: string) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    setFormData({ ...formData, attributes: newAttributes });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="variant-name">Variant Name *</Label>
          <Input
            id="variant-name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Small / Red"
          />
        </div>
        <div>
          <Label htmlFor="variant-sku">SKU</Label>
          <Input
            id="variant-sku"
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="SKU-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="variant-price">Price</Label>
          <Input
            id="variant-price"
            type="number"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })
            }
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="variant-compare-price">Compare At Price</Label>
          <Input
            id="variant-compare-price"
            type="number"
            step="0.01"
            value={formData.compareAtPrice || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                compareAtPrice: parseFloat(e.target.value) || undefined,
              })
            }
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="variant-cost">Cost</Label>
          <Input
            id="variant-cost"
            type="number"
            step="0.01"
            value={formData.cost || ''}
            onChange={(e) =>
              setFormData({ ...formData, cost: parseFloat(e.target.value) || undefined })
            }
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="variant-barcode">Barcode</Label>
        <Input
          id="variant-barcode"
          value={formData.barcode || ''}
          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          placeholder="123456789"
        />
      </div>

      <div>
        <Label>Attributes</Label>
        <div className="space-y-2">
          {formData.attributes && Object.entries(formData.attributes).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-2">
                {key}: {String(value)}
                <button
                  type="button"
                  onClick={() => removeAttribute(key)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Attribute name (e.g., Size)"
              value={attributeKey}
              onChange={(e) => setAttributeKey(e.target.value)}
            />
            <Input
              placeholder="Value (e.g., Large)"
              value={attributeValue}
              onChange={(e) => setAttributeValue(e.target.value)}
            />
            <Button type="button" onClick={addAttribute} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="variant-active"
          checked={formData.isActive ?? true}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="variant-active">Active</Label>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave}>
          <Check className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
