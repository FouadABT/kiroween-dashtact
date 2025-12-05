'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, Clock, Users, AlertCircle } from 'lucide-react';
import type { CoachAvailability } from '@/types/coaching';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface AvailabilityGridProps {
  availability: CoachAvailability[];
  utilization: Record<string, { booked: number; max: number }>;
  onEdit: (slot: CoachAvailability) => void;
  onDelete: (slot: CoachAvailability) => void;
}

export function AvailabilityGrid({
  availability,
  utilization,
  onEdit,
  onDelete,
}: AvailabilityGridProps) {
  // Group availability by day of week
  const groupedByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    dayIndex: index,
    slots: availability
      .filter(slot => slot.dayOfWeek === index)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  const getUtilizationColor = (booked: number, max: number) => {
    const percentage = (booked / max) * 100;
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 75) return 'text-orange-600 dark:text-orange-500';
    if (percentage >= 50) return 'text-amber-600 dark:text-amber-500';
    return 'text-green-600 dark:text-green-500';
  };

  const getUtilizationBgColor = (booked: number, max: number) => {
    const percentage = (booked / max) * 100;
    if (percentage >= 100) return 'bg-destructive/10 border-destructive';
    if (percentage >= 75) return 'bg-orange-500/10 dark:bg-orange-500/20 border-orange-500';
    if (percentage >= 50) return 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500';
    return 'bg-green-500/10 dark:bg-green-500/20 border-green-500';
  };

  return (
    <div className="space-y-6" role="region" aria-label="Weekly availability schedule">
      {groupedByDay.map(({ day, dayIndex, slots }) => (
        <section key={dayIndex} aria-labelledby={`day-heading-${dayIndex}`}>
          <h3 id={`day-heading-${dayIndex}`} className="text-lg font-semibold mb-3 flex items-center gap-2">
            {day}
            {slots.length > 0 && (
              <Badge variant="secondary" className="ml-2" aria-label={`${slots.length} time ${slots.length === 1 ? 'slot' : 'slots'}`}>
                {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
              </Badge>
            )}
          </h3>

          {slots.length === 0 ? (
            <Card className="p-6 bg-muted/50" role="status">
              <p className="text-sm text-muted-foreground text-center">
                No availability set for {day}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map(slot => {
                const util = utilization[slot.id] || { booked: 0, max: slot.maxSessionsPerSlot };
                const percentage = (util.booked / util.max) * 100;
                const isFull = util.booked >= util.max;

                return (
                  <Card
                    key={slot.id}
                    className={`p-4 border-2 transition-colors ${
                      !slot.isActive
                        ? 'bg-muted/50 border-muted'
                        : getUtilizationBgColor(util.booked, util.max)
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          {!slot.isActive && (
                            <Badge variant="secondary" className="mt-1">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(slot)}
                            className="h-8 w-8 p-0"
                            aria-label={`Edit ${day} ${slot.startTime} to ${slot.endTime} availability slot`}
                          >
                            <Edit className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(slot)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                            aria-label={`Delete ${day} ${slot.startTime} to ${slot.endTime} availability slot`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>

                      {/* Capacity Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Capacity</span>
                          </div>
                          <span
                            className={`font-semibold ${getUtilizationColor(
                              util.booked,
                              util.max
                            )}`}
                          >
                            {util.booked}/{util.max}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <Progress
                            value={percentage}
                            className="h-2"
                            indicatorClassName={
                              isFull
                                ? 'bg-destructive'
                                : percentage >= 75
                                ? 'bg-orange-500 dark:bg-orange-600'
                                : percentage >= 50
                                ? 'bg-amber-500 dark:bg-amber-600'
                                : 'bg-green-500 dark:bg-green-600'
                            }
                            aria-label={`Slot utilization: ${percentage.toFixed(0)} percent`}
                          />
                          <p className="text-xs text-muted-foreground" aria-live="polite">
                            {percentage.toFixed(0)}% utilized
                          </p>
                        </div>

                        {/* Full Indicator */}
                        {isFull && (
                          <div 
                            className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded" 
                            role="status"
                            aria-live="polite"
                          >
                            <AlertCircle className="h-3 w-3" aria-hidden="true" />
                            <span>Slot is full</span>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="pt-2 border-t border-border space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Max Sessions</span>
                          <span className="font-medium">{slot.maxSessionsPerSlot}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Buffer Time</span>
                          <span className="font-medium">{slot.bufferMinutes} min</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
