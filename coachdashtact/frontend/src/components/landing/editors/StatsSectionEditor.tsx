'use client';

import { StatsSectionData, Stat } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { StatEditor } from '@/components/landing/shared/StatEditor';

interface StatsSectionEditorProps {
  data: StatsSectionData;
  onChange: (data: StatsSectionData) => void;
}

export function StatsSectionEditor({ data, onChange }: StatsSectionEditorProps) {
  const handleChange = (field: keyof StatsSectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddStat = () => {
    const newStat: Stat = {
      id: `stat-${Date.now()}`,
      value: '100+',
      label: 'Customers',
      order: data.stats.length,
    };
    handleChange('stats', [...data.stats, newStat]);
  };

  const handleUpdateStat = (id: string, updated: Stat): void => {
    handleChange('stats', data.stats.map((s) => (s.id === id ? updated : s)));
  };

  const handleDeleteStat = (id: string) => {
    handleChange('stats', data.stats.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title (Optional)</Label>
        <Input id="title" value={data.title || ''} onChange={(e) => handleChange('title', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={data.layout} onValueChange={(value: any) => handleChange('layout', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal">Horizontal</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Statistics</Label>
          <Button onClick={handleAddStat} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Stat
          </Button>
        </div>
        <div className="space-y-2">
          {data.stats.map((stat) => (
            <Card key={stat.id} className="p-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <StatEditor value={stat} onChange={(updated) => handleUpdateStat(stat.id, updated)} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteStat(stat.id)}>
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
