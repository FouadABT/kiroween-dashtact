'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { DateRange as DateRangeType } from '@/types/dashboard';

interface DateRangePickerProps {
  value: DateRangeType;
  onChange: (range: DateRangeType) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    {
      label: 'Last 7 days',
      getValue: () => ({
        start: subDays(new Date(), 7),
        end: new Date(),
      }),
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        start: subDays(new Date(), 30),
        end: new Date(),
      }),
    },
    {
      label: 'Last 90 days',
      getValue: () => ({
        start: subDays(new Date(), 90),
        end: new Date(),
      }),
    },
    {
      label: 'This month',
      getValue: () => ({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      }),
    },
    {
      label: 'Last month',
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      },
    },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    onChange(range);
    setIsOpen(false);
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onChange({
        start: range.from,
        end: range.to,
      });
      setIsOpen(false);
    }
  };

  const startFormatted = value.start ? format(value.start, 'MMM d') : '';
  const endFormatted = value.end ? format(value.end, 'MMM d, yyyy') : '';
  const displayText = startFormatted && endFormatted 
    ? `${startFormatted} - ${endFormatted}`
    : 'Select date range';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto justify-start text-left font-normal truncate"
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline truncate">{displayText}</span>
          <span className="sm:hidden">Date Range</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          {/* Preset buttons */}
          <div className="flex flex-row sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-border p-3">
            <div className="text-xs font-semibold mb-2 w-full">Presets</div>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start text-xs"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={{
                from: value.start,
                to: value.end,
              }}
              onSelect={handleDateSelect}
              numberOfMonths={1}
              disabled={(date) => date > new Date()}
              className="rounded-md border border-border"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
