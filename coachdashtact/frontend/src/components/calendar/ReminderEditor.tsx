'use client';

import React, { useState } from 'react';
import { Bell, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReminderEditorProps {
  value?: number[];
  onChange: (reminders: number[]) => void;
}

const PRESET_REMINDERS = [
  { label: '10 minutes before', value: 10 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
  { label: '2 days before', value: 2880 },
  { label: '1 week before', value: 10080 },
];

export function ReminderEditor({ value = [], onChange }: ReminderEditorProps) {
  const [reminders, setReminders] = useState<number[]>(value);
  const [customValue, setCustomValue] = useState('');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [showCustom, setShowCustom] = useState(false);

  const addReminder = (minutes: number) => {
    if (!reminders.includes(minutes)) {
      const updated = [...reminders, minutes].sort((a, b) => a - b);
      setReminders(updated);
      onChange(updated);
    }
  };

  const removeReminder = (minutes: number) => {
    const updated = reminders.filter((r) => r !== minutes);
    setReminders(updated);
    onChange(updated);
  };

  const addCustomReminder = () => {
    const value = parseInt(customValue);
    if (isNaN(value) || value <= 0) return;

    let minutes = value;
    if (customUnit === 'hours') {
      minutes = value * 60;
    } else if (customUnit === 'days') {
      minutes = value * 1440;
    }

    addReminder(minutes);
    setCustomValue('');
    setShowCustom(false);
  };

  const formatReminder = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} before`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} before`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} before`;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Reminders
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Reminders */}
        {reminders.length > 0 && (
          <div className="space-y-2">
            <Label>Active Reminders</Label>
            <div className="flex flex-wrap gap-2">
              {reminders.map((minutes) => (
                <Badge
                  key={minutes}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 gap-1"
                >
                  <span className="text-xs">{formatReminder(minutes)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReminder(minutes)}
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preset Reminders */}
        {!showCustom && (
          <div className="space-y-2">
            <Label>Add Reminder</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_REMINDERS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addReminder(preset.value)}
                  disabled={reminders.includes(preset.value)}
                  className="justify-start text-left h-auto py-2"
                >
                  <Plus className="h-3 w-3 mr-2 shrink-0" />
                  <span className="text-xs">{preset.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Reminder */}
        {showCustom ? (
          <div className="space-y-2">
            <Label>Custom Reminder</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                placeholder="Value"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomReminder();
                  }
                }}
                className="w-24 bg-background"
              />
              <Select
                value={customUnit}
                onValueChange={(value: any) => setCustomUnit(value)}
              >
                <SelectTrigger className="w-32 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                onClick={addCustomReminder}
                disabled={!customValue || parseInt(customValue) <= 0}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustom(false);
                  setCustomValue('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustom(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Custom Reminder
          </Button>
        )}

        {/* Help Text */}
        {reminders.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Add reminders to get notified before the event starts
          </p>
        )}
      </CardContent>
    </Card>
  );
}
