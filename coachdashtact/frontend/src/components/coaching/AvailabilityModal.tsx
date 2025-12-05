'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { CoachAvailabilityApi } from '@/lib/api/coaching';
import { toast } from '@/hooks/use-toast';
import type { CoachAvailability, CreateAvailabilityDto, UpdateAvailabilityDto } from '@/types/coaching';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface AvailabilityModalProps {
  open: boolean;
  slot: CoachAvailability | null;
  coachId: string;
  onClose: (success: boolean) => void;
}

export function AvailabilityModal({
  open,
  slot,
  coachId,
  onClose,
}: AvailabilityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    maxSessionsPerSlot: 1,
    bufferMinutes: 15,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (slot) {
      setFormData({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxSessionsPerSlot: slot.maxSessionsPerSlot,
        bufferMinutes: slot.bufferMinutes,
        isActive: slot.isActive,
      });
    } else {
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 1,
        bufferMinutes: 15,
        isActive: true,
      });
    }
    setErrors({});
  }, [slot, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate time range
    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    // Validate max sessions
    if (formData.maxSessionsPerSlot < 1) {
      newErrors.maxSessionsPerSlot = 'Must be at least 1';
    }

    // Validate buffer minutes
    if (formData.bufferMinutes < 0) {
      newErrors.bufferMinutes = 'Cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (slot) {
        // Update existing slot
        const updateData: UpdateAvailabilityDto = {
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxSessionsPerSlot: formData.maxSessionsPerSlot,
          bufferMinutes: formData.bufferMinutes,
          isActive: formData.isActive,
        };
        await CoachAvailabilityApi.update(slot.id, updateData);
        toast.success('Availability updated successfully');
      } else {
        // Create new slot
        // coachId is optional - backend will auto-fill from authenticated user
        const createData: CreateAvailabilityDto = {
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxSessionsPerSlot: formData.maxSessionsPerSlot,
          bufferMinutes: formData.bufferMinutes,
        };
        await CoachAvailabilityApi.create(createData);
        toast.success('Availability created successfully');
      }
      onClose(true);
    } catch (error) {
      console.error('Failed to save availability:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save availability';
      
      // Handle specific error cases
      if (message.includes('overlap')) {
        toast.error('This time slot overlaps with an existing availability');
      } else if (message.includes('booking')) {
        toast.error('Cannot update: existing bookings conflict with new times');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {slot ? 'Edit Availability' : 'Add Availability'}
            </DialogTitle>
            <DialogDescription>
              {slot
                ? 'Update your availability slot details'
                : 'Add a new time slot to your weekly schedule'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Day of Week */}
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select
                value={formData.dayOfWeek.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, dayOfWeek: parseInt(value) })
                }
              >
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
                {errors.endTime && (
                  <p className="text-sm text-destructive">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Max Sessions Per Slot */}
            <div className="space-y-2">
              <Label htmlFor="maxSessionsPerSlot">
                Max Sessions Per Slot
              </Label>
              <Input
                id="maxSessionsPerSlot"
                type="number"
                min="1"
                max="10"
                value={formData.maxSessionsPerSlot}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxSessionsPerSlot: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
              {errors.maxSessionsPerSlot && (
                <p className="text-sm text-destructive">
                  {errors.maxSessionsPerSlot}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Number of sessions you can conduct simultaneously
              </p>
            </div>

            {/* Buffer Minutes */}
            <div className="space-y-2">
              <Label htmlFor="bufferMinutes">Buffer Time (minutes)</Label>
              <Input
                id="bufferMinutes"
                type="number"
                min="0"
                max="60"
                step="5"
                value={formData.bufferMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bufferMinutes: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
              {errors.bufferMinutes && (
                <p className="text-sm text-destructive">
                  {errors.bufferMinutes}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Minimum time gap between consecutive sessions
              </p>
            </div>

            {/* Active Toggle (only for edit) */}
            {slot && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p id="isActive-description" className="text-sm text-muted-foreground">
                    Inactive slots won&apos;t be available for booking
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                  aria-describedby="isActive-description"
                  aria-label="Toggle availability slot active status"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : slot ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
