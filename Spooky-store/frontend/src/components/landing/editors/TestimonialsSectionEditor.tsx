'use client';

import { TestimonialsSectionData, Testimonial } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { TestimonialEditor } from '@/components/landing/shared/TestimonialEditor';

interface TestimonialsSectionEditorProps {
  data: TestimonialsSectionData;
  onChange: (data: TestimonialsSectionData) => void;
}

export function TestimonialsSectionEditor({ data, onChange }: TestimonialsSectionEditorProps) {
  const handleChange = (field: keyof TestimonialsSectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddTestimonial = () => {
    const testimonials = data.testimonials || [];
    const newTestimonial: Testimonial = {
      id: `testimonial-${Date.now()}`,
      quote: 'Great product!',
      author: 'John Doe',
      role: 'CEO',
      order: testimonials.length,
    };
    handleChange('testimonials', [...testimonials, newTestimonial]);
  };

  const handleUpdateTestimonial = (id: string, updated: Testimonial): void => {
    const testimonials = data.testimonials || [];
    handleChange('testimonials', testimonials.map((t) => (t.id === id ? updated : t)));
  };

  const handleDeleteTestimonial = (id: string) => {
    const testimonials = data.testimonials || [];
    handleChange('testimonials', testimonials.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input id="title" value={data.title} onChange={(e) => handleChange('title', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input id="subtitle" value={data.subtitle || ''} onChange={(e) => handleChange('subtitle', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={data.layout} onValueChange={(value: any) => handleChange('layout', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="masonry">Masonry</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="show-ratings">Show Ratings</Label>
        <Switch
          id="show-ratings"
          checked={data.showRatings !== false}
          onCheckedChange={(checked) => handleChange('showRatings', checked)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Testimonials</Label>
          <Button onClick={handleAddTestimonial} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
        <div className="space-y-2">
          {(data.testimonials || []).map((testimonial) => (
            <Card key={testimonial.id} className="p-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <TestimonialEditor value={testimonial} onChange={(updated) => handleUpdateTestimonial(testimonial.id, updated)} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
