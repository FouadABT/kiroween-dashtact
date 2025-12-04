'use client';

import React, { useState, useEffect } from 'react';
import { CalendarIcon, Repeat, X } from 'lucide-react';
import { format } from 'date-fns';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RecurrenceRule } from '@/types/calendar';

interface RecurrenceEditorProps {
  value?: Partial<RecurrenceRule>;
  onChange: (rule: Partial<RecurrenceRule> | null) => void;
  startDate?: Date;
}

type EndCondition = 'never' | 'count' | 'until';

const WEEKDAYS = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function RecurrenceEditor({
  value,
  onChange,
  startDate = new Date(),
}: RecurrenceEditorProps) {
  const [enabled, setEnabled] = useState(!!value);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>(
    value?.frequency || 'WEEKLY'
  );
  const [interval, setInterval] = useState(value?.interval || 1);
  const [byDay, setByDay] = useState<number[]>(value?.byDay || []);
  const [byMonthDay, setByMonthDay] = useState<number[]>(value?.byMonthDay || []);
  const [endCondition, setEndCondition] = useState<EndCondition>(
    value?.count ? 'count' : value?.until ? 'until' : 'never'
  );
  const [count, setCount] = useState(value?.count || 10);
  const [until, setUntil] = useState<Date | undefined>(
    value?.until ? new Date(value.until) : undefined
  );
  const [untilOpen, setUntilOpen] = useState(false);

  useEffect(() => {
    if (!enabled) {
      onChange(null);
      return;
    }

    const rule: Partial<RecurrenceRule> = {
      frequency,
      interval,
    };

    if (frequency === 'WEEKLY' && byDay.length > 0) {
      rule.byDay = byDay;
    }

    if (frequency === 'MONTHLY' && byMonthDay.length > 0) {
      rule.byMonthDay = byMonthDay;
    }

    if (endCondition === 'count') {
      rule.count = count;
    } else if (endCondition === 'until' && until) {
      rule.until = until.toISOString();
    }

    onChange(rule);
  }, [enabled, frequency, interval, byDay, byMonthDay, endCondition, count, until, onChange]);

  const toggleWeekday = (day: number) => {
    setByDay((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const toggleMonthDay = (day: number) => {
    setByMonthDay((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const getRecurrenceSummary = (): string => {
    if (!enabled) return 'Does not repeat';

    let summary = 'Repeats ';

    // Frequency and interval
    if (interval === 1) {
      summary += frequency.toLowerCase();
    } else {
      summary += `every ${interval} ${frequency.toLowerCase().replace(/ly$/, '')}s`;
    }

    // Weekdays for weekly recurrence
    if (frequency === 'WEEKLY' && byDay.length > 0) {
      const dayNames = byDay.map((d) => WEEKDAYS.find((w) => w.value === d)?.label).join(', ');
      summary += ` on ${dayNames}`;
    }

    // Month days for monthly recurrence
    if (frequency === 'MONTHLY' && byMonthDay.length > 0) {
      const days = byMonthDay.slice(0, 3).join(', ');
      summary += ` on day${byMonthDay.length > 1 ? 's' : ''} ${days}${
        byMonthDay.length > 3 ? '...' : ''
      }`;
    }

    // End condition
    if (endCondition === 'count') {
      summary += `, ${count} time${count !== 1 ? 's' : ''}`;
    } else if (endCondition === 'until' && until) {
      summary += `, until ${format(until, 'MMM d, yyyy')}`;
    }

    return summary;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Recurrence
          </CardTitle>
          <Button
            type="button"
            variant={enabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          {/* Frequency */}
          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select
              value={frequency}
              onValueChange={(value: any) => setFrequency(value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interval */}
          <div className="space-y-2">
            <Label>Every</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={99}
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="w-20 bg-background"
              />
              <span className="text-sm text-muted-foreground">
                {frequency.toLowerCase().replace(/ly$/, '')}
                {interval > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Weekday selector for weekly recurrence */}
          {frequency === 'WEEKLY' && (
            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={byDay.includes(day.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleWeekday(day.value)}
                    className="w-12 h-9"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Month day selector for monthly recurrence */}
          {frequency === 'MONTHLY' && (
            <div className="space-y-2">
              <Label>Repeat on day(s)</Label>
              <div className="grid grid-cols-7 gap-1 max-h-32 overflow-y-auto p-1 border border-border rounded-md">
                {MONTH_DAYS.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={byMonthDay.includes(day) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleMonthDay(day)}
                    className="h-8 text-xs"
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select one or more days of the month
              </p>
            </div>
          )}

          {/* End condition */}
          <div className="space-y-3">
            <Label>Ends</Label>
            <RadioGroup
              value={endCondition}
              onValueChange={(value: EndCondition) => setEndCondition(value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never" className="font-normal cursor-pointer">
                  Never
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="count" id="count" />
                <Label htmlFor="count" className="font-normal cursor-pointer">
                  After
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={count}
                  onChange={(e) => {
                    setCount(parseInt(e.target.value) || 1);
                    setEndCondition('count');
                  }}
                  className="w-20 h-8 bg-background"
                  disabled={endCondition !== 'count'}
                />
                <span className="text-sm text-muted-foreground">
                  occurrence{count !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="until" id="until" />
                <Label htmlFor="until" className="font-normal cursor-pointer">
                  On
                </Label>
                <Popover open={untilOpen} onOpenChange={setUntilOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        'justify-start text-left font-normal',
                        !until && 'text-muted-foreground',
                        endCondition !== 'until' && 'opacity-50'
                      )}
                      disabled={endCondition !== 'until'}
                      onClick={() => {
                        setEndCondition('until');
                        setUntilOpen(true);
                      }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {until ? format(until, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={until}
                      onSelect={(date) => {
                        setUntil(date);
                        setUntilOpen(false);
                      }}
                      disabled={(date) => date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Summary:</strong> {getRecurrenceSummary()}
            </p>
          </div>
        </CardContent>
      )}

      {!enabled && (
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-2">
            Enable recurrence to repeat this event
          </p>
        </CardContent>
      )}
    </Card>
  );
}
