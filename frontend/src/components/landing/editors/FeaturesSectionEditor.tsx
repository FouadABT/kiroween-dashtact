'use client';

/**
 * Features Section Editor
 * 
 * Edit features section with add/remove/reorder feature cards.
 */

import { FeaturesSectionData, FeatureCard } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { FeatureCardEditor } from '@/components/landing/shared/FeatureCardEditor';
import { Card } from '@/components/ui/card';

interface FeaturesSectionEditorProps {
  data: FeaturesSectionData;
  onChange: (data: FeaturesSectionData) => void;
}

export function FeaturesSectionEditor({ data, onChange }: FeaturesSectionEditorProps) {
  const handleChange = (field: keyof FeaturesSectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddFeature = () => {
    const features = data.features || [];
    const newFeature: FeatureCard = {
      id: `feature-${Date.now()}`,
      icon: 'star',
      title: 'New Feature',
      description: 'Feature description',
      order: features.length,
    };
    handleChange('features', [...features, newFeature]);
  };

  const handleUpdateFeature = (id: string, updated: FeatureCard): void => {
    const features = data.features || [];
    handleChange(
      'features',
      features.map((f) => (f.id === id ? updated : f))
    );
  };

  const handleDeleteFeature = (id: string) => {
    const features = data.features || [];
    handleChange(
      'features',
      features.filter((f) => f.id !== id)
    );
  };

  const handleReorderFeature = (fromIndex: number, toIndex: number) => {
    const features = data.features || [];
    const newFeatures = [...features];
    const [moved] = newFeatures.splice(fromIndex, 1);
    newFeatures.splice(toIndex, 0, moved);
    
    const reordered = newFeatures.map((feature, index) => ({
      ...feature,
      order: index,
    }));
    
    handleChange('features', reordered);
  };

  const sortedFeatures = [...(data.features || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Our Features"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input
          id="subtitle"
          value={data.subtitle || ''}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          placeholder="Everything you need to succeed"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="layout">Layout</Label>
          <Select
            value={data.layout}
            onValueChange={(value: any) => handleChange('layout', value)}
          >
            <SelectTrigger id="layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="columns">Columns</Label>
          <Select
            value={(data.columns || 3).toString()}
            onValueChange={(value) => handleChange('columns', parseInt(value))}
          >
            <SelectTrigger id="columns">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Features</Label>
          <Button onClick={handleAddFeature} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>

        <div className="space-y-2">
          {sortedFeatures.map((feature, index) => (
            <Card key={feature.id} className="p-3">
              <div className="flex items-start gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                <div className="flex-1">
                  <FeatureCardEditor
                    value={feature}
                    onChange={(updated) => handleUpdateFeature(feature.id, updated)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFeature(feature.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {sortedFeatures.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4 border rounded-lg">
              No features yet. Click "Add Feature" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
